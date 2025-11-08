/**
 * Gen 0: GameEngine Integration Tests
 * Tests full Gen0 initialization through GameEngine with WARP/WEFT data pools
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/engine/GameEngine.js';
import type { Planet } from '../src/schemas/index.js';

describe('Gen 0: GameEngine Integration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine('test-gen0-game');
  });

  describe('Gen0 Initialization', () => {
    it('should initialize Gen0 when game is initialized', async () => {
      await engine.initialize('v1-test-world-seed');
      
      const state = engine.getState();
      expect(state.generation).toBe(0);
      expect(state.planet).toBeDefined();
      expect(state.gen0Data).toBeDefined();
      expect(state.message).toContain('Gen0 complete');
    });

    it('should create planet with all Gen0 features', async () => {
      await engine.initialize('v1-test-complete-world');
      
      const state = engine.getState();
      const planet = state.planet as Planet;
      
      expect(planet).toBeDefined();
      expect(planet.coreType).toBeDefined();
      expect(planet.layers.length).toBeGreaterThan(0);
      expect(planet.primordialWells.length).toBeGreaterThan(0);
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.mass).toBeGreaterThan(0);
      expect(planet.rotationPeriod).toBeGreaterThan(0);
    });

    it('should include WARP/WEFT data pools in gen0Data', async () => {
      await engine.initialize('v1-test-warp-weft');
      
      const state = engine.getState();
      expect(state.gen0Data).toBeDefined();
      expect(state.gen0Data.macro).toBeDefined();
      expect(state.gen0Data.meso).toBeDefined();
      expect(state.gen0Data.micro).toBeDefined();
    });

    it('should emit gen0 event on initialization', async () => {
      let eventData: any = null;
      engine.once('gen0', (data) => {
        eventData = data;
      });
      
      await engine.initialize('v1-test-event-seed');
      
      expect(eventData).not.toBeNull();
      expect(eventData.planet).toBeDefined();
      expect(eventData.gen0Data).toBeDefined();
    });

    it('should produce deterministic Gen0 for same seed', async () => {
      const seed = 'v1-test-deterministic-world';
      
      const engine1 = new GameEngine('test-1');
      await engine1.initialize(seed);
      const state1 = engine1.getState();
      
      const engine2 = new GameEngine('test-2');
      await engine2.initialize(seed);
      const state2 = engine2.getState();
      
      const planet1 = state1.planet as Planet;
      const planet2 = state2.planet as Planet;
      
      expect(planet1.radius).toBe(planet2.radius);
      expect(planet1.mass).toBe(planet2.mass);
      expect(planet1.coreType).toBe(planet2.coreType);
      expect(planet1.primordialWells.length).toBe(planet2.primordialWells.length);
    });

    it('should store moons in planet state', async () => {
      await engine.initialize('v1-test-moons-state');
      
      const state = engine.getState();
      const planet = state.planet as any;
      
      // Moons should be stored (may be empty array)
      expect(planet.moons).toBeDefined();
      expect(Array.isArray(planet.moons)).toBe(true);
    });

    it('should include visual blueprints in gen0Data', async () => {
      await engine.initialize('v1-test-visual-blueprints');
      
      const state = engine.getState();
      const gen0Data = state.gen0Data;
      
      expect(gen0Data.macro.visualBlueprint).toBeDefined();
      expect(gen0Data.macro.selectedContext).toBeDefined();
    });

    it('should handle multiple initializations correctly', async () => {
      await engine.initialize('v1-test-first-seed');
      const state1 = engine.getState();
      const planet1 = state1.planet as Planet;
      
      await engine.initialize('v1-test-second-seed');
      const state2 = engine.getState();
      const planet2 = state2.planet as Planet;
      
      // Should have different planets
      expect(planet1.radius).not.toBe(planet2.radius);
      expect(state1.seed).not.toBe(state2.seed);
    });
  });

  describe('Gen0 State Management', () => {
    it('should maintain Gen0 state after initialization', async () => {
      await engine.initialize('v1-test-persistent-seed');
      
      const state1 = engine.getState();
      const state2 = engine.getState();
      
      // Should return same state
      expect(state1.planet?.id).toBe(state2.planet?.id);
      expect(state1.gen0Data).toBeDefined();
      expect(state2.gen0Data).toBeDefined();
    });

    it('should include Gen0 data in getState()', async () => {
      await engine.initialize('v1-test-state-inclusion');
      
      const state = engine.getState();
      
      expect(state.planet).toBeDefined();
      expect(state.gen0Data).toBeDefined();
      expect(state.generation).toBe(0);
      expect(state.message).toContain('Gen0');
    });
  });

  describe('Gen0 with WARP/WEFT', () => {
    it('should use WARP/WEFT data for planet formation', async () => {
      await engine.initialize('v1-test-warp-weft');
      
      const state = engine.getState();
      const gen0Data = state.gen0Data;
      
      // Should have selected archetypes
      expect(gen0Data.macro.archetypeId).toBeDefined();
      expect(gen0Data.meso.archetypeId).toBeDefined();
      expect(gen0Data.micro.archetypeId).toBeDefined();
      
      // Should have visual blueprints
      expect(gen0Data.macro.visualBlueprint).toBeDefined();
      expect(gen0Data.micro.visualBlueprint).toBeDefined();
    });

    it('should produce deterministic WARP/WEFT selections', async () => {
      const seed = 'v1-test-warp-deterministic';
      
      const engine1 = new GameEngine('test-w1');
      await engine1.initialize(seed);
      const data1 = engine1.getState().gen0Data;
      
      const engine2 = new GameEngine('test-w2');
      await engine2.initialize(seed);
      const data2 = engine2.getState().gen0Data;
      
      expect(data1.macro.archetypeId).toBe(data2.macro.archetypeId);
      expect(data1.meso.archetypeId).toBe(data2.meso.archetypeId);
      expect(data1.micro.archetypeId).toBe(data2.micro.archetypeId);
    });
  });
});

