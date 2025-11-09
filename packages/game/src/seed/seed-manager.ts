/**
 * SEED MANAGER - Deterministic seed generation and management
 * 
 * Format: three-word-hyphen-delimited (e.g., "red-blue-green")
 * Version: v1 (for future seed format changes)
 * 
 * Seeds are:
 * - Deterministic (same seed = same world)
 * - Chainable (seed flows through all generations)
 * - Persistent (session/cookie storage)
 * - Validatable (format checking)
 */

import { EnhancedRNG } from '../utils/EnhancedRNG.js';

// Word lists for seed generation (deterministic)
const WORD_LISTS = {
  adjectives: [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan',
    'bright', 'dark', 'light', 'deep', 'pale', 'vivid', 'muted', 'rich',
    'ancient', 'young', 'old', 'new', 'fresh', 'stale', 'crisp', 'soft',
    'wild', 'calm', 'fierce', 'gentle', 'bold', 'subtle', 'sharp', 'smooth',
  ],
  nouns: [
    'star', 'moon', 'sun', 'planet', 'comet', 'asteroid', 'nebula', 'galaxy',
    'ocean', 'mountain', 'forest', 'desert', 'valley', 'river', 'lake', 'island',
    'crystal', 'stone', 'metal', 'wood', 'fire', 'ice', 'wind', 'earth',
    'beast', 'bird', 'fish', 'tree', 'flower', 'rock', 'cloud', 'storm',
  ],
  verbs: [
    'dance', 'sing', 'soar', 'flow', 'glow', 'shine', 'spark', 'bloom',
    'grow', 'fall', 'rise', 'spin', 'drift', 'rush', 'creep', 'leap',
    'burn', 'freeze', 'melt', 'crack', 'weave', 'carve', 'build', 'break',
    'merge', 'split', 'shift', 'turn', 'twist', 'bend', 'stretch', 'fold',
  ],
};

export interface SeedInfo {
  seed: string;
  version: string;
  createdAt: number;
  components: {
    macro: number;
    meso: number;
    micro: number;
  };
}

export interface SeedValidationResult {
  valid: boolean;
  seed?: string;
  version?: string;
  error?: string;
}

/**
 * SEED FORMAT: v1-three-word-hyphen-delimited
 * Example: "red-blue-green" or "ancient-star-dance"
 * 
 * Version prefix allows future seed format changes without breaking existing seeds
 */
const SEED_VERSION = 'v1';
const SEED_PATTERN = /^v\d+-[a-z]+-[a-z]+-[a-z]+$/;

/**
 * Generate a random three-word seed
 * Examples: "red-blue-green", "ancient-star-dance", "wild-ocean-glow"
 * 
 * Uses Mersenne Twister for high-quality randomness
 */
export function generateSeed(): string {
  // Use timestamp as entropy source, but with Mersenne Twister for quality
  const entropy = `${Date.now()}-${performance.now()}`;
  const rng = new EnhancedRNG(entropy);
  
  const adjective = WORD_LISTS.adjectives[Math.floor(rng.uniform(0, 1) * WORD_LISTS.adjectives.length)];
  const noun = WORD_LISTS.nouns[Math.floor(rng.uniform(0, 1) * WORD_LISTS.nouns.length)];
  const verb = WORD_LISTS.verbs[Math.floor(rng.uniform(0, 1) * WORD_LISTS.verbs.length)];
  
  return `${SEED_VERSION}-${adjective}-${noun}-${verb}`;
}

/**
 * Validate seed format
 */
export function validateSeed(seed: string): SeedValidationResult {
  if (!seed || typeof seed !== 'string') {
    return { valid: false, error: 'Seed must be a non-empty string' };
  }

  // Check format
  if (!SEED_PATTERN.test(seed)) {
    return { 
      valid: false, 
      error: `Invalid seed format. Expected: v1-word-word-word (e.g., "v1-red-blue-green")` 
    };
  }

  // Extract version
  const version = seed.split('-')[0];
  if (version !== SEED_VERSION) {
    return { 
      valid: false, 
      error: `Unsupported seed version: ${version}. Current version: ${SEED_VERSION}` 
    };
  }

  return { 
    valid: true, 
    seed, 
    version 
  };
}

/**
 * Extract seed components for deterministic selection
 * Same seed always produces same components
 * Uses Mersenne Twister (not the old seedrandom)
 */
export function extractSeedComponents(seed: string): { macro: number; meso: number; micro: number } {
  const rng = new EnhancedRNG(seed);
  return {
    macro: rng.uniform(0, 1),
    meso: rng.uniform(0, 1),
    micro: rng.uniform(0, 1),
  };
}

/**
 * Get seed info (components, version, etc.)
 */
export function getSeedInfo(seed: string): SeedInfo {
  const validation = validateSeed(seed);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid seed');
  }

  return {
    seed: validation.seed!,
    version: validation.version!,
    createdAt: Date.now(), // Could be extracted from seed if we encode timestamp
    components: extractSeedComponents(seed),
  };
}

/**
 * Normalize seed (remove version prefix for internal use, add for API)
 */
export function normalizeSeed(seed: string, includeVersion = true): string {
  // Remove version if present
  const withoutVersion = seed.replace(/^v\d+-/, '');
  
  if (includeVersion) {
    return `${SEED_VERSION}-${withoutVersion}`;
  }
  
  return withoutVersion;
}

/**
 * Chain seed through generations
 * Each generation gets a deterministic variant of the base seed
 */
export function getGenerationSeed(baseSeed: string, generation: number): string {
  const normalized = normalizeSeed(baseSeed, false);
  return `${normalized}-gen${generation}`;
}

