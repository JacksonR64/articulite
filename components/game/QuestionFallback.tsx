'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Question } from '@/lib/storage';

interface QuestionFallbackProps {
    category: string;
    errorMessage?: string;
    onManualAdd?: (questions: Question[]) => void;
}

/**
 * Fallback component when OpenAI API is unavailable
 * Allows manual question entry as an alternative
 */
export function QuestionFallback({
    category,
    errorMessage,
    onManualAdd
}: QuestionFallbackProps) {
    const [questions, setQuestions] = useState<string[]>(['', '', '']);
    const [success, setSuccess] = useState(false);

    // Add a new empty question input
    const addQuestion = useCallback(() => {
        setQuestions(prev => [...prev, '']);
    }, []);

    // Remove a question at a specific index
    const removeQuestion = useCallback((index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Update a question at a specific index
    const updateQuestion = useCallback((index: number, value: string) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    }, []);

    // Submit manually entered questions
    const handleSubmit = useCallback(() => {
        // Filter out empty questions
        const validQuestions = questions.filter(q => q.trim().length > 0);

        if (validQuestions.length === 0) {
            return;
        }

        // Convert to Question objects
        const questionObjects: Question[] = validQuestions.map((text, index) => ({
            id: `manual-${category}-${Date.now()}-${index}`,
            category,
            text,
            difficulty: 'medium',
            used: false
        }));

        // Call the callback
        if (onManualAdd) {
            onManualAdd(questionObjects);
        }

        // Reset form and show success message
        setQuestions(['', '', '']);
        setSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccess(false);
        }, 3000);
    }, [category, questions, onManualAdd]);

    return (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900">
            <h3 className="text-lg font-semibold mb-2 text-orange-800 dark:text-orange-300">
                API Unavailable
            </h3>

            {errorMessage && (
                <p className="mb-4 text-red-600 dark:text-red-400 text-sm">
                    {errorMessage}
                </p>
            )}

            <p className="mb-4 text-gray-700 dark:text-gray-300">
                The OpenAI API is currently unavailable. You can:
            </p>

            <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                <li>
                    <Link href="/settings" className="text-blue-600 hover:underline">
                        Configure your API key
                    </Link> if you haven&apos;t done so
                </li>
                <li>Or manually enter questions below</li>
            </ul>

            <div className="mb-4">
                <h4 className="font-medium mb-2">Manual Question Entry for {category}</h4>

                {questions.map((question, index) => (
                    <div key={index} className="flex mb-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => updateQuestion(index, e.target.value)}
                            placeholder={`Enter a question for ${category}...`}
                            className="flex-1 p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button
                            onClick={() => removeQuestion(index)}
                            className="px-3 bg-red-500 text-white rounded-r"
                            title="Remove question"
                        >
                            ×
                        </button>
                    </div>
                ))}

                <div className="flex space-x-2 mt-3">
                    <button
                        onClick={addQuestion}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                    >
                        Add Another Question
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!questions.some(q => q.trim().length > 0)}
                        className={`px-3 py-1 text-sm rounded ${questions.some(q => q.trim().length > 0)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Save Questions
                    </button>
                </div>

                {success && (
                    <div className="mt-2 text-green-600">
                        Questions saved successfully!
                    </div>
                )}
            </div>
        </div>
    );
} 