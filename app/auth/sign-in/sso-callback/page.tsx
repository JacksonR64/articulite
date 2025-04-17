'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpinnerOverlay } from '@/components/ui/spinner';

// Internal component that uses useSearchParams
function SSOCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get the redirect URL from the query parameters
        const redirectUrl = searchParams.get('redirect_url') ||
            searchParams.get('after_sign_in_url') ||
            '/';

        // Log the redirect attempt for debugging
        console.log('Redirecting from SSO callback to:', redirectUrl);

        // Redirect to the specified URL or home page
        router.push(redirectUrl);
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <p className="text-center text-gray-500 mb-4">Completing authentication...</p>
        </div>
    );
}

export default function SSOCallbackPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
            <Suspense fallback={<SpinnerOverlay message="Loading authentication..." />}>
                <SSOCallbackContent />
            </Suspense>
        </div>
    );
} 