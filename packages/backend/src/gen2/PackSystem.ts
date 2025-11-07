/**
 * Gen 2: Pack Formation with REAL Yuka FuzzyModule + AI-Generated Pack Types
 * Uses data pools for pack behaviors instead of hardcoding
 */

import {
  Vehicle,
  CohesionBehavior,
  SeparationBehavior,
  AlignmentBehavior,
  Vector3,
  FuzzyModule,
  FuzzyVariable,
  FuzzyRule,
  FuzzyAND,
  LeftShoulderFuzzySet,
  TriangularFuzzySet,
  RightShoulderFuzzySet,
} from 'yuka';
import seedrandom from 'seedrandom';
import { Creature, Pack, Coordinate } from '../schemas/index.js';
import { generateGen2DataPools, selectFromPool, extractSeedComponents } from '../gen-systems/VisualBlueprintGenerator.js';

export interface Gen2Config {
  seed: string;
  useAI?: boolean;
}

/**
 * Fallback pack types when AI is disabled
 */
const FALLBACK_PACK_TYPES = [
  {
    name: 'Hunting Pack',
    traits: 'Coordinated pursuit, hierarchical',
    visualBlueprint: {
      description: 'Coordinated hunting group',
      canCreate: ['coordinated hunts'],
      cannotCreate: ['gatherer behaviors'],
      representations: {
        materials: ['rock/Rock001.jpg'],
        shaders: { roughness: 0.8 },
        proceduralRules: 'Tight formation',
        colorPalette: ['#8B4513'],
      },
      compatibleWith: ['carnivores'],
      incompatibleWith: ['herbivores'],
      compositionRules: 'Maintain proximity',
    },
  },
];

/**
 * Yuka FuzzyModule for pack formation decisions
 * Based on scarcity (problem) and proximity (capability)
 */
class PackFormationFuzzy {
  private fuzzy: FuzzyModule;

  constructor() {
    this.fuzzy = new FuzzyModule();

    // INPUT 1: Problem (scarcity of resources)
    const problem = new FuzzyVariable('problem');
    problem.add(new LeftShoulderFuzzySet('low', 0, 25, 50));
    problem.add(new TriangularFuzzySet('moderate', 25, 50, 75));
    problem.add(new RightShoulderFuzzySet('high', 50, 75, 100));
    this.fuzzy.addFLV(problem);

    // INPUT 2: Capability (proximity of creatures)
    const capability = new FuzzyVariable('capability');
    capability.add(new LeftShoulderFuzzySet('far', 0, 25, 50));
    capability.add(new TriangularFuzzySet('medium', 25, 50, 75));
    capability.add(new RightShoulderFuzzySet('close', 50, 75, 100));
    this.fuzzy.addFLV(capability);

    // OUTPUT: Desirability of pack formation
    const desirability = new FuzzyVariable('desirability');
    desirability.add(new LeftShoulderFuzzySet('low', 0, 25, 50));
    desirability.add(new TriangularFuzzySet('moderate', 25, 50, 75));
    desirability.add(new RightShoulderFuzzySet('high', 50, 75, 100));
    this.fuzzy.addFLV(desirability);

    // RULES: Comprehensive coverage (9 rules for all combinations)
    const problemLow = problem.getSet('low');
    const problemMod = problem.getSet('moderate');
    const problemHigh = problem.getSet('high');
    const capFar = capability.getSet('far');
    const capMed = capability.getSet('medium');
    const capClose = capability.getSet('close');
    const desLow = desirability.getSet('low');
    const desMod = desirability.getSet('moderate');
    const desHigh = desirability.getSet('high');

    // High problem + close capability = high desirability
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capClose), desHigh));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capMed), desMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemHigh, capFar), desMod));

    // Moderate problem
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capClose), desMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capMed), desMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemMod, capFar), desLow));

    // Low problem
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capClose), desMod));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capMed), desLow));
    this.fuzzy.addRule(new FuzzyRule(new FuzzyAND(problemLow, capFar), desLow));
  }

  evaluate(scarcity: number, proximity: number): number {
    this.fuzzy.fuzzify('problem', scarcity * 100);
    this.fuzzy.fuzzify('capability', proximity * 100);
    return this.fuzzy.defuzzify('desirability') / 100; // Back to 0-1
  }
}

