/**
 * Gen 3: Tool Emergence with Yuka FuzzyModule + AI-Generated Tool Types
 * Uses data pools for tool specs instead of hardcoding
 */

import seedrandom from 'seedrandom';
import {
  FuzzyAND,
  FuzzyModule,
  FuzzyRule,
  FuzzyVariable,
  LeftShoulderFuzzySet,
  RightShoulderFuzzySet,
  TriangularFuzzySet,
} from 'yuka';
import { extractSeedComponents, generateGen3DataPools, selectFromPool } from '../gen-systems/loadGenData.js';
import { Creature, Material, MaterialType, Pack, Planet, Tool, ToolType } from '../schemas/index.js';

/**
 * Fuzzy Logic: When does a tool emerge?
 */
export class ToolEmergenceFuzzy {
  private fuzzy: FuzzyModule;

  constructor() {
    this.fuzzy = new FuzzyModule();

    // Input 1: Problem intensity
    const problem = new FuzzyVariable('problem');
    const problemLow = new LeftShoulderFuzzySet('low', 0, 25, 50);
    const problemMod = new TriangularFuzzySet('moderate', 25, 50, 75);
    const problemHigh = new RightShoulderFuzzySet('high', 50, 75, 100);
    problem.add(problemLow);
    problem.add(problemMod);
    problem.add(problemHigh);
    this.fuzzy.addFLV('problem', problem);

    // Input 2: Creature capability
    const capability = new FuzzyVariable('capability');
    const capLow = new LeftShoulderFuzzySet('low', 0, 25, 50);
    const capMod = new TriangularFuzzySet('moderate', 25, 50, 75);
    const capHigh = new RightShoulderFuzzySet('high', 50, 75, 100);
    capability.add(capLow);
    capability.add(capMod);
    capability.add(capHigh);
    this.fuzzy.addFLV('capability', capability);

    // Output: Tool emergence probability
    const emergence = new FuzzyVariable('emergence');
    const emergeLow = new LeftShoulderFuzzySet('low', 0, 25, 50);
    const emergeMod = new TriangularFuzzySet('moderate', 25, 50, 75);
    const emergeHigh = new RightShoulderFuzzySet('high', 50, 75, 100);
    emergence.add(emergeLow);
    emergence.add(emergeMod);
    emergence.add(emergeHigh);
    this.fuzzy.addFLV('emergence', emergence);

    // Comprehensive rules (9 combinations)
    // Use FuzzySet objects directly (not getSet() - that doesn't exist)
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capLow), emergeHigh));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capMod), emergeMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capHigh), emergeLow));

    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capLow), emergeMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capMod), emergeMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capHigh), emergeLow));

    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capLow), emergeLow));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capMod), emergeLow));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capHigh), emergeLow));
  }

  evaluate(problemIntensity: number, creatureCapability: number): number {
    this.fuzzy.fuzzify('problem', problemIntensity * 100);
    this.fuzzy.fuzzify('capability', creatureCapability * 100);
    return this.fuzzy.defuzzify('emergence') / 100; // 0-1
  }
}

/**
 * Gen 3 Tool System
 */
export class Gen3System {
  private planet: Planet;
  private rng: seedrandom.PRNG;
  private fuzzy: ToolEmergenceFuzzy;
  private useAI: boolean;
  private toolTypeOptions: any[] = [];

