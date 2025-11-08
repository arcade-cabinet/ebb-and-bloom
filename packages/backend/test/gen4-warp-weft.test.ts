/**
 * Gen 4: Comprehensive WARP/WEFT Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Gen3System } from '../src/gen3/ToolSystem.js';
import { Gen4System } from '../src/gen4/TribeSystem.js';
import { generateGen4DataPools } from '../src/gen-systems/loadGenData.js';

describe('Gen 4: WARP/WEFT Data Integration', () => {
  let planet: any;
  let gen3Data: any;

  beforeAll(async () => {
    const sim = new AccretionSimulation({ seed: 'test-gen4-planet', useAI: true });
    planet = await sim.simulate();
    const gen0Data = (planet as any).visualBlueprints;
    
    const gen1 = new Gen1System({
      seed: 'test-gen4-creatures',
      planet,
      creatureCount: 10,
      gen0Data,
      useAI: true,
    });
    const creatures = await gen1.initialize();
    const gen1Data = (creatures as any).visualBlueprints;
    
    const gen2 = new Gen2System({
      seed: 'test-gen4-packs',
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
    
    const gen3 = new Gen3System(planet, packs, 'test-gen4-tools');
    await gen3.initialize();
    gen3Data = (gen3 as any).toolTypeOptions || [];
  });

  describe('WARP Flow (Gen3 → Gen4)', () => {
    it('uses Gen3 data for biased selection', async () => {
      const data = await generateGen4DataPools(planet, gen3Data, 'test-warp');
      
      expect(data.macro.selectedStructure).toBeDefined();
      expect(data.macro.archetypeId).toBeDefined();
      expect(data.macro.formation).toBeDefined();
    });

    it('produces deterministic results', async () => {
      const data1 = await generateGen4DataPools(planet, gen3Data, 'deterministic-gen4');
      const data2 = await generateGen4DataPools(planet, gen3Data, 'deterministic-gen4');
      
      expect(data1.macro.archetypeId).toBe(data2.macro.archetypeId);
    });
  });

  describe('TribeSystem Integration', () => {
    it('TribeSystem uses Gen4 data pools', async () => {
      const gen4 = new Gen4System(planet, 'test-tribe-system');
      await gen4.initialize(gen3Data);
      
      expect((gen4 as any).tribalStructures.length).toBeGreaterThan(0);
    });
  });
});
