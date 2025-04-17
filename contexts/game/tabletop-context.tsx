'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { TabletopSettingsType } from '@/components/articulate/tabletop';

interface TabletopContextType {
    isTabletopMode: boolean;
    toggleTabletopMode: () => void;
    tabletopSettings: TabletopSettingsType;
    updateTabletopSettings: (settings: TabletopSettingsType) => void;
    showSettings: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

const defaultSettings: TabletopSettingsType = {
    showBoardVisualization: true,
    enableSoundEffects: true,
    showTurnInstructions: true,
    turnTimerEnabled: true,
    autoAdvanceToNextTeam: false
};

const TabletopContext = createContext<TabletopContextType | undefined>(undefined);

export const TabletopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTabletopMode, setIsTabletopMode] = useState(false);
    const [tabletopSettings, setTabletopSettings] = useState<TabletopSettingsType>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);

    // Load saved settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('tabletopSettings');
            const savedMode = localStorage.getItem('tabletopMode');

            if (savedSettings) {
                setTabletopSettings(JSON.parse(savedSettings));
            }

            if (savedMode) {
                setIsTabletopMode(JSON.parse(savedMode));
            }
        } catch (error) {
            console.error('Error loading tabletop settings:', error);
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('tabletopSettings', JSON.stringify(tabletopSettings));
            localStorage.setItem('tabletopMode', JSON.stringify(isTabletopMode));
        } catch (error) {
            console.error('Error saving tabletop settings:', error);
        }
    }, [tabletopSettings, isTabletopMode]);

    const toggleTabletopMode = () => {
        setIsTabletopMode(prev => !prev);
    };

    const updateTabletopSettings = (settings: TabletopSettingsType) => {
        setTabletopSettings(settings);
        setShowSettings(false);
    };

    const openSettings = () => {
        setShowSettings(true);
    };

    const closeSettings = () => {
        setShowSettings(false);
    };

    const contextValue: TabletopContextType = {
        isTabletopMode,
        toggleTabletopMode,
        tabletopSettings,
        updateTabletopSettings,
        showSettings,
        openSettings,
        closeSettings
    };

    return (
        <TabletopContext.Provider value={contextValue}>
            {children}
        </TabletopContext.Provider>
    );
};

export const useTabletop = (): TabletopContextType => {
    const context = useContext(TabletopContext);
    if (context === undefined) {
        throw new Error('useTabletop must be used within a TabletopProvider');
    }
    return context;
};

export default TabletopContext; 