/**
 * Gen 1: Creature System with Yuka Goal Hierarchy
 * Real AI-driven creatures that query the planet and make decisions
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

export interface Gen1Config {
  seed: string;
  planet: Planet;
  creatureCount: number;
}

// Archetype definitions
export const ARCHETYPES = {
  cursorial_forager: {
    name: 'Cursorial Forager',
    traits: {
      locomotion: 'cursorial' as const,
      foraging: 'surface' as const,
      social: 'solitary' as const,
      excavation: 0.2,
      maxReach: 50,
      speed: 5,
      strength: 3,
    },
    baseComposition: {
      carbon: 3.5,
      calcium: 0.5,
      iron: 0.1,
      water: 3.0,
    },
  },
  arboreal_opportunist: {
    name: 'Arboreal Opportunist',
    traits: {
      locomotion: 'arboreal' as const,
      foraging: 'arboreal' as const,
      social: 'solitary' as const,
      excavation: 0.1,
      maxReach: 30,
      speed: 4,
      strength: 2,
    },
    baseComposition: {
      carbon: 2.5,
      calcium: 0.3,
      iron: 0.05,
      water: 2.0,
    },
  },
  littoral_harvester: {
    name: 'Littoral Harvester',
    traits: {
      locomotion: 'littoral' as const,
      foraging: 'aquatic' as const,
      social: 'solitary' as const,
      excavation: 0.15,
      maxReach: 40,
      speed: 3,
      strength: 2.5,
    },
    baseComposition: {
      carbon: 3.0,
      calcium: 0.4,
      iron: 0.08,
      water: 3.5,
    },
  },
  burrow_engineer: {
    name: 'Burrow Engineer',
    traits: {
      locomotion: 'burrowing' as const,
      foraging: 'underground' as const,
      social: 'solitary' as const,
      excavation: 0.4,
      maxReach: 100,
      speed: 2,
      strength: 4,
    },
    baseComposition: {
      carbon: 4.0,
      calcium: 0.8,
      iron: 0.15,
      water: 2.5,
    },
  },
};

/**
 * Yuka Goal: Manage Energy
 */
class ManageEnergyGoal extends Goal {
  activate() {
    console.log('[ManageEnergyGoal] Activated');
  }

  execute(creature: any, planet: any, deltaTime: number) {
    // Calculate energy need
    const energyNeed = creature.needs.find((n: Need) => n.type === 'carbon');
    if (!energyNeed) return;

    const urgency = energyNeed.urgency;

    if (urgency > 0.7) {
      // HIGH URGENCY: Find food NOW
      const accessibleMaterials = this.queryAccessibleMaterials(creature, planet);
      
      if (accessibleMaterials.length > 0) {
        // Consume nearest accessible material
        const material = accessibleMaterials[0];
        this.consumeMaterial(creature, material, deltaTime);
      } else {
        // No accessible food - explore
        this.explore(creature, planet, deltaTime);
      }
    } else if (urgency > 0.3) {
      // MODERATE: Opportunistically forage
      const nearbyMaterials = this.queryAccessibleMaterials(creature, planet, 100);
      if (nearbyMaterials.length > 0) {
        this.consumeMaterial(creature, nearbyMaterials[0], deltaTime);
      }
    }
    // else: Energy is fine, do nothing
  }

  terminate() {
    console.log('[ManageEnergyGoal] Terminated');
  }

  private queryAccessibleMaterials(creature: any, planet: any, radius: number = 1000): Material[] {
    // Query planet for materials within reach
    const surfaceLayer = planet.layers.find((l: any) => l.name === 'crust');
    if (!surfaceLayer) return [];

    return surfaceLayer.materials.filter((m: Material) => 
      m.depth <= creature.traits.maxReach &&
      m.hardness <= (creature.traits.excavation * 10) &&
      m.quantity > 0
    );
  }

  private consumeMaterial(creature: any, material: Material, deltaTime: number) {
    // Consume material (simplified for now)
    const consumeAmount = creature.traits.excavation * deltaTime * 0.1;
    const actualAmount = Math.min(consumeAmount, material.quantity);

    // Add to creature composition
    creature.composition[material.type] = (creature.composition[material.type] || 0) + actualAmount;

    // Deplete material
    material.quantity -= actualAmount;

    // Update energy
    const energyNeed = creature.needs.find((n: Need) => n.type === 'carbon');
    if (energyNeed && material.type === 'carbon') {
      energyNeed.current += actualAmount;
    }

    console.log(`[ManageEnergyGoal] Consumed ${actualAmount.toFixed(2)}kg of ${material.type}`);
  }

