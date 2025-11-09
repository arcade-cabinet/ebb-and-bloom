/**
 * Social Organization Laws
 *
 * Based on anthropological theories:
 * - Service's typology (Band, Tribe, Chiefdom, State)
 * - Fried's stratification theory
 * - Dunbar's number and cognitive limits
 * - Resource distribution and circumscription theories
 *
 * These are empirical regularities observed across human societies.
 */

/**
 * Service's Political Typology
 * Population size and resource surplus determine political organization
 */
export const ServiceTypology = {
  /**
   * Classify society type based on population and resources
   */
  classify: (
    population: number,
    density: number, // people per km²
    surplus: number // fraction of production beyond subsistence
  ): 'band' | 'tribe' | 'chiefdom' | 'state' => {
    // Band: Small, mobile, egalitarian
    if (population < 50 && density < 0.1) {
      return 'band';
    }

    // Tribe: Larger, segmentary, still relatively egalitarian
    if (population < 500 && surplus < 0.2) {
      return 'tribe';
    }

    // Chiefdom: Surplus + hierarchy + redistribution
    if (population < 5000 && surplus > 0.2) {
      return 'chiefdom';
    }

    // State: Large, bureaucratic, coercive
    return 'state';
  },

  /**
   * Leadership type for each society
   */
  leadershipType: (societyType: string): string => {
    const types = {
      band: 'informal_situational',
      tribe: 'big_man_or_council',
      chiefdom: 'hereditary_chief',
      state: 'monarch_or_ruling_class',
    };
    return types[societyType as keyof typeof types] || 'unknown';
  },

  /**
   * Decision-making process
   */
  decisionMaking: (societyType: string): string => {
    const processes = {
      band: 'consensus',
      tribe: 'council',
      chiefdom: 'chiefly_decree_with_consultation',
      state: 'hierarchical_bureaucratic',
    };
    return processes[societyType as keyof typeof processes] || 'unknown';
  },
};

/**
 * Dunbar's Number and Social Group Scaling
 * Cognitive limits constrain group size and structure
 */
export const SocialScaling = {
  /**
   * Dunbar's number: ~150
   * Maximum number of stable social relationships
   */
  DUNBARS_NUMBER: 150,

  /**
   * Hierarchical levels needed for population size
   * Based on Johnson's scalar stress theory
   */
  hierarchyLevels: (population: number): number => {
    if (population < 50) return 0; // No hierarchy (band)
    if (population < 150) return 1; // Minimal hierarchy
    if (population < 500) return 2; // Segmentary (tribe)
    if (population < 5000) return 3; // Chief + sub-chiefs

    // States: log scaling
    return 3 + Math.floor(Math.log2(population / 5000));
  },

  /**
   * Group size at each level (nested hierarchy)
   */
  groupSizeByLevel: (level: number): number => {
    // Dunbar's social group layers:
    // 5 (intimate), 15 (close friends), 50 (friends),
    // 150 (meaningful contacts), 500 (acquaintances), 1500 (faces you recognize)
    const sizes = [5, 15, 50, 150, 500, 1500];
    return sizes[Math.min(level, sizes.length - 1)];
  },

  /**
   * Can population function with consensus?
   */
  canUseConsensus: (population: number): boolean => {
    return population < SocialScaling.DUNBARS_NUMBER;
  },

  /**
   * Minimum group size for viability
   * Below this, genetic/demographic collapse risk
   */
  minimumViablePopulation: (): number => {
    return 50; // Minimum for genetic diversity
  },
};

/**
 * Inequality and Stratification
 * Gini coefficient and social classes
 */
export const SocialStratification = {
  /**
   * Calculate Gini coefficient
   * 0 = perfect equality, 1 = perfect inequality
   */
  giniCoefficient: (wealthDistribution: number[]): number => {
    const sorted = [...wealthDistribution].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sum += Math.abs(sorted[i] - sorted[j]);
      }
    }

    return sum / (2 * n * n * mean);
  },

  /**
   * Predict stratification from society type
   */
  stratificationLevel: (societyType: string): number => {
    const levels = {
      band: 0.0, // Egalitarian
      tribe: 0.2, // Prestige differences
      chiefdom: 0.4, // Hereditary ranks
      state: 0.6, // Rigid classes
    };
    return levels[societyType as keyof typeof levels] || 0;
  },

  /**
   * Generate class structure
   */
  classStructure: (
    societyType: string,
    population: number
  ): { name: string; fraction: number; wealth: number }[] => {
    if (societyType === 'band') {
      return [{ name: 'All members', fraction: 1.0, wealth: 1.0 }];
    }

    if (societyType === 'tribe') {
      return [
        { name: 'Big men / Elders', fraction: 0.1, wealth: 1.2 },
        { name: 'Common members', fraction: 0.9, wealth: 0.98 },
      ];
    }

    if (societyType === 'chiefdom') {
      return [
        { name: 'Chief lineage', fraction: 0.05, wealth: 2.0 },
        { name: 'Noble lineages', fraction: 0.15, wealth: 1.3 },
        { name: 'Commoners', fraction: 0.8, wealth: 0.85 },
      ];
    }

    // State
    return [
      { name: 'Ruling elite', fraction: 0.01, wealth: 40 },
      { name: 'Nobles / Officials', fraction: 0.05, wealth: 6 },
      { name: 'Craftspeople / Merchants', fraction: 0.14, wealth: 1.4 },
      { name: 'Peasants', fraction: 0.8, wealth: 0.125 },
    ];
  },
};

