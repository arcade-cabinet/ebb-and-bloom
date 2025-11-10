/**
 * Complexity Theory
 *
 * How simple rules → complex systems
 * Emergence, self-organization, criticality
 *
 * THE META-LAWS that explain how all other laws combine.
 */

export const Emergence = {
  /**
   * Emergent complexity from component interactions
   * C = N × log(I)
   *
   * Where N = components, I = interactions per component
   */
  complexity: (componentCount: number, interactionsPerComponent: number): number => {
    return componentCount * Math.log(interactionsPerComponent + 1);
  },

  /**
   * Is property emergent?
   * Can't predict from components alone
   */
  isEmergent: (componentProperties: any[], systemProperty: any): boolean => {
    // Simplified: Emergent if system property not in any component
    return !componentProperties.some((p) => p === systemProperty);
  },

  /**
   * Emergence threshold
   * Below this, system is simple sum of parts
   * Above this, system has emergent properties
   */
  emergenceThreshold: (componentCount: number): number => {
    return Math.log2(componentCount); // Log scaling
  },
};

export const SelfOrganization = {
  /**
   * Bénard cells, flocking, pattern formation
   * Emerges from local rules + feedback
   */
  patternFormationProbability: (
    localInteractionStrength: number,
    feedbackDelay: number,
    noise: number
  ): number => {
    // Strong interaction + fast feedback + low noise = patterns
    return localInteractionStrength / (1 + feedbackDelay + noise);
  },

  /**
   * Collective behavior emergence
   * Flocking, schooling, herding
   */
  collectiveBehaviorThreshold: (individualCount: number): number => {
    return 7; // ~7 individuals minimum for collective behavior
  },
};

export const SelfOrganizedCriticality = {
  /**
   * Power law distributions
   * P(x) ∝ x^-α
   *
   * Seen in: Earthquakes, avalanches, extinctions, city sizes
   */
  powerLawExponent: (systemType: string): number => {
    const exponents: Record<string, number> = {
      earthquakes: 2.0, // Gutenberg-Richter law
      extinctions: 2.0, // Mass extinction sizes
      citySizes: 1.0, // Zipf's law (rank-size)
      wealth: 1.7, // Pareto distribution
      forestFires: 1.5,
    };
    return exponents[systemType] || 2.0;
  },

  /**
   * Is system at critical point?
   * Balance between order and chaos
   */
  isCritical: (orderParameter: number): boolean => {
    // Critical point usually around 0.5
    return Math.abs(orderParameter - 0.5) < 0.1;
  },

  /**
   * Avalanche size distribution
   * Power law with exponential cutoff
   */
  avalancheSize: (trigger: number, systemSize: number, alpha: number): number => {
    const powerLaw = Math.pow(trigger, -alpha);
    const cutoff = Math.exp(-trigger / systemSize);
    return powerLaw * cutoff;
  },
};

export const PhaseTransitions = {
  /**
   * Critical transitions (tipping points)
   * System suddenly shifts to new state
   */
  criticalSlowing: (controlParameter: number, criticalValue: number): number => {
    // As system approaches critical point, recovery slows
    const distance = Math.abs(controlParameter - criticalValue);
    return 1 / distance; // Diverges at critical point
  },

  /**
   * Hysteresis width
   * System shows different behavior going up vs down
   */
  hysteresisWidth: (bistabilityStrength: number): number => {
    return 0.2 * bistabilityStrength; // Rough estimate
  },

  /**
   * Early warning signals
   * Variance increases before critical transition
   */
  varianceBeforeCrisis: (currentVariance: number, historicalVariance: number): boolean => {
    return currentVariance > historicalVariance * 2; // 2x increase = warning
  },
};

export const ComplexityLaws = {
  emergence: Emergence,
  selfOrganization: SelfOrganization,
  criticality: SelfOrganizedCriticality,
  phaseTransitions: PhaseTransitions,
} as const;
