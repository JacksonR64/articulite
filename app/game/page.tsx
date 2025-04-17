'use client';

import React, { useState, useEffect } from 'react';
import { forceRegenerateQuestions } from '@/lib/api/questions';
import { RedirectToSignIn } from '@clerk/nextjs';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { retrieveData } from '@/lib/storage/utils';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { Team } from '@/lib/storage/models';
import { useUser } from '@clerk/nextjs';
import TabletopView from './tabletop-view';
import ClientWrapper from './client-wrapper';
import { useSafeLocalStorage } from '@/hooks/useSafeLocalStorage';

interface GameSettings {
    timeLimit: number;
    winningScore: number;
    questionsPerTurn: number;
    skipPenalty: number;
    categories: string[];
    useTimer: boolean;
}

// Default settings and teams for consistent SSR and client rendering
const DEFAULT_TEAMS: Team[] = [
    { id: 1, name: 'Team 1', color: '#FF5733', score: 0, players: [{ name: 'Player 1' }] },
    { id: 2, name: 'Team 2', color: '#33A1FF', score: 0, players: [{ name: 'Player 1' }] }
];

const DEFAULT_SETTINGS: GameSettings = {
    timeLimit: 60,
    winningScore: 20,
    questionsPerTurn: 5,
    skipPenalty: 1,
    categories: ['World', 'Object', 'Nature', 'Person', 'Action', 'Random'],
    useTimer: true
};

// Main game page
export default function GamePage() {
    // We'll wrap useUser in try/catch to gracefully handle when ClerkProvider isn't available yet
    let userState = { isLoaded: false, isSignedIn: false };

    try {
        const { isLoaded, isSignedIn } = useUser();
        userState = { isLoaded, isSignedIn: isSignedIn === true }; // Ensure isSignedIn is always a boolean
    } catch (error) {
        console.error("Error with Clerk authentication:", error);
        // Continue with default state (not loaded, not signed in)
    }

    const { isLoaded, isSignedIn } = userState;
    const [isTabletopMode, setIsTabletopMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Start with default values for SSR to prevent hydration issues
    const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
    const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

    // Use safe localStorage hooks
    const [storedTeams, setStoredTeams] = useSafeLocalStorage<Team[]>('articulate:teams', DEFAULT_TEAMS);
    const [storedSettings, setStoredSettings] = useSafeLocalStorage<GameSettings>('articulate:settings', DEFAULT_SETTINGS);
    const [isTabletopModeStored, setIsTabletopModeStored] = useSafeLocalStorage<boolean>('articulate:tabletop_mode', false);

    // Load game data from localStorage on client-side only
    useEffect(() => {
        const loadGameData = async () => {
            try {
                console.log('Loading game data from localStorage...');

                // Set tabletop mode from stored value
                setIsTabletopMode(isTabletopModeStored);

                // Load teams
                if (storedTeams && Array.isArray(storedTeams) && storedTeams.length > 0) {
                    console.log('Loaded teams:', storedTeams);

                    // Ensure teams have proper structure
                    const validatedTeams = storedTeams.map(team => ({
                        id: team.id || Math.floor(Math.random() * 10000),
                        name: team.name || `Team ${Math.floor(Math.random() * 100)}`,
                        color: team.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
                        score: team.score || 0,
                        players: team.players || [{ name: 'Player 1' }]
                    }));

                    setTeams(validatedTeams);
                } else {
                    console.log('No teams found, using default teams');
                }

                // Load settings
                if (storedSettings && typeof storedSettings === 'object') {
                    console.log('Loaded settings:', storedSettings);
                    setSettings(storedSettings);
                } else {
                    console.log('Using default settings');
                }

                // Preload some questions for better performance
                try {
                    const categories = (storedSettings?.categories || DEFAULT_SETTINGS.categories).map(
                        cat => typeof cat === 'string' ? cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() : 'Random'
                    );

                    await forceRegenerateQuestions(categories);
                    console.log('Questions preloaded successfully');
                } catch (questionError) {
                    console.error('Error preloading questions:', questionError);
                    // Continue anyway, questions will be generated on-demand
                }

                // Done loading
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading game data:', error);
                // Use default values as fallback
                setIsLoading(false);
            }
        };

        loadGameData();
    }, [storedTeams, storedSettings, isTabletopModeStored]);

    // Show loading spinner while data is being loaded
    if (isLoading) {
        return <SpinnerOverlay message="Loading game data..." />;
    }

    // Show tabletop view if enabled
    if (isTabletopMode) {
        // Provide mock data since we're not actually using TabletopView functionality
        const mockQuestion = {
            id: '1',
            category: 'Object',
            text: 'A mock question',
            used: false
        };

        return (
            <TabletopView
                currentQuestion={mockQuestion}
                onCorrect={() => { }}
                onSkip={() => { }}
                answeredQuestions={[]}
                skippedQuestions={[]}
                onLogout={() => { }}
                onNavigateToSettings={() => { }}
            />
        );
    }

    return (
        <AuthWrapper>
            {!isLoaded ? (
                <SpinnerOverlay message="Checking authentication..." />
            ) : !isSignedIn ? (
                <RedirectToSignIn />
            ) : (
                <ClientWrapper
                    teams={teams}
                    settings={settings}
                    isLoading={isLoading}
                />
            )}
        </AuthWrapper>
    );
}

// Add this to the bottom of the file to mark it as client-only
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; 