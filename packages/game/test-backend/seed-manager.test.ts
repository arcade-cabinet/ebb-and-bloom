/**
 * Unit tests for Seed Manager
 */

import { describe, it, expect } from 'vitest';
import {
  generateSeed,
  validateSeed,
  extractSeedComponents,
  getSeedInfo,
  normalizeSeed,
  getGenerationSeed,
} from '../src/seed/seed-manager.js';

describe('Seed Manager', () => {
  describe('generateSeed', () => {
    it('generates valid seed format', () => {
      const seed = generateSeed();
      expect(seed).toMatch(/^v\d+-[a-z]+-[a-z]+-[a-z]+$/);
      expect(seed.startsWith('v1-')).toBe(true);
    });

    it('generates different seeds on each call', () => {
      const seed1 = generateSeed();
      const seed2 = generateSeed();
      // Very unlikely to be the same
      expect(seed1).not.toBe(seed2);
    });

    it('generates three-word seeds', () => {
      const seed = generateSeed();
      const parts = seed.split('-');
      expect(parts.length).toBe(4); // v1 + 3 words
      expect(parts[0]).toBe('v1');
    });
  });

  describe('validateSeed', () => {
    it('validates correct seed format', () => {
      const result = validateSeed('v1-red-blue-green');
      expect(result.valid).toBe(true);
      expect(result.seed).toBe('v1-red-blue-green');
      expect(result.version).toBe('v1');
    });

    it('rejects invalid format', () => {
      const result = validateSeed('invalid-seed');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects empty string', () => {
      const result = validateSeed('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-empty string');
    });

    it('rejects wrong version', () => {
      const result = validateSeed('v2-red-blue-green');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported seed version');
    });

    it('rejects non-string input', () => {
      const result = validateSeed(null as any);
      expect(result.valid).toBe(false);
    });

    it('rejects seeds with numbers in words', () => {
      const result = validateSeed('v1-red-blue-123');
      expect(result.valid).toBe(false);
    });

    it('rejects seeds with uppercase', () => {
      const result = validateSeed('v1-Red-Blue-Green');
      expect(result.valid).toBe(false);
    });
  });

  describe('extractSeedComponents', () => {
    it('extracts deterministic components', () => {
      const seed = 'v1-red-blue-green';
      const components1 = extractSeedComponents(seed);
      const components2 = extractSeedComponents(seed);

      expect(components1.macro).toBe(components2.macro);
      expect(components1.meso).toBe(components2.meso);
      expect(components1.micro).toBe(components2.micro);
    });

    it('produces different components for different seeds', () => {
      const components1 = extractSeedComponents('v1-red-blue-green');
      const components2 = extractSeedComponents('v1-blue-red-green');

      expect(components1.macro).not.toBe(components2.macro);
    });

    it('produces values between 0 and 1', () => {
      const components = extractSeedComponents('v1-red-blue-green');
      expect(components.macro).toBeGreaterThanOrEqual(0);
      expect(components.macro).toBeLessThan(1);
      expect(components.meso).toBeGreaterThanOrEqual(0);
      expect(components.meso).toBeLessThan(1);
      expect(components.micro).toBeGreaterThanOrEqual(0);
      expect(components.micro).toBeLessThan(1);
    });
  });

  describe('getSeedInfo', () => {
    it('returns complete seed info', () => {
      const seed = 'v1-red-blue-green';
      const info = getSeedInfo(seed);

      expect(info.seed).toBe(seed);
      expect(info.version).toBe('v1');
      expect(info.components).toBeDefined();
      expect(info.components.macro).toBeDefined();
      expect(info.components.meso).toBeDefined();
      expect(info.components.micro).toBeDefined();
      expect(info.createdAt).toBeGreaterThan(0);
    });

    it('throws on invalid seed', () => {
      expect(() => getSeedInfo('invalid-seed')).toThrow();
    });
  });

  describe('normalizeSeed', () => {
    it('adds version prefix when includeVersion=true', () => {
      const normalized = normalizeSeed('red-blue-green', true);
      expect(normalized).toBe('v1-red-blue-green');
    });

    it('removes version prefix when includeVersion=false', () => {
      const normalized = normalizeSeed('v1-red-blue-green', false);
      expect(normalized).toBe('red-blue-green');
    });

    it('handles already normalized seeds', () => {
      const normalized = normalizeSeed('v1-red-blue-green', true);
      expect(normalized).toBe('v1-red-blue-green');
    });
  });

  describe('getGenerationSeed', () => {
    it('generates deterministic generation seeds', () => {
      const baseSeed = 'v1-red-blue-green';
      const gen0Seed1 = getGenerationSeed(baseSeed, 0);
      const gen0Seed2 = getGenerationSeed(baseSeed, 0);

      expect(gen0Seed1).toBe(gen0Seed2);
      expect(gen0Seed1).toBe('red-blue-green-gen0');
    });

    it('generates different seeds for different generations', () => {
      const baseSeed = 'v1-red-blue-green';
      const gen0Seed = getGenerationSeed(baseSeed, 0);
      const gen1Seed = getGenerationSeed(baseSeed, 1);

      expect(gen0Seed).not.toBe(gen1Seed);
      expect(gen0Seed).toBe('red-blue-green-gen0');
      expect(gen1Seed).toBe('red-blue-green-gen1');
    });

    it('chains through all generations', () => {
      const baseSeed = 'v1-red-blue-green';
      const genSeeds = [0, 1, 2, 3, 4, 5, 6].map(gen => getGenerationSeed(baseSeed, gen));

      expect(genSeeds[0]).toBe('red-blue-green-gen0');
      expect(genSeeds[1]).toBe('red-blue-green-gen1');
      expect(genSeeds[6]).toBe('red-blue-green-gen6');

      // All should be unique
      const unique = new Set(genSeeds);
      expect(unique.size).toBe(genSeeds.length);
    });
  });
});

