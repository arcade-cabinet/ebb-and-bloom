/**
 * Stellar Evolution Laws
 *
 * Laws governing star formation, main sequence evolution, and stellar death.
 * Based on observed relationships and stellar physics.
 */

import { PHYSICS_CONSTANTS as C } from '../tables/physics-constants.js';

/**
 * Initial Mass Function (IMF)
 * Distribution of stellar masses at formation
 * Based on Salpeter/Kroupa IMF
 */
export const IMF = {
  /**
   * Sample a stellar mass from the IMF
   * Most stars are low mass, few are high mass
   */
  sampleMass: (random: () => number): number => {
    const r = random();

    // Kroupa IMF (broken power law)
    if (r < 0.5) {
      // Low mass stars (0.08 - 0.5 M☉)
      return 0.08 + r * 0.42;
    } else if (r < 0.9) {
      // Solar-type stars (0.5 - 2 M☉)
      return 0.5 + ((r - 0.5) * 1.5) / 0.4;
    } else {
      // Massive stars (2 - 100 M☉)
      return 2 + ((r - 0.9) * 98) / 0.1;
    }
  },

  /**
   * Probability density at given mass
   */
  probability: (mass: number): number => {
    if (mass < 0.08) return 0; // Below hydrogen burning limit
    if (mass < 0.5) return Math.pow(mass, -1.3);
    if (mass < 1.0) return Math.pow(mass, -2.3);
    return Math.pow(mass, -2.7);
  },
};

/**
 * Main Sequence Relationships
 */
export const MainSequence = {
  /**
   * Mass-Luminosity Relation
   * L ∝ M^3.5 (for solar-type stars)
   * L ∝ M^4 (for massive stars)
   */
  luminosity: (mass: number): number => {
    if (mass < 0.43) {
      return 0.23 * Math.pow(mass, 2.3);
    } else if (mass < 2) {
      return Math.pow(mass, 4);
    } else if (mass < 55) {
      return 1.4 * Math.pow(mass, 3.5);
    } else {
      return 32000 * mass;
    }
  },

  /**
   * Mass-Radius Relation
   * R ∝ M^0.8 (for most stars)
   */
  radius: (mass: number): number => {
    if (mass < 1) {
      return Math.pow(mass, 0.8);
    } else {
      return Math.pow(mass, 0.57);
    }
  },

  /**
   * Mass-Temperature Relation
   * T ∝ M^0.5
   */
  temperature: (mass: number): number => {
    const T_sun = 5778; // K
    return T_sun * Math.pow(mass, 0.505);
  },

  /**
   * Main Sequence Lifetime
   * t ∝ M / L ∝ M^(-2.5)
   */
  lifetime: (mass: number): number => {
    const t_sun = 10e9; // 10 billion years
    return (t_sun * mass) / MainSequence.luminosity(mass);
  },

  /**
   * Spectral Classification
   * Based on surface temperature
   */
  spectralType: (temperature: number): string => {
    if (temperature > 30000) return 'O'; // Blue
    if (temperature > 10000) return 'B'; // Blue-white
    if (temperature > 7500) return 'A'; // White
    if (temperature > 6000) return 'F'; // Yellow-white
    if (temperature > 5200) return 'G'; // Yellow (Sun-like)
    if (temperature > 3700) return 'K'; // Orange
    return 'M'; // Red
  },

  /**
   * Luminosity Class
   * I = Supergiant, III = Giant, V = Main Sequence (dwarf)
   */
  luminosityClass: (mass: number, age: number, lifetime: number): string => {
    const ageRatio = age / lifetime;

    if (ageRatio < 0.9) return 'V'; // Main sequence
    if (mass < 0.5) return 'V'; // Low mass stars stay main sequence
    if (mass < 8) return 'III'; // Red giant phase
    return 'I'; // Supergiant
  },
};

/**
 * Habitable Zone
 * The region where liquid water can exist on a planet's surface
 */
