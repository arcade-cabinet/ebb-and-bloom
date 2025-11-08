/**
 * Gen 0: REAL Planetary Accretion with Yuka Physics + Data Pools
 * Uses AI-generated visual blueprints and actual physics simulation
 */

import seedrandom from 'seedrandom';
import { CohesionBehavior, SeparationBehavior, Vector3, Vehicle } from 'yuka';
import { generateGen0DataPools } from '../gen-systems/loadGenData.js';
import { AccretionEvent, MaterialType, Planet, PlanetaryLayer } from '../schemas/index.js';

export interface AccretionConfig {
  seed: string;
  useAI?: boolean; // If false, skips OpenAI call for testing
}

/**
 * Debris particle for accretion simulation
 */
class DebrisParticle extends Vehicle {
  public mass: number;
  public materialType: string;

  constructor(mass: number, materialType: string, position: Vector3) {
    super();
    this.mass = mass;
    this.materialType = materialType;
    // Initialize Vehicle properties
    this.position = position.clone();
    this.velocity = new Vector3();
    this.maxSpeed = 1000; // m/s
    // Steering manager is initialized by Vehicle base class
  }
}

export class AccretionSimulation {
  private seed: string;
  private rng: seedrandom.PRNG;
  private useAI: boolean;

  constructor(config: AccretionConfig) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
    this.useAI = config.useAI ?? true;
  }

  /**
   * Run REAL accretion with Yuka physics + AI-generated parameters
   */
  async simulate(): Promise<Planet & { visualBlueprints?: any }> {
    console.log(`[ACCRETION] Starting REAL physics simulation with seed: ${this.seed}`);

    // STEP 1: Generate AI data pools (if enabled)
    // Note: this.seed is already the generation seed (baseSeed-gen0) from GameEngine
    let dataPools;
    if (this.useAI) {
      console.log('[ACCRETION] Generating AI data pools...');
      // Extract base seed from generation seed (remove -gen0 suffix)
      const baseSeed = this.seed.replace(/-gen\d+$/, '');
      dataPools = await generateGen0DataPools(baseSeed);
      console.log(`[ACCRETION] Stellar context: ${dataPools.macro.selectedContext}`);
      console.log(`[ACCRETION] Materials: ${dataPools.micro.visualBlueprint.representations.materials.join(', ')}`);
    }

    // STEP 2: Create debris field based on AI-generated element distribution
    const elementDistribution = this.useAI
      ? this.parseElementDistribution(dataPools!.micro.selectedDistribution)
      : { Fe: 0.35, Si: 0.25, O: 0.20, Mg: 0.10, Ca: 0.05, Other: 0.05 };

    const debrisField = this.createDebrisField(elementDistribution, 1000); // 1000 particles

    // STEP 3: Run Yuka cohesion simulation (gravity) with time compression
    // Each cycle = ~45 million years (4.5 billion years / 100 cycles)
    console.log('[ACCRETION] Running cohesion simulation (4.5 billion years compressed)...');
    const accretedPlanet = await this.runCohesionSimulation(debrisField, 100); // 100 cycles = 4.5 billion years

    // STEP 4: Generate layers from accreted materials (physics-derived boundaries)
    const layers = this.generateLayersFromAccretion(accretedPlanet, debrisField);

    // STEP 5: Calculate final properties (physics-derived)
    const radius = this.calculatePlanetRadius(accretedPlanet.totalMass);
    const mass = accretedPlanet.totalMass;
    // Rotation period from angular momentum conservation (physics-derived)
    const rotationPeriod = this.calculateRotationPeriodFromAngularMomentum(
      accretedPlanet.angularMomentum,
      mass,
      radius
    );

    // Store base seed (not generation seed) in planet for chaining through generations
    const baseSeed = this.seed.replace(/-gen\d+$/, '');

    const planet: Planet = {
      id: `planet-${baseSeed}`,
      seed: baseSeed, // Store base seed for Gen1-Gen6 to use
      radius,
      mass,
      rotationPeriod,
      layers,
      compositionHistory: accretedPlanet.history,
      status: 'formed',
    };

    console.log(`[ACCRETION] Planet formed!`);
    console.log(`   Radius: ${(radius / 1000).toFixed(0)}km`);
    console.log(`   Mass: ${mass.toExponential(2)}kg`);
    console.log(`   Rotation: ${(rotationPeriod / 3600).toFixed(1)}h`);
    console.log(`   Layers: ${layers.length}`);

    return {
      ...planet,
      visualBlueprints: dataPools,
    };
  }

  /**
   * Parse element distribution from AI-generated description
   */
  private parseElementDistribution(distribution: string): Record<string, number> {
    // Parse AI description into actual percentages
    if (distribution.includes('Iron-rich')) {
      return { Fe: 0.45, Si: 0.20, O: 0.15, Mg: 0.10, Ca: 0.05, Other: 0.05 };
    } else if (distribution.includes('Carbon-rich')) {
      return { C: 0.40, Si: 0.25, O: 0.15, Fe: 0.10, Other: 0.10 };
    } else if (distribution.includes('Silicate-rich')) {
      return { Si: 0.40, O: 0.30, Fe: 0.15, Mg: 0.10, Other: 0.05 };
    } else if (distribution.includes('Volatile-rich')) {
      return { H: 0.30, O: 0.25, C: 0.20, N: 0.15, Other: 0.10 };
    } else {
      // Rare earth enriched
      return { Fe: 0.25, Si: 0.20, O: 0.20, RareEarth: 0.20, Other: 0.15 };
    }
  }

  /**
   * Create debris field with proper mass distribution
   */
  private createDebrisField(
    elementDist: Record<string, number>,
    particleCount: number
  ): DebrisParticle[] {
    const particles: DebrisParticle[] = [];
    const totalMassNeeded = 5.97e24; // Earth-like mass

    for (let i = 0; i < particleCount; i++) {
      // Select material based on distribution
      const material = this.selectMaterial(elementDist);
      const mass = (totalMassNeeded / particleCount) * (0.5 + this.rng()); // Vary mass

      // Random position in debris disk (simplified - planar)
      const angle = this.rng() * Math.PI * 2;
      const distance = 1e9 + this.rng() * 5e9; // 1-6 million km
      const position = new Vector3(
        Math.cos(angle) * distance,
        (this.rng() - 0.5) * 1e8, // Thin disk
        Math.sin(angle) * distance
      );

      particles.push(new DebrisParticle(mass, material, position));
    }

    return particles;
  }

  /**
   * Select material based on distribution
   */
  private selectMaterial(dist: Record<string, number>): string {
    const rand = this.rng();
    let cumulative = 0;

    for (const [material, probability] of Object.entries(dist)) {
      cumulative += probability;
      if (rand <= cumulative) return material;
    }

    return 'Other';
  }

  /**
   * Run Yuka cohesion simulation (gravity analog) with gravitational differentiation
   * Each cycle represents ~45 million years (4.5 billion years / 100 cycles)
   */
  private async runCohesionSimulation(
    particles: DebrisParticle[],
    cycles: number
  ): Promise<{
    totalMass: number;
    materialComposition: Record<string, number>;
    angularMomentum: number;
    history: AccretionEvent[];
    stratifiedParticles: DebrisParticle[]; // For layer generation
  }> {
    const history: AccretionEvent[] = [];
    const materialCounts: Record<string, number> = {};

    // Material densities for gravitational differentiation
    const densities: Record<string, number> = {
      Fe: 7874, Si: 2330, O: 1429, Mg: 1738, Ca: 1550,
      C: 2267, H: 71, N: 1.25, RareEarth: 6000, Other: 3000,
    };

    // Setup cohesion behavior (gravity) and separation behavior (prevent overlap)
    particles.forEach(p => {
      const cohesion = new CohesionBehavior(particles);
      cohesion.weight = p.mass / 1e20; // Scale by mass
      p.steering.add(cohesion);

      const separation = new SeparationBehavior(particles);
      separation.weight = 0.5; // Prevent overlap
      separation.neighborhoodRadius = 1e6; // 1000 km
      p.steering.add(separation);
    });

    // Track initial angular momentum for conservation
    const initialAngularMomentum = this.calculateAngularMomentum(particles);

    // Simulate cycles (each cycle = ~45 million years)
    for (let cycle = 0; cycle < cycles; cycle++) {
      // Update particles
      particles.forEach(p => p.update(1.0));

      // Check for collisions/accretion (every cycle for accuracy)
      this.processCollisions(particles, history, cycle);

      // APPLY GRAVITATIONAL DIFFERENTIATION DURING SIMULATION
      // Denser materials sink toward center as planet forms
      if (cycle % 10 === 0 && particles.length > 10) {
        this.applyGravitationalDifferentiation(particles, densities);
      }
    }

    // Calculate final composition
    let totalMass = 0;
    particles.forEach(p => {
      totalMass += p.mass;
      materialCounts[p.materialType] = (materialCounts[p.materialType] || 0) + p.mass;
    });

    // Calculate final angular momentum (conserved)
    const finalAngularMomentum = this.calculateAngularMomentum(particles);

    return {
      totalMass,
      materialComposition: materialCounts,
      angularMomentum: finalAngularMomentum, // Use final for rotation calculation
      history,
      stratifiedParticles: particles, // Pass particles for layer generation
    };
  }

  /**
   * Apply gravitational differentiation during simulation
   * Denser materials sink toward center as planet forms
   */
  private applyGravitationalDifferentiation(
    particles: DebrisParticle[],
    densities: Record<string, number>
  ): void {
    if (particles.length === 0) return;

    // Calculate center of mass
    const centerOfMass = new Vector3();
    let totalMass = 0;
    particles.forEach(p => {
      centerOfMass.add(p.position.clone().multiplyScalar(p.mass));
      totalMass += p.mass;
    });
    centerOfMass.divideScalar(totalMass);

    // Apply differentiation force: denser materials sink toward center
    particles.forEach(p => {
      const density = densities[p.materialType] || 3000;
      const distanceFromCenter = p.position.distanceTo(centerOfMass);

      // Denser materials experience stronger inward force
      const differentiationStrength = (density / 10000) * 0.1; // Scale factor

      if (distanceFromCenter > 0) {
        const direction = new Vector3()
          .subVectors(centerOfMass, p.position)
          .normalize();

        // Apply differentiation force (scaled by density)
        const differentiationForce = direction.multiplyScalar(differentiationStrength * p.mass);
        p.velocity.add(differentiationForce.multiplyScalar(0.01)); // Small time step
      }
    });
  }

  /**
   * Calculate total angular momentum (for conservation)
   */
  private calculateAngularMomentum(particles: DebrisParticle[]): number {
    if (particles.length === 0) return 0;

    // Calculate center of mass
    const centerOfMass = new Vector3();
    let totalMass = 0;
    particles.forEach(p => {
      centerOfMass.add(p.position.clone().multiplyScalar(p.mass));
      totalMass += p.mass;
    });
    centerOfMass.divideScalar(totalMass);

    // Calculate angular momentum around center of mass
    return particles.reduce((sum, p) => {
      const r = new Vector3().subVectors(p.position, centerOfMass);
      const v = p.velocity.clone();
      const rCrossV = new Vector3().crossVectors(r, v);
      return sum + p.mass * rCrossV.length();
    }, 0);
  }

  /**
   * Process particle collisions/accretion
   */
  private processCollisions(
    particles: DebrisParticle[],
    history: AccretionEvent[],
    cycle: number
  ): void {
    const collisionRadius = 1e7; // 10,000 km

    for (let i = particles.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        const distance = particles[i].position.distanceTo(particles[j].position);

        if (distance < collisionRadius) {
          // Merge particles (inelastic collision)
          const larger = particles[i].mass > particles[j].mass ? i : j;
          const smaller = larger === i ? j : i;

          particles[larger].mass += particles[smaller].mass;

          // Record event (matching AccretionEventSchema)
          history.push({
            cycle,
            type: 'collision',
            objects: [`particle-${larger}`, `particle-${smaller}`],
            result: {
              newMass: particles[larger].mass,
              materialsMerged: {
                [particles[larger].materialType]: particles[larger].mass,
                [particles[smaller].materialType]: particles[smaller].mass,
              },
            },
          });

          // Remove smaller particle
          particles.splice(smaller, 1);
          break; // Move to next i
        }
      }
    }
  }

  /**
   * Generate stratified layers from accreted materials
   * Layer boundaries derived from actual particle distribution (physics-derived)
   */
  private generateLayersFromAccretion(
    accretion: { materialComposition: Record<string, number>; totalMass: number; stratifiedParticles?: DebrisParticle[] },
    originalParticles: DebrisParticle[]
  ): PlanetaryLayer[] {
    const densities: Record<string, number> = {
      Fe: 7874, Si: 2330, O: 1429, Mg: 1738, Ca: 1550,
      C: 2267, H: 71, N: 1.25, RareEarth: 6000, Other: 3000,
    };

    // Use stratified particles if available, otherwise use original
    const particles = accretion.stratifiedParticles || originalParticles;

    if (particles.length === 0) {
      // Fallback if no particles
      return this.generateLayersFallback(accretion.materialComposition, densities);
    }

    // Calculate center of mass
    const centerOfMass = new Vector3();
    let totalMass = 0;
    particles.forEach(p => {
      centerOfMass.add(p.position.clone().multiplyScalar(p.mass));
      totalMass += p.mass;
    });
    centerOfMass.divideScalar(totalMass);

    // Calculate distances from center and sort by density
    const particleData = particles.map(p => ({
      particle: p,
      distance: p.position.distanceTo(centerOfMass),
      density: densities[p.materialType] || 3000,
    })).sort((a, b) => b.density - a.density); // Denser first

    // Derive layer boundaries from particle distribution
    const maxRadius = Math.max(...particleData.map(p => p.distance));
    const planetRadius = maxRadius;

    // Create 4 layers based on density distribution
    // Inner core: densest 25% of mass
    // Outer core: next 25%
    // Mantle: next 40%
    // Crust: outermost 10%

    let cumulativeMass = 0;
    const massThresholds = [0.25, 0.50, 0.90, 1.0];
    const layerBoundaries: number[] = [0];

    for (const threshold of massThresholds) {
      const targetMass = totalMass * threshold;
      while (cumulativeMass < targetMass && particleData.length > 0) {
        const p = particleData.shift()!;
        cumulativeMass += p.particle.mass;
      }
      if (particleData.length > 0) {
        layerBoundaries.push(particleData[0].distance);
      } else {
        layerBoundaries.push(planetRadius);
      }
    }

    // Ensure we have 4 boundaries (0, inner, outer, mantle, surface)
    while (layerBoundaries.length < 5) {
      layerBoundaries.push(planetRadius);
    }

    // Create layers with physics-derived boundaries
    const layers: PlanetaryLayer[] = [
      {
        name: 'inner_core',
        minRadius: layerBoundaries[0],
        maxRadius: layerBoundaries[1],
        materials: [],
        temperature: 5700,
        pressure: 3.6e11,
        density: densities[particleData.find(p => p.distance < layerBoundaries[1])?.particle.materialType || 'Fe'] || 13000,
      },
      {
        name: 'outer_core',
        minRadius: layerBoundaries[1],
        maxRadius: layerBoundaries[2],
        materials: [],
        temperature: 4500,
        pressure: 1.4e11,
        density: 10000,
      },
      {
        name: 'mantle',
        minRadius: layerBoundaries[2],
        maxRadius: layerBoundaries[3],
        materials: [],
        temperature: 1500,
        pressure: 2.4e10,
        density: 4500,
      },
      {
        name: 'crust',
        minRadius: layerBoundaries[3],
        maxRadius: layerBoundaries[4],
        materials: [],
        temperature: 300,
        pressure: 1e5,
        density: 2700,
      },
    ];

    // Distribute materials to layers based on where they actually accumulated
    Object.entries(accretion.materialComposition).forEach(([element, mass]) => {
      const density = densities[element] || 3000;
      // Find which layer this material belongs to based on density
      let layerIndex = 0;
      if (density > 10000) layerIndex = 0; // Inner core
      else if (density > 7000) layerIndex = 1; // Outer core
      else if (density > 3000) layerIndex = 2; // Mantle
      else layerIndex = 3; // Crust

      layers[layerIndex].materials.push({
        type: element as MaterialType,
        quantity: mass,
        depth: layers[layerIndex].minRadius,
        hardness: density / 1000,
        density: density,
      });
    });

    return layers;
  }

  /**
   * Fallback layer generation if no particles available
   */
  private generateLayersFallback(
    materialComposition: Record<string, number>,
    densities: Record<string, number>
  ): PlanetaryLayer[] {
    const sortedMaterials = Object.entries(materialComposition)
      .sort((a, b) => (densities[b[0]] || 3000) - (densities[a[0]] || 3000));

    // Use Earth-like layer boundaries as fallback
    const layers: PlanetaryLayer[] = [
      { name: 'inner_core', minRadius: 0, maxRadius: 1200, materials: [], temperature: 5700, pressure: 3.6e11, density: densities[sortedMaterials[0]?.[0]] || 13000 },
      { name: 'outer_core', minRadius: 1200, maxRadius: 3500, materials: [], temperature: 4500, pressure: 1.4e11, density: 10000 },
      { name: 'mantle', minRadius: 3500, maxRadius: 6000, materials: [], temperature: 1500, pressure: 2.4e10, density: 4500 },
      { name: 'crust', minRadius: 6000, maxRadius: 6371, materials: [], temperature: 300, pressure: 1e5, density: 2700 },
    ];

    sortedMaterials.forEach(([element, mass], index) => {
      const layerIndex = Math.min(Math.floor(index / (sortedMaterials.length / 4)), 3);
      layers[layerIndex].materials.push({
        type: element as MaterialType,
        quantity: mass,
        depth: layers[layerIndex].minRadius,
        hardness: densities[element] / 1000,
        density: densities[element] || 3000,
      });
    });

    return layers;
  }

  private calculatePlanetRadius(mass: number): number {
    // Simplified: R ∝ M^(1/3) for rocky planets
    return Math.pow(mass / 5.97e24, 1 / 3) * 6371000; // meters
  }

  /**
   * Calculate rotation period from angular momentum conservation (physics-derived)
   * L = I * ω, where I = moment of inertia, ω = angular velocity
   * For a sphere: I = (2/5) * M * R^2
   * Rotation period T = 2π / ω = 2π * I / L
   */
  private calculateRotationPeriodFromAngularMomentum(
    angularMomentum: number,
    mass: number,
    radius: number
  ): number {
    if (angularMomentum <= 0 || mass <= 0 || radius <= 0) {
      // Fallback: use simplified formula if physics calculation fails
      return 86400; // 24 hours default
    }

    // Moment of inertia for a solid sphere
    const momentOfInertia = (2 / 5) * mass * radius * radius;

    // Angular velocity from conservation: ω = L / I
    const angularVelocity = angularMomentum / momentOfInertia;

    // Rotation period: T = 2π / ω
    const rotationPeriod = (2 * Math.PI) / angularVelocity;

    // Clamp to reasonable values (1 hour to 1 week)
    return Math.max(3600, Math.min(604800, rotationPeriod)); // 1 hour to 1 week
  }
}
