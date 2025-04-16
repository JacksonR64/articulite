import { test, expect } from './fixtures';

test.describe('Game Setup Flow', () => {
    test.beforeEach(async ({ articulate }) => {
        // Start from home page for each test
        await articulate.goto();
        // Click play button to navigate to setup page
        await articulate.playButton.click();
        // Verify we're on the setup page
        await expect(articulate.page).toHaveURL(/.*setup/);
    });

    test('configure teams and game settings', async ({ articulate, page }) => {
        // Setup team names
        const teamNames = ['Alpha Team', 'Omega Squad'];
        await articulate.setupTeams(teamNames);

        // Verify team names are entered correctly
        await expect(articulate.teamNameInputs.nth(0)).toHaveValue(teamNames[0]);
        await expect(articulate.teamNameInputs.nth(1)).toHaveValue(teamNames[1]);

        // Select time limit
        await articulate.selectTimeLimit('60');
        await expect(articulate.timeSelector).toHaveValue('60');

        // Select game mode
        await articulate.selectGameMode('database');
        await expect(articulate.gameModeRadios.wordDatabase).toBeChecked();

        // Start the game
        await articulate.startGameButton.click();

        // Verify redirect to game page
        await expect(page).toHaveURL(/.*game/);

        // Verify game page shows the correct team information
        const teamHeaderText = await page.getByRole('heading', { level: 1 }).textContent();
        expect(teamHeaderText).toContain(teamNames[0]);

        // Verify timer is set to correct value
        const timerText = await page.getByTestId('countdown-timer').textContent();
        expect(timerText).toContain('60');

        // Verify question card is displayed
        await expect(articulate.questionCard).toBeVisible();
    });

    test('validate team names', async ({ articulate, page }) => {
        // Try to start game with empty team names
        await articulate.startGameButton.click();

        // Verify error messages are displayed
        const errorMessage = page.getByText(/team names are required/i);
        await expect(errorMessage).toBeVisible();

        // Fill in team names
        const teamNames = ['Team Red', 'Team Blue'];
        await articulate.setupTeams(teamNames);

        // Start the game again
        await articulate.startGameButton.click();

        // Verify redirect to game page after filling valid names
        await expect(page).toHaveURL(/.*game/);
    });

    test('customize team count', async ({ articulate }) => {
        // Verify initial state has 2 teams
        await expect(articulate.teamNameInputs).toHaveCount(2);

        // Add a team
        await articulate.addTeamButton.click();
        await expect(articulate.teamNameInputs).toHaveCount(3);

        // Add another team
        await articulate.addTeamButton.click();
        await expect(articulate.teamNameInputs).toHaveCount(4);

        // Remove a team (using remove button next to the last team)
        const removeButtons = articulate.page.getByRole('button', { name: /remove team/i });
        await removeButtons.last().click();
        await expect(articulate.teamNameInputs).toHaveCount(3);

        // Add team names to all fields
        const teamNames = ['Team A', 'Team B', 'Team C'];
        await articulate.setupTeams(teamNames);

        // Verify all team names are set correctly
        for (let i = 0; i < teamNames.length; i++) {
            await expect(articulate.teamNameInputs.nth(i)).toHaveValue(teamNames[i]);
        }
    });
}); 