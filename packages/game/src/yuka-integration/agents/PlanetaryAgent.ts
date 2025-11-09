/**
 * PLANETARY AGENT
 * 
 * Manages planet evolution (climate, geology, atmosphere).
 * Makes decisions about planetary processes.
 */

import { Vehicle, Think, Goal, Vector3 } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';

/**
 * Maintain Atmosphere Goal
 */
export class MaintainAtmosphereGoal extends Goal {
  activate(): void {
    const planet = this.owner as PlanetaryAgent;
    console.log(`[${planet.name}] Goal: Maintain atmosphere`);
  }
  
  execute(): void {
    const planet = this.owner as PlanetaryAgent;
    
    // Check if planet can hold atmosphere (escape velocity)
    const escapeVelocity = planet.calculateEscapeVelocity();
    const canRetainAtmosphere = escapeVelocity > 5000; // m/s threshold
    
    if (!canRetainAtmosphere) {
      console.log(`[${planet.name}] Losing atmosphere (v_esc too low)`);
      planet.atmosphereMass *= 0.99; // Gradual loss
    }
    
    this.status = Goal.STATUS.ACTIVE; // Ongoing goal
  }
}

/**
 * Develop Life Goal
 */
export class DevelopLifeGoal extends Goal {
  activate(): void {
    const planet = this.owner as PlanetaryAgent;
    console.log(`[${planet.name}] Goal: Develop life`);
  }
  
  execute(): void {
    const planet = this.owner as PlanetaryAgent;
    
    // Check prerequisites
    const hasWater = planet.surfaceTemp > 273 && planet.surfaceTemp < 373;
    const hasAtmosphere = planet.atmosphereMass > 0;
    const hasHeavyElements = planet.metallicity > 0;
    
    if (hasWater && hasAtmosphere && hasHeavyElements && !planet.hasLife) {
      // Abiogenesis!
      console.log(`[${planet.name}] 🌱 LIFE EMERGES!`);
      planet.hasLife = true;
      this.status = Goal.STATUS.COMPLETED;
    } else {
      this.status = Goal.STATUS.ACTIVE; // Keep trying
    }
  }
}

/**
 * Planetary Agent
 */
export class PlanetaryAgent extends Vehicle {
  // Physical properties
  mass: number;              // kg
  radius: number;            // m
  orbitalRadius: number;     // AU from star
  
  // Composition
  metallicity: number;       // Fraction of heavy elements
  
  // Atmosphere
  atmosphereMass: number;    // kg
  surfaceTemp: number;       // K
  
  // Life
  hasLife: boolean = false;
  biosphereComplexity: number = 0;
  
  // Simulation
  deltaTime: number = 0;
  age: number = 0;           // Years
  
  constructor(params: {
    mass: number;
    radius: number;
    orbitalRadius: number;
    position: Vector3;
  }) {
    super();
    
    this.mass = params.mass;
    this.radius = params.radius;
    this.orbitalRadius = params.orbitalRadius;
    this.position.copy(params.position);
    this.name = `Planet-${params.orbitalRadius.toFixed(2)}AU`;
    
    // Calculate initial properties
    this.metallicity = 0.02; // Solar metallicity
    this.atmosphereMass = this.mass * 1e-6; // Rough estimate
    this.surfaceTemp = this.calculateSurfaceTemp();
    
    // Goal-driven brain
    this.brain = new Think(this);
    
    // Goals
    this.brain.addSubgoal(new MaintainAtmosphereGoal(this));
    this.brain.addSubgoal(new DevelopLifeGoal(this));
    
    console.log(`[PlanetaryAgent] Created ${this.name} (${(this.mass / 5.972e24).toFixed(2)} M⊕)`);
  }
  
  /**
   * Calculate surface temperature (simplified Stefan-Boltzmann)
   */
  private calculateSurfaceTemp(): number {
    // T ∝ 1/sqrt(orbital radius)
    // Earth at 1 AU = 288K
    return 288 * Math.pow(this.orbitalRadius, -0.5);
  }
  
  /**
   * Calculate escape velocity
   */
  calculateEscapeVelocity(): number {
    const G = 6.674e-11;
    return Math.sqrt(2 * G * this.mass / this.radius);
  }
  
  /**
   * Update
   */
  update(delta: number): void {
    this.deltaTime = delta;
    this.age += delta / (365.25 * 86400);
    
    // Execute goals
    this.brain.execute();
    
    super.update(delta);
  }
  
  /**
   * Get state for persistence
   */
  getState(): any {
    return {
      mass: this.mass,
      radius: this.radius,
      orbitalRadius: this.orbitalRadius,
      metallicity: this.metallicity,
      atmosphereMass: this.atmosphereMass,
      surfaceTemp: this.surfaceTemp,
      hasLife: this.hasLife,
      biosphereComplexity: this.biosphereComplexity,
      age: this.age,
    };
  }
}

/**
 * USAGE:
 * 
 * const planet = new PlanetaryAgent({
 *   mass: 5.972e24, // Earth mass
 *   radius: 6.371e6, // Earth radius  
 *   orbitalRadius: 1.0, // 1 AU
 *   position: new Vector3(1, 0, 0),
 * });
 * 
 * entityManager.add(planet);
 * 
 * // Planet will:
 * 1. Try to maintain atmosphere
 * 2. Try to develop life (if conditions met)
 * 3. Evolve surface temperature
 * 4. Age over billions of years
 */
