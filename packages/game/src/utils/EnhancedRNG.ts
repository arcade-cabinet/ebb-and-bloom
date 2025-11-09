/**
 * Enhanced Random Number Generation
 * 
 * Uses Mersenne Twister for high-quality deterministic randomness.
 * Provides proper statistical distributions (normal, Poisson, exponential).
 */

import { factory as mt19937Factory } from '@stdlib/random-base-mt19937';
import { factory as normalFactory } from '@stdlib/random-base-normal';
import * as ss from 'simple-statistics';

/**
 * Enhanced RNG with statistical distributions
 */
export class EnhancedRNG {
  private mt: any;
  private normalGen: any;
  
  constructor(seed: string) {
    // Convert string seed to numeric
    const numericSeed = this.hashSeed(seed);
    
    // Mersenne Twister (much better than Math.random or basic seedrandom)
    this.mt = mt19937Factory({ seed: numericSeed });
    
    // Normal distribution generator
    this.normalGen = normalFactory({ prng: this.mt });
  }
  
  /**
   * Hash string seed to number (FNV-1a)
   */
  private hashSeed(seed: string): number {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0; // Unsigned 32-bit
  }
  
  /**
   * Uniform random [0, 1)
   */
  uniform(): number {
    return this.mt();
  }
  
  /**
   * Uniform integer in range [min, max)
   */
  uniformInt(min: number, max: number): number {
    return Math.floor(this.uniform() * (max - min)) + min;
  }
  
  /**
   * Normal distribution (Gaussian)
   * Mean = mu, Standard Deviation = sigma
   */
  normal(mu: number = 0, sigma: number = 1): number {
    return this.normalGen() * sigma + mu;
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
      p *= this.uniform();
    } while (p > L);
    
    return k - 1;
  }
  
  /**
   * Exponential distribution
   * Used for time between events
   */
  exponential(rate: number): number {
    return -Math.log(1 - this.uniform()) / rate;
  }
  
  /**
   * Power law distribution (for IMF, etc.)
   * p(x) ∝ x^(-alpha)
   */
  powerLaw(alpha: number, xMin: number, xMax: number): number {
    const u = this.uniform();
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
      const u = this.uniform();
      const v = this.uniform();
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
      return this.gamma(shape + 1, scale) * Math.pow(this.uniform(), 1/shape);
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
      const u = this.uniform();
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
    let random = this.uniform() * totalWeight;
    
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
