/**
 * World Context Tests - ECS world provider integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { World } from 'miniplex';
import { WorldProvider, useWorld } from '../contexts/WorldContext';
import type { WorldSchema } from '../world/ECSWorld';
import EcosystemFoundation from '../systems/EcosystemFoundation';
import TextureSystem from '../systems/TextureSystem';

// Mock TextureSystem
vi.mock('../systems/TextureSystem', () => ({
  default: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock EcosystemFoundation
vi.mock('../systems/EcosystemFoundation', () => ({
  default: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    start: vi.fn(),
    getNarrativeSystem: vi.fn(() => ({
      getRecentHaikus: vi.fn(() => [])
    })),
    getEnvironmentalSystem: vi.fn(() => ({
      getEnvironmentalReport: vi.fn(() => ({
        globalPollution: 0.2,
        activeSources: 3,
        refugeAreas: 5
      }))
    })),
    getPackSocialSystem: vi.fn(() => ({
      getPackAnalysis: vi.fn(() => ({
        totalPacks: 2,
        averagePackSize: 4,
        totalTerritorialCoverage: 1000
      }))
    }))
  }))
}));

describe('WorldContext', () => {
  let world: World<WorldSchema>;
  let ecosystem: EcosystemFoundation;

  beforeEach(() => {
    world = new World<WorldSchema>();
    const textureSystem = new TextureSystem(world);
    ecosystem = new EcosystemFoundation(world, textureSystem);
  });

  it('should provide world and ecosystem to children', () => {
    const TestComponent = () => {
      const { world: contextWorld, ecosystem: contextEcosystem } = useWorld();
      return (
        <div>
          <div data-testid="has-world">{contextWorld ? 'yes' : 'no'}</div>
          <div data-testid="has-ecosystem">{contextEcosystem ? 'yes' : 'no'}</div>
        </div>
      );
    };

    render(
      <WorldProvider world={world} ecosystem={ecosystem}>
        <TestComponent />
      </WorldProvider>
    );

    expect(screen.getByTestId('has-world')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-ecosystem')).toHaveTextContent('yes');
  });

  it('should throw error when useWorld used outside provider', () => {
    const TestComponent = () => {
      useWorld();
      return <div>test</div>;
    };

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useWorld must be used within WorldProvider');

    consoleError.mockRestore();
  });

  it('should allow null ecosystem', () => {
    const TestComponent = () => {
      const { ecosystem: contextEcosystem } = useWorld();
      return (
        <div data-testid="ecosystem-null">{contextEcosystem === null ? 'yes' : 'no'}</div>
      );
    };

    render(
      <WorldProvider world={world} ecosystem={null}>
        <TestComponent />
      </WorldProvider>
    );

    expect(screen.getByTestId('ecosystem-null')).toHaveTextContent('yes');
  });
});
