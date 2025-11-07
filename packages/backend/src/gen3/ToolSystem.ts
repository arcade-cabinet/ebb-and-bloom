/**
 * Gen 3: Tool Emergence with Yuka FuzzyModule + AI-Generated Tool Types
 * Uses data pools for tool specs instead of hardcoding
 */

import {
  FuzzyModule,
  FuzzyVariable,
  FuzzyRule,
  FuzzyAND,
  TriangularFuzzySet,
  LeftShoulderFuzzySet,
  RightShoulderFuzzySet,
} from 'yuka';
import seedrandom from 'seedrandom';
import { Tool, Creature, Pack, Planet, Material } from '../schemas/index.js';
import { generateGen3DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/VisualBlueprintGenerator.js';

/**
 * Fuzzy Logic: When does a tool emerge?
 */
export class ToolEmergenceFuzzy {
  private fuzzy: FuzzyModule;

  constructor() {
    this.fuzzy = new FuzzyModule();

    // Input 1: Problem intensity
    const problem = new FuzzyVariable('problem');
    problem.add(new LeftShoulderFuzzySet('low', 0, 25, 50));
    problem.add(new TriangularFuzzySet('moderate', 25, 50, 75));
    problem.add(new RightShoulderFuzzySet('high', 50, 75, 100));
    this.fuzzy.addFLV(problem);

    // Input 2: Creature capability
    const capability = new FuzzyVariable('capability');
    capability.add(new LeftShoulderFuzzySet('low', 0, 25, 50));
    capability.add(new TriangularFuzzySet('moderate', 25, 50, 75));
    capability.add(new RightShoulderFuzzySet('high', 50, 75, 100));
    this.fuzzy.addFLV(capability);

    // Output: Tool emergence probability
    const emergence = new FuzzyVariable('emergence');
    emergence.add(new LeftShoulderFuzzySet('low', 0, 25, 50));
    emergence.add(new TriangularFuzzySet('moderate', 25, 50, 75));
    emergence.add(new RightShoulderFuzzySet('high', 50, 75, 100));
    this.fuzzy.addFLV(emergence);

    // Comprehensive rules (9 combinations)
    const problemLow = problem.getSet('low');
    const problemMod = problem.getSet('moderate');
    const problemHigh = problem.getSet('high');
    const capLow = capability.getSet('low');
    const capMod = capability.getSet('moderate');
    const capHigh = capability.getSet('high');
    const emergeLow = emergence.getSet('low');
    const emergeMod = emergence.getSet('moderate');
    const emergeHigh = emergence.getSet('high');

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
      const dataPools = await generateGen3DataPools(this.planet, gen2Data, this.planet.seed);
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
      const packCreatures = creatures.filter((c) => pack.members.includes(c.id) && c.alive);
      if (packCreatures.length === 0) continue;

      // Calculate pack-level problem intensity (avg need urgency)
      const avgUrgency =
        packCreatures.reduce(
          (sum, c) => sum + c.needs.reduce((nSum, n) => nSum + n.urgency, 0) / c.needs.length,
          0
        ) / packCreatures.length;

      // Calculate pack-level capability (avg intelligence)
      const avgIntelligence =
        packCreatures.reduce((sum, c) => sum + c.traits.intelligence, 0) / packCreatures.length;

      // Evaluate emergence
      const emergence = this.fuzzy.evaluate(avgUrgency, avgIntelligence);

      console.log(
        `[GEN3] Pack ${pack.id}: urgency=${avgUrgency.toFixed(2)}, intelligence=${avgIntelligence.toFixed(2)} → emergence=${emergence.toFixed(2)}`
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
    const materials = this.queryMaterialsAt(pack.center);
    const primaryMaterial = materials[0] || { element: 'C', quantity: 1, depth: 0, hardness: 2 };

    const tool: Tool = {
      id: `tool-${pack.id}-${Date.now()}`,
      name: toolType.name,
      type: toolType.purpose || 'utility',
      material: primaryMaterial.element,
      durability: 1.0,
      creator: pack.id,
      location: pack.center,
      visualBlueprint: toolType.visualBlueprint,
    };

    console.log(`[GEN3] Tool ${tool.name} created by pack ${pack.id} from ${tool.material}`);
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
