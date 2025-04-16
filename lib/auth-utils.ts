/**
 * Authentication utilities for password hashing and validation
 */

// Since this is a client-side only app, we use a simple hashing technique
// In a real app with a backend, you would use a secure server-side hashing solution
const hashPassword = (password: string): string => {
    let hash = 0;
    if (password.length === 0) return hash.toString();

    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString();
};

// Fixed game password hash (for demo purposes)
// In a real app, this would be stored securely, possibly as an env variable
const GAME_PASSWORD_HASH = '93652012'; // hash of 'bh123'

/**
 * Validates password against stored hash
 * @param password User-entered password to validate
 * @returns Boolean indicating if password is valid
 */
export const validatePassword = (password: string): boolean => {
    const hashedInput = hashPassword(password);
    return hashedInput === GAME_PASSWORD_HASH;
};

/**
 * Creates a new JWT-like token for the session
 * This is a simplified version for demo purposes
 */
export const createSessionToken = (): string => {
    const tokenData = {
        id: Math.random().toString(36).substring(2, 15),
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        authenticated: true
    };

    return btoa(JSON.stringify(tokenData));
};

/**
 * Verifies if a session token is valid
 * @param token The session token to verify
 * @returns Boolean indicating if token is valid and not expired
 */
export const verifySessionToken = (token: string): boolean => {
    try {
        const tokenData = JSON.parse(atob(token));
        return tokenData.authenticated && tokenData.exp > Date.now();
    } catch (e) {
        return false;
    }
};

/**
 * Helper to create consistent auth storage keys
 */
export const AUTH_STORAGE_KEY = 'articulate_auth_token'; 