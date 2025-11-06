/**
 * World Core Tests
 * Tests Perlin noise generation and world/chunk systems
 */

import { describe, it, expect } from 'vitest';
import PerlinNoise from '../game/core/perlin';
import { WorldCore } from '../game/core/core';

describe('PerlinNoise', () => {
  it('should generate consistent noise with same seed', () => {
    const perlin1 = new PerlinNoise(12345);
    const perlin2 = new PerlinNoise(12345);
    
    const value1 = perlin1.noise(10, 20);
    const value2 = perlin2.noise(10, 20);
    
    expect(value1).toBe(value2);
  });
  
  it('should generate noise in range [-1, 1]', () => {
    const perlin = new PerlinNoise(12345);
    
    for (let i = 0; i < 100; i++) {
      const value = perlin.noise(i, i * 2);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
  
  it('should generate smooth octave noise', () => {
    const perlin = new PerlinNoise(12345);
    
    const value = perlin.octaveNoise(10, 20, 4, 0.5);
    expect(value).toBeGreaterThanOrEqual(-1);
    expect(value).toBeLessThanOrEqual(1);
  });
  
  it('should have smooth gradients', () => {
    const perlin = new PerlinNoise(12345);
    
    const v1 = perlin.noise(10.0, 10.0);
    const v2 = perlin.noise(10.1, 10.0);
    const v3 = perlin.noise(10.0, 10.1);
    
    // Values should be similar for nearby points
    expect(Math.abs(v1 - v2)).toBeLessThan(0.5);
    expect(Math.abs(v1 - v3)).toBeLessThan(0.5);
  });
});

describe('WorldCore', () => {
  let worldCore: WorldCore;
  
  beforeEach(() => {
    worldCore = new WorldCore(12345);
  });
  
  it('should generate 5x5 chunks', () => {
    expect(worldCore.chunks.size).toBe(25); // 5x5 = 25 chunks
  });
  
  it('should generate chunks with 100x100 tiles', () => {
    const chunk = worldCore.chunks.get('0,0');
    
    expect(chunk).toBeDefined();
    expect(chunk.tiles.length).toBe(100);
    expect(chunk.tiles[0].length).toBe(100);
  });
  
  it('should assign biome types based on noise', () => {
    const chunk = worldCore.chunks.get('0,0');
    const tile = chunk.tiles[0][0];
    
    expect(['water', 'grass', 'flower', 'ore']).toContain(tile.type);
    expect(tile.value).toBeGreaterThanOrEqual(0);
    expect(tile.value).toBeLessThanOrEqual(1);
  });
  
  it('should get tile by world coordinates', () => {
    const tile = worldCore.getTile(50, 50);
    
    expect(tile).toBeDefined();
    expect(tile.worldX).toBe(50);
    expect(tile.worldY).toBe(50);
  });
  
  it('should return null for out-of-bounds tiles', () => {
    const tile = worldCore.getTile(1000, 1000);
    expect(tile).toBeNull();
  });
  
  it('should perform raycast', () => {
    const results = worldCore.raycast(50, 50, 1, 0, 20);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tile).toBeDefined();
    expect(results[0].distance).toBeGreaterThanOrEqual(0);
  });
  
  it('should get visible tiles within radius', () => {
    const tiles = worldCore.getVisibleTiles(250, 250, 30);
    
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(10000); // Should be culled
    
    // All tiles should be roughly within radius (allowing for square vs circle culling)
    tiles.forEach(tile => {
      const dx = tile.worldX - 250;
      const dy = tile.worldY - 250;
      const distance = Math.sqrt(dx * dx + dy * dy);
      expect(distance).toBeLessThan(50); // Square culling means corners are further
    });
  });
  
  it('should have correct world bounds', () => {
    const bounds = worldCore.getWorldBounds();
    
    expect(bounds.width).toBe(5 * 100 * 8); // 5 chunks * 100 tiles * 8 pixels
    expect(bounds.height).toBe(5 * 100 * 8);
  });
  
  it('should generate consistent world with same seed', () => {
    const world1 = new WorldCore(99999);
    const world2 = new WorldCore(99999);
    
    const tile1 = world1.getTile(100, 100);
    const tile2 = world2.getTile(100, 100);
    
    expect(tile1.type).toBe(tile2.type);
    expect(tile1.value).toBe(tile2.value);
  });
  
  it('should have variety of biome types', () => {
    const biomes = new Set<string>();
    
    for (let y = 0; y < 500; y += 10) {
      for (let x = 0; x < 500; x += 10) {
        const tile = worldCore.getTile(x, y);
        if (tile) biomes.add(tile.type);
      }
    }
    
    // Should have at least 3 different biome types in a large sample
    expect(biomes.size).toBeGreaterThanOrEqual(3);
  });
});
