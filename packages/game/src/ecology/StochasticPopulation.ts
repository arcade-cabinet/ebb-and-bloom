/**
 * Stochastic Population Dynamics
 * 
 * Implements stochastic differential equations for more realistic populations.
 * Includes:
 * - Stochastic Lotka-Volterra (predator-prey with noise)
 * - Environmental stochasticity (random fluctuations)
 * - Demographic stochasticity (birth/death randomness)
 */

import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { LAWS } from '../laws/index.js';

export interface PopulationState {
  species: string;
  count: number;
  mass: number; // kg
  metabolicRate: number; // W
  trophicLevel: number;
}

export interface StochasticParams {
  // Deterministic parameters
  birthRate: number;
  deathRate: number;
  predationRate?: number;
  
  // Stochastic parameters (noise strength)
  environmentalNoise: number; // σ_env
  demographicNoise: number; // σ_demo
}

/**
 * Stochastic Lotka-Volterra system
 * dN = (α*N - β*N*P) dt + σ_env*N dW_1 + σ_demo*√N dW_2
 * dP = (δ*N*P - γ*P) dt + σ_env*P dW_3 + σ_demo*√P dW_4
 */
export class StochasticPopulationDynamics {
  private rng: EnhancedRNG;
  
  constructor(seed: string) {
    this.rng = new EnhancedRNG(seed);
  }
  
  /**
   * Stochastic predator-prey dynamics (Euler-Maruyama method)
   */
  stepPredatorPrey(
    prey: number,
    predator: number,
    params: {
      alpha: number;      // Prey birth rate
      beta: number;       // Predation rate
      delta: number;      // Predator efficiency
      gamma: number;      // Predator death rate
      sigmaEnv: number;   // Environmental noise
      sigmaDemog: number; // Demographic noise
    },
    dt: number
  ): { prey: number; predator: number } {
    
    // Deterministic part
    const dN_det = (params.alpha * prey - params.beta * prey * predator) * dt;
    const dP_det = (params.delta * prey * predator - params.gamma * predator) * dt;
    
    // Stochastic part - Environmental noise (affects all individuals)
    const dW1 = this.rng.normal(0, Math.sqrt(dt));
    const dW2 = this.rng.normal(0, Math.sqrt(dt));
    
    const dN_env = params.sigmaEnv * prey * dW1;
    const dP_env = params.sigmaEnv * predator * dW2;
    
    // Demographic noise (random birth/death events, scales with √N)
    const dW3 = this.rng.normal(0, Math.sqrt(dt));
    const dW4 = this.rng.normal(0, Math.sqrt(dt));
    
    const dN_demo = params.sigmaDemog * Math.sqrt(Math.max(1, prey)) * dW3;
    const dP_demo = params.sigmaDemog * Math.sqrt(Math.max(1, predator)) * dW4;
    
    // Total change
    const newPrey = Math.max(0, prey + dN_det + dN_env + dN_demo);
    const newPredator = Math.max(0, predator + dP_det + dP_env + dP_demo);
    
    return { prey: newPrey, predator: newPredator };
  }
  
  /**
   * Multi-species stochastic competition
   * dN_i/dt = r_i * N_i * (K_i - Σ(α_ij * N_j)) / K_i + noise
   */
  stepCompetition(
    populations: number[],
    params: {
      growthRates: number[];        // r_i
      carryingCapacities: number[]; // K_i
      competitionMatrix: number[][]; // α_ij (how species j affects species i)
      sigmaEnv: number;
      sigmaDemog: number;
    },
    dt: number
  ): number[] {
    
    const newPops = populations.map((N_i, i) => {
      const r_i = params.growthRates[i];
      const K_i = params.carryingCapacities[i];
      
      // Competition term: Σ(α_ij * N_j)
      const competition = populations.reduce((sum, N_j, j) => {
        return sum + params.competitionMatrix[i][j] * N_j;
      }, 0);
      
      // Deterministic growth
      const growth = r_i * N_i * (K_i - competition) / K_i;
      const dN_det = growth * dt;
      
      // Environmental noise
      const dW1 = this.rng.normal(0, Math.sqrt(dt));
      const dN_env = params.sigmaEnv * N_i * dW1;
      
      // Demographic noise
      const dW2 = this.rng.normal(0, Math.sqrt(dt));
      const dN_demo = params.sigmaDemog * Math.sqrt(Math.max(1, N_i)) * dW2;
      
      return Math.max(0, N_i + dN_det + dN_env + dN_demo);
    });
    
    return newPops;
  }
  
  /**
   * Stochastic birth-death process (Gillespie algorithm)
   * Exact stochastic simulation for small populations
   */
  gillespie(
    initialPop: number,
    birthRate: number,
    deathRate: number,
    maxTime: number
  ): { time: number; population: number }[] {
    
    const trajectory: { time: number; population: number }[] = [];
    let pop = initialPop;
    let time = 0;
    
    trajectory.push({ time, population: pop });
    
    while (time < maxTime && pop > 0) {
      // Total rate
      const birthPropensity = birthRate * pop;
      const deathPropensity = deathRate * pop;
      const totalRate = birthPropensity + deathPropensity;
      
      if (totalRate === 0) break;
      
      // Time to next event (exponential distribution)
      const tau = this.rng.exponential(totalRate);
      time += tau;
      
      if (time > maxTime) break;
      
      // Which event?
      const r = this.rng.uniform();
      if (r < birthPropensity / totalRate) {
        pop++; // Birth
      } else {
        pop--; // Death
      }
      
      trajectory.push({ time, population: pop });
    }
    
    return trajectory;
  }
  
