'use client';

import { ApiKeyManager } from '@/components/settings';

/**
 * Settings page component
 * Contains configuration for OpenAI API
 */
export default function SettingsPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                        To generate questions using AI, you need to provide your own OpenAI API key.
                        This key will be stored securely in your browser&apos;s local storage and is never sent to our servers.
                    </p>

                    <ApiKeyManager />
                </div>
            </div>
        </main>
    );
} 