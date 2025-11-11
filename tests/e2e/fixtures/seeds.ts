/**
 * TEST SEED FIXTURES
 * 
 * Deterministic seeds for E2E testing.
 * Format: v1-adjective-noun-verb (e.g., v1-red-star-dance)
 */

export const TEST_SEEDS = {
  deterministic: 'v1-red-star-dance',
  earthLike: 'v1-blue-ocean-flow',
  extreme: 'v1-fierce-fire-burn',
  minimal: 'v1-calm-lake-drift',
  ancient: 'v1-ancient-mountain-rise',
  cosmic: 'v1-dark-nebula-glow',
} as const;

export type TestSeedKey = keyof typeof TEST_SEEDS;
