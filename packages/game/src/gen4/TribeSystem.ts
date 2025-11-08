/**
 * Gen 4: Tribe Formation with AI-Generated Tribal Structures
 * Uses data pools for tribal organization instead of hardcoding
 */

import { Goal } from 'yuka';
import seedrandom from 'seedrandom';
import { Tribe, Pack, Creature, Tool, Planet, Coordinate } from '../schemas/index.js';
import { generateGen4DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/loadGenData.js';

/**
 * Tribe Formation Goal
 */
export class FormTribeGoal extends Goal {
  private packs: Pack[];
  private reason: string;

  constructor(packs: Pack[], reason: string) {
    super();
    this.packs = packs;
    this.reason = reason;
  }

  activate(): void {
    this.status = Goal.STATUS_ACTIVE;
    console.log(`[FormTribeGoal] ${this.packs.length} packs forming tribe for ${this.reason}`);
  }

  execute(): number {
    this.status = Goal.STATUS_COMPLETED;
    return this.status;
  }

  terminate(): void {
    console.log(`[FormTribeGoal] Tribe formed from ${this.packs.length} packs`);
  }
}

/**
 * Gen 4 Tribe System
 */
export class Gen4System {
  private planet: Planet;
  private rng: seedrandom.PRNG;
  private useAI: boolean;
  private tribalStructures: any[] = [];

  constructor(planet: Planet, seed: string, useAI = true) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen4');
    this.useAI = useAI;
  }

  /**
   * Initialize with AI-generated tribal structures
   */
  async initialize(gen3Data: any): Promise<void> {
    console.log(`[GEN4] Initializing with AI data pools: ${this.useAI}`);

    if (this.useAI && gen3Data) {
      // Use base seed (not planet.seed) for generation chaining
      const baseSeed = this.planet.seed;
      const dataPools = await generateGen4DataPools(baseSeed);
      // Select from archetype options
      const { macro, meso, micro } = extractSeedComponents(baseSeed + '-gen4');
      const macroArch = selectFromPool(dataPools.macro.archetypeOptions, macro);
      const mesoArch = selectFromPool(dataPools.meso.archetypeOptions, meso);
      const microArch = selectFromPool(dataPools.micro.archetypeOptions, micro);
      
      this.tribalStructures = [
        {
          name: (macroArch as any).name || 'Hierarchical Clan',
          governance: (mesoArch as any).name || 'Elder Council',
          tradition: (microArch as any).name || 'Resource Sharing',
          visualBlueprint: (macroArch as any).visualBlueprint || {},
        },
      ];
      console.log(`[GEN4] Selected tribal structure: ${this.tribalStructures[0].name}`);
    } else {
      // Fallback
      this.tribalStructures = [
        { name: 'Hierarchical Clan', governance: 'Elder Council', tradition: 'Resource Sharing', visualBlueprint: {} },
      ];
    }
  }

  /**
   * Evaluate tribe formation from packs
   */
  evaluateTribeFormation(packs: Pack[], _creatures: Creature[], tools: Tool[]): Tribe[] {
    const tribes: Tribe[] = [];
    const assignedPacks = new Set<string>();

    for (let i = 0; i < packs.length; i++) {
      if (assignedPacks.has(packs[i].id)) continue;

      const candidatePacks = [packs[i]];

      // Find nearby packs
      for (let j = i + 1; j < packs.length; j++) {
        if (assignedPacks.has(packs[j].id)) continue;

        const distance = this.calculateDistance(packs[i].center, packs[j].center);
        if (distance < 100) {
          candidatePacks.push(packs[j]);
        }
      }

      // Should these form a tribe?
      if (candidatePacks.length >= 2) {
        const benefits = this.calculateCooperationBenefits(candidatePacks, tools);
        const costs = this.calculateCoordinationCosts(candidatePacks);

        if (benefits > costs && this.rng() < 0.5) {
          const tribe = this.formTribe(candidatePacks);
          tribes.push(tribe);
          candidatePacks.forEach((p) => assignedPacks.add(p.id));
        }
      }
    }

    return tribes;
  }

  /**
   * Form a tribe from packs
   */
  private formTribe(packs: Pack[]): Tribe {
    const { macro } = extractSeedComponents(this.planet.seed + packs[0].id);
    const structure = selectFromPool(this.tribalStructures, macro);

    const center = this.calculateTribalCenter(packs);
    const allMembers = packs.flatMap((p) => p.members); // Already array of creature IDs

    const tribe: Tribe = {
      id: `tribe-${this.planet.seed}-${Date.now()}`,
      name: `${structure.name} Tribe`,
      members: allMembers, // Already creature IDs
      territory: { center, radius: 150, nodes: [] },
      resources: {},
      morale: 0.7,
      cohesion: 0.8,
      status: 'forming',
    };

    console.log(`[GEN4] Tribe ${tribe.id} formed with ${packs.length} packs (${structure.name})`);
    return tribe;
  }

  private calculateCooperationBenefits(packs: Pack[], tools: Tool[]): number {
    const packTools = tools.filter((t) => t.owner && packs.some((p) => p.members.includes(t.owner!)));
    return packs.length * 10 + packTools.length * 5;
  }

  private calculateCoordinationCosts(packs: Pack[]): number {
    const avgDistance =
      packs.reduce((sum, p1, i) => {
        return sum + packs.slice(i + 1).reduce((s, p2) => s + this.calculateDistance(p1.center, p2.center), 0);
      }, 0) /
      (packs.length * (packs.length - 1) / 2);

    return avgDistance * 0.5 + packs.length * 2;
  }

  private calculateTribalCenter(packs: Pack[]): Coordinate {
    const avgLat = packs.reduce((sum, p) => sum + p.center.lat, 0) / packs.length;
    const avgLon = packs.reduce((sum, p) => sum + p.center.lon, 0) / packs.length;
    return { lat: avgLat, lon: avgLon };
  }

  private calculateDistance(a: Coordinate, b: Coordinate): number {
    const dlat = Math.abs(a.lat - b.lat);
    const dlon = Math.abs(a.lon - b.lon);
    return Math.sqrt(dlat * dlat + dlon * dlon) * 111;
  }
}
