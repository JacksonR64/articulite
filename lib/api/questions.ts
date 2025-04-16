/**
 * Question Generation Service
 * Handles generating questions with OpenAI and caching results
 */

import { v4 as uuidv4 } from 'uuid';
import { makeOpenAIRequest } from './openai';
import { StorageKeys, storeData, retrieveData, Question } from '@/lib/storage';

// Default categories
export const DEFAULT_CATEGORIES = [
    'Object',
    'Nature',
    'Person',
    'Action',
    'World',
    'Random'
];

/**
 * Cache structure for storing generated questions
 */
export interface QuestionCache {
    version: string;
    lastUpdated: number;
    categories: Record<string, Question[]>;
}

// Initial empty cache
const INITIAL_CACHE: QuestionCache = {
    version: '1.0.0',
    lastUpdated: Date.now(),
    categories: {}
};

/**
 * Get the question cache from storage
 * @returns The cached questions or an empty cache
 */
export function getQuestionCache(): QuestionCache {
    return retrieveData<QuestionCache>(StorageKeys.QUESTION_CACHE, INITIAL_CACHE);
}

/**
 * Save the question cache to storage
 * @param cache The cache to save
 */
export function saveQuestionCache(cache: QuestionCache): void {
    storeData(StorageKeys.QUESTION_CACHE, cache);
}

/**
 * Check if we have enough cached questions for a category
 * @param category The category to check
 * @param count The minimum number of questions needed
 * @returns Whether enough questions are cached
 */
export function hasCachedQuestions(category: string, count: number = 10): boolean {
    const cache = getQuestionCache();
    const questions = cache.categories[category] || [];
    return questions.filter(q => !q.used).length >= count;
}

/**
 * Get questions from the cache for a specific category
 * @param category The category to get questions for
 * @param count The number of questions to get
 * @returns An array of questions
 */
export function getCachedQuestions(category: string, count: number = 5): Question[] {
    const cache = getQuestionCache();
    const questions = cache.categories[category] || [];
    return questions.filter(q => !q.used).slice(0, count);
}

/**
 * Mark questions as used in the cache
 * @param questionIds The IDs of questions to mark as used
 */
export function markQuestionsAsUsed(questionIds: string[]): void {
    const cache = getQuestionCache();

    // Update used status for all categories
    Object.keys(cache.categories).forEach(category => {
        cache.categories[category] = cache.categories[category].map(question => {
            if (questionIds.includes(question.id)) {
                return { ...question, used: true };
            }
            return question;
        });
    });

    cache.lastUpdated = Date.now();
    saveQuestionCache(cache);
}

/**
 * Reset the used status of all questions in the cache
 */
export function resetQuestionUsage(): void {
    const cache = getQuestionCache();

    // Reset used status for all categories
    Object.keys(cache.categories).forEach(category => {
        cache.categories[category] = cache.categories[category].map(question => ({
            ...question,
            used: false
        }));
    });

    cache.lastUpdated = Date.now();
    saveQuestionCache(cache);
}

/**
 * Clear the entire question cache
 */
export function clearQuestionCache(): void {
    saveQuestionCache(INITIAL_CACHE);
}

/**
 * Generate the system prompt for question generation
 * @param category The category to generate questions for
 * @returns The system prompt text
 */
function getSystemPrompt(category: string): string {
    return `You are an assistant that generates creative and fun questions for the game "Articulate!" based on specified categories.

Category: ${category}

For the "${category}" category, generate questions that are:
- Clear and unambiguous
- Varied in difficulty (mix of easy, medium, hard)
- Family-friendly and appropriate for all ages
- Culturally diverse and inclusive
- Interesting and engaging

Your response should ONLY contain the questions in a JSON array format, with each question as a separate object containing "text" and "difficulty" fields. Do not include any additional text, explanations, or formatting.`;
}

/**
 * Generate the user prompt for question generation
 * @param count The number of questions to generate
 * @returns The user prompt text
 */
function getUserPrompt(count: number): string {
    return `Generate ${count} unique questions for the specified category.

Format your response as a valid JSON array like this:
[
  {"text": "Question text here", "difficulty": "easy"},
  {"text": "Another question here", "difficulty": "medium"},
  ...
]

Ensure each question is distinct and directly related to the category. Vary the difficulty levels approximately: 30% easy, 40% medium, 30% hard.`;
}

/**
 * Parse the OpenAI response into an array of questions
 * @param response The text response from OpenAI
 * @param category The category the questions belong to
 * @returns An array of formatted Question objects
 */
function parseQuestionResponse(response: string, category: string): Question[] {
    try {
        // Try to extract just the JSON part if there's surrounding text
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;

        const parsedData = JSON.parse(jsonString);

        if (!Array.isArray(parsedData)) {
            throw new Error('Response is not an array');
        }

        return parsedData.map(item => ({
            id: uuidv4(),
            category,
            text: item.text,
            difficulty: item.difficulty || 'medium',
            used: false
        }));
    } catch (error) {
        console.error('Failed to parse question response:', error);
        console.error('Raw response:', response);
        return [];
    }
}

