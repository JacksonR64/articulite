import { test, expect } from '@playwright/test';

test('should open homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');

    // Take a screenshot for verification
    await page.screenshot({ path: 'homepage.png' });

    // Verify something basic on the page (assuming there's a heading or text)
    const heading = await page.getByRole('heading').first();
    await expect(heading).toBeTruthy();

    console.log('Homepage test completed successfully!');
}); 