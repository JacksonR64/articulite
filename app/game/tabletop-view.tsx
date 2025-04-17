'use client';

import React from 'react';
import { QuestionCard } from '@/components/articulate';
import { TabletopLayout, TabletopSettings } from '@/components/articulate/tabletop';
import { useTabletop } from '@/contexts';
import { Question } from '@/lib/storage/models';

interface TabletopGameViewProps {
    currentQuestion: Question;
    onCorrect: () => void;
    onSkip: () => void;
    answeredQuestions: string[];
    skippedQuestions: string[];
    onLogout: () => void;
    onNavigateToSettings: () => void;
}

const TabletopGameView: React.FC<TabletopGameViewProps> = ({
    currentQuestion,
    onCorrect,
    onSkip,
    answeredQuestions,
    skippedQuestions,
    onLogout,
    onNavigateToSettings
}) => {
    const {
        isTabletopMode,
        toggleTabletopMode,
        tabletopSettings,
        updateTabletopSettings,
        showSettings,
        openSettings,
        closeSettings
    } = useTabletop();

    // Sample active team data - in a real app, this would come from the game state
    const activeTeam = {
        id: 1,
        name: 'Team 1',
        color: '#3b82f6' // blue-500
    };

    return (
        <>
            {/* Settings modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeSettings}></div>
                        <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
                            <TabletopSettings
                                initialSettings={tabletopSettings}
                                onSave={updateTabletopSettings}
                                onCancel={closeSettings}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <TabletopLayout
                isTabletopMode={isTabletopMode}
                onToggleMode={toggleTabletopMode}
                activeTeam={isTabletopMode ? activeTeam : undefined}
                currentCategory={isTabletopMode ? currentQuestion.category : undefined}
            >
                {/* Content for tabletop mode */}
                <div className="space-y-6">
                    {/* Settings and controls */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={openSettings}
                            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Tabletop Settings
                        </button>

                        <div className="space-x-2">
                            <button
                                onClick={onNavigateToSettings}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                            >
                                Game Settings
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {tabletopSettings.showBoardVisualization && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg mb-6">
                            <h3 className="text-md font-medium mb-2">Board Visualization</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This is a placeholder for the board visualization that will be implemented in task 7.2
                            </p>
                        </div>
                    )}

                    {/* Current question */}
                    <div className="mb-8">
                        <QuestionCard
                            category={currentQuestion.category}
                            question={currentQuestion.text}
                            onCorrect={onCorrect}
                            onSkip={onSkip}
                        />
                    </div>

                    {/* Question results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                                Correct Answers: {answeredQuestions.length}
                            </h2>
                            {answeredQuestions.length > 0 && (
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {answeredQuestions.slice(-3).map((q, index) => (
                                        <li key={`correct-${index}`}>{q}</li>
                                    ))}
                                    {answeredQuestions.length > 3 && (
                                        <li className="text-gray-500 dark:text-gray-400">+ {answeredQuestions.length - 3} more</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                Skipped: {skippedQuestions.length}
                            </h2>
                            {skippedQuestions.length > 0 && (
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {skippedQuestions.slice(-3).map((q, index) => (
                                        <li key={`skipped-${index}`}>{q}</li>
                                    ))}
                                    {skippedQuestions.length > 3 && (
                                        <li className="text-gray-500 dark:text-gray-400">+ {skippedQuestions.length - 3} more</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </TabletopLayout>
        </>
    );
};

export default TabletopGameView; 