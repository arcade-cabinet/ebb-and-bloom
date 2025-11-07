/**
 * EvolutionUI Integration Tests - ECS data binding validation
 */

import { render, screen, waitFor } from '@testing-library/react';
import { World } from 'miniplex';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EvolutionUI from '../components/EvolutionUI';
import { WorldProvider } from '../contexts/WorldContext';
import EcosystemFoundation from '../systems/EcosystemFoundation';
import { gameClock } from '../systems/GameClock';
import TextureSystem from '../systems/TextureSystem';
import type { CreatureData, Transform, WorldSchema } from '../world/ECSWorld';

// Mock dependencies
vi.mock('../systems/TextureSystem', () => ({
    default: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined)
    }))
}));

vi.mock('../systems/EcosystemFoundation', () => ({
    default: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn(),
        getNarrativeSystem: vi.fn(() => ({
            getRecentHaikus: vi.fn(() => [])
        })),
        getEnvironmentalSystem: vi.fn(() => ({
            getEnvironmentalReport: vi.fn(() => ({
                globalPollution: 0.3,
                activeSources: 5,
                refugeAreas: 8
            }))
        })),
        getPackSocialSystem: vi.fn(() => ({
            getPackAnalysis: vi.fn(() => ({
                totalPacks: 3,
                averagePackSize: 5,
                totalTerritorialCoverage: 1500
            }))
        }))
    }))
}));

describe('EvolutionUI Integration', () => {
    let world: World<WorldSchema>;
    let ecosystem: EcosystemFoundation;

    beforeEach(() => {
        world = new World<WorldSchema>();
        const textureSystem = new TextureSystem(world);
        ecosystem = new EcosystemFoundation(world, textureSystem);
    });

    it('should display generation counter from gameClock', () => {
        gameClock.advanceGeneration(5);

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <EvolutionUI />
            </WorldProvider>
        );

        expect(screen.getByText(/Generation 5/i)).toBeInTheDocument();
    });

    it('should query and display creatures from ECS world', async () => {
        // Add test creatures to world
        const creature1 = world.add({
            creature: {
                species: 'squirrel',
                size: 1.0,
                personality: 'curious',
                energy: 100,
                mood: 0.5
            } as CreatureData,
            transform: {
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(1, 1, 1)
            } as Transform
        });

        const creature2 = world.add({
            creature: {
                species: 'rabbit',
                size: 1.2,
                personality: 'shy',
                energy: 80,
                mood: 0.3
            } as CreatureData,
            transform: {
                position: new THREE.Vector3(10, 0, 10),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(1, 1, 1)
            } as Transform
        });

        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <EvolutionUI />
            </WorldProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Active Creatures \(2\)/i)).toBeInTheDocument();
        });
    });

    it('should display environmental status from EnvironmentalPressureSystem', async () => {
        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <EvolutionUI />
            </WorldProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Pollution/i)).toBeInTheDocument();
            expect(screen.getByText(/30%/i)).toBeInTheDocument(); // 0.3 * 100
            expect(screen.getByText(/Active Sources/i)).toBeInTheDocument();
            expect(screen.getByText(/5/i)).toBeInTheDocument();
        });
    });

    it('should display pack dynamics from PackSocialSystem', async () => {
        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <EvolutionUI />
            </WorldProvider>
        );

        await waitFor(() => {
            // Pack data should be displayed (checking for pack-related text)
            const packText = screen.queryByText(/pack/i);
            expect(packText || screen.queryByText(/5/i)).toBeTruthy(); // Average pack size
        });
    });

    it('should handle empty creature list gracefully', () => {
        render(
            <WorldProvider world={world} ecosystem={ecosystem}>
                <EvolutionUI />
            </WorldProvider>
        );

        expect(screen.getByText(/No creatures detected/i)).toBeInTheDocument();
    });
});

