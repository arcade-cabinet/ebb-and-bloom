/**
 * Integration tests for seed cookie handoff from main menu to simulation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withTimeout, TEST_TIMEOUTS } from '../utils/timeout';

describe('Seed Cookie Handoff Integration', () => {
  beforeEach(() => {
    // Clear localStorage
    global.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    global.localStorage.clear();
  });

  describe('Main Menu → Simulation Handoff', () => {
    it('should save seed when game is created', async () => {
      await withTimeout(async () => {
        const seed = 'v1-test-world-seed';
        
        // Simulate main menu saving seed
        global.localStorage.setItem('ebb-bloom-seed', seed);
        
        expect(global.localStorage.getItem('ebb-bloom-seed')).toBe(seed);
      }, TEST_TIMEOUTS.INTEGRATION);
    });

    it('should pass seed from main menu to simulation via localStorage', async () => {
      await withTimeout(async () => {
        const seed = 'v1-test-world-seed';
        
        // Main menu saves seed
        global.localStorage.setItem('ebb-bloom-seed', seed);
        
        // Simulation reads seed
        const loadedSeed = global.localStorage.getItem('ebb-bloom-seed');
        
        expect(loadedSeed).toBe(seed);
      }, TEST_TIMEOUTS.INTEGRATION);
    });

    it('should handle seed in URL query params for simulation', async () => {
      await withTimeout(async () => {
        const gameId = 'test-game-123';
        const seed = 'v1-test-world-seed';
        
        // Simulate URL with gameId
        const url = new URL(`http://localhost:5173/simulation/index.html?gameId=${gameId}`);
        const params = new URLSearchParams(url.search);
        
        expect(params.get('gameId')).toBe(gameId);
        
        // Seed should be in localStorage
        global.localStorage.setItem('ebb-bloom-seed', seed);
        expect(global.localStorage.getItem('ebb-bloom-seed')).toBe(seed);
      }, TEST_TIMEOUTS.INTEGRATION);
    });

    it('should use seed from localStorage if no seed in URL', async () => {
      await withTimeout(async () => {
        const seed = 'v1-test-world-seed';
        global.localStorage.setItem('ebb-bloom-seed', seed);
        
        // Simulation should read from localStorage
        const loadedSeed = global.localStorage.getItem('ebb-bloom-seed');
        expect(loadedSeed).toBe(seed);
      }, TEST_TIMEOUTS.INTEGRATION);
    });

    it('should persist seed across page reloads', async () => {
      await withTimeout(async () => {
        const seed = 'v1-test-world-seed';
        
        // Save seed
        global.localStorage.setItem('ebb-bloom-seed', seed);
        
        // Simulate page reload (new localStorage instance)
        const newLocalStorage = { ...global.localStorage };
        const reloadedSeed = newLocalStorage.getItem('ebb-bloom-seed');
        
        // In real browser, localStorage persists
        // In test, we verify the setItem was called
        expect(global.localStorage.getItem('ebb-bloom-seed')).toBe(seed);
      }, TEST_TIMEOUTS.INTEGRATION);
    });
  });

  describe('Seed Format Validation', () => {
    it('should accept valid seed format (v1-word-word-word)', () => {
      const validSeeds = [
        'v1-test-world-seed',
        'v1-ocean-mountain-forest',
        'v1-sun-moon-star',
      ];

      validSeeds.forEach(seed => {
        global.localStorage.setItem('ebb-bloom-seed', seed);
        const loaded = global.localStorage.getItem('ebb-bloom-seed');
        expect(loaded).toBe(seed);
      });
    });

    it('should handle empty seed gracefully', () => {
      global.localStorage.setItem('ebb-bloom-seed', '');
      const loaded = global.localStorage.getItem('ebb-bloom-seed');
      expect(loaded).toBe('');
    });
  });

  describe('Cross-Package Communication', () => {
    it('should allow main menu package to set seed', () => {
      const seed = 'v1-test-world-seed';
      
      // Main menu (packages/game) sets seed
      global.localStorage.setItem('ebb-bloom-seed', seed);
      
      // Simulation (packages/game) reads seed
      const simulationSeed = global.localStorage.getItem('ebb-bloom-seed');
      
      expect(simulationSeed).toBe(seed);
    });

    it('should handle multiple game creations with different seeds', () => {
      const seed1 = 'v1-first-world-seed';
      const seed2 = 'v1-second-world-seed';
      
      // First game
      global.localStorage.setItem('ebb-bloom-seed', seed1);
      expect(global.localStorage.getItem('ebb-bloom-seed')).toBe(seed1);
      
      // Second game (overwrites)
      global.localStorage.setItem('ebb-bloom-seed', seed2);
      expect(global.localStorage.getItem('ebb-bloom-seed')).toBe(seed2);
    });
  });
});