/**
 * Generate questions for a specific category
 * @param category The category to generate questions for
 * @param count The number of questions to generate
 * @returns The generated questions
 */
export async function generateQuestions(
    category: string,
    count: number = 10
): Promise<Question[]> {
    // Check cache first
    if (hasCachedQuestions(category, count)) {
        return getCachedQuestions(category, count);
    }

    // Prepare the prompts
    const systemPrompt = getSystemPrompt(category);
    const userPrompt = getUserPrompt(count);

    try {
        // Make the API request
        const response = await makeOpenAIRequest([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);

        if (!response) {
            throw new Error('Empty response from OpenAI');
        }

        // Parse the response
        const questions = parseQuestionResponse(response, category);

        if (questions.length === 0) {
            throw new Error('Failed to parse questions from response');
        }

        // Update the cache
        const cache = getQuestionCache();
        cache.categories[category] = [
            ...(cache.categories[category] || []),
            ...questions
        ];
        cache.lastUpdated = Date.now();
        saveQuestionCache(cache);

        return questions;
    } catch (error) {
        console.error(`Error generating questions for ${category}:`, error);

        // Generate procedural random questions as fallback
        const randomQuestions = generateRandomQuestions(category, count);

        // Update the cache with random questions
        const cache = getQuestionCache();
        cache.categories[category] = [
            ...(cache.categories[category] || []),
            ...randomQuestions
        ];
        cache.lastUpdated = Date.now();
        saveQuestionCache(cache);

        return randomQuestions;
    }
}

/**
 * Generate random questions procedurally without using OpenAI
 * @param category The category to generate questions for
 * @param count The number of questions to generate
 * @returns Array of randomly generated questions
 */
function generateRandomQuestions(category: string, count: number): Question[] {
    const questions: Question[] = [];

    // Templates for different categories
    const templates: Record<string, string[]> = {
        'Object': [
            "Describe a [object] without using the words [restriction]",
            "Explain what a [object] is to someone who's never seen one",
            "Describe the shape and function of a [object] without naming it",
            "Explain how to use a [object] without mentioning its purpose",
            "Describe a [object] as if you're from another planet"
        ],
        'Nature': [
            "Describe a [nature] without using the words [restriction]",
            "Explain what makes a [nature] unique without mentioning its appearance",
            "Describe the experience of encountering a [nature] without visual terms",
            "Explain the life cycle of a [nature] without using scientific terms",
            "Describe the sound and feel of a [nature] without mentioning its environment"
        ],
        'Person': [
            "Describe what a [person] does without mentioning their workplace",
            "Explain the skills needed to be a [person] without naming their profession",
            "Describe a day in the life of a [person] without mentioning their job title",
            "Explain how someone becomes a [person] without mentioning education",
            "Describe what makes a great [person] without using job-related terms"
        ],
        'Action': [
            "Describe [action] without moving the relevant body parts",
            "Explain how to [action] to someone who's never done it before",
            "Describe the feeling of [action] without mentioning physical sensations",
            "Explain the purpose of [action] without mentioning its outcome",
            "Describe [action] as if you're teaching an alien"
        ],
        'World': [
            "Describe [place] without mentioning its location or famous features",
            "Explain what makes [place] special without mentioning tourism",
            "Describe the culture of [place] without naming foods or traditions",
            "Explain the history of [place] without mentioning dates or events",
            "Describe what you would experience visiting [place] without visual descriptions"
        ],
        'Random': [
            "Describe the concept of [concept] without using technical terms",
            "Explain [concept] to a 5-year-old child",
            "Describe how [concept] affects everyday life without examples",
            "Explain the importance of [concept] without mentioning benefits",
            "Describe how [concept] has changed over time without mentioning technology"
        ]
    };

    // Random items for each category
    const items: Record<string, string[]> = {
        'Object': [
            "chair", "table", "phone", "computer", "book", "pen", "watch", "lamp", "backpack",
            "headphones", "umbrella", "sunglasses", "wallet", "mirror", "television", "refrigerator",
            "toaster", "camera", "bicycle", "clock"
        ],
        'Nature': [
            "mountain", "river", "ocean", "forest", "desert", "waterfall", "volcano", "canyon",
            "beach", "lake", "island", "cave", "glacier", "reef", "jungle", "valley",
            "geyser", "tundra", "meadow", "swamp"
        ],
        'Person': [
            "doctor", "teacher", "chef", "artist", "musician", "athlete", "scientist", "writer",
            "engineer", "firefighter", "pilot", "architect", "photographer", "actor", "dancer",
            "programmer", "detective", "farmer", "astronaut", "veterinarian"
        ],
        'Action': [
            "running", "swimming", "dancing", "singing", "cooking", "climbing", "writing", "reading",
            "painting", "laughing", "jumping", "driving", "flying", "diving", "throwing",
            "catching", "building", "digging", "planting", "fishing"
        ],
        'World': [
            "Tokyo", "New York", "Paris", "Amazon Rainforest", "Great Barrier Reef", "Sahara Desert",
            "Antarctica", "Great Wall of China", "Grand Canyon", "Venice", "Mount Everest",
            "Rome", "London", "Cairo", "Sydney", "Rio de Janeiro", "Moscow", "Cape Town",
            "Mumbai", "Bangkok"
        ],
        'Random': [
            "time", "happiness", "friendship", "music", "knowledge", "freedom", "creativity", "memory",
            "communication", "celebration", "teamwork", "education", "innovation", "tradition",
            "progress", "competition", "diversity", "balance", "transformation", "identity"
        ]
    };

    // Restrictions for certain categories
    const restrictions: Record<string, string[]> = {
        'Object': [
            "using it", "touching it", "purpose", "function", "common words",
            "its name", "its size", "its color", "its material", "buying it"
        ],
        'Nature': [
            "size", "color", "location", "weather", "animals",
            "plants", "water", "rocks", "sky", "beautiful"
        ],
        'Person': [
            "job title", "workplace", "uniform", "tools", "education",
            "salary", "skills", "training", "experience", "colleagues"
        ],
        'Action': [
            "body parts", "movement", "speed", "direction", "purpose",
            "energy", "technique", "practice", "learning", "demonstrating"
        ],
        'World': [
            "location", "people", "landmarks", "famous for", "tourism",
            "language", "food", "weather", "history", "population"
        ],
        'Random': [
            "examples", "definitions", "explaining", "comparing", "common terms",
            "technical words", "simple terms", "analogies", "scenarios", "measurements"
        ]
    };

    // Difficulty levels
    const difficulties = ["easy", "medium", "hard"];

    // Generate random questions based on templates
    for (let i = 0; i < count; i++) {
        // Get random template
        const templates_for_category = templates[category] || templates["Random"];
        const template = templates_for_category[Math.floor(Math.random() * templates_for_category.length)];

        // Get random item
        const items_for_category = items[category] || items["Random"];
        const item = items_for_category[Math.floor(Math.random() * items_for_category.length)];

        // Get random restriction if the template needs it
        let restriction = "";
        if (template.includes("[restriction]")) {
            const restrictions_for_category = restrictions[category] || restrictions["Random"];
            restriction = restrictions_for_category[Math.floor(Math.random() * restrictions_for_category.length)];
        }

        // Create question text by replacing placeholders
        let text = template
            .replace("[object]", item)
            .replace("[nature]", item)
            .replace("[person]", item)
            .replace("[action]", item)
            .replace("[place]", item)
            .replace("[concept]", item);

        if (restriction) {
            text = text.replace("[restriction]", restriction);
        }

        // Assign random difficulty, weighted toward medium
        const random = Math.random();
        const difficulty = random < 0.3 ? "easy" : (random < 0.7 ? "medium" : "hard");

        // Add to questions array
        questions.push({
            id: uuidv4(),
            category,
            text,
            difficulty,
            used: false
        });
    }

    return questions;
}

/**
 * Generate questions for multiple categories in parallel
 * @param categories The categories to generate questions for
 * @param countPerCategory The number of questions per category
 * @returns Object mapping categories to their questions
 */
export async function generateQuestionsForCategories(
    categories: string[] = DEFAULT_CATEGORIES,
    countPerCategory: number = 10
): Promise<Record<string, Question[]>> {
    const results: Record<string, Question[]> = {};
    const failedCategories: string[] = [];

    // Generate questions for each category in parallel
    await Promise.allSettled(
        categories.map(async (category) => {
            try {
                const questions = await generateQuestions(category, countPerCategory);
                results[category] = questions;
            } catch (error) {
                console.error(`Failed to generate questions for ${category}:`, error);
                failedCategories.push(category);
            }
        })
    );

    // Log any failed categories
    if (failedCategories.length > 0) {
        console.warn(`Failed to generate questions for ${failedCategories.length} categories:`,
            failedCategories.join(', '));
    }

    return results;
}

/**
 * Force regeneration of questions by clearing the cache and generating new ones
 * @param categories The categories to regenerate questions for
 * @param countPerCategory The number of questions per category
 */
export async function forceRegenerateQuestions(
    categories: string[] = DEFAULT_CATEGORIES,
    countPerCategory: number = 10
): Promise<void> {
    // Clear the current cache first
    clearQuestionCache();

    // Then generate new questions for all categories
    try {
        await generateQuestionsForCategories(categories, countPerCategory);
        console.log(`Successfully regenerated questions for ${categories.length} categories`);
    } catch (error) {
        console.error("Error regenerating questions:", error);
    }
} 