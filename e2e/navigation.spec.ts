import { test, expect } from './fixtures';

test.describe('Navigation', () => {
    test('should navigate to the setup page from home', async ({ articulate, page }) => {
        // Start from the home page
        await articulate.goto();

        // Verify page title indicates we're on the home page
        await expect(page).toHaveTitle(/ArticuLITE/);

        // Find and click the setup/play button
        await articulate.playButton.click();

        // After navigation, check if we're on the setup page
        await expect(page).toHaveURL(/.*setup/);

        // Verify the setup page has team configuration options
        await expect(articulate.teamNameInputs.first()).toBeVisible();
        await expect(articulate.teamNameInputs).toHaveCount(2); // By default, the app should show 2 team inputs
        await expect(articulate.addTeamButton).toBeVisible();
        await expect(articulate.timeSelector).toBeVisible();
    });

    test('should require password if enabled', async ({ articulate, page }) => {
        // Try to access a protected route directly
        await articulate.gotoGame();

        // Check if we're redirected to login or see a password field
        const passwordField = await page.getByPlaceholder(/password/i);
        await expect(passwordField).toBeVisible();

        // Verify we're not on the game page
        await expect(page).not.toHaveURL(/.*game/);

        // Verify login form components are visible
        await expect(articulate.enterGameButton).toBeVisible();
        await expect(page.getByText(/game access/i)).toBeVisible();
    });

    test('should allow navigating back to home from setup', async ({ articulate, page }) => {
        // Go to setup page
        await articulate.gotoSetup();

        // Find and click the back button/link
        const backLink = page.getByRole('link', { name: /back/i });
        await backLink.click();

        // Verify we're back on the home page
        await expect(page).toHaveURL(/\/$/); // Root URL
        await expect(page.getByText(/articulate/i)).toBeVisible();
    });
}); 