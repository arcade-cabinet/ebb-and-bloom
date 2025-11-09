/**
 * Game Theory & Strategic Interaction
 *
 * Formulas for predicting outcomes of strategic interactions.
 * Nash, Maynard Smith, Axelrod, and others.
 */

/**
 * Prisoner's Dilemma & Cooperation
 * Axelrod (1984) "The Evolution of Cooperation"
 */
export const CooperationTheory = {
  /**
   * Payoff matrix for standard prisoner's dilemma
   *
   *           Cooperate  Defect
   * Cooperate    R, R      S, T
   * Defect       T, S      P, P
   *
   * Where: T > R > P > S (Temptation > Reward > Punishment > Sucker)
   * And: 2R > T + S (cooperation is collectively best)
   */
  payoffs: {
    T: 5, // Temptation to defect
    R: 3, // Reward for mutual cooperation
    P: 1, // Punishment for mutual defection
    S: 0, // Sucker's payoff
  },

  /**
   * Should cooperate in iterated game?
   * Tit-for-tat strategy (Axelrod's winner)
   */
  titForTat: (
    opponentLastMove: 'cooperate' | 'defect',
    isFirstMove: boolean
  ): 'cooperate' | 'defect' => {
    if (isFirstMove) return 'cooperate'; // Nice
    return opponentLastMove; // Reciprocate
  },

  /**
   * Cooperation probability with kin
   * Hamilton's rule: cooperate if r × B > C
   *
   * Where:
   * - r = relatedness (0.5 for siblings, 0.25 for cousins)
   * - B = benefit to recipient
   * - C = cost to actor
   */
  shouldCooperateKin: (relatedness: number, benefit: number, cost: number): boolean => {
    return relatedness * benefit > cost;
  },

  /**
   * Cooperation with non-kin (reciprocal altruism)
   * Trivers (1971): Cooperate if expected future benefit > cost
   *
   * Depends on:
   * - Probability of future interaction
   * - Partner's reliability (history)
   */
  shouldCooperateNonKin: (
    futureMeetingProbability: number,
    partnerReliability: number, // 0-1 based on history
    benefit: number,
    cost: number,
    discountRate: number = 0.1 // Future discounting
  ): boolean => {
    const expectedFutureBenefit =
      (benefit * futureMeetingProbability * partnerReliability) / discountRate;
    return expectedFutureBenefit > cost;
  },
};

/**
 * Evolutionary Stable Strategy (ESS)
 * Maynard Smith (1982) "Evolution and the Theory of Games"
 */
export const ESS = {
  /**
   * Hawk-Dove game
   *
   * Contest over resources:
   * - Hawk: Always fight (risk injury)
   * - Dove: Display, retreat if opponent is Hawk
   *
   *       Hawk   Dove
   * Hawk  (V-C)/2  V
   * Dove    0    V/2
   *
   * Where V = value, C = cost of injury
   */
  hawkDoveESS: (
    resourceValue: number,
    injuryCost: number
  ): { hawkFreq: number; doveFreq: number } => {
    if (injuryCost > resourceValue) {
      // ESS: Mixed strategy
      const p_hawk = resourceValue / injuryCost;
      return { hawkFreq: p_hawk, doveFreq: 1 - p_hawk };
    } else {
      // Pure Hawk ESS
      return { hawkFreq: 1.0, doveFreq: 0.0 };
    }
  },

  /**
   * Bourgeois strategy
   * "Owner wins, intruder retreats"
   *
   * Often ESS when:
   * - Resource value < injury cost
   * - Ownership is easily assessed
   */
  bourgeoisOutcome: (
    isOwner: boolean,
    resourceValue: number,
    fightCost: number
  ): 'win' | 'retreat' => {
    if (isOwner) return 'win';
    if (resourceValue < fightCost) return 'retreat';
    // Otherwise fight (handled elsewhere)
    return 'retreat';
  },
};

/**
 * Tragedy of the Commons
 * Hardin (1968) "The Tragedy of the Commons"
 */