  /**
   * Calculate quasi-stationary distribution for extinction-prone populations
   */
  quasiStationaryDistribution(
    birthRate: number,
    deathRate: number,
    carryingCapacity: number,
    samples: number = 1000
  ): number[] {
    
    const distribution = new Array(carryingCapacity + 1).fill(0);
    
    // Run many short simulations
    for (let i = 0; i < samples; i++) {
      const initialPop = Math.floor(this.rng.uniform() * carryingCapacity);
      const trajectory = this.gillespie(initialPop, birthRate, deathRate, 10);
      
      // Sample from trajectory
      if (trajectory.length > 0) {
        const sample = this.rng.choice(trajectory);
        if (sample.population <= carryingCapacity) {
          distribution[sample.population]++;
        }
      }
    }
    
    // Normalize
    const total = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(x => x / total);
  }
  
  /**
   * Environmental catastrophe (rare event)
   * Returns survival fraction
   */
  catastrophe(
    population: number,
    severity: number // 0-1
  ): number {
    // Survivors follow binomial distribution
    // p = 1 - severity
    const survivalProb = 1 - severity;
    let survivors = 0;
    
    for (let i = 0; i < population; i++) {
      if (this.rng.uniform() < survivalProb) {
        survivors++;
      }
    }
    
    return survivors;
  }
  
  /**
   * Calculate extinction probability (approximation)
   */
  extinctionProbability(
    population: number,
    birthRate: number,
    deathRate: number
  ): number {
    
    if (birthRate >= deathRate) {
      // Supercritical: low extinction risk
      return Math.pow(deathRate / birthRate, population);
    } else {
      // Subcritical: certain extinction eventually
      return 1.0;
    }
  }
  
  /**
   * Allee effect (populations below threshold decline)
   */
  alleeEffect(
    population: number,
    threshold: number,
    maxGrowthRate: number,
    carryingCapacity: number
  ): number {
    
    // Growth rate is low below threshold
    const alleeModifier = population < threshold 
      ? (population / threshold) 
      : 1.0;
    
    // Logistic growth with Allee effect
    const growthRate = maxGrowthRate * alleeModifier * (1 - population / carryingCapacity);
    
    return growthRate;
  }
}

/**
 * Population viability analysis
 */
export class PopulationViabilityAnalysis {
  private dynamics: StochasticPopulationDynamics;
  
  constructor(seed: string) {
    this.dynamics = new StochasticPopulationDynamics(seed);
  }
  
  /**
   * Run Monte Carlo simulations to estimate extinction risk
   */
  estimateExtinctionRisk(
    initialPopulation: number,
    params: StochasticParams,
    timeHorizon: number,
    numSimulations: number = 1000
  ): {
    extinctionProbability: number;
    meanPopulation: number;
    medianTimeToExtinction: number | null;
  } {
    
    let extinctions = 0;
    let sumPopulation = 0;
    const extinctionTimes: number[] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let pop = initialPopulation;
      let time = 0;
      const dt = 0.1; // Time step
      
      while (time < timeHorizon && pop > 0) {
        // Simple stochastic growth
        const growth = (params.birthRate - params.deathRate) * pop * dt;
        const noise = params.environmentalNoise * pop * this.dynamics['rng'].normal(0, Math.sqrt(dt));
        
        pop = Math.max(0, pop + growth + noise);
        time += dt;
      }
      
      if (pop === 0) {
        extinctions++;
        extinctionTimes.push(time);
      }
      
      sumPopulation += pop;
    }
    
    const extinctionProbability = extinctions / numSimulations;
    const meanPopulation = sumPopulation / numSimulations;
    
    extinctionTimes.sort((a, b) => a - b);
    const medianTimeToExtinction = extinctionTimes.length > 0 
      ? extinctionTimes[Math.floor(extinctionTimes.length / 2)]
      : null;
    
    return {
      extinctionProbability,
      meanPopulation,
      medianTimeToExtinction,
    };
  }
  
  /**
   * Calculate minimum viable population (MVP)
   */
  minimumViablePopulation(
    params: StochasticParams,
    targetExtinctionProb: number = 0.05, // 5% over 100 years
    timeHorizon: number = 100
  ): number {
    
    // Binary search for MVP
    let low = 10;
    let high = 10000;
    
    while (high - low > 10) {
      const mid = Math.floor((low + high) / 2);
      const result = this.estimateExtinctionRisk(mid, params, timeHorizon, 200);
      
      if (result.extinctionProbability > targetExtinctionProb) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return high;
  }
}

/**
 * Helper: Generate stochastic parameters from ecological traits
 */
export function generateStochasticParams(
  species: { mass: number; trophicLevel: number; metabolism: number },
  environment: { productivity: number; variability: number }
): StochasticParams {
  
  // Birth/death rates from life history
  const lifespan = LAWS.biology.allometry.maxLifespan(species.mass);
  const generationTime = LAWS.biology.allometry.generationTime(species.mass);
  
  const birthRate = 1 / generationTime; // births per year
  const deathRate = 1 / lifespan; // natural death rate
  
  // Environmental noise from climate variability
  const environmentalNoise = 0.1 * environment.variability; // 10% * variability
  
  // Demographic noise (stronger for small populations)
  const demographicNoise = 0.5 / Math.sqrt(species.mass); // Scales with 1/√mass
  
  return {
    birthRate,
    deathRate,
    environmentalNoise,
    demographicNoise,
  };
}
