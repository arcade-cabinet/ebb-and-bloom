/**
 * Oceanography Laws - Ocean currents, upwelling, marine chemistry
 */

export const OceanCirculation = {
  thermohalineStrength: (tempGradient_K: number, salinityGradient_ppt: number) => {
    const alpha = 2e-4; // Thermal expansion coeff
    const beta = 8e-4; // Haline contraction coeff
    return alpha * tempGradient_K - beta * salinityGradient_ppt;
  },

  gyreCount: (planetRadius_m: number, rotationRate_radPerS: number) => {
    const earthRotation = (2 * Math.PI) / 86400;
    return Math.floor(3 * Math.sqrt(rotationRate_radPerS / earthRotation));
  },

  upwellingRate_mPerDay: (windSpeed_ms: number, coriolisParameter: number) => {
    return windSpeed_ms / (2 * coriolisParameter * 1000);
  },
};

export const MarineChemistry = {
  salinityFromEvaporation: (evap_mm: number, precip_mm: number, initialSalinity_ppt: number) => {
    const waterLoss = evap_mm - precip_mm;
    return initialSalinity_ppt * (1 + waterLoss / 1000);
  },

  dissolvedO2_mgL: (temp_K: number, salinity_ppt: number) => {
    const tempC = temp_K - 273.15;
    return 14.6 - 0.41 * tempC - 0.008 * salinity_ppt;
  },

  pHfromCO2: (CO2_ppm: number) => {
    return 8.2 - 0.15 * Math.log10(CO2_ppm / 280);
  },
};

export const OceanographyLaws = {
  circulation: OceanCirculation,
  chemistry: MarineChemistry,
} as const;
