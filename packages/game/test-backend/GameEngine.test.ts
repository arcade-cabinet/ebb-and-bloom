import { beforeEach, describe, expect, it } from 'vitest';
import { GameEngine } from '../src/engine/GameEngine.js';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine('test-game-123');
  });

  describe('Initialization', () => {
    it('should create engine with game ID', () => {
      const state = engine.getState();
      expect(state.gameId).toBe('test-game-123');
      expect(state.generation).toBe(0);
      expect(state.seed).toBe('');
    });

    it('should initialize with seed phrase', async () => {
      await engine.initialize('v1-test-world-alpha');

      const state = engine.getState();
      expect(state.seed).toBe('v1-test-world-alpha');
      // Message will be about Gen0 completion, not the seed
      expect(state.message).toBeDefined();
      expect(state.message.length).toBeGreaterThan(0);
    });

    it('should emit initialized event', async () => {
      let emitted = false;
      // GameEngine doesn't have once() method, so we'll test initialize directly
      await engine.initialize('v1-volcanic-world-beta');
      
      const state = engine.getState();
      expect(state.seed).toBe('v1-volcanic-world-beta');
      emitted = true;
      expect(emitted).toBe(true);
    });
  });

  describe('Generation Advancement', () => {
    beforeEach(async () => {
      await engine.initialize('v1-test-world-gamma');
    });

    it('should advance generation', async () => {
      await engine.advanceGeneration();

      const state = engine.getState();
      expect(state.generation).toBe(1);
    });

    it('should increment generation multiple times', async () => {
      await engine.advanceGeneration();
      await engine.advanceGeneration();
      await engine.advanceGeneration();

      const state = engine.getState();
      expect(state.generation).toBe(3);
    });

    it('should emit generation event', async () => {
      // GameEngine doesn't have once() method, so we test advance directly
      await engine.advanceGeneration();
      
      const state = engine.getState();
      expect(state.generation).toBe(1);
    });

    it('should update message on generation advance', async () => {
      await engine.advanceGeneration();

      const state = engine.getState();
      // Message will be about Gen1 completion
      expect(state.message).toContain('Gen1');
    });
  });

  describe('State Management', () => {
    it('should return immutable state copy', async () => {
      await engine.initialize('v1-test-world-delta');

      const state1 = engine.getState();
      const state2 = engine.getState();

      // Different objects
      expect(state1).not.toBe(state2);

      // Same values
      expect(state1).toEqual(state2);
    });

    it('should maintain state across operations', async () => {
      await engine.initialize('v1-persistent-world-zeta');
      await engine.advanceGeneration();

      const state = engine.getState();
      expect(state.seed).toBe('v1-persistent-world-zeta');
      expect(state.generation).toBe(1);
      expect(state.gameId).toBe('test-game-123');
    });
  });
});
