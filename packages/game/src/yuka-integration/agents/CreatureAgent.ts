/**
 * CREATURE AGENT
 * 
 * Individual creature with Yuka pathfinding, steering, goals.
 * Asks Legal Broker for biological constraints.
 */

import { CompositeGoal, Goal, Think, Vector3, Vehicle, WanderBehavior } from 'yuka';

/**
 * Find Food Goal
 */
export class FindFoodGoal extends Goal {
  private targetFood: Vector3 | null = null;

  activate(): void {
    const creature = this.owner as CreatureAgent;
    console.log(`[${creature.name}] Goal: Find food (hunger: ${creature.hunger.toFixed(1)})`);

    // Search for food in environment
    // Use creature's perception to find nearby food sources
    this.targetFood = this.findNearestFood(creature);

    if (this.targetFood) {
      console.log(`  Found food at distance: ${creature.position.distanceTo(this.targetFood).toFixed(1)}m`);
    } else {
      console.log(`  No food detected - will wander`);
    }
  }

  /**
   * Find nearest food source
   * Uses entity manager to query nearby entities/food
   */
  private findNearestFood(creature: CreatureAgent): Vector3 | null {
    // Query creature's entity manager for food sources
    if (!creature.manager) return null;

    let nearestFood: Vector3 | null = null;
    let minDistance = Infinity;
    const searchRadius = 100; // meters

    // Check all entities in manager
    for (const entity of creature.manager.entities) {
      // Skip self
      if (entity === creature) continue;

      // Check if entity is food (could be plant, smaller creature, etc.)
      // For now, use simple heuristic: anything not moving fast is potential food
      if ((entity as any) instanceof Vehicle) {
        const distance = creature.position.distanceTo(entity.position);

        // Within search radius and closer than current nearest
        if (distance < searchRadius && distance < minDistance) {
          // Could add more sophisticated checks here:
          // - Is it edible? (check species, diet type)
          // - Is it alive?
          // - Is it already being hunted?
          minDistance = distance;
          nearestFood = entity.position.clone();
        }
      }
    }

    // If no entities found, generate random food position
    // (represents ambient food in environment - plants, etc.)
    if (!nearestFood) {
      // Random position within search radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * searchRadius;
      nearestFood = new Vector3(
        creature.position.x + Math.cos(angle) * distance,
        creature.position.y,
        creature.position.z + Math.sin(angle) * distance
      );
    }

    return nearestFood;
  }

  execute(): void {
    const creature = this.owner as CreatureAgent;

    // Search for food
    // If found, eat
    // If hungry enough, this goal gets high priority

    if (creature.hunger < 0.3) {
      // Satiated
      this.status = Goal.STATUS.COMPLETED;
    }
  }

  terminate(): void {
    console.log(`[${this.owner.name}] Food found, hunger satisfied`);
  }
}

/**
 * Avoid Predator Goal
 */
export class AvoidPredatorGoal extends Goal {
  activate(): void {
    const creature = this.owner as CreatureAgent;
    console.log(`[${creature.name}] Goal: AVOID PREDATOR!`);
  }

  execute(): void {
    const creature = this.owner as CreatureAgent;

    // Check for nearby predators
    // If safe, complete goal

    // For now, always complete after activation
    this.status = Goal.STATUS.COMPLETED;
  }
}

/**
 * Rest Goal
 */
export class RestGoal extends Goal {
  private restTime: number = 0;
  private restDuration: number = 5; // seconds

  activate(): void {
    const creature = this.owner as CreatureAgent;
    console.log(`[${creature.name}] Goal: Rest (energy: ${creature.energy.toFixed(1)})`);
    this.restTime = 0;
  }

  execute(): void {
    const creature = this.owner as CreatureAgent;

    this.restTime += creature.deltaTime;

    // Recover energy while resting
    creature.energy += 10 * creature.deltaTime; // +10 per second
    creature.energy = Math.min(creature.energy, creature.maxEnergy);

    if (this.restTime >= this.restDuration || creature.energy >= creature.maxEnergy * 0.9) {
      this.status = Goal.STATUS.COMPLETED;
    }
  }