export const CommonsTheory = {
  /**
   * Sustainable harvest rate
   * Maximum sustainable yield (MSY)
   *
   * For logistic growth: MSY = r × K / 4
   * Where r = growth rate, K = carrying capacity
   */
  sustainableYield: (growthRate_perYear: number, carryingCapacity: number): number => {
    return (growthRate_perYear * carryingCapacity) / 4;
  },

  /**
   * Tragedy occurs when:
   * Individual benefit > shared cost
   *
   * Leads to overexploitation
   */
  willOverexploit: (
    individualBenefit: number,
    sharedCostPerCapita: number,
    numberOfUsers: number
  ): boolean => {
    const perceivedCost = sharedCostPerCapita / numberOfUsers; // Diffused cost
    return individualBenefit > perceivedCost;
  },

  /**
   * Ostrom's principles for commons management
   * Need AT LEAST 3/8 principles for success
   */
  ostromPrinciples: {
    /**
     * 1. Defined boundaries (who can use resource?)
     */
    hasBoundaries: (groupSize: number, outsiderPressure: number): boolean => {
      return groupSize < 500 && outsiderPressure > 0.3;
    },

    /**
     * 2. Proportional equivalence (costs match benefits)
     */
    proportionalCosts: (benefit: number, cost: number): boolean => {
      return Math.abs(benefit - cost) / benefit < 0.2; // Within 20%
    },

    /**
     * 3. Collective choice (users make rules)
     */
    collectiveChoice: (governanceType: string): boolean => {
      return !['chiefdom', 'state'].includes(governanceType);
    },

    /**
     * 4. Monitoring (someone watches for cheaters)
     */
    hasMonitoring: (groupSize: number): boolean => {
      return groupSize > 20; // Large enough to afford monitors
    },

    /**
     * 5. Graduated sanctions (escalating punishment)
     */
    hasGraduatedSanctions: (socialComplexity: number): boolean => {
      return socialComplexity > 0.4;
    },

    /**
     * 6. Conflict resolution (quick and fair)
     */
    hasConflictResolution: (governanceType: string): boolean => {
      return true; // All societies have SOME mechanism
    },

    /**
     * 7. Self-determination (external authorities don't interfere)
     */
    hasSelfDetermination: (externalPressure: number): boolean => {
      return externalPressure < 0.3;
    },

    /**
     * 8. Nested enterprises (for large systems)
     */
    hasNestedEnterprises: (populationSize: number): boolean => {
      return populationSize > 1000;
    },
  },

  /**
   * Commons success probability
   * Count how many Ostrom principles are met
   */
  successProbability: (principlesMet: number): number => {
    return Math.min(1.0, principlesMet / 8);
  },
};

/**
 * Public Goods Games
 * Cooperation in group settings
 */
export const PublicGoodsTheory = {
  /**
   * Should contribute to public good?
   *
   * Contribution benefits everyone equally
   * But costs only contributor
   */
  shouldContribute: (
    contributionCost: number,
    totalBenefit: number,
    groupSize: number,
    punishmentProbability: number,
    punishmentSeverity: number
  ): boolean => {
    const individualBenefit = totalBenefit / groupSize;
    const expectedPunishment = punishmentProbability * punishmentSeverity;

    // Contribute if: Benefit + Avoided Punishment > Cost
    return individualBenefit + expectedPunishment > contributionCost;
  },

  /**
   * Altruistic punishment
   * Punish free-riders even at personal cost?
   *
   * Evolves in large groups to maintain cooperation
   */
  shouldPunish: (
    punishmentCost: number,
    damageToPunished: number,
    groupBenefit: number,
    groupSize: number
  ): boolean => {
    // Second-order problem: Punishing costs you but benefits group
    const individualShareOfBenefit = groupBenefit / groupSize;
    return damageToPunished * individualShareOfBenefit > punishmentCost * 2;
  },
};

/**
 * Signaling Theory
 * Zahavi (1975) "Mate selection—A selection for a handicap"
 */
export const SignalingTheory = {
  /**
   * Costly signaling: Honest signals must be costly
   *
   * Signal is honest if:
   * - High-quality individuals can afford it
   * - Low-quality individuals cannot fake it
   */
  isHonestSignal: (signalCost: number, individualQuality: number, fakingCost: number): boolean => {
    // High quality: Can afford signal
    const canAfford = individualQuality * 0.2 > signalCost; // <20% of resources

    // Low quality cannot fake
    const cannotFake = fakingCost > individualQuality * 0.5; // >50% of resources

    return canAfford && cannotFake;
  },

  /**
   * Handicap principle
   * Signal must reduce survival/reproduction to be honest
   *
   * Peacock tail: Heavy, conspicuous, reduces survival
   * But signals genetic quality
   */
  handicapStrength: (
    survivalReduction: number, // 0-1
    attractivenessGain: number // 0-1
  ): number => {
    // Trade-off: lose survival, gain mates
    return attractivenessGain - survivalReduction;
  },
};

/**
 * Complete game theory laws
 */
export const GameTheoryLaws = {
  cooperation: CooperationTheory,
  ess: ESS,
  commons: CommonsTheory,
  publicGoods: PublicGoodsTheory,
  signaling: SignalingTheory,
} as const;
