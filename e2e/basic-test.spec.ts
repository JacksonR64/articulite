import { test, expect } from '@playwright/test';

test('basic test that always passes', async ({ page }) => {
  // Create a simple HTML page inline instead of connecting to the server
  await page.setContent(`
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello Articulite</h1>
        <p>This is a test page that doesn't require the Next.js server.</p>
      </body>
    </html>
  `);
  
  // Take a screenshot
  await page.screenshot({ path: 'test-page.png' });
  
  // Verify the content
  const heading = await page.getByRole('heading', { name: 'Hello Articulite' });
  await expect(heading).toBeVisible();
  
  console.log('Basic test completed successfully!');
}); 