  private explore(creature: any, planet: any, deltaTime: number) {
    // Random walk
    const angle = Math.random() * Math.PI * 2;
    const distance = creature.traits.speed * deltaTime * 0.01; // km

    creature.position.lat += Math.cos(angle) * distance;
    creature.position.lon += Math.sin(angle) * distance;

    // Clamp to valid range
    creature.position.lat = Math.max(-90, Math.min(90, creature.position.lat));
    creature.position.lon = ((creature.position.lon + 180) % 360) - 180;

    console.log(`[ManageEnergyGoal] Exploring to (${creature.position.lat.toFixed(2)}, ${creature.position.lon.toFixed(2)})`);
  }
}

/**
 * Yuka Goal: Manage Rest
 */
class ManageRestGoal extends Goal {
  activate() {
    console.log('[ManageRestGoal] Activated');
  }

  execute(creature: any, planet: any, deltaTime: number) {
    const restNeed = creature.needs.find((n: Need) => n.type === 'water');
    if (!restNeed) return;

    if (restNeed.urgency > 0.6) {
      // Need to rest
      console.log('[ManageRestGoal] Resting...');
      restNeed.current += deltaTime * 0.5; // Rest rate
      restNeed.current = Math.min(restNeed.current, restNeed.max);
    }
  }

  terminate() {
    console.log('[ManageRestGoal] Terminated');
  }
}

/**
 * Gen 1 System
 */
export class Gen1System {
  private seed: string;
  private rng: seedrandom.PRNG;
  private planet: Planet;

  constructor(config: Gen1Config) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
    this.planet = config.planet;
  }

  /**
   * Spawn creatures deterministically
   */
  spawnCreatures(count: number): Creature[] {
    console.log(`[GEN1] Spawning ${count} creatures with seed: ${this.seed}`);

    const creatures: Creature[] = [];
    const archetypes = Object.keys(ARCHETYPES) as Archetype[];

    for (let i = 0; i < count; i++) {
      // Deterministic archetype selection
      const archetype = archetypes[Math.floor(this.rng() * archetypes.length)];
      const archetypeData = ARCHETYPES[archetype];

      // Deterministic spawn position
      const position: Coordinate = {
        lat: (this.rng() * 180) - 90,
        lon: (this.rng() * 360) - 180,
      };

      // Create creature
      const creature: Creature = {
        id: `creature-${i}`,
        archetype,
        position,
        traits: { ...archetypeData.traits },
        composition: { ...archetypeData.baseComposition },
        needs: [
          {
            type: 'carbon',
            current: archetypeData.baseComposition.carbon,
            max: archetypeData.baseComposition.carbon * 1.5,
            depletionRate: archetypeData.traits.speed * 0.1,
            urgency: 0.3,
          },
          {
            type: 'water',
            current: archetypeData.baseComposition.water,
            max: archetypeData.baseComposition.water * 1.2,
            depletionRate: archetypeData.traits.speed * 0.05,
            urgency: 0.2,
          },
        ],
        energy: 100,
        age: 0,
        status: 'alive',
      };

      creatures.push(creature);
    }

    console.log(`[GEN1] Spawned ${creatures.length} creatures`);
    return creatures;
  }

  /**
   * Update all creatures for one cycle
   */
  update(creatures: Creature[], deltaTime: number) {
    for (const creature of creatures) {
      if (creature.status !== 'alive') continue;

      // Update needs (deplete over time)
      for (const need of creature.needs) {
        need.current -= need.depletionRate * deltaTime;
        need.current = Math.max(0, need.current);
        need.urgency = 1 - (need.current / need.max);
      }

      // Execute Yuka goals
      this.executeGoals(creature, deltaTime);

      // Check for death
      const criticalNeed = creature.needs.find(n => n.urgency > 0.95);
      if (criticalNeed) {
        creature.status = 'dying';
        console.log(`[GEN1] Creature ${creature.id} is dying (${criticalNeed.type} depleted)`);
      }

      creature.age += deltaTime;
    }
  }

  private executeGoals(creature: Creature, deltaTime: number) {
    // Simple goal prioritization (will use full Yuka CompositeGoal later)
    const energyGoal = new ManageEnergyGoal();
    const restGoal = new ManageRestGoal();

    // Evaluate priorities
    const energyNeed = creature.needs.find(n => n.type === 'carbon');
    const restNeed = creature.needs.find(n => n.type === 'water');

    if (energyNeed && energyNeed.urgency > 0.5) {
      energyGoal.execute(creature, this.planet, deltaTime);
    } else if (restNeed && restNeed.urgency > 0.5) {
      restGoal.execute(creature, this.planet, deltaTime);
    } else {
      // Idle / explore
      energyGoal.execute(creature, this.planet, deltaTime);
    }
  }
}