  terminate(): void {
    console.log(`[${this.owner.name}] Rested, energy restored`);
  }
}

/**
 * Survival Goal - Composite goal managing food finding, predator avoidance, rest
 */
export class SurvivalGoal extends CompositeGoal {
  activate(): void {
    this.clearSubgoals();

    const creature = this.owner as CreatureAgent;

    // Add subgoals based on state
    if (creature.hunger > creature.hungerThreshold) {
      this.addSubgoal(new FindFoodGoal(creature as any));
    } else if (creature.energy < creature.maxEnergy * 0.5) {
      this.addSubgoal(new RestGoal(creature as any));
    }
    // Could add: AvoidPredatorGoal if threatened
  }

  execute(): void {
    this.status = this.executeSubgoals();
    this.replanIfFailed();
  }
}

/**
 * Reproduction Goal - Find mate and reproduce
 */
export class ReproductionGoal extends Goal {
  activate(): void {
    const creature = this.owner as CreatureAgent;
    console.log(`[${creature.name}] Goal: Reproduce`);
  }

  execute(): void {
    const creature = this.owner as CreatureAgent;

    // Simplified reproduction logic
    // Real implementation would involve:
    // - Finding mate
    // - Courtship behavior
    // - Spawning offspring

    // For now, just mark as completed
    this.status = Goal.STATUS.COMPLETED;
  }

  terminate(): void {
    console.log(`[${this.owner.name}] Reproduction attempt complete`);
  }
}

/**
 * Creature Agent - Individual organism
 */
export class CreatureAgent extends Vehicle {
  // Biology
  species: string;
  mass: number;              // kg
  metabolism: number;        // W (basal metabolic rate)

  // State
  energy: number;            // Current energy
  maxEnergy: number;         // Maximum energy
  hunger: number;            // 0 = satiated, 1 = starving
  age: number;               // Years

  // Simulation
  deltaTime: number = 0;

  constructor(mass: number, speed: number, hungerThreshold: number) {
    super();

    this.species = 'Generic';
    this.mass = mass;
    this.name = `Creature-${Date.now()}`;

    // Calculate metabolism from legal broker (Kleiber's Law)
    this.metabolism = this.calculateMetabolism();

    // Initial state
    this.maxEnergy = this.metabolism * 86400; // One day of energy
    this.energy = this.maxEnergy * 0.7; // Start at 70%
    this.hunger = 0.3;
    this.age = 0;

    // Steering behaviors
    this.maxSpeed = this.calculateMaxSpeed();
    const wanderBehavior = new WanderBehavior();
    this.steering.add(wanderBehavior);

    // Goal-driven brain (initialized by AgentSpawner with evaluators)
    this.brain = new Think(this as any);

    // Initial goal: Wander and find food
    this.brain.addSubgoal(new FindFoodGoal(this as any));

    console.log(`[CreatureAgent] Created ${this.name} (${this.mass.toFixed(1)} kg)`);
  }

  /**
   * Calculate basal metabolic rate (Kleiber's Law from legal broker)
   */
  private calculateMetabolism(): number {
    // Simplified: BMR = 70 × mass^0.75 (Kleiber's Law)
    return 70 * Math.pow(this.mass, 0.75);
  }

  /**
   * Calculate max speed (Schmidt-Nielsen)
   */
  private calculateMaxSpeed(): number {
    // Speed ∝ mass^0.17 (approximate)
    return 5 * Math.pow(this.mass, 0.17); // m/s
  }

  /**
   * Check if tired (should rest)
   */
  tired(): boolean {
    return this.energy < this.maxEnergy * 0.2; // < 20% energy
  }

  /**
   * Check if hungry (should find food)
   */
  hungry(): boolean {
    return this.hunger > 0.7; // > 70% hunger
  }