export const HabitableZone = {
  /**
   * Inner edge (runaway greenhouse)
   */
  innerEdge: (luminosity: number): number => {
    return Math.sqrt(luminosity / 1.1); // AU
  },

  /**
   * Outer edge (maximum greenhouse)
   */
  outerEdge: (luminosity: number): number => {
    return Math.sqrt(luminosity / 0.53); // AU
  },

  /**
   * Optimum distance (Earth-equivalent flux)
   */
  optimum: (luminosity: number): number => {
    return Math.sqrt(luminosity); // AU
  },

  /**
   * Check if orbit is in habitable zone
   */
  isHabitable: (orbitRadius: number, luminosity: number): boolean => {
    const inner = HabitableZone.innerEdge(luminosity);
    const outer = HabitableZone.outerEdge(luminosity);
    return orbitRadius >= inner && orbitRadius <= outer;
  },

  /**
   * Stellar flux at distance
   * F = L / (4π d²)
   */
  flux: (luminosity: number, distance: number): number => {
    return (luminosity * C.SOLAR_LUMINOSITY) / (4 * Math.PI * Math.pow(distance * C.AU, 2));
  },
};

/**
 * Planetary Formation Zone
 * Temperature-dependent condensation sequence
 */
export const CondensationSequence = {
  /**
   * Temperature at distance from star
   * T ≈ 280 K * (L/L☉)^0.25 * (d/1AU)^(-0.5)
   */
  temperature: (luminosity: number, distance: number): number => {
    return 280 * Math.pow(luminosity, 0.25) * Math.pow(distance, -0.5);
  },

  /**
   * Frost line (where water ice can condense)
   * Beyond this, gas giants can form
   */
  frostLine: (luminosity: number): number => {
    // Water freezes at ~170K
    // Solve: 170 = 280 * L^0.25 * d^(-0.5)
    return Math.pow((280 * Math.pow(luminosity, 0.25)) / 170, 2);
  },

  /**
   * What materials condense at this temperature?
   */
  condensedMaterials: (temperature: number): string[] => {
    const materials: string[] = [];

    if (temperature < 1700) materials.push('refractory_metals'); // Al, Ca, Ti oxides
    if (temperature < 1500) materials.push('iron', 'nickel');
    if (temperature < 1000) materials.push('silicates'); // Rock
    if (temperature < 300) materials.push('sulfur');
    if (temperature < 170) materials.push('water_ice');
    if (temperature < 120) materials.push('ammonia_ice');
    if (temperature < 70) materials.push('methane_ice');
    if (temperature < 40) materials.push('nitrogen_ice');

    return materials;
  },

  /**
   * Expected planet type based on distance
   */
  planetType: (distance: number, frostLine: number): string => {
    if (distance < 0.1) return 'hot_jupiter_or_evaporating';
    if (distance < frostLine * 0.8) return 'rocky_terrestrial';
    if (distance < frostLine * 2) return 'ice_terrestrial_or_mini_neptune';
    if (distance < frostLine * 10) return 'gas_giant';
    return 'ice_giant';
  },
};

/**
 * Stellar Activity
 * Affects planetary atmospheres and habitability
 */
export const StellarActivity = {
  /**
   * Rotation period (affects magnetic activity)
   * Young stars rotate fast, old stars slow
   */
  rotationPeriod: (mass: number, age: number): number => {
    // Skumanich's law: P_rot ∝ age^0.5
    const youngRotation = 1; // days (for solar mass)
    return youngRotation * Math.sqrt(age / 1e9) * Math.pow(mass, -0.5);
  },

  /**
   * X-ray luminosity (stellar wind and flares)
   * Young stars are very active
   */
  xrayLuminosity: (mass: number, age: number): number => {
    const L_x_sun = 2e27; // W (current Sun)
    const ageFactor = Math.pow(age / 1e9, -1.5); // Decay with age
    return L_x_sun * Math.pow(mass, 2) * ageFactor;
  },

  /**
   * Is the star still highly active? (bad for life)
   */
  isHighlyActive: (age: number): boolean => {
    return age < 1e9; // Less than 1 billion years old
  },
};

/**
 * Complete stellar laws
 */
export const StellarLaws = {
  imf: IMF,
  mainSequence: MainSequence,
  habitableZone: HabitableZone,
  condensation: CondensationSequence,
  activity: StellarActivity,
} as const;
