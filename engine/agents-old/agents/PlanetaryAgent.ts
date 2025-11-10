/**
 * PLANETARY AGENT
 * 
 * Manages planet evolution (climate, geology, atmosphere).
 * Makes decisions about planetary processes.
 */

import { CompositeGoal, Goal, Vehicle } from 'yuka';

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
 * Climate Goal - Composite goal for atmospheric/climate evolution
 */
export class ClimateGoal extends CompositeGoal {
  activate(): void {
    this.clearSubgoals();
    const planet = this.owner as PlanetaryAgent;

    // Add climate evolution subgoals
    this.addSubgoal(new MaintainAtmosphereGoal(planet as any));
  }

  execute(): void {
    this.status = this.executeSubgoals();
    this.replanIfFailed();
  }
}

/**
 * Life Goal - Composite goal for developing/maintaining life
 */
export class LifeGoal extends CompositeGoal {
  activate(): void {
    this.clearSubgoals();
    const planet = this.owner as PlanetaryAgent;

    // Add life development subgoals
    this.addSubgoal(new DevelopLifeGoal(planet as any));
  }

  execute(): void {
    this.status = this.executeSubgoals();
    this.replanIfFailed();
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

  constructor(mass: number, radius: number, orbitalRadius: number) {
    super();

    this.mass = mass;
    this.radius = radius;
    this.orbitalRadius = orbitalRadius;
    this.name = `Planet-${orbitalRadius.toFixed(2)}AU`;

    // Calculate initial properties
    this.metallicity = 0.02; // Solar metallicity (will be updated by enrichment)
    this.atmosphereMass = this.mass * 1e-6; // Rough estimate
    this.surfaceTemp = this.calculateSurfaceTemp();
    this.temperature = this.surfaceTemp;

    // Brain will be initialized by AgentSpawner with evaluators

    console.log(`[PlanetaryAgent] Created ${this.name} (${(this.mass / 5.972e24).toFixed(2)} M⊕)`);
  }

  /**
   * Start (called after added to EntityManager)
   */
  start(): this {
    // Find parent star
    const nearbyStars = this.findNearbyStars();
    if (nearbyStars.length > 0) {
      console.log(`[${this.name}] Orbiting star at ${nearbyStars[0].position.distanceTo(this.position).toFixed(1)} units`);
    }

    return this;
  }

  /**
   * Handle messages (supernova enrichment, etc.)
   */
  handleMessage(telegram: any): boolean {
    switch (telegram.message) {
      case 'ElementalEnrichment':
        // Receive heavy elements from supernova!
        const { elements, intensity } = telegram.data;
        this.receiveEnrichment(elements, intensity);
        return true;

      default:
        return false;
    }
  }

  /**
   * Find nearby stars
   */
  private findNearbyStars(): any[] {
    if (!this.manager) return [];

    const stars: any[] = [];
    for (const entity of this.manager.entities) {
      // Check if entity is a star (has luminosity property)
      if ((entity as any).luminosity !== undefined) {
        stars.push(entity);
      }
    }
    return stars;
  }

  /**
   * Receive elemental enrichment from supernova
   */
  private receiveEnrichment(elements: Record<string, number>, intensity: number): void {
    console.log(`[${this.name}] 💫 Received enrichment (intensity: ${intensity.toExponential(2)})`);

    // Update metallicity based on received elements
    const heavyElementMass = Object.values(elements).reduce((sum, mass) => sum + mass, 0);
    const enrichmentFraction = (heavyElementMass * intensity) / this.mass;

    this.metallicity += enrichmentFraction;

    console.log(`  Metallicity: ${(this.metallicity * 100).toFixed(2)}% (was ${((this.metallicity - enrichmentFraction) * 100).toFixed(2)}%)`);
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
  update(delta: number): this {
    super.update(delta);

    this.deltaTime = delta;
    this.age += delta / (365.25 * 86400);

    // Execute current goal + arbitrate
    if (this.brain) {
      this.brain.execute();
      this.brain.arbitrate();
    }

    return this; // Yuka pattern
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
