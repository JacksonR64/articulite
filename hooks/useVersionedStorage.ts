'use client';

import { useState, useEffect, useCallback } from 'react';
import { StorageKeys, storeData, retrieveData } from '@/lib/storage';

/**
 * Custom hook for persisting state in localStorage with versioning support
 * Uses the versioned storage system for data migrations and error handling
 * 
 * @param key The storage key to use
 * @param initialValue The initial value (used if no value is stored)
 * @returns A stateful value and a function to update it (like useState)
 */
export function useVersionedStorage<T>(
    key: StorageKeys,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        return retrieveData<T>(key, initialValue);
    });

    // Flag to track if value was loaded from storage
    const [isFromStorage, setIsFromStorage] = useState<boolean>(false);

    // Check if data exists in localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const item = localStorage.getItem(key);
        setIsFromStorage(item !== null);
    }, [key]);

    // Listen for custom storage events for this key
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageEvent = (event: Event) => {
            // We use a custom event for cross-component communication
            const storageEvent = event as CustomEvent<{ key: string; data: any }>;

            if (storageEvent.detail && storageEvent.detail.key === key) {
                setStoredValue(storageEvent.detail.data);
            }
        };

        // Add event listener
        window.addEventListener(`storage:${key}`, handleStorageEvent);

        // Clean up
        return () => {
            window.removeEventListener(`storage:${key}`, handleStorageEvent);
        };
    }, [key]);

    // Regular storage event listener for cross-tab synchronization
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    // We need to parse the versioned storage format
                    const parsed = JSON.parse(event.newValue);
                    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
                        setStoredValue(parsed.data);
                    }
                } catch (e) {
                    console.error(`Error parsing storage event for key "${key}":`, e);
                }
            }
        };

        // Add event listener
        window.addEventListener('storage', handleStorageChange);

        // Clean up
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    // Save function that uses the versioned storage system
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Handle function updaters
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Update state
            setStoredValue(valueToStore);
            setIsFromStorage(true);

            // Save to storage using our versioned system
            if (typeof window !== 'undefined') {
                const success = storeData(key, valueToStore);

                if (success) {
                    // Dispatch custom event for cross-component communication
                    window.dispatchEvent(new CustomEvent(`storage:${key}`, {
                        detail: { key, data: valueToStore }
                    }));
                }
            }
        } catch (error) {
            console.error(`Error setting versioned storage for key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue, isFromStorage];
} 