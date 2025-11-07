/**
 * Gen 2: Pack Formation with Yuka Flocking Behaviors
 * Creatures form packs when beneficial, use Cohesion/Separation/Alignment
 */

import { Vehicle, CohesionBehavior, SeparationBehavior, AlignmentBehavior } from 'yuka';
import {
  Pack,
  Creature,
  Planet,
  Coordinate,
} from '../schemas/index.js';

/**
 * Heuristic: When should a pack form?
 * Uses simple fuzzy-like logic without Yuka's FuzzyModule complexity
 */
export class PackFormationEvaluator {
  evaluate(resourceScarcity: number, nearbyCreatureCount: number, maxCreatures: number): number {
    // Normalize inputs
    const scarcity = Math.min(1, Math.max(0, resourceScarcity));
    const proximity = Math.min(1, nearbyCreatureCount / maxCreatures);

    // Fuzzy-like rules:
    // High scarcity + many nearby = high desirability (safety in numbers)
    // Low scarcity = low desirability (no need to pack)
    // Few nearby = low desirability (can't form pack)

    let desirability = 0;

    if (scarcity > 0.7 && proximity > 0.7) {
      // High scarcity + many nearby
      desirability = 0.9;
    } else if (scarcity > 0.4 && proximity > 0.4) {
      // Moderate scarcity + some nearby
      desirability = 0.6;
    } else if (scarcity < 0.3 || proximity < 0.3) {
      // Low scarcity or few nearby
      desirability = 0.2;
    } else {
      // Middle ground
      desirability = 0.5;
    }

    console.log(`[PackFormation] scarcity=${scarcity.toFixed(2)}, proximity=${proximity.toFixed(2)} → desirability=${desirability.toFixed(2)}`);

    return desirability;
  }
}

/**
 * Yuka Vehicle for Pack Member (enables flocking)
 */
export class PackMemberVehicle extends Vehicle {
  public creatureId: string;

  constructor(creature: Creature) {
    super();
    this.creatureId = creature.id;
    this.position.set(creature.position.lon, 0, creature.position.lat);
    this.maxSpeed = creature.traits.speed;
    this.mass = 1;
  }
}

/**
 * Gen 2 System
 */
export class Gen2System {
  private planet: Planet;
  private evaluator: PackFormationEvaluator;
  private vehicles: Map<string, PackMemberVehicle> = new Map();

  constructor(planet: Planet) {
    this.planet = planet;
    this.evaluator = new PackFormationEvaluator();
  }

  /**
   * Evaluate if packs should form
   */
  evaluatePackFormation(creatures: Creature[]): Pack[] {
    const packs: Pack[] = [];
    const packed = new Set<string>(); // Track packed creatures

    // Calculate resource scarcity
    const scarcity = this.calculateResourceScarcity();

    const aliveCreatures = creatures.filter(c => c.status === 'alive');

    // For each creature, check if they should form/join a pack
    for (const creature of aliveCreatures) {
      if (packed.has(creature.id)) continue; // Already in a pack

      // Find nearby creatures that aren't already packed
      const availableNearby = aliveCreatures.filter(c => !packed.has(c.id) && c.id !== creature.id);
      const nearby = this.findNearbyCreatures(creature, availableNearby, 100);

      // Evaluate pack formation desirability
      const desirability = this.evaluator.evaluate(scarcity, nearby.length, 10);

      if (desirability > 0.45 && nearby.length >= 2) {
        // Form pack!
        const packMembers = [creature, ...nearby.slice(0, 5)]; // Max 6 members initially
        const pack = this.formPack(packMembers);
        packs.push(pack);

        // Mark members as packed
        for (const member of packMembers) {
          packed.add(member.id);
        }

        console.log(`[GEN2] Pack ${pack.id} formed with ${pack.members.length} members`);
      }
    }

    return packs;
  }

  /**
   * Update existing packs (apply flocking behaviors)
   */
  updatePacks(packs: Pack[], creatures: Creature[], deltaTime: number) {
    for (const pack of packs) {
      if (pack.status !== 'stable') continue;

      // Get pack member creatures
      const members = creatures.filter(c => pack.members.includes(c.id));
      
      if (members.length === 0) {
        pack.status = 'dispersing';
        continue;
      }

      // Setup Yuka vehicles for flocking
      this.setupFlockingBehaviors(pack, members);

      // Update vehicle positions
      for (const [id, vehicle] of this.vehicles) {
        vehicle.update(deltaTime);

        // Update creature position from vehicle
        const creature = members.find(c => c.id === id);
        if (creature) {
          creature.position.lon = vehicle.position.x;
          creature.position.lat = vehicle.position.z;
        }
      }

      // Update pack center
      this.updatePackCenter(pack, members);

      // Update cohesion metric
      pack.cohesion = this.calculateCohesion(members);
    }
  }

