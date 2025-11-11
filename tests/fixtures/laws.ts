/**
 * GOLDEN LAW OUTPUTS
 * 
 * Known-good outputs from law calculations for regression testing.
 * These values are verified against real physics/biology/chemistry.
 */

import { PHYSICS_CONSTANTS } from '../../agents/tables/physics-constants';
import { PERIODIC_TABLE } from '../../agents/tables/periodic-table';

/**
 * Golden values for gravity calculations
 */
export const GOLDEN_GRAVITY = {
  /**
   * Gravitational force between 1kg masses at 1m distance
   * F = G * (m1 * m2) / r²
   * F = 6.674e-11 * (1 * 1) / 1² = 6.674e-11 N
   */
  UNIT_FORCE: 6.674e-11,
  
  /**
   * Earth's surface gravity
   * g = G * M_earth / R_earth²
   * g ≈ 9.81 m/s²
   */
  EARTH_SURFACE_G: 9.81,
  
  /**
   * Escape velocity from Earth
   * v = sqrt(2 * G * M / R)
   * v ≈ 11,200 m/s
   */
  EARTH_ESCAPE_VELOCITY: 11200,
} as const;

/**
 * Golden values for chemistry
 */
export const GOLDEN_CHEMISTRY = {
  /**
   * Water molecule mass (H₂O)
   * 2 * H + 1 * O = 2 * 1.008 + 15.999 = 18.015 u
   */
  WATER_MASS: 18.015,
  
  /**
   * Carbon dioxide mass (CO₂)
   * 1 * C + 2 * O = 12.011 + 2 * 15.999 = 44.009 u
   */
  CO2_MASS: 44.009,
  
  /**
   * Methane mass (CH₄)
   * 1 * C + 4 * H = 12.011 + 4 * 1.008 = 16.043 u
   */
  METHANE_MASS: 16.043,
} as const;

/**
 * Golden values for periodic table queries
 */
export const GOLDEN_ELEMENTS = {
  /**
   * Most abundant element in universe
   */
  MOST_ABUNDANT: 'H',
  
  /**
   * Noble gases (do not bond)
   */
  NOBLE_GASES: ['He'],
  
  /**
   * Life-critical elements (CHNOPS)
   */
  LIFE_ELEMENTS: ['C', 'H', 'N', 'O'],
} as const;

/**
 * Calculate expected gravitational force
 * 
 * @param m1 - Mass 1 (kg)
 * @param m2 - Mass 2 (kg)
 * @param r - Distance (m)
 * @returns Force (N)
 */
export function calculateGravityForce(m1: number, m2: number, r: number): number {
  return PHYSICS_CONSTANTS.G * (m1 * m2) / (r * r);
}

/**
 * Calculate molecular mass from formula
 * 
 * @param formula - Map of element symbols to counts (e.g., { H: 2, O: 1 })
 * @returns Molecular mass (u)
 */
export function calculateMolecularMass(formula: { [symbol: string]: number }): number {
  let mass = 0;
  
  for (const [symbol, count] of Object.entries(formula)) {
    const element = PERIODIC_TABLE[symbol];
    if (!element) {
      throw new Error(`Unknown element: ${symbol}`);
    }
    mass += element.atomicMass * count;
  }
  
  return mass;
}
