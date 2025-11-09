/**
 * Photosynthesis Laws
 *
 * THE FOUNDATION OF ALL ECOSYSTEMS.
 * Light → Chemical energy → Everything else
 *
 * 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
 */

export const LightReactions = {
  /**
   * Photosynthetic efficiency
   * Theoretical maximum: ~11%
   * Real plants: 3-6%
   */
  maxEfficiency: 0.06, // 6% for C4 plants
  C3_efficiency: 0.03, // 3% for C3 plants (most plants)
  C4_efficiency: 0.06, // 6% for C4 plants (grasses, corn)
  CAM_efficiency: 0.04, // 4% for CAM plants (succulents)

  /**
   * Light compensation point
   * Below this, respiration > photosynthesis (net loss)
   */
  compensationPoint_umolm2s: (plantType: string): number => {
    return (
      {
        C3: 50, // μmol photons/m²/s
        C4: 20, // More efficient at low light
        CAM: 30,
      }[plantType] || 50
    );
  },

  /**
   * Light saturation point
   * Above this, more light doesn't help
   */
  saturationPoint_umolm2s: (plantType: string): number => {
    return (
      {
        C3: 1000,
        C4: 1800, // Can use more light
        CAM: 800,
      }[plantType] || 1000
    );
  },

  /**
   * Net photosynthesis rate
   * P_net = P_gross - R_dark
   */
  netRate_umolCO2m2s: (
    lightIntensity_umolm2s: number,
    CO2_ppm: number,
    temperature_K: number,
    plantType: string
  ): number => {
    const efficiency =
      (LightReactions[`${plantType}_efficiency` as keyof typeof LightReactions] as number) || 0.03;
    const saturation = LightReactions.saturationPoint_umolm2s(plantType);
    const compensation = LightReactions.compensationPoint_umolm2s(plantType);

    // Light response curve (saturation)
    const lightFactor = Math.min(1, lightIntensity_umolm2s / saturation);

    // CO₂ response (Michaelis-Menten)
    const Km = 400; // ppm (half-saturation)
    const CO2_factor = CO2_ppm / (Km + CO2_ppm);

    // Temperature response (optimum ~25°C)
    const tempC = temperature_K - 273.15;
    const tempFactor = Math.exp(-Math.pow((tempC - 25) / 15, 2)); // Gaussian

    // Gross photosynthesis
    const P_gross = 30 * efficiency * lightFactor * CO2_factor * tempFactor; // μmol/m²/s

    // Respiration (always happening)
    const R_dark = 2; // μmol/m²/s

    return Math.max(0, P_gross - R_dark);
  },
};

export const PathwaySelection = {
  /**
   * C3 vs C4 - Which photosynthetic pathway?
   *
   * C3: Most plants, less efficient, struggles in hot/dry
   * C4: Grasses, very efficient, good in hot/dry
   * CAM: Succulents, water-conserving, desert specialist
   */
  optimalPathway: (temperature_K: number, CO2_ppm: number, waterAvailability: number): string => {
    const tempC = temperature_K - 273.15;

    // Hot + dry → C4 or CAM
    if (tempC > 30 && waterAvailability < 0.5) {
      return waterAvailability < 0.2 ? 'CAM' : 'C4';
    }

    // Low CO₂ → C4 (more efficient CO₂ fixation)
    if (CO2_ppm < 200) return 'C4';

    // Default: C3 (works everywhere)
    return 'C3';
  },

  /**
   * Water use efficiency
   * C4 > CAM > C3
   */
  waterUseEfficiency_gCO2perKgH2O: (pathway: string): number => {
    return (
      {
        C3: 2.5,
        C4: 5.0, // 2x better
        CAM: 10.0, // 4x better (opens stomata at night)
      }[pathway] || 2.5
    );
  },
};

export const OxygenProduction = {
  /**
   * O₂ produced from photosynthesis
   * 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
   *
   * 1 mole glucose → 6 moles O₂
   */
  O2_from_glucose: 6, // Molar ratio

  /**
   * Global O₂ production from NPP
   *
   * Earth: ~330 Gt biomass/year → ~260 Gt O₂/year
   */
  annualProduction_Gt: (NPP_GtCperYear: number): number => {
    const C_to_O2 = 32 / 12; // Mass ratio (32g O₂ per 12g C)
    return NPP_GtCperYear * C_to_O2 * 0.8; // 80% of carbon from photosynthesis
  },

  /**
   * Atmospheric O₂ equilibrium
   * Production vs consumption (respiration + weathering)
   */
  equilibriumO2_percent: (
    photosynthesisRate_GtPerYear: number,
    respirationRate_GtPerYear: number,
    weatheringRate_GtPerYear: number
  ): number => {
    const netProduction =
      photosynthesisRate_GtPerYear - respirationRate_GtPerYear - weatheringRate_GtPerYear;
    const atmosphericMass = 5.1e15; // kg

    // Time to equilibrium ~millions of years
    const currentO2_Gt = atmosphericMass * 0.21 * (32 / 29); // Current Earth

    return ((currentO2_Gt + netProduction * 1e6) / atmosphericMass) * (29 / 32); // Fraction
  },
};

export const PhotosynthesisLaws = {
  lightReactions: LightReactions,
  pathways: PathwaySelection,
  oxygen: OxygenProduction,
} as const;