/**
 * Resource Distribution and Political Evolution
 * Carneiro's circumscription theory
 */
export const ResourcePolitics = {
  /**
   * Does resource distribution favor hierarchy?
   */
  favorsHierarchy: (
    resourceConcentration: number, // 0-1, how concentrated are resources
    surplus: number, // 0-1, production beyond subsistence
    circumscription: boolean // Are people geographically trapped?
  ): boolean => {
    // Need surplus + control + inability to escape
    return resourceConcentration > 0.5 && surplus > 0.2 && circumscription;
  },

  /**
   * Geographic circumscription
   * Can people leave if they don't like the chief?
   */
  isCircumscribed: (
    terrain: 'open' | 'valley' | 'island' | 'oasis',
    neighboringGroups: number,
    environmentalQuality: number // 0-1, outside quality vs. inside
  ): boolean => {
    // Valleys, islands, oases = physically bounded
    if (terrain === 'valley' || terrain === 'island' || terrain === 'oasis') {
      return true;
    }

    // Surrounded by hostile groups = social circumscription
    if (neighboringGroups > 3 && environmentalQuality < 0.5) {
      return true;
    }

    return false;
  },

  /**
   * Tribute extraction rate
   * How much can elite extract before rebellion?
   */
  maxTributeRate: (
    coerciveCapacity: number, // 0-1, military strength
    legitimacy: number, // 0-1, ideological acceptance
    surplus: number // 0-1, available surplus
  ): number => {
    // Can't extract more than surplus
    // Extraction limited by coercion and legitimacy
    return Math.min(surplus, (coerciveCapacity + legitimacy) / 2);
  },
};

/**
 * Conflict and Warfare
 */
export const ConflictLaws = {
  /**
   * Probability of warfare
   * Based on population pressure and resource scarcity
   */
  warfareProbability: (
    populationPressure: number, // population / carrying capacity
    resourceScarcity: number, // 0-1
    politicalComplexity: string
  ): number => {
    // Bands: low-level feuding
    if (politicalComplexity === 'band') {
      return 0.1 + resourceScarcity * 0.2;
    }

    // Tribes: higher warfare rates
    if (politicalComplexity === 'tribe') {
      return 0.3 + populationPressure * 0.4;
    }

    // Chiefdoms and states: organized warfare
    return 0.5 + populationPressure * 0.3 + resourceScarcity * 0.2;
  },

  /**
   * Military participation ratio
   * Fraction of population in military
   */
  militaryRatio: (politicalComplexity: string): number => {
    const ratios = {
      band: 0.3, // All adult males (no specialists)
      tribe: 0.2, // Warrior age grades
      chiefdom: 0.1, // Warrior class
      state: 0.05, // Professional army
    };
    return ratios[politicalComplexity as keyof typeof ratios] || 0.1;
  },

  /**
   * Casualty rate in warfare
   */
  casualtyRate: (
    weaponTechnology: number, // 1-10 scale
    politicalComplexity: string,
    warfareIntensity: number // 0-1
  ): number => {
    // Pre-state warfare often had high casualty rates (25% male deaths)
    // State warfare can be more or less deadly depending on technology

    if (politicalComplexity === 'band' || politicalComplexity === 'tribe') {
      return 0.15 * warfareIntensity; // Chronic low-level conflict
    }

    return 0.05 * weaponTechnology * warfareIntensity; // Episodic major battles
  },
};

/**
 * Specialization and Division of Labor
 */
export const DivisionOfLabor = {
  /**
   * Number of specialized roles
   */
  specializationCount: (
    population: number,
    surplus: number,
    politicalComplexity: string
  ): number => {
    if (politicalComplexity === 'band') {
      return 2; // By age and sex only
    }

    if (politicalComplexity === 'tribe') {
      return 5 + Math.floor(surplus * 5); // Part-time specialists
    }

    if (politicalComplexity === 'chiefdom') {
      return 10 + Math.floor(surplus * 20); // Full-time craftspeople
    }

    // State: extensive specialization
    return 20 + Math.floor(Math.log10(population) * 10);
  },

  /**
   * Can support full-time specialists?
   */
  canSupportSpecialists: (surplus: number, population: number): boolean => {
    // Need ~10% surplus to support non-food-producers
    return surplus > 0.1 && population > 100;
  },

  /**
   * Craft specialization emergence
   */
  emergingCrafts: (toolComplexity: number, surplus: number, tradeNetwork: boolean): string[] => {
    const crafts: string[] = [];

    if (toolComplexity >= 3) crafts.push('stone_knapping');
    if (toolComplexity >= 4 && surplus > 0.1) crafts.push('pottery');
    if (toolComplexity >= 5 && surplus > 0.15) crafts.push('weaving');
    if (toolComplexity >= 6) crafts.push('metallurgy');
    if (tradeNetwork) crafts.push('trading');
    if (surplus > 0.2) crafts.push('ritual_specialist');

    return crafts;
  },
};

/**
 * Complete social laws
 */
export const SocialLaws = {
  service: ServiceTypology,
  scaling: SocialScaling,
  stratification: SocialStratification,
  resources: ResourcePolitics,
  conflict: ConflictLaws,
  specialization: DivisionOfLabor,
} as const;
