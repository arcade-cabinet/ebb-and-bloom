/**
 * Reproduction & Life History Laws
 *
 * Trade-offs in reproduction based on energetics and life history theory.
 * Charnov & Ernest (2006), Stearns (1992), and others.
 */

/**
 * Life History Trade-offs
 * Stearns, S.C. (1992) "The Evolution of Life Histories" Oxford University Press
 */
export const LifeHistoryTradeoffs = {
  /**
   * Offspring size vs number
   *
   * Smith-Fretwell model: Optimal offspring size maximizes total fitness
   * Total reproductive mass is ~fixed, must allocate between size and number
   */
  clutchSize: (
    parentMass_kg: number,
    offspringMass_kg: number,
    rSelected: boolean = false
  ): number => {
    // Reproductive allocation varies with life history strategy
    const allocation = rSelected ? 0.25 : 0.1; // 25% for r, 10% for K
    const reproductiveMass = parentMass_kg * allocation;

    // Clutch size = total / per-offspring
    const count = reproductiveMass / offspringMass_kg;

    return Math.max(1, Math.round(count));
  },

  /**
   * Age at first reproduction
   * AFR ≈ α × Lifespan
   *
   * α depends on mortality:
   * - High mortality → early reproduction (r-selected)
   * - Low mortality → delayed reproduction (K-selected)
   */
  ageAtFirstReproduction: (maxLifespan_years: number, mortalityRate_perYear: number): number => {
    // High mortality → reproduce early
    const alpha = 0.1 + 0.4 / (1 + mortalityRate_perYear);
    return alpha * maxLifespan_years;
  },

  /**
   * Reproductive interval (time between litters/clutches)
   *
   * Based on offspring development time and parental care
   */
  reproductiveInterval: (
    offspringMass_kg: number,
    parentMass_kg: number,
    parentalCare: boolean
  ): number => {
    // Gestation/development time ∝ M^0.25
    const development_days = 28 * Math.pow(offspringMass_kg, 0.25);

    if (!parentalCare) {
      // No care: Can reproduce immediately after birth
      return development_days / 365; // years
    } else {
      // Parental care: Add weaning time
      const weaning_days = development_days * 3; // ~3x development
      return (development_days + weaning_days) / 365; // years
    }
  },

  /**
   * Offspring survival probability
   *
   * Larger offspring have better survival
   * But fewer can be produced (trade-off)
   */
  offspringSurvival: (
    offspringMass_kg: number,
    environmentalHarshness: number // 0-1
  ): number => {
    // Larger offspring survive better
    const sizeFactor = Math.pow(offspringMass_kg, 0.3);

    // Harsh environments kill small offspring
    const baseSurvival = 0.5 * (1 - environmentalHarshness);

    return Math.min(0.95, baseSurvival + 0.3 * sizeFactor);
  },
};

/**
 * Gestation & Development
 * Sacher & Staffeldt (1974) "Relation of gestation time to brain weight for placental mammals"
 * American Naturalist, 108(963), 593-615
 */
export const DevelopmentTime = {
  /**
   * Gestation time for mammals
   * G ≈ 0.75 × M^0.25 (days)
   *
   * Where M is in kg
   */
  gestationTime_days: (mass_kg: number): number => {
    return 0.75 * Math.pow(mass_kg * 1000, 0.25); // Convert to grams
  },

  /**
   * Incubation time for eggs
   * I ≈ 12 × M^0.17 (days)
   *
   * Shorter than gestation for same mass
   */
  incubationTime_days: (eggMass_kg: number): number => {
    return 12 * Math.pow(eggMass_kg, 0.17);
  },

  /**
   * Time to independence (weaning/fledging)
   * W ≈ Gestation × 3 (for mammals)
   * W ≈ Incubation × 2 (for birds)
   */
  weaningTime_days: (gestationTime_days: number, taxon: 'mammal' | 'bird'): number => {
    const multiplier = taxon === 'mammal' ? 3 : 2;
    return gestationTime_days * multiplier;
  },

  /**
   * Growth to maturity
   * Total time to reach adult size
   *
   * T_maturity ≈ 5 × Gestation (rough approximation)
   */
  maturityTime_years: (gestationTime_days: number): number => {
    return (gestationTime_days * 5) / 365; // years
  },
};

/**
 * Parental Care
 * Clutton-Brock (1991) "The Evolution of Parental Care"
 */
export const ParentalCare = {
  /**
   * Should parents provide care?
   *
   * Care evolves when:
   * - Offspring survival benefit > Parent survival cost
   */
  shouldProvideCare: (
    offspringSurvivalBonus: number, // 0-1 (how much care helps)
    parentMortalityRisk: number, // 0-1 (risk from caring)
    relatedness: number = 0.5 // 0.5 for own offspring
  ): boolean => {
    // Hamilton's rule: B × r > C
    const benefit = offspringSurvivalBonus * relatedness;
    const cost = parentMortalityRisk;

    return benefit > cost;
  },

  /**
   * Care duration
   * Longer for helpless altricial offspring
   * Shorter for precocial offspring
   */
  careDuration_days: (
    offspringType: 'altricial' | 'precocial',
    offspringMass_kg: number
  ): number => {
    const baseDevelopment = 28 * Math.pow(offspringMass_kg, 0.25);

    if (offspringType === 'altricial') {
      // Born helpless: Need extended care
      return baseDevelopment * 4; // ~4x development time
    } else {
      // Born mobile: Brief care
      return baseDevelopment * 0.5; // ~0.5x development time
    }
  },

  /**
   * Number of caregivers
   *
   * Uniparental: One parent (usually female)
   * Biparental: Both parents
   * Cooperative: Multiple adults
   */
  caregiverCount: (
    offspringHelplessness: number, // 0-1
    resourceAbundance: number, // 0-1
    predationRisk: number // 0-1
  ): number => {
    // Helpless offspring need more care
    // Scarce resources → can't afford two caregivers
    // High predation → both parents needed for defense

    const needsTwo = (offspringHelplessness + predationRisk) / 2;
    const canAffordTwo = resourceAbundance;

    if (needsTwo > 0.6 && canAffordTwo > 0.5) return 2;
    if (needsTwo > 0.8) return 3; // Cooperative breeding
    return 1;
  },
};

/**
 * Sex Ratio
 * Fisher (1930) "The Genetical Theory of Natural Selection"
 */
export const SexRatio = {
  /**
   * Fisher's Principle: Equal investment in each sex
   * Sex ratio should be 1:1 at independence
   */
  equilibriumRatio: (): number => {
    return 0.5; // 50% male, 50% female
  },

  /**
   * Trivers-Willard hypothesis
   * When to bias sex ratio?
   *
   * Good conditions → produce expensive sex (usually males)
   * Poor conditions → produce cheap sex (usually females)
   */
  conditionalSexRatio: (
    parentCondition: number, // 0-1 (poor to excellent)
    sexualDimorphism: number // 0-1 (how different are sexes)
  ): number => {
    // If sexes are similar, no bias
    if (sexualDimorphism < 0.2) return 0.5;

    // Good condition → bias toward expensive sex (males)
    // Poor condition → bias toward cheap sex (females)
    const bias = (parentCondition - 0.5) * sexualDimorphism * 0.3;

    return Math.max(0.2, Math.min(0.8, 0.5 + bias)); // Constrain 20-80%
  },
};

/**
 * Complete reproduction laws
 */
export const ReproductionLaws = {
  lifeHistory: LifeHistoryTradeoffs,
  development: DevelopmentTime,
  parentalCare: ParentalCare,
  sexRatio: SexRatio,
} as const;
