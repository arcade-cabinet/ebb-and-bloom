/**
 * SPAWNER TESTS
 * 
 * Tests for terrain, biome, vegetation, creature, NPC spawning.
 */

import { describe, it, expect } from 'vitest';
import {
    BiomeSystem,
    SimplexNoise,
    EnhancedRNG
} from '../../engine';

describe('BiomeSystem', () => {
    it('should classify biomes from temperature and moisture', () => {
        const biomes = new BiomeSystem('test');
        
        const desert = biomes.getBiome(305, 0.1); // Hot and dry
        expect(desert).toBe('desert');
        
        const rainforest = biomes.getBiome(298, 0.9); // Hot and wet
        expect(rainforest).toBe('rainforest');
        
        const tundra = biomes.getBiome(265, 0.3); // Cold
        expect(tundra).toBe('tundra');
    });
    
    it('should be deterministic', () => {
        const biomes1 = new BiomeSystem('same-seed');
        const biomes2 = new BiomeSystem('same-seed');
        
        const biome1 = biomes1.getBiome(290, 0.5);
        const biome2 = biomes2.getBiome(290, 0.5);
        
        expect(biome1).toBe(biome2);
    });
});

describe('SimplexNoise', () => {
    it('should generate consistent noise from seed', () => {
        const noise1 = new SimplexNoise('test');
        const noise2 = new SimplexNoise('test');
        
        const value1 = noise1.noise(10, 10);
        const value2 = noise2.noise(10, 10);
        
        expect(value1).toBe(value2);
    });
    
    it('should generate values in expected range', () => {
        const noise = new SimplexNoise('test');
        
        for (let i = 0; i < 100; i++) {
            const value = noise.noise(i, i);
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        }
    });
});

describe('EnhancedRNG', () => {
    it('should be deterministic with same seed', () => {
        const rng1 = new EnhancedRNG('test');
        const rng2 = new EnhancedRNG('test');
        
        const values1 = [rng1.uniform(0, 1), rng1.uniform(0, 1), rng1.uniform(0, 1)];
        const values2 = [rng2.uniform(0, 1), rng2.uniform(0, 1), rng2.uniform(0, 1)];
        
        expect(values1).toEqual(values2);
    });
    
    it('should generate different sequences with different seeds', () => {
        const rng1 = new EnhancedRNG('seed1');
        const rng2 = new EnhancedRNG('seed2');
        
        const value1 = rng1.uniform(0, 1);
        const value2 = rng2.uniform(0, 1);
        
        expect(value1).not.toBe(value2);
    });
    
    it('should respect uniform distribution bounds', () => {
        const rng = new EnhancedRNG('test');
        
        for (let i = 0; i < 100; i++) {
            const value = rng.uniform(10, 20);
            expect(value).toBeGreaterThanOrEqual(10);
            expect(value).toBeLessThan(20);
        }
    });
    
    it('should generate valid choices', () => {
        const rng = new EnhancedRNG('test');
        const options = ['a', 'b', 'c'];
        
        for (let i = 0; i < 50; i++) {
            const choice = rng.choice(options);
            expect(options).toContain(choice);
        }
    });
});

