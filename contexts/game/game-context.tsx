'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Team, GameSettings, GamePhase } from '@/lib/storage/models';
import { storeData, retrieveData } from '@/lib/storage/utils';
import { getRandomQuestion } from '@/lib/api';

// Game state interface
interface GameState {
    teams: Team[];
    settings: GameSettings;
    currentTeamIndex: number;
    currentPlayerIndex: number;
    currentPhase: GamePhase;
    currentQuestion: any;
    timer: number;
    turnScore: number;
    turnQuestions: number;
    isTimerRunning: boolean;
}

// Game context interface
interface GameContextType {
    gameState: GameState | null;
    currentPhase: GamePhase | null;
    startGame: () => void;
    nextTurn: () => void;
    answerCorrect: () => void;
    skipQuestion: () => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    getCurrentTeam: () => Team | null;
    getCurrentPlayer: () => any;
    updateSettings: (settings: Partial<GameSettings>) => void;
    updateTeams: (teams: Team[]) => void;
    resetGame: () => void;
}

// Default game settings
const defaultSettings: GameSettings = {
    timeLimit: 60,
    winningScore: 20,
    questionsPerTurn: 5,
    skipPenalty: 1,
    categories: ['world', 'object', 'nature', 'person', 'action', 'random'],
    useTimer: true
};

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider props
interface GameProviderProps {
    children: ReactNode;
    initialTeams?: Team[];
    initialSettings?: Partial<GameSettings>;
}

