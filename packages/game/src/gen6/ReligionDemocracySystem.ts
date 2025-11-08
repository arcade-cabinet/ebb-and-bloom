/**
 * Gen 6: Religion & Democracy with AI-Generated Belief Systems
 * Uses data pools for cosmology and rituals instead of hardcoding
 */

import { Goal } from 'yuka';
import seedrandom from 'seedrandom';
import { Religion, Myth, Ritual, Tribe, Building, Creature, Planet } from '../schemas/index.js';
import { generateGen6DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/loadGenData.js';

/**
 * Religious Practice Goal
 */
export class PerformRitualGoal extends Goal {
  private ritual: Ritual;
  private participants: string[];

  constructor(ritual: Ritual, participants: string[]) {
    super();
    this.ritual = ritual;
    this.participants = participants;
  }

  activate(): void {
    this.status = Goal.STATUS_ACTIVE;
    console.log(`[PerformRitualGoal] ${this.participants.length} creatures performing ${this.ritual.name}`);
  }

  execute(): number {
    this.status = Goal.STATUS_COMPLETED;
    return this.status;
  }

  terminate(): void {
    console.log(`[PerformRitualGoal] Ritual ${this.ritual.name} complete`);
  }
}

/**
 * Gen 6 Religion/Democracy System
 */
export class Gen6System {
  private planet: Planet;
  private rng: seedrandom.PRNG;
  private useAI: boolean;
  private cosmologyOptions: any[] = [];

  constructor(planet: Planet, seed: string, useAI = true) {
    this.planet = planet;
    this.rng = seedrandom(seed + '-gen6');
    this.useAI = useAI;
  }

  /**
   * Initialize with AI-generated cosmologies
   */
  async initialize(gen5Data: any): Promise<void> {
    console.log(`[GEN6] Initializing with AI data pools: ${this.useAI}`);

    if (this.useAI && gen5Data) {
      // Use base seed (not planet.seed) for generation chaining
      const baseSeed = this.planet.seed;
      const dataPools = await generateGen6DataPools(baseSeed);
      // Select from archetype options
      const { macro, meso, micro } = extractSeedComponents(baseSeed + '-gen6');
      const macroArch = selectFromPool(dataPools.macro.archetypeOptions, macro);
      const mesoArch = selectFromPool(dataPools.meso.archetypeOptions, meso);
      const microArch = selectFromPool(dataPools.micro.archetypeOptions, micro);
      
      this.cosmologyOptions = [
        {
          cosmology: (macroArch as any).name || 'Cyclical Time',
          ritualType: (mesoArch as any).name || 'Seasonal',
          belief: (microArch as any).name || 'Nature Spirits',
          domain: (microArch as any).domain || 'environment',
          visualBlueprint: (macroArch as any).visualBlueprint || {},
        },
      ];
      console.log(`[GEN6] Selected cosmology: ${this.cosmologyOptions[0].cosmology}`);
    } else {
      // Fallback
      this.cosmologyOptions = [
        { cosmology: 'Cyclical Time', ritualType: 'Seasonal', belief: 'Nature Spirits', domain: 'environment', visualBlueprint: {} },
      ];
    }
  }

  /**
   * Evaluate religion emergence
   */
  evaluateReligionEmergence(
    tribes: Tribe[],
    buildings: Building[],
    creatures: Creature[]
  ): Religion[] {
    const religions: Religion[] = [];

    for (const tribe of tribes) {
      const tribeBuildings = buildings.filter((b) => b.owner === tribe.id);
      const hasGatheringSpace = tribeBuildings.some((b) => b.type === 'temple');
      const isLarge = tribe.members.length > 100;
      const isStable = tribe.status === 'stable';

      if (hasGatheringSpace && isLarge && isStable && this.rng() < 0.3) {
        const religion = this.formReligion(tribe, creatures);
        religions.push(religion);
      }
    }

    return religions;
  }

  /**
   * Form a religion using AI-generated cosmology
   */
  private formReligion(tribe: Tribe, _creatures: Creature[]): Religion {
    const { macro } = extractSeedComponents(this.planet.seed + tribe.id);
    const cosmology = selectFromPool(this.cosmologyOptions, macro);

    // Generate myths from cosmology
    const myths: Myth[] = [
      {
        id: `myth-${tribe.id}-origin`,
        name: `The ${cosmology.cosmology} Origin`,
        content: `In the beginning, the world was formed through ${cosmology.cosmology.toLowerCase()}...`,
        believers: Math.floor(tribe.members.length * 0.8),
      },
    ];

    // Generate rituals from ritual type
    const rituals: Ritual[] = [
      {
        id: `ritual-${tribe.id}-ceremony`,
        name: `${cosmology.ritualType} Ceremony`,
        frequency: 'monthly',
        fearReduction: 0.3,
        participants: tribe.members.slice(0, Math.min(50, tribe.members.length)),
      },
    ];

    const religion: Religion = {
      id: `religion-${tribe.id}-${Date.now()}`,
      name: `${cosmology.belief} Faith`,
      followers: [tribe.id],
      myths,
      rituals,
      status: 'forming',
    };

    console.log(`[GEN6] Religion ${religion.name} emerged in tribe ${tribe.id} (${cosmology.cosmology})`);
    return religion;
  }

  /**
   * Evaluate democracy emergence (alternative to religion)
   */
  evaluateDemocracyEmergence(tribes: Tribe[], buildings: Building[]): any[] {
    const democracies: any[] = [];

    for (const tribe of tribes) {
      // Democracy emerges from highly social, large, tool-using tribes
      const hasGathering = buildings.some((b) => b.owner === tribe.id && b.type === 'temple');
      const isLarge = tribe.members.length > 150;
      const hasGovernance = tribe.cohesion > 0.7; // High cohesion = governance

      if (hasGathering && isLarge && hasGovernance && this.rng() < 0.2) {
        const democracy = {
          id: `democracy-${tribe.id}`,
          tribe: tribe.id,
          type: 'representative',
          votingSystem: 'consensus',
          established: Date.now(),
        };

        democracies.push(democracy);
        console.log(`[GEN6] Democracy emerged in tribe ${tribe.id}`);
      }
    }

    return democracies;
  }
}
