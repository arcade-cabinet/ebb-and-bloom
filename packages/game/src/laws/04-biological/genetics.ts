/**
 * Genetics Laws - Heredity, mutation, selection
 */

export const MendelianGenetics = {
  heterozygosityEquilibrium: (p: number) => 2 * p * (1 - p),
  inbreedingDepression: (F: number) => 1 - 3.5 * F,
};

export const PopulationGenetics = {
  hardyWeinberg: (p: number) => ({ AA: p * p, Aa: 2 * p * (1 - p), aa: (1 - p) * (1 - p) }),
  
  selectionResponse: (heritability: number, selectionDifferential: number) => {
    return heritability * selectionDifferential;
  },
  
  mutationRate_perGeneration: 1e-8,
  effectivepopulationSize: (N_census: number) => N_census / 3,
  
  geneticDrift: (alleleFreq: number, Ne: number) => {
    return alleleFreq * (1 - alleleFreq) / (2 * Ne);
  },
  
  fixationTime_generations: (Ne: number) => 4 * Ne,
};

export const GeneticsLaws = {
  mendelian: MendelianGenetics,
  population: PopulationGenetics,
} as const;

