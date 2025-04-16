import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../../../components/articulate/question/question-card';

describe('QuestionCard', () => {
    test('renders question card with category and question', () => {
        const mockOnCorrect = jest.fn();
        const mockOnSkip = jest.fn();

        render(
            <QuestionCard
                category="Object"
                question="Ball"
                onCorrect={mockOnCorrect}
                onSkip={mockOnSkip}
            />
        );

        // Check if category and question are displayed
        expect(screen.getByText('Object')).toBeInTheDocument();
        expect(screen.getByText('Ball')).toBeInTheDocument();

        // Check if buttons are present
        expect(screen.getByRole('button', { name: 'Correct' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    });

    test('applies different background color based on category', () => {
        const mockOnCorrect = jest.fn();
        const mockOnSkip = jest.fn();

        const { rerender } = render(
            <QuestionCard
                category="Object"
                question="Ball"
                onCorrect={mockOnCorrect}
                onSkip={mockOnSkip}
            />
        );

        // Object category should have yellow styling
        const objectCategory = screen.getByText('Object');
        expect(objectCategory.classList.toString()).toContain('bg-yellow-100');

        // Change to Nature category
        rerender(
            <QuestionCard
                category="Nature"
                question="Tree"
                onCorrect={mockOnCorrect}
                onSkip={mockOnSkip}
            />
        );

        // Nature category should have green styling
        const natureCategory = screen.getByText('Nature');
        expect(natureCategory.classList.toString()).toContain('bg-green-100');
    });

    test('calls onCorrect when correct button is clicked', () => {
        const mockOnCorrect = jest.fn();
        const mockOnSkip = jest.fn();

        render(
            <QuestionCard
                category="Object"
                question="Ball"
                onCorrect={mockOnCorrect}
                onSkip={mockOnSkip}
            />
        );

        // Click the correct button
        fireEvent.click(screen.getByRole('button', { name: 'Correct' }));

        // Check if onCorrect callback was called
        expect(mockOnCorrect).toHaveBeenCalledTimes(1);
        expect(mockOnSkip).not.toHaveBeenCalled();
    });

    test('calls onSkip when skip button is clicked', () => {
        const mockOnCorrect = jest.fn();
        const mockOnSkip = jest.fn();

        render(
            <QuestionCard
                category="Object"
                question="Ball"
                onCorrect={mockOnCorrect}
                onSkip={mockOnSkip}
            />
        );

        // Click the skip button
        fireEvent.click(screen.getByRole('button', { name: 'Skip' }));

        // Check if onSkip callback was called
        expect(mockOnSkip).toHaveBeenCalledTimes(1);
        expect(mockOnCorrect).not.toHaveBeenCalled();
    });
}); 