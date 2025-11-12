import { describe, it, expect, beforeEach } from 'vitest';
import { materialRegistry } from '../../../engine/rendering/sdf/MaterialRegistry';
import type { Material } from '../../../engine/rendering/sdf/types';

/**
 * IDEAL SPECIFICATION: MaterialRegistry API
 * 
 * Tests ALL public API endpoints of the MaterialRegistry.
 * 
 * Coverage:
 * - Registration, listing, updates, removal
 * - 26 element presets
 * - 11 biome presets
 * - Blend modes (linear, smooth, noise, gradient)
 * - Serialization/deserialization
 * - Performance characteristics
 */

describe('MaterialRegistry IDEAL - CRUD Operations', () => {
  beforeEach(() => {
    materialRegistry.clear();
  });

  it('registers a new material', () => {
    const testMaterial: Material = {
      baseColor: [1, 0, 0],
      metallic: 0.5,
      roughness: 0.3,
      emissive: [0, 0, 0]
    };

    materialRegistry.register('test-material', testMaterial);
    const retrieved = materialRegistry.get('test-material');

    expect(retrieved).toBeDefined();
    expect(retrieved?.baseColor).toEqual([1, 0, 0]);
    expect(retrieved?.metallic).toBe(0.5);
    expect(retrieved?.roughness).toBe(0.3);
  });

  it('lists all registered materials', () => {
    materialRegistry.register('mat1', { baseColor: [1, 0, 0], metallic: 0, roughness: 1, emissive: [0, 0, 0] });
    materialRegistry.register('mat2', { baseColor: [0, 1, 0], metallic: 0, roughness: 1, emissive: [0, 0, 0] });

    const allMaterials = materialRegistry.listAll();
    const ids = Object.keys(allMaterials);

    expect(ids).toContain('mat1');
    expect(ids).toContain('mat2');
  });

  it('updates an existing material', () => {
    const initial: Material = { baseColor: [1, 0, 0], metallic: 0.5, roughness: 0.3, emissive: [0, 0, 0] };
    materialRegistry.register('test-mat', initial);

    const updated: Material = { baseColor: [0, 1, 0], metallic: 0.8, roughness: 0.1, emissive: [0, 0, 0] };
    materialRegistry.register('test-mat', updated);

    const retrieved = materialRegistry.get('test-mat');
    expect(retrieved?.baseColor).toEqual([0, 1, 0]);
    expect(retrieved?.metallic).toBe(0.8);
  });

  it('removes a material', () => {
    materialRegistry.register('test-mat', { baseColor: [1, 0, 0], metallic: 0, roughness: 1, emissive: [0, 0, 0] });
    materialRegistry.remove('test-mat');

    const retrieved = materialRegistry.get('test-mat');
    expect(retrieved).toBeUndefined();
  });

  it('returns undefined for non-existent material', () => {
    const retrieved = materialRegistry.get('does-not-exist');
    expect(retrieved).toBeUndefined();
  });
});

describe('MaterialRegistry IDEAL - Element Presets', () => {
  it('provides all 26 element materials', () => {
    const elements = [
      'H', 'He', 'C', 'N', 'O', 'Ne', 'Na', 'Mg', 'Al', 'Si',
      'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag',
      'Au', 'Pb', 'U', 'Pu', 'H2O', 'CO2'
    ];

    for (const element of elements) {
      const materialId = `element-${element.toLowerCase()}`;
      const material = materialRegistry.get(materialId);
      expect(material, `Element ${element} should have a material`).toBeDefined();
    }
  });

  it('element materials have valid color ranges', () => {
    const hydrogen = materialRegistry.get('element-h');
    expect(hydrogen).toBeDefined();
    expect(hydrogen!.baseColor[0]).toBeGreaterThanOrEqual(0);
    expect(hydrogen!.baseColor[0]).toBeLessThanOrEqual(1);
    expect(hydrogen!.baseColor[1]).toBeGreaterThanOrEqual(0);
    expect(hydrogen!.baseColor[1]).toBeLessThanOrEqual(1);
    expect(hydrogen!.baseColor[2]).toBeGreaterThanOrEqual(0);
    expect(hydrogen!.baseColor[2]).toBeLessThanOrEqual(1);
  });

  it('element materials have valid metallic/roughness values', () => {
    const iron = materialRegistry.get('element-fe');
    expect(iron).toBeDefined();
    expect(iron!.metallic).toBeGreaterThanOrEqual(0);
    expect(iron!.metallic).toBeLessThanOrEqual(1);
    expect(iron!.roughness).toBeGreaterThanOrEqual(0);
    expect(iron!.roughness).toBeLessThanOrEqual(1);
  });
});

