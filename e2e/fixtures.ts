import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Try to get the baseUrl from test config
let baseUrl = 'http://localhost:3333';
try {
    const configPath = path.join(__dirname, 'test-config.json');
    if (existsSync(configPath)) {
        const configJson = JSON.parse(readFileSync(configPath, 'utf8'));
        baseUrl = configJson.baseUrl || baseUrl;
    }
} catch (error) {
    console.warn('Failed to read test config, using default baseUrl:', baseUrl);
}

// Define the Articulate class with page objects and helper methods
class Articulate {
    readonly page: Page;
    readonly baseUrl: string;

    // Page objects
    playButton: any;
    teamNameInputs: any;
    timeSelector: any;
    gameModeRadios: any;
    startGameButton: any;
    addTeamButton: any;
    questionCard: any;
    correctButton: any;
    skipButton: any;
    activeTeamIndicator: any;
    timerElement: any;
    enterGameButton: any;

    constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
        this.page = page;
        this.baseUrl = baseUrl;

        // Initialize page objects
        this.playButton = page.getByRole('button', { name: /play/i });
        this.teamNameInputs = page.getByPlaceholder(/team name/i);
        this.timeSelector = page.getByRole('combobox', { name: /time limit/i });
        this.gameModeRadios = {
            tabletopCompanion: page.getByLabel(/tabletop companion/i),
            wordDatabase: page.getByLabel(/word database/i)
        };
        this.startGameButton = page.getByRole('button', { name: /start game/i });
        this.addTeamButton = page.getByRole('button', { name: /add team/i });
        this.enterGameButton = page.getByRole('button', { name: /enter/i });

        // Game page objects
        this.questionCard = page.getByTestId('question-card');
        this.correctButton = page.getByRole('button', { name: /correct/i });
        this.skipButton = page.getByRole('button', { name: /skip/i });
        this.activeTeamIndicator = page.getByTestId('active-team');
        this.timerElement = page.getByTestId('timer');
    }

    // Navigation methods
    async goto() {
        console.log(`Navigating to ${this.baseUrl}`);
        await this.page.goto(this.baseUrl);
    }

    async gotoSetup() {
        console.log(`Navigating to ${this.baseUrl}/setup`);
        await this.page.goto(`${this.baseUrl}/setup`);
    }

    async gotoGame() {
        console.log(`Navigating to ${this.baseUrl}/game`);
        await this.page.goto(`${this.baseUrl}/game`);
    }

    // Setup helper methods
    async setupTeams(teamNames: string[]) {
        // Wait for team inputs to be visible
        await this.teamNameInputs.first().waitFor();

        // Fill in the first two team names
        await this.teamNameInputs.nth(0).fill(teamNames[0]);
        await this.teamNameInputs.nth(1).fill(teamNames[1]);

        // Add additional teams if needed
        for (let i = 2; i < teamNames.length; i++) {
            await this.addTeamButton.click();
            await this.teamNameInputs.nth(i).fill(teamNames[i]);
        }
    }

    async selectTimeLimit(seconds: string) {
        await this.timeSelector.selectOption(seconds);
    }

    async selectGameMode(mode: 'tabletop' | 'database') {
        if (mode === 'tabletop') {
            await this.gameModeRadios.tabletopCompanion.check();
        } else {
            await this.gameModeRadios.wordDatabase.check();
        }
    }

    async startGame() {
        console.log('Clicking Start Game button');
        await this.startGameButton.click();

        // Wait for game page to load
        console.log('Waiting for navigation to game page');
        await this.page.waitForURL('**/game');

        // Wait for UI to be ready
        console.log('Waiting for game UI to be ready');
        await this.correctButton.waitFor();
        console.log('Game started successfully');
    }

    // Game helper methods
    async playTurn(answerType: 'correct' | 'skip') {
        if (answerType === 'correct') {
            await this.correctButton.click();
        } else {
            await this.skipButton.click();
        }

        // Wait a short time for the UI to update
        await this.page.waitForTimeout(300);
    }

    async endTurn() {
        const nextTurnButton = this.page.getByRole('button', { name: /next turn/i });
        await nextTurnButton.click();
    }

    async endGame() {
        const endGameButton = this.page.getByRole('button', { name: /end game/i });
        if (await endGameButton.isVisible()) {
            await endGameButton.click();
        }
    }

    async getTeamScore(teamName: string) {
        const teamScore = this.page.getByTestId(`${teamName.toLowerCase().replace(/\s+/g, '-')}-score`);
        const scoreText = await teamScore.textContent();
        return parseInt(scoreText || '0');
    }

    async getActiveTeam() {
        const activeTeamText = await this.activeTeamIndicator.textContent();
        return activeTeamText?.trim() || '';
    }

    async getTimeRemaining() {
        const timerText = await this.timerElement.textContent();
        // Extract numeric time value from the text (assuming format like "Time: 45s")
        const timeMatch = timerText?.match(/\d+/);
        return timeMatch ? parseInt(timeMatch[0]) : 0;
    }
}

