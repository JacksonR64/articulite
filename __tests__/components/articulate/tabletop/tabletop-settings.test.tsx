import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabletopSettings, TabletopSettings as TabletopSettingsType } from '@/components/articulate/tabletop';

describe('TabletopSettings', () => {
    const mockSave = jest.fn();
    const mockCancel = jest.fn();

    const defaultSettings: TabletopSettingsType = {
        showBoardVisualization: true,
        enableSoundEffects: true,
        showTurnInstructions: true,
        turnTimerEnabled: true,
        autoAdvanceToNextTeam: false
    };

    beforeEach(() => {
        mockSave.mockClear();
        mockCancel.mockClear();
    });

    it('renders with initial settings', () => {
        render(
            <TabletopSettings
                initialSettings={defaultSettings}
                onSave={mockSave}
                onCancel={mockCancel}
            />
        );

        // Check title is rendered
        expect(screen.getByText('Tabletop Mode Settings')).toBeInTheDocument();

        // Check all settings are rendered
        expect(screen.getByText('Show Board Visualization')).toBeInTheDocument();
        expect(screen.getByText('Enable Sound Effects')).toBeInTheDocument();
        expect(screen.getByText('Show Turn Instructions')).toBeInTheDocument();
        expect(screen.getByText('Enable Turn Timer')).toBeInTheDocument();
        expect(screen.getByText('Auto-Advance to Next Team')).toBeInTheDocument();

        // Check buttons
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });

    it('toggles settings when clicked', () => {
        render(
            <TabletopSettings
                initialSettings={defaultSettings}
                onSave={mockSave}
                onCancel={mockCancel}
            />
        );

        // Find the toggle buttons
        const toggles = screen.getAllByRole('switch');
        expect(toggles).toHaveLength(5);

        // Toggle the first setting (showBoardVisualization)
        fireEvent.click(toggles[0]);

        // Toggle the last setting (autoAdvanceToNextTeam)
        fireEvent.click(toggles[4]);
    });

    it('calls onSave with updated settings', () => {
        render(
            <TabletopSettings
                initialSettings={defaultSettings}
                onSave={mockSave}
                onCancel={mockCancel}
            />
        );

        // Toggle the first setting (showBoardVisualization)
        const toggles = screen.getAllByRole('switch');
        fireEvent.click(toggles[0]);

        // Click the save button
        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        // Check that onSave was called with updated settings
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith({
            ...defaultSettings,
            showBoardVisualization: false
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <TabletopSettings
                initialSettings={defaultSettings}
                onSave={mockSave}
                onCancel={mockCancel}
            />
        );

        // Click the cancel button
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Check that onCancel was called
        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close icon is clicked', () => {
        render(
            <TabletopSettings
                initialSettings={defaultSettings}
                onSave={mockSave}
                onCancel={mockCancel}
            />
        );

        // Find the close button by its role (it's an SVG inside a button)
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        // Check that onCancel was called
        expect(mockCancel).toHaveBeenCalledTimes(1);
    });
}); 