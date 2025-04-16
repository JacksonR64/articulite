import React from 'react';

interface TeamDisplayProps {
    name: string;
    score: number;
    isActive: boolean;
}

/**
 * Displays a team's information including name and score
 * Highlights the team when it's their turn
 */
export const TeamDisplay: React.FC<TeamDisplayProps> = ({
    name,
    score,
    isActive
}) => {
    return (
        <div className={`rounded-lg p-4 mb-4 ${isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <h3 className={`text-lg font-semibold ${isActive ? 'text-blue-600 dark:text-blue-300' : ''}`}>
                {name}
            </h3>
            <p className="text-sm">
                Score: <span className="font-bold">{score}</span>
            </p>
            {isActive && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    Current Turn
                </div>
            )}
        </div>
    );
};

export default TeamDisplay; 