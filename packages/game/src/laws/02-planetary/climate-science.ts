/**
 * Climate Science Laws
 * 
 * Radiative transfer, greenhouse effect, Milankovitch cycles, climate sensitivity.
 * From Pierrehumbert "Principles of Planetary Climate" and IPCC reports.
 */

/**
 * Radiative Balance
 * Foundation of ALL climate science
 */
export const RadiativeBalance = {
  /**
   * Stefan-Boltzmann Law
   * Blackbody radiation: P = σ × A × T⁴
   */
  stefanBoltzmann: (temperature_K: number, surfaceArea_m2: number): number => {
    const sigma = 5.670374419e-8; // W/(m²·K⁴)
    return sigma * surfaceArea_m2 * Math.pow(temperature_K, 4); // Watts
  },
  
  /**
   * Equilibrium temperature (no atmosphere)
   * T_eq = (S × (1-α) / (4σ))^0.25
   * 
   * Where:
   * - S = Solar constant (W/m²)
   * - α = Albedo (reflectivity)
   * - σ = Stefan-Boltzmann constant
   */
  equilibriumTemperature: (
    solarFlux_Wm2: number,
    albedo: number = 0.3
  ): number => {
    const sigma = 5.670374419e-8;
    return Math.pow((solarFlux_Wm2 * (1 - albedo)) / (4 * sigma), 0.25); // Kelvin
  },
  
  /**
   * Solar flux at distance
   * S = L_star / (4π × d²)
   */
  solarFlux: (stellarLuminosity_W: number, distance_m: number): number => {
    return stellarLuminosity_W / (4 * Math.PI * Math.pow(distance_m, 2));
  },
};

/**
 * Greenhouse Effect
 * Why Earth is 33K warmer than equilibrium temperature
 */
export const GreenhouseEffect = {
  /**
   * Surface temperature WITH greenhouse gases
   * T_s = T_eq × (1 + 0.75 × τ)^0.25
   * 
   * Where τ = optical depth of atmosphere
   */
  surfaceTemperature: (
    equilibriumTemp_K: number,
    opticalDepth: number
  ): number => {
    return equilibriumTemp_K * Math.pow(1 + 0.75 * opticalDepth, 0.25);
  },
  
  /**
   * Optical depth from greenhouse gas concentrations
   * 
   * Main contributors:
   * - H₂O: Strong, but self-limiting (condenses)
   * - CO₂: Medium, long-lived
   * - CH₄: Strong but short-lived
   */
  opticalDepth: (
    CO2_ppm: number,
    CH4_ppm: number,
    H2O_percent: number
  ): number => {
    // Simplified Beer-Lambert
    const tau_CO2 = Math.log(CO2_ppm / 280) * 5.35; // W/m² per doubling
    const tau_CH4 = Math.log(CH4_ppm / 700) * 0.036;
    const tau_H2O = H2O_percent * 0.5; // Very rough
    
    return (tau_CO2 + tau_CH4 + tau_H2O) / 10; // Normalize
  },
  
  /**
   * Climate sensitivity
   * ΔT from doubling CO₂
   * 
   * IPCC consensus: 2-4.5°C, best estimate 3°C
   */
  sensitivityToCO2: 3.0, // Kelvin per doubling
  
  /**
   * Temperature change from CO₂ change
   */
  deltaTemperature: (
    initialCO2_ppm: number,
    finalCO2_ppm: number
  ): number => {
    const doublings = Math.log2(finalCO2_ppm / initialCO2_ppm);
    return GreenhouseEffect.sensitivityToCO2 * doublings;
  },
};

/**
 * Milankovitch Cycles
 * Orbital variations drive ice ages
 * 
 * Milankovitch (1920), confirmed by ice core data
 */
export const MilankovitchCycles = {
  /**
   * Eccentricity cycle: 100,000 years
   * Orbital shape varies from circular to elliptical
   */
  eccentricityCycle_years: 100000,
  
  /**
   * Obliquity cycle: 41,000 years
   * Axial tilt varies (Earth: 22.1° - 24.5°)
   */
  obliquityCycle_years: 41000,
  
  /**
   * Precession cycle: 26,000 years
   * Axis wobbles like spinning top
   */
  precessionCycle_years: 26000,
  
  /**
   * Insolation variation from cycles
   * Combined effect determines ice age timing
   */
  insolationVariation: (
    time_years: number,
    baseInsolation_Wm2: number
  ): number => {
    // Eccentricity component
    const ecc = 0.05 * Math.sin(2 * Math.PI * time_years / MilankovitchCycles.eccentricityCycle_years);
    
    // Obliquity component
    const obl = 0.03 * Math.sin(2 * Math.PI * time_years / MilankovitchCycles.obliquityCycle_years);
    
    // Precession component
    const prec = 0.02 * Math.sin(2 * Math.PI * time_years / MilankovitchCycles.precessionCycle_years);
    
    const variation = ecc + obl + prec; // -0.1 to +0.1
    
    return baseInsolation_Wm2 * (1 + variation);
  },
  
  /**
   * Ice age threshold
   * When summer insolation drops below threshold, ice sheets grow
   */
  isGlacialPeriod: (summerInsolation_Wm2: number): boolean => {
    return summerInsolation_Wm2 < 400; // W/m² threshold (empirical)
  },
};

