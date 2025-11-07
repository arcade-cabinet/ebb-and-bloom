/**
 * Gen 1: Creature System with Yuka Goal Hierarchy + AI-Generated Archetypes
 * Uses data pools for creature traits instead of hardcoding
 */

import { Goal, CompositeGoal } from 'yuka';
import seedrandom from 'seedrandom';
import {
  Creature,
  Planet,
  Archetype,
  Coordinate,
  Material,
  Traits,
  Need,
} from '../schemas/index.js';
import { generateGen1DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/VisualBlueprintGenerator.js';

export interface Gen1Config {
  seed: string;
  planet: Planet;
  creatureCount: number;
  useAI?: boolean; // If false, uses fallback for testing
}

/**
 * Fallback archetypes when AI is disabled
 */
const FALLBACK_ARCHETYPES = {
  cursorial_forager: {
    name: 'Cursorial Forager',
    traits: {
      locomotion: 'cursorial' as const,
      foraging: 'surface' as const,
      social: 'solitary' as const,
      intelligence: 0.3,
    },
  },
  arboreal_opportunist: {
    name: 'Arboreal Opportunist',
    traits: {
      locomotion: 'arboreal' as const,
      foraging: 'canopy' as const,
      social: 'small_group' as const,
      intelligence: 0.5,
    },
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

  constructor(config: Gen1Config) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
    this.planet = config.planet;
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
      dataPools = await generateGen1DataPools(this.seed, this.planet);
      const { macro } = extractSeedComponents(this.seed);
      archetypeOptions = dataPools.macro.archetypeOptions.map((a: any) => ({
        name: a.name,
        traits: this.parseTraitsFromBlueprint(a.traits, a.visualBlueprint),
        visualBlueprint: a.visualBlueprint,
      }));
    } else {
      // Use fallback
      archetypeOptions = Object.values(FALLBACK_ARCHETYPES);
    }

    console.log(`[GEN1] Generated ${archetypeOptions.length} archetype options`);

    // Spawn creatures
    const { macro } = extractSeedComponents(this.seed);
    const archetype = selectFromPool(archetypeOptions, macro);
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
  private parseTraitsFromBlueprint(traitDesc: string, blueprint: any): Traits {
    // Extract traits from AI description
    const intelligence = traitDesc.includes('intelligent') || traitDesc.includes('clever') ? 0.7 :
                        traitDesc.includes('smart') ? 0.5 : 0.3;
    
    const locomotion = traitDesc.includes('climb') || traitDesc.includes('arboreal') ? 'arboreal' as const :
                       traitDesc.includes('burrow') || traitDesc.includes('dig') ? 'fossorial' as const :
                       traitDesc.includes('swim') || traitDesc.includes('aquatic') ? 'littoral' as const :
                       'cursorial' as const;
    
    const foraging = traitDesc.includes('canopy') ? 'canopy' as const :
                     traitDesc.includes('underwater') || traitDesc.includes('tidal') ? 'underwater' as const :
                     traitDesc.includes('burrow') ? 'burrow' as const :
                     'surface' as const;
    
    const social = traitDesc.includes('pack') || traitDesc.includes('group') || traitDesc.includes('social') ? 'pack' as const :
                   traitDesc.includes('pair') ? 'small_group' as const :
                   'solitary' as const;

    return { locomotion, foraging, social, intelligence };
  }

  /**
   * Create a creature with Yuka goal system
   */
  private createCreature(archetype: any, index: number): Creature {
    // Random spawn position on planet surface
    const lat = (this.rng() - 0.5) * 180;
    const lon = (this.rng() - 0.5) * 360;
    const position: Coordinate = {
      latitude: lat,
      longitude: lon,
      altitude: this.planet.radius / 1000, // surface in km
    };

    // Query materials at spawn location
    const materials = this.queryMaterialsAt(position);

    // Initial needs
    const needs: Need[] = [
      { type: 'food', urgency: 0.3 + this.rng() * 0.3, lastSatisfied: 0 },
      { type: 'water', urgency: 0.2 + this.rng() * 0.2, lastSatisfied: 0 },
    ];

    const creature: Creature = {
      id: `creature-${this.seed}-${index}`,
      archetype: archetype.name,
      traits: archetype.traits,
      position,
      needs,
      alive: true,
      age: 0,
      visualBlueprint: archetype.visualBlueprint,
    };

    return creature;
  }

  /**
   * Query planet materials at coordinate
   */
  private queryMaterialsAt(coord: Coordinate): Material[] {
    // Find appropriate layer (simplified - uses altitude)
    const altitudeKm = coord.altitude || 0;
    const radiusKm = this.planet.radius / 1000;

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
      if (!creature.alive) return;

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
      const rate = need.type === 'food' ? 0.01 : 0.02; // water more urgent
      need.urgency = Math.min(1.0, need.urgency + rate * deltaTime);

      // Critical threshold = death
      if (need.urgency > 0.95) {
        console.log(`[GEN1] Creature ${creature.id} died from ${need.type}`);
        creature.alive = false;
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
      if (need.type === 'food') return m.element === 'C' || m.element === 'O';
      if (need.type === 'water') return m.element === 'H' || m.element === 'O';
      return false;
    });

    if (canSatisfy) {
      // Satisfy need
      need.urgency = Math.max(0, need.urgency - 0.5);
      need.lastSatisfied = creature.age;
      console.log(
        `[GEN1] Creature ${creature.id} satisfied ${need.type} at (${creature.position.latitude.toFixed(1)}, ${creature.position.longitude.toFixed(1)})`
      );
    } else {
      // Move to new location (simplified)
      creature.position.latitude += (this.rng() - 0.5) * 10;
      creature.position.longitude += (this.rng() - 0.5) * 10;
      console.log(`[GEN1] Creature ${creature.id} moved to (${creature.position.latitude.toFixed(1)}, ${creature.position.longitude.toFixed(1)})`);
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
    return this.getCreatures().filter((c) => c.alive);
  }
}
