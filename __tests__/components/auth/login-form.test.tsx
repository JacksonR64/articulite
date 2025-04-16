import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../components/auth/login-form';

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('LoginForm', () => {
    test('renders the login form correctly', () => {
        const mockOnSubmit = jest.fn();
        render(<LoginForm onSubmit={mockOnSubmit} />);

        // Check that key elements are rendered
        expect(screen.getByText('Game Access')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter the game password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Enter Game' })).toBeInTheDocument();
        expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    test('displays error message when provided', () => {
        const mockOnSubmit = jest.fn();
        const errorMessage = 'Incorrect password';
        render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('calls onSubmit with the entered password', async () => {
        const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
        render(<LoginForm onSubmit={mockOnSubmit} />);

        // Enter password
        const passwordInput = screen.getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'test-password' } });

        // Submit form
        const submitButton = screen.getByRole('button', { name: 'Enter Game' });
        fireEvent.click(submitButton);

        // Check loading state
        expect(screen.getByText('Verifying...')).toBeInTheDocument();

        // Wait for submission to complete
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('test-password');
            expect(screen.queryByText('Verifying...')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Enter Game' })).toBeInTheDocument();
        });
    });

    test('handles submission errors gracefully', async () => {
        const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Failed to submit'));
        render(<LoginForm onSubmit={mockOnSubmit} />);

        // Enter password
        const passwordInput = screen.getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'test-password' } });

        // Submit form
        const submitButton = screen.getByRole('button', { name: 'Enter Game' });
        fireEvent.click(submitButton);

        // Wait for submission to fail and return to normal state
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('test-password');
            expect(screen.queryByText('Verifying...')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Enter Game' })).toBeInTheDocument();
        });
    });
}); 