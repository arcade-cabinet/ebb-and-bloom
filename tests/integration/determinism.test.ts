/**
 * DETERMINISM TESTS
 * 
 * Critical: Same seed MUST produce same results.
 */

import { describe, it, expect } from 'vitest';
import { EnhancedRNG, SimplexNoise, BiomeSystem } from '../../engine';

describe('Determinism - Core Requirement', () => {
    it('should generate identical RNG sequences from same seed', () => {
        const rng1 = new EnhancedRNG('v1-test-seed-alpha');
        const rng2 = new EnhancedRNG('v1-test-seed-alpha');
        
        const sequence1 = Array.from({ length: 100 }, () => rng1.uniform(0, 1));
        const sequence2 = Array.from({ length: 100 }, () => rng2.uniform(0, 1));
        
        expect(sequence1).toEqual(sequence2);
    });
    
    it('should generate identical terrain from same seed', () => {
        const noise1 = new SimplexNoise('v1-terrain-seed');
        const noise2 = new SimplexNoise('v1-terrain-seed');
        
        const heights1 = [];
        const heights2 = [];
        
        for (let x = 0; x < 10; x++) {
            for (let z = 0; z < 10; z++) {
                heights1.push(noise1.noise(x, z));
                heights2.push(noise2.noise(x, z));
            }
        }
        
        expect(heights1).toEqual(heights2);
    });
    
    it('should generate identical biomes from same seed', () => {
        const biomes1 = new BiomeSystem('v1-biome-seed');
        const biomes2 = new BiomeSystem('v1-biome-seed');
        
        const types1 = [];
        const types2 = [];
        
        for (let t = 260; t < 310; t += 5) {
            for (let m = 0; m < 1; m += 0.1) {
                types1.push(biomes1.getBiome(t, m));
                types2.push(biomes2.getBiome(t, m));
            }
        }
        
        expect(types1).toEqual(types2);
    });
});

