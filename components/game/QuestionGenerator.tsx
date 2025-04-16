'use client';

import { useState, useCallback } from 'react';
import { generateQuestions, getOpenAIConfig, Question } from '@/lib/api';

interface QuestionGeneratorProps {
    category: string;
    onQuestionsGenerated?: (questions: Question[]) => void;
    count?: number;
}

/**
 * Component for generating questions using the OpenAI API
 */
export function QuestionGenerator({
    category,
    onQuestionsGenerated,
    count = 5
}: QuestionGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Handle question generation
    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        setError(null);
        setSuccess(false);

        try {
            // Check if API key is configured
            const config = getOpenAIConfig();
            if (!config.apiKey) {
                throw new Error('Please configure your OpenAI API key in Settings before generating questions.');
            }

            // Generate questions
            const questions = await generateQuestions(category, count);

            // Call the callback with the generated questions
            if (onQuestionsGenerated) {
                onQuestionsGenerated(questions);
            }

            setSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error generating questions:', error);
            setError(error instanceof Error ? error.message : 'Failed to generate questions');
        } finally {
            setIsGenerating(false);
        }
    }, [category, count, onQuestionsGenerated]);

    return (
        <div className="mb-4">
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium ${isGenerating
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {isGenerating ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating questions...
                    </span>
                ) : (
                    'Generate Questions'
                )}
            </button>

            {error && (
                <div className="mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-2 text-green-500 text-sm">
                    Successfully generated {count} questions!
                </div>
            )}
        </div>
    );
} 