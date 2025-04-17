'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * 
 * @param key The key to store the value under in localStorage
 * @param initialValue The initial value (used if no value is stored)
 * @returns A stateful value and a function to update it (like useState)
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
                return initialValue;
            }

            // Get from local storage by key
            const item = window.localStorage.getItem(key);

            // Return initialValue if no item found
            if (!item) {
                return initialValue;
            }

            // Try to parse the JSON
            try {
                const parsed = JSON.parse(item);
                // Verify that the parsed value is not null or undefined
                return parsed !== null && parsed !== undefined ? parsed : initialValue;
            } catch (parseError) {
                console.error(`Error parsing localStorage key "${key}":`, parseError);
                // Clear the corrupted value
                window.localStorage.removeItem(key);
                return initialValue;
            }
        } catch (error) {
            // If error also return initialValue
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Check if we're in a browser environment
            if (typeof window !== 'undefined') {
                // Save to local storage
                // The JSON.stringify is necessary to avoid issues when storing objects
                try {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                } catch (storageError) {
                    console.error(`Error writing to localStorage key "${key}":`, storageError);
                }
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]); // Remove storedValue from dependencies to break circular dependency

    // Listen for changes to this localStorage key in other tabs/windows
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    // When localStorage changes, update the state
                    setStoredValue(JSON.parse(event.newValue));
                } catch (e) {
                    console.error(`Error parsing localStorage key "${key}" from storage event:`, e);
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

    // Return the state, setter and a boolean to indicate if the value came from localStorage
    return [
        storedValue,
        setValue,
        typeof window !== 'undefined' && localStorage.getItem(key) !== null
    ];
} 