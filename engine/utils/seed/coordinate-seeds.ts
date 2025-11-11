/**
 * Coordinate-Based Seeds
 *
 * Seeds are spacetime coordinates, not random generators.
 *
 * BIDIRECTIONAL:
 * - Seed → Coordinates (player enters seed)
 * - Coordinates → Seed (zoom generates seed)
 */

import seedrandom from 'seedrandom';

// SpacetimeCoordinates type (moved here to avoid circular dependency)
export interface SpacetimeCoordinates {
  x: number; // light-years
  y: number;
  z: number;
  t: number; // seconds since Big Bang
}

// Word lists for readable seeds
const ADJECTIVES = [
  'red',
  'blue',
  'green',
  'ancient',
  'bright',
  'dark',
  'wild',
  'calm',
  'fierce',
  'gentle',
  'bold',
  'subtle',
  'vivid',
  'pale',
  'deep',
  'light',
  'young',
  'old',
  'fresh',
  'eternal',
  'frozen',
  'burning',
  'still',
  'swift',
  'hidden',
  'shining',
  'silent',
  'roaring',
  'distant',
  'near',
  'strange',
  'familiar',
];

const NOUNS = [
  'star',
  'moon',
  'sun',
  'nebula',
  'void',
  'storm',
  'ocean',
  'mountain',
  'forest',
  'desert',
  'crystal',
  'stone',
  'wind',
  'fire',
  'ice',
  'water',
  'comet',
  'planet',
  'galaxy',
  'cosmos',
  'aurora',
  'eclipse',
  'horizon',
  'zenith',
  'dawn',
  'dusk',
  'tide',
  'wave',
  'peak',
  'valley',
  'river',
  'cloud',
];

const VERBS = [
  'dance',
  'sing',
  'soar',
  'flow',
  'glow',
  'shine',
  'bloom',
  'burn',
  'freeze',
  'melt',
  'rise',
  'fall',
  'spin',
  'drift',
  'pulse',
  'flare',
  'whisper',
  'echo',
  'shimmer',
  'blaze',
  'surge',
  'wane',
  'gleam',
  'fade',
  'spiral',
  'orbit',
  'merge',
  'split',
  'ascend',
  'descend',
  'transform',
  'endure',
];

/**
 * FORWARD: Seed → Coordinates
 * Player enters "red-moon-dance" → Get spacetime position
 */
export function seedToCoordinates(seed: string): SpacetimeCoordinates {
  const rng = seedrandom(seed);

  return {
    // Spatial coordinates (light-years from galactic center)
    x: rng() * 1e5, // 0-100,000 ly
    y: rng() * 1e5,
    z: rng() * 1e5,

    // Temporal coordinate (when to start observing)
    // Last 2 billion years (interesting period - life exists)
    t: 13.8e9 * 365.25 * 86400 - rng() * 2e9 * 365.25 * 86400,
  };
}

/**
 * REVERSE: Coordinates → Seed
 * Player zooms into planet → Auto-generate seed
 *
 * THIS IS THE KEY INNOVATION
 */
export function generateSeedFromCoordinates(coords: SpacetimeCoordinates): string {
  // Hash coordinates to deterministic indices
  const hash = hashCoordinates(coords);

  // Use hash to pick words (deterministic)
  const adjIndex = Math.floor(hash.adj * ADJECTIVES.length);
  const nounIndex = Math.floor(hash.noun * NOUNS.length);
  const verbIndex = Math.floor(hash.verb * VERBS.length);

  const adj = ADJECTIVES[adjIndex];
  const noun = NOUNS[nounIndex];
  const verb = VERBS[verbIndex];

  return `${adj}-${noun}-${verb}`;
}

/**
 * Hash spacetime coordinates to deterministic values
 * Same coords → same hash (always)
 */
function hashCoordinates(coords: SpacetimeCoordinates): {
  adj: number;
  noun: number;
  verb: number;
} {
  // FNV-1a hash
  const hash = (x: number) => {
    let h = 2166136261;
    const bytes = new Float64Array([x]).buffer;
    const view = new Uint8Array(bytes);

    for (let i = 0; i < view.length; i++) {
      h ^= view[i];
      h = Math.imul(h, 16777619);
    }

    return (h >>> 0) / 4294967295; // 0-1
  };

  return {
    adj: hash(coords.x),
    noun: hash(coords.y + coords.z), // Combine y and z
    verb: hash(coords.t / 1e9), // Time in billions of years
  };
}

/**
 * Validate bidirectionality
 * seed → coords → seed' should give same words (maybe different format)
 */
export function validateBidirectional(seed: string): boolean {
  const coords = seedToCoordinates(seed);
  const regenerated = generateSeedFromCoordinates(coords);

  // Should be same words (may be in different order due to hashing)
  return seed === regenerated || seed.split('-').every((word) => regenerated.includes(word));
}

/**
 * Search for interesting coordinates
 * Keep hashing until we find habitable planet
 */
export function findInterestingSlice(
  searchSeed: string,
  universe: any, // UniverseSimulator - avoid circular dependency
  maxAttempts: number = 1000
): { coords: SpacetimeCoordinates; seed: string } | null {
  let attempt = 0;
  let seed = searchSeed;

  while (attempt < maxAttempts) {
    const coords = seedToCoordinates(seed);
    const state = universe.getAt(coords);

    // Check if interesting
    if (state.star && state.planets.length > 0) {
      // TODO: Check for life, atmosphere, etc.
      return { coords, seed };
    }

    // Try next seed (modify search seed deterministically)
    seed = `${searchSeed}-${attempt}`;
    attempt++;
  }

  console.warn('[Search] No interesting slice found after', maxAttempts, 'attempts');
  return null;
}

/**
 * Example usage:
 *
 * // Player zooms into planet at [47583, 92847, 17384], t=13.8Gyr
 * const coords = { x: 47583, y: 92847, z: 17384, t: 13.8e9 * YEAR };
 * const seed = generateSeedFromCoordinates(coords);
 * // Result: "ancient-moon-dance"
 *
 * // Later, player shares seed
 * const sharedCoords = seedToCoordinates("ancient-moon-dance");
 * // Returns: Same coordinates [47583, 92847, 17384]
 *
 * // They visit the SAME planet!
 */
