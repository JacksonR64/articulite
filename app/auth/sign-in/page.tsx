'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from '@/components/theme/theme-provider';
import Link from "next/link";

export default function SignInPage() {
    return (
        <ThemeProvider>
            <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ArticuLITE</h1>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400">Sign in to access the game</p>
                </div>

                <SignIn
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            card: "shadow-xl",
                            headerTitle: "text-xl font-semibold",
                            headerSubtitle: "text-sm",
                        },
                    }}
                />
            </div>
        </ThemeProvider>
    );
} 