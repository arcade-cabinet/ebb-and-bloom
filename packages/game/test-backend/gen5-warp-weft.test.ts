/**
 * Gen 5: Comprehensive WARP/WEFT Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Gen3System } from '../src/gen3/ToolSystem.js';
import { Gen4System } from '../src/gen4/TribeSystem.js';
import { Gen5System } from '../src/gen5/BuildingSystem.js';
import { generateGen5DataPools } from '../src/gen-systems/loadGenData.js';

describe('Gen 5: WARP/WEFT Data Integration', () => {
  let planet: any;
  let gen4Data: any;

  beforeAll(async () => {
    const sim = new AccretionSimulation({ seed: 'test-gen5-planet', useAI: true });
    planet = await sim.simulate();
    const gen0Data = (planet as any).visualBlueprints;
    
    const gen1 = new Gen1System({
      seed: 'test-gen5-creatures',
      planet,
      creatureCount: 10,
      gen0Data,
      useAI: true,
    });
    const creatures = await gen1.initialize();
    const gen1Data = (creatures as any).visualBlueprints;
    
    const gen2 = new Gen2System({
      seed: 'test-gen5-packs',
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
    
    const gen3 = new Gen3System(planet, packs, 'test-gen5-tools');
    await gen3.initialize();
    const gen3Data = (gen3 as any).toolTypeOptions || [];
    
    const gen4 = new Gen4System(planet, 'test-gen5-tribes');
    await gen4.initialize(gen3Data);
    gen4Data = (gen4 as any).tribalStructures || [];
  });

  describe('WARP Flow (Gen4 → Gen5)', () => {
    it('uses Gen4 data for biased selection', async () => {
      const data = await generateGen5DataPools(planet, gen4Data, 'test-warp');
      
      expect(data.micro.buildingTypesOptions).toBeDefined();
      expect(data.micro.buildingTypesOptions.length).toBeGreaterThan(0);
      
      const buildingType = data.micro.buildingTypesOptions[0];
      expect(buildingType.id).toBeDefined();
      expect(buildingType.formation).toBeDefined();
    });

    it('produces deterministic results', async () => {
      const data1 = await generateGen5DataPools(planet, gen4Data, 'deterministic-gen5');
      const data2 = await generateGen5DataPools(planet, gen4Data, 'deterministic-gen5');
      
      expect(data1.micro.buildingTypesOptions[0].id).toBe(data2.micro.buildingTypesOptions[0].id);
    });
  });

  describe('BuildingSystem Integration', () => {
    it('BuildingSystem uses Gen5 data pools', async () => {
      const gen5 = new Gen5System(planet, 'test-building-system');
      await gen5.initialize(gen4Data);
      
      expect((gen5 as any).buildingTypeOptions.length).toBeGreaterThan(0);
    });
  });
});
