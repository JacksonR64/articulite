'use client';

import { useState, useEffect } from 'react';
import { getOpenAIConfig, saveOpenAIConfig, OpenAIConfig, DEFAULT_CONFIG, getTokenUsage } from '@/lib/api';

/**
 * Component for managing the OpenAI API key and configuration
 */
export function ApiKeyManager() {
    // Get the saved configuration
    const [config, setConfig] = useState<OpenAIConfig>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Get token usage
    const [tokenUsage, setTokenUsage] = useState(getTokenUsage());

    // Load config from localStorage on mount
    useEffect(() => {
        const savedConfig = getOpenAIConfig();
        setConfig(savedConfig);
        setIsLoading(false);
    }, []);

    // Update token usage on interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTokenUsage(getTokenUsage());
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaveStatus('saving');

            // This is just a basic validation, in a real app we would try to
            // verify this key with the OpenAI API
            if (config.apiKey && config.apiKey.startsWith('sk-')) {
                saveOpenAIConfig(config);
                setSaveStatus('success');

                // Reset status after 3 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 3000);
            } else {
                throw new Error('Invalid API key format');
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            setSaveStatus('error');

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        }
    };

    // Formats large numbers with commas
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    if (isLoading) {
        return <div className="flex justify-center my-4">Loading configuration...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto my-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">OpenAI API Settings</h2>

            <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Token Usage</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Prompt Tokens:</div>
                    <div className="font-semibold">{formatNumber(tokenUsage.promptTokens)}</div>

                    <div>Completion Tokens:</div>
                    <div className="font-semibold">{formatNumber(tokenUsage.completionTokens)}</div>

                    <div>Total Tokens:</div>
                    <div className="font-semibold">{formatNumber(tokenUsage.totalTokens)}</div>

                    <div>Last Updated:</div>
                    <div className="font-semibold">{new Date(tokenUsage.lastUpdated).toLocaleString()}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        OpenAI API Key
                        <div className="relative mt-1">
                            <input
                                type={apiKeyVisible ? 'text' : 'password'}
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="sk-..."
                            />
                            <button
                                type="button"
                                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                            >
                                {apiKeyVisible ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your API key is stored only in your browser's localStorage and is never sent to our servers.
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Model
                        <select
                            value={config.model}
                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                            className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="gpt-4o-2024-05-13">GPT-4o</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                            Temperature
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.temperature}
                                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                                className="w-full mt-1"
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>Precise (0)</span>
                                <span>{config.temperature.toFixed(1)}</span>
                                <span>Creative (1)</span>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                            Max Tokens
                            <input
                                type="number"
                                min="100"
                                max="4000"
                                step="100"
                                value={config.maxTokens}
                                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saveStatus === 'saving'}
                        className={`px-4 py-2 rounded font-medium ${saveStatus === 'idle' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                saveStatus === 'saving' ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                                    saveStatus === 'success' ? 'bg-green-600 text-white' :
                                        'bg-red-600 text-white'
                            }`}
                    >
                        {saveStatus === 'idle' && 'Save Configuration'}
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'success' && 'Saved Successfully!'}
                        {saveStatus === 'error' && 'Error Saving'}
                    </button>
                </div>
            </form>
        </div>
    );
} 