// Helper to ensure the server is running before tests start
async function ensureServerRunning() {
    const serverScript = path.join(rootDir, 'scripts', 'manage-server.js');

    console.log('Checking if server is already running...');

    // Try to access the server
    try {
        const response = await fetch(baseUrl, { method: 'HEAD' });
        if (response.ok) {
            console.log(`Server is already running at ${baseUrl}`);
            return;
        }
    } catch (error) {
        console.log('Server is not running, starting it...');
    }

    // Start the server
    return new Promise<void>((resolve, reject) => {
        const serverProcess = spawn('node', [serverScript, 'start'], {
            stdio: 'inherit',
            shell: true,
        });

        // Wait for server to start (giving it 15 seconds)
        let isResolved = false;
        const timeout = setTimeout(() => {
            if (!isResolved) {
                console.error('Server failed to start within timeout');
                isResolved = true;
                reject(new Error('Server startup timeout'));
            }
        }, 15000);

        // Check periodically if server is up
        const checkInterval = setInterval(async () => {
            try {
                const response = await fetch(baseUrl, { method: 'HEAD' });
                if (response.ok) {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    if (!isResolved) {
                        isResolved = true;
                        console.log(`Server started successfully at ${baseUrl}`);
                        resolve();
                    }
                }
            } catch (error) {
                // Server not ready yet, continue waiting
            }
        }, 1000);

        // Handle server process exit
        serverProcess.on('exit', (code) => {
            if (code !== 0 && !isResolved) {
                clearInterval(checkInterval);
                clearTimeout(timeout);
                isResolved = true;
                reject(new Error(`Server process exited with code ${code}`));
            }
        });
    });
}

// Extend the test context to include custom utilities
interface ArticulateUtils {
    // Navigation helpers
    gotoHome: () => Promise<void>;
    gotoSetup: () => Promise<void>;
    gotoAuth: () => Promise<void>;
    gotoGamePage: () => Promise<void>;

    // Auth helpers
    login: (password?: string) => Promise<void>;
}

// Create a fixture for Articulate app testing
export const test = base.extend<{ articulate: ArticulateUtils }>({
    // Ensure server is running before all tests
    page: async ({ page }, use) => {
        try {
            await ensureServerRunning();
        } catch (error) {
            console.warn('Warning: Failed to ensure server is running:', error);
        }
        await use(page);
    },

    articulate: async ({ page }, use) => {
        // Define the base URL
        const baseURL = 'http://localhost:3333';

        // Utility functions
        const articulate: ArticulateUtils = {
            // Navigation
            gotoHome: async () => {
                await page.goto(baseURL);
            },

            gotoSetup: async () => {
                await page.goto(`${baseURL}/setup`);
            },

            gotoAuth: async () => {
                await page.goto(`${baseURL}/auth`);
            },

            gotoGamePage: async () => {
                // Need to set up localStorage with necessary game settings first
                await page.goto(baseURL);

                // Set up minimum game settings required to access the game page
                await page.evaluate(() => {
                    localStorage.setItem('gameSettings', JSON.stringify({
                        timeLimit: 30,
                        winningScore: 30,
                        useTimer: true,
                        allowSkips: true,
                        maxSkipsPerTurn: 3
                    }));

                    // Mock authentication
                    localStorage.setItem('auth_token', 'test-token');
                });

                // Now navigate to game page
                await page.goto(`${baseURL}/game`);
            },

            // Auth helpers
            login: async (password = 'articulate') => {
                await page.goto(`${baseURL}/auth`);
                await page.fill('input[type="password"]', password);
                await page.click('button[type="submit"]');
            }
        };

        await use(articulate);
    },
});

// Export expect so it can be imported from our fixture file
export { expect };
export { Articulate }; 