  constructor(planet: Planet, seed: string, useAI = true) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen3');
    this.fuzzy = new ToolEmergenceFuzzy();
    this.useAI = useAI;
  }

  /**
   * Initialize with AI-generated tool types
   */
  async initialize(gen2Data: any): Promise<void> {
    console.log(`[GEN3] Initializing with AI data pools: ${this.useAI}`);

    if (this.useAI && gen2Data) {
      // Use base seed (not planet.seed) for generation chaining
      const baseSeed = this.planet.seed;
      const dataPools = await generateGen3DataPools(this.planet, gen2Data, baseSeed);
      this.toolTypeOptions = dataPools.micro.toolTypesOptions;
      console.log(`[GEN3] Generated ${this.toolTypeOptions.length} tool type options`);
    } else {
      // Fallback
      this.toolTypeOptions = [
        { name: 'Stone Scraper', purpose: 'cutting', visualBlueprint: {} },
        { name: 'Wooden Club', purpose: 'hunting', visualBlueprint: {} },
      ];
    }
  }

  /**
   * Evaluate tool emergence from pack behaviors
   */
  evaluateToolEmergence(packs: Pack[], creatures: Creature[]): Tool[] {
    const tools: Tool[] = [];

    for (const pack of packs) {
      const packCreatures = creatures.filter((c) => pack.members.includes(c.id) && c.status === 'alive');
      if (packCreatures.length === 0) continue;

      // Calculate pack-level problem intensity (avg need urgency)
      const avgUrgency =
        packCreatures.reduce(
          (sum, c) => sum + (c.needs.length > 0 ? c.needs.reduce((nSum: number, n: any) => nSum + n.urgency, 0) / c.needs.length : 0),
          0
        ) / packCreatures.length;

      // Calculate pack-level capability (avg manipulation/excavation as proxy for intelligence)
      const avgCapability =
        packCreatures.reduce((sum, c) => sum + (c.traits.excavation + c.traits.maxReach / 10), 0) / packCreatures.length;

      // Evaluate emergence
      const emergence = this.fuzzy.evaluate(avgUrgency, avgCapability);

      console.log(
        `[GEN3] Pack ${pack.id}: urgency=${avgUrgency.toFixed(2)}, capability=${avgCapability.toFixed(2)} → emergence=${emergence.toFixed(2)}`
      );

      if (emergence > 0.4 && this.rng() < emergence) {
        // Tool emerges!
        const tool = this.createTool(pack, packCreatures);
        tools.push(tool);
      }
    }

    return tools;
  }

  /**
   * Create a tool using AI-generated specs
   */
  private createTool(pack: Pack, creatures: Creature[]): Tool {
    // Select tool type from AI pool
    const { micro } = extractSeedComponents(this.planet.seed + pack.id);
    const toolType = selectFromPool(this.toolTypeOptions, micro);

    // Get materials from pack location
    const materials = this.queryMaterialsAt({ latitude: pack.center.lat, longitude: pack.center.lon });
    const primaryMaterial = materials[0] || { type: 'carbon' as MaterialType, quantity: 1, depth: 0, hardness: 2 };

    // Map toolType.purpose to ToolTypeSchema enum
    const toolTypeEnum = (toolType.purpose === 'cutting' ? 'bone_scraper' :
      toolType.purpose === 'hunting' ? 'wooden_spear' :
        toolType.purpose === 'digging' ? 'digging_stick' : 'stone_hammer') as ToolType;

    const tool: Tool = {
      id: `tool-${pack.id}-${Date.now()}`,
      type: toolTypeEnum,
      composition: { [primaryMaterial.type]: primaryMaterial.quantity },
      boost: {
        excavation: toolType.purpose === 'digging' ? 0.3 : undefined,
        speed: toolType.purpose === 'hunting' ? 0.2 : undefined,
        strength: toolType.purpose === 'cutting' ? 0.2 : undefined,
      },
      durability: 100.0,
      owner: pack.members[0], // First pack member owns it
    };

    console.log(`[GEN3] Tool ${toolType.name} (${tool.type}) created by pack ${pack.id} from ${primaryMaterial.type}`);
    return tool;
  }

  /**
   * Query planet materials at coordinate
   */
  private queryMaterialsAt(coord: { latitude: number; longitude: number; altitude?: number }): Material[] {
    const altitudeKm = coord.altitude || 0;
    const radiusKm = this.planet.radius / 1000;

    const layer =
      this.planet.layers.find((l) => altitudeKm >= l.minRadius && altitudeKm <= l.maxRadius) ||
      this.planet.layers[this.planet.layers.length - 1];

    return layer.materials;
  }
}
