/**
 * OpenAI API Service
 * Handles interactions with the OpenAI API for question generation
 */

import { StorageKeys, storeData, retrieveData } from '@/lib/storage';

// API endpoint for OpenAI completions
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const GPT_4O_MODEL = 'gpt-4o-2024-05-13';
const DEFAULT_MAX_TOKENS = 1000;

export interface OpenAIConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

// Default configuration for OpenAI
export const DEFAULT_CONFIG: OpenAIConfig = {
    apiKey: '',
    model: GPT_4O_MODEL,
    temperature: 0.7,
    maxTokens: DEFAULT_MAX_TOKENS,
};

// Structure for tracking token usage
export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    lastUpdated: number;
}

// Initial token usage object
const INITIAL_TOKEN_USAGE: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    lastUpdated: Date.now(),
};

/**
 * Get stored OpenAI configuration
 * @returns The stored or default configuration
 */
export function getOpenAIConfig(): OpenAIConfig {
    return retrieveData<OpenAIConfig>(StorageKeys.OPENAI_CONFIG, DEFAULT_CONFIG);
}

/**
 * Save OpenAI configuration to localStorage
 * @param config The configuration to save
 */
export function saveOpenAIConfig(config: OpenAIConfig): void {
    storeData(StorageKeys.OPENAI_CONFIG, config);
}

/**
 * Get the current token usage statistics
 * @returns The current token usage
 */
export function getTokenUsage(): TokenUsage {
    return retrieveData<TokenUsage>(StorageKeys.TOKEN_USAGE, INITIAL_TOKEN_USAGE);
}

/**
 * Update token usage statistics
 * @param usage The new usage to add to the existing count
 */
export function updateTokenUsage(usage: Partial<TokenUsage>): void {
    const current = getTokenUsage();

    const updated: TokenUsage = {
        promptTokens: (current.promptTokens + (usage.promptTokens || 0)),
        completionTokens: (current.completionTokens + (usage.completionTokens || 0)),
        totalTokens: (current.totalTokens + (usage.totalTokens || 0)),
        lastUpdated: Date.now(),
    };

    storeData(StorageKeys.TOKEN_USAGE, updated);
}

/**
 * Reset token usage statistics
 */
export function resetTokenUsage(): void {
    storeData(StorageKeys.TOKEN_USAGE, INITIAL_TOKEN_USAGE);
}

/**
 * Makes a request to the OpenAI API
 * @param messages The messages to send to the API
 * @param options Additional options to customize the request
 * @returns The API response text or null if there was an error
 */
export async function makeOpenAIRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: Partial<OpenAIConfig>
): Promise<string | null> {
    const config = {
        ...getOpenAIConfig(),
        ...options,
    };

    if (!config.apiKey) {
        console.warn('OpenAI API key is missing. Using fallback questions. Configure your API key in Settings to use AI-generated questions.');
        throw new Error('OpenAI API key is missing. Please provide an API key in the settings. The app will use fallback questions for now.');
    }

    try {
        const response = await fetch(OPENAI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
            throw new Error(
                `OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
            );
        }

        const data = await response.json();

        // Update token usage
        if (data.usage) {
            updateTokenUsage({
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            });
        }

        return data.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('Error making OpenAI API request:', error);
        throw error;
    }
}

/**
 * Estimate token count based on text length
 * This is a rough estimate (1 token ≈ 4 chars for English text)
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
} 