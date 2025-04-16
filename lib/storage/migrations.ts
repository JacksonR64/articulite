/**
 * Storage Migration Utilities
 * Handles migrating data between different storage versions
 */

import { VersionedStorage, GameState, StorageKeys } from './models';
import { CURRENT_VERSION } from './utils';

/**
 * Version mapping for major storage schema changes
 * When making breaking changes to the storage schema,
 * add a migration function here for each version transition
 */
const MIGRATIONS: Record<string, Record<string, (data: any) => any>> = {
    // Game state migrations
    [StorageKeys.CURRENT_GAME]: {
        // Example: migrate from version 0.9.0 to 1.0.0
        '0.9.0': (oldData: any): GameState => {
            console.log('Migrating game state from v0.9.0 to v1.0.0');

            // This is a sample migration - in a real app, you would
            // convert from the old data structure to the new one
            const newData: GameState = {
                ...oldData,
                // Add new required fields
                lastUpdated: oldData.lastUpdated || Date.now(),
                // Convert any changed structures
                teams: oldData.teams.map((team: any) => ({
                    ...team,
                    score: team.score || 0
                }))
            };

            return newData;
        }
    },

    // Add migrations for other storage keys as needed
};

/**
 * Check if a migration is needed for the given version and key
 * @param version The current version of the stored data
 * @param key The storage key
 * @returns boolean indicating if a migration is available
 */
export function hasMigration(version: string, key: StorageKeys): boolean {
    return (
        version !== CURRENT_VERSION &&
        MIGRATIONS[key] !== undefined &&
        MIGRATIONS[key][version] !== undefined
    );
}

/**
 * Migrate data from one version to another
 * @param versionedData The versioned data to migrate
 * @param key The storage key
 * @returns The migrated data with updated version, or the original if no migration is needed
 */
export function migrateData<T>(versionedData: VersionedStorage<any>, key: StorageKeys): VersionedStorage<T> {
    const { version, data } = versionedData;

    if (!hasMigration(version, key)) {
        // No migration needed or available
        return {
            ...versionedData,
            version: CURRENT_VERSION // Update version anyway
        };
    }

    try {
        // Apply the migration function
        const migratedData = MIGRATIONS[key][version](data);

        // Return updated versioned container
        return {
            version: CURRENT_VERSION,
            data: migratedData,
            timestamp: Date.now()
        };
    } catch (e) {
        console.error(`Migration error for key ${key} from version ${version}:`, e);

        // Return original with updated version to prevent repeated migration attempts
        return {
            ...versionedData,
            version: CURRENT_VERSION
        };
    }
} 