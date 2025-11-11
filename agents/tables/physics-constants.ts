/**
 * Universal Physical Constants
 *
 * These constants are fundamental properties of the universe.
 * They are the same everywhere and everywhen.
 * All physical phenomena emerge from these values.
 */

export const PHYSICS_CONSTANTS = {
  // Gravitational constant
  G: 6.6743e-11, // m³/(kg·s²) - Universal gravitation

  // Speed of light (exact, by definition)
  c: 299792458, // m/s - Maximum speed of causality

  // Electromagnetic constants
  epsilon_0: 8.8541878128e-12, // F/m - Vacuum permittivity
  mu_0: 1.25663706212e-6, // H/m - Vacuum permeability
  e: 1.602176634e-19, // C - Elementary charge (exact, by definition)

  // Thermodynamic constants
  k_B: 1.380649e-23, // J/K - Boltzmann constant (exact, by definition)
  N_A: 6.02214076e23, // 1/mol - Avogadro's number (exact, by definition)
  R: 8.314462618, // J/(mol·K) - Universal gas constant
  σ: 5.670374419e-8, // W/(m²·K⁴) - Stefan-Boltzmann constant

  // Quantum constants
  h: 6.62607015e-34, // J·s - Planck constant (exact, by definition)
  ℏ: 1.054571817e-34, // J·s - Reduced Planck constant (ℏ = h/2π)

  // Mathematical constants
  π: Math.PI,
  e_euler: Math.E,
  φ: 1.618033988749, // Golden ratio

  // Derived astronomical constants
  AU: 1.495978707e11, // m - Astronomical unit
  SOLAR_MASS: 1.98892e30, // kg - Mass of the Sun
  SOLAR_LUMINOSITY: 3.828e26, // W - Luminosity of the Sun
  SOLAR_RADIUS: 6.96e8, // m - Radius of the Sun
  EARTH_MASS: 5.972e24, // kg - Mass of Earth
  EARTH_RADIUS: 6.371e6, // m - Radius of Earth
} as const;

export type PhysicsConstants = typeof PHYSICS_CONSTANTS;
