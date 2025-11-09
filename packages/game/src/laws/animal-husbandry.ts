/**
 * Animal Husbandry Laws
 *
 * Formulas from livestock science and veterinary medicine.
 * Used for domestic animal breeding, feeding, and management.
 *
 * These are HIGHLY refined through centuries of agricultural optimization.
 */

/**
 * Feed Conversion Ratio
 * How efficiently animals convert feed to body mass
 *
 * Based on agricultural science databases
 */
export const FeedConversion = {
  /**
   * FCR = Feed intake (kg) / Weight gain (kg)
   *
   * Lower is better (more efficient)
   *
   * Typical FCR values:
   * - Chickens (broilers): 1.7-2.0 (excellent)
   * - Pigs: 2.7-3.0 (good)
   * - Cattle: 6.0-8.0 (poor - ruminants are less efficient)
   * - Fish (tilapia): 1.2-1.6 (excellent)
   * - Fish (salmon): 1.1-1.3 (best)
   */
  calculateFCR: (feedIntake_kg: number, massGain_kg: number): number => {
    return feedIntake_kg / massGain_kg;
  },

  /**
   * Expected FCR from physiology
   *
   * Endotherms (warm-blooded): Higher FCR (waste heat)
   * Ectotherms (cold-blooded): Lower FCR (no thermoregulation cost)
   */
  expectedFCR: (
    metabolicType: 'endotherm' | 'ectotherm',
    digestiveEfficiency: number = 0.7 // 70% typical
  ): number => {
    const baseConversion = 1 / digestiveEfficiency; // ~1.43

    if (metabolicType === 'endotherm') {
      // Add thermoregulation cost (~50% of BMR)
      return baseConversion * 2.0; // ~2.86
    } else {
      // Ectotherms are more efficient
      return baseConversion; // ~1.43
    }
  },

  /**
   * Feed needed to reach target weight
   */
  feedToTarget: (currentMass_kg: number, targetMass_kg: number, FCR: number): number => {
    const massGain = targetMass_kg - currentMass_kg;
    return massGain * FCR; // kg of feed needed
  },
};

/**
 * Growth Performance Index
 * Quantifies how well an animal grows under given conditions
 */
export const GrowthPerformance = {
  /**
   * Specific Growth Rate (SGR)
   * SGR = 100 × (ln(W_final) - ln(W_initial)) / days
   *
   * Percentage growth per day
   */
  specificGrowthRate: (initialMass_kg: number, finalMass_kg: number, days: number): number => {
    return (100 * (Math.log(finalMass_kg) - Math.log(initialMass_kg))) / days; // %/day
  },

  /**
   * Thermal Growth Coefficient (TGC)
   * Used in aquaculture - adjusts for temperature
   *
   * TGC = 1000 × (W_f^(1/3) - W_i^(1/3)) / (T × days)
   */
  thermalGrowthCoefficient: (
    initialMass_kg: number,
    finalMass_kg: number,
    temperature_C: number,
    days: number
  ): number => {
    const deltaW = Math.pow(finalMass_kg, 1 / 3) - Math.pow(initialMass_kg, 1 / 3);
    return (1000 * deltaW) / (temperature_C * days);
  },

  /**
   * Production value index
   * Overall growth performance metric
   */
  productionValueIndex: (SGR_percentPerDay: number, FCR: number, survivalRate: number): number => {
    // Higher is better
    // Good SGR + Low FCR + High survival = high PVI
    return (SGR_percentPerDay * survivalRate) / FCR;
  },
};

/**
 * Selective Breeding Response
 * Breeder's equation: R = h² × S
 *
 * Predicts response to artificial selection
 */
