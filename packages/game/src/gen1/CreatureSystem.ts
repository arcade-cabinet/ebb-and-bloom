/**
 * Gen 1: Creature System with Yuka Goal Hierarchy + AI-Generated Archetypes
 * Uses data pools for creature traits instead of hardcoding
 */

import seedrandom from 'seedrandom';
import { extractSeedComponents, generateGen1DataPools, selectFromPool } from '../gen-systems/loadGenData.js';
import {
  Coordinate,
  Creature,
  Material,
  Need,
  Planet,
  Traits
} from '../schemas/index.js';

export interface Gen1Config {
  seed: string;
  planet: Planet;
  creatureCount: number;
  gen0Data?: any; // WARP flow: Gen0 data for biased selection
  useAI?: boolean; // If false, uses fallback for testing
}

/**
 * Fallback archetypes when AI is disabled
 */
const FALLBACK_ARCHETYPES = {
  cursorial_forager: {
    id: 'cursorial_forager',
    name: 'Cursorial Forager',
    traits: {
      locomotion: 'cursorial' as const,
      foraging: 'surface' as const,
      social: 'solitary' as const,
      intelligence: 0.3,
      excavation: 0.1,
      maxReach: 0.5,
      speed: 1.0,
      strength: 0.5,
    },
    visualBlueprint: {},
    parameters: {},
    formation: {},
    deconstruction: {},
    adjacency: {},
  },
  arboreal_opportunist: {
    id: 'arboreal_opportunist',
    name: 'Arboreal Opportunist',
    traits: {
      locomotion: 'arboreal' as const,
      foraging: 'arboreal' as const,
      social: 'pack' as const,
      excavation: 0.25,
      maxReach: 1.0,
      speed: 1.25,
      strength: 0.65,
    },
    visualBlueprint: {},
    parameters: {},
    formation: {},
    deconstruction: {},
    adjacency: {},
  },
};

/**
 * Gen 1 System: Spawn and manage Yuka-driven creatures
 */
export class Gen1System {
  private seed: string;
  private rng: seedrandom.PRNG;
  private planet: Planet;
  private creatures: Map<string, Creature> = new Map();
  private useAI: boolean;

  private gen0Data?: any;

