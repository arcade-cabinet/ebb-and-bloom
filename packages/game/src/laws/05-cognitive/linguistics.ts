/**
 * Linguistic Laws
 * Language evolution, Zipf's law, phoneme inventory, grammar complexity.
 */

export const PhonemeInventory = {
  typicalSize: (brainMass_kg: number): number => {
    const human = 44; // Human phonemes
    const factor = Math.sqrt(brainMass_kg / 0.0014);
    return Math.round(20 + factor * 20);
  },
  
  distinctiveFeaturesNeeded: (phonemeCount: number): number => {
    return Math.ceil(Math.log2(phonemeCount));
  },
};

export const ZipfsLaw = {
  wordFrequency: (rank: number, totalWords: number): number => {
    const s = 1; // Exponent (typically ~1)
    const H_N = Array.from({ length: totalWords }, (_, i) => 1 / Math.pow(i + 1, s))
      .reduce((sum, x) => sum + x, 0);
    return 1 / (Math.pow(rank, s) * H_N);
  },
};

export const GrammarComplexity = {
  canRecurse: (EQ: number): boolean => EQ > 4.0,
  maxEmbeddingDepth: (EQ: number): number => Math.floor(EQ / 2),
  morphologicalComplexity: (culturalAge_years: number): number => {
    return Math.min(10, Math.log10(culturalAge_years));
  },
};

export const LinguisticsLaws = {
  phonemes: PhonemeInventory,
  zipf: ZipfsLaw,
  grammar: GrammarComplexity,
} as const;

