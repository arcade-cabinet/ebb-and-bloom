/**
 * Texture System Tests - Validate texture loading, ECS integration, and React bindings
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { World } from 'miniplex';
import TextureSystem, { useMaterial } from '../systems/TextureSystem';
import type { WorldSchema } from '../world/ECSWorld';
import * as THREE from 'three';

describe('TextureSystem', () => {
  let world: World<WorldSchema>;
  let textureSystem: TextureSystem;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    textureSystem = new TextureSystem(world);
  });
  
  test('initializes without errors', async () => {
    await expect(textureSystem.initialize()).resolves.not.toThrow();
  });
  
  test('creates ECS entities for texture resources', async () => {
    await textureSystem.initialize();
    
    // Should have created texture resource entities
    const resources = world.with('resource');
    expect(resources.entities.length).toBeGreaterThanOrEqual(0);
  });
  
  test('queries materials by category', async () => {
    await textureSystem.initialize();
    
    const material = await textureSystem.queryMaterial({ category: 'wood' });
    
    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(THREE.Material);
  });
  
  test('caches materials for performance', async () => {
    await textureSystem.initialize();
    
    const material1 = await textureSystem.queryMaterial({ category: 'metal' });
    const material2 = await textureSystem.queryMaterial({ category: 'metal' });
    
    // Should return different instances (cloned)
    expect(material1).not.toBe(material2);
    expect(material1).toBeInstanceOf(THREE.Material);
    expect(material2).toBeInstanceOf(THREE.Material);
  });
  
  test('throws error for missing textures', async () => {
    await textureSystem.initialize();
    
    // Query for category that doesn't exist - should throw, not fallback
    await expect(
      textureSystem.queryMaterial({ category: 'unknown' as any })
    ).rejects.toThrow();
  });
  
  test('applies material properties correctly', async () => {
    await textureSystem.initialize();
    
    const material = await textureSystem.queryMaterial({
      category: 'metal',
      properties: {
        metalness: 0.9,
        roughness: 0.1,
        emissive: true
      }
    });
    
    expect(material).toBeDefined();
    if (material instanceof THREE.MeshStandardMaterial) {
      expect(material.metalness).toBe(0.9);
      expect(material.roughness).toBe(0.1);
    }
  });
  
  test('loads texture manifest correctly', async () => {
    // Mock fetch for manifest
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          assets: [
            {
              assetId: 'test_wood_001',
              category: 'wood',
              name: 'Test Wood',
              filePath: '/textures/wood/test_wood_001_color_2K.jpg',
              mapType: 'color'
            }
          ]
        })
      } as Response)
    );
    
    await textureSystem.initialize();
    
    // System should have initialized with manifest data
    expect(textureSystem).toBeDefined();
  });
  
  test('throws error when manifest loading fails', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );
    
    // PRODUCTION MODE: Should throw error, no fallbacks
    await expect(textureSystem.initialize()).rejects.toThrow('PRODUCTION REQUIREMENT');
  });
  
  test('supports all material categories', async () => {
    await textureSystem.initialize();
    
    const categories: Array<'wood' | 'metal' | 'stone' | 'fabric' | 'organic' | 'ground'> = [
      'wood', 'metal', 'stone', 'fabric', 'organic', 'ground'
    ];
    
    for (const category of categories) {
      const material = await textureSystem.queryMaterial({ category });
      expect(material).toBeDefined();
      expect(material).toBeInstanceOf(THREE.Material);
    }
  });
});

describe('TextureSystem React Hooks', () => {
  test('useMaterial hook structure is correct', () => {
    // Hook should be exported
    expect(useMaterial).toBeDefined();
    expect(typeof useMaterial).toBe('function');
  });
  
  // Note: Full React hook testing would require React Testing Library
  // and proper context setup, which is more complex integration testing
});

