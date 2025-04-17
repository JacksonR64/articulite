'use client';

import React, { useState, useEffect } from 'react';
import { GameProvider } from '@/contexts/game/game-context';
import GameContent from './game-content';
import { Team } from '@/lib/storage/models';
import { SpinnerOverlay } from '@/components/ui/spinner';

interface GameSettings {
    timeLimit: number;
    winningScore: number;
    questionsPerTurn: number;
    skipPenalty: number;
    categories: string[];
}

interface ClientWrapperProps {
    teams: Team[];
    settings: GameSettings;
    isLoading: boolean;
}

/**
 * Client-side wrapper component to avoid hydration errors
 * This ensures that components using browser APIs like localStorage
 * are only rendered on the client side
 */
export default function ClientWrapper({ teams, settings, isLoading = false }: ClientWrapperProps) {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration errors by only rendering once mounted
    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading spinner while client side rendering is happening or external loading state is true
    if (!mounted || isLoading) {
        return <SpinnerOverlay message="Loading game..." />;
    }

    // Default values for teams and settings if they're undefined
    const safeTeams = Array.isArray(teams) ? teams : [];
    const safeSettings = settings || {
        timeLimit: 60,
        winningScore: 20,
        questionsPerTurn: 5,
        skipPenalty: 1,
        categories: ['World', 'Object', 'Nature', 'Person', 'Action', 'Random']
    };

    return (
        <GameProvider initialTeams={safeTeams} initialSettings={safeSettings}>
            <GameContent />
        </GameProvider>
    );
} 