  constructor(config: Gen1Config) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
    this.planet = config.planet;
    this.gen0Data = config.gen0Data;
    this.useAI = config.useAI ?? true;
  }

  /**
   * Initialize Gen 1 with AI-generated archetypes
   */
  async initialize(): Promise<Map<string, Creature> & { visualBlueprints?: any }> {
    console.log(`[GEN1] Initializing with AI data pools: ${this.useAI}`);

    // Generate AI data pools for archetypes
    let dataPools;
    let archetypeOptions;

    if (this.useAI) {
      // Pass Gen0 data for WARP flow (biased selection based on metallicity, etc.)
      // Extract base seed from generation seed (remove -gen1 suffix)
      const baseSeed = this.seed.replace(/-gen\d+$/, '');
      dataPools = await generateGen1DataPools(baseSeed, this.planet, this.gen0Data);
      const { macro: _macro } = extractSeedComponents(this.seed);
      archetypeOptions = dataPools.macro.archetypeOptions.map((a: any) => ({
        id: a.id,
        name: a.name,
        traits: this.parseTraitsFromBlueprint(a.traits, a.visualBlueprint),
        visualBlueprint: a.visualBlueprint,
        parameters: a.parameters, // Interpolated parameters from universal template
        formation: a.formation, // Yuka AI guidance
        deconstruction: a.deconstruction, // Deconstruction info
        adjacency: a.adjacency, // Compatibility info
      }));
    } else {
      // Use fallback
      archetypeOptions = Object.values(FALLBACK_ARCHETYPES);
    }

    console.log(`[GEN1] Generated ${archetypeOptions.length} archetype options`);

    // Spawn creatures
    const { macro } = extractSeedComponents(this.seed);
    const archetype = selectFromPool(archetypeOptions, macro) as typeof archetypeOptions[0];
    console.log(`[GEN1] Selected archetype: ${archetype.name}`);

    // Create creatures
    for (let i = 0; i < 20; i++) {
      const creature = this.createCreature(archetype, i);
      this.creatures.set(creature.id, creature);
    }

    console.log(`[GEN1] Spawned ${this.creatures.size} creatures`);

    return Object.assign(this.creatures, { visualBlueprints: dataPools });
  }

  /**
   * Parse traits from AI blueprint description
   */
  private parseTraitsFromBlueprint(traitDesc: string | undefined, _blueprint: any): Traits {
    // Handle undefined or null traitDesc with default values
    const desc = traitDesc || '';
    
    // Extract traits from AI description
    const intelligenceScore = desc.includes('intelligent') || desc.includes('clever') ? 0.7 :
      desc.includes('smart') ? 0.5 : 0.3;

    const locomotion = desc.includes('climb') || desc.includes('arboreal') ? 'arboreal' as const :
      desc.includes('burrow') || desc.includes('dig') ? 'burrowing' as const :
        desc.includes('swim') || desc.includes('aquatic') ? 'littoral' as const :
          'cursorial' as const;

    const foraging = desc.includes('canopy') || desc.includes('tree') ? 'arboreal' as const :
      desc.includes('underwater') || desc.includes('tidal') || desc.includes('aquatic') ? 'aquatic' as const :
        desc.includes('burrow') || desc.includes('underground') ? 'underground' as const :
          'surface' as const;

    const social = desc.includes('pack') || desc.includes('group') || desc.includes('social') || desc.includes('pair') ? 'pack' as const :
      desc.includes('tribal') || desc.includes('large') ? 'tribal' as const :
        'solitary' as const;

    // Map intelligence to strength/excavation (TraitsSchema doesn't have intelligence)
    return {
      locomotion,
      foraging,
      social,
      excavation: intelligenceScore * 0.5, // Use intelligence as proxy for excavation capability
      maxReach: intelligenceScore * 2, // Smarter = better reach
      speed: 1.0 + intelligenceScore * 0.5,
      strength: 0.5 + intelligenceScore * 0.3,
    };
  }

  /**
   * Create a creature with Yuka goal system
   */
  private createCreature(archetype: any, index: number): Creature {
    // Random spawn position on planet surface
    const lat = (this.rng() - 0.5) * 180;
    const lon = (this.rng() - 0.5) * 360;
    const position: Coordinate = {
      lat,
      lon,
    };

    // Initial needs (using MaterialType, not 'food'/'water')
    const needs: Need[] = [
      { type: 'organic_matter', current: 50, max: 100, depletionRate: 0.01, urgency: 0.3 + this.rng() * 0.3 },
      { type: 'water', current: 30, max: 100, depletionRate: 0.02, urgency: 0.2 + this.rng() * 0.2 },
    ];

    const creature: Creature = {
      id: `creature-${this.seed}-${index}`,
      archetype: archetype.name,
      traits: archetype.traits,
      position,
      needs,
      status: 'alive',
      age: 0,
      energy: 100,
      composition: {},
    };

    return creature;
  }

  /**
   * Query planet materials at coordinate
   */
  private queryMaterialsAt(coord: { lat: number; lon: number; altitude?: number }): Material[] {
    // Find appropriate layer (simplified - uses altitude)
    const altitudeKm = coord.altitude || 0;

    const layer = this.planet.layers.find(
      (l) => altitudeKm >= l.minRadius && altitudeKm <= l.maxRadius
    ) || this.planet.layers[this.planet.layers.length - 1]; // default to crust

    return layer.materials;
  }

  /**
   * Update creatures (run Yuka goals)
   */
  update(deltaTime: number): void {
    this.creatures.forEach((creature) => {
      if (creature.status !== 'alive') return;

      // Update needs
      this.updateNeeds(creature, deltaTime);

      // Evaluate and execute goals
      this.evaluateGoals(creature);

      // Age creature
      creature.age += deltaTime;
    });
  }

  /**
   * Update creature needs over time
   */
  private updateNeeds(creature: Creature, deltaTime: number): void {
    creature.needs.forEach((need) => {
      // Needs increase over time
      const rate = need.type === 'organic_matter' ? 0.01 : 0.02; // water more urgent
      need.urgency = Math.min(1.0, need.urgency + rate * deltaTime);

      // Critical threshold = death
      if (need.urgency > 0.95) {
        console.log(`[GEN1] Creature ${creature.id} died from ${need.type}`);
        creature.status = 'dead';
      }
    });
  }

  /**
   * Yuka Goal Evaluator - decides what to do
   */
  private evaluateGoals(creature: Creature): void {
    // Find most urgent need
    const mostUrgent = creature.needs.reduce((prev, curr) =>
      curr.urgency > prev.urgency ? curr : prev
    );

    if (mostUrgent.urgency > 0.6) {
      // Urgent! Execute goal
      this.executeGoal(creature, mostUrgent);
    }
  }

  /**
   * Execute a goal to satisfy a need
   */
  private executeGoal(creature: Creature, need: Need): void {
    // Query environment
    const materials = this.queryMaterialsAt(creature.position);

    // Can we satisfy this need here?
    const canSatisfy = materials.some((m) => {
      if (need.type === 'organic_matter') return m.type === 'carbon' || m.type === 'organic_matter' || m.type === 'wood';
      if (need.type === 'water') return m.type === 'water' || m.type === 'hydrogen';
      return false;
    });

    if (canSatisfy) {
      // Satisfy need
      need.current = Math.min(need.max, need.current + 20);
      need.urgency = Math.max(0, need.urgency - 0.5);
      console.log(
        `[GEN1] Creature ${creature.id} satisfied ${need.type} at (${creature.position.lat.toFixed(1)}, ${creature.position.lon.toFixed(1)})`
      );
    } else {
      // Move to new location (simplified)
      creature.position.lat += (this.rng() - 0.5) * 10;
      creature.position.lon += (this.rng() - 0.5) * 10;
      console.log(`[GEN1] Creature ${creature.id} moved to (${creature.position.lat.toFixed(1)}, ${creature.position.lon.toFixed(1)})`);
    }
  }

  /**
   * Get all creatures
   */
  getCreatures(): Creature[] {
    return Array.from(this.creatures.values());
  }

  /**
   * Get alive creatures
   */
  getAliveCreatures(): Creature[] {
    return this.getCreatures().filter((c) => c.status === 'alive');
  }
}
