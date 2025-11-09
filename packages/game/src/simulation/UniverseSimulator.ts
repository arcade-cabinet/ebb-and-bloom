/**
 * UNIVERSE SIMULATOR
 *
 * THE FOUNDATION OF EVERYTHING.
 *
 * This simulates the ENTIRE universe from Big Bang to Heat Death.
 * Completely deterministic. No seeds. No randomness.
 * Pure physics from t=0 forward.
 *
 * THE GAME is just a VIEW into this larger simulation.
 */

import { CosmologyLaws } from '../laws/00-universal/cosmology';
// import { PHYSICS_CONSTANTS } from '../tables/physics-constants';
import { SpatialIndex } from './SpatialIndex';
// import { StellarLaws } from '../laws/stellar';

/**
 * Spacetime Coordinates
 * WHERE and WHEN in the universe
 */
export interface SpacetimeCoordinates {
  // Spatial (which part of universe?)
  x: number; // Light-years from arbitrary origin
  y: number;
  z: number;

  // Temporal (when?)
  t: number; // Seconds since Big Bang
}

/**
 * Universe State
 * Everything that exists at time t
 */
export interface UniverseState {
  // Absolute time
  t_universal: number; // Seconds since Big Bang

  // Large scale structure
  galaxyDensityField: any; // TODO: Implement
  darkMatterDistribution: any;

  // Observable universe radius
  horizonRadius_ly: number;

  // Complexity (for time-stepping)
  totalComplexity: number;
}

/**
 * LOCAL State
 * What exists at specific coordinates
 */
export interface LocalState {
  // Coordinates
  position: [number, number, number];
  time: number;

  // What's here?
  star: any | null;
  planets: any[];

  // Local environment
  interstellarDensity: number; // atoms/m³
  temperature: number; // Kelvin (CMB temperature at this time)
}

/**
 * The Universe Simulator
 *
 * NO SEEDS. ONE DETERMINISTIC UNIVERSE.
 */
export class UniverseSimulator {
  private state: UniverseState;
  private spatialIndex: SpatialIndex;
  private starCache: Map<string, any> = new Map();

  /**
   * Initialize at Big Bang
   * Initial conditions from physics constants ONLY
   */
  constructor() {
    this.state = {
      t_universal: 0, // Big Bang
      galaxyDensityField: null, // Forms later
      darkMatterDistribution: null,
      horizonRadius_ly: 0,
      totalComplexity: 0,
    };
    this.spatialIndex = new SpatialIndex(1000); // 1000 ly cells
  }

  getCurrentTime(): number {
    return this.state.t_universal;
  }

  updateLocalState(_coords: SpacetimeCoordinates, _update: any): void {
    // TODO: Implement state persistence
  }

  /**
   * Advance universe by dt
   */
  step(dt_seconds: number): void {
    this.state.t_universal += dt_seconds;

    // Apply cosmological laws
    // TODO: Implement actual physics

    // Update horizon (light-travel distance)
    const t_years = this.state.t_universal / (365.25 * 86400);
    this.state.horizonRadius_ly = t_years; // c × t
  }

  /**
   * Fast-forward to target time
   */
  advanceTo(t_target: number): void {
    while (this.state.t_universal < t_target) {
      const dt = this.calculateTimeStep();
      this.step(dt);
    }
  }

  /**
   * Get state at specific spacetime coordinates
   *
   * THIS IS HOW SEEDS WORK:
   * Seed → Coordinates → Universe.getAt() → Planet state
   */
  getAt(coords: SpacetimeCoordinates): LocalState {
    // Ensure universe has evolved to this time
    if (coords.t > this.state.t_universal) {
      this.advanceTo(coords.t);
    }

    // Deterministic lookup at coordinates
    return this.calculateLocalState(coords);
  }

  /**
   * Calculate what exists at coordinates
   * DETERMINISTIC from position + time
   */
  private calculateLocalState(coords: SpacetimeCoordinates): LocalState {
    // Check if star exists here
    const star = this.starAtCoordinates(coords.x, coords.y, coords.z, coords.t);

    // If star exists, check for planets
    const planets = star ? this.planetsAroundStar(star, coords.t) : [];

    // Local environment
    const temperature =
      CosmologyLaws.timeline.t_now > 380000 * 365.25 * 86400
        ? 2.725 // CMB temperature today
        : 3000; // Hotter in early universe

    return {
      position: [coords.x, coords.y, coords.z],
      time: coords.t,
      star,
      planets,
      interstellarDensity: 1e6, // atoms/m³ (typical)
      temperature,
    };
  }

