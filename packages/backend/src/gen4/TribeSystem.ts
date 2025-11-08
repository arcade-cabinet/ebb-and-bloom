/**
 * Gen 4: Tribe Formation with AI-Generated Tribal Structures
 * Uses data pools for tribal organization instead of hardcoding
 */

import { Goal } from 'yuka';
import seedrandom from 'seedrandom';
import { Tribe, Pack, Creature, Tool, Planet, Coordinate, Territory } from '../schemas/index.js';
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
      const dataPools = await generateGen4DataPools(this.planet, gen3Data, this.planet.seed);
      this.tribalStructures = [
        {
          name: dataPools.macro.selectedStructure,
          governance: dataPools.meso.selectedGovernance,
          tradition: dataPools.micro.selectedTradition,
          visualBlueprint: dataPools.macro.visualBlueprint,
        },
      ];
      console.log(`[GEN4] Selected tribal structure: ${dataPools.macro.selectedStructure}`);
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
  evaluateTribeFormation(packs: Pack[], creatures: Creature[], tools: Tool[]): Tribe[] {
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
    const allMembers = packs.flatMap((p) => p.members);

    const tribe: Tribe = {
      id: `tribe-${this.planet.seed}-${Date.now()}`,
      name: `${structure.name} Tribe`,
      packs: packs.map((p) => p.id),
      population: allMembers.length,
      territory: { center, radiusKm: 150 },
      governance: structure.governance,
      status: 'forming',
      visualBlueprint: structure.visualBlueprint,
    };

    console.log(`[GEN4] Tribe ${tribe.id} formed with ${tribe.packs.length} packs (${structure.name})`);
    return tribe;
  }

  private calculateCooperationBenefits(packs: Pack[], tools: Tool[]): number {
    const packTools = tools.filter((t) => packs.some((p) => p.id === t.creator));
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
    const avgLat = packs.reduce((sum, p) => sum + p.center.latitude, 0) / packs.length;
    const avgLon = packs.reduce((sum, p) => sum + p.center.longitude, 0) / packs.length;
    const avgAlt = packs.reduce((sum, p) => sum + (p.center.altitude || 0), 0) / packs.length;
    return { latitude: avgLat, longitude: avgLon, altitude: avgAlt };
  }

  private calculateDistance(a: Coordinate, b: Coordinate): number {
    const dlat = Math.abs(a.latitude - b.latitude);
    const dlon = Math.abs(a.longitude - b.longitude);
    return Math.sqrt(dlat * dlat + dlon * dlon) * 111;
  }
}
