/**
 * Gen 0: SIMPLIFIED Planetary Accretion for Architecture Validation
 * Full physics simulation comes later - this proves the REST API flow
 */

import seedrandom from 'seedrandom';
import {
  Planet,
  MaterialComposition,
  PlanetaryLayer,
  AccretionEvent,
} from '../schemas/index.js';

export interface AccretionConfig {
  seed: string;
}

export class AccretionSimulation {
  private seed: string;
  private rng: seedrandom.PRNG;

  constructor(config: AccretionConfig) {
    this.seed = config.seed;
    this.rng = seedrandom(config.seed);
  }

  /**
   * Run SIMPLIFIED accretion (deterministic planet generation)
   * TODO: Replace with full Yuka physics simulation
   */
  async simulate(): Promise<Planet> {
    console.log(`[ACCRETION] Generating planet with seed: ${this.seed}`);

    // Generate deterministic planetary parameters
    const radius = 3e6 + this.rng() * 4e6; // 3000-7000 km
    const mass = this.calculateMass(radius);
    const rotationPeriod = 20000 + this.rng() * 60000; // 20k-80k seconds
    
    // Generate layers
    const layers = this.generateLayers(radius);
    
    // Create mock history
    const history = this.generateHistory();

    const planet: Planet = {
      id: `planet-${this.seed}`,
      seed: this.seed,
      radius,
      mass,
      rotationPeriod,
      layers,
      compositionHistory: history,
      status: 'formed',
    };

    console.log(`[ACCRETION] Planet generated!`);
    console.log(`[ACCRETION] Radius: ${(radius / 1000).toFixed(0)}km`);
    console.log(`[ACCRETION] Mass: ${mass.toExponential(2)}kg`);
    console.log(`[ACCRETION] Rotation: ${(rotationPeriod / 3600).toFixed(1)}h`);
    console.log(`[ACCRETION] Layers: ${layers.length}`);

    return planet;
  }

  private calculateMass(radius: number): number {
    const avgDensity = 5000 + this.rng() * 1000; // kg/m³
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    return volume * avgDensity;
  }

  private generateLayers(radius: number): PlanetaryLayer[] {
    const layers: PlanetaryLayer[] = [];

    // Inner core (20% of radius)
    const innerCoreRadius = radius * 0.2;
    layers.push({
      name: 'inner_core',
      minRadius: 0,
      maxRadius: innerCoreRadius,
      materials: [
        {
          type: 'iron',
          quantity: 1e22 * this.rng(),
          depth: 0,
          hardness: 10,
          density: 13000,
        },
        {
          type: 'calcium',
          quantity: 1e20 * this.rng(),
          depth: 0,
          hardness: 9,
          density: 12000,
        },
      ],
      density: 13000,
      temperature: 6000,
      pressure: 3.6e11,
    });

    // Outer core (20-55% of radius)
    const outerCoreRadius = radius * 0.55;
    layers.push({
      name: 'outer_core',
      minRadius: innerCoreRadius,
      maxRadius: outerCoreRadius,
      materials: [
        {
          type: 'iron',
          quantity: 1e22 * this.rng(),
          depth: innerCoreRadius,
          hardness: 9,
          density: 11000,
        },
        {
          type: 'silicon',
          quantity: 1e21 * this.rng(),
          depth: innerCoreRadius,
          hardness: 8,
          density: 10000,
        },
      ],
      density: 11000,
      temperature: 4500,
      pressure: 1.4e11,
    });

    // Mantle (55-88% of radius)
    const mantleRadius = radius * 0.88;
    layers.push({
      name: 'mantle',
      minRadius: outerCoreRadius,
      maxRadius: mantleRadius,
      materials: [
        {
          type: 'silicon',
          quantity: 1e22 * this.rng(),
          depth: outerCoreRadius,
          hardness: 7,
          density: 4500,
        },
        {
          type: 'magnesium',
          quantity: 1e21 * this.rng(),
          depth: outerCoreRadius,
          hardness: 6,
          density: 4000,
        },
        {
          type: 'oxygen',
          quantity: 1e21 * this.rng(),
          depth: outerCoreRadius,
          hardness: 5,
          density: 3500,
        },
      ],
      density: 4500,
      temperature: 2000,
      pressure: 2.4e10,
    });

    // Crust (88-100% of radius)
    layers.push({
      name: 'crust',
      minRadius: mantleRadius,
      maxRadius: radius,
      materials: [
        {
          type: 'limestone',
          quantity: 1e20 * this.rng(),
          depth: mantleRadius,
          hardness: 3,
          density: 2700,
        },
        {
          type: 'basalt',
          quantity: 1e20 * this.rng(),
          depth: mantleRadius + (radius - mantleRadius) * 0.3,
          hardness: 6,
          density: 3000,
        },
        {
          type: 'granite',
          quantity: 1e20 * this.rng(),
          depth: mantleRadius + (radius - mantleRadius) * 0.6,
          hardness: 7,
          density: 2800,
        },
        {
          type: 'sand',
          quantity: 1e19 * this.rng(),
          depth: radius * 0.99,
          hardness: 1,
          density: 1600,
        },
        {
          type: 'water',
          quantity: 1e21 * this.rng(),
          depth: radius,
          hardness: 0,
          density: 1000,
        },
      ],
      density: 2800,
      temperature: 300,
      pressure: 1e5,
    });

    return layers;
  }

  private generateHistory(): AccretionEvent[] {
    // Mock history for now
    const events: AccretionEvent[] = [];
    
    const eventCount = 10 + Math.floor(this.rng() * 20);
    
    for (let i = 0; i < eventCount; i++) {
      events.push({
        cycle: i * 1000,
        type: 'accretion',
        objects: [`debris-${i}`, `debris-${i+1}`],
        result: {
          newMass: 1e12 * this.rng(),
          energyReleased: 1e20 * this.rng(),
        },
      });
    }

    return events;
  }
}
