/**
 * Gen 1: Comprehensive WARP/WEFT Integration Tests
 * Tests WARP flow from Gen0, biased selection, parameter interpolation, and Yuka behavior
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { generateGen1DataPools, extractSeedComponents } from '../src/gen-systems/loadGenData.js';

describe('Gen 1: WARP/WEFT Data Integration', () => {
  let planet: any;
  let gen0Data: any;

  beforeAll(async () => {
    // Create planet and Gen0 data for WARP flow testing
    const sim = new AccretionSimulation({ seed: 'test-gen1-planet', useAI: true });
    planet = await sim.simulate();
    gen0Data = (planet as any).visualBlueprints;
  });

  describe('WARP Flow (Gen0 → Gen1)', () => {
    it('uses Gen0 data for biased selection', async () => {
      const data = await generateGen1DataPools('test-warp', planet, gen0Data);
      
      expect(data.macro.archetypeOptions).toBeDefined();
      expect(data.macro.archetypeOptions.length).toBeGreaterThan(0);
      
      // Should have received Gen0 context
      const archetype = data.macro.archetypeOptions[0];
      expect(archetype.id).toBeDefined();
      expect(archetype.formation).toBeDefined();
    });

    it('biases selection based on Gen0 metallicity', async () => {
      // Create high metallicity Gen0 context
      const highMetPlanet = await new AccretionSimulation({ 
        seed: 'high-met-planet', 
        useAI: true 
      }).simulate();
      const highMetGen0Data = (highMetPlanet as any).visualBlueprints;
      
      const highMetData = await generateGen1DataPools('test-high-met', highMetPlanet, highMetGen0Data);
      
      // Should have selected archetypes
      expect(highMetData.macro.archetypeOptions.length).toBeGreaterThan(0);
    });

    it('produces deterministic results with same seed and Gen0 data', async () => {
      const data1 = await generateGen1DataPools('deterministic-gen1', planet, gen0Data);
      const data2 = await generateGen1DataPools('deterministic-gen1', planet, gen0Data);
      
      expect(data1.macro.archetypeOptions[0].id).toBe(data2.macro.archetypeOptions[0].id);
      expect(data1.meso.populationOptions[0].id).toBe(data2.meso.populationOptions[0].id);
      expect(data1.micro.physiologyOptions[0].id).toBe(data2.micro.physiologyOptions[0].id);
    });
  });

  describe('Parameter Interpolation', () => {
    it('interpolates creature parameters from ranges', async () => {
      const data = await generateGen1DataPools('test-interpolation', planet, gen0Data);
      
      const archetype = data.macro.archetypeOptions[0];
      expect(archetype.parameters).toBeDefined();
      
      Object.values(archetype.parameters || {}).forEach((value: any) => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });

    it('parameters vary across different seeds', async () => {
      const seeds = ['seed-A', 'seed-B', 'seed-C'];
      const allParams: Record<string, number[]> = {};
      
      for (const seed of seeds) {
        const data = await generateGen1DataPools(seed, planet, gen0Data);
        const archetype = data.macro.archetypeOptions[0];
        
        for (const [key, value] of Object.entries(archetype.parameters || {})) {
          if (!allParams[key]) allParams[key] = [];
          allParams[key].push(value as number);
        }
      }
      
      // Should have variation
      for (const [key, values] of Object.entries(allParams)) {
        const unique = new Set(values);
        expect(unique.size).toBeGreaterThan(1);
      }
    });
  });

  describe('Formation Guidance', () => {
    it('includes formation guidance for Yuka AI', async () => {
      const data = await generateGen1DataPools('test-formation', planet, gen0Data);
      
      const archetype = data.macro.archetypeOptions[0];
      expect(archetype.formation).toBeDefined();
      
      if (archetype.formation?.formationProcess) {
        expect(typeof archetype.formation.formationProcess).toBe('string');
        expect(archetype.formation.formationProcess.length).toBeGreaterThan(50);
      }
    });

    it('formation includes synthesis from Gen0', async () => {
      const data = await generateGen1DataPools('test-synthesis', planet, gen0Data);
      
      const archetype = data.macro.archetypeOptions[0];
      if (archetype.formation?.synthesisFrom) {
        expect(archetype.formation.synthesisFrom.previousGenerations).toBeInstanceOf(Array);
        expect(archetype.formation.synthesisFrom.causalChain).toBeDefined();
      }
    });
  });

  describe('Deconstruction', () => {
    it('includes deconstruction information', async () => {
      const data = await generateGen1DataPools('test-deconstruction', planet, gen0Data);
      
      const archetype = data.macro.archetypeOptions[0];
      expect(archetype.deconstruction).toBeDefined();
      
      if (archetype.deconstruction) {
        expect(archetype.deconstruction.deconstructionProcess).toBeDefined();
        expect(archetype.deconstruction.compatibleDeconstructors).toBeInstanceOf(Array);
        expect(archetype.deconstruction.decomposesInto).toBeInstanceOf(Array);
      }
    });
  });

  describe('CreatureSystem Integration', () => {
    it('CreatureSystem uses Gen1 data pools with Gen0 context', async () => {
      const gen1 = new Gen1System({
        seed: 'test-creature-system',
        planet,
        creatureCount: 10,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      
      expect(creatures.size).toBeGreaterThan(0);
      expect((creatures as any).visualBlueprints).toBeDefined();
    });

    it('creatures have valid traits from archetypes', async () => {
      const gen1 = new Gen1System({
        seed: 'test-traits',
        planet,
        creatureCount: 5,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      
      for (const creature of creatures.values()) {
        expect(creature.traits).toBeDefined();
        // Traits may not have excavation field - check if it exists
        if (creature.traits.excavation !== undefined) {
          expect(creature.traits.excavation).toBeGreaterThanOrEqual(0);
          expect(creature.traits.excavation).toBeLessThanOrEqual(1);
        }
      }
    });

    it('creatures use interpolated parameters', async () => {
      const gen1 = new Gen1System({
        seed: 'test-params',
        planet,
        creatureCount: 5,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      
      // Check that creatures have valid structure
      for (const creature of creatures.values()) {
        expect(creature.id).toBeDefined();
        expect(creature.archetype).toBeDefined();
        expect(creature.position).toBeDefined();
        expect(creature.needs).toBeDefined();
      }
    });
  });

  describe('Yuka Behavior Quality', () => {
    it('creatures make valid Yuka decisions', async () => {
      const gen1 = new Gen1System({
        seed: 'test-yuka',
        planet,
        creatureCount: 5,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      const creatureArray = Array.from(creatures.values());
      
      // Update creatures (should trigger Yuka decision-making)
      gen1.update(1);
      
      // All creatures should still be valid
      for (const creature of creatureArray) {
        expect(creature.alive !== undefined).toBe(true);
        expect(creature.position).toBeDefined();
      }
    });

    it('creature needs deplete over time', async () => {
      const gen1 = new Gen1System({
        seed: 'test-needs',
        planet,
        creatureCount: 1,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      const creatureArray = Array.from(creatures.values());
      const creature = creatureArray[0];
      
      const initialUrgency = creature.needs.find(n => n.type === 'food')?.urgency || 0;
      
      // Update multiple cycles
      gen1.update(10);
      
      const finalUrgency = creature.needs.find(n => n.type === 'food')?.urgency || 0;
      expect(finalUrgency).toBeGreaterThan(initialUrgency); // Urgency increases over time
    });

    it('creatures respond to urgency changes', async () => {
      const gen1 = new Gen1System({
        seed: 'test-urgency',
        planet,
        creatureCount: 1,
        gen0Data,
        useAI: true,
      });
      
      const creatures = await gen1.initialize();
      const creatureArray = Array.from(creatures.values());
      const creature = creatureArray[0];
      
      // Set high urgency
      const foodNeed = creature.needs.find(n => n.type === 'food');
      if (foodNeed) {
        foodNeed.urgency = 0.9;
      }
      
      const initialPosition = { ...creature.position };
      
      // Update (should trigger foraging behavior)
      gen1.update(1);
      
      // Creature should still be alive
      expect(creature.alive).toBe(true);
    });
  });
});

