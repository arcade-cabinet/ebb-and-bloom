/**
 * STELLAR AGENT
 * 
 * Manages star lifecycle through Yuka goal-driven behavior.
 * Asks Legal Broker for guidance at each step.
 */

import { Vehicle, Think, Goal } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';
import { UniverseState } from '../../laws/core/UniversalLawCoordinator';

/**
 * Fusion Goal - Star wants to fuse hydrogen
 */
export class FusionGoal extends Goal {
  activate(): void {
    const star = this.owner as StellarAgent;
    console.log(`[${star.name}] Goal: Fuse hydrogen`);
  }
  
  execute(): void {
    const star = this.owner as StellarAgent;
    
    // Fuse hydrogen (consumes fuel, produces energy)
    star.fuelRemaining -= star.fusionRate * star.deltaTime;
    star.age += star.deltaTime;
    
    if (star.fuelRemaining <= 0) {
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  
  terminate(): void {
    console.log(`[${this.owner.name}] Fusion complete - fuel exhausted`);
  }
}

/**
 * Supernova Goal - Massive star explodes
 */
export class SupernovaGoal extends Goal {
  private triggered: boolean = false;
  
  activate(): void {
    const star = this.owner as StellarAgent;
    console.log(`[${star.name}] Goal: GO SUPERNOVA!`);
  }
  
  execute(): void {
    if (!this.triggered) {
      const star = this.owner as StellarAgent;
      
      // Trigger supernova event
      star.explode();
      
      this.triggered = true;
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  
  terminate(): void {
    console.log(`[${this.owner.name}] Supernova complete - heavy elements dispersed`);
  }
}

/**
 * Stellar Agent - Manages star lifecycle
 */
export class StellarAgent extends Vehicle {
  // Stellar properties
  mass: number;              // Solar masses
  luminosity: number;        // Solar luminosities
  temperature: number;       // Kelvin
  fuelRemaining: number;     // Fraction of initial fuel
  age: number;               // Years
  
  // Simulation
  fusionRate: number;        // Fuel consumption rate
  deltaTime: number = 0;     // Last frame delta
  
  // State
  hasExploded: boolean = false;
  
  constructor(mass: number, position: { x: number; y: number; z: number }) {
    super();
    
    this.mass = mass;
    this.position.set(position.x, position.y, position.z);
    this.name = `Star-${mass.toFixed(2)}M☉`;
    
    // Calculate initial properties (from legal broker)
    this.luminosity = this.calculateLuminosity();
    this.temperature = this.calculateTemperature();
    this.fuelRemaining = 1.0;
    this.age = 0;
    this.fusionRate = this.calculateFusionRate();
    
    // Goal-driven brain
    this.brain = new Think(this);
    
    // Initial goal: Fuse hydrogen
    this.brain.addSubgoal(new FusionGoal(this));
    
    console.log(`[StellarAgent] Created ${this.name} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`);
  }
  
  /**
   * Calculate luminosity from mass (ask legal broker)
   */
  private calculateLuminosity(): number {
    // Simplified: L ∝ M^3.5 (main sequence)
    return Math.pow(this.mass, 3.5);
  }
  
  /**
   * Calculate temperature from mass
   */
  private calculateTemperature(): number {
    // Simplified: T ∝ M^0.5
    return 5778 * Math.pow(this.mass, 0.5); // Sun = 5778K
  }
  
  /**
   * Calculate fusion rate
   */
  private calculateFusionRate(): number {
    // More massive = faster fusion
    // Lifetime ∝ M / L ∝ M / M^3.5 ∝ M^(-2.5)
    const lifetimeYears = 1e10 * Math.pow(this.mass, -2.5); // Sun = 10 Gyr
    return 1.0 / lifetimeYears; // Fuel consumed per year
  }
  
  /**
   * Update (called by EntityManager)
   */
  update(delta: number): void {
    this.deltaTime = delta;
    
    // Execute current goal
    this.brain.execute();
    
    // Check if should transition to supernova
    if (this.fuelRemaining <= 0 && this.mass > 8 && !this.hasExploded) {
      console.log(`[${this.name}] Fuel exhausted, mass sufficient → Adding supernova goal`);
      this.brain.clearSubgoals();
      this.brain.addSubgoal(new SupernovaGoal(this));
    }
    
    super.update(delta);
  }
  
  /**
   * Explode (supernova event)
   */
  explode(): void {
    console.log(`[${this.name}] 💥 SUPERNOVA! 💥`);
    this.hasExploded = true;
    
    // Emit heavy elements (would notify other systems)
    this.emitHeavyElements();
    
    // Mark for removal (or transition to neutron star/black hole)
    this.active = false;
  }
  
  /**
   * Emit heavy elements to environment
   */
  private emitHeavyElements(): void {
    // TODO: Notify environment manager
    // This is where O, C, N, Fe get distributed
    console.log(`[${this.name}] Dispersing: O, C, N, Fe, Si, Mg...`);
  }
}

/**
 * USAGE:
 * 
 * const star = new StellarAgent(1.0, { x: 0, y: 0, z: 0 });
 * entityManager.add(star);
 * 
 * // Game loop
 * entityManager.update(deltaTime);
 * 
 * // Star will:
 * 1. Fuse hydrogen (FusionGoal)
 * 2. Consume fuel over billions of years
 * 3. When fuel exhausted + massive → SupernovaGoal
 * 4. Explode, emit heavy elements
 * 5. Despawn
 */
