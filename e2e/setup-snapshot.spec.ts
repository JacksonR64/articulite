import { test, expect } from './fixtures';

test('Capture setup page content', async ({ page }) => {
    // Navigate directly to the setup page
    console.log('Navigating to setup page');
    await page.goto('http://localhost:3333/setup');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'setup-page-snapshot.png', fullPage: true });

    // Capture HTML structure
    const html = await page.content();
    console.log('HTML Structure (first 500 chars):', html.substring(0, 500));

    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the page`);

    for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        const isEnabled = await buttons[i].isEnabled();

        console.log(`Button ${i + 1}: "${buttonText?.trim()}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);

        // If this is the Start Game button, inspect in detail
        if (buttonText?.includes('Start Game')) {
            console.log('Found Start Game button!');
            const attributes = await page.evaluate(button => {
                const attrs = {};
                for (let attr of button.attributes) {
                    attrs[attr.name] = attr.value;
                }
                return attrs;
            }, buttons[i]);

            console.log('Button attributes:', JSON.stringify(attributes, null, 2));

            // Try to identify onClick handler type
            const hasReactHandler = await page.evaluate(button => {
                const keys = Object.keys(button);
                return keys.some(key => key.startsWith('__reactProps$'));
            }, buttons[i]);

            console.log(`Has React onClick handler: ${hasReactHandler}`);

            // Try to click it and monitor navigation
            console.log('Attempting to click Start Game button:');

            // Setup navigation listener
            await page.evaluate(() => {
                window.__didNavigate = false;
                const originalPushState = history.pushState;
                history.pushState = function (...args) {
                    window.__didNavigate = true;
                    window.__navigatedTo = args[2];
                    console.log('Navigation detected to:', args[2]);
                    return originalPushState.apply(this, args);
                };
            });

            try {
                // Try clicking
                await buttons[i].click({ force: true, timeout: 3000 });
                console.log('Button clicked successfully');

                // Wait briefly to let navigation happen
                await page.waitForTimeout(2000);

                // Check if navigation happened
                const navigated = await page.evaluate(() => ({
                    didNavigate: window.__didNavigate,
                    navigatedTo: window.__navigatedTo
                }));

                console.log('Navigation result:', navigated);

                // Check current URL
                const currentUrl = page.url();
                console.log(`Current URL after clicking: ${currentUrl}`);
            } catch (e) {
                console.log('Error clicking button:', e);
            }
        }
    }

    // Look for input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields on the page`);

    for (let i = 0; i < Math.min(5, inputs.length); i++) {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const isVisible = await inputs[i].isVisible();

        console.log(`Input ${i + 1}: Type="${type}", Placeholder="${placeholder}", Visible=${isVisible}`);
    }
}); 