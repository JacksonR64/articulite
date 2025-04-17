import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that should be accessible without authentication
const publicRouteMatcher = createRouteMatcher([
    '/',
    '/auth(.*)',  // All auth routes including sign-in, sign-up, and callbacks
    '/api/public(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    // If it's a public route, don't require authentication
    if (publicRouteMatcher(req)) {
        return;
    }

    // Get authentication state
    const { userId } = await auth();

    // If the user is not signed in, redirect to the sign-in page
    if (!userId) {
        const signInUrl = new URL('/auth/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
    }

    // Allow the request to proceed for authenticated users
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    ],
}; 