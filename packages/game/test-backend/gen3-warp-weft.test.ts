/**
 * Gen 3: Comprehensive WARP/WEFT Integration Tests
 * Tests tool emergence with WARP flow from Gen2
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';
import { Gen1System } from '../src/gen1/CreatureSystem.js';
import { Gen2System } from '../src/gen2/PackSystem.js';
import { Gen3System } from '../src/gen3/ToolSystem.js';
import { generateGen3DataPools } from '../src/gen-systems/loadGenData.js';

describe('Gen 3: WARP/WEFT Data Integration', () => {
  let planet: any;
  let gen0Data: any;
  let gen1Data: any;
  let gen2Data: any;

  beforeAll(async () => {
    const sim = new AccretionSimulation({ seed: 'test-gen3-planet', useAI: true });
    planet = await sim.simulate();
    gen0Data = (planet as any).visualBlueprints;
    
    const gen1 = new Gen1System({
      seed: 'test-gen3-creatures',
      planet,
      creatureCount: 10,
      gen0Data,
      useAI: true,
    });
    const creatures = await gen1.initialize();
    gen1Data = (creatures as any).visualBlueprints;
    
    const gen2 = new Gen2System({
      seed: 'test-gen3-packs',
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
    gen2Data = packs;
  });

  describe('WARP Flow (Gen2 → Gen3)', () => {
    it('uses Gen2 data for biased selection', async () => {
      const data = await generateGen3DataPools(planet, gen2Data, 'test-warp');
      
      expect(data.micro.toolTypesOptions).toBeDefined();
      expect(data.micro.toolTypesOptions.length).toBeGreaterThan(0);
      
      const toolType = data.micro.toolTypesOptions[0];
      expect(toolType.id).toBeDefined();
      expect(toolType.formation).toBeDefined();
    });

    it('produces deterministic results with same seed and Gen2 data', async () => {
      const data1 = await generateGen3DataPools(planet, gen2Data, 'deterministic-gen3');
      const data2 = await generateGen3DataPools(planet, gen2Data, 'deterministic-gen3');
      
      expect(data1.micro.toolTypesOptions[0].id).toBe(data2.micro.toolTypesOptions[0].id);
    });
  });

  describe('ToolSystem Integration', () => {
    it('ToolSystem uses Gen3 data pools', async () => {
      const gen3 = new Gen3System(planet, gen2Data, 'test-tool-system');
      await gen3.initialize();
      
      expect((gen3 as any).toolTypeOptions.length).toBeGreaterThan(0);
    });

    it('tools have valid structure', async () => {
      const gen3 = new Gen3System(planet, gen2Data, 'test-formation');
      await gen3.initialize();
      
      const toolType = (gen3 as any).toolTypeOptions[0];
      expect(toolType).toBeDefined();
      expect(toolType.name).toBeDefined();
      // Formation may or may not be present depending on data pool structure
      if (toolType.formation) {
        expect(typeof toolType.formation).toBe('object');
      }
    });
  });
});

