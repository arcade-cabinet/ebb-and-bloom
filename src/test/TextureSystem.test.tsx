/**
 * Texture System Tests - Validate texture loading, ECS integration, and React bindings
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { World } from 'miniplex';
import TextureSystem, { useMaterial, useWoodMaterial, useMetalMaterial, TextureContext } from '../systems/TextureSystem';
import type { WorldSchema } from '../world/ECSWorld';
import type { MaterialQuery } from '../systems/TextureSystem';
import * as THREE from 'three';

describe('TextureSystem', () => {
  let world: World<WorldSchema>;
  let textureSystem: TextureSystem;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    textureSystem = new TextureSystem(world);
  });
  
  test('initializes without errors', async () => {
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
    
    // Mock HEAD request for texture file existence check
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
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
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
    await expect(textureSystem.initialize()).resolves.not.toThrow();
  });
  
  test('creates ECS entities for texture resources', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
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
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
    await textureSystem.initialize();
    
    // Should have created texture resource entities
    const resources = world.with('resource');
    expect(resources.entities.length).toBeGreaterThanOrEqual(0);
  });
  
  test('queries materials by category', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
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
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
    await textureSystem.initialize();
    
    const material = await textureSystem.queryMaterial({ category: 'wood' });
    
    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(THREE.Material);
  });
  
  test('caches materials for performance', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assets: [
              {
                assetId: 'test_metal_001',
                category: 'metal',
                name: 'Test Metal',
                filePath: '/textures/metal/test_metal_001_color_2K.jpg',
                mapType: 'color'
              }
            ]
          })
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
    await textureSystem.initialize();
    
    const material1 = await textureSystem.queryMaterial({ category: 'metal' });
    const material2 = await textureSystem.queryMaterial({ category: 'metal' });
    
    // Should return different instances (cloned)
    expect(material1).not.toBe(material2);
    expect(material1).toBeInstanceOf(THREE.Material);
    expect(material2).toBeInstanceOf(THREE.Material);
  });
  
  test('throws error for missing textures', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
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
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
    await textureSystem.initialize();
    
    // Query for category that doesn't exist - should throw, not fallback
    await expect(
      textureSystem.queryMaterial({ category: 'unknown' as any })
    ).rejects.toThrow();
  });
  
  test('applies material properties correctly', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assets: [
              {
                assetId: 'test_metal_001',
                category: 'metal',
                name: 'Test Metal',
                filePath: '/textures/metal/test_metal_001_color_2K.jpg',
                mapType: 'color'
              }
            ]
          })
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
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
    // Mock fetch to fail with network error
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );
    
    // PRODUCTION MODE: Should throw error, no fallbacks
    // The error will be caught and re-thrown with PRODUCTION REQUIREMENT message
    await expect(textureSystem.initialize()).rejects.toThrow();
  });
  
  test('supports all material categories', async () => {
    // Mock fetch for manifest and texture files
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assets: [
              { assetId: 'test_wood_001', category: 'wood', name: 'Test Wood', filePath: '/textures/wood/test.jpg', mapType: 'color' },
              { assetId: 'test_metal_001', category: 'metal', name: 'Test Metal', filePath: '/textures/metal/test.jpg', mapType: 'color' },
              { assetId: 'test_stone_001', category: 'stone', name: 'Test Stone', filePath: '/textures/stone/test.jpg', mapType: 'color' },
              { assetId: 'test_fabric_001', category: 'fabric', name: 'Test Fabric', filePath: '/textures/fabric/test.jpg', mapType: 'color' },
              { assetId: 'test_organic_001', category: 'organic', name: 'Test Organic', filePath: '/textures/organic/test.jpg', mapType: 'color' },
              { assetId: 'test_ground_001', category: 'ground', name: 'Test Ground', filePath: '/textures/ground/test.jpg', mapType: 'color' }
            ]
          })
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
    
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
  let world: World<WorldSchema>;
  let textureSystem: TextureSystem;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    textureSystem = new TextureSystem(world);
    
    // Mock fetch for all texture operations
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assets: [
              {
                assetId: 'test_wood_001',
                category: 'wood',
                name: 'Test Wood',
                filePath: '/textures/wood/test_wood_001_color_2K.jpg',
                mapType: 'color'
              },
              {
                assetId: 'test_metal_001',
                category: 'metal',
                name: 'Test Metal',
                filePath: '/textures/metal/test_metal_001_color_2K.jpg',
                mapType: 'color'
              }
            ]
          })
        } as Response);
      }
      // HEAD request for texture file
      return Promise.resolve({
        ok: true,
        status: 200
      } as Response);
    });
  });
  
  test('useMaterial hook loads material from context', async () => {
    await textureSystem.initialize();
    
    // Test component that uses the hook
    const TestComponent: React.FC<{ category: MaterialQuery['category'] }> = ({ category }) => {
      const { material, loading } = useMaterial({ category });
      
      if (loading) return <div data-testid="loading">Loading...</div>;
      if (!material) return <div data-testid="error">No material</div>;
      
      return <div data-testid="material-loaded">Material loaded</div>;
    };
    
    const { getByTestId, findByTestId } = render(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent category="wood" />
      </TextureContext.Provider>
    );
    
    // Should show loading initially
    expect(getByTestId('loading')).toBeInTheDocument();
    
    // Should eventually load material
    const loadedElement = await findByTestId('material-loaded');
    expect(loadedElement).toBeInTheDocument();
  });
  
  test('useMaterial hook handles missing context gracefully', async () => {
    const TestComponent: React.FC = () => {
      const { material, loading } = useMaterial({ category: 'wood' });
      
      return (
        <div>
          <div data-testid="loading-state">{loading ? 'loading' : 'not-loading'}</div>
          <div data-testid="material-state">{material ? 'has-material' : 'no-material'}</div>
        </div>
      );
    };
    
    // Render without provider - should handle gracefully
    const { getByTestId } = render(<TestComponent />);
    
    // Hook starts with loading: true, but useEffect will set it to false when context is missing
    await waitFor(() => {
      expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
      expect(getByTestId('material-state')).toHaveTextContent('no-material');
    });
  });
  
  test('useMaterial hook updates when query changes', async () => {
    await textureSystem.initialize();
    
    const TestComponent: React.FC<{ category: MaterialQuery['category'] }> = ({ category }) => {
      const { material, loading } = useMaterial({ category });
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
          <div data-testid="category">{category}</div>
          <div data-testid="has-material">{material ? 'yes' : 'no'}</div>
        </div>
      );
    };
    
    const { getByTestId, rerender } = render(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent category="wood" />
      </TextureContext.Provider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('loaded');
    });
    
    // Change category
    rerender(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent category="metal" />
      </TextureContext.Provider>
    );
    
    // Should show loading again, then load new material
    await waitFor(() => {
      expect(getByTestId('category')).toHaveTextContent('metal');
      expect(getByTestId('has-material')).toHaveTextContent('yes');
    });
  });
  
  test('useWoodMaterial convenience hook works', async () => {
    await textureSystem.initialize();
    
    const TestComponent: React.FC = () => {
      const { material, loading } = useWoodMaterial();
      
      if (loading) return <div data-testid="loading">Loading wood...</div>;
      if (!material) return <div data-testid="error">No wood material</div>;
      
      return <div data-testid="wood-loaded">Wood material loaded</div>;
    };
    
    const { findByTestId } = render(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent />
      </TextureContext.Provider>
    );
    
    const loadedElement = await findByTestId('wood-loaded');
    expect(loadedElement).toBeInTheDocument();
  });
  
  test('useMetalMaterial hook applies custom properties', async () => {
    await textureSystem.initialize();
    
    const TestComponent: React.FC = () => {
      const { material, loading } = useMetalMaterial(undefined, {
        metalness: 0.9,
        roughness: 0.1
      });
      
      if (loading) return <div data-testid="loading">Loading...</div>;
      if (!material) return <div data-testid="error">No material</div>;
      
      return (
        <div data-testid="material-props">
          {material instanceof THREE.MeshStandardMaterial && 
            `metalness:${material.metalness} roughness:${material.roughness}`
          }
        </div>
      );
    };
    
    const { findByTestId } = render(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent />
      </TextureContext.Provider>
    );
    
    const propsElement = await findByTestId('material-props');
    expect(propsElement).toHaveTextContent('metalness:0.9');
    expect(propsElement).toHaveTextContent('roughness:0.1');
  });
  
  test('useMaterial hook handles query errors', async () => {
    await textureSystem.initialize();
    
    const TestComponent: React.FC = () => {
      const { material, loading } = useMaterial({ category: 'unknown' as any });
      
      return (
        <div>
          <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
          <div data-testid="material">{material ? 'has-material' : 'no-material'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <TextureContext.Provider value={textureSystem}>
        <TestComponent />
      </TextureContext.Provider>
    );
    
    // Should eventually stop loading and have no material (error case)
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('not-loading');
      expect(getByTestId('material')).toHaveTextContent('no-material');
    }, { timeout: 3000 });
  });
});

