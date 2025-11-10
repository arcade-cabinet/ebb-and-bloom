export const SeismologyLaws = {
  magnitude: (energy_J: number) => (Math.log10(energy_J) - 4.8) / 1.5,
  intensity: (magnitude: number, distance_km: number) => magnitude - Math.log10(distance_km),
  liquefactionRisk: (magnitude: number, waterTableDepth_m: number, soilType: string) => {
    return magnitude > 5.5 && waterTableDepth_m < 10 && soilType === 'sand';
  },
};
