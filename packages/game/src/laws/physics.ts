/**
 * Physical Laws
 * 
 * These are the fundamental laws that govern motion, gravity, energy, and thermodynamics.
 * They apply everywhere in the universe without exception.
 */

import { PHYSICS_CONSTANTS as C } from '../tables/physics-constants.js';

/**
 * Newton's Laws of Motion
 */
export const NewtonianMechanics = {
  /**
   * First Law: Inertia
   * An object at rest stays at rest, and an object in motion stays in motion
   * unless acted upon by an external force.
   */
  inertia: (force: number): boolean => {
    return force === 0; // If F = 0, then a = 0
  },
  
  /**
   * Second Law: F = ma
   * Force equals mass times acceleration
   */
  acceleration: (force: number, mass: number): number => {
    return force / mass;
  },
  
  /**
   * Third Law: Action-Reaction
   * For every action, there is an equal and opposite reaction
   */
  reactionForce: (actionForce: number): number => {
    return -actionForce;
  },
};

/**
 * Universal Gravitation
 */
export const Gravity = {
  /**
   * Newton's Law of Universal Gravitation
   * F = G * m1 * m2 / r²
   */
  force: (m1: number, m2: number, r: number): number => {
    if (r === 0) return Infinity;
    return C.G * m1 * m2 / (r * r);
  },
  
  /**
   * Gravitational acceleration at distance r from mass M
   * g = G * M / r²
   */
  acceleration: (M: number, r: number): number => {
    if (r === 0) return Infinity;
    return C.G * M / (r * r);
  },
  
  /**
   * Surface gravity
   */
  surfaceGravity: (mass: number, radius: number): number => {
    return Gravity.acceleration(mass, radius);
  },
  
  /**
   * Gravitational potential energy
   * U = -G * m1 * m2 / r
   */
  potentialEnergy: (m1: number, m2: number, r: number): number => {
    if (r === 0) return -Infinity;
    return -C.G * m1 * m2 / r;
  },
};

/**
 * Orbital Mechanics (Kepler's Laws)
 */
export const OrbitalMechanics = {
  /**
   * Orbital period (Kepler's Third Law)
   * T = 2π √(a³ / GM)
   */
  period: (semiMajorAxis: number, centralMass: number): number => {
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (C.G * centralMass));
  },
  
  /**
   * Orbital velocity (circular orbit)
   * v = √(GM / r)
   */
  velocity: (centralMass: number, radius: number): number => {
    return Math.sqrt(C.G * centralMass / radius);
  },
  
  /**
   * Escape velocity
   * v_esc = √(2GM / r)
   */
  escapeVelocity: (mass: number, radius: number): number => {
    return Math.sqrt(2 * C.G * mass / radius);
  },
  
  /**
   * Hill sphere (gravitational sphere of influence)
   * r_H = a * ³√(m / 3M)
   */
  hillSphere: (orbitRadius: number, bodyMass: number, centralMass: number): number => {
    return orbitRadius * Math.pow(bodyMass / (3 * centralMass), 1/3);
  },
  
  /**
   * Roche limit (tidal disruption distance)
   * d = 2.46 * R * ³√(ρ_M / ρ_m)
   */
  rocheLimit: (
    primaryRadius: number,
    primaryDensity: number,
    satelliteDensity: number
  ): number => {
    return 2.46 * primaryRadius * Math.pow(primaryDensity / satelliteDensity, 1/3);
  },
};

/**
 * Thermodynamics
 */
export const Thermodynamics = {
  /**
   * First Law: Energy Conservation
   * ΔU = Q - W
   * Change in internal energy = heat added - work done
   */
  energyConservation: (heatAdded: number, workDone: number): number => {
    return heatAdded - workDone;
  },
  
  /**
   * Second Law: Entropy
   * ΔS = Q / T (reversible process)
   * Entropy always increases in isolated systems
   */
  entropyChange: (heat: number, temperature: number): number => {
    if (temperature === 0) return Infinity;
    return heat / temperature;
  },
  
  /**
   * Ideal Gas Law
   * PV = nRT
   */
  idealGas: {
    pressure: (n: number, T: number, V: number): number => {
      return n * C.R * T / V;
    },
    
    volume: (n: number, T: number, P: number): number => {
      return n * C.R * T / P;
    },
    
    temperature: (P: number, V: number, n: number): number => {
      return P * V / (n * C.R);
    },
  },
  
  /**
   * Stefan-Boltzmann Law (blackbody radiation)
   * P = σ A T⁴
   */
  radiation: (area: number, temperature: number): number => {
    return C.σ * area * Math.pow(temperature, 4);
  },
  
  /**
   * Wien's Displacement Law (peak wavelength of blackbody)
   * λ_max = b / T, where b = 2.897771955×10⁻³ m·K
   */
  peakWavelength: (temperature: number): number => {
    const b = 2.897771955e-3; // Wien's displacement constant
    return b / temperature;
  },
  
  /**
   * Heat capacity
   * Q = m * c * ΔT
   */
  heatTransfer: (mass: number, specificHeat: number, tempChange: number): number => {
    return mass * specificHeat * tempChange;
  },
};

/**
 * Fluid Dynamics
 */
export const FluidDynamics = {
  /**
   * Atmospheric pressure at altitude
   * P = P₀ * e^(-Mgh/RT)
   */
  pressureAtAltitude: (
    surfacePressure: number,
    altitude: number,
    molarMass: number,
    temperature: number,
    gravity: number
  ): number => {
    return surfacePressure * Math.exp(-molarMass * gravity * altitude / (C.R * temperature));
  },
  
  /**
   * Jeans escape parameter (atmospheric retention)
   * λ = GMm / (r k_B T)
   * If λ > 6, gas is retained
   */
  jeansParameter: (
    planetMass: number,
    planetRadius: number,
    molecularMass: number, // kg
    temperature: number
  ): number => {
    return C.G * planetMass * molecularMass / (planetRadius * C.k_B * temperature);
  },
  
  /**
   * Can atmosphere retain this gas?
   */
  canRetainGas: (
    planetMass: number,
    planetRadius: number,
    molecularMass: number,
    temperature: number
  ): boolean => {
    const lambda = FluidDynamics.jeansParameter(planetMass, planetRadius, molecularMass, temperature);
    return lambda > 6; // Rule of thumb: λ > 6 for long-term retention
  },
  
  /**
   * Scale height of atmosphere
   * H = RT / (Mg)
   */
  scaleHeight: (temperature: number, molarMass: number, gravity: number): number => {
    return C.R * temperature / (molarMass * gravity);
  },
};

/**
 * Electromagnetism (Simplified)
 */
export const Electromagnetism = {
  /**
   * Coulomb's Law
   * F = k * q1 * q2 / r²
   * where k = 1 / (4πε₀)
   */
  coulombForce: (q1: number, q2: number, r: number): number => {
    const k = 1 / (4 * Math.PI * C.ε₀);
    return k * q1 * q2 / (r * r);
  },
  
  /**
   * Magnetic field from current (simplified)
   * B = μ₀ * I / (2πr)
   */
  magneticField: (current: number, distance: number): number => {
    return C.μ₀ * current / (2 * Math.PI * distance);
  },
};

/**
 * Combined physics laws object
 */
export const PhysicalLaws = {
  newton: NewtonianMechanics,
  gravity: Gravity,
  orbital: OrbitalMechanics,
  thermo: Thermodynamics,
  fluid: FluidDynamics,
  electromag: Electromagnetism,
} as const;
