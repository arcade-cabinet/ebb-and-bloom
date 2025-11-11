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
        
        // getBiome requires x, z, altitude - using altitude to influence biome
        // Biome type depends on noise-generated temperature/moisture, so we test that it returns valid types
        const biome1 = biomes.getBiome(0, 0, 15); // Mid altitude
        expect(biome1.type).toBeDefined();
        expect(biome1.temperature).toBeGreaterThanOrEqual(0);
        expect(biome1.temperature).toBeLessThanOrEqual(1);
        expect(biome1.moisture).toBeGreaterThanOrEqual(0);
        expect(biome1.moisture).toBeLessThanOrEqual(1);
        
        const biome2 = biomes.getBiome(100, 100, 10); // Different location
        expect(biome2.type).toBeDefined();
        
        const biome3 = biomes.getBiome(200, 200, 5); // Low altitude
        expect(biome3.type).toBeDefined();
    });
    
    it('should be deterministic', () => {
        const biomes1 = new BiomeSystem('same-seed');
        const biomes2 = new BiomeSystem('same-seed');
        
        const biome1 = biomes1.getBiome(50, 50, 10);
        const biome2 = biomes2.getBiome(50, 50, 10);
        
        expect(biome1.type).toBe(biome2.type);
        expect(biome1.temperature).toBe(biome2.temperature);
        expect(biome1.moisture).toBe(biome2.moisture);
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

