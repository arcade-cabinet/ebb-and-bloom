/**
 * Behavioral Ecology Laws
 * 
 * Decision-making rules from optimal foraging theory and behavioral ecology.
 * Based on peer-reviewed research.
 */

/**
 * Optimal Foraging Theory
 * Charnov (1976) "Optimal foraging, the marginal value theorem"
 * Theoretical Population Biology, 9(2), 129-136
 */
export const OptimalForaging = {
  /**
   * Marginal Value Theorem
   * Leave patch when marginal gain rate drops to environmental average
   * 
   * This predicts when animals should leave food patches
   */
  shouldLeavePatch: (
    currentGainRate_Jpers: number,
    averageGainRate_Jpers: number
  ): boolean => {
    return currentGainRate_Jpers < averageGainRate_Jpers;
  },
  
  /**
   * Diet breadth: Should I eat this prey?
   * Include if: E/h > λ × E_best/h_best
   * 
   * Where:
   * - E = energy value of prey
   * - h = handling time
   * - λ = encounter rate
   */
  shouldPursue: (
    preyEnergy_J: number,
    handlingTime_s: number,
    encounterRate_perHour: number,
    bestPreyProfitability_Jpers: number
  ): boolean => {
    const profitability = preyEnergy_J / handlingTime_s;
    const opportunityCost = encounterRate_perHour * bestPreyProfitability_Jpers / 3600;
    return profitability > opportunityCost;
  },
  
  /**
   * Optimal load size for central place foragers
   * Maximize: (Energy - TravelCost) / (ForagingTime + TravelTime)
   */
  optimalLoadSize: (
    itemEnergy_J: number,
    itemHandlingTime_s: number,
    travelCost_J: number,
    travelTime_s: number
  ): number => {
    // Simplified: assumes linear loading time
    // Real version requires calculus optimization
    const loadTime = 60 * itemHandlingTime_s; // Collect for 1 minute
    const items = Math.floor(loadTime / itemHandlingTime_s);
    return items;
  },
};

/**
 * Risk-Sensitive Foraging
 * Real, M.L. & Caraco, T. (1986)
 * "Risk and foraging in stochastic environments"
 * Annual Review of Ecology and Systematics, 17, 371-390
 */
export const RiskSensitiveForaging = {
  /**
   * Risk aversion depends on energy state
   * 
   * Starving animals: Risk-prone (variance-seeking)
   * Satiated animals: Risk-averse (variance-avoiding)
   */
  riskPreference: (
    currentEnergy_J: number,
    requiredEnergy_J: number,
    reserveEnergy_J: number
  ): 'risk-averse' | 'risk-neutral' | 'risk-prone' => {
    if (currentEnergy_J < requiredEnergy_J) {
      return 'risk-prone'; // Starving - gamble needed
    }
    if (currentEnergy_J > requiredEnergy_J + reserveEnergy_J) {
      return 'risk-averse'; // Satiated - conserve
    }
    return 'risk-neutral';
  },
  
  /**
   * Choose between options with different variance
   * If energy is below threshold, prefer high variance (risky) option
   */
  chooseOption: (
    option1Mean_J: number,
    option1Variance_J2: number,
    option2Mean_J: number,
    option2Variance_J2: number,
    currentEnergy_J: number,
    threshold_J: number
  ): 1 | 2 => {
    if (currentEnergy_J < threshold_J) {
      // Risk-prone: Choose higher variance
      return option1Variance_J2 > option2Variance_J2 ? 1 : 2;
    } else {
      // Risk-averse: Choose higher mean
      return option1Mean_J > option2Mean_J ? 1 : 2;
    }
  },
};

/**
 * Social Foraging
 * Clark & Mangel (1986)
 * "The evolutionary advantages of group foraging"
 * Theoretical Population Biology, 30(1), 45-75
 */
export const SocialForaging = {
  /**
   * Group foraging benefit
   * Many eyes hypothesis: Detection increases with group size
   * 
   * P_detect = 1 - (1 - p)^n
   * Where p = individual detection probability, n = group size
   */
  detectionProbability: (
    individualProbability: number,
    groupSize: number
  ): number => {
    return 1 - Math.pow(1 - individualProbability, groupSize);
  },
  
  /**
   * Scrounger-Producer game
   * Optimal scrounging frequency depends on group size
   * 
   * Based on Barnard & Sibly (1981)
   */
  optimalScroungerFrequency: (groupSize: number): number => {
    // Nash equilibrium: f_scrounger = 1 - (1 / groupSize)
    return 1 - (1 / groupSize);
  },
  
  /**
   * Individual intake rate in group
   * Decreases with competition: R_i = R_total / n^α
   * 
   * α ≈ 1: Linear (food equally shared)
   * α < 1: Interference (scrounging)
   */
  individualIntakeRate: (
    totalRate_Jpers: number,
    groupSize: number,
    interferenceExponent: number = 0.8
  ): number => {
    return totalRate_Jpers / Math.pow(groupSize, interferenceExponent);
  },
};

/**
 * Anti-Predator Behavior
 * Hamilton (1971) "Geometry for the selfish herd"
 * Journal of Theoretical Biology, 31(2), 295-311
 */
export const AntiPredatorBehavior = {
  /**
   * Dilution effect: Predation risk decreases in groups
   * P_individual = P_group / n
   */
  predationRisk: (
    groupPredationRate_perHour: number,
    groupSize: number
  ): number => {
    return groupPredationRate_perHour / groupSize;
  },
  
  /**
   * Many eyes: Detection distance increases with group
   * D = D_individual × √n
   */
  detectionDistance: (
    individualDetection_m: number,
    groupSize: number
  ): number => {
    return individualDetection_m * Math.sqrt(groupSize);
  },
  
  /**
   * Optimal group size for safety
   * Balances dilution effect vs resource competition
   */
  optimalGroupSize: (
    predationPressure: number,
    resourceCompetition: number
  ): number => {
    // High predation → large groups
    // High competition → small groups
    const baseline = 5;
    const predationFactor = predationPressure * 20;
    const competitionFactor = resourceCompetition * 10;
    
    return Math.round(baseline + predationFactor - competitionFactor);
  },
  
  /**
   * Vigilance time: Trade-off between feeding and watching for predators
   * V = 1 - (1 / √n)
   * 
   * Larger groups = less individual vigilance needed
   */
  vigilanceTime(groupSize: number): number {
    return 1 - (1 / Math.sqrt(groupSize));
  },
};

/**
 * Complete behavioral ecology laws
 */
export const BehavioralEcologyLaws = {
  foraging: OptimalForaging,
  riskSensitive: RiskSensitiveForaging,
  social: SocialForaging,
  antiPredator: AntiPredatorBehavior,
} as const;