export const SelectiveBreeding = {
  /**
   * Response to selection
   * R = h² × S
   *
   * Where:
   * - R = Response (change in trait mean)
   * - h² = Heritability (0-1)
   * - S = Selection differential (selected - population mean)
   */
  responseToSelection: (
    heritability: number, // 0-1 (how much is genetic vs environmental)
    selectionDifferential: number // Units of the trait
  ): number => {
    return heritability * selectionDifferential;
  },

  /**
   * Expected trait after n generations
   */
  traitAfterGenerations: (
    initialTrait: number,
    heritability: number,
    selectionDifferential: number,
    generations: number
  ): number => {
    const responsePerGen = SelectiveBreeding.responseToSelection(
      heritability,
      selectionDifferential
    );
    return initialTrait + responsePerGen * generations;
  },

  /**
   * Heritability estimates for common traits
   * (from animal science literature)
   */
  typicalHeritability: (trait: string): number => {
    const heritabilities: Record<string, number> = {
      body_size: 0.4, // Moderately heritable
      growth_rate: 0.3,
      feed_efficiency: 0.25,
      disease_resistance: 0.15,
      fertility: 0.1, // Low heritability
      behavior: 0.2,
      coat_color: 0.9, // Highly heritable
    };

    return heritabilities[trait] || 0.25; // Default: moderate
  },
};

/**
 * Condition Scoring
 * Body condition assessment (veterinary standard)
 */
export const BodyCondition = {
  /**
   * Body Condition Score (BCS)
   * Scale: 1-5 or 1-9 depending on system
   *
   * Assesses fat reserves relative to skeletal frame
   */
  calculateBCS: (actualMass_kg: number, idealMass_kg: number): number => {
    const ratio = actualMass_kg / idealMass_kg;

    // 5-point scale:
    // 1: Emaciated (< 0.75)
    // 2: Thin (0.75 - 0.90)
    // 3: Ideal (0.90 - 1.10)
    // 4: Overweight (1.10 - 1.25)
    // 5: Obese (> 1.25)

    if (ratio < 0.75) return 1;
    if (ratio < 0.9) return 2;
    if (ratio < 1.1) return 3;
    if (ratio < 1.25) return 4;
    return 5;
  },

  /**
   * Reproductive efficiency vs body condition
   * Too thin OR too fat reduces fertility
   */
  fertilityModifier: (BCS: number): number => {
    // Optimal at BCS = 3
    const deviation = Math.abs(BCS - 3);
    return Math.max(0.3, 1 - 0.2 * deviation); // 30-100%
  },

  /**
   * Survival probability vs condition
   * Thin animals more vulnerable
   */
  survivalModifier: (BCS: number): number => {
    if (BCS < 2) return 0.5; // 50% reduction if thin
    if (BCS > 4) return 0.8; // 20% reduction if obese
    return 1.0; // Normal
  },
};

/**
 * Milk/Egg Production
 * From dairy and poultry science
 */
export const ProductionModels = {
  /**
   * Lactation curve (dairy cattle)
   * Wood (1967) model
   *
   * Y(t) = a × t^b × e^(-c×t)
   *
   * Where:
   * - Y = Milk yield (kg/day)
   * - t = Days in lactation
   * - a,b,c = Parameters (vary by breed)
   */
  woodsLactation: (
    daysInMilk: number,
    a: number = 15, // Peak yield parameter
    b: number = 0.15, // Ascending slope
    c: number = 0.003 // Descending slope
  ): number => {
    return a * Math.pow(daysInMilk, b) * Math.exp(-c * daysInMilk);
  },

  /**
   * Egg production curve (poultry)
   * Modified gamma function
   *
   * Peak at ~30 weeks, gradual decline
   */
  eggProduction: (
    ageInWeeks: number,
    peakRate_eggsPerDay: number = 0.95,
    peakWeek: number = 30
  ): number => {
    if (ageInWeeks < 20) return 0; // Not yet laying

    // Gamma distribution-like curve
    const x = (ageInWeeks - 20) / 10;
    const shape = 2.5;
    const scale = (peakWeek - 20) / 10 / shape;

    const rate =
      (Math.pow(x, shape - 1) * Math.exp(-x / scale)) / (Math.pow(scale, shape) * gamma(shape));

    return Math.max(0, Math.min(peakRate_eggsPerDay, rate * peakRate_eggsPerDay));
  },
};

/**
 * Helper: Gamma function (approximation)
 */
function gamma(z: number): number {
  // Stirling's approximation for Gamma function
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  let x = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Complete animal husbandry laws
 */
export const AnimalHusbandryLaws = {
  feedConversion: FeedConversion,
  growthPerformance: GrowthPerformance,
  breeding: SelectiveBreeding,
  bodyCondition: BodyCondition,
  production: ProductionModels,
} as const;
