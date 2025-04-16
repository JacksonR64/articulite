import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from '../../../components/articulate/timer/countdown-timer';

// Mock timer functions
jest.useFakeTimers();

describe('CountdownTimer', () => {
    afterEach(() => {
        jest.clearAllTimers();
    });

    test('renders with initial time', () => {
        const onTimeUp = jest.fn();
        render(<CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} />);

        // Should display 01:00 for 60 seconds
        expect(screen.getByText('01:00')).toBeInTheDocument();
        expect(screen.getByText('Running')).toBeInTheDocument();

        // Progress bar should be at 100%
        const progressBar = screen.getByTestId('timer-progress');
        expect(progressBar).toHaveStyle('width: 100%');

        // Initial color should be green
        expect(progressBar).toHaveClass('bg-green-500');
    });

    test('counts down each second', () => {
        const onTimeUp = jest.fn();
        render(<CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} />);

        // Advance timer by 1 second
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Should display 00:59
        expect(screen.getByText('00:59')).toBeInTheDocument();

        // Advance another 10 seconds
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // Should display 00:49
        expect(screen.getByText('00:49')).toBeInTheDocument();
    });

    test('changes color based on remaining time', () => {
        const onTimeUp = jest.fn();
        render(<CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} />);

        const getProgressBar = () => screen.getByTestId('timer-progress');

        // Initial color is green
        expect(getProgressBar()).toHaveClass('bg-green-500');

        // Advance to 35 seconds (yellow range)
        act(() => {
            jest.advanceTimersByTime(25000); // 60 - 25 = 35 seconds left
        });

        // Color should change to yellow (below 60% threshold)
        expect(getProgressBar()).toHaveClass('bg-yellow-500');

        // Advance to 15 seconds (red range)
        act(() => {
            jest.advanceTimersByTime(20000); // 35 - 20 = 15 seconds left
        });

        // Color should change to red (below 30% threshold)
        expect(getProgressBar()).toHaveClass('bg-red-500');
    });

    test('calls onTimeUp when timer reaches zero', () => {
        const onTimeUp = jest.fn();
        render(<CountdownTimer initialSeconds={3} onTimeUp={onTimeUp} />);

        // Advance timer fully
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // onTimeUp should be called
        expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    test('pauses timer when isRunning is false', () => {
        const onTimeUp = jest.fn();
        const { rerender } = render(
            <CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} isRunning={false} />
        );

        // Should display "Paused"
        expect(screen.getByText('Paused')).toBeInTheDocument();

        // Advance timer by 10 seconds
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // Time should still be 01:00 since timer is paused
        expect(screen.getByText('01:00')).toBeInTheDocument();

        // Now set isRunning to true
        rerender(<CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} isRunning={true} />);

        // Should display "Running"
        expect(screen.getByText('Running')).toBeInTheDocument();

        // Advance timer by 5 seconds
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        // Now time should be 00:55
        expect(screen.getByText('00:55')).toBeInTheDocument();
    });

    test('resets when initialSeconds changes', () => {
        const onTimeUp = jest.fn();
        const { rerender } = render(
            <CountdownTimer initialSeconds={60} onTimeUp={onTimeUp} />
        );

        // Advance timer by 10 seconds
        act(() => {
            jest.advanceTimersByTime(10000);
        });

        // Time should be 00:50
        expect(screen.getByText('00:50')).toBeInTheDocument();

        // Change initialSeconds to 30
        rerender(<CountdownTimer initialSeconds={30} onTimeUp={onTimeUp} />);

        // Time should reset to 00:30
        expect(screen.getByText('00:30')).toBeInTheDocument();
    });
}); 