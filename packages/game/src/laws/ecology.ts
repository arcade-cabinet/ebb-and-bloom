/**
 * Ecological Laws
 * 
 * Laws governing populations, carrying capacity, trophic dynamics,
 * and species interactions.
 */

import { BiologicalLaws } from './biology.js';

/**
 * Carrying Capacity
 * Maximum population sustainable by available resources
 */
export const CarryingCapacity = {
  /**
   * Calculate carrying capacity from primary productivity
   * 
   * K = (Primary Productivity × Trophic Efficiency) / Individual Energy Needs
   */
  calculate: (
    primaryProductivity: number, // kJ/km²/year
    trophicLevel: number, // 1 = herbivore, 2 = carnivore, etc.
    individualMetabolicRate: number // W
  ): number => {
    // Trophic efficiency (10% rule)
    const efficiency = Math.pow(0.1, trophicLevel - 1);
    
    // Available energy at this trophic level
    const availableEnergy = primaryProductivity * efficiency; // kJ/km²/year
    
    // Individual energy needs per year
    const individualNeed = individualMetabolicRate * 31536000 / 1000; // kJ/year
    
    return availableEnergy / individualNeed; // individuals/km²
  },
  
  /**
   * Primary productivity from environmental factors
   */
  primaryProductivity: (
    temperature: number, // K
    rainfall: number, // mm/year
    sunlight: number // W/m² average
  ): number => {
    // Simplified Miami model
    // NPP increases with temperature and rainfall (to a point)
    
    const tempOptimum = 298; // 25°C
    const tempFactor = Math.exp(-Math.pow((temperature - tempOptimum) / 15, 2));
    
    const rainFactor = Math.min(1, rainfall / 1500); // Saturates at 1500mm
    
    const sunFactor = sunlight / 250; // Normalize to Earth average
    
    // Base productivity: tropical rainforest ≈ 2000 g C/m²/year ≈ 8e7 kJ/km²/year
    const maxProductivity = 8e7;
    
    return maxProductivity * tempFactor * rainFactor * sunFactor;
  },
  
  /**
   * Logistic growth equation
   * dN/dt = r * N * (1 - N/K)
   */
  logisticGrowth: (
    currentPopulation: number,
    carryingCapacity: number,
    growthRate: number,
    dt: number
  ): number => {
    const dN = growthRate * currentPopulation * (1 - currentPopulation / carryingCapacity) * dt;
    return currentPopulation + dN;
  },
};

/**
 * Lotka-Volterra Equations
 * Predator-prey dynamics
 */
export const PredatorPreyDynamics = {
  /**
   * Prey population change
   * dN_prey/dt = α*N_prey - β*N_prey*N_predator
   */
  preyGrowth: (
    preyPopulation: number,
    predatorPopulation: number,
    birthRate: number, // α
    predationRate: number, // β
    dt: number
  ): number => {
    const dN = (birthRate * preyPopulation - predationRate * preyPopulation * predatorPopulation) * dt;
    return preyPopulation + dN;
  },
  
  /**
   * Predator population change
   * dN_predator/dt = δ*N_prey*N_predator - γ*N_predator
   */
  predatorGrowth: (
    preyPopulation: number,
    predatorPopulation: number,
    conversionRate: number, // δ (prey → predator biomass)
    deathRate: number, // γ
    dt: number
  ): number => {
    const dN = (conversionRate * preyPopulation * predatorPopulation - deathRate * predatorPopulation) * dt;
    return predatorPopulation + dN;
  },
  
  /**
   * Equilibrium populations
   */
  equilibrium: (
    birthRate: number,
    predationRate: number,
    conversionRate: number,
    deathRate: number
  ): { prey: number; predator: number } => {
    return {
      prey: deathRate / conversionRate,
      predator: birthRate / predationRate,
    };
  },
};

/**
 * Competitive Exclusion Principle
 * Two species competing for the same niche cannot coexist
 */
export const Competition = {
  /**
   * Lotka-Volterra competition equations
   * dN1/dt = r1*N1*(K1 - N1 - α12*N2)/K1
   */
  competitiveGrowth: (
    species1Pop: number,
    species2Pop: number,
    species1K: number,
    species1r: number,
    competitionCoeff: number, // α12
    dt: number
  ): number => {
    const dN = species1r * species1Pop * (species1K - species1Pop - competitionCoeff * species2Pop) / species1K * dt;
    return species1Pop + dN;
  },
  
  /**
   * Who wins competition?
   */
  competitiveOutcome: (
    species1K: number,
    species2K: number,
    alpha12: number, // effect of sp2 on sp1
    alpha21: number  // effect of sp1 on sp2
  ): string => {
    if (species1K > species2K * alpha12 && species2K > species1K * alpha21) {
      return 'coexistence'; // Stable coexistence
    }
    if (species1K > species2K * alpha12) {
      return 'species1_wins';
    }
    if (species2K > species1K * alpha21) {
      return 'species2_wins';
    }
    return 'unstable'; // Outcome depends on initial conditions
  },
  
  /**
   * Niche differentiation required for coexistence
   */
  nicheOverlap: (
    dietOverlap: number, // 0-1
    habitatOverlap: number, // 0-1
    temporalOverlap: number // 0-1
  ): number => {
    return (dietOverlap + habitatOverlap + temporalOverlap) / 3;
  },
  
  /**
   * Can species coexist?
   */
  canCoexist: (nicheOverlap: number): boolean => {
    return nicheOverlap < 0.7; // Rule of thumb
  },
};