  /**
   * Is there a star at these coordinates?
   * Deterministic check based on structure formation
   */
  private starAtCoordinates(x: number, y: number, z: number, t: number): any | null {
    // Hash coordinates to deterministic value
    const hash = this.spatialHash(x, y, z);

    // Stellar density at this location (from structure formation)
    const density = CosmologyLaws.structure.starFormationRate(t / (365.25 * 86400));

    // Threshold check (deterministic)
    if (hash < density * 0.001) {
      // STAR EXISTS
      return this.generateStarFromCoordinates(x, y, z, t);
    }

    return null; // Empty space
  }

  /**
   * Deterministic hash from coordinates
   * Same coords → same hash (always)
   */
  private spatialHash(x: number, y: number, z: number): number {
    // FNV-1a hash in 3D
    let hash = 2166136261;

    // Hash x
    hash ^= Math.floor(x);
    hash = Math.imul(hash, 16777619);

    // Hash y
    hash ^= Math.floor(y);
    hash = Math.imul(hash, 16777619);

    // Hash z
    hash ^= Math.floor(z);
    hash = Math.imul(hash, 16777619);

    return (hash >>> 0) / 4294967295; // 0-1
  }

  /**
   * Generate star properties from coordinates
   * DETERMINISTIC from position
   */
  private generateStarFromCoordinates(x: number, y: number, z: number, t: number): any {
    const hash = this.spatialHash(x, y, z);

    // Star mass from IMF (but deterministic from coords!)
    // Use hash as "random" input to power law
    const mass = this.salpeterIMF(hash);

    return {
      mass,
      position: [x, y, z],
      age: t - CosmologyLaws.timeline.milestones.firstStars, // Formed when?
      // etc.
    };
  }

  /**
   * Salpeter IMF (but deterministic input)
   */
  private salpeterIMF(uniformValue: number): number {
    // Power law: M^(-2.35)
    const alpha = 2.35;
    const M_min = 0.08;
    const M_max = 100;

    const beta = alpha - 1;
    return M_min * Math.pow(1 - uniformValue * (1 - Math.pow(M_min / M_max, beta)), 1 / beta);
  }

  /**
   * Planets around star (deterministic from star properties)
   */
  private planetsAroundStar(star: any, t: number): any[] {
    // Use star position as deterministic input
    const hash = this.spatialHash(star.position[0] + 1, star.position[1] + 2, star.position[2] + 3);

    // Planet count (deterministic)
    const count = Math.floor(hash * 8) + 1; // 1-8 planets

    // Generate each planet deterministically
    const planets = [];
    for (let i = 0; i < count; i++) {
      const planetHash = this.spatialHash(
        star.position[0] + i,
        star.position[1] + i * 2,
        star.position[2] + i * 3
      );

      planets.push({
        orbitRadius: 0.1 * Math.pow(10, planetHash * 2.7), // 0.1-50 AU
        mass: planetHash * 1000, // Earth masses
        // etc.
      });
    }

    return planets;
  }

  /**
   * Intelligent time-stepping
   */
  private calculateTimeStep(): number {
    const YEAR = 365.25 * 86400;

    // Early universe: Fast steps (nothing complex)
    if (this.state.t_universal < 1e8 * YEAR) {
      return 1e6 * YEAR; // Million-year steps
    }

    // Later: Slower (more structure)
    return 1e3 * YEAR; // Thousand-year steps
  }
}

/**
 * Seed to Slice Converter
 *
 * "red-moon-dance" → Spacetime coordinates
 */
export function seedToSlice(seed: string): SpacetimeCoordinates {
  // Use seedrandom as HASH FUNCTION (not RNG!)
  const seedrandom = require('seedrandom');
  const rng = seedrandom(seed);

  // Convert to coordinates
  // These are LOOKUPS, not generations
  return {
    x: rng() * 1e5, // 0-100,000 light-years
    y: rng() * 1e5,
    z: rng() * 1e5,
    t: 13.8e9 * 365.25 * 86400 - rng() * 1e9 * 365.25 * 86400, // Last billion years
  };
}

/**
 * Game Entry Point
 *
 * Player picks seed → Find slice → Extract planet → Play
 */
export async function startGame(seed: string) {
  // 1. Find coordinates
  const slice = seedToSlice(seed);

  // 2. Get universe state at those coordinates
  const universe = new UniverseSimulator();
  const localState = universe.getAt(slice);

  // 3. If no habitable planet, search nearby
  if (!localState.planets.length) {
    // Try nearby coordinates until found
    // (This is what the seed-based search does)
  }

  // 4. Extract planet and start game
  const planet = localState.planets[0];

  return {
    planet,
    startTime: slice.t,
    universe, // Keep reference for later
  };
}
