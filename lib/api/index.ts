/**
 * API Service Exports
 * Centralizes all API-related functionality for easier imports
 */

// Export Question type from storage
export type { Question } from '@/lib/storage';

// Export OpenAI API utility functions
export * from './openai';

// Export question generation functions
export * from './questions';

// Export getRandomQuestion function (with priority over any similarly named function in questions)
export { getRandomQuestion, default as _getRandomQuestion } from './getRandomQuestion'; 