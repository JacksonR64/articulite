import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'OpenAI Demo | Articulate!',
    description: 'Demo page for testing OpenAI integration for question generation',
};

export default function OpenAILayout({ children }: { children: ReactNode }) {
    return children;
} 