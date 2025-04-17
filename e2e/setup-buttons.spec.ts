import { test, expect } from './fixtures';

/**
 * This test file focuses specifically on testing button functionality
 * on the setup page, with special attention to the Start Game button
 * which has been reported as not working properly.
 */
test.describe('Setup Page Buttons', () => {
    // Navigate to setup page before each test
    test.beforeEach(async ({ articulate }) => {
        await articulate.goto();
        await articulate.playButton.click();
        await expect(articulate.page).toHaveURL(/.*setup/);
    });

    test('Add Team button correctly adds new team inputs', async ({ articulate }) => {
        // Check initial team count
        await expect(articulate.teamNameInputs).toHaveCount(2);

        // Test clicking Add Team button multiple times
        for (let i = 0; i < 3; i++) {
            const currentCount = i + 2; // Starting with 2 teams
            await articulate.addTeamButton.click();
            await expect(articulate.teamNameInputs).toHaveCount(currentCount + 1);
        }

        // Verify maximum of 6 teams (if there's a limit)
        if (await articulate.addTeamButton.isVisible()) {
            await articulate.addTeamButton.click();
            await expect(articulate.teamNameInputs).toHaveCount(6);

            // Verify button is hidden/disabled at max teams
            const isDisabled = await articulate.addTeamButton.isDisabled();
            const isHidden = !(await articulate.addTeamButton.isVisible());
            expect(isDisabled || isHidden).toBeTruthy();
        }
    });

    test('Remove Team buttons work correctly', async ({ articulate, page }) => {
        // First add teams
        await articulate.addTeamButton.click();
        await articulate.addTeamButton.click();
        await expect(articulate.teamNameInputs).toHaveCount(4);

        // Find all remove buttons
        const removeButtons = page.getByRole('button', { name: /remove/i });

        // Click the last remove button
        await removeButtons.last().click();
        await expect(articulate.teamNameInputs).toHaveCount(3);

        // Click another remove button
        await removeButtons.nth(1).click();
        await expect(articulate.teamNameInputs).toHaveCount(2);

        // Verify we can't remove teams when at minimum (2)
        const remainingRemoveButtons = page.getByRole('button', { name: /remove/i });
        if (await remainingRemoveButtons.count() > 0) {
            await remainingRemoveButtons.first().click();
            // Should still have 2 teams (minimum)
            await expect(articulate.teamNameInputs).toHaveCount(2);
        }
    });

    test('Show/Hide Player Management button toggles player section', async ({ articulate, page }) => {
        // Find the player management toggle button
        const playerManagementButton = page.getByRole('button', { name: /(manage|hide) players/i });

        // Initially player management should be hidden
        const playerManagementSection = page.getByText(/player management/i);
        await expect(playerManagementSection).not.toBeVisible();

        // Click to show
        await playerManagementButton.click();
        await expect(playerManagementSection).toBeVisible();

        // Click to hide
        await playerManagementButton.click();
        await expect(playerManagementSection).not.toBeVisible();
    });

    test('Advanced Options button toggles options section', async ({ articulate, page }) => {
        // Find the advanced options toggle button
        const advancedOptionsButton = page.getByRole('button', { name: /(show|hide) advanced options/i });

        // Check initial state (should be hidden)
        const questionCacheSection = page.getByTestId('question-preloader');
        await expect(questionCacheSection).not.toBeVisible();

        // Click to show
        await advancedOptionsButton.click();
        await expect(questionCacheSection).toBeVisible();

        // Click to hide
        await advancedOptionsButton.click();
        await expect(questionCacheSection).not.toBeVisible();
    });

    test('Back to Home button navigates to home page', async ({ articulate, page }) => {
        // Find and click the back button
        const backButton = page.getByRole('link', { name: /back to home/i });
        await backButton.click();

        // Verify navigation to home page
        await expect(page).toHaveURL('/');
    });

    test('Start Game button navigates to game page with valid team names', async ({ articulate, page }) => {
        // Set up valid team names
        await articulate.setupTeams(['Team Alpha', 'Team Beta']);

        // Debug logging to verify state before clicking Start Game
        console.log('Team names entered, about to click Start Game button');

        // Click Start Game with extra debugging and wait
        await articulate.startGameButton.click();

        // Debug logging after click
        console.log('Start Game button clicked, checking URL');

        // Add a small wait to see if navigation happens
        await page.waitForTimeout(1000);

        // Check current URL
        const currentUrl = page.url();
        console.log(`Current URL after clicking Start Game: ${currentUrl}`);

        // Verify navigation to game page
        await expect(page).toHaveURL(/.*game/);
    });

    test('Start Game button shows validation when team names are empty', async ({ articulate, page }) => {
        // Clear team names (or leave them empty)
        await articulate.teamNameInputs.first().fill('');
        await articulate.teamNameInputs.nth(1).fill('');

        // Click Start Game
        await articulate.startGameButton.click();

        // Verify error message appears
        const errorMessage = page.getByText(/team names are required/i);
        await expect(errorMessage).toBeVisible();

        // Verify we're still on setup page
        await expect(page).toHaveURL(/.*setup/);
    });

    test('Test Start Game button event propagation', async ({ articulate, page }) => {
        // Set up valid team names
        await articulate.setupTeams(['Team Alpha', 'Team Beta']);

        // Add explicit event monitoring
        await page.evaluate(() => {
            window.__buttonClicked = false;
            document.addEventListener('click', (e) => {
                if (e.target && (e.target as HTMLElement).textContent?.includes('Start Game')) {
                    console.log('Start Game button click captured in event listener');
                    window.__buttonClicked = true;
                }
            }, true);
        });

        // Click Start Game button
        await articulate.startGameButton.click();

        // Verify the click was registered
        const buttonClicked = await page.evaluate(() => window.__buttonClicked);
        expect(buttonClicked).toBeTruthy();

        // Verify navigation or check if there's a specific issue
        const currentUrl = page.url();
        console.log(`Current URL after clicking Start Game: ${currentUrl}`);

        // Check for any error messages
        const errorMessages = await page.locator('text=/error|failed|issue/i').count();
        if (errorMessages > 0) {
            console.log(`Found ${errorMessages} possible error messages on page after clicking Start Game`);
        }
    });
}); 