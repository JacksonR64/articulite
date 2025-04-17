import { Question } from '@/lib/storage';

/**
 * Get a random question for a specific category
 * This is a simplified implementation that doesn't depend on complex caching
 * to avoid errors during hydration.
 * 
 * @param category The category to get a question for
 * @returns A random question from the specified category
 */
export async function getRandomQuestion(category: string): Promise<Question> {
    try {
        // Normalize category name to match our expected format (first letter capitalized)
        const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        console.log(`Generating random question for category: ${normalizedCategory}`);

        // Templates for different categories
        const templates: Record<string, string[]> = {
            'Object': [
                "Describe a [item] without using the words [restriction]",
                "Explain what a [item] is to someone who's never seen one",
                "Describe the shape and function of a [item] without naming it"
            ],
            'Nature': [
                "Describe a [item] without using the words [restriction]",
                "Explain what makes a [item] unique without mentioning its appearance",
                "Describe the experience of encountering a [item] without visual terms"
            ],
            'Person': [
                "Describe what a [item] does without mentioning their workplace",
                "Explain the skills needed to be a [item] without naming their profession",
                "Describe a day in the life of a [item] without mentioning their job title"
            ],
            'Action': [
                "Describe [item] without moving the relevant body parts",
                "Explain how to [item] to someone who's never done it before",
                "Describe the feeling of [item] without mentioning physical sensations"
            ],
            'World': [
                "Describe [item] without mentioning its location or famous features",
                "Explain what makes [item] special without mentioning tourism",
                "Describe the culture of [item] without naming foods or traditions"
            ],
            'Random': [
                "Describe the concept of [item] without using technical terms",
                "Explain [item] to a 5-year-old child",
                "Describe how [item] affects everyday life without examples"
            ]
        };

        // Random items for each category
        const items: Record<string, string[]> = {
            'Object': [
                "chair", "table", "phone", "computer", "book", "pen", "watch"
            ],
            'Nature': [
                "mountain", "river", "ocean", "forest", "desert", "waterfall"
            ],
            'Person': [
                "doctor", "teacher", "chef", "artist", "musician", "athlete"
            ],
            'Action': [
                "running", "swimming", "dancing", "singing", "cooking", "climbing"
            ],
            'World': [
                "Tokyo", "New York", "Paris", "Amazon Rainforest", "Great Barrier Reef"
            ],
            'Random': [
                "time", "happiness", "friendship", "music", "knowledge", "freedom"
            ]
        };

        // Restrictions for certain categories
        const restrictions: Record<string, string[]> = {
            'Object': [
                "using it", "touching it", "purpose", "function", "common words"
            ],
            'Nature': [
                "size", "color", "location", "weather", "animals"
            ],
            'Person': [
                "job title", "workplace", "uniform", "tools", "education"
            ],
            'Action': [
                "body parts", "movement", "speed", "direction", "purpose"
            ],
            'World': [
                "location", "people", "landmarks", "famous for", "tourism"
            ],
            'Random': [
                "examples", "definitions", "explaining", "comparing", "common terms"
            ]
        };

        // Get random template
        const templates_for_category = templates[normalizedCategory] || templates["Random"];
        const template = templates_for_category[Math.floor(Math.random() * templates_for_category.length)];

        // Get random item
        const items_for_category = items[normalizedCategory] || items["Random"];
        const item = items_for_category[Math.floor(Math.random() * items_for_category.length)];

        // Get random restriction if the template needs it
        let restriction = "";
        if (template.includes("[restriction]")) {
            const restrictions_for_category = restrictions[normalizedCategory] || restrictions["Random"];
            restriction = restrictions_for_category[Math.floor(Math.random() * restrictions_for_category.length)];
        }

        // Create question text by replacing placeholders
        let text = template.replace("[item]", item);
        if (restriction) {
            text = text.replace("[restriction]", restriction);
        }

        // Create and return question
        return {
            id: `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            category: normalizedCategory,
            text,
            difficulty: "medium",
            used: false
        };
    } catch (error) {
        console.error(`Error getting random question for ${category}:`, error);

        // Generate a super basic fallback if everything else fails
        return {
            id: `fallback-${Date.now()}`,
            category,
            text: `Describe a ${category.toLowerCase()} without using its name`,
            difficulty: "medium",
            used: false
        };
    }
}

// Re-export as default
export default getRandomQuestion; 