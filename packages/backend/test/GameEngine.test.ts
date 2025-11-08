import { describe, it, expect, beforeEach } from 'vitest';
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
      await engine.initialize('test-world');
      
      const state = engine.getState();
      expect(state.seed).toBe('test-world');
      expect(state.message).toContain('test-world');
    });
    
    it('should emit initialized event', async () => {
      let emitted = false;
      engine.once('initialized', (data) => {
        expect(data.seed).toBe('volcanic-world');
        emitted = true;
      });
      
      await engine.initialize('volcanic-world');
      expect(emitted).toBe(true);
    });
  });
  
  describe('Generation Advancement', () => {
    beforeEach(async () => {
      await engine.initialize('test-world');
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
      let emitted = false;
      engine.once('generation', (data) => {
        expect(data.generation).toBe(1);
        emitted = true;
      });
      
      await engine.advanceGeneration();
      expect(emitted).toBe(true);
    });
    
    it('should update message on generation advance', async () => {
      await engine.advanceGeneration();
      
      const state = engine.getState();
      expect(state.message).toContain('generation 1');
    });
  });
  
  describe('State Management', () => {
    it('should return immutable state copy', async () => {
      await engine.initialize('test-world');
      
      const state1 = engine.getState();
      const state2 = engine.getState();
      
      // Different objects
      expect(state1).not.toBe(state2);
      
      // Same values
      expect(state1).toEqual(state2);
    });
    
    it('should maintain state across operations', async () => {
      await engine.initialize('persistent-world');
      await engine.advanceGeneration();
      
      const state = engine.getState();
      expect(state.seed).toBe('persistent-world');
      expect(state.generation).toBe(1);
      expect(state.gameId).toBe('test-game-123');
    });
  });
});
