'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SpinnerOverlay } from '@/components/ui/spinner';

export default function AuthPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to Clerk sign-in page
        router.push('/auth/sign-in');
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
            <SpinnerOverlay message="Redirecting to authentication..." />
        </div>
    );
} 