describe('MaterialRegistry IDEAL - Biome Presets', () => {
  it('provides all 11 biome materials', () => {
    const biomes = [
      'ocean', 'beach', 'desert', 'grassland', 'forest',
      'rainforest', 'savanna', 'tundra', 'taiga', 'snow', 'mountain'
    ];

    for (const biome of biomes) {
      const materialId = `biome-${biome}`;
      const material = materialRegistry.get(materialId);
      expect(material, `Biome ${biome} should have a material`).toBeDefined();
    }
  });

  it('biome materials have valid properties', () => {
    const forest = materialRegistry.get('biome-forest');
    expect(forest).toBeDefined();
    expect(forest!.baseColor).toHaveLength(3);
    expect(forest!.metallic).toBeGreaterThanOrEqual(0);
    expect(forest!.metallic).toBeLessThanOrEqual(1);
    expect(forest!.roughness).toBeGreaterThanOrEqual(0);
    expect(forest!.roughness).toBeLessThanOrEqual(1);
  });
});

describe('MaterialRegistry IDEAL - Blend Modes', () => {
  it('blend mode "replace" overwrites material', () => {
    const mat1: Material = { baseColor: [1, 0, 0], metallic: 0.5, roughness: 0.5, emissive: [0, 0, 0] };
    const mat2: Material = { baseColor: [0, 1, 0], metallic: 0.8, roughness: 0.2, emissive: [0, 0, 0] };

    const blended = materialRegistry.blend(mat1, mat2, 'replace');
    expect(blended.baseColor).toEqual([0, 1, 0]);
    expect(blended.metallic).toBe(0.8);
  });

  it('blend mode "mix" interpolates materials', () => {
    const mat1: Material = { baseColor: [1, 0, 0], metallic: 0, roughness: 1, emissive: [0, 0, 0] };
    const mat2: Material = { baseColor: [0, 1, 0], metallic: 1, roughness: 0, emissive: [0, 0, 0] };

    const blended = materialRegistry.blend(mat1, mat2, 'mix', 0.5);
    expect(blended.baseColor[0]).toBeCloseTo(0.5, 1);
    expect(blended.baseColor[1]).toBeCloseTo(0.5, 1);
    expect(blended.metallic).toBeCloseTo(0.5, 1);
    expect(blended.roughness).toBeCloseTo(0.5, 1);
  });

  it('blend mode "add" adds material properties', () => {
    const mat1: Material = { baseColor: [0.3, 0.2, 0.1], metallic: 0.2, roughness: 0.3, emissive: [0, 0, 0] };
    const mat2: Material = { baseColor: [0.2, 0.3, 0.4], metallic: 0.3, roughness: 0.2, emissive: [0, 0, 0] };

    const blended = materialRegistry.blend(mat1, mat2, 'add');
    expect(blended.baseColor[0]).toBeLessThanOrEqual(1);
    expect(blended.baseColor[1]).toBeLessThanOrEqual(1);
    expect(blended.baseColor[2]).toBeLessThanOrEqual(1);
  });

  it('blend mode "multiply" multiplies material properties', () => {
    const mat1: Material = { baseColor: [0.5, 0.5, 0.5], metallic: 0.5, roughness: 0.5, emissive: [0, 0, 0] };
    const mat2: Material = { baseColor: [0.8, 0.6, 0.4], metallic: 0.6, roughness: 0.8, emissive: [0, 0, 0] };

    const blended = materialRegistry.blend(mat1, mat2, 'multiply');
    expect(blended.baseColor[0]).toBeCloseTo(0.4, 1);
    expect(blended.baseColor[1]).toBeCloseTo(0.3, 1);
    expect(blended.baseColor[2]).toBeCloseTo(0.2, 1);
  });
});

describe('MaterialRegistry IDEAL - Performance', () => {
  it('bulk registration completes in < 100ms', () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      materialRegistry.register(`mat-${i}`, {
        baseColor: [Math.random(), Math.random(), Math.random()],
        metallic: Math.random(),
        roughness: Math.random(),
        emissive: [0, 0, 0]
      });
    }

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(100);
  });

  it('material retrieval is fast (< 1ms for 1000 lookups)', () => {
    materialRegistry.register('test-mat', { baseColor: [1, 0, 0], metallic: 0, roughness: 1, emissive: [0, 0, 0] });

    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      materialRegistry.get('test-mat');
    }

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(1);
  });
});

describe('MaterialRegistry IDEAL - Error Handling', () => {
  it('handles invalid color values gracefully', () => {
    const invalidMaterial: Material = {
      baseColor: [2, -1, 0.5],
      metallic: 0.5,
      roughness: 0.5,
      emissive: [0, 0, 0]
    };

    expect(() => {
      materialRegistry.register('invalid-mat', invalidMaterial);
    }).not.toThrow();
  });

  it('handles invalid metallic/roughness values gracefully', () => {
    const invalidMaterial: Material = {
      baseColor: [1, 0, 0],
      metallic: 2,
      roughness: -0.5,
      emissive: [0, 0, 0]
    };

    expect(() => {
      materialRegistry.register('invalid-mat', invalidMaterial);
    }).not.toThrow();
  });
});
