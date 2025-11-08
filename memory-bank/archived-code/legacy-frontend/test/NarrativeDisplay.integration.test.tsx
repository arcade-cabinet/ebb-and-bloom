/**
 * NarrativeDisplay Integration Tests - HaikuNarrativeSystem connection
 */

import { render, screen, waitFor } from '@testing-library/react';
import { World } from 'miniplex';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NarrativeDisplay from '../components/NarrativeDisplay';
import { WorldProvider } from '../contexts/WorldContext';
import EcosystemFoundation from '../systems/EcosystemFoundation';
import type { HaikuEntry } from '../systems/HaikuNarrativeSystem';
import TextureSystem from '../systems/TextureSystem';
import type { WorldSchema } from '../world/ECSWorld';

// Mock dependencies
vi.mock('../systems/TextureSystem', () => ({
    default: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined)
    }))
}));

describe('NarrativeDisplay Integration', () => {
    let world: World<WorldSchema>;
    let ecosystem: EcosystemFoundation;
    let mockNarrativeSystem: {
        getRecentHaikus: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        world = new World<WorldSchema>();
        const textureSystem = new TextureSystem(world);

        mockNarrativeSystem = {
            getRecentHaikus: vi.fn(() => [])
        };

        ecosystem = {
            initialize: vi.fn().mockResolvedValue(undefined),
            start: vi.fn(),
            getNarrativeSystem: vi.fn(() => mockNarrativeSystem),
            getEnvironmentalSystem: vi.fn(),
            getPackSocialSystem: vi.fn()
        } as any;
    });

    it('should load haikus from HaikuNarrativeSystem', async () => {
        const testHaikus: HaikuEntry[] = [
            {
                haiku: ['Line one', 'Line two', 'Line three'],
                context: {
                    eventType: 'evolution',
                    primarySubject: 'test',
                    secondaryElements: [],
                    location: 'test',
                    involvedCreatures: [],
                    traits: [],
                    environmentalFactors: []
                },
                timestamp: Date.now(),
                generation: 1,
                emotionalTone: 0.5,
                similarity: 0.1,
                significance: 0.8
            }
        ];

        mockNarrativeSystem.getRecentHaikus.mockReturnValue(testHaikus);

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <NarrativeDisplay />
            </WorldProvider>
        );

        await waitFor(() => {
            expect(mockNarrativeSystem.getRecentHaikus).toHaveBeenCalledWith(10);
        });
    });

    it('should load significant haikus from system', async () => {
        const significantHaiku: HaikuEntry = {
            haiku: ['Significant', 'Evolution event', 'Happened here'],
            context: {
                eventType: 'evolution',
                primarySubject: 'major_evolution',
                secondaryElements: [],
                location: 'test',
                involvedCreatures: [],
                traits: [],
                environmentalFactors: []
            },
            timestamp: Date.now(),
            generation: 5,
            emotionalTone: 0.8,
            similarity: 0.2,
            significance: 0.9 // High significance
        };

        mockNarrativeSystem.getRecentHaikus.mockReturnValue([significantHaiku]);

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <NarrativeDisplay />
            </WorldProvider>
        );

        // Verify system was called
        await waitFor(() => {
            expect(mockNarrativeSystem.getRecentHaikus).toHaveBeenCalled();
        });
    });

    it('should handle empty haiku list', () => {
        mockNarrativeSystem.getRecentHaikus.mockReturnValue([]);

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <NarrativeDisplay />
            </WorldProvider>
        );

        // Should not crash, just show empty state
        expect(screen.queryByText(/Evolution Journal/i)).not.toBeInTheDocument();
    });

    it('should call narrative system on mount', async () => {
        mockNarrativeSystem.getRecentHaikus.mockReturnValue([]);

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <NarrativeDisplay />
            </WorldProvider>
        );

        // Verify system was called on mount
        await waitFor(() => {
            expect(mockNarrativeSystem.getRecentHaikus).toHaveBeenCalledWith(10);
        });
    });
});

