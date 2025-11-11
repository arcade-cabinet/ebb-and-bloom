/**
 * RNG Test Fixture
 * 
 * Provides automatic RNG reset between tests and utilities for seed management.
 */

import { beforeEach, afterEach } from 'vitest';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import type { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

export interface RNGFixture {
  getRNG: (namespace: string) => EnhancedRNG;
  withSeed: <T>(seed: string, fn: () => T) => T;
  resetRNG: () => void;
}

export function setupRNGFixture(): RNGFixture {
  beforeEach(() => {
    rngRegistry.reset();
    rngRegistry.setSeed('test-seed-default');
  });

  afterEach(() => {
    rngRegistry.reset();
  });

  return {
    getRNG: (namespace: string) => rngRegistry.getScopedRNG(namespace),
    withSeed: <T>(seed: string, fn: () => T): T => {
      rngRegistry.setSeed(seed);
      const result = fn();
      rngRegistry.setSeed('test-seed-default');
      return result;
    },
    resetRNG: () => {
      rngRegistry.reset();
      rngRegistry.setSeed('test-seed-default');
    },
  };
}
