/**
 * Gen 2: Pack Formation with Yuka Flocking Behaviors
 * Creatures form packs when beneficial, use Cohesion/Separation/Alignment
 */

import { 
  Vehicle, 
  CohesionBehavior, 
  SeparationBehavior, 
  AlignmentBehavior,
  FuzzyModule,
  FuzzyVariable,
  FuzzySet,
  FuzzyRule,
  FuzzyAND,
  TriangularFuzzySet,
  LeftShoulderFuzzySet,
  RightShoulderFuzzySet,
} from 'yuka';
import {
  Pack,
  Creature,
  Planet,
  Coordinate,
} from '../schemas/index.js';

/**
 * REAL Yuka FuzzyModule for Pack Formation
 */
export class PackFormationFuzzy {
  private fuzzy: FuzzyModule;
  private scarcityVar: FuzzyVariable;
  private proximityVar: FuzzyVariable;
  private desirabilityVar: FuzzyVariable;

  // Store FuzzySet references
  private scarcityLow!: FuzzySet;
  private scarcityMod!: FuzzySet;
  private scarcityHigh!: FuzzySet;
  private proximityFew!: FuzzySet;
  private proximitySome!: FuzzySet;
  private proximityMany!: FuzzySet;
  private desirabilityLow!: FuzzySet;
  private desirabilityMod!: FuzzySet;
  private desirabilityHigh!: FuzzySet;

  constructor() {
    this.fuzzy = new FuzzyModule();

    // Input 1: Resource scarcity (0 = abundant, 1 = scarce)
    this.scarcityVar = new FuzzyVariable();
    this.scarcityLow = new LeftShoulderFuzzySet(0, 0.15, 0.3);
    this.scarcityMod = new TriangularFuzzySet(0.2, 0.5, 0.8);
    this.scarcityHigh = new RightShoulderFuzzySet(0.7, 0.85, 1);
    this.scarcityVar.add(this.scarcityLow);
    this.scarcityVar.add(this.scarcityMod);
    this.scarcityVar.add(this.scarcityHigh);
    this.fuzzy.addFLV('scarcity', this.scarcityVar);

    // Input 2: Nearby creatures (0 = none, 1 = many)
    this.proximityVar = new FuzzyVariable();
    this.proximityFew = new LeftShoulderFuzzySet(0, 0.15, 0.3);
    this.proximitySome = new TriangularFuzzySet(0.2, 0.5, 0.8);
    this.proximityMany = new RightShoulderFuzzySet(0.7, 0.85, 1);
    this.proximityVar.add(this.proximityFew);
    this.proximityVar.add(this.proximitySome);
    this.proximityVar.add(this.proximityMany);
    this.fuzzy.addFLV('proximity', this.proximityVar);

    // Output: Pack desirability (0-100 scale, like Yuka Soldier example)
    this.desirabilityVar = new FuzzyVariable();
    this.desirabilityLow = new LeftShoulderFuzzySet(0, 25, 50);
    this.desirabilityMod = new TriangularFuzzySet(25, 50, 75);
    this.desirabilityHigh = new RightShoulderFuzzySet(50, 75, 100);
    this.desirabilityVar.add(this.desirabilityLow);
    this.desirabilityVar.add(this.desirabilityMod);
    this.desirabilityVar.add(this.desirabilityHigh);
    this.fuzzy.addFLV('desirability', this.desirabilityVar);

    // Build REAL FuzzyRule objects (comprehensive coverage like Yuka Soldier example)
    // Rule 1: IF scarcity IS high AND proximity IS many THEN desirability IS high
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityHigh, this.proximityMany),
      this.desirabilityHigh
    ));

    // Rule 2: IF scarcity IS high AND proximity IS some THEN desirability IS moderate
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityHigh, this.proximitySome),
      this.desirabilityMod
    ));

    // Rule 3: IF scarcity IS high AND proximity IS few THEN desirability IS low
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityHigh, this.proximityFew),
      this.desirabilityLow
    ));

    // Rule 4: IF scarcity IS moderate AND proximity IS many THEN desirability IS moderate
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityMod, this.proximityMany),
      this.desirabilityMod
    ));

    // Rule 5: IF scarcity IS moderate AND proximity IS some THEN desirability IS moderate
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityMod, this.proximitySome),
      this.desirabilityMod
    ));

    // Rule 6: IF scarcity IS moderate AND proximity IS few THEN desirability IS low
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityMod, this.proximityFew),
      this.desirabilityLow
    ));

    // Rule 7: IF scarcity IS low AND proximity IS many THEN desirability IS low
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityLow, this.proximityMany),
      this.desirabilityLow
    ));

    // Rule 8: IF scarcity IS low AND proximity IS some THEN desirability IS low
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityLow, this.proximitySome),
      this.desirabilityLow
    ));

    // Rule 9: IF scarcity IS low AND proximity IS few THEN desirability IS low
    this.fuzzy.addRule(new FuzzyRule(
      new FuzzyAND(this.scarcityLow, this.proximityFew),
      this.desirabilityLow
    ));
  }

  evaluate(resourceScarcity: number, nearbyCreatureCount: number, maxCreatures: number): number {
    // Normalize inputs
    const scarcity = Math.min(1, Math.max(0, resourceScarcity));
    const proximity = Math.min(1, nearbyCreatureCount / maxCreatures);

    this.fuzzy.fuzzify('scarcity', scarcity);
    this.fuzzy.fuzzify('proximity', proximity);

    const result = this.fuzzy.defuzzify('desirability'); // Returns 0-100

    console.log(`[PackFormationFuzzy] scarcity=${scarcity.toFixed(2)}, proximity=${proximity.toFixed(2)} → desirability=${result.toFixed(2)}`);

    // Normalize back to 0-1 for consistency
    return result / 100;
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
  private fuzzy: PackFormationFuzzy;
  private vehicles: Map<string, PackMemberVehicle> = new Map();

  constructor(planet: Planet) {
    this.planet = planet;
    this.fuzzy = new PackFormationFuzzy();
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
      const desirability = this.fuzzy.evaluate(scarcity, nearby.length, 10);

      if (desirability > 0.1 && nearby.length >= 2) {
        // Form pack!
        const packMembers = [creature, ...nearby.slice(0, 5)]; // Max 6 members initially
        const pack = this.formPack(packMembers);
        packs.push(pack);

        // Mark members as packed
        for (const member of packMembers) {
          packed.add(member.id);
        }

        console.log(`[GEN2] Pack ${pack.id} formed with ${pack.members.length} members (desirability=${desirability.toFixed(2)})`);
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

      // Get pack member creatures (alive only!)
      const members = creatures.filter(c => c.status === 'alive' && pack.members.includes(c.id));
      
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
