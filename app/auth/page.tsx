'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth';
import { validatePassword, createSessionToken } from '@/lib/auth-utils';
import { useAuth } from '@/contexts';

export default function AuthPage() {
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useAuth();

    useEffect(() => {
        // If already authenticated, redirect to setup
        if (!isLoading && isAuthenticated) {
            router.push('/setup');
        } else if (!isLoading) {
            setIsChecking(false);
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async (password: string) => {
        if (validatePassword(password)) {
            // Create token and login through auth context
            const token = createSessionToken();
            login(token);
            router.push('/setup');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    // Show loading while checking auth state
    if (isLoading || isChecking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <div className="w-full max-w-md text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500">Checking authentication status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ArticuLITE</h1>
                <p className="text-gray-600 dark:text-gray-400">Enter the password to access the game</p>
            </div>

            <LoginForm onSubmit={handleSubmit} error={error} />
        </div>
    );
} 