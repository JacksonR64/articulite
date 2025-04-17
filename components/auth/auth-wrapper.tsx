'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { SpinnerOverlay } from '@/components/ui/spinner';

interface AuthWrapperProps {
    children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const { isLoaded, isSignedIn } = useAuth();

    // If still loading, show a spinner
    if (!isLoaded) {
        return <SpinnerOverlay message="Loading authentication..." />;
    }

    // If loading is complete, render children
    return <>{children}</>;
}

export default AuthWrapper; 