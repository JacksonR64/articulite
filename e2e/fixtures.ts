import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Define the Articulate class with page objects and helper methods
class Articulate {
    readonly page: Page;

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

    constructor(page: Page) {
        this.page = page;

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
        await this.page.goto('/');
    }

    async gotoSetup() {
        await this.page.goto('/setup');
    }

    async gotoGame() {
        await this.page.goto('/game');
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
        await this.startGameButton.click();
        // Wait for game page to load
        await this.page.waitForURL('**/game');
        await this.correctButton.waitFor();
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

// Create a test fixture that extends the base test with our Articulate helper
export const test = base.extend<{ articulate: Articulate }>({
    articulate: async ({ page }, use) => {
        const articulate = new Articulate(page);
        await use(articulate);
    },
});

// Export expect so it can be imported from our fixture file
export { expect };
export { Articulate }; 