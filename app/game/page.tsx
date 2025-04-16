'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QuestionCard, CountdownTimer } from '@/components/articulate';
import { useAuth } from '@/contexts';
import { TabletopProvider } from '@/contexts';
import TabletopGameView from './tabletop-view';
import { useRouter } from 'next/navigation';
import { forceRegenerateQuestions, getCachedQuestions, DEFAULT_CATEGORIES, markQuestionsAsUsed } from '@/lib/api/questions';
import { Question } from '@/lib/storage/models';

export default function GamePage() {
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);
    const [gameSettings, setGameSettings] = useState<any>(null);
    const [isTabletopGameView, setIsTabletopGameView] = useState(false);
    const { isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    // Game state
    const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timerRunning, setTimerRunning] = useState(true);
    const [turnTimeLeft, setTurnTimeLeft] = useState(60); // Default 60 seconds
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    // Memoize functions to prevent recreation on every render
    const navigateTo = useCallback((path: string) => {
        console.log(`Navigating to: ${path}`);
        router.push(path);
    }, [router]);

    // Custom logout function that handles navigation
    const handleLogout = useCallback(() => {
        logout(); // Call the original logout function
        navigateTo('/auth'); // Then navigate directly
    }, [logout, navigateTo]);

    // Handle time up - memoized to avoid recreation
    const handleTimeUp = useCallback(() => {
        setTimerRunning(false);
        alert("Time's up! Your turn is over.");
        // Here you would normally handle the turn end logic
    }, []);

    // Load game settings and setup
    useEffect(() => {
        if (isLoading) return;

        // Check if we're logged in first
        if (!isAuthenticated) {
            navigateTo('/auth');
            return;
        }

        // Check if we have game settings saved
        try {
            const settings = localStorage.getItem('gameSettings');

            if (!settings) {
                console.log('No game settings found, redirecting to setup');
                navigateTo('/setup');
                return;
            }

            // Parse and set the game settings
            const parsedSettings = JSON.parse(settings);
            setGameSettings(parsedSettings);

            // Set timer from game settings if available
            if (parsedSettings.timeLimit) {
                setTurnTimeLeft(parsedSettings.timeLimit);
            }

            // Check for tabletop mode
            const tabletopMode = localStorage.getItem('tabletopMode');
            setIsTabletopGameView(tabletopMode === 'true');

            // Force regenerate questions to ensure we have fresh, random questions each game
            forceRegenerateQuestions().catch(error => {
                console.error("Error regenerating questions:", error);
            });
        } catch (error) {
            console.error('Error checking game settings:', error);
            navigateTo('/setup');
        }
    }, [isLoading, isAuthenticated, navigateTo]); // Removed router from dependencies

    // Load questions after settings are loaded - separate effect to avoid loops
    useEffect(() => {
        // Skip if questions already loaded or settings not ready
        if (questionsLoaded || !gameSettings) return;

        // Load questions from cache
        const loadedQuestions: Question[] = [];

        DEFAULT_CATEGORIES.forEach(category => {
            const categoryQuestions = getCachedQuestions(category, 5);
            loadedQuestions.push(...categoryQuestions);
        });

        if (loadedQuestions.length > 0) {
            // Shuffle the questions
            const shuffled = [...loadedQuestions].sort(() => Math.random() - 0.5);
            setGameQuestions(shuffled);
            setQuestionsLoaded(true); // Mark as loaded to prevent repeated loading
        } else {
            console.error("No questions found in cache");
        }
    }, [gameSettings, questionsLoaded]); // Only depend on gameSettings and loaded flag

    // Handle correct answer - memoized to avoid recreation
    const handleCorrect = useCallback(() => {
        if (!gameQuestions.length || currentQuestionIndex >= gameQuestions.length) return;

        const currentQuestion = gameQuestions[currentQuestionIndex];

        // Mark the question as used in the cache
        markQuestionsAsUsed([currentQuestion.id]);

        // Add to answered questions
        setAnsweredQuestions(prev => [...prev, currentQuestion.text]);

        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
    }, [gameQuestions, currentQuestionIndex]);

    // Handle skipped question - memoized to avoid recreation
    const handleSkip = useCallback(() => {
        if (!gameQuestions.length || currentQuestionIndex >= gameQuestions.length) return;

        const currentQuestion = gameQuestions[currentQuestionIndex];

        // Mark the question as used in the cache
        markQuestionsAsUsed([currentQuestion.id]);

        // Add to skipped questions
        setSkippedQuestions(prev => [...prev, currentQuestion.text]);

        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
    }, [gameQuestions, currentQuestionIndex]);

    // Get current question safely
    const currentQuestion = gameQuestions.length > 0 && currentQuestionIndex < gameQuestions.length
        ? gameQuestions[currentQuestionIndex]
        : null;

    // Show loading state while checking auth or loading settings
    if (isLoading || !gameSettings || gameQuestions.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="ml-2">Loading game...</p>
            </div>
        );
    }

    return (
        <TabletopProvider>
            {isTabletopGameView ? (
                <TabletopGameView
                    currentQuestion={currentQuestion}
                    onCorrect={handleCorrect}
                    onSkip={handleSkip}
                    answeredQuestions={answeredQuestions}
                    skippedQuestions={skippedQuestions}
                    onLogout={handleLogout}
                    onNavigateToSettings={() => navigateTo('/setup')}
                />
            ) : (
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

                    {/* Countdown Timer */}
                    <div className="mb-4">
                        <CountdownTimer
                            initialSeconds={turnTimeLeft}
                            isRunning={timerRunning}
                            onTimeUp={handleTimeUp}
                        />
                    </div>

                    <div className="mb-8">
                        {currentQuestion && (
                            <QuestionCard
                                category={currentQuestion.category}
                                question={currentQuestion.text}
                                onCorrect={handleCorrect}
                                onSkip={handleSkip}
                            />
                        )}
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
            )}
        </TabletopProvider>
    );
} 