/**
 * Yuka Vehicle for pack member flocking
 */
class PackMemberVehicle extends Vehicle {
  public creatureId: string;

  constructor(creatureId: string, position: Vector3) {
    super();
    this.creatureId = creatureId;
    this.position.copy(position);
    this.maxSpeed = 10; // km/cycle
  }
}

/**
 * Gen 2 System: Pack formation and flocking
 */
export class Gen2System {
  private seed: string;
  private rng: seedrandom.PRNG;
  private fuzzy: PackFormationFuzzy;
  private packs: Map<string, Pack> = new Map();
  private vehicles: Map<string, PackMemberVehicle> = new Map();
  private useAI: boolean;
  private packTypeOptions: any[] = [];

  constructor(config: Gen2Config) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
    this.fuzzy = new PackFormationFuzzy();
    this.useAI = config.useAI ?? true;
  }

  /**
   * Initialize Gen 2 with AI-generated pack types
   */
  async initialize(): Promise<void> {
    console.log(`[GEN2] Initializing with AI data pools: ${this.useAI}`);

    if (this.useAI) {
      const dataPools = await generateGen2DataPools(this.seed);
      this.packTypeOptions = dataPools.macro.packTypeOptions.map((p: any) => ({
        name: p.name,
        traits: p.traits,
        visualBlueprint: p.visualBlueprint,
      }));
    } else {
      this.packTypeOptions = FALLBACK_PACK_TYPES;
    }

    console.log(`[GEN2] Generated ${this.packTypeOptions.length} pack type options`);
  }

  /**
   * Evaluate pack formation using Yuka FuzzyModule
   */
  evaluatePackFormation(creatures: Creature[]): void {
    const alive = creatures.filter((c) => c.alive);
    if (alive.length < 2) return;

    console.log(`[GEN2] Evaluating pack formation for ${alive.length} creatures`);

    const packed = new Set<string>(); // Track creatures already in packs

    alive.forEach((creature) => {
      if (packed.has(creature.id)) return; // Already in a pack

      // Find nearby creatures
      const nearby = this.findNearbyCreatures(creature, alive, 100); // 100km radius

      if (nearby.length < 1) return; // Need at least 2 total (self + 1)

      // Calculate scarcity (problem)
      const avgUrgency =
        creature.needs.reduce((sum, n) => sum + n.urgency, 0) /
        creature.needs.length;
      const scarcity = avgUrgency;

      // Calculate proximity (capability)
      const avgDistance =
        nearby.reduce((sum, n) => sum + this.distance(creature.position, n.position), 0) /
        nearby.length;
      const proximity = Math.max(0, 1 - avgDistance / 100); // Normalize to 0-1

      // Evaluate with fuzzy module
      const desirability = this.fuzzy.evaluate(scarcity, proximity);

      console.log(
        `[GEN2] Creature ${creature.id}: scarcity=${scarcity.toFixed(2)}, proximity=${proximity.toFixed(2)} → desirability=${desirability.toFixed(2)}`
      );

      // Form pack if desirable
      if (desirability > 0.1) {
        // Lowered threshold after debugging
        const members = [creature, ...nearby].filter(c => !packed.has(c.id));
        if (members.length >= 2) {
          this.formPack(members);
          members.forEach(m => packed.add(m.id)); // Mark as packed
        }
      }
    });
  }

  /**
   * Find creatures within radius
   */
  private findNearbyCreatures(
    creature: Creature,
    allCreatures: Creature[],
    radiusKm: number
  ): Creature[] {
    return allCreatures.filter(
      (other) =>
        other.id !== creature.id &&
        this.distance(creature.position, other.position) < radiusKm
    );
  }

  /**
   * Calculate distance between coordinates (simplified)
   */
  private distance(a: Coordinate, b: Coordinate): number {
    const dlat = Math.abs(a.latitude - b.latitude);
    const dlon = Math.abs(a.longitude - b.longitude);
    return Math.sqrt(dlat * dlat + dlon * dlon) * 111; // ~111km per degree
  }

  /**
   * Form a new pack
   */
  private formPack(members: Creature[]): void {
    // Select pack type from AI pools
    const { macro } = extractSeedComponents(this.seed + members[0].id);
    const packType = selectFromPool(this.packTypeOptions, macro);

    // Calculate center
    const center = this.calculateCenter(members);

    const pack: Pack = {
      id: `pack-${this.seed}-${this.packs.size}`,
      members: members.map((m) => m.id),
      center,
      territory: { center, radiusKm: 50 },
      cohesion: 0.8,
      packType: packType.name,
      visualBlueprint: packType.visualBlueprint,
    };

    this.packs.set(pack.id, pack);
    console.log(`[GEN2] Formed pack ${pack.id} with ${members.length} members (${packType.name})`);
  }

  /**
   * Calculate geometric center of creatures
   */
  private calculateCenter(creatures: Creature[]): Coordinate {
    const avgLat =
      creatures.reduce((sum, c) => sum + c.position.latitude, 0) /
      creatures.length;
    const avgLon =
      creatures.reduce((sum, c) => sum + c.position.longitude, 0) /
      creatures.length;
    const avgAlt =
      creatures.reduce((sum, c) => sum + (c.position.altitude || 0), 0) /
      creatures.length;

    return { latitude: avgLat, longitude: avgLon, altitude: avgAlt };
  }

  /**
   * Update packs with Yuka flocking behaviors
   */
  updatePacks(creatures: Creature[], deltaTime: number): void {
    this.packs.forEach((pack) => {
      const packCreatures = creatures.filter(
        (c) => pack.members.includes(c.id) && c.alive
      );

      if (packCreatures.length < 2) {
        // Pack dispersed
        console.log(`[GEN2] Pack ${pack.id} dispersed`);
        this.packs.delete(pack.id);
        return;
      }

      // Setup Yuka vehicles if needed
      packCreatures.forEach((creature) => {
        if (!this.vehicles.has(creature.id)) {
          const pos = new Vector3(
            creature.position.latitude,
            creature.position.altitude || 0,
            creature.position.longitude
          );
          this.vehicles.set(
            creature.id,
            new PackMemberVehicle(creature.id, pos)
          );
        }
      });

      // Get vehicles for this pack
      const packVehicles = packCreatures
        .map((c) => this.vehicles.get(c.id))
        .filter((v) => v !== undefined) as PackMemberVehicle[];

      // Apply flocking behaviors
      packVehicles.forEach((vehicle) => {
        vehicle.steering.clear();

        const cohesion = new CohesionBehavior(packVehicles);
        const separation = new SeparationBehavior(packVehicles);
        const alignment = new AlignmentBehavior(packVehicles);

        cohesion.weight = 1.0;
        separation.weight = 2.0;
        alignment.weight = 1.5;

        vehicle.steering.add(cohesion);
        vehicle.steering.add(separation);
        vehicle.steering.add(alignment);

        vehicle.update(deltaTime);

        // Update creature position
        const creature = packCreatures.find((c) => c.id === vehicle.creatureId);
        if (creature) {
          creature.position.latitude = vehicle.position.x;
          creature.position.altitude = vehicle.position.y;
          creature.position.longitude = vehicle.position.z;
        }
      });

      // Update pack center
      pack.center = this.calculateCenter(packCreatures);
    });
  }

  getPacks(): Pack[] {
    return Array.from(this.packs.values());
  }
}
