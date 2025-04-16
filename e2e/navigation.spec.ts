import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate to the setup page', async ({ page }) => {
        // Start from the home page
        await page.goto('/');

        // Verify page title indicates we're on the home page
        await expect(page).toHaveTitle(/ArticuLITE/);

        // Find and click the setup/play button
        const setupButton = page.getByRole('button', { name: /play/i });

        // Take a screenshot before clicking
        await page.screenshot({ path: 'setup-page-before-click.png' });

        // Click the button
        await setupButton.click();

        // After navigation, check if we're on the setup page
        await expect(page).toHaveURL(/.*setup/);

        // Screenshot after navigation
        await page.screenshot({ path: 'after-navigation.png' });

        // Verify the setup page has team configuration options
        const teamSection = page.getByText(/teams/i);
        await expect(teamSection).toBeVisible();
    });

    test('should require password if enabled', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Try to access a protected route directly
        await page.goto('/game');

        // Check if we're redirected to login or see a password field
        try {
            const passwordField = page.getByPlaceholder(/password/i);
            await expect(passwordField).toBeVisible();
            await page.screenshot({ path: 'password-protection.png' });
        } catch (e) {
            // If no password field, we should at least not be on the game page
            await expect(page).not.toHaveURL(/.*game/);
            await page.screenshot({ path: 'navigation-error.png' });
        }
    });
}); 