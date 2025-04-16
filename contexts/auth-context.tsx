'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { verifySessionToken, createSessionToken, AUTH_STORAGE_KEY } from '@/lib/auth-utils';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/auth'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check authentication on mount and when pathname changes
    useEffect(() => {
        const checkAuth = () => {
            setIsLoading(true);
            const authToken = localStorage.getItem(AUTH_STORAGE_KEY);

            const isValid = authToken ? verifySessionToken(authToken) : false;
            setIsAuthenticated(isValid);

            // If not authenticated and not on a public path, redirect to auth
            if (!isValid && !PUBLIC_PATHS.includes(pathname)) {
                router.push('/auth');
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    // Login function - stores token and updates state
    const login = (token: string) => {
        localStorage.setItem(AUTH_STORAGE_KEY, token);
        setIsAuthenticated(true);
    };

    // Logout function - removes token and redirects
    const logout = () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
        router.push('/auth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 