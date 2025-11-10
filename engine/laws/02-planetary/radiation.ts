/**
 * Radiation Laws
 * Thermal, radioactive decay, stellar radiation
 */

export const ThermalRadiation = {
  /**
   * Stefan-Boltzmann: All objects emit thermal radiation
   * P = σ × A × T⁴
   */
  power_W: (surfaceArea_m2: number, temperature_K: number): number => {
    const sigma = 5.670374419e-8; // W/(m²·K⁴)
    return sigma * surfaceArea_m2 * Math.pow(temperature_K, 4);
  },

  /**
   * Peak wavelength (Wien's law)
   * λ_max = b / T where b = 2.897771955×10^-3 m·K
   */
  peakWavelength_m: (temperature_K: number): number => {
    return 2.897771955e-3 / temperature_K;
  },

  /**
   * Is visible to human eye?
   */
  isVisibleGlow: (temperature_K: number): boolean => {
    return temperature_K > 800; // Dull red glow starts ~800K
  },

  /**
   * Glow color from temperature
   */
  glowColor: (temperature_K: number): { r: number; g: number; b: number } => {
    if (temperature_K < 800) return { r: 0, g: 0, b: 0 };
    if (temperature_K < 1500) return { r: 1, g: 0.1, b: 0 }; // Red
    if (temperature_K < 2500) return { r: 1, g: 0.5, b: 0.1 }; // Orange
    if (temperature_K < 4000) return { r: 1, g: 0.9, b: 0.6 }; // Yellow
    if (temperature_K < 7000) return { r: 1, g: 1, b: 1 }; // White
    return { r: 0.8, g: 0.9, b: 1 }; // Blue-white
  },
};

export const RadioactiveDecay = {
  /**
   * Radioactive elements and their properties
   */
  halfLives_years: {
    U238: 4.468e9, // Uranium-238
    U235: 7.04e8,
    Th232: 1.405e10, // Thorium-232
    K40: 1.248e9, // Potassium-40
    C14: 5730, // Carbon-14 (for dating)
    Ra226: 1600, // Radium
  },

  /**
   * Decay rate from half-life
   * λ = ln(2) / t_half
   */
  decayConstant_perYear: (halfLife_years: number): number => {
    return Math.LN2 / halfLife_years;
  },

  /**
   * Activity (decays per second)
   * A = λ × N
   */
  activity_Bq: (atomCount: number, decayConstant_perSecond: number): number => {
    return atomCount * decayConstant_perSecond;
  },

  /**
   * Heat from radioactive decay
   * U238: 95.6 μW/kg
   * Th232: 26.4 μW/kg
   * K40: 3.5 μW/kg
   */
  heatGeneration_WperKg: (element: string): number => {
    const rates: Record<string, number> = {
      U238: 95.6e-6,
      Th232: 26.4e-6,
      K40: 3.5e-6,
    };
    return rates[element] || 0;
  },

  /**
   * Total radioactive heating in planetary core
   * Major source of internal heat!
   */
  planetaryHeating_W: (
    coreMass_kg: number,
    U_concentration: number,
    Th_concentration: number,
    K_concentration: number
  ): number => {
    const U_heat = coreMass_kg * U_concentration * RadioactiveDecay.heatGeneration_WperKg('U238');
    const Th_heat =
      coreMass_kg * Th_concentration * RadioactiveDecay.heatGeneration_WperKg('Th232');
    const K_heat = coreMass_kg * K_concentration * RadioactiveDecay.heatGeneration_WperKg('K40');

    return U_heat + Th_heat + K_heat;
  },

  /**
   * Surface radiation dose
   * Dangerous if no magnetic field to deflect cosmic rays
   */
  surfaceDose_mSvPerYear: (
    cosmicRays_mSv: number,
    terrestrialRadiation_mSv: number,
    hasMagneticField: boolean
  ): number => {
    const cosmic = hasMagneticField ? cosmicRays_mSv * 0.5 : cosmicRays_mSv * 3;
    return cosmic + terrestrialRadiation_mSv;
  },

  /**
   * Is radiation level safe for life?
   * Earth surface: ~2-3 mSv/year
   * Dangerous: >100 mSv/year
   */
  isSafeForLife: (dose_mSvPerYear: number): boolean => {
    return dose_mSvPerYear < 50; // 50 mSv/year threshold
  },
};

export const StellarRadiation = {
  /**
   * Solar luminosity → radiation at distance
   * F = L / (4π d²)
   */
  flux_Wm2: (stellarLuminosity_Lsun: number, distance_AU: number): number => {
    const L_sun_watts = 3.828e26; // W
    const L_watts = stellarLuminosity_Lsun * L_sun_watts;
    const distance_m = distance_AU * 1.496e11; // m

    return L_watts / (4 * Math.PI * Math.pow(distance_m, 2));
  },

  /**
   * UV radiation (harmful to life)
   * Depends on stellar temperature
   */
  uvFraction: (stellarTemperature_K: number): number => {
    // Hotter stars = more UV
    // Sun (5778K): ~10% UV
    // M-dwarf (3000K): ~1% UV
    // O-star (30000K): ~90% UV

    if (stellarTemperature_K < 4000) return 0.01; // M-dwarf
    if (stellarTemperature_K < 6000) return 0.1; // Sun-like
    if (stellarTemperature_K < 10000) return 0.3; // A-star
    return 0.7; // O/B star (deadly)
  },

  /**
   * Radiation pressure (affects small particles, comets)
   * P = F / c
   */
  radiationPressure_Pa: (flux_Wm2: number): number => {
    const c = 299792458; // m/s
    return flux_Wm2 / c;
  },
};

export const RadiationLaws = {
  thermal: ThermalRadiation,
  radioactive: RadioactiveDecay,
  stellar: StellarRadiation,
} as const;
