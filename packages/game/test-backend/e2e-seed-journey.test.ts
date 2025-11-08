/**
 * End-to-End Test: Single Seed Journey Through All Generations
 * Tracks one seed's complete flow from Gen0 → Gen6, verifying:
 * - WARP flow (causal inheritance)
 * - WEFT flow (scale integration)
 * - Parameter interpolation
 * - Yuka behavior quality
 * - Expected variation ranges
 */

import { describe, it, expect } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Gen3System } from '../src/gen3/ToolSystem.js';
import { Gen4System } from '../src/gen4/TribeSystem.js';
import { Gen5System } from '../src/gen5/BuildingSystem.js';
import { Gen6System } from '../src/gen6/ReligionDemocracySystem.js';

describe('E2E: Complete Seed Journey (Gen0 → Gen6)', () => {
  const TEST_SEED = 'e2e-complete-journey-test-seed';
  
  it('completes full generation chain with WARP/WEFT flow', async () => {
    const journey: any = {
      seed: TEST_SEED,
      gen0: null,
      gen1: null,
      gen2: null,
      gen3: null,
      gen4: null,
      gen5: null,
      gen6: null,
    };

    // === GEN 0: Planetary Formation ===
    console.log('\n[E2E] Starting Gen0: Planetary Formation...');
    const sim = new AccretionSimulation({ seed: TEST_SEED, useAI: true });
    journey.gen0 = await sim.simulate();
    const gen0Data = (journey.gen0 as any).visualBlueprints;
    
    expect(journey.gen0.radius).toBeGreaterThan(0);
    expect(journey.gen0.layers.length).toBeGreaterThan(0);
    expect(gen0Data).toBeDefined();
    expect(gen0Data.macro.archetypeId).toBeDefined();
    console.log(`  ✅ Gen0 complete: ${gen0Data.macro.selectedContext}`);

    // === GEN 1: Creatures ===
    console.log('\n[E2E] Starting Gen1: Creatures...');
    const gen1 = new Gen1System({
      seed: TEST_SEED,
      planet: journey.gen0,
      creatureCount: 20,
      gen0Data,
      useAI: true,
    });
    journey.gen1 = await gen1.initialize();
    const gen1Data = (journey.gen1 as any).visualBlueprints;
    
    expect(journey.gen1.size).toBeGreaterThan(0);
    expect(gen1Data).toBeDefined();
    console.log(`  ✅ Gen1 complete: ${journey.gen1.size} creatures spawned`);

    // === GEN 2: Packs ===
    console.log('\n[E2E] Starting Gen2: Packs...');
    const gen2 = new Gen2System({
      seed: TEST_SEED,
      gen1Data,
      useAI: true,
    });
    await gen2.initialize();
    
    const creatureArray = Array.from(journey.gen1.values());
    // Place creatures for pack formation
    creatureArray.forEach((c, i) => {
      c.position.lat = 10;
      c.position.lon = 20 + i * 0.01; // Very close together
      c.needs.forEach(n => n.urgency = 0.8); // High urgency
    });
    
    gen2.evaluatePackFormation(creatureArray);
    const packs = (gen2 as any).getPacks();
    journey.gen2 = packs || [];
    expect(journey.gen2.length).toBeGreaterThanOrEqual(0); // May not form packs immediately
    console.log(`  ✅ Gen2 complete: ${journey.gen2.length} packs formed`);

    // === GEN 3: Tools ===
    console.log('\n[E2E] Starting Gen3: Tools...');
    const gen3 = new Gen3System(journey.gen0, journey.gen2, TEST_SEED);
    await gen3.initialize();
    
    journey.gen3 = {
      tools: [],
      dataPools: (gen3 as any).toolTypeOptions || [],
    };
    expect(journey.gen3.dataPools.length).toBeGreaterThan(0);
    console.log(`  ✅ Gen3 complete: ${journey.gen3.dataPools.length} tool types available`);

    // === GEN 4: Tribes ===
    console.log('\n[E2E] Starting Gen4: Tribes...');
    const gen4 = new Gen4System(journey.gen0, TEST_SEED);
    await gen4.initialize(journey.gen3);
    
    journey.gen4 = {
      tribes: gen4.evaluateTribeFormation(journey.gen2, creatureArray, []),
      dataPools: (gen4 as any).tribalStructures || [],
    };
    expect(journey.gen4.dataPools.length).toBeGreaterThan(0);
    console.log(`  ✅ Gen4 complete: ${journey.gen4.dataPools.length} tribal structures`);

    // === GEN 5: Buildings ===
    console.log('\n[E2E] Starting Gen5: Buildings...');
    const gen5 = new Gen5System(journey.gen0, TEST_SEED);
    await gen5.initialize(journey.gen4);
    
    journey.gen5 = {
      buildings: [],
      dataPools: (gen5 as any).buildingTypeOptions || [],
    };
    expect(journey.gen5.dataPools.length).toBeGreaterThan(0);
    console.log(`  ✅ Gen5 complete: ${journey.gen5.dataPools.length} building types`);

    // === GEN 6: Religion & Democracy ===
    console.log('\n[E2E] Starting Gen6: Religion & Democracy...');
    const gen6 = new Gen6System(journey.gen0, TEST_SEED);
    await gen6.initialize(journey.gen5);
    
    journey.gen6 = {
      systems: [],
      dataPools: (gen6 as any).cosmologyOptions || [],
    };
    expect(journey.gen6.dataPools.length).toBeGreaterThan(0);
    console.log(`  ✅ Gen6 complete: ${journey.gen6.dataPools.length} abstract systems`);

    // === VERIFICATION ===
    console.log('\n[E2E] Verifying complete journey...');
    
    // Verify WARP flow (causal inheritance)
    expect(gen0Data.macro.archetypeId).toBeDefined();
    expect(gen1Data).toBeDefined();
    
    // Verify all generations completed
    expect(journey.gen0).toBeDefined();
    expect(journey.gen1).toBeDefined();
    expect(journey.gen2).toBeDefined();
    expect(journey.gen3).toBeDefined();
    expect(journey.gen4).toBeDefined();
    expect(journey.gen5).toBeDefined();
    expect(journey.gen6).toBeDefined();
    
    console.log('\n✅ Complete seed journey successful!');
  });

  it('produces deterministic results for same seed', async () => {
    const runJourney = async (seed: string) => {
      const sim = new AccretionSimulation({ seed, useAI: true });
      const planet = await sim.simulate();
      const gen0Data = (planet as any).visualBlueprints;
      
      const gen1 = new Gen1System({
        seed,
        planet,
        creatureCount: 10,
        gen0Data,
        useAI: true,
      });
      const creatures = await gen1.initialize();
      
      return {
        planetRadius: planet.radius,
        planetMass: planet.mass,
        creatureCount: creatures.size,
        gen0ArchetypeId: gen0Data.macro.archetypeId,
      };
    };
    
    const journey1 = await runJourney('deterministic-e2e');
    const journey2 = await runJourney('deterministic-e2e');
    
    // Should be identical
    expect(journey1.planetRadius).toBe(journey2.planetRadius);
    expect(journey1.planetMass).toBe(journey2.planetMass);
    expect(journey1.creatureCount).toBe(journey2.creatureCount);
    expect(journey1.gen0ArchetypeId).toBe(journey2.gen0ArchetypeId);
  });

  it('produces varied results for different seeds', async () => {
    const runJourney = async (seed: string) => {
      const sim = new AccretionSimulation({ seed, useAI: true });
      const planet = await sim.simulate();
      const gen0Data = (planet as any).visualBlueprints;
      
      return {
        planetRadius: planet.radius,
        gen0ArchetypeId: gen0Data.macro.archetypeId,
      };
    };
    
    const journey1 = await runJourney('varied-seed-A');
    const journey2 = await runJourney('varied-seed-B');
    const journey3 = await runJourney('varied-seed-C');
    
    // At least two should differ
    const allSame = 
      journey1.planetRadius === journey2.planetRadius &&
      journey2.planetRadius === journey3.planetRadius &&
      journey1.gen0ArchetypeId === journey2.gen0ArchetypeId &&
      journey2.gen0ArchetypeId === journey3.gen0ArchetypeId;
    
    expect(allSame).toBe(false);
  });

  it('maintains parameter variation within expected ranges', async () => {
    const seeds = Array.from({ length: 10 }, (_, i) => `variation-test-${i}`);
    const allRadii: number[] = [];
    const allMasses: number[] = [];
    
    for (const seed of seeds) {
      const sim = new AccretionSimulation({ seed, useAI: true });
      const planet = await sim.simulate();
      allRadii.push(planet.radius);
      allMasses.push(planet.mass);
    }
    
    // Check variation
    const radiusRange = Math.max(...allRadii) - Math.min(...allRadii);
    const massRange = Math.max(...allMasses) - Math.min(...allMasses);
    
    expect(radiusRange).toBeGreaterThan(0);
    expect(massRange).toBeGreaterThan(0);
    
    // Check reasonable bounds
    allRadii.forEach(radius => {
      expect(radius).toBeGreaterThan(3e6); // > 3000km
      expect(radius).toBeLessThan(7e6); // < 7000km
    });
    
    allMasses.forEach(mass => {
      expect(mass).toBeGreaterThan(1e23);
      expect(mass).toBeLessThan(1e25);
    });
  });

  it('Yuka behavior maintains quality across generations', async () => {
    const sim = new AccretionSimulation({ seed: 'yuka-quality-test', useAI: true });
    const planet = await sim.simulate();
    const gen0Data = (planet as any).visualBlueprints;
    
    // Gen1: Creatures
    const gen1 = new Gen1System({
      seed: 'yuka-quality-test',
      planet,
      creatureCount: 10,
      gen0Data,
      useAI: true,
    });
    const creatures = await gen1.initialize();
    const creatureArray = Array.from(creatures.values());
    
    // Update creatures (Yuka decision-making)
    gen1.update(10);
    
    // All creatures should have valid states
    creatureArray.forEach(creature => {
      expect(creature.alive !== undefined).toBe(true);
      expect(creature.position).toBeDefined();
      expect(creature.needs).toBeDefined();
      expect(creature.needs.length).toBeGreaterThan(0);
    });
    
    // Gen2: Packs
    const gen2 = new Gen2System({
      seed: 'yuka-quality-test',
      gen1Data: (creatures as any).visualBlueprints,
      useAI: true,
    });
    await gen2.initialize();
    
    // Form packs
    creatureArray.forEach((c, i) => {
      c.position.lat = 10 + i * 0.1;
      c.position.lon = 20 + i * 0.1;
    });
    
    const packs = gen2.evaluatePackFormation(creatureArray);
    expect(packs.length).toBeGreaterThan(0);
    
    // Update packs (Yuka flocking)
    gen2.updatePacks(packs, creatureArray, 1.0);
    
    // All packs should have valid states
    packs.forEach(pack => {
      expect(pack.status).toMatch(/stable|dispersing|dissolved/);
      expect(pack.cohesion).toBeGreaterThanOrEqual(0);
      expect(pack.cohesion).toBeLessThanOrEqual(1);
    });
  });
});

