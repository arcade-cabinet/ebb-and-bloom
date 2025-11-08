/**
 * Gen 0: REAL Planetary Accretion with Yuka Physics + Data Pools
 * Uses AI-generated visual blueprints and actual physics simulation
 */

import { Vehicle, CohesionBehavior, Vector3 } from 'yuka';
import seedrandom from 'seedrandom';
import { Planet, MaterialComposition, PlanetaryLayer, AccretionEvent } from '../schemas/index.js';
import { generateGen0DataPools, type VisualBlueprint } from '../gen-systems/loadGenData.js';

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
    this.position.copy(position);
    this.maxSpeed = 1000; // m/s
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
    let dataPools;
    if (this.useAI) {
      console.log('[ACCRETION] Generating AI data pools...');
      dataPools = await generateGen0DataPools(this.seed);
      console.log(`[ACCRETION] Stellar context: ${dataPools.macro.selectedContext}`);
      console.log(`[ACCRETION] Materials: ${dataPools.micro.visualBlueprint.representations.materials.join(', ')}`);
    }

    // STEP 2: Create debris field based on AI-generated element distribution
    const elementDistribution = this.useAI 
      ? this.parseElementDistribution(dataPools!.micro.selectedDistribution)
      : { Fe: 0.35, Si: 0.25, O: 0.20, Mg: 0.10, Ca: 0.05, Other: 0.05 };

    const debrisField = this.createDebrisField(elementDistribution, 1000); // 1000 particles

    // STEP 3: Run Yuka cohesion simulation (gravity)
    console.log('[ACCRETION] Running cohesion simulation...');
    const accretedPlanet = await this.runCohesionSimulation(debrisField, 100); // 100 cycles

    // STEP 4: Generate layers from accreted materials
    const layers = this.generateLayersFromAccretion(accretedPlanet);

    // STEP 5: Calculate final properties
    const radius = this.calculatePlanetRadius(accretedPlanet.totalMass);
    const mass = accretedPlanet.totalMass;
    const rotationPeriod = this.calculateRotationPeriod(accretedPlanet.angularMomentum);

    const planet: Planet = {
      id: `planet-${this.seed}`,
      seed: this.seed,
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
   * Run Yuka cohesion simulation (gravity analog)
   */
  private async runCohesionSimulation(
    particles: DebrisParticle[],
    cycles: number
  ): Promise<{
    totalMass: number;
    materialComposition: Record<string, number>;
    angularMomentum: number;
    history: AccretionEvent[];
  }> {
    const history: AccretionEvent[] = [];
    const materialCounts: Record<string, number> = {};

    // Setup cohesion behavior (gravity)
    particles.forEach(p => {
      const cohesion = new CohesionBehavior(particles);
      cohesion.weight = p.mass / 1e20; // Scale by mass
      p.steering.add(cohesion);
    });

    // Simulate cycles
    for (let cycle = 0; cycle < cycles; cycle++) {
      // Update particles
      particles.forEach(p => p.update(1.0));

      // Check for collisions/accretion (every 10 cycles to save compute)
      if (cycle % 10 === 0) {
        this.processCollisions(particles, history, cycle);
      }
    }

    // Calculate final composition
    let totalMass = 0;
    particles.forEach(p => {
      totalMass += p.mass;
      materialCounts[p.materialType] = (materialCounts[p.materialType] || 0) + p.mass;
    });

    // Calculate angular momentum (simplified)
    const angularMomentum = particles.reduce((sum, p) => {
      const r = p.position.length();
      const v = p.velocity.length();
      return sum + p.mass * r * v;
    }, 0);

    return {
      totalMass,
      materialComposition: materialCounts,
      angularMomentum,
      history,
    };
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
          
          // Record event
          history.push({
            cycle,
            type: 'collision',
            materials: [particles[larger].materialType, particles[smaller].materialType],
            resultingMass: particles[larger].mass,
            location: { x: particles[larger].position.x, y: particles[larger].position.y, z: particles[larger].position.z },
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
   */
  private generateLayersFromAccretion(
    accretion: { materialComposition: Record<string, number>; totalMass: number }
  ): PlanetaryLayer[] {
    // Sort materials by density (heavier sinks to core)
    const densities: Record<string, number> = {
      Fe: 7874, Si: 2330, O: 1429, Mg: 1738, Ca: 1550,
      C: 2267, H: 71, N: 1.25, RareEarth: 6000, Other: 3000,
    };

    const sortedMaterials = Object.entries(accretion.materialComposition)
      .sort((a, b) => (densities[b[0]] || 3000) - (densities[a[0]] || 3000));

    // Create layers (simplified - 4 layers)
    const layers: PlanetaryLayer[] = [
      { name: 'inner_core', minRadius: 0, maxRadius: 1200, materials: [], temperature: 5700, pressure: 3.6e11, density: densities[sortedMaterials[0][0]] || 13000 },
      { name: 'outer_core', minRadius: 1200, maxRadius: 3500, materials: [], temperature: 4500, pressure: 1.4e11, density: 10000 },
      { name: 'mantle', minRadius: 3500, maxRadius: 6000, materials: [], temperature: 1500, pressure: 2.4e10, density: 4500 },
      { name: 'crust', minRadius: 6000, maxRadius: 6371, materials: [], temperature: 300, pressure: 1e5, density: 2700 },
    ];

    // Distribute materials to layers
    sortedMaterials.forEach(([element, mass], index) => {
      const layerIndex = Math.min(Math.floor(index / (sortedMaterials.length / 4)), 3);
      layers[layerIndex].materials.push({
        element,
        quantity: mass,
        depth: layers[layerIndex].minRadius,
        hardness: densities[element] / 1000,
      });
    });

    return layers;
  }

  private calculatePlanetRadius(mass: number): number {
    // Simplified: R ∝ M^(1/3) for rocky planets
    return Math.pow(mass / 5.97e24, 1/3) * 6371000; // meters
  }

  private calculateRotationPeriod(angularMomentum: number): number {
    // Simplified: faster accretion = faster rotation
    return Math.max(20000, 100000 / Math.max(1, angularMomentum / 1e30)); // seconds
  }
}
