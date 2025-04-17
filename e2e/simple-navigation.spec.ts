import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Tests', () => {
    test('navigate to home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/ArticuLITE/);
    });

    test('navigate to setup page', async ({ page }) => {
        await page.goto('/setup');
        await expect(page.getByRole('heading', { name: /Game Setup/i })).toBeVisible();
    });

    test('navigate to settings page', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
    });
}); 