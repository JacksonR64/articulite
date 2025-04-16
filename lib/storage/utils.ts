/**
 * Storage utility functions for handling localStorage operations
 */
import { StorageKeys, VersionedStorage } from './models';
import { hasMigration, migrateData } from './migrations';

// Current version of the storage format
export const CURRENT_VERSION = '1.0.0';

/**
 * Stores data in localStorage with versioning
 * @param key The storage key to use
 * @param data The data to store
 * @returns boolean indicating if the operation was successful
 */
export function storeData<T>(key: StorageKeys, data: T): boolean {
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
 * @param key The storage key to retrieve
 * @param defaultValue The default value if no data exists
 * @returns The stored data or default value
 */
export function retrieveData<T>(key: StorageKeys, defaultValue: T): T {
    try {
        const raw = localStorage.getItem(key);

        if (!raw) {
            return defaultValue;
        }

        const parsed = JSON.parse(raw) as VersionedStorage<T>;

        // Handle version migrations if needed
        if (needsMigration(parsed.version, key)) {
            const migrated = migrateData<T>(parsed, key);

            // Save the migrated data back to storage
            localStorage.setItem(key, JSON.stringify(migrated));

            return migrated.data;
        }

        return parsed.data;
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