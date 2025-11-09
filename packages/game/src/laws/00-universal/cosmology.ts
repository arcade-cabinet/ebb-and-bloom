/**
 * Cosmological Laws
 * 
 * The Big Bang, expansion, and ultimate fate of the universe.
 * Anchors ALL timescales.
 */

const YEAR = 365.25 * 86400; // seconds

/**
 * Universal Timeline
 * Even though we don't know the ultimate fate, this gives us bounds
 */
export const UniversalTimeline = {
  /**
   * Absolute zero: The Big Bang
   */
  t_bigBang: 0,
  
  /**
   * Current age of universe (observed)
   */
  t_now: 13.8e9 * YEAR, // 13.8 billion years
  
  /**
   * Key milestones (observed)
   */
  milestones: {
    inflation: 1e-32, // seconds (instantaneous!)
    nucleosynthesis: 180, // 3 minutes
    recombination: 380000 * YEAR, // CMB forms
    firstStars: 100e6 * YEAR, // Population III stars
    firstGalaxies: 400e6 * YEAR,
    peakStarFormation: 3e9 * YEAR, // Universe was most active
    solarSystemForms: 9.2e9 * YEAR,
    earthForms: 9.25e9 * YEAR,
    firstLife_earth: 9.6e9 * YEAR, // ~3.8 Gya ago
    photosynthesis_earth: 10.3e9 * YEAR, // ~3.5 Gya ago
    eukaryotes_earth: 11.8e9 * YEAR, // ~2 Gya ago
    multicellular_earth: 12.8e9 * YEAR, // ~1 Gya ago
    animals_earth: 13.2e9 * YEAR, // ~600 Mya ago
    humanCivilization_earth: 13.799999e9 * YEAR, // ~10,000 ya ago
  },
  
  /**
   * Future projections
   */
  future: {
    sunBecomesRedGiant: 18.8e9 * YEAR, // +5 Gyr from now
    sunDeath: 19e9 * YEAR,
    milkyWayAndromedaCollision: 18e9 * YEAR, // +4 Gyr
    lastSunlikeStar: 100e12 * YEAR, // 100 trillion years
    lastRedDwarf: 10e15 * YEAR, // Quadrillion years
    lastBlackHoleDeath: 1e100 * YEAR, // Googol years (Hawking radiation)
  },
  
  /**
   * Ultimate fate (choose one)
   */
  ultimateFate: {
    heatDeath: {
      t_end: Infinity,
      finalState: 'Maximum entropy, T → 0K',
      timeUntil: Infinity,
    },
    bigCrunch: {
      t_maximumExpansion: 50e9 * YEAR, // Hypothetical
      t_crunch: 100e9 * YEAR, // Hypothetical
      finalState: 'Singularity',
    },
    // We'll use heat death (current cosmology consensus)
    selected: 'heat-death',
  },
} as const;

/**
 * Hubble Parameter
 * Expansion rate of universe
 * H₀ ≈ 70 km/s/Mpc
 */
export const Expansion = {
  /**
   * Hubble constant (current value)
   */
  H0_kmPerSPerMpc: 70, // km/s/Mpc
  
  /**
   * Hubble parameter at time t
   * H(t) = H₀ × √(Ω_m × (1+z)³ + Ω_Λ)
   * 
   * Simplified: Assume matter-dominated early, Λ-dominated late
   */
  hubbleParameter: (t_seconds: number): number => {
    const t_years = t_seconds / YEAR;
    const z = Expansion.redshift(t_years); // Redshift
    
    const Omega_m = 0.3; // Matter density
    const Omega_Lambda = 0.7; // Dark energy
    
    const H_t = Expansion.H0_kmPerSPerMpc * Math.sqrt(
      Omega_m * Math.pow(1 + z, 3) + Omega_Lambda
    );
    
    return H_t;
  },
  
  /**
   * Redshift from time
   * Earlier times → higher redshift
   */
  redshift: (t_years: number): number => {
    const t_now_years = UniversalTimeline.t_now / YEAR;
    // Simplified: z ≈ (t_now / t) - 1
    return Math.max(0, (t_now_years / t_years) - 1);
  },
  
  /**
   * Scale factor
   * How much has universe expanded since time t?
   * a(t) = 1 / (1 + z)
   */
  scaleFactor: (t_years: number): number => {
    const z = Expansion.redshift(t_years);
    return 1 / (1 + z);
  },
};

/**
 * Big Bang Nucleosynthesis
 * First 3 minutes: H and He form
 */
export const Nucleosynthesis = {
  /**
   * Primordial abundances (by mass)
   * These are FIXED by Big Bang physics
   */
  primordialAbundances: {
    H: 0.75, // 75% hydrogen
    He: 0.25, // 25% helium
    Li: 1e-10, // Trace lithium
    // Everything else comes from stars!
  },
  
  /**
   * Time when nucleosynthesis occurs
   */
  t_start: 10, // 10 seconds after Big Bang
  t_end: 1200, // 20 minutes (then universe too cool)
  
  /**
   * Temperature at time t (early universe)
   * T(t) ∝ t^(-1/2)
   */
  temperature: (t_seconds: number): number => {
    if (t_seconds < Nucleosynthesis.t_start) {
      // Too hot for nuclei
      return 1e10; // Kelvin
    }
    // Rough power law
    return 1e9 * Math.pow(t_seconds / 100, -0.5); // Kelvin
  },
};

/**
 * Structure Formation
 * How galaxies and clusters form
 */
export const StructureFormation = {
  /**
   * Jeans mass: Minimum mass for gravitational collapse
   * M_J ∝ T^(3/2) / √ρ
   */
  jeansMass: (temperature_K: number, density_kgm3: number): number => {
    const k_B = 1.380649e-23; // Boltzmann constant
    const G = 6.67430e-11;
    const m_H = 1.67e-27; // Hydrogen mass
    
    const numerator = Math.pow(Math.PI * k_B * temperature_K / (G * m_H), 1.5);
    const denominator = Math.sqrt(density_kgm3);
    
    return numerator / denominator; // kg
  },
  
  /**
   * First stars form when universe cools enough
   */
  t_firstStarFormation: 100e6 * YEAR,
  
  /**
   * Star formation rate over cosmic time
   * Peaked at z ~ 2 (10 billion years ago)
   */
  starFormationRate: (t_years: number): number => {
    const t_now = UniversalTimeline.t_now / YEAR;
    const age = t_now - t_years;
    const peak = 3e9; // 3 Gyr after Big Bang
    
    // Gaussian-ish peak
    const rate = Math.exp(-Math.pow((age - peak) / 2e9, 2));
    return rate; // Relative to current
  },
};

/**
 * Complete cosmology laws
 */
export const CosmologyLaws = {
  timeline: UniversalTimeline,
  expansion: Expansion,
  nucleosynthesis: Nucleosynthesis,
  structure: StructureFormation,
} as const;

