/**
 * Unified Game Engine
 * 
 * Direct function calls (no HTTP, no REST)
 * All game logic in one package
 */

import { GameEngine as BackendGameEngine } from './GameEngineBackend';
import type { GameState } from './GameEngineBackend';
import type { Planet } from '@ebb/shared/schemas';

export interface GameRenderData {
  planet: Planet;
  moons: Array<{
    id: string;
    radius: number;
    distance: number;
    orbitalPeriod: number;
    position: { x: number; y: number; z: number };
  }>;
  visualBlueprint?: {
    primaryTexture?: string;
    colorPalette?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    materialProperties?: {
      roughness: number;
      metallic: number;
    };
  };
}

export class GameEngine {
  private backend: BackendGameEngine;

  constructor(gameId: string) {
    this.backend = new BackendGameEngine(gameId);
  }

  /**
   * Initialize game with seed
   * Direct function call - no HTTP
   */
  async initialize(seed: string): Promise<void> {
    await this.backend.initialize(seed);
  }

  /**
   * Get current game state
   * Direct function call - no HTTP
   */
  getState(): GameState {
    return this.backend.getState();
  }

  /**
   * Get Gen0 render data
   * Direct function call - no HTTP
   */
  async getGen0RenderData(time?: number): Promise<GameRenderData | null> {
    const state = this.backend.getState();
    
    if (!state.planet || !state.gen0Data) {
      return null;
    }

    // Calculate moon positions if time provided
    const moons = state.gen0Data.moons?.map((moon: any, index: number) => {
      const angle = time ? (time / moon.orbitalPeriod) * Math.PI * 2 : 0;
      return {
        id: moon.id || `moon-${index}`,
        radius: moon.radius,
        distance: moon.distance,
        orbitalPeriod: moon.orbitalPeriod,
        position: {
          x: Math.cos(angle) * moon.distance,
          y: 0,
          z: Math.sin(angle) * moon.distance,
        },
      };
    }) || [];

    return {
      planet: state.planet,
      moons,
      visualBlueprint: state.gen0Data.visualBlueprints?.[0],
    };
  }

  /**
   * Advance to next generation
   * Direct function call - no HTTP
   */
  async advanceGeneration(): Promise<GameState> {
    await this.backend.advanceGeneration();
    return this.backend.getState();
  }
}

