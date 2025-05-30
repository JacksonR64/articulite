'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import Link from 'next/link';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <div className="flex flex-col min-h-screen">
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                    <Link href="/" className="text-xl font-bold">ArticuLITE</Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </header>
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
} 