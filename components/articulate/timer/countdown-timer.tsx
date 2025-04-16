import React, { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
    initialSeconds: number;
    onTimeUp: () => void;
    isRunning?: boolean;
}

/**
 * A countdown timer component for game turns
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    initialSeconds,
    onTimeUp,
    isRunning = true
}) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    // Reset timer when initialSeconds changes
    useEffect(() => {
        setSecondsLeft(initialSeconds);
    }, [initialSeconds]);

    // Timer countdown effect
    useEffect(() => {
        if (!isRunning) return;

        if (secondsLeft <= 0) {
            onTimeUp();
            return;
        }

        const timerId = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [isRunning, secondsLeft, onTimeUp]);

    // Format seconds as mm:ss
    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Calculate percentage for progress bar
    const progressPercentage = (secondsLeft / initialSeconds) * 100;

    // Determine color based on remaining time
    const getColorClass = () => {
        if (secondsLeft > initialSeconds * 0.6) return 'bg-green-500';
        if (secondsLeft > initialSeconds * 0.3) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div data-testid="countdown-timer" className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="font-bold text-xl">{formatTime(secondsLeft)}</span>
                <span className="text-sm text-gray-500">
                    {isRunning ? 'Running' : 'Paused'}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`${getColorClass()} h-2.5 rounded-full transition-all duration-1000 ease-linear`}
                    style={{ width: `${progressPercentage}%` }}
                    data-testid="timer-progress"
                />
            </div>
        </div>
    );
};

export default CountdownTimer; 