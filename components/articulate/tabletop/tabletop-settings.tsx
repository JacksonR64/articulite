import React, { useState } from 'react';

interface TabletopSettingsProps {
    initialSettings: TabletopSettings;
    onSave: (settings: TabletopSettings) => void;
    onCancel: () => void;
}

export interface TabletopSettings {
    showBoardVisualization: boolean;
    enableSoundEffects: boolean;
    showTurnInstructions: boolean;
    turnTimerEnabled: boolean;
    autoAdvanceToNextTeam: boolean;
}

/**
 * Settings panel for configuring tabletop companion mode preferences
 */
export const TabletopSettings: React.FC<TabletopSettingsProps> = ({
    initialSettings,
    onSave,
    onCancel
}) => {
    const [settings, setSettings] = useState<TabletopSettings>(initialSettings);

    const handleToggleSetting = (settingKey: keyof TabletopSettings) => {
        setSettings(prev => ({
            ...prev,
            [settingKey]: !prev[settingKey]
        }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tabletop Mode Settings</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                {/* Board Visualization Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Show Board Visualization</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Display a digital representation of the game board</p>
                    </div>
                    <button
                        onClick={() => handleToggleSetting('showBoardVisualization')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.showBoardVisualization ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        type="button"
                        role="switch"
                        aria-checked={settings.showBoardVisualization}
                    >
                        <span className="sr-only">Show board visualization</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showBoardVisualization ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable Sound Effects</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Play sounds for timers and turn transitions</p>
                    </div>
                    <button
                        onClick={() => handleToggleSetting('enableSoundEffects')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.enableSoundEffects ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        type="button"
                        role="switch"
                        aria-checked={settings.enableSoundEffects}
                    >
                        <span className="sr-only">Enable sound effects</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableSoundEffects ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Turn Instructions Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Show Turn Instructions</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Display detailed instructions at the end of each turn</p>
                    </div>
                    <button
                        onClick={() => handleToggleSetting('showTurnInstructions')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.showTurnInstructions ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        type="button"
                        role="switch"
                        aria-checked={settings.showTurnInstructions}
                    >
                        <span className="sr-only">Show turn instructions</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showTurnInstructions ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Turn Timer Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable Turn Timer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Use the app's timer for tracking turn duration</p>
                    </div>
                    <button
                        onClick={() => handleToggleSetting('turnTimerEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.turnTimerEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        type="button"
                        role="switch"
                        aria-checked={settings.turnTimerEnabled}
                    >
                        <span className="sr-only">Enable turn timer</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.turnTimerEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Auto Advance Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto-Advance to Next Team</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automatically switch to next team after turn ends</p>
                    </div>
                    <button
                        onClick={() => handleToggleSetting('autoAdvanceToNextTeam')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.autoAdvanceToNextTeam ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        type="button"
                        role="switch"
                        aria-checked={settings.autoAdvanceToNextTeam}
                    >
                        <span className="sr-only">Auto-advance to next team</span>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoAdvanceToNextTeam ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default TabletopSettings; 