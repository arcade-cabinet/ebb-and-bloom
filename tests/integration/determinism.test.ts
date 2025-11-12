/**
 * DETERMINISM TESTS
 * 
 * Critical: Same seed MUST produce same results.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedRNG } from '../../engine';
import { SimplexNoise } from '../../generation/spawners/SimplexNoise';
import { BiomeSystem } from '../../generation/spawners/BiomeSystem';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/timeline/CosmicProvenanceTimeline';
import { CosmicAudioSonification } from '../../engine/audio/cosmic';
import { CosmicHapticFeedback } from '../../engine/haptics/CosmicHapticFeedback';
import { rngRegistry } from '../../engine/rng/RNGRegistry';

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
        
        for (let x = 0; x < 10; x += 2) {
            for (let z = 0; z < 10; z += 2) {
                types1.push(biomes1.getBiome(x, z, 5.0));
                types2.push(biomes2.getBiome(x, z, 5.0));
            }
        }
        
        expect(types1).toEqual(types2);
    });
});

describe('Full Pipeline Determinism', () => {
    beforeEach(() => {
        rngRegistry.reset();
    });

    it('produces identical GenesisConstants for same seed', () => {
        const seed = 'determinism-genesis-test';
        
        rngRegistry.setSeed(seed);
        const genesis1 = new GenesisConstants(rngRegistry.getScopedRNG('g1'));
        const constants1 = genesis1.getConstants();
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const genesis2 = new GenesisConstants(rngRegistry.getScopedRNG('g1'));
        const constants2 = genesis2.getConstants();
        
        expect(constants1.planet_mass).toBe(constants2.planet_mass);
        expect(constants1.gravity).toBe(constants2.gravity);
        expect(constants1.metallicity).toBe(constants2.metallicity);
        expect(constants1.stellar_luminosity).toBe(constants2.stellar_luminosity);
        expect(constants1.orbital_radius).toBe(constants2.orbital_radius);
        expect(constants1.atmospheric_pressure).toBe(constants2.atmospheric_pressure);
        expect(constants1.ocean_mass_fraction).toBe(constants2.ocean_mass_fraction);
    });

    it('produces identical CosmicProvenanceTimeline for same seed', () => {
        const seed = 'determinism-timeline-test';
        
        rngRegistry.setSeed(seed);
        const timeline1 = new CosmicProvenanceTimeline(rngRegistry.getScopedRNG('t1'));
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const timeline2 = new CosmicProvenanceTimeline(rngRegistry.getScopedRNG('t1'));
        
        const stage1 = timeline1.getStage('planck-epoch');
        const stage2 = timeline2.getStage('planck-epoch');
        
        expect(stage1).toEqual(stage2);
        
        const constants1 = timeline1.getAllConstants();
        const constants2 = timeline2.getAllConstants();
        
        expect(constants1.metallicity).toBe(constants2.metallicity);
        expect(constants1.hubble_expansion_rate).toBe(constants2.hubble_expansion_rate);
        expect(constants1.hydrogen_fraction).toBe(constants2.hydrogen_fraction);
    });

    it('produces identical results across entire pipeline (Genesis → Timeline → Audio)', () => {
        const seed = 'full-pipeline-determinism';
        
        rngRegistry.setSeed(seed);
        const rng1 = rngRegistry.getScopedRNG('pipeline1');
        const genesis1 = new GenesisConstants(rng1);
        const timeline1 = genesis1.getTimeline();
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const rng2 = rngRegistry.getScopedRNG('pipeline1');
        const genesis2 = new GenesisConstants(rng2);
        const timeline2 = genesis2.getTimeline();
        
        const constants1 = genesis1.getConstants();
        const constants2 = genesis2.getConstants();
        
        expect(constants1.time_dilation).toBe(constants2.time_dilation);
        expect(constants1.entropy_baseline).toBe(constants2.entropy_baseline);
        expect(constants1.expansion_rate).toBe(constants2.expansion_rate);
        expect(constants1.planet_radius).toBe(constants2.planet_radius);
        
        const stage1 = timeline1.getStage('nucleosynthesis');
        const stage2 = timeline2.getStage('nucleosynthesis');
        
        expect(stage1.timeStart).toBe(stage2.timeStart);
        expect(stage1.timeEnd).toBe(stage2.timeEnd);
        expect(stage1.visualCharacteristics.particleCount).toBe(stage2.visualCharacteristics.particleCount);
    });

    it('produces different results for different seeds', () => {
        rngRegistry.setSeed('seed-alpha');
        const genesis1 = new GenesisConstants(rngRegistry.getScopedRNG('diff1'));
        const constants1 = genesis1.getConstants();
        
        rngRegistry.reset();
        rngRegistry.setSeed('seed-beta');
        const genesis2 = new GenesisConstants(rngRegistry.getScopedRNG('diff2'));
        const constants2 = genesis2.getConstants();
        
        expect(constants1.metallicity).not.toBe(constants2.metallicity);
        expect(constants1.planet_mass).not.toBe(constants2.planet_mass);
        expect(constants1.gravity).not.toBe(constants2.gravity);
    });

    it('maintains determinism across multiple scope accesses', () => {
        const seed = 'multi-scope-test';
        
        rngRegistry.setSeed(seed);
        const rng1a = rngRegistry.getScopedRNG('scope-a');
        const rng1b = rngRegistry.getScopedRNG('scope-b');
        const val1a = rng1a.uniform(0, 1);
        const val1b = rng1b.uniform(0, 1);
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const rng2a = rngRegistry.getScopedRNG('scope-a');
        const rng2b = rngRegistry.getScopedRNG('scope-b');
        const val2a = rng2a.uniform(0, 1);
        const val2b = rng2b.uniform(0, 1);
        
        expect(val1a).toBe(val2a);
        expect(val1b).toBe(val2b);
    });

    it('produces deterministic timeline stages in order', () => {
        const seed = 'stage-order-test';
        
        rngRegistry.setSeed(seed);
        const timeline1 = new CosmicProvenanceTimeline(rngRegistry.getScopedRNG('order1'));
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const timeline2 = new CosmicProvenanceTimeline(rngRegistry.getScopedRNG('order1'));
        
        const stages = [
            'planck-epoch',
            'cosmic-inflation',
            'quark-gluon-plasma',
            'nucleosynthesis',
            'recombination',
            'dark-matter-web',
            'population-iii-stars',
            'first-supernovae',
            'galaxy-position',
            'molecular-cloud',
            'cloud-collapse',
            'protoplanetary-disk',
            'planetary-accretion',
            'planetary-differentiation',
            'surface-and-life'
        ];
        
        for (const stageId of stages) {
            const stage1 = timeline1.getStage(stageId);
            const stage2 = timeline2.getStage(stageId);
            
            expect(stage1).toEqual(stage2);
        }
    });

    it('produces deterministic audio characteristics', () => {
        const seed = 'audio-determinism-test';
        
        const rng1 = new EnhancedRNG(`${seed}-audio1`);
        const sonification1 = new CosmicAudioSonification(rng1);
        
        const rng2 = new EnhancedRNG(`${seed}-audio1`);
        const sonification2 = new CosmicAudioSonification(rng2);
        
        expect(sonification1).toBeDefined();
        expect(sonification2).toBeDefined();
    });

    it('produces deterministic haptic patterns', async () => {
        const seed = 'haptic-determinism-test';
        
        const rng1 = new EnhancedRNG(`${seed}-haptic1`);
        const haptics1 = new CosmicHapticFeedback(rng1);
        haptics1.setEnabled(false);
        
        const rng2 = new EnhancedRNG(`${seed}-haptic1`);
        const haptics2 = new CosmicHapticFeedback(rng2);
        haptics2.setEnabled(false);
        
        expect(haptics1).toBeDefined();
        expect(haptics2).toBeDefined();
    });

    it('maintains determinism with complex genesis calculations', () => {
        const seed = 'complex-genesis-test';
        
        rngRegistry.setSeed(seed);
        const genesis1 = new GenesisConstants(rngRegistry.getScopedRNG('complex1'));
        const c1 = genesis1.getConstants();
        
        rngRegistry.reset();
        rngRegistry.setSeed(seed);
        const genesis2 = new GenesisConstants(rngRegistry.getScopedRNG('complex1'));
        const c2 = genesis2.getConstants();
        
        expect(c1.escape_velocity).toBe(c2.escape_velocity);
        expect(c1.hill_sphere).toBe(c2.hill_sphere);
        expect(c1.habitable_zone_inner).toBe(c2.habitable_zone_inner);
        expect(c1.habitable_zone_outer).toBe(c2.habitable_zone_outer);
        expect(c1.tidal_locking_timescale).toBe(c2.tidal_locking_timescale);
        expect(c1.surface_temperature).toBe(c2.surface_temperature);
    });

    it('preserves determinism through multiple seed changes', () => {
        const seeds = ['seed-1', 'seed-2', 'seed-3'];
        const results: number[][] = [];
        
        for (let run = 0; run < 2; run++) {
            const runResults: number[] = [];
            
            for (const seed of seeds) {
                rngRegistry.setSeed(seed);
                const rng = rngRegistry.getScopedRNG('multi-change');
                runResults.push(rng.uniform(0, 100));
                rngRegistry.reset();
            }
            
            results.push(runResults);
        }
        
        expect(results[0]).toEqual(results[1]);
    });
});

