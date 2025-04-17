import React from 'react';

interface TabletopModeToggleProps {
    isTabletopMode: boolean;
    onToggle: () => void;
}

/**
 * Toggle switch component for changing between digital and tabletop companion modes
 */
export const TabletopModeToggle: React.FC<TabletopModeToggleProps> = ({
    isTabletopMode,
    onToggle
}) => {
    return (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
            <div className="flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`w-5 h-5 mr-2 ${isTabletopMode ? 'text-gray-400' : 'text-blue-600'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${isTabletopMode ? 'text-gray-400' : 'text-blue-600'}`}>Digital</span>
            </div>

            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isTabletopMode ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                type="button"
                role="switch"
                aria-checked={isTabletopMode}
            >
                <span className="sr-only">Use tabletop companion mode</span>
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTabletopMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>

            <div className="flex items-center">
                <span className={`text-sm font-medium ${isTabletopMode ? 'text-indigo-600' : 'text-gray-400'}`}>Tabletop</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`w-5 h-5 ml-2 ${isTabletopMode ? 'text-indigo-600' : 'text-gray-400'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
        </div>
    );
};

export default TabletopModeToggle; 