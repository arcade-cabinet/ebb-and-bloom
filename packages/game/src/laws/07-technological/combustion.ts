/**
 * Combustion & Fire Laws
 * Chemistry of burning, heat output, oxygen requirements.
 */

export const CombustionChemistry = {
  stoichiometricO2: (fuel: string): number => {
    const ratios: Record<string, number> = {
      C: 2.67, // C + O₂ → CO₂ (32g O₂ per 12g C)
      H: 8.00, // 2H₂ + O₂ → 2H₂O (32g O₂ per 4g H)
      CH4: 4.00, // Methane
      wood: 1.33, // Cellulose approximation
      charcoal: 2.67, // Pure carbon
    };
    return ratios[fuel] || 1.5;
  },
  
  combustionHeat_MJkg: (fuel: string): number => {
    const heats: Record<string, number> = {
      H: 142, // Hydrogen (best!)
      CH4: 55, // Methane
      charcoal: 30,
      wood: 15,
      coal: 25,
      petroleum: 44,
    };
    return heats[fuel] || 15;
  },
  
  flameTemperature_K: (fuel: string, O2_percent: number): number => {
    const maxTemps: Record<string, number> = {
      wood: 1273,
      charcoal: 1473,
      coal: 1773,
      CH4: 2273,
    };
    const maxTemp = maxTemps[fuel] || 1273;
    const O2_factor = O2_percent / 21; // Relative to Earth
    return maxTemp * Math.min(1.5, O2_factor);
  },
  
  canBurn: (O2_percent: number, humidity: number): boolean => {
    return O2_percent > 16 && humidity < 0.9;
  },
};

export const CombustionLaws = {
  chemistry: CombustionChemistry,
} as const;

