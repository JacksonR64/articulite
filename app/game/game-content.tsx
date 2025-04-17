'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard, CountdownTimer } from '@/components/articulate';
import { TurnSummary } from '@/components/articulate/turn/turn-summary';
import { useAuth } from '@/contexts';
import { useGame } from '@/contexts/game/game-context';
import { GamePhase } from '@/lib/storage/models';
import TabletopGameView from './tabletop-view';
import QuestionFallback from '@/components/game/QuestionFallback';
import { getOpenAIConfig } from '@/lib/api';

// Main Game component with game logic
export default function GameContent() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTeamName, setActiveTeamName] = useState("");
    const [hasApiKey, setHasApiKey] = useState(false);

    // Use a try/catch block to handle any errors in the useAuth hook
    const auth = {
        isLoading: false,
        logout: () => console.log("Logout called")
    };

    try {
        const authContext = useAuth();
        if (authContext) {
            auth.isLoading = authContext.isLoading || false;
            auth.logout = authContext.logout || (() => console.log("Logout called"));
        }
    } catch (error) {
        console.error("Error accessing auth context:", error);
    }

    // Create a safe game object with default values
    const safeGame: any = {
        gameState: null,
        currentPhase: GamePhase.Setup,
        getCurrentTeam: () => null,
        startGame: () => { },
        nextTurn: () => { },
        answerCorrect: () => { },
        skipQuestion: () => { },
        pauseTimer: () => { },
        startTimer: () => { },
        resetTimer: () => { },
    };

    // Use a try/catch block to handle any errors in the useGame hook
    try {
        const gameContext = useGame();
        if (gameContext) {
            safeGame.gameState = gameContext.gameState;
            safeGame.currentPhase = gameContext.currentPhase || GamePhase.Setup;
            safeGame.getCurrentTeam = gameContext.getCurrentTeam || (() => null);
            safeGame.startGame = gameContext.startGame || (() => { });
            safeGame.nextTurn = gameContext.nextTurn || (() => { });
            safeGame.answerCorrect = gameContext.answerCorrect || (() => { });
            safeGame.skipQuestion = gameContext.skipQuestion || (() => { });
            safeGame.pauseTimer = gameContext.pauseTimer || (() => { });
            safeGame.startTimer = gameContext.startTimer || (() => { });
            safeGame.resetTimer = gameContext.resetTimer || (() => { });
        }
    } catch (error) {
        console.error("Error accessing game context:", error);
    }

    // Only access derived values after mounting to avoid hydration mismatch
    interface QuestionType {
        id: string;
        category: string;
        text: string;
        difficulty?: 'easy' | 'medium' | 'hard';
        used: boolean;
    }

    interface TeamType {
        id: number;
        name: string;
        color: string;
        score: number;
        players?: Array<{ name: string }>;
    }

    const [localState, setLocalState] = useState({
        currentPhase: GamePhase.Setup,
        isTimerRunning: false,
        timer: 0,
        turnScore: 0,
        currentQuestion: null as QuestionType | null,
        activeTeam: null as TeamType | null,
        correctAnswers: [] as QuestionType[],
        skippedQuestions: [] as QuestionType[]
    });

    useEffect(() => {
        setMounted(true);

        // Check if OpenAI API key is configured
        const config = getOpenAIConfig();
        setHasApiKey(!!config.apiKey);

        // Safe to update once component is mounted on the client
        if (safeGame.gameState) {
            try {
                setLocalState({
                    currentPhase: safeGame.gameState.currentPhase || GamePhase.Setup,
                    isTimerRunning: safeGame.gameState.isTimerRunning || false,
                    timer: safeGame.gameState.timer || 0,
                    turnScore: safeGame.gameState.turnScore || 0,
                    currentQuestion: safeGame.gameState.currentQuestion || null,
                    activeTeam: safeGame.getCurrentTeam() || null,
                    correctAnswers: [],
                    skippedQuestions: []
                });

                if (safeGame.getCurrentTeam()) {
                    const team = safeGame.getCurrentTeam();
                    setActiveTeamName(team?.name || "Team");
                }
            } catch (error) {
                console.error("Error updating local state:", error);
            }
        }
    }, [safeGame.gameState, safeGame.getCurrentTeam]);

    // Utility functions
    const navigateTo = (path: string) => {
        try {
            console.log(`Navigating to: ${path}`);
            router.push(path);
        } catch (error) {
            console.error("Error navigating:", error);
            // Fallback to direct navigation
            window.location.href = path;
        }
    };

    const handleLogout = () => {
        try {
            auth.logout();
            navigateTo('/auth');
        } catch (error) {
            console.error("Error during logout:", error);
            // Fallback to direct navigation
            window.location.href = '/auth';
        }
    };

    // Start turn handler
    const startTurnHandler = () => {
        try {
            safeGame.startGame();
        } catch (error) {
            console.error("Error starting game:", error);
        }
    };

    // End turn handler
    const endTurn = () => {
        try {
            safeGame.nextTurn();
        } catch (error) {
            console.error("Error ending turn:", error);
        }
    };

    // Next phase handler
    const goToNextPhase = () => {
        try {
            safeGame.nextTurn();
        } catch (error) {
            console.error("Error going to next phase:", error);
        }
    };

    // Resume timer
    const resumeTimer = () => {
        try {
            safeGame.startTimer();
        } catch (error) {
            console.error("Error resuming timer:", error);
        }
    };

    // Loading state
    if (!mounted || auth.isLoading || !safeGame.gameState) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="ml-2">Loading game components...</p>
            </div>
        );
    }

    // Defensive check for currentPhase
    const phase = localState.currentPhase || GamePhase.Setup;

    // Handle rendering based on game phase
    switch (phase) {
        case GamePhase.Setup:
            return (
                <div className="container mx-auto py-8 px-4 max-w-4xl">
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

                    {!hasApiKey && <QuestionFallback showConfigButton={true} />}

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-6">
                            {activeTeamName || "Team"}'s Turn
                        </h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Get ready! You'll have {safeGame.gameState?.settings?.timeLimit || 60} seconds to describe as many words as possible.
                        </p>

                        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                            <button
                                onClick={startTurnHandler}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Start Turn
                            </button>

                            <button
                                onClick={() => navigateTo('/setup')}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                            >
                                Back to Setup
                            </button>
                        </div>
                    </div>
                </div>
            );

        case GamePhase.Question:
            return (
                <div className="container mx-auto py-8 px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">
                            {activeTeamName || "Team"}'s Turn
                        </h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={localState.isTimerRunning ? safeGame.pauseTimer : resumeTimer}
                                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded flex items-center"
                            >
                                {localState.isTimerRunning ? 'Pause' : 'Resume'}
                            </button>

                            <button
                                onClick={endTurn}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded flex items-center"
                            >
                                End Turn
                            </button>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="mb-4">
                        <CountdownTimer
                            initialSeconds={localState.timer}
                            isRunning={localState.isTimerRunning}
                            onTimeUp={endTurn}
                        />
                    </div>

                    <div className="mb-8">
                        {localState.currentQuestion && (
                            <QuestionCard
                                category={localState.currentQuestion.category || "Category"}
                                question={localState.currentQuestion.text || "Question"}
                                onCorrect={safeGame.answerCorrect}
                                onSkip={safeGame.skipQuestion}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
                                Correct Answers: {localState.correctAnswers.length}
                            </h2>
                            <ul className="list-disc pl-5 space-y-1 dark:text-gray-200">
                                {localState.correctAnswers.map((q, index) => (
                                    <li key={`correct-${index}`}>{q.text}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                                Skipped Questions: {localState.skippedQuestions.length}
                            </h2>
                            <ul className="list-disc pl-5 space-y-1 dark:text-gray-200">
                                {localState.skippedQuestions.map((q, index) => (
                                    <li key={`skipped-${index}`}>{q.text}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );

        case GamePhase.TurnSummary:
            if (!localState.activeTeam) return <div>No active team found</div>;

            return (
                <div className="container mx-auto py-8 px-4">
                    <TurnSummary
                        team={localState.activeTeam}
                        previousScore={(localState.activeTeam.score || 0) - (localState.turnScore || 0)}
                        newScore={localState.activeTeam.score || 0}
                        correctAnswers={localState.correctAnswers}
                        skippedQuestions={localState.skippedQuestions}
                        onContinue={goToNextPhase}
                        autoAdvanceDelay={10} // Auto-advance after 10 seconds
                    />
                </div>
            );

        case GamePhase.GameEnd:
            // Find winning team (highest score)
            const winningTeam = safeGame.gameState?.teams.reduce(
                (winner: TeamType, team: TeamType) => (team.score > winner.score ? team : winner),
                safeGame.gameState?.teams[0]
            );

            return (
                <div className="container mx-auto py-8 px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                        <h2 className="text-3xl font-bold mb-6">Game Results</h2>

                        <div className="mb-8">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                                {winningTeam?.name || "Team"} Wins!
                            </div>
                            <div className="text-xl">
                                Final Score: {winningTeam?.score || 0} points
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Team Scores</h3>
                            <div className="space-y-2">
                                {safeGame.gameState?.teams.map((team: TeamType) => (
                                    <div
                                        key={team.id}
                                        className={`p-3 rounded-lg flex justify-between ${team.id === winningTeam?.id
                                            ? "bg-green-100 dark:bg-green-900"
                                            : "bg-gray-100 dark:bg-gray-700"
                                            }`}
                                    >
                                        <span className="font-medium">{team.name}</span>
                                        <span className="font-bold">{team.score} points</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigateTo('/setup')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Play Again
                            </button>

                            <button
                                onClick={() => navigateTo('/')}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            );

        default:
            return <div>Game is loading... Please wait.</div>;
    }
} 