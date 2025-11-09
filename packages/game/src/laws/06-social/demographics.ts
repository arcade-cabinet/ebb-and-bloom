/**
 * Demographic Laws
 * Population pyramids, age structure, dependency ratios, migration.
 */

export const PopulationStructure = {
  ageDistribution: (birthRate: number, deathRate: number, lifeExpectancy: number) => {
    const growthRate = birthRate - deathRate;
    const medianAge = lifeExpectancy / (2 + growthRate * 10);
    return { median: medianAge, growth: growthRate };
  },
  
  dependencyRatio: (under15_percent: number, over65_percent: number): number => {
    const working = 100 - under15_percent - over65_percent;
    return (under15_percent + over65_percent) / working;
  },
  
  replacementRate: 2.1, // Births per woman for stable population
};

export const MigrationTheory = {
  pushFactors: (poverty: number, conflict: number, disaster: number): number => {
    return (poverty + conflict + disaster) / 3;
  },
  
  pullFactors: (opportunity: number, safety: number, network: number): number => {
    return (opportunity + safety + network) / 3;
  },
  
  migrationProbability: (push: number, pull: number, distance_km: number): number => {
    const motivation = pull - push;
    const distancePenalty = Math.exp(-distance_km / 1000);
    return Math.max(0, motivation * distancePenalty);
  },
  
  gravityModel: (pop1: number, pop2: number, distance_km: number): number => {
    return (pop1 * pop2) / Math.pow(distance_km, 2);
  },
};

export const DemographicTransition = {
  stage1_highBoth: { birth: 40, death: 35, growth: 0.5 },
  stage2_fallingDeath: { birth: 40, death: 15, growth: 2.5 },
  stage3_fallingBirth: { birth: 20, death: 10, growth: 1.0 },
  stage4_lowBoth: { birth: 12, death: 10, growth: 0.2 },
  stage5_declining: { birth: 10, death: 12, growth: -0.2 },
  
  predictStage: (gdpPerCapita: number, education: number, urbanization: number): number => {
    const development = (gdpPerCapita / 10000 + education + urbanization) / 3;
    if (development < 0.2) return 1;
    if (development < 0.4) return 2;
    if (development < 0.6) return 3;
    if (development < 0.8) return 4;
    return 5;
  },
};

export const DemographicsLaws = {
  structure: PopulationStructure,
  migration: MigrationTheory,
  transition: DemographicTransition,
} as const;

