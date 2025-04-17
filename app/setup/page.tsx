'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSafeLocalStorage } from '@/hooks/useSafeLocalStorage';
import { GameSettings, Team } from '@/lib/storage/models';
import { StorageKeys } from '@/lib/storage/models';
import { QuestionPreloader } from '@/components/game';
import { useAuth, SignOutButton, RedirectToSignIn } from '@clerk/nextjs';
import { AuthWrapper } from '@/components/auth';
import { SpinnerOverlay } from '@/components/ui/spinner';

// Default values for initial state to ensure consistency between server and client
const DEFAULT_TEAMS: Team[] = [
    { id: 1, name: 'Team 1', color: 'blue', score: 0 },
    { id: 2, name: 'Team 2', color: 'red', score: 0 },
];

const DEFAULT_SETTINGS: GameSettings = {
    timeLimit: 30,
    winningScore: 30,
    questionsPerTurn: 5,
    skipPenalty: 1,
    categories: ['Object', 'Nature', 'Person', 'Action', 'World', 'Random'],
    useTimer: true
};

export default function SetupPage() {
    // Use Clerk authentication
    const { isLoaded, isSignedIn } = useAuth();

    // Track when initial data is loaded from localStorage
    const initialLoadComplete = useRef(false);
    const skipNextEffect = useRef(false);

    // Use safe localStorage to persist game settings - this prevents hydration mismatches
    const [gameState, setGameState] = useSafeLocalStorage<{
        teams: Team[];
        settings: GameSettings;
    }>(StorageKeys.CURRENT_GAME, {
        teams: DEFAULT_TEAMS,
        settings: DEFAULT_SETTINGS
    });

    // Create local state from persisted state, using default values to prevent hydration issues
    const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
    const [timeLimit, setTimeLimit] = useState(DEFAULT_SETTINGS.timeLimit);
    const [winningScore, setWinningScore] = useState(DEFAULT_SETTINGS.winningScore);
    const [useTimer, setUseTimer] = useState(DEFAULT_SETTINGS.useTimer);
    const [allowSkips, setAllowSkips] = useState(true);
    const [maxSkipsPerTurn, setMaxSkipsPerTurn] = useState(3);
    const [showPlayerNames, setShowPlayerNames] = useState(false);
    const [teamPlayers, setTeamPlayers] = useState<Record<number, string[]>>(() => {
        const initialTeamPlayers: Record<number, string[]> = {};
        DEFAULT_TEAMS.forEach(team => {
            initialTeamPlayers[team.id] = [];
        });
        return initialTeamPlayers;
    });
    const [newPlayerName, setNewPlayerName] = useState('');
    const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState<number | null>(null);
    const [showQuestionCache, setShowQuestionCache] = useState(false);
    const [questionCacheComplete, setQuestionCacheComplete] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const router = useRouter();

    // Sync state with localStorage value after component mounts
    useEffect(() => {
        if (gameState && !initialLoadComplete.current) {
            // Mark that we've completed initial load to prevent loops
            initialLoadComplete.current = true;
            skipNextEffect.current = true;

            if (gameState.teams && Array.isArray(gameState.teams)) {
                setTeams(gameState.teams);
            }

            if (gameState.settings) {
                setTimeLimit(gameState.settings.timeLimit || DEFAULT_SETTINGS.timeLimit);
                setWinningScore(gameState.settings.winningScore || DEFAULT_SETTINGS.winningScore);
                setUseTimer(gameState.settings.useTimer !== false);
            }

            // Update team players after teams are updated
            const updatedTeamPlayers: Record<number, string[]> = {};
            (gameState.teams || DEFAULT_TEAMS).forEach(team => {
                updatedTeamPlayers[team.id] = [];
            });
            setTeamPlayers(updatedTeamPlayers);

            console.log('Loaded initial state from localStorage');
        }
    }, [gameState]);

    // Add a direct navigation helper function
    const navigateTo = (path: string) => {
        console.log(`Navigating to: ${path}`);
        window.location.href = path;
    };

    // Update localStorage whenever state changes
    useEffect(() => {
        // Skip this effect if it's triggered by the initial load
        if (skipNextEffect.current) {
            skipNextEffect.current = false;
            return;
        }

        // Only update localStorage when values have actually changed
        if (initialLoadComplete.current) {
            console.log('Saving state changes to localStorage');
            setGameState({
                teams,
                settings: {
                    timeLimit,
                    winningScore,
                    questionsPerTurn: DEFAULT_SETTINGS.questionsPerTurn,
                    skipPenalty: DEFAULT_SETTINGS.skipPenalty,
                    categories: gameState?.settings?.categories || DEFAULT_SETTINGS.categories,
                    useTimer,
                }
            });
        }
    }, [teams, timeLimit, winningScore, useTimer, setGameState, gameState?.settings?.categories]);

    const handleAddTeam = () => {
        if (teams.length < 6) {
            const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
            const newTeamId = teams.length + 1;
            const newTeam = {
                id: newTeamId,
                name: `Team ${newTeamId}`,
                color: colors[teams.length % colors.length],
                score: 0
            };

            const updatedTeams = [...teams, newTeam];
            setTeams(updatedTeams);

            // Initialize player array for the new team
            setTeamPlayers(prev => ({
                ...prev,
                [newTeamId]: []
            }));
        }
    };

    const handleRemoveTeam = (id: number) => {
        if (teams.length > 2) {
            setTeams(teams.filter(team => team.id !== id));

            // Remove players for this team
            setTeamPlayers(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    const handleTeamNameChange = (id: number, name: string) => {
        setTeams(teams.map(team =>
            team.id === id ? { ...team, name } : team
        ));
    };

    const handleAddPlayer = () => {
        if (!newPlayerName.trim() || !selectedTeamForPlayer) return;

        setTeamPlayers(prev => ({
            ...prev,
            [selectedTeamForPlayer]: [...prev[selectedTeamForPlayer], newPlayerName.trim()]
        }));

        setNewPlayerName('');
    };

    const handleRemovePlayer = (teamId: number, playerIndex: number) => {
        setTeamPlayers(prev => ({
            ...prev,
            [teamId]: prev[teamId].filter((_, index) => index !== playerIndex)
        }));
    };

    const handleRandomlyAssignPlayers = () => {
        // Collect all players
        const allPlayers = Object.values(teamPlayers).flat();
        if (allPlayers.length === 0) return;

        // Shuffle players
        const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);

        // Create new empty team assignments
        const newTeamPlayers: Record<number, string[]> = {};
        teams.forEach(team => {
            newTeamPlayers[team.id] = [];
        });

        // Distribute players evenly
        shuffledPlayers.forEach((player, index) => {
            const teamId = teams[index % teams.length].id;
            newTeamPlayers[teamId].push(player);
        });

        setTeamPlayers(newTeamPlayers);
    };

    const handleStartGame = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent default to ensure the button click doesn't get stopped
        e.preventDefault();

        console.log("Start Game button clicked, preparing navigation");

        // Guard against multiple clicks
        if (isNavigating) {
            console.log("Navigation already in progress, ignoring click");
            return;
        }

        setIsNavigating(true);

        try {
            // Save teams to a separate, reliable key
            localStorage.setItem('articulate:teams', JSON.stringify(teams || []));

            // Save settings to a separate, reliable key
            localStorage.setItem('articulate:settings', JSON.stringify({
                timeLimit: timeLimit || 30,
                winningScore: winningScore || 30,
                categories: gameState?.settings?.categories || ['Object', 'Nature', 'Person', 'Action', 'World', 'Random'],
                useTimer: useTimer !== false,
                questionsPerTurn: 5,  // Default value
                skipPenalty: 1,       // Default value
                allowSkips,
                maxSkipsPerTurn
            }));

            // Clear any existing game state to start fresh
            localStorage.removeItem('articulate:current_game');

            console.log("Game settings saved, navigating to /game");

            // Use direct window.location navigation instead of relying on the router
            window.location.href = "/game";
        } catch (error) {
            console.error("Error during navigation:", error);
            // Fallback to direct navigation
            window.location.href = "/game";
        }
    };

    // If loading auth state, show loading spinner
    if (!isLoaded) {
        return <SpinnerOverlay message="Loading authentication..." />;
    }

    // If not signed in, redirect to sign-in page
    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Game Setup</h1>
                <SignOutButton>
                    <button
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </SignOutButton>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Teams</h2>

                <div className="space-y-4 mb-4">
                    {teams.map(team => (
                        <div key={team.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full bg-${team.color}-500`}></div>
                                <input
                                    type="text"
                                    value={team.name}
                                    onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                />
                                {teams.length > 2 && (
                                    <button
                                        onClick={() => handleRemoveTeam(team.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {showPlayerNames && (
                                <div className="ml-7 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Players:</p>

                                    {teamPlayers[team.id]?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {teamPlayers[team.id].map((player, index) => (
                                                <li key={index} className="flex items-center">
                                                    <span className="text-sm">{player}</span>
                                                    <button
                                                        onClick={() => handleRemovePlayer(team.id, index)}
                                                        className="ml-2 text-xs text-red-500"
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No players assigned</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex space-x-2 mb-4">
                    {teams.length < 6 && (
                        <button
                            onClick={handleAddTeam}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            + Add Team
                        </button>
                    )}

                    <button
                        onClick={() => setShowPlayerNames(!showPlayerNames)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                    >
                        {showPlayerNames ? '- Hide Players' : '+ Manage Players'}
                    </button>
                </div>

                {showPlayerNames && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Player Management</h3>

                        <div className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                placeholder="Enter player name"
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md"
                            />

                            <select
                                value={selectedTeamForPlayer || ''}
                                onChange={(e) => setSelectedTeamForPlayer(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-md"
                            >
                                <option value="">Select team</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleAddPlayer}
                                disabled={!newPlayerName.trim() || !selectedTeamForPlayer}
                                className={`px-3 py-2 rounded-md ${!newPlayerName.trim() || !selectedTeamForPlayer
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Add
                            </button>
                        </div>

                        <button
                            onClick={handleRandomlyAssignPlayers}
                            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Randomly Assign Players to Teams
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Game Settings</h2>

                <div className="space-y-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="useTimer"
                            checked={useTimer}
                            onChange={(e) => setUseTimer(e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="useTimer" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Use Timer
                        </label>
                    </div>

                    {useTimer && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time Limit (seconds)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Winning Score
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="100"
                            value={winningScore}
                            onChange={(e) => setWinningScore(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id="allowSkips"
                                checked={allowSkips}
                                onChange={(e) => setAllowSkips(e.target.checked)}
                                className="mr-2 h-4 w-4"
                            />
                            <label htmlFor="allowSkips" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allow Skipping Questions
                            </label>
                        </div>

                        {allowSkips && (
                            <div className="pl-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Maximum Skips Per Turn
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={maxSkipsPerTurn}
                                    onChange={(e) => setMaxSkipsPerTurn(parseInt(e.target.value))}
                                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <button
                    onClick={() => setShowQuestionCache(!showQuestionCache)}
                    className="flex items-center mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showQuestionCache ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>

                {showQuestionCache && (
                    <QuestionPreloader
                        onComplete={(success) => setQuestionCacheComplete(success)}
                    />
                )}
            </div>

            <div className="flex justify-between space-x-4">
                <button
                    onClick={() => navigateTo('/')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Back to Home
                </button>

                <button
                    onClick={handleStartGame}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={isNavigating}
                >
                    {isNavigating ? 'Starting...' : 'Start Game'}
                </button>
            </div>
        </div>
    );
} 