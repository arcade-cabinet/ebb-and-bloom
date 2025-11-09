/**
 * STELLAR AGENT
 * 
 * Manages star lifecycle through Yuka goal-driven behavior.
 * Asks Legal Broker for guidance at each step.
 */

import { Goal, Vehicle } from 'yuka';

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

  constructor(mass: number, luminosity?: number, temperature?: number) {
    super();

    this.mass = mass;
    this.name = `Star-${mass.toFixed(2)}M☉`;

    // Calculate initial properties (from legal broker or use provided)
    this.luminosity = luminosity || this.calculateLuminosity();
    this.temperature = temperature || this.calculateTemperature();
    this.fuelRemaining = 1.0;
    this.age = 0;
    this.fusionRate = this.calculateFusionRate();

    // Brain will be initialized by AgentSpawner with evaluators
    // (not here - follows Yuka pattern)

    console.log(`[StellarAgent] Created ${this.name}`);
  }

  /**
   * Start (called after added to EntityManager)
   * Yuka lifecycle hook
   */
  start(): this {
    // Import GravityBehavior dynamically to avoid circular deps
    import('../behaviors/GravityBehavior').then(({ GravityBehavior }) => {
      // Add gravity steering (stars cluster naturally!)
      const gravityBehavior = new GravityBehavior(1000); // 1000 unit range
      this.steering.add(gravityBehavior);

      console.log(`[${this.name}] Gravity steering enabled - will cluster naturally`);
    });

    return this;
  }

  /**
   * Handle messages from other agents
   */
  handleMessage(telegram: any): boolean {
    switch (telegram.message) {
      case 'RequestElementalComposition':
        // Send our composition to requesting agent
        this.sendMessage(telegram.sender, 'ElementalComposition', {
          H: 0.74,
          He: 0.24,
          metals: 0.02,
        });
        return true;

      default:
        return false;
    }
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
  update(delta: number): this {
    super.update(delta);

    this.deltaTime = delta;

    // Execute current goal (runs active goals)
    if (this.brain) {
      this.brain.execute();

      // Arbitrate between goals (evaluators pick best goal)
      this.brain.arbitrate();
    }

    return this; // Yuka pattern: return this for chaining
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
   * Supernova nucleosynthesis products
   */
  private emitHeavyElements(): void {
    // Calculate yields based on stellar mass
    const elements = this.calculateNucleosynthesisYields();

    // Notify all nearby entities (planets, other stars) about enrichment
    if (this.manager) {
      const enrichmentRadius = 1000; // Game units

      for (const entity of this.manager.entities) {
        if (entity === this) continue;

        const distance = this.position.distanceTo(entity.position);
        if (distance < enrichmentRadius) {
          // Send enrichment message
          this.sendMessage(entity, 'ElementalEnrichment', {
            elements,
            sourcePosition: this.position.clone(),
            distance,
            intensity: 1.0 / (distance * distance), // Inverse square law
          });
        }
      }
    }

    console.log(`[${this.name}] Dispersed heavy elements: ${Object.keys(elements).join(', ')}`);
  }

  /**
   * Calculate heavy element yields from supernova nucleosynthesis
   */
  private calculateNucleosynthesisYields(): Record<string, number> {
    // Yields depend on initial mass
    // Massive stars (>8 M☉) undergo core-collapse supernova
    const baseMass = this.mass;

    // Simplified nucleosynthesis yields (kg of each element)
    // Real process is very complex - this is approximation
    return {
      // Alpha-process elements (He burning)
      O: baseMass * 1e30 * 0.10,   // Oxygen (most abundant)
      C: baseMass * 1e30 * 0.05,   // Carbon
      Ne: baseMass * 1e30 * 0.02,  // Neon
      Mg: baseMass * 1e30 * 0.01,  // Magnesium
      Si: baseMass * 1e30 * 0.01,  // Silicon

      // Iron-peak elements (explosive nucleosynthesis)
      Fe: baseMass * 1e30 * 0.008, // Iron
      Ni: baseMass * 1e30 * 0.002, // Nickel
      Co: baseMass * 1e30 * 0.001, // Cobalt

      // Heavy elements (r-process, s-process)
      Au: baseMass * 1e30 * 1e-8,  // Gold
      U: baseMass * 1e30 * 1e-9,   // Uranium
    };
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
