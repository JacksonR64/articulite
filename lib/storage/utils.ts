/**
 * Storage utility functions for handling localStorage operations
 */
import { StorageKeys, VersionedStorage } from './models';
import { hasMigration, migrateData } from './migrations';

// Current version of the storage format
export const CURRENT_VERSION = '1.0.0';

/**
 * Check if localStorage is available (not running on server)
 */
const isLocalStorageAvailable = (): boolean => {
    if (typeof window === 'undefined') {
        console.warn('localStorage is not available - running on server');
        return false;
    }

    try {
        const testKey = '__test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn('localStorage is not available - browser restrictions');
        return false;
    }
};

/**
 * Stores data in localStorage with versioning
 * @param key The storage key to use
 * @param data The data to store
 * @returns boolean indicating if the operation was successful
 */
export function storeData<T>(key: StorageKeys, data: T): boolean {
    if (!isLocalStorageAvailable()) {
        return false;
    }

    try {
        const versionedData: VersionedStorage<T> = {
            version: CURRENT_VERSION,
            data,
            timestamp: Date.now()
        };

        localStorage.setItem(key, JSON.stringify(versionedData));
        return true;
    } catch (e) {
        handleStorageError(e);
        return false;
    }
}

/**
 * Retrieves data from localStorage with version checking
 * NOTE: Do not use this directly in component render - it can cause hydration issues.
 * Instead, use useSafeLocalStorage hook which handles SSR properly.
 * 
 * @param key The storage key to retrieve
 * @param defaultValue The default value if no data exists
 * @returns The stored data or default value
 */
export function retrieveData<T>(key: StorageKeys | string, defaultValue: T): T {
    if (!isLocalStorageAvailable()) {
        return defaultValue;
    }

    try {
        const raw = localStorage.getItem(key);

        if (!raw) {
            return defaultValue;
        }

        try {
            const parsed = JSON.parse(raw);

            // Check if this is versioned data
            if (parsed.version && parsed.data) {
                const versionedData = parsed as VersionedStorage<T>;

                // Handle version migrations if needed for StorageKeys
                if (typeof key === 'string' && Object.values(StorageKeys).includes(key as StorageKeys) &&
                    needsMigration(versionedData.version, key as StorageKeys)) {
                    const migrated = migrateData<T>(versionedData, key as StorageKeys);

                    // Save the migrated data back to storage
                    localStorage.setItem(key, JSON.stringify(migrated));

                    return migrated.data;
                }

                return versionedData.data;
            }

            // Handle direct data storage (without versioning)
            return parsed as T;
        } catch (parseError) {
            console.error('Failed to parse stored data:', parseError);
            return defaultValue;
        }
    } catch (e) {
        handleStorageError(e);
        return defaultValue;
    }
}

/**
 * Removes data from localStorage
 * @param key The storage key to remove
 * @returns boolean indicating if the operation was successful
 */
export function removeData(key: StorageKeys): boolean {
    if (!isLocalStorageAvailable()) {
        return false;
    }

    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        handleStorageError(e);
        return false;
    }
}

/**
 * Checks if the stored data version needs migration
 * @param version The version to check
 * @param key The storage key
 * @returns boolean indicating if migration is needed
 */
function needsMigration(version: string, key: StorageKeys): boolean {
    return version !== CURRENT_VERSION || hasMigration(version, key);
}

/**
 * Handles storage errors with appropriate actions
 * @param error The error that occurred
 */
function handleStorageError(error: unknown): void {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Some data may not be saved.');
    } else if (error instanceof DOMException && error.name === 'SecurityError') {
        console.warn('Storage access denied due to browser security settings.');
    } else {
        console.error('Storage error:', error);
    }
} 