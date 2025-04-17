'use client';

import { useEffect, useState } from 'react';

/**
 * SuppressHydrationWarning component
 * 
 * This component is used to suppress hydration warnings on elements that might be modified
 * by browser extensions like Grammarly before React hydration.
 * 
 * It works by using React's suppressHydrationWarning feature and applying it to specific elements.
 */
export function SuppressHydrationWarning({ children }: { children: React.ReactNode }) {
    // Only render on client to avoid hydration mismatch
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Browser extension cleanup - this removes Grammarly attributes
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const removeGrammarlyAttributes = () => {
                const elements = document.querySelectorAll('[data-gr-ext-installed], [data-new-gr-c-s-check-loaded]');
                elements.forEach(element => {
                    element.removeAttribute('data-gr-ext-installed');
                    element.removeAttribute('data-new-gr-c-s-check-loaded');
                });
            };

            // Clean up immediately
            removeGrammarlyAttributes();

            // And set up an observer to catch future changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName?.startsWith('data-gr-') ||
                            mutation.attributeName?.includes('grammarly'))) {
                        removeGrammarlyAttributes();
                    }
                });
            });

            observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['data-gr-ext-installed', 'data-new-gr-c-s-check-loaded']
            });

            return () => observer.disconnect();
        }
    }, [isClient]);

    // If we're on the server, render normally
    if (!isClient) {
        return <>{children}</>;
    }

    // On the client, apply suppressHydrationWarning to the children
    return (
        <div suppressHydrationWarning>
            {children}
        </div>
    );
} 