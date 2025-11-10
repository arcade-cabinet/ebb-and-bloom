/**
 * Evolutionary Dynamics
 *
 * HOW evolution actually happens.
 * Selection, drift, mutation, speciation.
 *
 * The MECHANISM, not just the result.
 */

export const NaturalSelection = {
  /**
   * Selection coefficient
   * s = (fitness_A - fitness_B) / fitness_B
   *
   * s > 0: A is favored
   * s < 0: B is favored
   * s = 0: Neutral
   */
  selectionCoefficient: (fitness_A: number, fitness_B: number): number => {
    return (fitness_A - fitness_B) / fitness_B;
  },

  /**
   * Change in allele frequency per generation
   * Δp = s × p × q / (1 - s × p²)
   *
   * Where p = freq of allele A, q = 1-p
   */
  alleleFrequencyChange: (p: number, s: number): number => {
    const q = 1 - p;
    return (s * p * q) / (1 - s * p * p);
  },

  /**
   * Time to fixation (allele reaches 100%)
   * t ≈ (2/s) × ln(2N) generations
   */
  fixationTime_generations: (selectionCoeff: number, popSize: number): number => {
    if (selectionCoeff <= 0) return Infinity; // Never fixes if not favored
    return (2 / selectionCoeff) * Math.log(2 * popSize);
  },

  /**
   * Probability of fixation
   * P_fix ≈ 2s for beneficial alleles (s > 0)
   */
  fixationProbability: (selectionCoeff: number): number => {
    if (selectionCoeff <= 0) return 0;
    return Math.min(1, 2 * selectionCoeff);
  },
};

export const GeneticDrift = {
  /**
   * Variance in allele frequency from drift
   * Var = p × q / (2N_e)
   */
  variance: (alleleFreq: number, effectivePopSize: number): number => {
    return (alleleFreq * (1 - alleleFreq)) / (2 * effectivePopSize);
  },

  /**
   * Effective population size
   * Usually ~1/3 of census size due to variance in reproduction
   */
  effectiveSize: (censusSize: number): number => {
    return Math.floor(censusSize / 3);
  },

  /**
   * Time to loss or fixation by drift alone
   * t ≈ 4N_e generations
   */
  driftTime_generations: (effectivePopSize: number): number => {
    return 4 * effectivePopSize;
  },
};

export const Mutation = {
  /**
   * Mutation rate per base pair per generation
   * Typical: 10^-8 to 10^-9
   */
  rate_perBpPerGen: 1e-8,

  /**
   * Beneficial mutation rate
   * Most mutations neutral or harmful
   * ~1 in 1000 mutations is beneficial
   */
  beneficialFraction: 0.001,

  /**
   * Mutation-selection balance
   * At equilibrium: μ = s × q_equilibrium
   */
  equilibriumFrequency: (mutationRate: number, selectionCoeff: number): number => {
    return Math.sqrt(mutationRate / selectionCoeff);
  },
};

export const Speciation = {
  /**
   * Allopatric speciation time
   * Geographic isolation → reproductive isolation
   *
   * Typical: 1-10 million years for mammals
   */
  allopatricTime_years: (generationTime_years: number, isolationStrength: number): number => {
    const generations = 500000 / generationTime_years; // ~500k years minimum
    return (generations * generationTime_years) / isolationStrength;
  },

  /**
   * Sympatric speciation (same location)
   * Requires strong disruptive selection
   *
   * Much rarer than allopatric
   */
  sympatricProbability: (disruptiveSelection: number, sexualSelection: number): number => {
    return (disruptiveSelection * sexualSelection) / 10; // Very low probability
  },

  /**
   * Genetic distance threshold
   * How different before considered separate species?
   *
   * Typical: 2-5% genetic divergence
   */
  speciationThreshold_percentDivergence: 3.0,

  /**
   * Reproductive isolation
   * At what point can't interbreed?
   */
  reproductiveIsolation: (geneticDivergence_percent: number): boolean => {
    return geneticDivergence_percent > Speciation.speciationThreshold_percentDivergence;
  },
};

export const AdaptiveRadiation = {
  /**
   * Rapid diversification when niches available
   *
   * Examples: Darwin's finches, Hawaiian honeycreepers
   */
  diversificationRate_speciesPerMyr: (
    nicheAvailability: number,
    competitionLevel: number
  ): number => {
    // More niches + less competition = faster radiation
    return (10 * nicheAvailability) / (1 + competitionLevel);
  },

  /**
   * Ecological opportunity
   * Empty niches promote radiation
   */
  opportunityScore: (nichesFilled: number, totalNiches: number): number => {
    return (totalNiches - nichesFilled) / totalNiches;
  },
};

export const EvolutionaryDynamicsLaws = {
  selection: NaturalSelection,
  drift: GeneticDrift,
  mutation: Mutation,
  speciation: Speciation,
  radiation: AdaptiveRadiation,
} as const;
