/**
 * Question Generation Service
 * Handles generating questions with OpenAI and caching results
 */

import { v4 as uuidv4 } from 'uuid';
import { makeOpenAIRequest } from './openai';
import { StorageKeys, storeData, retrieveData, Question } from '@/lib/storage';

// Default categories
export const DEFAULT_CATEGORIES = [
    'Object',
    'Nature',
    'Person',
    'Action',
    'World',
    'Random'
];

/**
 * Cache structure for storing generated questions
 */
export interface QuestionCache {
    version: string;
    lastUpdated: number;
    categories: Record<string, Question[]>;
}

// Initial empty cache
const INITIAL_CACHE: QuestionCache = {
    version: '1.0.0',
    lastUpdated: Date.now(),
    categories: {}
};

/**
 * Get the question cache from storage
 * @returns The cached questions or an empty cache
 */
export function getQuestionCache(): QuestionCache {
    return retrieveData<QuestionCache>(StorageKeys.QUESTION_CACHE, INITIAL_CACHE);
}

/**
 * Save the question cache to storage
 * @param cache The cache to save
 */
export function saveQuestionCache(cache: QuestionCache): void {
    storeData(StorageKeys.QUESTION_CACHE, cache);
}

/**
 * Check if we have enough cached questions for a category
 * @param category The category to check
 * @param count The minimum number of questions needed
 * @returns Whether enough questions are cached
 */
export function hasCachedQuestions(category: string, count: number = 10): boolean {
    const cache = getQuestionCache();
    const questions = cache.categories[category] || [];
    return questions.filter(q => !q.used).length >= count;
}

/**
 * Get questions from the cache for a specific category
 * @param category The category to get questions for
 * @param count The number of questions to get
 * @returns An array of questions
 */
export function getCachedQuestions(category: string, count: number = 5): Question[] {
    const cache = getQuestionCache();
    const questions = cache.categories[category] || [];
    return questions.filter(q => !q.used).slice(0, count);
}

/**
 * Mark questions as used in the cache
 * @param questionIds The IDs of questions to mark as used
 */
export function markQuestionsAsUsed(questionIds: string[]): void {
    const cache = getQuestionCache();

    // Update used status for all categories
    Object.keys(cache.categories).forEach(category => {
        cache.categories[category] = cache.categories[category].map(question => {
            if (questionIds.includes(question.id)) {
                return { ...question, used: true };
            }
            return question;
        });
    });

    cache.lastUpdated = Date.now();
    saveQuestionCache(cache);
}

/**
 * Reset the used status of all questions in the cache
 */
export function resetQuestionUsage(): void {
    const cache = getQuestionCache();

    // Reset used status for all categories
    Object.keys(cache.categories).forEach(category => {
        cache.categories[category] = cache.categories[category].map(question => ({
            ...question,
            used: false
        }));
    });

    cache.lastUpdated = Date.now();
    saveQuestionCache(cache);
}

/**
 * Clear the entire question cache
 */
export function clearQuestionCache(): void {
    saveQuestionCache(INITIAL_CACHE);
}

/**
 * Generate the system prompt for question generation
 * @param category The category to generate questions for
 * @returns The system prompt text
 */
function getSystemPrompt(category: string): string {
    return `You are an assistant that generates creative and fun questions for the game "Articulate!" based on specified categories.

Category: ${category}

For the "${category}" category, generate questions that are:
- Clear and unambiguous
- Varied in difficulty (mix of easy, medium, hard)
- Family-friendly and appropriate for all ages
- Culturally diverse and inclusive
- Interesting and engaging

Your response should ONLY contain the questions in a JSON array format, with each question as a separate object containing "text" and "difficulty" fields. Do not include any additional text, explanations, or formatting.`;
}

/**
 * Generate the user prompt for question generation
 * @param count The number of questions to generate
 * @returns The user prompt text
 */
function getUserPrompt(count: number): string {
    return `Generate ${count} unique questions for the specified category.

Format your response as a valid JSON array like this:
[
  {"text": "Question text here", "difficulty": "easy"},
  {"text": "Another question here", "difficulty": "medium"},
  ...
]

Ensure each question is distinct and directly related to the category. Vary the difficulty levels approximately: 30% easy, 40% medium, 30% hard.`;
}

/**
 * Parse the OpenAI response into an array of questions
 * @param response The text response from OpenAI
 * @param category The category the questions belong to
 * @returns An array of formatted Question objects
 */
function parseQuestionResponse(response: string, category: string): Question[] {
    try {
        // Try to extract just the JSON part if there's surrounding text
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;

        const parsedData = JSON.parse(jsonString);

        if (!Array.isArray(parsedData)) {
            throw new Error('Response is not an array');
        }

        return parsedData.map(item => ({
            id: uuidv4(),
            category,
            text: item.text,
            difficulty: item.difficulty || 'medium',
            used: false
        }));
    } catch (error) {
        console.error('Failed to parse question response:', error);
        console.error('Raw response:', response);
        return [];
    }
}

/**
 * Generate questions for a specific category
 * @param category The category to generate questions for
 * @param count The number of questions to generate
 * @returns The generated questions
 */
export async function generateQuestions(
    category: string,
    count: number = 10
): Promise<Question[]> {
    // Check cache first
    if (hasCachedQuestions(category, count)) {
        return getCachedQuestions(category, count);
    }

    // Prepare the prompts
    const systemPrompt = getSystemPrompt(category);
    const userPrompt = getUserPrompt(count);

    try {
        // Make the API request
        const response = await makeOpenAIRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);

        if (!response) {
            throw new Error('Empty response from OpenAI');
        }

        // Parse the response
        const questions = parseQuestionResponse(response, category);

        if (questions.length === 0) {
            throw new Error('Failed to parse questions from response');
        }

        // Update the cache
        const cache = getQuestionCache();
        cache.categories[category] = [
            ...(cache.categories[category] || []),
            ...questions
        ];
        cache.lastUpdated = Date.now();
        saveQuestionCache(cache);

        return questions;
    } catch (error) {
        console.error(`Error generating questions for ${category}:`, error);
        throw error;
    }
}

/**
 * Generate questions for multiple categories in parallel
 * @param categories The categories to generate questions for
 * @param countPerCategory The number of questions per category
 * @returns Object mapping categories to their questions
 */
export async function generateQuestionsForCategories(
    categories: string[] = DEFAULT_CATEGORIES,
    countPerCategory: number = 10
): Promise<Record<string, Question[]>> {
    const results: Record<string, Question[]> = {};
    const failedCategories: string[] = [];

    // Generate questions for each category in parallel
    await Promise.allSettled(
        categories.map(async (category) => {
            try {
                const questions = await generateQuestions(category, countPerCategory);
                results[category] = questions;
            } catch (error) {
                console.error(`Failed to generate questions for ${category}:`, error);
                failedCategories.push(category);
            }
        })
    );

    // Log any failed categories
    if (failedCategories.length > 0) {
        console.warn(`Failed to generate questions for ${failedCategories.length} categories:`,
            failedCategories.join(', '));
    }

    return results;
} 