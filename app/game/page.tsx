'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QuestionCard } from '@/components/articulate';
import { useAuth } from '@/contexts';

export default function GamePage() {
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);
    const [gameSettings, setGameSettings] = useState<any>(null);
    const router = useRouter();
    const { isAuthenticated, isLoading, logout } = useAuth();

    // Add a direct navigation helper function
    const navigateTo = (path: string) => {
        console.log(`Navigating to: ${path}`);
        window.location.href = path;
    };

    // Custom logout function that handles navigation
    const handleLogout = () => {
        logout(); // Call the original logout function
        navigateTo('/auth'); // Then navigate directly
    };

    // Sample question data
    const questions = [
        { category: 'Object', question: 'Chair' },
        { category: 'Nature', question: 'Mountain' },
        { category: 'Action', question: 'Running' },
        { category: 'World', question: 'France' },
        { category: 'Person', question: 'Einstein' },
        { category: 'Random', question: 'Birthday' },
    ];

    useEffect(() => {
        // Load game settings from localStorage
        const settings = localStorage.getItem('gameSettings');
        if (settings) {
            setGameSettings(JSON.parse(settings));
        } else if (!isLoading && !settings) {
            // Redirect to setup if no settings are found
            console.log("No game settings found, redirecting to setup");
            navigateTo('/setup');
        }
    }, [isLoading]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = questions[currentQuestionIndex % questions.length];

    const handleCorrect = () => {
        setAnsweredQuestions([...answeredQuestions, currentQuestion.question]);
        setCurrentQuestionIndex((prev) => prev + 1);
    };

    const handleSkip = () => {
        setSkippedQuestions([...skippedQuestions, currentQuestion.question]);
        setCurrentQuestionIndex((prev) => prev + 1);
    };

    // Show loading state while checking auth or loading settings
    if (isLoading || !gameSettings) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="ml-2">Loading game...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">ArticuLITE</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigateTo('/setup')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </button>

                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <QuestionCard
                    category={currentQuestion.category}
                    question={currentQuestion.question}
                    onCorrect={handleCorrect}
                    onSkip={handleSkip}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">Correct Answers: {answeredQuestions.length}</h2>
                    <ul className="list-disc pl-5 space-y-1 dark:text-gray-200">
                        {answeredQuestions.map((q, index) => (
                            <li key={`correct-${index}`}>{q}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">Skipped Questions: {skippedQuestions.length}</h2>
                    <ul className="list-disc pl-5 space-y-1 dark:text-gray-200">
                        {skippedQuestions.map((q, index) => (
                            <li key={`skipped-${index}`}>{q}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 