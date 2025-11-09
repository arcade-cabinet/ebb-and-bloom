/**
 * Simple Deterministic RNG
 * 
 * Uses seedrandom for reliable, deterministic randomness.
 * Provides statistical distributions (normal, Poisson, exponential).
 * 
 * Why seedrandom and not Mersenne Twister?
 * - Simple and proven in production games
 * - Deterministic (same seed = same sequence)
 * - Lightweight (~1KB vs 700KB+)
 * - No complex hash conversion issues
 * - Perfect for game use cases
 */

import seedrandom from 'seedrandom';

/**
 * RNG with statistical distributions
 */
export class EnhancedRNG {
  private rng: seedrandom.PRNG;
  private nextNormal: number | null = null; // Cache for Box-Muller
  
  constructor(seed: string) {
    this.rng = seedrandom(seed);
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
    // Box-Muller generates pairs, cache the second value
    if (this.nextNormal !== null) {
      const z = this.nextNormal;
      this.nextNormal = null;
      return z * sigma + mu;
    }
    
    const u1 = this.uniform();
    const u2 = this.uniform();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    this.nextNormal = z1; // Cache for next call
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
 * Simple statistics helpers (no external dependencies)
 */
export const Statistics = {
  mean: (data: number[]) => data.reduce((a, b) => a + b, 0) / data.length,
  
  median: (data: number[]) => {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  },
  
  variance: (data: number[]) => {
    const mean = Statistics.mean(data);
    return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  },
  
  standardDeviation: (data: number[]) => Math.sqrt(Statistics.variance(data)),
  
  quantile: (data: number[], p: number) => {
    const sorted = [...data].sort((a, b) => a - b);
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },
  
  quartiles: (data: number[]) => [
    Statistics.quantile(data, 0.25),
    Statistics.quantile(data, 0.50),
    Statistics.quantile(data, 0.75),
  ],
};

export default EnhancedRNG;
