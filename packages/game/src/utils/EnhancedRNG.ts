/**
 * Enhanced Random Number Generation
 * 
 * Uses seedrandom for deterministic randomness with string seeds.
 * Provides proper statistical distributions (normal, Poisson, exponential).
 * 
 * REVERTED FROM MERSENNE TWISTER: seedrandom is simpler, works with string seeds,
 * and is perfectly good quality for game generation. No overflow issues!
 */

import seedrandom from 'seedrandom';
import * as ss from 'simple-statistics';

/**
 * Enhanced RNG with statistical distributions
 */
export class EnhancedRNG {
  private rng: seedrandom.PRNG;
  
  constructor(seed: string) {
    // seedrandom accepts strings directly - no hash conversion needed!
    this.rng = seedrandom(seed);
    console.log('[EnhancedRNG] Initialized with seed:', seed);
  }
  
  /**
   * Uniform random [0, 1) or [min, max)
   */
  uniform(min?: number, max?: number): number {
    const value = this.rng();
    if (min === undefined || max === undefined) {
      return value;
    }
    return min + (value * (max - min));
  }
  
  /**
   * Uniform integer in range [min, max)
   */
  uniformInt(min: number, max: number): number {
    return Math.floor(this.uniform() * (max - min)) + min;
  }
  
  /**
   * Normal distribution (Gaussian) using Box-Muller transform
   * Mean = mu, Standard Deviation = sigma
   */
  normal(mu: number = 0, sigma: number = 1): number {
    // Box-Muller transform
    const u1 = this.rng();
    const u2 = this.rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma + mu;
  }
  
  /**
   * Poisson distribution
   * Used for discrete count data (offspring, events)
   */
  poisson(lambda: number): number {
    if (lambda < 0) return 0;
    
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= this.rng();
    } while (p > L);
    
    return k - 1;
  }
  
  /**
   * Exponential distribution
   * Used for time between events
   */
  exponential(rate: number): number {
    return -Math.log(1 - this.rng()) / rate;
  }
  
  /**
   * Power law distribution (for IMF, etc.)
   * p(x) ∝ x^(-alpha)
   */
  powerLaw(alpha: number, xMin: number, xMax: number): number {
    const u = this.rng();
    const beta = alpha - 1;
    
    if (Math.abs(beta) < 1e-10) {
      // alpha ≈ 1, use logarithmic
      return xMin * Math.exp(u * Math.log(xMax / xMin));
    }
    
    return xMin * Math.pow(
      1 - u * (1 - Math.pow(xMin / xMax, beta)),
      1 / beta
    );
  }
  
  /**
   * Log-normal distribution
   * Used for multiplicative processes (planet sizes, etc.)
   */
  logNormal(muLog: number, sigmaLog: number): number {
    const z = this.normal(0, 1);
    return Math.exp(muLog + sigmaLog * z);
  }
  
  /**
   * Beta distribution (bounded [0,1])
   * Used for fractions, probabilities
   */
  beta(alpha: number, beta: number): number {
    // Using Johnk's algorithm
    let x, y;
    do {
      const u = this.rng();
      const v = this.rng();
      x = Math.pow(u, 1/alpha);
      y = Math.pow(v, 1/beta);
    } while (x + y > 1);
    
    return x / (x + y);
  }
  
  /**
   * Gamma distribution
   * Used for waiting times, sizes
   */
  gamma(shape: number, scale: number = 1): number {
    // Marsaglia and Tsang method
    if (shape < 1) {
      return this.gamma(shape + 1, scale) * Math.pow(this.rng(), 1/shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = this.normal(0, 1);
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = this.rng();
      const x2 = x * x;
      
      if (u < 1 - 0.0331 * x2 * x2) {
        return scale * d * v;
      }
      
      if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
        return scale * d * v;
      }
    }
  }
  
  /**
   * Weighted choice from array
   */
  choice<T>(items: T[], weights?: number[]): T {
    if (!weights) {
      return items[this.uniformInt(0, items.length)];
    }
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = this.rng() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
  
  /**
   * Shuffle array in-place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.uniformInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

/**
 * Statistical utilities using simple-statistics
 */
export const Statistics = {
  /**
   * Descriptive statistics
   */
  mean: (data: number[]) => ss.mean(data),
  median: (data: number[]) => ss.median(data),
  mode: (data: number[]) => ss.mode(data),
  variance: (data: number[]) => ss.variance(data),
  standardDeviation: (data: number[]) => ss.standardDeviation(data),
  
  /**
   * Quantiles
   */
  quantile: (data: number[], p: number) => ss.quantile(data, p),
  quartiles: (data: number[]) => [
    ss.quantile(data, 0.25),
    ss.quantile(data, 0.50),
    ss.quantile(data, 0.75),
  ],
  interquartileRange: (data: number[]) => ss.interquartileRange(data),
  
  /**
   * Correlation
   */
  correlation: (x: number[], y: number[]) => ss.sampleCorrelation(x, y),
  
  /**
   * Regression
   */
  linearRegression: (data: [number, number][]) => {
    const line = ss.linearRegression(data);
    const predict = ss.linearRegressionLine(line);
    const r2 = ss.rSquared(data, predict);
    return { line, predict, r2 };
  },
  
  /**
   * Sample from distribution using inverse CDF
   */
  sampleNormal: (mean: number, stdev: number, random: () => number) => 
    ss.sampleNormal(mean, stdev, random),
};

export default EnhancedRNG;
