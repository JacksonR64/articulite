import { test, expect } from './fixtures';

/**
 * End-to-end tests for the Tabletop Companion Mode feature
 */
test('Tabletop mode toggle functionality', async ({ articulate, page }) => {
    // Navigate to the game page
    await articulate.gotoGamePage();

    // Wait for content to be loaded
    await page.waitForSelector('.container');

    // Set tabletop mode to true in localStorage to simulate existing setting
    await page.evaluate(() => {
        localStorage.setItem('tabletopMode', 'true');
        // Reload to apply the changes
        window.location.reload();
    });

    // Wait for tabletop layout to be visible
    await page.waitForSelector('text=Tabletop Companion');

    // Verify tabletop mode elements
    const tabletopTitle = await page.locator('text=Tabletop Companion');
    expect(await tabletopTitle.isVisible()).toBe(true);

    // Check if toggle is in tabletop mode
    const toggle = await page.getByRole('switch', { checked: true });
    expect(await toggle.isVisible()).toBe(true);

    // Toggle to digital mode
    await toggle.click();

    // Verify we're now in digital mode - search for digital mode content
    await page.waitForSelector('text=Digital Mode Active');
    const digitalModeText = await page.locator('text=Digital Mode Active');
    expect(await digitalModeText.isVisible()).toBe(true);

    // Check "Switch to Tabletop Mode" button exists
    const switchButton = await page.getByRole('button', { name: 'Switch to Tabletop Mode' });
    expect(await switchButton.isVisible()).toBe(true);

    // Toggle back to tabletop mode using the button
    await switchButton.click();

    // Verify we're back in tabletop mode
    await page.waitForSelector('text=Tabletop Settings');
    const settingsButton = await page.getByRole('button', { name: 'Tabletop Settings' });
    expect(await settingsButton.isVisible()).toBe(true);
});

test('Tabletop settings functionality', async ({ articulate, page }) => {
    // Setup tabletop mode
    await articulate.gotoGamePage();
    await page.evaluate(() => {
        localStorage.setItem('tabletopMode', 'true');
        localStorage.setItem('isTabletopMode', 'true');
        // Set default settings
        localStorage.setItem('tabletopSettings', JSON.stringify({
            showBoardVisualization: true,
            enableSoundEffects: true,
            showTurnInstructions: true,
            turnTimerEnabled: true,
            autoAdvanceToNextTeam: false
        }));
        window.location.reload();
    });

    // Wait for tabletop layout
    await page.waitForSelector('text=Tabletop Settings');

    // Open settings modal
    const settingsButton = await page.getByRole('button', { name: 'Tabletop Settings' });
    await settingsButton.click();

    // Wait for settings modal
    await page.waitForSelector('text=Tabletop Mode Settings');

    // Toggle a setting (Show Board Visualization)
    const toggles = await page.getByRole('switch').all();
    await toggles[0].click();

    // Save settings
    const saveButton = await page.getByRole('button', { name: 'Save Settings' });
    await saveButton.click();

    // Verify settings modal is closed
    await expect(page.locator('text=Tabletop Mode Settings')).not.toBeVisible();

    // Verify board visualization is now hidden
    await expect(page.locator('text=Board Visualization')).not.toBeVisible();

    // Reload page to verify settings are persisted
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify board visualization is still hidden after reload
    await expect(page.locator('text=Board Visualization')).not.toBeVisible();
});

test('Tabletop mode displays game elements correctly', async ({ articulate, page }) => {
    // Setup tabletop mode
    await articulate.gotoGamePage();
    await page.evaluate(() => {
        localStorage.setItem('tabletopMode', 'true');
        localStorage.setItem('isTabletopMode', 'true');
        window.location.reload();
    });

    // Wait for tabletop layout
    await page.waitForSelector('text=Tabletop Companion');

    // Verify question card is visible
    const questionCard = await page.locator('.rounded-xl.shadow-md.overflow-hidden');
    expect(await questionCard.isVisible()).toBe(true);

    // Verify category is displayed
    const category = await page.locator('.uppercase.tracking-wide.text-sm.font-semibold');
    expect(await category.isVisible()).toBe(true);

    // Check if correct and skip buttons are present
    const correctButton = await page.getByRole('button', { name: 'Correct' });
    const skipButton = await page.getByRole('button', { name: 'Skip' });

    expect(await correctButton.isVisible()).toBe(true);
    expect(await skipButton.isVisible()).toBe(true);

    // Test answering a question
    await correctButton.click();

    // Verify the answer was recorded
    const correctAnswers = await page.locator('text=Correct Answers: 1');
    expect(await correctAnswers.isVisible()).toBe(true);

    // Test skipping a question
    await skipButton.click();

    // Verify the skip was recorded
    const skippedQuestions = await page.locator('text=Skipped: 1');
    expect(await skippedQuestions.isVisible()).toBe(true);
}); 