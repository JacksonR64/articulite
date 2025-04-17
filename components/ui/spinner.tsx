'use client';

import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

interface SpinnerOverlayProps {
    message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'blue'
}) => {
    const sizeMap = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={`inline-block animate-spin rounded-full ${sizeMap[size]} border-t-2 border-b-2 border-${color}-600`}></div>
    );
};

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 z-50 flex flex-col items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>
        </div>
    );
};

export default Spinner; 