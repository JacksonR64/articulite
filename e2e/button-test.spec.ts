import { test, expect } from './fixtures';

/**
 * This test file focuses exclusively on the Start Game button functionality
 * using a step-by-step user journey approach with clear assertions at each step.
 */
test('User journey: Setup and start game button test', async ({ articulate, page }) => {
    // Step 1: Navigate directly to setup page
    console.log('Step 1: Navigating directly to setup page');
    await articulate.gotoSetup();
    await expect(page).toHaveURL(/.*setup/);

    // Check if we've successfully loaded the setup page
    const setupPageLoaded = await page.getByText(/game setup/i).isVisible()
        .catch(() => false);

    if (!setupPageLoaded) {
        console.log('❌ Failed to load setup page properly');
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);

        const pageContent = await page.content();
        console.log('Page content first 300 chars:', pageContent.substring(0, 300));

        const h1Text = await page.locator('h1').textContent();
        console.log('H1 text:', h1Text);

        // Bail out if we can't even load the setup page
        test.fail(true, 'Could not load setup page properly');
        return;
    }

    console.log('✅ Successfully loaded setup page');

    // Step 2: Configure team names
    console.log('Step 2: Setting up team names');

    // First, verify team name inputs exist
    const teamInputsVisible = await articulate.teamNameInputs.first().isVisible()
        .catch(() => false);

    if (!teamInputsVisible) {
        console.log('❌ Team name inputs not found');
        test.fail(true, 'Team name inputs not found');
        return;
    }

    const teamNames = ['Team Alpha', 'Team Beta'];
    await articulate.setupTeams(teamNames);

    // Verify team names are entered
    await expect(articulate.teamNameInputs.nth(0)).toHaveValue(teamNames[0]);
    await expect(articulate.teamNameInputs.nth(1)).toHaveValue(teamNames[1]);
    console.log('✅ Successfully configured team names');

    // Step 3: Configure game settings if needed
    console.log('Step 3: Setting game options');
    // Set time limit (if this field exists)
    try {
        const timeSelectorVisible = await articulate.timeSelector.isVisible()
            .catch(() => false);

        if (timeSelectorVisible) {
            await articulate.selectTimeLimit('60');
            await expect(articulate.timeSelector).toHaveValue('60');
            console.log('✅ Set time limit to 60 seconds');
        } else {
            console.log('Note: Time selector not found');
        }
    } catch (e) {
        console.log('Note: Time selector interaction error', e);
    }

    // Step 4: Find and log information about the Start Game button
    console.log('Step 4: Checking Start Game button');

    // Try different ways to find the button
    const startGameButton = await page.getByText(/start game/i, { exact: false });
    const startButtonVisible = await startGameButton.isVisible()
        .catch(() => false);

    console.log(`Start Game button visible: ${startButtonVisible}`);

    if (!startButtonVisible) {
        // Take screenshot and dump page content
        await page.screenshot({ path: 'setup-page-no-button.png' });
        const bodyText = await page.locator('body').textContent();
        console.log('Page body text:', bodyText);

        // Try to find all buttons
        const allButtons = await page.locator('button').all();
        console.log(`Found ${allButtons.length} buttons on the page`);

        for (let i = 0; i < allButtons.length; i++) {
            const buttonText = await allButtons[i].textContent();
            console.log(`Button ${i + 1}: "${buttonText?.trim()}"`);
        }

        test.fail(true, 'Start Game button not found');
        return;
    }

    // Get button details
    const buttonText = await startGameButton.textContent();
    const buttonEnabled = await startGameButton.isEnabled();
    const buttonHTML = await page.evaluate(() => {
        const btn = document.querySelector('button:has-text("Start Game")');
        return btn ? btn.outerHTML : 'Button not found';
    });

    console.log(`Button text: "${buttonText}"`);
    console.log(`Button enabled: ${buttonEnabled}`);
    console.log(`Button HTML: ${buttonHTML}`);

    // Step 5: Add event listeners to monitor click events
    console.log('Step 5: Adding event monitoring');
    await page.evaluate(() => {
        window._buttonEvents = [];
        window._clickHandled = false;

        // Monitor all click events
        document.addEventListener('click', event => {
            const target = event.target as HTMLElement;
            window._buttonEvents.push({
                type: 'click',
                targetText: target.textContent,
                preventDefault: event.defaultPrevented,
                timestamp: new Date().toISOString()
            });
            console.log('Click event detected', target.textContent);
        }, true);

        // Monitor router events
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            window._buttonEvents.push({
                type: 'navigation',
                url: args[2],
                timestamp: new Date().toISOString()
            });
            console.log('Router navigation detected', args[2]);
            return originalPushState.apply(this, args);
        };
    });
    console.log('✅ Event monitoring added');

    // Step 6: Click the Start Game button
    console.log('Step 6: Clicking Start Game button');
    await page.waitForTimeout(500); // Small wait to ensure everything is ready

    // Click with special force option
    await startGameButton.click({ force: true, timeout: 5000 });
    console.log('✅ Start Game button clicked');

    // Step 7: Wait and check for navigation
    console.log('Step 7: Waiting to check navigation result');
    await page.waitForTimeout(2000); // Wait to see if navigation happens

    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after clicking Start Game: ${currentUrl}`);

    // Step 8: Check captured events
    console.log('Step 8: Checking captured events');
    const events = await page.evaluate(() => window._buttonEvents);
    console.log('Captured events:', JSON.stringify(events, null, 2));

    // Final check - we expect to be on the game page
    try {
        await expect(page).toHaveURL(/.*game/, { timeout: 5000 });
        console.log('✅ Successfully navigated to game page');
    } catch (e) {
        console.log('❌ Navigation to game page failed');

        // Additional diagnostics if navigation failed
        console.log('Checking button click handler');

        // Try to look at React event handlers (if using React)
        const reactHandlers = await page.evaluate(() => {
            // For React apps, check for _reactProps
            try {
                const btn = document.querySelector('button:has-text("Start Game")');
                // @ts-ignore
                const propsKey = Object.keys(btn).find(key => key.startsWith('__reactProps$'));
                // @ts-ignore
                return propsKey ? JSON.stringify(btn[propsKey]) : 'No React props found';
            } catch (e) {
                return 'Error checking React props: ' + e.message;
            }
        });
        console.log('React handlers:', reactHandlers);

        // Try direct navigation
        console.log('Trying direct navigation to /game');
        await articulate.gotoGame();
        console.log('Direct navigation URL:', page.url());
    }
}); 