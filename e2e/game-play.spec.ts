import { test, expect, Articulate } from './fixtures';

test.describe('Game Play', () => {
    let articulate: Articulate;

    test.beforeEach(async ({ page }) => {
        articulate = new Articulate(page);
        await articulate.goto();
        await articulate.setupTeams(['Team A', 'Team B']);
        await articulate.selectTimeLimit(60);
        await articulate.selectGameMode('classic');
        await articulate.startGame();
    });

    test('play a turn with correct answers', async () => {
        // Verify we're on the game page
        await expect(articulate.correctButton).toBeVisible();

        // Check initial state
        const activeTeam = await articulate.getActiveTeam();
        expect(activeTeam).toBe('Team A');

        // Check timer is counting down
        const initialTime = await articulate.getTimeRemaining();
        expect(initialTime).toBeGreaterThan(0);

        // Play some turns with correct answers
        await articulate.playTurn('correct');
        await articulate.playTurn('correct');

        // Check score updated
        const score = await articulate.getTeamScore('Team A');
        expect(score).toBe(2);

        // End the turn
        await articulate.endTurn();

        // Verify next team is active
        const nextActiveTeam = await articulate.getActiveTeam();
        expect(nextActiveTeam).toBe('Team B');
    });

    test('skip questions during play', async () => {
        // Play with skipped questions
        await articulate.playTurn('skip');
        await articulate.playTurn('correct');
        await articulate.playTurn('skip');

        // Verify score (should be 1 for 1 correct answer)
        const score = await articulate.getTeamScore('Team A');
        expect(score).toBe(1);
    });

    test('turn ends when timer expires', async () => {
        // This test would ideally use test timeouts and mocks
        // For now we'll just check that the timer starts at the correct value
        const initialTime = await articulate.getTimeRemaining();
        expect(initialTime).toBeLessThanOrEqual(60);
        expect(initialTime).toBeGreaterThan(0);

        // In a real implementation, we might mock the timer or use a short time limit
    });

    test('end game and view results', async () => {
        // Play a few turns
        await articulate.playTurn('correct');
        await articulate.endTurn();

        // Team B's turn
        await articulate.playTurn('correct');
        await articulate.playTurn('correct');
        await articulate.endTurn();

        // Team A's turn again
        await articulate.playTurn('skip');
        await articulate.endTurn();

        // End the game
        await articulate.endGame();

        // Check we're on the results page
        const resultsHeading = articulate.page.getByRole('heading', { name: /game results/i });
        await expect(resultsHeading).toBeVisible();

        // Verify scores
        const teamAScore = await articulate.getTeamScore('Team A');
        const teamBScore = await articulate.getTeamScore('Team B');

        expect(teamAScore).toBe(1);
        expect(teamBScore).toBe(2);
    });
}); 