/**
 * Island Biogeography
 * Species richness on "islands" (habitat patches)
 */
export const IslandBiogeography = {
  /**
   * Species-Area Relationship
   * S = c * A^z
   * where S = species count, A = area, z ≈ 0.25
   */
  speciesRichness: (area_km2: number, c: number = 10, z: number = 0.25): number => {
    return Math.floor(c * Math.pow(area_km2, z));
  },
  
  /**
   * Distance effect on colonization
   */
  colonizationRate: (distanceToSource_km: number, maxColonizationRate: number = 1): number => {
    return maxColonizationRate * Math.exp(-distanceToSource_km / 100);
  },
  
  /**
   * Extinction rate increases as species count increases
   */
  extinctionRate: (speciesCount: number, area_km2: number): number => {
    const baseExtinction = 0.01; // per species per year
    return baseExtinction * speciesCount / area_km2;
  },
};

/**
 * Trophic Relationships
 */
export const TrophicDynamics = {
  /**
   * Trophic efficiency (10% rule)
   * Only ~10% of energy transfers between trophic levels
   */
  TROPHIC_EFFICIENCY: 0.1,
  
  /**
   * Biomass pyramid
   * Biomass at each level
   */
  biomassByLevel: (primaryProduction: number, level: number): number => {
    return primaryProduction * Math.pow(TrophicDynamics.TROPHIC_EFFICIENCY, level - 1);
  },
  
  /**
   * Number of trophic levels sustainable
   */
  maxTrophicLevels: (primaryProduction: number, minimumBiomass: number = 100): number => {
    let level = 1;
    while (TrophicDynamics.biomassByLevel(primaryProduction, level) > minimumBiomass) {
      level++;
    }
    return level - 1;
  },
  
  /**
   * Predator-prey mass ratio
   * Predators typically 10-100x larger than prey
   */
  predatorPreyMassRatio: (diet: string): number => {
    if (diet === 'piscivore') return 10; // Fish eating fish
    if (diet === 'insectivore') return 100; // Birds eating insects
    return 50; // General carnivore
  },
  
  /**
   * Calculate sustainable predator population
   */
  sustainablePredators: (
    preyPopulation: number,
    preyMass: number,
    predatorMass: number,
    killRate: number // prey killed per predator per year
  ): number => {
    // Predators can't eat more than prey reproduction allows
    const preyReproductionRate = 0.3; // 30% population growth per year (rough)
    const availablePrey = preyPopulation * preyReproductionRate;
    return Math.floor(availablePrey / killRate);
  },
};

/**
 * Territory and Home Range
 */
export const TerritoryLaws = {
  /**
   * Home range scaling (from allometry)
   */
  homeRangeSize: (mass_kg: number, diet: string): number => {
    const trophicLevel = diet === 'herbivore' ? 1 : 2;
    return BiologicalLaws.allometry.homeRange(mass_kg, trophicLevel);
  },
  
  /**
   * Territory defense
   * Defend if: Benefits > Costs
   */
  shouldDefendTerritory: (
    resourceValue: number,
    resourceDistribution: 'patchy' | 'uniform' | 'concentrated',
    intruderPressure: number
  ): boolean => {
    // Concentrated resources are worth defending
    if (resourceDistribution === 'concentrated' && resourceValue > 0.5) return true;
    
    // Patchy resources are hard to defend
    if (resourceDistribution === 'patchy') return false;
    
    // High value + high pressure = worth defending
    return resourceValue * intruderPressure > 0.3;
  },
  
  /**
   * Population density from territory size
   */
  densityFromTerritory: (territorySize_km2: number): number => {
    return 1 / territorySize_km2; // individuals per km²
  },
};

/**
 * Complete ecological laws
 */
export const EcologicalLaws = {
  carryingCapacity: CarryingCapacity,
  predatorPrey: PredatorPreyDynamics,
  competition: Competition,
  island: IslandBiogeography,
  trophic: TrophicDynamics,
  territory: TerritoryLaws,
} as const;
