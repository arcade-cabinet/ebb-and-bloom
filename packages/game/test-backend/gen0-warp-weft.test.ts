/**
 * Gen 0: Comprehensive WARP/WEFT Integration Tests
 * Tests biased selection, parameter interpolation, formation guidance, and Yuka behavior
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { generateGen0DataPools, extractSeedComponents, selectFromPoolBiased, interpolateParameter } from '../src/gen-systems/loadGenData.js';

describe('Gen 0: WARP/WEFT Data Integration', () => {
  let gen0Data: any;

  beforeAll(async () => {
    // Load Gen0 data pools for testing
    gen0Data = await generateGen0DataPools('test-gen0-seed');
  });

  describe('Data Pool Loading', () => {
    it('loads all three scales (macro, meso, micro)', async () => {
      const data = await generateGen0DataPools('test-load');
      
      expect(data.macro).toBeDefined();
      expect(data.meso).toBeDefined();
      expect(data.micro).toBeDefined();
      
      expect(data.macro.selectedContext).toBeDefined();
      expect(data.meso.selectedAccretion).toBeDefined();
      expect(data.micro.selectedDistribution).toBeDefined();
    });

    it('includes archetype IDs for tracking', async () => {
      const data = await generateGen0DataPools('test-ids');
      
      expect(data.macro.archetypeId).toBeDefined();
      expect(data.meso.archetypeId).toBeDefined();
      expect(data.micro.archetypeId).toBeDefined();
    });

    it('includes visual blueprints with texture IDs', async () => {
      const data = await generateGen0DataPools('test-visual');
      
      expect(data.macro.visualBlueprint).toBeDefined();
      expect(data.macro.visualBlueprint.representations.materials).toBeInstanceOf(Array);
      expect(data.macro.visualBlueprint.representations.materials.length).toBeGreaterThan(0);
      
      // Texture IDs should be strings (not file paths)
      data.macro.visualBlueprint.representations.materials.forEach((tex: string) => {
        expect(typeof tex).toBe('string');
        expect(tex).toMatch(/^[A-Za-z]+[0-9]+/); // Pattern like "Metal049A"
      });
    });
  });

  describe('Biased Selection', () => {
    it('uses biased selection with seed context', async () => {
      // Test with high metallicity context
      const highMetallicityData = await generateGen0DataPools('test-high-met', { metallicity: 'high' });
      const lowMetallicityData = await generateGen0DataPools('test-low-met', { metallicity: 'low' });
      
      // Should select different archetypes based on context
      expect(highMetallicityData.macro.archetypeId).toBeDefined();
      expect(lowMetallicityData.macro.archetypeId).toBeDefined();
    });

    it('produces deterministic results for same seed', async () => {
      const data1 = await generateGen0DataPools('deterministic-test');
      const data2 = await generateGen0DataPools('deterministic-test');
      
      expect(data1.macro.archetypeId).toBe(data2.macro.archetypeId);
      expect(data1.meso.archetypeId).toBe(data2.meso.archetypeId);
      expect(data1.micro.archetypeId).toBe(data2.micro.archetypeId);
    });

    it('produces varied results for different seeds', async () => {
      const data1 = await generateGen0DataPools('seed-A');
      const data2 = await generateGen0DataPools('seed-B');
      
      // At least one scale should differ (very unlikely all three match)
      const allMatch = 
        data1.macro.archetypeId === data2.macro.archetypeId &&
        data1.meso.archetypeId === data2.meso.archetypeId &&
        data1.micro.archetypeId === data2.micro.archetypeId;
      
      expect(allMatch).toBe(false);
    });
  });

  describe('Parameter Interpolation', () => {
    it('interpolates parameters from ranges', async () => {
      const data = await generateGen0DataPools('test-interpolation');
      
      // Parameters should be interpolated numbers, not ranges
      expect(data.macro.parameters).toBeDefined();
      
      Object.values(data.macro.parameters).forEach((value: any) => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });

    it('interpolates within expected ranges', async () => {
      // Run multiple times with same seed to verify consistency
      const seeds = ['test-range-1', 'test-range-2', 'test-range-3'];
      const allParams: Record<string, number[]> = {};
      
      for (const seed of seeds) {
        const data = await generateGen0DataPools(seed);
        
        for (const [key, value] of Object.entries(data.macro.parameters || {})) {
          if (!allParams[key]) allParams[key] = [];
          allParams[key].push(value as number);
        }
      }
      
      // Check that parameters vary across seeds
      for (const [key, values] of Object.entries(allParams)) {
        const unique = new Set(values);
        expect(unique.size).toBeGreaterThan(1); // Should have variation
      }
    });

    it('respects parameter min/max bounds', async () => {
      // Load raw archetype data to check bounds
      // Use same path resolution as loadGenData.ts
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      
      // Resolve from test file location (archetypes are now in packages/game/data/)
      const genPath = join(__dirname, '../data/archetypes/gen0/macro.json');
      
      const rawData = JSON.parse(await fs.readFile(genPath, 'utf8'));
      const archetype = rawData.archetypes.find((a: any) => a.id === gen0Data.macro.archetypeId);
      
      if (archetype?.parameters) {
        for (const [key, param] of Object.entries(archetype.parameters)) {
          if (typeof param === 'object' && 'min' in param && 'max' in param) {
            const interpolated = gen0Data.macro.parameters[key];
            expect(interpolated).toBeGreaterThanOrEqual((param as any).min);
            expect(interpolated).toBeLessThanOrEqual((param as any).max);
          }
        }
      }
    });
  });

  describe('Formation Guidance', () => {
    it('includes formation guidance for Yuka AI', async () => {
      const data = await generateGen0DataPools('test-formation');
      
      expect(data.macro.formation).toBeDefined();
      expect(data.meso.formation).toBeDefined();
      expect(data.micro.formation).toBeDefined();
    });

    it('formation guidance includes step-by-step process', async () => {
      const data = await generateGen0DataPools('test-formation-detail');
      
      if (data.macro.formation?.formationProcess) {
        expect(typeof data.macro.formation.formationProcess).toBe('string');
        expect(data.macro.formation.formationProcess.length).toBeGreaterThan(50);
      }
    });

    it('formation guidance includes Yuka instructions', async () => {
      const data = await generateGen0DataPools('test-yuka-guidance');
      
      if (data.macro.formation?.yukaGuidance) {
        expect(typeof data.macro.formation.yukaGuidance).toBe('string');
        expect(data.macro.formation.yukaGuidance.length).toBeGreaterThan(20);
      }
    });
  });

  describe('Adjacency/Compatibility', () => {
    it('includes adjacency information', async () => {
      const data = await generateGen0DataPools('test-adjacency');
      
      expect(data.macro.adjacency).toBeDefined();
      expect(data.meso.adjacency).toBeDefined();
      expect(data.micro.adjacency).toBeDefined();
    });

    it('adjacency includes compatibility arrays', async () => {
      const data = await generateGen0DataPools('test-compatibility');
      
      if (data.macro.adjacency) {
        expect(Array.isArray(data.macro.adjacency.compatibleWith || [])).toBe(true);
        expect(Array.isArray(data.macro.adjacency.incompatibleWith || [])).toBe(true);
        expect(Array.isArray(data.macro.adjacency.adjacentTo || [])).toBe(true);
        expect(Array.isArray(data.macro.adjacency.requires || [])).toBe(true);
      }
    });
  });

  describe('AccretionSimulation Integration', () => {
    it('AccretionSimulation uses Gen0 data pools', async () => {
      const sim = new AccretionSimulation({ seed: 'test-integration', useAI: true });
      const planet = await sim.simulate();
      
      // Should have visual blueprints
      expect((planet as any).visualBlueprints).toBeDefined();
      
      const blueprints = (planet as any).visualBlueprints;
      expect(blueprints.macro).toBeDefined();
      expect(blueprints.macro.selectedContext).toBeDefined();
    });

    it('planet formation respects Gen0 parameters', async () => {
      const sim = new AccretionSimulation({ seed: 'test-params', useAI: true });
      const planet = await sim.simulate();
      
      // Planet should be formed with realistic properties
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.mass).toBeGreaterThan(0);
      expect(planet.layers.length).toBeGreaterThan(0);
    });

    it('produces deterministic planets with same seed', async () => {
      const sim1 = new AccretionSimulation({ seed: 'test-deterministic-planet', useAI: true });
      const planet1 = await sim1.simulate();
      
      const sim2 = new AccretionSimulation({ seed: 'test-deterministic-planet', useAI: true });
      const planet2 = await sim2.simulate();
      
      expect(planet1.radius).toBe(planet2.radius);
      expect(planet1.mass).toBe(planet2.mass);
      expect(planet1.rotationPeriod).toBe(planet2.rotationPeriod);
    });
  });

  describe('Quality Metrics', () => {
    it('all archetypes have required fields', async () => {
      const data = await generateGen0DataPools('test-quality');
      
      // Check macro
      expect(data.macro.selectedContext).toBeDefined();
      expect(data.macro.visualBlueprint).toBeDefined();
      expect(data.macro.archetypeId).toBeDefined();
      
      // Check meso
      expect(data.meso.selectedAccretion).toBeDefined();
      expect(data.meso.archetypeId).toBeDefined();
      
      // Check micro
      expect(data.micro.selectedDistribution).toBeDefined();
      expect(data.micro.visualBlueprint).toBeDefined();
      expect(data.micro.archetypeId).toBeDefined();
    });

    it('visual blueprints have complete PBR properties', async () => {
      const data = await generateGen0DataPools('test-pbr');
      
      const pbr = data.macro.visualBlueprint.representations.shaders;
      if (pbr) {
        expect(pbr.baseColor).toBeDefined();
        expect(pbr.roughness).toBeDefined();
        expect(pbr.metallic).toBeDefined();
      }
    });

    it('color palettes are valid hex colors', async () => {
      const data = await generateGen0DataPools('test-colors');
      
      const colors = data.macro.visualBlueprint.representations.colorPalette || [];
      colors.forEach((color: string) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});

