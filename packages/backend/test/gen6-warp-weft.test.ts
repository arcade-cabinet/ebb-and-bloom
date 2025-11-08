/**
 * Gen 6: Comprehensive WARP/WEFT Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Gen3System } from '../src/gen3/ToolSystem.js';
import { Gen4System } from '../src/gen4/TribeSystem.js';
import { Gen5System } from '../src/gen5/BuildingSystem.js';
import { Gen6System } from '../src/gen6/ReligionDemocracySystem.js';
import { generateGen6DataPools } from '../src/gen-systems/loadGenData.js';

describe('Gen 6: WARP/WEFT Data Integration', () => {
  let planet: any;
  let gen5Data: any;

  beforeAll(async () => {
    const sim = new AccretionSimulation({ seed: 'test-gen6-planet', useAI: true });
    planet = await sim.simulate();
    const gen0Data = (planet as any).visualBlueprints;
    
    const gen1 = new Gen1System({
      seed: 'test-gen6-creatures',
      planet,
      creatureCount: 10,
      gen0Data,
      useAI: true,
    });
    const creatures = await gen1.initialize();
    const gen1Data = (creatures as any).visualBlueprints;
    
    const gen2 = new Gen2System({
      seed: 'test-gen6-packs',
      gen1Data,
      useAI: true,
    });
    await gen2.initialize();
    const creatureArray = Array.from(creatures.values());
    creatureArray.forEach((c, i) => {
      c.position.lat = 10 + i * 0.1;
      c.position.lon = 20 + i * 0.1;
    });
    const packs = gen2.evaluatePackFormation(creatureArray);
    
    const gen3 = new Gen3System(planet, packs, 'test-gen6-tools');
    await gen3.initialize();
    const gen3Data = (gen3 as any).toolTypeOptions || [];
    
    const gen4 = new Gen4System(planet, 'test-gen6-tribes');
    await gen4.initialize(gen3Data);
    const gen4Data = (gen4 as any).tribalStructures || [];
    
    const gen5 = new Gen5System(planet, 'test-gen6-buildings');
    await gen5.initialize(gen4Data);
    gen5Data = (gen5 as any).buildingTypeOptions || [];
  });

  describe('WARP Flow (Gen5 → Gen6)', () => {
    it('uses Gen5 data for biased selection', async () => {
      const data = await generateGen6DataPools(planet, gen5Data, 'test-warp');
      
      expect(data.macro.selectedCosmology).toBeDefined();
      expect(data.macro.archetypeId).toBeDefined();
      expect(data.macro.formation).toBeDefined();
    });

    it('produces deterministic results', async () => {
      const data1 = await generateGen6DataPools(planet, gen5Data, 'deterministic-gen6');
      const data2 = await generateGen6DataPools(planet, gen5Data, 'deterministic-gen6');
      
      expect(data1.macro.archetypeId).toBe(data2.macro.archetypeId);
    });
  });

  describe('ReligionDemocracySystem Integration', () => {
    it('ReligionDemocracySystem uses Gen6 data pools', async () => {
      const gen6 = new Gen6System(planet, 'test-religion-system');
      await gen6.initialize(gen5Data);
      
      expect((gen6 as any).cosmologyOptions.length).toBeGreaterThan(0);
    });
  });
});
