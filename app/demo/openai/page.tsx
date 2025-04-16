import { Metadata } from 'next';
import Link from 'next/link';
import { QuestionGenerator } from '@/components/game';
import { ApiKeyManager } from '@/components/settings';
import { DEFAULT_CATEGORIES } from '@/lib/api/questions';

// SEO metadata
export const metadata: Metadata = {
  title: 'OpenAI Demo | Articulate!',
  description: 'Demo page for testing OpenAI integration for question generation',
};

/**
 * OpenAI Demo Page
 * This page demonstrates the OpenAI integration for question generation
 */
export default function OpenAIDemo() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">OpenAI Integration Demo</h1>
        
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            To test the OpenAI integration, you need to provide your API key below.
            This key will be stored securely in your browser&apos;s local storage.
          </p>
          
          <ApiKeyManager />
        </div>
        
        <div className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Question Generation</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Click the buttons below to generate questions for different categories.
            Generated questions will be cached in localStorage for future use.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {DEFAULT_CATEGORIES.map((category) => (
              <div key={category} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <QuestionGenerator 
                  category={category} 
                  count={5}
                  onQuestionsGenerated={(questions) => {
                    console.log(`Generated ${questions.length} questions for ${category}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 