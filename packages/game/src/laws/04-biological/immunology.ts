/**
 * Immunology Laws - Defense against pathogens
 */

export const InnateImmunity = {
  phagocytosisRate: (pathogenSize_um: number) => 1000 / pathogenSize_um,
  inflammationDuration_days: (severity: number) => 3 + severity * 7,
};

export const AdaptiveImmunity = {
  antibodyProduction_perDay: (antigenExposure: number) => Math.pow(10, 6 + antigenExposure),
  memoryBCellLifespan_years: 30,
  boosterEffect: (timeSinceExposure_years: number) => Math.exp(-timeSinceExposure_years / 10),
};

export const HerdImmunity = {
  threshold: (R0: number) => 1 - 1 / R0,
  effectiveReproduction: (R0: number, immuneFraction: number) => R0 * (1 - immuneFraction),
};

export const ImmunologyLaws = {
  innate: InnateImmunity,
  adaptive: AdaptiveImmunity,
  herd: HerdImmunity,
} as const;

