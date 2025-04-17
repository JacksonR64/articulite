import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Settings | ArticuLITE',
    description: 'Configure your API settings for ArticuLITE',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return children;
} 