/**
 * CREATURE AGENT
 * 
 * Individual creature with Yuka pathfinding, steering, goals.
 * Asks Legal Broker for biological constraints.
 */

import { Vehicle, Think, Goal, Vector3, ArriveBehavior, WanderBehavior } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';
import { UniverseState } from '../../laws/core/UniversalLawCoordinator';

/**
 * Find Food Goal
 */
export class FindFoodGoal extends Goal {
  private targetFood: Vector3 | null = null;
  
  activate(): void {
    const creature = this.owner as CreatureAgent;
    console.log(`[${creature.name}] Goal: Find food (hunger: ${creature.hunger.toFixed(1)})`);
    
    // TODO: Query environment for nearby food
    // For now, wander
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
  
  constructor(params: {
    species: string;
    mass: number;
    position: Vector3;
  }) {
    super();
    
    this.species = params.species;
    this.mass = params.mass;
    this.position.copy(params.position);
    this.name = `${params.species}-${Date.now()}`;
    
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
    
    // Goal-driven brain
    this.brain = new Think(this);
    
    // Initial goal: Wander and find food
    this.brain.addSubgoal(new FindFoodGoal(this));
    
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
   * Update (called by EntityManager every frame)
   */
  update(delta: number): void {
    this.deltaTime = delta;
    
    // Consume energy (metabolism)
    const energyCost = this.metabolism * delta;
    this.energy -= energyCost;
    this.hunger = 1 - (this.energy / this.maxEnergy);
    
    // Age
    this.age += delta / (365.25 * 86400); // Convert to years
    
    // Execute brain (goal arbitration)
    this.brain.execute();
    
    // Add goals based on state
    if (this.tired() && !this.hasGoal(RestGoal)) {
      this.brain.addSubgoal(new RestGoal(this));
    }
    
    if (this.hungry() && !this.hasGoal(FindFoodGoal)) {
      this.brain.addSubgoal(new FindFoodGoal(this));
    }
    
    // Die if energy depleted
    if (this.energy <= 0) {
      console.log(`[${this.name}] 💀 Died of starvation at age ${this.age.toFixed(1)} years`);
      this.active = false;
    }
    
    super.update(delta);
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
    const agent = new CreatureAgent({
      species: state.species,
      mass: state.mass,
      position: new Vector3(state.position.x, state.position.y, state.position.z),
    });
    
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
