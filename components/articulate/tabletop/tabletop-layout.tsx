import React, { ReactNode } from 'react';
import { TabletopModeToggle } from './tabletop-mode-toggle';

interface TabletopLayoutProps {
    children: ReactNode;
    isTabletopMode: boolean;
    onToggleMode: () => void;
    activeTeam?: {
        id: number;
        name: string;
        color: string;
    };
    currentCategory?: string;
}

/**
 * Layout component for tabletop companion mode
 * Provides a consistent structure for displaying tabletop-related information
 */
export const TabletopLayout: React.FC<TabletopLayoutProps> = ({
    children,
    isTabletopMode,
    onToggleMode,
    activeTeam,
    currentCategory
}) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header with mode toggle */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ArticuLITE
                        <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 py-1 px-2 rounded-md dark:bg-indigo-900 dark:text-indigo-200">
                            Tabletop Companion
                        </span>
                    </h1>

                    <TabletopModeToggle
                        isTabletopMode={isTabletopMode}
                        onToggle={onToggleMode}
                    />
                </div>

                {/* Active team and category indicator */}
                {isTabletopMode && activeTeam && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: activeTeam.color }}
                            />
                            <span className="font-medium">{activeTeam.name}'s Turn</span>
                        </div>

                        {currentCategory && (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Category: {currentCategory}
                            </div>
                        )}
                    </div>
                )}

                {/* Main content area */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    {isTabletopMode ? (
                        children
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className="w-16 h-16 text-gray-400 mb-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Digital Mode Active</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                                Switch to Tabletop Companion Mode to use this app alongside your physical Articulate board game.
                            </p>
                            <button
                                onClick={onToggleMode}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Switch to Tabletop Mode
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer with helpful tips */}
                {isTabletopMode && (
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Tip: Keep your device visible to all players during the game
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabletopLayout; 