/**
 * Albedo (Reflectivity)
 * Determines how much solar energy is absorbed vs reflected
 */
export const Albedo = {
  /**
   * Surface albedo by type
   */
  values: {
    fresh_snow: 0.85, // Very reflective
    ice: 0.60,
    desert_sand: 0.40,
    forest: 0.15, // Dark, absorbs heat
    ocean: 0.06, // Very dark
    bare_rock: 0.25,
    grass: 0.25,
  },
  
  /**
   * Planetary albedo from surface coverage
   */
  planetary: (surfaceCoverages: Record<string, number>): number => {
    let totalAlbedo = 0;
    for (const [surface, coverage] of Object.entries(surfaceCoverages)) {
      const albedo = Albedo.values[surface as keyof typeof Albedo.values] || 0.3;
      totalAlbedo += albedo * coverage;
    }
    return totalAlbedo;
  },
  
  /**
   * Ice-albedo feedback
   * More ice → higher albedo → cooler → MORE ice
   * 
   * Runaway process!
   */
  iceAlbedoFeedback: (
    temperature_K: number,
    currentIceCoverage: number
  ): number => {
    // Ice grows if temperature < 273K
    if (temperature_K < 273) {
      const growthRate = (273 - temperature_K) * 0.01; // 1% per degree below freezing
      return Math.min(1.0, currentIceCoverage + growthRate);
    } else {
      // Ice melts
      const meltRate = (temperature_K - 273) * 0.01;
      return Math.max(0, currentIceCoverage - meltRate);
    }
  },
};

/**
 * Atmospheric Circulation
 * Hadley, Ferrel, and Polar cells
 */
export const AtmosphericCirculation = {
  /**
   * Number of circulation cells
   * Depends on planetary rotation rate and size
   * 
   * Earth: 3 cells per hemisphere (Hadley, Ferrel, Polar)
   * Slow rotation: 1 cell
   * Fast rotation: Many cells
   */
  numberOfCells: (
    rotationPeriod_hours: number,
    planetRadius_m: number
  ): number => {
    // Rossby number determines cell count
    const omega = 2 * Math.PI / (rotationPeriod_hours * 3600); // rad/s
    const U = 10; // m/s (typical wind speed)
    const L = planetRadius_m;
    
    const Ro = U / (omega * L); // Rossby number
    
    // More cells with faster rotation (lower Ro)
    if (Ro > 1) return 1; // Slow rotation
    if (Ro > 0.1) return 3; // Earth-like
    return Math.floor(10 / Ro); // Fast rotation
  },
  
  /**
   * Hadley cell extent
   * Tropical convection cell
   * 
   * Extends to ~30° latitude on Earth
   */
  hadleyExtent_degrees: (rotationRate_radPerS: number): number => {
    // Faster rotation → narrower cells
    const earthRotation = 2 * Math.PI / 86400;
    const ratio = rotationRate_radPerS / earthRotation;
    
    return 30 / Math.sqrt(ratio); // degrees latitude
  },
};

/**
 * Precipitation Patterns
 * Where does it rain?
 */
export const Precipitation = {
  /**
   * Annual rainfall from temperature and circulation
   * 
   * High rainfall:
   * - Equatorial (Hadley uplift)
   * - Temperate (Ferrel convergence)
   * - Windward coasts
   * 
   * Low rainfall:
   * - Subtropical (Hadley descent) → deserts!
   * - Polar (cold, dry)
   * - Rain shadow
   */
  annualRainfall_mm: (
    latitude_degrees: number,
    elevation_m: number,
    distanceToOcean_km: number,
    prevailingWindDirection: 'onshore' | 'offshore'
  ): number => {
    let rainfall = 0;
    
    // Equatorial: High rainfall (ITCZ)
    if (Math.abs(latitude_degrees) < 10) {
      rainfall = 2500; // mm/year
    }
    // Subtropical: Low (Hadley descent)
    else if (Math.abs(latitude_degrees) < 35) {
      rainfall = 300;
    }
    // Temperate: Moderate (Ferrel cell)
    else if (Math.abs(latitude_degrees) < 60) {
      rainfall = 1000;
    }
    // Polar: Low (cold)
    else {
      rainfall = 250;
    }
    
    // Elevation: Orographic lift
    const orographicBonus = Math.min(1500, elevation_m * 0.5);
    rainfall += orographicBonus;
    
    // Distance from ocean: Continental effect
    const continentalPenalty = distanceToOcean_km * 2;
    rainfall -= continentalPenalty;
    
    // Wind direction
    if (prevailingWindDirection === 'offshore') {
      rainfall *= 0.5; // Dry
    }
    
    return Math.max(0, rainfall);
  },
};

/**
 * Complete climate science laws
 */
export const ClimateScienceLaws = {
  radiative: RadiativeBalance,
  greenhouse: GreenhouseEffect,
  milankovitch: MilankovitchCycles,
  albedo: Albedo,
  circulation: AtmosphericCirculation,
  precipitation: Precipitation,
} as const;
