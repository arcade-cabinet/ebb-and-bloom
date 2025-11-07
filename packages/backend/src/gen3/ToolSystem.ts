/**
 * Gen 3: Tool Emergence System with Yuka FuzzyModule
 * Tools emerge when creatures face problems they can't solve with traits alone
 */

import { FuzzyModule, FuzzyVariable, FuzzyRule, FuzzyAND, TriangularFuzzySet, LeftShoulderFuzzySet, RightShoulderFuzzySet } from 'yuka';
import seedrandom from 'seedrandom';
import { Tool, Creature, Pack, Planet, Material } from '../schemas/index.js';

/**
 * Fuzzy Logic: When does a tool emerge?
 */
export class ToolEmergenceFuzzy {
  private fuzzy: FuzzyModule;
  private problemLow!: FuzzySet;
  private problemMod!: FuzzySet;
  private problemHigh!: FuzzySet;
  private capabilityLow!: FuzzySet;
  private capabilityMod!: FuzzySet;
  private capabilityHigh!: FuzzySet;
  private emergenceLow!: FuzzySet;
  private emergenceMod!: FuzzySet;
  private emergenceHigh!: FuzzySet;

  constructor() {
    this.fuzzy = new FuzzyModule();

    // Input 1: Problem intensity (0 = easy, 1 = impossible without tools)
    const problemVar = new FuzzyVariable();
    this.problemLow = new LeftShoulderFuzzySet(0, 0.15, 0.3);
    this.problemMod = new TriangularFuzzySet(0.2, 0.5, 0.8);
    this.problemHigh = new RightShoulderFuzzySet(0.7, 0.85, 1);
    problemVar.add(this.problemLow);
    problemVar.add(this.problemMod);
    problemVar.add(this.problemHigh);
    this.fuzzy.addFLV('problem', problemVar);

    // Input 2: Creature capability (0 = can't solve, 1 = easily solved)
    const capabilityVar = new FuzzyVariable();
    this.capabilityLow = new LeftShoulderFuzzySet(0, 0.15, 0.3);
    this.capabilityMod = new TriangularFuzzySet(0.2, 0.5, 0.8);
    this.capabilityHigh = new RightShoulderFuzzySet(0.7, 0.85, 1);
    capabilityVar.add(this.capabilityLow);
    capabilityVar.add(this.capabilityMod);
    capabilityVar.add(this.capabilityHigh);
    this.fuzzy.addFLV('capability', capabilityVar);

    // Output: Tool emergence probability (0-100)
    const emergenceVar = new FuzzyVariable();
    this.emergenceLow = new LeftShoulderFuzzySet(0, 25, 50);
    this.emergenceMod = new TriangularFuzzySet(25, 50, 75);
    this.emergenceHigh = new RightShoulderFuzzySet(50, 75, 100);
    emergenceVar.add(this.emergenceLow);
    emergenceVar.add(this.emergenceMod);
    emergenceVar.add(this.emergenceHigh);
    this.fuzzy.addFLV('emergence', emergenceVar);

    // Comprehensive rule coverage (9 rules for all combinations)
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemHigh, this.capabilityLow), this.emergenceHigh));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemHigh, this.capabilityMod), this.emergenceMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemHigh, this.capabilityHigh), this.emergenceLow));
    
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemMod, this.capabilityLow), this.emergenceMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemMod, this.capabilityMod), this.emergenceMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemMod, this.capabilityHigh), this.emergenceLow));
    
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemLow, this.capabilityLow), this.emergenceLow));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemLow, this.capabilityMod), this.emergenceLow));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(this.problemLow, this.capabilityHigh), this.emergenceLow));
  }

  evaluate(problemIntensity: number, creatureCapability: number): number {
    const problem = Math.min(1, Math.max(0, problemIntensity));
    const capability = Math.min(1, Math.max(0, creatureCapability));

    this.fuzzy.fuzzify('problem', problem);
    this.fuzzy.fuzzify('capability', capability);

    const result = this.fuzzy.defuzzify('emergence'); // 0-100

    console.log(`[ToolEmergence] problem=${problem.toFixed(2)}, capability=${capability.toFixed(2)} → emergence=${result.toFixed(2)}`);

    return result / 100; // Normalize to 0-1
  }
}

/**
 * Gen 3 Tool System
 */
export class Gen3System {
  private planet: Planet;
  private fuzzy: ToolEmergenceFuzzy;
  private rng: ReturnType<typeof seedrandom>;

  constructor(planet: Planet, seed: string) {
    this.planet = planet;
    this.fuzzy = new ToolEmergenceFuzzy();
    this.rng = seedrandom(seed + '-gen3');
  }

  /**
   * Evaluate tool emergence for packs facing problems
   */
  evaluateToolEmergence(
    packs: Pack[],
    creatures: Creature[],
    currentProblems: { type: string; intensity: number; location: Coordinate }[]
  ): Tool[] {
    const tools: Tool[] = [];

    for (const problem of currentProblems) {
      // Find packs near the problem
      const nearbyPacks = packs.filter(pack => {
        const distance = this.calculateDistance(pack.center, problem.location);
        return distance < 50; // 50km range
      });

      if (nearbyPacks.length === 0) continue;

      for (const pack of nearbyPacks) {
        const packMembers = creatures.filter(c => pack.members.includes(c.id));
        const avgCapability = this.assessPackCapability(packMembers, problem.type);

        // Evaluate emergence
        const emergenceProbability = this.fuzzy.evaluate(problem.intensity, avgCapability);

        if (emergenceProbability > 0.5 && this.rng() < emergenceProbability) {
          // Tool emerges!
          const tool = this.createTool(problem, packMembers[0], pack);
          tools.push(tool);

          console.log(`[GEN3] Tool ${tool.id} emerged for problem ${problem.type} at pack ${pack.id}`);
        }
      }
    }

    return tools;
  }

  /**
   * Assess pack's capability to solve problem
   */
  private assessPackCapability(creatures: Creature[], problemType: string): number {
    if (creatures.length === 0) return 0;

    // Map problem types to relevant traits
    const traitMapping: Record<string, keyof Creature['traits']> = {
      'extraction': 'excavation',
      'processing': 'manipulation',
      'defense': 'aggression',
      'mobility': 'speed',
    };

    const relevantTrait = traitMapping[problemType] || 'manipulation';
    const avgTrait = creatures.reduce((sum, c) => sum + c.traits[relevantTrait], 0) / creatures.length;

    return avgTrait; // Already 0-1
  }

  /**
   * Create a tool based on problem and creator
   */
  private createTool(
    problem: { type: string; intensity: number; location: Coordinate },
    creator: Creature,
    pack: Pack
  ): Tool {
    // Select materials from available resources
    const crustMaterials = this.planet.layers.find(l => l.name === 'crust')?.materials || [];
    const accessibleMaterials = crustMaterials.filter(m => m.depth < 10 && m.hardness < creator.traits.excavation * 10);

    const tool: Tool = {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: problem.type as any,
      creator: creator.id,
      pack: pack.id,
      materials: accessibleMaterials.slice(0, 2).map(m => m.element),
      effectiveness: Math.min(1, problem.intensity * 0.8), // Tool slightly worse than problem demands
      durability: accessibleMaterials[0]?.hardness || 1,
      location: problem.location,
      users: [creator.id],
      createdAt: Date.now(),
    };

    return tool;
  }

  /**
   * Calculate distance between coordinates
   */
  private calculateDistance(a: Coordinate, b: Coordinate): number {
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    
    const a1 = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1));
    
    return 6371 * c; // Earth radius in km
  }
}
