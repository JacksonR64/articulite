import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamDisplay } from '../../../components/articulate/team/team-display';

describe('TeamDisplay', () => {
    test('renders team information correctly', () => {
        render(
            <TeamDisplay
                name="Team Awesome"
                score={5}
                isActive={false}
            />
        );

        // Check if team name and score are displayed
        expect(screen.getByText('Team Awesome')).toBeInTheDocument();
        expect(screen.getByText('Score:')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();

        // Current Turn indicator should not be present for inactive team
        expect(screen.queryByText('Current Turn')).not.toBeInTheDocument();
    });

    test('shows active status when team is active', () => {
        render(
            <TeamDisplay
                name="Team Awesome"
                score={5}
                isActive={true}
            />
        );

        // Check if "Current Turn" indicator is displayed
        expect(screen.getByText('Current Turn')).toBeInTheDocument();

        // Check for active styling (blue background)
        const teamElement = screen.getByText('Team Awesome').closest('div');
        expect(teamElement).toHaveClass('bg-blue-100');
    });

    test('shows inactive status when team is not active', () => {
        render(
            <TeamDisplay
                name="Team Awesome"
                score={5}
                isActive={false}
            />
        );

        // Check for inactive styling (gray background)
        const teamElement = screen.getByText('Team Awesome').closest('div');
        expect(teamElement).toHaveClass('bg-gray-100');
    });
}); 