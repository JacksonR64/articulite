import { test, expect } from './fixtures';

/**
 * Simple focused test to check if the Start Game button works
 */
test('Setup page button click test', async ({ articulate, page }) => {
    // Step 1: Navigate to setup page
    console.log('1. Navigating to setup page');
    await articulate.gotoSetup();
    await expect(page).toHaveURL(/.*setup/);

    // Take a screenshot for verification
    await page.screenshot({ path: 'setup-page-before-click.png' });

    // Step 2: Look for Start Game button
    console.log('2. Looking for the Start Game button');
    const startGameButton = page.getByRole('button', { name: /start game/i });

    // Check if button is visible
    const isButtonVisible = await startGameButton.isVisible();
    console.log(`Start Game button visible: ${isButtonVisible}`);

    if (!isButtonVisible) {
        console.log('Button not visible, looking for all buttons on the page:');
        const allButtons = await page.locator('button').all();
        for (let i = 0; i < allButtons.length; i++) {
            const text = await allButtons[i].textContent();
            console.log(`Button ${i + 1}: "${text?.trim()}"`);
        }
        test.fail(true, 'Start Game button not found');
        return;
    }

    // Step 3: Click the button
    console.log('3. Clicking the Start Game button');
    await startGameButton.click({ force: true });
    console.log('Click performed');

    // Small delay to allow navigation to happen
    await page.waitForTimeout(2000);

    // Step 4: Check if navigation occurred
    const currentUrl = page.url();
    console.log(`4. Current URL after clicking: ${currentUrl}`);

    // Check if we navigated to game page
    const navigatedToGame = currentUrl.includes('/game');
    console.log(`Navigated to game page: ${navigatedToGame}`);

    if (!navigatedToGame) {
        console.log('5. Navigation failed, taking screenshot');
        await page.screenshot({ path: 'setup-page-after-click.png' });
    }

    // Final assertion
    expect(navigatedToGame).toBe(true);
}); 