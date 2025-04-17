'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

// This is now just a wrapper around Clerk's auth
// Keeping the same interface for backward compatibility with existing components
interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void; // This is now a no-op since Clerk handles sign-in
    logout: () => void; // This will use Clerk's signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/auth', '/auth/sign-in', '/auth/sign-up'];

export function AuthProvider({ children }: { children: ReactNode }) {
    // Use Clerk's auth
    const { isLoaded, isSignedIn, signOut } = useClerkAuth();

    // Proxy to Clerk's auth
    const authValue: AuthContextType = {
        isAuthenticated: isSignedIn === true, // Make sure it's a boolean
        isLoading: !isLoaded,
        // These are now just wrappers around Clerk's methods
        login: () => {
            console.warn('Using legacy login method. Use Clerk\'s SignIn component instead.');
        },
        logout: () => signOut(),
    };

    return (
        <AuthContext.Provider value={authValue}>
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