  /**
   * Setup Yuka flocking behaviors
   */
  private setupFlockingBehaviors(pack: Pack, members: Creature[]) {
    // Create/update vehicles for pack members
    const packVehicles: PackMemberVehicle[] = [];

    for (const member of members) {
      let vehicle = this.vehicles.get(member.id);
      
      if (!vehicle) {
        vehicle = new PackMemberVehicle(member);
        this.vehicles.set(member.id, vehicle);
      }

      packVehicles.push(vehicle);
    }

    // Add flocking behaviors to each vehicle
    for (const vehicle of packVehicles) {
      // Clear existing behaviors
      vehicle.steering.clear();

      // Cohesion: Stay close to pack
      const cohesion = new CohesionBehavior(packVehicles);
      cohesion.weight = 1.0;
      vehicle.steering.add(cohesion);

      // Separation: Don't get too close
      const separation = new SeparationBehavior(packVehicles);
      separation.weight = 2.0;
      vehicle.steering.add(separation);

      // Alignment: Move in same direction
      const alignment = new AlignmentBehavior(packVehicles);
      alignment.weight = 1.5;
      vehicle.steering.add(alignment);
    }
  }

  /**
   * Form a new pack
   */
  private formPack(members: Creature[]): Pack {
    const center = this.calculateCenter(members);

    const pack: Pack = {
      id: `pack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      members: members.map(m => m.id),
      center,
      cohesion: 1.0,
      status: 'stable',
    };

    return pack;
  }

  /**
   * Find nearby creatures
   */
  private findNearbyCreatures(creature: Creature, allCreatures: Creature[], radiusKm: number): Creature[] {
    return allCreatures.filter(other => {
      if (other.id === creature.id) return false;

      const distance = this.calculateDistance(creature.position, other.position);
      return distance <= radiusKm;
    });
  }

  /**
   * Calculate distance between two coordinates (km)
   */
  private calculateDistance(a: Coordinate, b: Coordinate): number {
    // Haversine formula (simplified for testing)
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    
    const a1 = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1-a1));
    
    return 6371 * c; // Earth radius in km
  }

  /**
   * Calculate center of creatures
   */
  private calculateCenter(members: Creature[]): Coordinate {
    const avgLat = members.reduce((sum, m) => sum + m.position.lat, 0) / members.length;
    const avgLon = members.reduce((sum, m) => sum + m.position.lon, 0) / members.length;

    return { lat: avgLat, lon: avgLon };
  }

  /**
   * Update pack center
   */
  private updatePackCenter(pack: Pack, members: Creature[]) {
    pack.center = this.calculateCenter(members);
  }

  /**
   * Calculate cohesion (how tight the pack is)
   */
  private calculateCohesion(members: Creature[]): number {
    if (members.length < 2) return 1.0;

    const center = this.calculateCenter(members);
    const avgDistance = members.reduce((sum, m) => {
      return sum + this.calculateDistance(m.position, center);
    }, 0) / members.length;

    // Cohesion: closer = higher value
    return Math.max(0, 1 - (avgDistance / 10)); // 10km = 0 cohesion
  }

  /**
   * Calculate resource scarcity (0-1)
   */
  private calculateResourceScarcity(): number {
    // Count accessible materials on planet
    const crust = this.planet.layers.find(l => l.name === 'crust');
    if (!crust) return 0.5;

    const total = crust.materials.reduce((sum, m) => sum + m.quantity, 0);
    const accessible = crust.materials.filter(m => m.depth < 100 && m.hardness < 5)
      .reduce((sum, m) => sum + m.quantity, 0);

    const scarcity = 1 - (accessible / total);
    return Math.min(1, Math.max(0, scarcity));
  }

  /**
   * Check if creature is in a pack
   */
  private isInPack(creature: Creature, packs: Pack[]): boolean {
    return packs.some(p => p.members.includes(creature.id));
  }
}
