import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabletopModeToggle } from '@/components/articulate/tabletop';

describe('TabletopModeToggle', () => {
    const mockToggle = jest.fn();

    beforeEach(() => {
        mockToggle.mockClear();
    });

    it('renders correctly when in digital mode', () => {
        render(
            <TabletopModeToggle
                isTabletopMode={false}
                onToggle={mockToggle}
            />
        );

        // Check that "Digital" is highlighted
        const digitalText = screen.getByText('Digital');
        expect(digitalText).toHaveClass('text-blue-600');

        // Check that "Tabletop" is not highlighted
        const tabletopText = screen.getByText('Tabletop');
        expect(tabletopText).toHaveClass('text-gray-400');

        // Check that the toggle button is in the correct state
        const toggleButton = screen.getByRole('switch');
        expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    });

    it('renders correctly when in tabletop mode', () => {
        render(
            <TabletopModeToggle
                isTabletopMode={true}
                onToggle={mockToggle}
            />
        );

        // Check that "Digital" is not highlighted
        const digitalText = screen.getByText('Digital');
        expect(digitalText).toHaveClass('text-gray-400');

        // Check that "Tabletop" is highlighted
        const tabletopText = screen.getByText('Tabletop');
        expect(tabletopText).toHaveClass('text-indigo-600');

        // Check that the toggle button is in the correct state
        const toggleButton = screen.getByRole('switch');
        expect(toggleButton).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onToggle when clicked', () => {
        render(
            <TabletopModeToggle
                isTabletopMode={false}
                onToggle={mockToggle}
            />
        );

        const toggleButton = screen.getByRole('switch');
        fireEvent.click(toggleButton);

        expect(mockToggle).toHaveBeenCalledTimes(1);
    });
}); 