import React from 'react';

interface QuestionCardProps {
    category: string;
    question: string;
    onCorrect: () => void;
    onSkip: () => void;
}

/**
 * A card that displays an Articulate question with category
 * and provides buttons for marking as correct or skipping
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
    category,
    question,
    onCorrect,
    onSkip
}) => {
    // Map categories to background colors
    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Object': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Nature': 'bg-green-100 text-green-800 border-green-300',
            'Action': 'bg-blue-100 text-blue-800 border-blue-300',
            'World': 'bg-purple-100 text-purple-800 border-purple-300',
            'Person': 'bg-red-100 text-red-800 border-red-300',
            'Random': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const categoryColors = getCategoryColor(category);

    return (
        <div className="max-w-md mx-auto rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 border border-gray-200">
            <div className="p-8">
                <div className={`uppercase tracking-wide text-sm font-semibold mb-2 ${categoryColors} inline-block px-2 py-1 rounded-md`}>
                    {category}
                </div>
                <div className="mt-4 mb-8">
                    <p className="text-3xl font-bold text-center">{question}</p>
                </div>
                <div className="flex justify-between gap-4">
                    <button
                        onClick={onSkip}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Skip
                    </button>
                    <button
                        onClick={onCorrect}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Correct
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard; 