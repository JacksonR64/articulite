/**
 * Utility for generating unique IDs for game entities
 */

/**
 * Generates a unique ID with an optional prefix
 * @param prefix Optional string prefix for the ID
 * @returns A unique ID string
 */
export function generateId(prefix?: string): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);

    return prefix
        ? `${prefix}_${timestamp}_${randomStr}`
        : `${timestamp}_${randomStr}`;
} 