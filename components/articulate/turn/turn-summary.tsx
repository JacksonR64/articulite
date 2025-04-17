import React, { useEffect, useState } from 'react';
import { Question, Team } from '@/lib/storage/models';
import { motion } from 'framer-motion';

interface TurnSummaryProps {
    team: Team;
    previousScore: number;
    newScore: number;
    correctAnswers: Question[];
    skippedQuestions: Question[];
    onContinue: () => void;
    autoAdvanceDelay?: number;
}

/**
 * Displays a summary of a team's turn, including correct answers,
 * skipped questions, points earned, and updated board position
 */
export const TurnSummary: React.FC<TurnSummaryProps> = ({
    team,
    previousScore,
    newScore,
    correctAnswers,
    skippedQuestions,
    onContinue,
    autoAdvanceDelay = 0 // Default to 0 (no auto-advance)
}) => {
    const [timeLeft, setTimeLeft] = useState(autoAdvanceDelay);
    const pointsEarned = newScore - previousScore;

    // Set up auto-advance timer if needed
    useEffect(() => {
        if (autoAdvanceDelay <= 0) return;

        setTimeLeft(autoAdvanceDelay);
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    onContinue();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [autoAdvanceDelay, onContinue]);

    // Categories represented in this turn
    const categories = [...new Set([
        ...correctAnswers.map(q => q.category),
        ...skippedQuestions.map(q => q.category)
    ])];

    // Group correct answers by category
    const answersByCategory = categories.reduce((acc, category) => {
        acc[category] = correctAnswers.filter(q => q.category === category);
        return acc;
    }, {} as Record<string, Question[]>);

    // Group skipped questions by category
    const skippedByCategory = categories.reduce((acc, category) => {
        acc[category] = skippedQuestions.filter(q => q.category === category);
        return acc;
    }, {} as Record<string, Question[]>);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {team.name}'s Turn Summary
                </h2>
                <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {correctAnswers.length} Correct
                    </span>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full ml-2">
                        {skippedQuestions.length} Skipped
                    </span>
                </div>
            </div>

            {/* Score animation */}
            <div className="flex justify-center items-center mb-8">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-700 dark:text-gray-300">
                        <motion.span
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                        >
                            {previousScore}
                        </motion.span>
                        <span className="mx-3 text-gray-500">→</span>
                        <motion.span
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.8, delay: 0.5, times: [0, 0.5, 1] }}
                            className="text-green-600 dark:text-green-400"
                        >
                            {newScore}
                        </motion.span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {pointsEarned > 0
                            ? `+${pointsEarned} points earned!`
                            : 'No points earned'}
                    </p>
                </div>
            </div>

            {/* Results by category */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Results by Category
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(category => (
                        <div
                            key={category}
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                        >
                            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-2">
                                {category}
                            </h4>

                            {answersByCategory[category]?.length > 0 && (
                                <div className="mb-2">
                                    <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                        Correct ({answersByCategory[category]?.length}):
                                    </h5>
                                    <ul className="pl-5 list-disc text-sm text-gray-600 dark:text-gray-300">
                                        {answersByCategory[category]?.map((q, i) => (
                                            <li key={`correct-${i}`}>{q.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {skippedByCategory[category]?.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Skipped ({skippedByCategory[category]?.length}):
                                    </h5>
                                    <ul className="pl-5 list-disc text-sm text-gray-500 dark:text-gray-400">
                                        {skippedByCategory[category]?.map((q, i) => (
                                            <li key={`skipped-${i}`}>{q.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Continue button */}
            <div className="flex justify-center">
                <button
                    onClick={onContinue}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                >
                    {autoAdvanceDelay > 0 && timeLeft > 0
                        ? `Continue (${timeLeft}s)`
                        : "Continue to Next Team"}
                </button>
            </div>
        </motion.div>
    );
}; 