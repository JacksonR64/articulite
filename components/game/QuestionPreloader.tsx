'use client';

import { useState, useEffect } from 'react';
import {
    generateQuestionsForCategories,
    DEFAULT_CATEGORIES,
    getQuestionCache,
    forceRegenerateQuestions
} from '@/lib/api/questions';
import { Question } from '@/lib/storage/models';

interface QuestionPreloaderProps {
    categories?: string[];
    questionsPerCategory?: number;
    onComplete?: (success: boolean) => void;
    autoStart?: boolean;
}

/**
 * Component for pre-loading questions for the game
 * This component will load and cache questions for all game categories
 */
export function QuestionPreloader({
    categories = DEFAULT_CATEGORIES,
    questionsPerCategory = 15,
    onComplete,
    autoStart = false
}: QuestionPreloaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [cachedQuestions, setCachedQuestions] = useState<Record<string, Question[]>>({});

    // Check cache on mount
    useEffect(() => {
        const cache = getQuestionCache();
        setCachedQuestions(cache.categories);

        // Auto-start if requested and cache is empty
        if (autoStart && Object.keys(cache.categories).length === 0) {
            handlePreloadQuestions();
        }
    }, [autoStart]);

    // Add a listener for question cache updates to track progress
    useEffect(() => {
        const checkCacheInterval = setInterval(() => {
            const cache = getQuestionCache();
            const categoryCount = Object.keys(cache.categories).length;
            
            if (categoryCount > 0) {
                const progress = Math.min(100, (categoryCount / categories.length) * 100);
                setProgress(Math.floor(progress));
                
                // Update cached questions display
                setCachedQuestions(cache.categories);
            }
        }, 500);
        
        return () => clearInterval(checkCacheInterval);
    }, [categories.length]);

    const getCategoryStatus = (category: string) => {
        const questions = cachedQuestions[category] || [];
        const unusedQuestions = questions.filter(q => !q.used);

        if (unusedQuestions.length >= questionsPerCategory) {
            return { status: 'complete', count: unusedQuestions.length };
        }

        if (unusedQuestions.length > 0) {
            return { status: 'partial', count: unusedQuestions.length };
        }

        return { status: 'none', count: 0 };
    };

    const handlePreloadQuestions = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setProgress(0);

        try {
            // Force regenerate questions for all categories
            await forceRegenerateQuestions(categories, questionsPerCategory);

            // Update the cache display
            const cache = getQuestionCache();
            setCachedQuestions(prev => ({
                ...prev,
                ...cache.categories
            }));

            // Set progress to 100%
            setProgress(100);

            // Call completion callback
            if (onComplete) {
                onComplete(true);
            }
        } catch (error) {
            console.error('Error pre-loading questions:', error);
            setError(error instanceof Error ? error.message : 'Failed to pre-load questions');

            // Call completion callback with failure
            if (onComplete) {
                onComplete(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Question Cache</h3>

            {/* Cache status */}
            <div className="space-y-2 mb-4">
                {categories.map(category => {
                    const { status, count } = getCategoryStatus(category);
                    return (
                        <div key={category} className="flex justify-between items-center">
                            <span>{category}</span>
                            <span className={`text-sm ${status === 'complete' ? 'text-green-600 dark:text-green-400' :
                                status === 'partial' ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                }`}>
                                {count} questions {status === 'complete' ? '✓' : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            {isLoading && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="text-red-500 text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Action button */}
            <button
                onClick={handlePreloadQuestions}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-md font-medium ${isLoading ?
                    'bg-gray-400 text-gray-700 cursor-not-allowed' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {isLoading ? `Caching Questions (${progress}%)` : 'Pre-Cache Questions'}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Pre-caching questions will reduce loading times during gameplay. You need an OpenAI API key configured in settings.
            </p>
        </div>
    );
} 