  /**
   * Start (called after added to EntityManager)
   */
  start(): this {
    // Set up vision and memory
    // TODO: Add Vision and MemorySystem when we implement perception

    // Find nearby creatures (potential pack members)
    const nearbyCreatures = this.findNearbyCreatures();
    if (nearbyCreatures.length > 0) {
      console.log(`[${this.name}] ${nearbyCreatures.length} creatures nearby`);
    }

    return this;
  }

  /**
   * Handle messages from other agents
   */
  handleMessage(telegram: any): boolean {
    switch (telegram.message) {
      case 'JoinPack':
        console.log(`[${this.name}] Received pack invitation`);
        // Could implement pack joining logic
        return true;

      case 'ThreatWarning':
        console.log(`[${this.name}] Threat detected by pack member!`);
        // Could trigger flee behavior
        return true;

      default:
        return false;
    }
  }

  /**
   * Find nearby creatures
   */
  private findNearbyCreatures(): CreatureAgent[] {
    if (!this.manager) return [];

    const nearby: CreatureAgent[] = [];
    const searchRadius = 50;

    for (const entity of this.manager.entities) {
      if (entity === this) continue;
      if (!(entity instanceof CreatureAgent)) continue;

      const distance = this.position.distanceTo(entity.position);
      if (distance < searchRadius) {
        nearby.push(entity);
      }
    }

    return nearby;
  }

  /**
   * Update (called by EntityManager every frame)
   */
  update(delta: number): this {
    this.deltaTime = delta;

    super.update(delta);

    // Consume energy (metabolism)
    const energyCost = this.metabolism * delta;
    this.energy -= energyCost;
    this.hunger = 1 - (this.energy / this.maxEnergy);

    // Age
    this.age += delta / (365.25 * 86400); // Convert to years

    // Execute brain (evaluators will select best goal)
    if (this.brain) {
      this.brain.execute();
      this.brain.arbitrate();
    }

    // Die if energy depleted
    if (this.energy <= 0) {
      console.log(`[${this.name}] 💀 Died of starvation at age ${this.age.toFixed(1)} years`);
      this.active = false;
    }

    return this; // Yuka pattern
  }

  /**
   * Check if currently has a goal of type
   */
  private hasGoal(goalType: any): boolean {
    const subgoals = (this.brain as any).subgoals || [];
    return subgoals.some((g: any) => g instanceof goalType);
  }

  /**
   * Extract state for Zustand persistence
   */
  getState(): any {
    return {
      species: this.species,
      mass: this.mass,
      energy: this.energy,
      hunger: this.hunger,
      age: this.age,
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      },
    };
  }

  /**
   * Restore from saved state
   */
  static fromState(state: any): CreatureAgent {
    const agent = new CreatureAgent(
      state.mass || 70,
      state.speed || 1.5,
      state.hungerThreshold || 0.3
    );

    // Restore position
    agent.position.set(state.position.x, state.position.y, state.position.z);

    // Restore other state
    agent.species = state.species || 'Unknown';

    agent.energy = state.energy;
    agent.hunger = state.hunger;
    agent.age = state.age;

    return agent;
  }
}

/**
 * USAGE:
 * 
 * // Spawn creature
 * const creature = new CreatureAgent({
 *   species: 'Protosaurus rex',
 *   mass: 50, // kg
 *   position: new Vector3(10, 0, 5),
 * });
 * 
 * entityManager.add(creature);
 * 
 * // Game loop
 * entityManager.update(deltaTime);
 * 
 * // Creature will:
 * 1. Consume energy (metabolism)
 * 2. Get hungry → Find food
 * 3. Get tired → Rest
 * 4. Wander when satisfied
 * 5. Die if starved
 * 
 * // Save state (when zooming out)
 * const state = creature.getState();
 * zustand.saveCreature(state);
 * 
 * // Load state (when zooming back in)
 * const restored = CreatureAgent.fromState(savedState);
 */
