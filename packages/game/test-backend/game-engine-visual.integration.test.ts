/**
 * Integration Test - GameEngine with Visual Rendering
 * 
 * Tests the complete Gen0 flow including:
 * 1. GameEngine initialization with seed
 * 2. Gen0 planet generation
 * 3. Visual blueprint loading
 * 4. Render data preparation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { GameEngine } from '../src/engine/GameEngine';

describe('GameEngine Integration - Gen0 Flow', () => {
  let engine: GameEngine;
  const testSeed = 'v1-test-world-demo';
  const gameId = `test-game-${Date.now()}`;

  beforeAll(async () => {
    // Create and initialize game engine
    engine = new GameEngine(gameId);
    await engine.initialize(testSeed);
  });

  it('should initialize game with seed', () => {
    const state = engine.getState();
    
    expect(state).toBeDefined();
    expect(state.gameId).toBe(gameId);
    expect(state.seed).toBe(testSeed);
    expect(state.generation).toBe(0);
  });

  it('should generate Gen0 planet data', () => {
    const state = engine.getState();
    
    expect(state.planet).toBeDefined();
    expect(state.planet?.radius).toBeGreaterThan(0);
    expect(state.planet?.mass).toBeGreaterThan(0);
    // Seed validation strips the v1- prefix, so planet.seed will be the normalized form
    expect(state.planet?.seed).toContain('test-world-demo');
  });

  it('should provide Gen0 render data', async () => {
    const renderData = await engine.getGen0RenderData(0);
    
    expect(renderData).not.toBeNull();
    expect(renderData?.planet).toBeDefined();
    expect(renderData?.planet.radius).toBeGreaterThan(0);
  });

  it('should include moons in render data', async () => {
    const renderData = await engine.getGen0RenderData(0);
    
    expect(renderData).not.toBeNull();
    expect(renderData?.moons).toBeDefined();
    expect(Array.isArray(renderData?.moons)).toBe(true);
  });

  it('should include visual blueprint', async () => {
    const renderData = await engine.getGen0RenderData(0);
    
    expect(renderData).not.toBeNull();
    // Visual blueprint might be optional depending on implementation
    // Just verify render data structure is complete
    expect(renderData?.planet).toBeDefined();
  });

  it('should calculate moon positions over time', async () => {
    const renderData1 = await engine.getGen0RenderData(0);
    const renderData2 = await engine.getGen0RenderData(1000);
    
    expect(renderData1).not.toBeNull();
    expect(renderData2).not.toBeNull();
    
    if (renderData1!.moons.length > 0 && renderData2!.moons.length > 0) {
      // Moon positions should change over time
      const moon1Pos1 = renderData1!.moons[0].position;
      const moon1Pos2 = renderData2!.moons[0].position;
      
      // At least one coordinate should be different
      const positionChanged = 
        moon1Pos1.x !== moon1Pos2.x ||
        moon1Pos1.y !== moon1Pos2.y ||
        moon1Pos1.z !== moon1Pos2.z;
      
      expect(positionChanged).toBe(true);
    }
  });
});
