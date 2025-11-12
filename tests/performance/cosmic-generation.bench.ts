/**
 * Cosmic Generation Performance Benchmarks
 * 
 * Benchmarks for key cosmic generation systems with performance budgets.
 * 
 * Performance Budgets:
 * - GenesisConstants: < 10ms
 * - CosmicProvenanceTimeline: < 100ms
 * - Audio generation: < 50ms per stage
 * - Haptic generation: < 10ms per stage
 */

import { describe, bench, beforeEach } from 'vitest';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/timeline/CosmicProvenanceTimeline';
import { CosmicAudioSonification } from '../../engine/audio/cosmic';
import { CosmicHapticFeedback } from '../../engine/haptics/CosmicHapticFeedback';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

describe('Cosmic Generation Performance', () => {
  beforeEach(() => {
    rngRegistry.reset();
    rngRegistry.setSeed('benchmark-seed');
  });

  bench('GenesisConstants creation', () => {
    const rng = rngRegistry.getScopedRNG('genesis-bench');
    new GenesisConstants(rng);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('CosmicProvenanceTimeline creation', () => {
    const rng = rngRegistry.getScopedRNG('timeline-bench');
    new CosmicProvenanceTimeline(rng);
  }, { 
    iterations: 50,
    time: 2000
  });

  bench('GenesisConstants + Timeline (full pipeline)', () => {
    const rng = new EnhancedRNG('full-pipeline-bench');
    const genesis = new GenesisConstants(rng);
    genesis.getTimeline();
  }, { 
    iterations: 50,
    time: 2000
  });
});

describe('Audio Generation Performance', () => {
  let sonification: CosmicAudioSonification;
  let rng: EnhancedRNG;

  beforeEach(() => {
    rng = new EnhancedRNG('audio-bench-seed');
    sonification = new CosmicAudioSonification(rng);
  });

  bench('Audio sonification: planck-epoch', () => {
    sonification.playSoundForStage('planck-epoch', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Audio sonification: cosmic-inflation', () => {
    sonification.playSoundForStage('cosmic-inflation', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Audio sonification: nucleosynthesis', () => {
    sonification.playSoundForStage('nucleosynthesis', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Audio sonification: recombination', () => {
    sonification.playSoundForStage('recombination', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Audio sonification: first-supernovae', () => {
    sonification.playSoundForStage('first-supernovae', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });
});

describe('Haptic Generation Performance', () => {
  let haptics: CosmicHapticFeedback;
  let rng: EnhancedRNG;

  beforeEach(() => {
    rng = new EnhancedRNG('haptic-bench-seed');
    haptics = new CosmicHapticFeedback(rng);
    haptics.setEnabled(false);
  });

  bench('Haptic pattern: planck-epoch', async () => {
    await haptics.playHapticForStage('planck-epoch', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Haptic pattern: cosmic-inflation', async () => {
    await haptics.playHapticForStage('cosmic-inflation', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Haptic pattern: nucleosynthesis', async () => {
    await haptics.playHapticForStage('nucleosynthesis', 0.7);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Haptic pattern: recombination', async () => {
    await haptics.playHapticForStage('recombination', 0.5);
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Haptic pattern: planetary-accretion', async () => {
    await haptics.playHapticForStage('planetary-accretion', 0.8);
  }, { 
    iterations: 100,
    time: 1000
  });
});

describe('RNG Performance', () => {
  let rng: EnhancedRNG;

  beforeEach(() => {
    rng = new EnhancedRNG('rng-bench-seed');
  });

  bench('RNG uniform generation (1000 values)', () => {
    for (let i = 0; i < 1000; i++) {
      rng.uniform(0, 1);
    }
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('RNG integer generation (1000 values)', () => {
    for (let i = 0; i < 1000; i++) {
      rng.uniformInt(0, 100);
    }
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('RNG normal distribution (1000 values)', () => {
    for (let i = 0; i < 1000; i++) {
      rng.normal(0, 1);
    }
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('RNGRegistry scoped RNG creation', () => {
    rngRegistry.setSeed('registry-bench');
    for (let i = 0; i < 100; i++) {
      rngRegistry.getScopedRNG(`scope-${i}`);
    }
  }, { 
    iterations: 50,
    time: 1000
  });
});

describe('Combined System Performance', () => {
  bench('Full cosmic pipeline: Genesis → Timeline → Audio', () => {
    const rng = new EnhancedRNG('combined-bench');
    const genesis = new GenesisConstants(rng);
    genesis.getTimeline();
    const sonification = new CosmicAudioSonification(rng);
    
    sonification.playSoundForStage('planck-epoch', 0.5);
    sonification.stopAll();
  }, { 
    iterations: 20,
    time: 2000
  });

  bench('Full cosmic pipeline: Genesis → Timeline → Haptics', async () => {
    const rng = new EnhancedRNG('combined-haptic-bench');
    const genesis = new GenesisConstants(rng);
    genesis.getTimeline();
    const haptics = new CosmicHapticFeedback(rng);
    haptics.setEnabled(false);
    
    await haptics.playHapticForStage('nucleosynthesis', 0.7);
    await haptics.stopAll();
  }, { 
    iterations: 20,
    time: 2000
  });

  bench('Seed change and RNG regeneration', () => {
    rngRegistry.setSeed('seed-1');
    rngRegistry.getScopedRNG('test-1');
    rngRegistry.getScopedRNG('test-2');
    rngRegistry.getScopedRNG('test-3');
    
    rngRegistry.setSeed('seed-2');
    rngRegistry.getScopedRNG('test-1');
    rngRegistry.getScopedRNG('test-2');
    rngRegistry.getScopedRNG('test-3');
  }, { 
    iterations: 100,
    time: 1000
  });
});

describe('Memory and Allocation Performance', () => {
  bench('GenesisConstants constant access (1000 times)', () => {
    const rng = new EnhancedRNG('access-bench');
    const genesis = new GenesisConstants(rng);
    const constants = genesis.getConstants();
    
    for (let i = 0; i < 1000; i++) {
      void (constants.planet_mass + constants.gravity + constants.metallicity);
    }
  }, { 
    iterations: 100,
    time: 1000
  });

  bench('Timeline stage access (all 15 stages)', () => {
    const rng = new EnhancedRNG('stage-access-bench');
    const timeline = new CosmicProvenanceTimeline(rng);
    
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
      timeline.getStage(stageId);
    }
  }, { 
    iterations: 100,
    time: 1000
  });
});
