'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Solve hydration mismatch by only mounting the ThemeProvider after the component has mounted
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return children without theme provider during SSR to avoid hydration mismatch
        return <>{children}</>;
    }

    return (
        <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </NextThemeProvider>
    );
} 