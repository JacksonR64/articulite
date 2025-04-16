# Testing Guide for ArticuLITE

This document outlines our testing strategy, tools, and best practices for the ArticuLITE project.

## Testing Philosophy

We follow Test-Driven Development (TDD) principles:

1. **Red**: Write a failing test for the functionality you want to implement
2. **Green**: Write the minimal code necessary to make the test pass
3. **Refactor**: Improve the code while keeping the tests passing

## Testing Stack

- **Unit/Integration Tests**: Jest + React Testing Library
- **End-to-End Tests**: Playwright
- **Test Coverage**: Jest built-in coverage reports

## Running Tests

```bash
# Run unit and integration tests
npm test

# Run unit tests in watch mode (for development)
npm run test:watch

# Run E2E tests with Playwright
npm run test:e2e

# Run all tests (unit + E2E)
npm run test:all

# Run complete verification (lint + build + test)
npm run verify
```

## Unit and Integration Testing

Unit tests focus on individual components, hooks, and utility functions. We use Jest as our test runner and React Testing Library for component testing.

### Best Practices

1. Test behavior, not implementation details
2. Use meaningful assertions that verify what the user would see or experience
3. Follow the Arrange-Act-Assert pattern
4. Use descriptive test names that explain the expected behavior
5. Mock external dependencies and focus on the unit being tested

### Example Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';

test('calls onClick handler when clicked', () => {
  // Arrange
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  // Act
  fireEvent.click(screen.getByText('Click Me'));
  
  // Assert
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Example Hook Test

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../hooks/useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter(0));
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

## End-to-End Testing

E2E tests verify the application works as a whole, simulating real user interactions across multiple pages and components.

### Best Practices

1. Focus on critical user journeys
2. Test on multiple browsers
3. Keep E2E tests focused and independent
4. Use explicit waiting rather than arbitrary timeouts
5. Take screenshots at key points for debugging failures

### Example E2E Test

```ts
import { test, expect } from '@playwright/test';

test('user can create a new game', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');
  
  // Enter password and access game setup
  await page.fill('input[type="password"]', 'test-password');
  await page.click('button:has-text("Enter Game")');
  
  // Configure game
  await page.fill('input[name="teamName"]', 'Test Team');
  await page.click('button:has-text("Create Game")');
  
  // Verify game was created
  await expect(page.locator('h1')).toContainText('Game Board');
  await expect(page.locator('text=Test Team')).toBeVisible();
});
```

## Test Coverage

We aim for high test coverage (>80%) across the codebase, but focus on meaningful coverage rather than arbitrary metrics. Critical paths should have close to 100% coverage.

View the coverage report after running tests:

```bash
npm test
# Then open coverage/lcov-report/index.html in your browser
```

## Continuous Integration

All tests run automatically on GitHub Actions:
- For each pull request
- After merging to main

The workflow won't allow deployment unless all tests pass.

## Writing Tests First (TDD)

For new features:

1. Write the test first, describing the expected behavior
2. Run the test and see it fail (Red)
3. Implement the minimum code to make the test pass (Green)
4. Refactor the code while keeping the test passing
5. Commit both the test and implementation

TDD helps ensure our code is testable by design and that our tests actually test something meaningful.

## Tips for Effective Tests

- **Test behavior, not implementation**: Focus on what the component or function does, not how it does it
- **Use realistic test data**: Create test data that resembles real-world usage
- **Keep tests independent**: Tests should not depend on the state left by other tests
- **Test edge cases**: Include tests for error conditions, boundary values, and edge cases
- **Keep tests simple**: Each test should verify one specific behavior
- **Use descriptive test names**: Name tests so they clearly describe the expected behavior

## Running Specific Tests

```bash
# Run tests matching a pattern
npm test -- -t "LoginForm"

# Run a specific test file
npm test -- __tests__/components/auth/login-form.test.tsx
```

## Debugging Tests

```bash
# Run tests with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# For Playwright tests
npx playwright test --debug
``` 