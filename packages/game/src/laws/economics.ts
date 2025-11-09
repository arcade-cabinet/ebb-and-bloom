/**
 * Economic Laws
 *
 * Ricardo, Smith, Marshall, modern economics.
 * Supply, demand, trade, specialization, growth.
 */

/**
 * Comparative Advantage
 * Ricardo (1817) "On the Principles of Political Economy and Taxation"
 */
export const ComparativeAdvantage = {
  /**
   * Should two parties trade?
   *
   * Trade benefits both if they have different opportunity costs
   */
  shouldTrade: (
    party1ProductionA: number, // Units of A that party 1 can produce
    party1ProductionB: number,
    party2ProductionA: number,
    party2ProductionB: number
  ): boolean => {
    // Opportunity cost of A in terms of B
    const party1OpportunityCost = party1ProductionB / party1ProductionA;
    const party2OpportunityCost = party2ProductionB / party2ProductionA;

    // Trade if opportunity costs differ
    return Math.abs(party1OpportunityCost - party2OpportunityCost) > 0.1;
  },

  /**
   * Optimal specialization
   * Specialize in what you're RELATIVELY better at
   */
  optimalSpecialization: (
    selfEfficiency_A: number,
    selfEfficiency_B: number,
    partnerEfficiency_A: number,
    partnerEfficiency_B: number
  ): 'A' | 'B' | 'both' => {
    const selfRatio = selfEfficiency_A / selfEfficiency_B;
    const partnerRatio = partnerEfficiency_A / partnerEfficiency_B;

    if (selfRatio > partnerRatio * 1.2) return 'A';
    if (selfRatio < partnerRatio / 1.2) return 'B';
    return 'both'; // No strong advantage
  },

  /**
   * Gains from trade
   * Both parties benefit
   */
  gainsFromTrade: (
    beforeTrade_A: number,
    beforeTrade_B: number,
    afterTrade_A: number,
    afterTrade_B: number
  ): number => {
    const utilityBefore = beforeTrade_A * beforeTrade_B; // Cobb-Douglas utility
    const utilityAfter = afterTrade_A * afterTrade_B;
    return utilityAfter - utilityBefore;
  },
};

/**
 * Supply and Demand
 * Marshall (1890) "Principles of Economics"
 */
export const SupplyDemand = {
  /**
   * Demand curve (downward sloping)
   * Q_d = a - b × P
   */
  demandQuantity: (price: number, a: number, b: number): number => {
    return Math.max(0, a - b * price);
  },

  /**
   * Supply curve (upward sloping)
   * Q_s = c + d × P
   */
  supplyQuantity: (price: number, c: number, d: number): number => {
    return Math.max(0, c + d * price);
  },

  /**
   * Equilibrium price
   * Set Q_d = Q_s and solve for P
   *
   * P* = (a - c) / (b + d)
   */
  equilibriumPrice: (a: number, b: number, c: number, d: number): number => {
    return (a - c) / (b + d);
  },

  /**
   * Equilibrium quantity
   */
  equilibriumQuantity: (equilibriumPrice: number, a: number, b: number): number => {
    return a - b * equilibriumPrice;
  },

  /**
   * Price elasticity of demand
   * ε = (dQ/dP) × (P/Q)
   *
   * |ε| > 1: Elastic (luxury goods)
   * |ε| < 1: Inelastic (necessities)
   */
  priceElasticity: (price: number, quantity: number, b: number): number => {
    return -((b * price) / quantity); // Negative (inverse relationship)
  },
};

/**
 * Metcalfe's Law
 * Network effects in communication/trade networks
 */
export const NetworkEffects = {
  /**
   * Network value ∝ n²
   * (or n × (n-1)/2 for connections)
   *
   * Each new participant adds value to ALL existing participants
   */
  networkValue: (numberOfNodes: number): number => {
    return (numberOfNodes * (numberOfNodes - 1)) / 2;
  },

  /**
   * Critical mass for network
   * Below this, network collapses
   * Above this, network grows
   */
  criticalMass: (fixedCost: number, marginalBenefit: number): number => {
    return Math.ceil(Math.sqrt(fixedCost / marginalBenefit));
  },

  /**
   * Value per participant
   * V_i = k × (n - 1)
   */
  valuePerNode: (totalNodes: number, valuePerConnection: number): number => {
    return valuePerConnection * (totalNodes - 1);
  },
};

/**
 * Division of Labor
 * Smith (1776) "The Wealth of Nations"
 */
