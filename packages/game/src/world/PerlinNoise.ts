/**
 * SIMPLEX NOISE GENERATOR
 * 
 * Simplex noise for terrain generation - SIGNIFICANTLY better than Perlin:
 * - O(n²) complexity vs Perlin's O(2^n)
 * - No directional artifacts
 * - Scales better to higher dimensions
 * - More organic, natural-looking terrain
 * 
 * Uses simplex-noise library with deterministic seeding.
 */

import { createNoise2D } from 'simplex-noise';
import { EnhancedRNG } from '../utils/EnhancedRNG';

export class SimplexNoise {
  private noise2D: ReturnType<typeof createNoise2D>;
  
  constructor(seed: string) {
    // Create seeded PRNG for simplex-noise
    const rng = new EnhancedRNG(seed);
    
    // simplex-noise expects a random function that returns [0, 1)
    const prng = () => rng.uniform(0, 1);
    
    this.noise2D = createNoise2D(prng);
  }
  
  /**
   * 2D Simplex noise - returns value in range [-1, 1]
   */
  noise(x: number, y: number): number {
    return this.noise2D(x, y);
  }
  
  /**
   * Octave-based noise (fractal Brownian motion)
   * Combines multiple frequencies for natural-looking terrain
   * 
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param octaves - Number of noise layers (more = more detail)
   * @param persistence - Amplitude decrease per octave (0.5 = each octave half as strong)
   * @param lacunarity - Frequency increase per octave (2.0 = each octave twice as frequent)
   * @param scale - Overall frequency scale (smaller = smoother terrain)
   */
  octaveNoise(
    x: number,
    y: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2.0,
    scale: number = 1.0
  ): number {
    let total = 0;
    let frequency = scale;
    let amplitude = 1;
    let maxValue = 0; // For normalization
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    
    return total / maxValue; // Normalize to [-1, 1]
  }
}

