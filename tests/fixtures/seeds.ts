/**
 * DETERMINISTIC SEED CATALOG FOR TESTING
 * 
 * Provides consistent seeds for reproducible test scenarios.
 * All tests using these seeds should produce identical results.
 * 
 * Pattern: Seeds as "test-<domain>-<scenario>" for clarity
 */

export const TEST_SEEDS = {
  GRAVITY: 'test-gravity-seed',
  SYNTHESIS: 'test-synthesis-seed',
  EVOLUTION: 'test-evolution-seed',
  SETTLEMENT: 'test-settlement-seed',
  
  FLOCKING: 'test-flocking-seed',
  CHEMISTRY: 'test-chemistry-seed',
  ECOSYSTEM: 'test-ecosystem-seed',
  
  ZERO: 'test-zero-seed',
  ONE: 'test-one-seed',
  EMPTY: 'test-empty-seed',
} as const;

export type TestSeedKey = keyof typeof TEST_SEEDS;