export const DivisionOfLabor = {
  /**
   * Productivity from specialization
   * Smith's pin factory: 10x - 240x improvement from division of labor
   *
   * Productivity ∝ log(specialization)
   */
  productivityGain: (numberOfSpecializations: number, taskComplexity: number): number => {
    const baseGain = Math.log2(numberOfSpecializations + 1);
    const complexityMultiplier = 1 + taskComplexity; // Complex tasks benefit more
    return baseGain * complexityMultiplier;
  },

  /**
   * Optimal number of specializations
   * Limited by:
   * - Market size (need buyers for each specialist)
   * - Coordination costs
   */
  optimalSpecializations: (marketSize: number, coordinationCost_perSpecialist: number): number => {
    // More specialists = higher productivity but higher coordination costs
    // Optimal where marginal benefit = marginal cost
    return Math.floor(Math.sqrt(marketSize / coordinationCost_perSpecialist));
  },

  /**
   * Can support specialist?
   * Need enough demand for their output
   */
  canSupportSpecialist: (
    populationSize: number,
    demandPerCapita_perYear: number,
    specialistOutput_perYear: number
  ): boolean => {
    const totalDemand = populationSize * demandPerCapita_perYear;
    return totalDemand >= specialistOutput_perYear;
  },
};

/**
 * Economic Growth
 * Solow model and endogenous growth theory
 */
export const EconomicGrowth = {
  /**
   * Solow growth model (exogenous technology)
   * Y = A × K^α × L^(1-α)
   *
   * Where:
   * - Y = Output
   * - A = Technology level
   * - K = Capital stock
   * - L = Labor force
   * - α = Capital share (~0.33)
   */
  output: (
    technology: number,
    capital: number,
    labor: number,
    capitalShare: number = 0.33
  ): number => {
    return technology * Math.pow(capital, capitalShare) * Math.pow(labor, 1 - capitalShare);
  },

  /**
   * Steady-state capital per worker
   * k* = (s / (n + δ))^(1/(1-α))
   *
   * Where:
   * - s = savings rate
   * - n = population growth
   * - δ = depreciation rate
   */
  steadyStateCapital: (
    savingsRate: number,
    populationGrowth_perYear: number,
    depreciationRate_perYear: number,
    capitalShare: number = 0.33
  ): number => {
    const denominator = populationGrowth_perYear + depreciationRate_perYear;
    return Math.pow(savingsRate / denominator, 1 / (1 - capitalShare));
  },

  /**
   * Technological progress (endogenous)
   * dA/dt = ζ × L_R
   *
   * Where:
   * - ζ = Research productivity
   * - L_R = Number of researchers
   */
  technologyGrowth: (numberOfResearchers: number, researchProductivity: number): number => {
    return researchProductivity * numberOfResearchers; // per year
  },

  /**
   * Convergence to steady state
   * Poor societies grow faster (catch-up effect)
   */
  growthRate: (
    currentCapital: number,
    steadyStateCapital: number,
    convergenceSpeed: number = 0.02
  ): number => {
    return (convergenceSpeed * (steadyStateCapital - currentCapital)) / currentCapital;
  },
};

/**
 * Labor Economics
 * Wages, employment, human capital
 */
export const LaborEconomics = {
  /**
   * Marginal product of labor
   * MPL = ∂Y/∂L
   *
   * Diminishing returns: Each additional worker adds less
   */
  marginalProduct: (
    currentLabor: number,
    capital: number,
    technology: number,
    capitalShare: number = 0.33
  ): number => {
    const laborShare = 1 - capitalShare;
    return (
      technology *
      Math.pow(capital, capitalShare) *
      laborShare *
      Math.pow(currentLabor, laborShare - 1)
    );
  },

  /**
   * Equilibrium wage
   * W* = MPL (wage equals marginal product)
   */
  equilibriumWage: (labor: number, capital: number, technology: number): number => {
    return LaborEconomics.marginalProduct(labor, capital, technology);
  },

  /**
   * Human capital accumulation
   * Learning by doing: Productivity increases with experience
   *
   * h(t) = h_0 × (1 + g × t)
   */
  humanCapital: (
    initialSkill: number,
    yearsExperience: number,
    learningRate: number = 0.05
  ): number => {
    return initialSkill * (1 + learningRate * yearsExperience);
  },
};

/**
 * Complete economics laws
 */
export const EconomicsLaws = {
  comparativeAdvantage: ComparativeAdvantage,
  supplyDemand: SupplyDemand,
  networks: NetworkEffects,
  divisionOfLabor: DivisionOfLabor,
  growth: EconomicGrowth,
  labor: LaborEconomics,
} as const;