// Game provider component
export const GameProvider: React.FC<GameProviderProps> = ({
    children,
    initialTeams,
    initialSettings
}) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    // Initialize game state
    useEffect(() => {
        console.log('Initializing game with:', { initialTeams, initialSettings });

        try {
            // Try to load existing game state first
            const savedState = retrieveData<GameState | null>('articulate:current_game' as any, null);

            if (savedState && savedState.teams && savedState.teams.length > 0) {
                console.log('Loaded saved game state:', savedState);
                setGameState(savedState);
                return;
            }

            // If no saved state, use provided initialTeams and initialSettings
            if (initialTeams && initialTeams.length > 0) {
                const mergedSettings = { ...defaultSettings, ...initialSettings };

                console.log('Creating new game state with provided teams and settings');
                setGameState({
                    teams: initialTeams,
                    settings: mergedSettings,
                    currentTeamIndex: 0,
                    currentPlayerIndex: 0,
                    currentPhase: GamePhase.Setup,
                    currentQuestion: null,
                    timer: mergedSettings.timeLimit,
                    turnScore: 0,
                    turnQuestions: 0,
                    isTimerRunning: false,
                });
            } else {
                // If no teams are provided and no saved state, create default state
                console.warn('No teams provided and no saved game state, using defaults');
                setGameState({
                    teams: [
                        { id: 1, name: 'Team 1', color: '#FF5733', score: 0, players: [{ name: 'Player 1' }] },
                        { id: 2, name: 'Team 2', color: '#33A1FF', score: 0, players: [{ name: 'Player 1' }] }
                    ],
                    settings: defaultSettings,
                    currentTeamIndex: 0,
                    currentPlayerIndex: 0,
                    currentPhase: GamePhase.Setup,
                    currentQuestion: null,
                    timer: defaultSettings.timeLimit,
                    turnScore: 0,
                    turnQuestions: 0,
                    isTimerRunning: false,
                });
            }
        } catch (error) {
            console.error('Error initializing game state:', error);
            // Create fallback state in case of errors
            setGameState({
                teams: [
                    { id: 1, name: 'Team 1', color: '#FF5733', score: 0, players: [{ name: 'Player 1' }] },
                    { id: 2, name: 'Team 2', color: '#33A1FF', score: 0, players: [{ name: 'Player 1' }] }
                ],
                settings: defaultSettings,
                currentTeamIndex: 0,
                currentPlayerIndex: 0,
                currentPhase: GamePhase.Setup,
                currentQuestion: null,
                timer: defaultSettings.timeLimit,
                turnScore: 0,
                turnQuestions: 0,
                isTimerRunning: false,
            });
        }
    }, [initialTeams, initialSettings]);

    // Save game state to localStorage
    useEffect(() => {
        if (gameState) {
            storeData('articulate:current_game' as any, gameState);
        }
    }, [gameState]);

    // Timer effect
    useEffect(() => {
        if (gameState?.isTimerRunning && gameState.timer > 0) {
            const interval = setInterval(() => {
                setGameState((prev) => {
                    if (!prev) return prev;
                    const newTimer = prev.timer - 1;

                    // If timer reaches 0, end the turn
                    if (newTimer <= 0) {
                        clearInterval(interval);
                        return {
                            ...prev,
                            timer: 0,
                            isTimerRunning: false,
                            currentPhase: GamePhase.TurnSummary,
                        };
                    }

                    return {
                        ...prev,
                        timer: newTimer,
                    };
                });
            }, 1000);

            setTimerInterval(interval);

            return () => {
                clearInterval(interval);
                setTimerInterval(null);
            };
        }
    }, [gameState?.isTimerRunning]);

    // Get current team
    const getCurrentTeam = useCallback((): Team | null => {
        if (!gameState) return null;
        return gameState.teams[gameState.currentTeamIndex];
    }, [gameState]);

    // Get current player
    const getCurrentPlayer = useCallback(() => {
        if (!gameState) return null;
        const team = getCurrentTeam();
        if (!team || !team.players || team.players.length === 0) return null;
        return team.players[gameState.currentPlayerIndex];
    }, [gameState, getCurrentTeam]);

    // Load next question
    const loadNextQuestion = useCallback(async () => {
        try {
            if (!gameState || !gameState.settings.categories) {
                console.error('Game state or categories not available');
                return;
            }

            // Get random category
            const categories = gameState.settings.categories;
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            // Get random question from API
            const question = await getRandomQuestion(randomCategory);

            setGameState((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    currentQuestion: question,
                    currentPhase: GamePhase.Question,
                };
            });
        } catch (error) {
            console.error('Error loading question:', error);
        }
    }, [gameState]);

    // Start game
    const startGame = useCallback(() => {
        // First update the game state to prepare for starting a turn
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentPhase: GamePhase.Question,
                timer: prev.settings.timeLimit,
                turnScore: 0,
                turnQuestions: 0,
                isTimerRunning: true,
            };
        });

        // Load the first question
        loadNextQuestion();
    }, [loadNextQuestion]);

    // Next turn
    const nextTurn = useCallback(() => {
        if (!gameState) return;

        setGameState((prev) => {
            if (!prev) return prev;

            // Move to next team
            let nextTeamIndex = (prev.currentTeamIndex + 1) % prev.teams.length;
            let nextPlayerIndex = prev.currentPlayerIndex;

            // If we completed a full cycle of teams, move to the next player
            if (nextTeamIndex === 0) {
                nextPlayerIndex = (prev.currentPlayerIndex + 1) %
                    (prev.teams[0].players?.length || 1);
            }

            // Check if any team has reached winning score
            const gameWon = prev.teams.some(team => team.score >= prev.settings.winningScore);

            return {
                ...prev,
                currentTeamIndex: nextTeamIndex,
                currentPlayerIndex: nextPlayerIndex,
                currentPhase: gameWon ? GamePhase.GameEnd : GamePhase.Setup,
                timer: prev.settings.timeLimit,
                turnScore: 0,
                turnQuestions: 0,
                isTimerRunning: false,
                currentQuestion: null,
            };
        });

        // Clear timer interval
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    }, [gameState, timerInterval]);

    // Answer correct
    const answerCorrect = useCallback(() => {
        if (!gameState) return;

        setGameState((prev) => {
            if (!prev) return prev;

            const updatedTeams = [...prev.teams];
            const currentTeam = updatedTeams[prev.currentTeamIndex];

            // Update score
            currentTeam.score += 1;
            updatedTeams[prev.currentTeamIndex] = currentTeam;

            const newTurnQuestions = prev.turnQuestions + 1;
            const questionsComplete = newTurnQuestions >= prev.settings.questionsPerTurn;

            return {
                ...prev,
                teams: updatedTeams,
                turnScore: prev.turnScore + 1,
                turnQuestions: newTurnQuestions,
                currentPhase: questionsComplete ? GamePhase.TurnSummary : GamePhase.Question,
                currentQuestion: null,
            };
        });

        // Load next question if not at turn end
        if (gameState.turnQuestions < gameState.settings.questionsPerTurn - 1) {
            loadNextQuestion();
        }
    }, [gameState, loadNextQuestion]);

    // Skip question
    const skipQuestion = useCallback(() => {
        if (!gameState) return;

        setGameState((prev) => {
            if (!prev) return prev;

            const updatedTeams = [...prev.teams];
            const currentTeam = updatedTeams[prev.currentTeamIndex];

            // Apply skip penalty
            currentTeam.score = Math.max(0, currentTeam.score - prev.settings.skipPenalty);
            updatedTeams[prev.currentTeamIndex] = currentTeam;

            const newTurnQuestions = prev.turnQuestions + 1;
            const questionsComplete = newTurnQuestions >= prev.settings.questionsPerTurn;

            return {
                ...prev,
                teams: updatedTeams,
                turnQuestions: newTurnQuestions,
                currentPhase: questionsComplete ? GamePhase.TurnSummary : GamePhase.Question,
                currentQuestion: null,
            };
        });

        // Load next question if not at turn end
        if (gameState.turnQuestions < gameState.settings.questionsPerTurn - 1) {
            loadNextQuestion();
        }
    }, [gameState, loadNextQuestion]);

    // Start timer
    const startTimer = useCallback(() => {
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                isTimerRunning: true,
            };
        });
    }, []);

    // Pause timer
    const pauseTimer = useCallback(() => {
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                isTimerRunning: false,
            };
        });

        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    }, [timerInterval]);

    // Reset timer
    const resetTimer = useCallback(() => {
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                timer: prev.settings.timeLimit,
                isTimerRunning: false,
            };
        });

        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    }, [timerInterval]);

    // Update settings
    const updateSettings = useCallback((settings: Partial<GameSettings>) => {
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    ...settings,
                },
                timer: settings.timeLimit || prev.timer,
            };
        });
    }, []);

    // Update teams
    const updateTeams = useCallback((teams: Team[]) => {
        setGameState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                teams,
            };
        });
    }, []);

    // Reset game
    const resetGame = useCallback(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }

        // Clear saved game state
        localStorage.removeItem('articulate:current_game');

        if (initialTeams && initialSettings) {
            const mergedSettings = { ...defaultSettings, ...initialSettings };

            setGameState({
                teams: initialTeams,
                settings: mergedSettings,
                currentTeamIndex: 0,
                currentPlayerIndex: 0,
                currentPhase: GamePhase.Setup,
                currentQuestion: null,
                timer: mergedSettings.timeLimit,
                turnScore: 0,
                turnQuestions: 0,
                isTimerRunning: false,
            });
        } else {
            setGameState(null);
        }
    }, [initialTeams, initialSettings, timerInterval]);

    return (
        <GameContext.Provider
            value={{
                gameState,
                currentPhase: gameState?.currentPhase || null,
                startGame,
                nextTurn,
                answerCorrect,
                skipQuestion,
                startTimer,
                pauseTimer,
                resetTimer,
                getCurrentTeam,
                getCurrentPlayer,
                updateSettings,
                updateTeams,
                resetGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

// Hook to use the game context
export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}; 