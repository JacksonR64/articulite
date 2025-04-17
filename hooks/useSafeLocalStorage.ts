'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for persisting state in localStorage that safely handles SSR
 * and prevents hydration mismatches by using a mounting check
 * 
 * @param key The key to store the value under in localStorage
 * @param initialValue The initial value (used if no value is stored)
 * @returns A stateful value and a function to update it (like useState)
 */
export function useSafeLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // Use this to track if we've mounted yet
    const [isMounted, setIsMounted] = useState(false);

    // Track if we've already initialized from localStorage
    const isInitialized = useRef(false);

    // Initially use the provided initialValue for SSR
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Load value from localStorage only after mounting on the client
    useEffect(() => {
        // Skip if already initialized
        if (isInitialized.current) {
            return;
        }

        setIsMounted(true);
        isInitialized.current = true;

        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);

            // Use initialValue if no item found
            if (!item) {
                return;
            }

            // Try to parse the JSON
            try {
                const parsed = JSON.parse(item);
                // Update state if we have a valid value
                if (parsed !== null && parsed !== undefined) {
                    setStoredValue(parsed);
                }
            } catch (parseError) {
                console.error(`Error parsing localStorage key "${key}":`, parseError);
                // Clear the corrupted value
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Only attempt to use localStorage if mounted (client-side)
            if (isMounted) {
                // Save to local storage
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue, isMounted]);

    // Listen for changes to this localStorage key in other tabs/windows
    useEffect(() => {
        if (!isMounted) {
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
    }, [key, isMounted]);

    return [storedValue, setValue];
} 