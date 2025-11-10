/**
 * Geological Laws
 *
 * Plate tectonics, rock cycle, volcanism, erosion.
 * From Turcotte & Schubert "Geodynamics" and others.
 */

/**
 * Plate Tectonics
 * Driven by mantle convection
 */
export const PlateTectonics = {
  /**
   * Number of tectonic plates
   * Depends on planet size and heat flow
   *
   * Earth: 7-8 major plates
   * Mars: 1 plate (too cold, dead)
   * Smaller planet: Fewer plates (heat lost faster)
   */
  plateCount: (planetRadius_m: number, internalHeatFlow_Wm2: number): number => {
    const earthRadius = 6.371e6;
    const earthHeatFlow = 0.087; // W/m²

    const sizeRatio = planetRadius_m / earthRadius;
    const heatRatio = internalHeatFlow_Wm2 / earthHeatFlow;

    // Rough scaling
    const plates = 7 * Math.sqrt(sizeRatio * heatRatio);

    return Math.max(1, Math.round(plates));
  },

  /**
   * Plate velocity
   * Earth plates: 1-10 cm/year
   *
   * Driven by mantle convection rate
   */
  plateVelocity_cmPerYear: (
    mantleViscosity_Pas: number,
    temperatureGradient_KperM: number
  ): number => {
    // Convection velocity ∝ 1/viscosity × ΔT
    const earthViscosity = 1e21; // Pa·s
    const earthGradient = 0.03; // K/m

    const velocity =
      5 * (earthViscosity / mantleViscosity_Pas) * (temperatureGradient_KperM / earthGradient);

    return Math.max(0, Math.min(15, velocity)); // cm/year
  },

  /**
   * Earthquake frequency
   * More active tectonics → more earthquakes
   */
  earthquakeRate_perYear: (
    plateVelocity_cmPerYear: number,
    plateBoundaryLength_km: number
  ): number => {
    // Strain accumulation rate
    const strainRate = plateVelocity_cmPerYear / 100; // per year

    // Earthquakes release strain
    const earthquakesPerKm = strainRate * 0.1; // Roughly

    return plateBoundaryLength_km * earthquakesPerKm;
  },
};

/**
 * Volcanism
 * Magma generation and eruption
 */
export const Volcanism = {
  /**
   * Magma generation rate
   * Depends on mantle temperature and composition
   */
  magmaGenerationRate_km3PerYear: (
    mantleTemperature_K: number,
    waterContent_percent: number
  ): number => {
    // Hotter = more melting
    const tempFactor = (mantleTemperature_K - 1200) / 500; // Relative to solidus

    // Water lowers melting point (subduction zones)
    const waterFactor = 1 + waterContent_percent * 2;

    const baseRate = 1; // km³/year (Earth-like)
    return Math.max(0, baseRate * tempFactor * waterFactor);
  },

  /**
   * Eruption style
   * Depends on magma viscosity (SiO₂ content)
   *
   * Low SiO₂ (basalt): Runny, effusive (Hawaii)
   * High SiO₂ (rhyolite): Thick, explosive (Mt. St. Helens)
   */
  eruptionStyle: (SiO2_percent: number): 'effusive' | 'explosive' => {
    return SiO2_percent < 55 ? 'effusive' : 'explosive';
  },

  /**
   * Volcanic Explosivity Index (VEI)
   * Scale 0-8
   */
  VEI: (eruptionVolume_km3: number, eruptionDuration_hours: number): number => {
    // VEI based on volume
    if (eruptionVolume_km3 < 0.00001) return 0;
    if (eruptionVolume_km3 < 0.001) return 1;
    if (eruptionVolume_km3 < 0.01) return 2;
    if (eruptionVolume_km3 < 0.1) return 3;
    if (eruptionVolume_km3 < 1) return 4;
    if (eruptionVolume_km3 < 10) return 5;
    if (eruptionVolume_km3 < 100) return 6;
    if (eruptionVolume_km3 < 1000) return 7;
    return 8;
  },
};

/**
 * Rock Cycle
 * Igneous → Sedimentary → Metamorphic → Igneous
 */
export const RockCycle = {
  /**
   * Rock types and transformations
   */
  types: {
    igneous: {
      formation: 'Crystallization from magma',
      composition: { Si: 0.28, O: 0.46, Al: 0.08, Fe: 0.05, Mg: 0.04 },
      hardness: 6,
    },
    sedimentary: {
      formation: 'Deposition and lithification',
      composition: { Si: 0.35, O: 0.48, Ca: 0.1, C: 0.05 },
      hardness: 3,
    },
    metamorphic: {
      formation: 'Heat and pressure transformation',
      composition: { Si: 0.3, O: 0.48, Al: 0.1, Fe: 0.06 },
      hardness: 7,
    },
  },

  /**
   * Transformation time
   * Sedimentary → Metamorphic: Millions of years under pressure
   */
  transformationTime_years: (
    currentType: 'igneous' | 'sedimentary',
    pressure_GPa: number,
    temperature_K: number
  ): number => {
    if (currentType === 'sedimentary' && pressure_GPa > 0.5 && temperature_K > 500) {
      return 10e6; // 10 million years
    }

    if (currentType === 'igneous' && temperature_K < 300) {
      return 50e6; // 50 million years to weather
    }

    return Infinity; // Stable
  },
};

/**
 * Erosion
 * Physical and chemical weathering
 */
export const Erosion = {
  /**
   * Physical weathering rate
   * Freeze-thaw cycles break rock
   */
  physicalWeathering_mmPerYear: (
    freezeThawCycles_perYear: number,
    rockHardness_mohs: number
  ): number => {
    // More cycles = faster breakdown
    // Harder rocks resist longer
    return (freezeThawCycles_perYear / rockHardness_mohs) * 0.01; // mm/year
  },

  /**
   * Chemical weathering rate
   * Water + CO₂ dissolve rock
   *
   * Rate doubles every 10°C (Arrhenius)
   */
  chemicalWeathering_mmPerYear: (
    temperature_K: number,
    rainfall_mm: number,
    CO2_ppm: number
  ): number => {
    const tempC = temperature_K - 273.15;

    // Temperature factor (Q10 = 2)
    const tempFactor = Math.pow(2, tempC / 10);

    // Water factor (need rain for chemical weathering)
    const waterFactor = rainfall_mm / 1000;

    // CO₂ factor (carbonic acid)
    const CO2_factor = CO2_ppm / 400; // Relative to Earth

    const baseRate = 0.01; // mm/year
    return baseRate * tempFactor * waterFactor * CO2_factor;
  },

  /**
   * Total erosion (physical + chemical)
   */
  totalErosion: (physical_mmPerYear: number, chemical_mmPerYear: number): number => {
    return physical_mmPerYear + chemical_mmPerYear;
  },
};

/**
 * Complete geology laws
 */
export const GeologyLaws = {
  tectonics: PlateTectonics,
  volcanism: Volcanism,
  rockCycle: RockCycle,
  erosion: Erosion,
} as const;
