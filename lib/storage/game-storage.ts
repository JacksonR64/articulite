/**
 * Game-specific storage service
 * Handles game state persistence and retrieval
 */

import { GameState, GameHistoryEntry, StorageKeys, Team, UserSettings } from './models';
import { storeData, retrieveData, removeData } from './utils';

/**
 * Default game settings
 */
const DEFAULT_GAME_SETTINGS = {
    timeLimit: 30,
    winningScore: 30,
    categories: ['Object', 'Nature', 'Action', 'World', 'Person', 'Random'],
    useTimer: true
};

/**
 * Default user settings
 */
const DEFAULT_USER_SETTINGS: UserSettings = {
    theme: 'system',
    soundEnabled: true,
    notifications: true
};

/**
 * Initialize a new game state
 * @param teams Initial teams
 * @returns The new game state
 */
export function initializeGame(teams: Team[]): GameState {
    const gameState: GameState = {
        id: generateId(),
        created: Date.now(),
        lastUpdated: Date.now(),
        isActive: true,
        currentTeamIndex: 0,
        teams,
        turns: [],
        questions: [],
        settings: DEFAULT_GAME_SETTINGS
    };

    saveGameState(gameState);
    return gameState;
}

/**
 * Save the current game state
 * @param gameState The game state to save
 * @returns boolean indicating if the operation was successful
 */
export function saveGameState(gameState: GameState): boolean {
    gameState.lastUpdated = Date.now();
    return storeData(StorageKeys.CURRENT_GAME, gameState);
}

/**
 * Load the current game state
 * @returns The current game state or null if none exists
 */
export function loadGameState(): GameState | null {
    return retrieveData<GameState | null>(StorageKeys.CURRENT_GAME, null);
}

/**
 * End the current game and add it to history
 * @param gameState The game state to end
 * @param winningTeamId The ID of the winning team
 * @returns boolean indicating if the operation was successful
 */
export function endGame(gameState: GameState, winningTeamId: number): boolean {
    // Update game state to inactive and set winning team
    gameState.isActive = false;
    gameState.winningTeam = winningTeamId;
    gameState.lastUpdated = Date.now();

    // Save final game state
    const saveResult = saveGameState(gameState);

    // Add to game history
    const history = loadGameHistory();
    const duration = gameState.lastUpdated - gameState.created;

    const historyEntry: GameHistoryEntry = {
        id: gameState.id,
        date: gameState.lastUpdated,
        teams: gameState.teams.map(team => ({
            id: team.id,
            name: team.name,
            score: team.score
        })),
        winnerId: winningTeamId,
        duration
    };

    history.push(historyEntry);
    storeData(StorageKeys.GAME_HISTORY, history);

    return saveResult;
}

/**
 * Load game history
 * @returns Array of game history entries
 */
export function loadGameHistory(): GameHistoryEntry[] {
    return retrieveData<GameHistoryEntry[]>(StorageKeys.GAME_HISTORY, []);
}

/**
 * Clear the current game state
 * @returns boolean indicating if the operation was successful
 */
export function clearGameState(): boolean {
    return removeData(StorageKeys.CURRENT_GAME);
}

/**
 * Save user settings
 * @param settings The user settings to save
 * @returns boolean indicating if the operation was successful
 */
export function saveUserSettings(settings: UserSettings): boolean {
    return storeData(StorageKeys.USER_SETTINGS, settings);
}

/**
 * Load user settings
 * @returns The user settings
 */
export function loadUserSettings(): UserSettings {
    return retrieveData<UserSettings>(StorageKeys.USER_SETTINGS, DEFAULT_USER_SETTINGS);
}

/**
 * Generate a random ID for games and turns
 * @returns A random ID
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
} 