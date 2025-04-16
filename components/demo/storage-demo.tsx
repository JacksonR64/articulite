'use client';

import { useState, useEffect } from 'react';
import { useVersionedStorage } from '@/hooks';
import { StorageKeys, UserSettings } from '@/lib/storage';

/**
 * Demo component that shows how the storage system works
 * This component demonstrates the useVersionedStorage hook
 * and the versioned storage system with localStorage
 */
export function StorageDemo() {
    // Use our versioned storage hook to manage user settings
    const [settings, setSettings, isFromStorage] = useVersionedStorage<UserSettings>(
        StorageKeys.USER_SETTINGS,
        {
            theme: 'system',
            soundEnabled: true,
            notifications: true
        }
    );

    // Demo counter for showing real-time state updates
    const [counter, setCounter] = useState(0);

    // Update counter every second to demonstrate that component re-renders
    // don't wipe out our persisted state
    useEffect(() => {
        const timer = setInterval(() => {
            setCounter(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Toggle theme between light, dark, and system
    const toggleTheme = () => {
        setSettings(prev => {
            const themeOptions: Array<UserSettings['theme']> = ['light', 'dark', 'system'];
            const currentIndex = themeOptions.indexOf(prev.theme);
            const nextIndex = (currentIndex + 1) % themeOptions.length;

            return {
                ...prev,
                theme: themeOptions[nextIndex]
            };
        });
    };

    // Toggle sound on/off
    const toggleSound = () => {
        setSettings(prev => ({
            ...prev,
            soundEnabled: !prev.soundEnabled
        }));
    };

    // Toggle notifications on/off
    const toggleNotifications = () => {
        setSettings(prev => ({
            ...prev,
            notifications: !prev.notifications
        }));
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Storage System Demo
            </h2>

            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Component has rendered {counter} times
            </div>

            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {isFromStorage
                    ? 'Settings loaded from localStorage'
                    : 'Using default settings (nothing in localStorage yet)'}
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Theme:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                        {settings.theme}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Sound:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                        {settings.soundEnabled ? 'On' : 'Off'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Notifications:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                        {settings.notifications ? 'On' : 'Off'}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={toggleTheme}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                    Toggle Theme
                </button>

                <button
                    onClick={toggleSound}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                    Toggle Sound
                </button>

                <button
                    onClick={toggleNotifications}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                    Toggle Notifications
                </button>
            </div>
        </div>
    );
} 