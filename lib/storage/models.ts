/**
 * Data models for local storage system
 * These types define the structure of data stored in localStorage
 */

/**
 * Game phases
 */
export enum GamePhase {
    Setup = 'setup',
    Question = 'question',
    TurnSummary = 'turn-summary',
    GameEnd = 'game-end'
}

/**
 * Team data model
 */
export interface Team {
    id: number;
    name: string;
    color: string;
    score: number;
    players?: Array<{ name: string }>;
}

/**
 * Question data model
 */
export interface Question {
    id: string;
    category: string;
    text: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    used: boolean;
}

/**
 * Turn data model representing a single player's turn
 */
export interface Turn {
    id: string;
    teamId: number;
    startTime: number;
    endTime?: number;
    questions: {
        questionId: string;
        answered: boolean;
        skipped: boolean;
        timeSpent?: number;
    }[];
}

/**
 * Game settings data model
 */
export interface GameSettings {
    timeLimit: number;
    winningScore: number;
    questionsPerTurn: number;
    skipPenalty: number;
    categories: string[];
    useTimer: boolean;
}

/**
 * Game state data model
 */
export interface GameState {
    id: string;
    created: number;
    lastUpdated: number;
    isActive: boolean;
    currentTurn?: string; // ID of current turn
    currentTeamIndex: number;
    teams: Team[];
    turns: Turn[];
    questions: Question[];
    settings: GameSettings;
    winningTeam?: number; // ID of winning team if game is finished
}

/**
 * Versioned storage container
 * Wraps any data with version information for future migrations
 */
export interface VersionedStorage<T> {
    version: string;
    data: T;
    timestamp: number;
}

/**
 * All storage items with their respective keys and data types
 */
export enum StorageKeys {
    CURRENT_GAME = 'articulate:current_game',
    GAME_HISTORY = 'articulate:game_history',
    USER_SETTINGS = 'articulate:user_settings',
    AUTH_TOKEN = 'articulate:auth_token',
    OPENAI_CONFIG = 'articulate:openai_config',
    TOKEN_USAGE = 'articulate:token_usage',
    QUESTION_CACHE = 'articulate:question_cache'
}

/**
 * User settings data model
 */
export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    notifications: boolean;
}

/**
 * Game history entry
 */
export interface GameHistoryEntry {
    id: string;
    date: number;
    teams: Array<{
        id: number;
        name: string;
        score: number;
    }>;
    winnerId: number;
    duration: number;
} 