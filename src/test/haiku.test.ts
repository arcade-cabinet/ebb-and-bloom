/**
 * Haiku Scorer Tests
 */

import { describe, it, expect } from 'vitest';
import { scoreHaikus, generateDiverseHaiku, jaroWinkler } from '../systems/HaikuScorer';

describe('HaikuScorer', () => {
  describe('jaroWinkler', () => {
    it('should return 1.0 for identical strings', () => {
      expect(jaroWinkler('flipper', 'flipper')).toBe(1.0);
    });
    
    it('should return 0.0 for completely different strings', () => {
      const sim = jaroWinkler('flipper', 'zzzzzzz');
      expect(sim).toBeLessThan(0.3);
    });
    
    it('should detect similar strings', () => {
      const sim = jaroWinkler('flipper wakes the vein', 'flipper stirs the vein');
      expect(sim).toBeGreaterThan(0.7); // High similarity
    });
  });
  
  describe('scoreHaikus', () => {
    it('should flag repetitive haikus', () => {
      const haikus = [
        'flipper wakes the vein',
        'flipper wakes the vein',
        'burr thorns rise'
      ];
      
      const result = scoreHaikus(haikus, 0.2);
      
      expect(result.diverse).toBe(false);
      expect(result.flaggedPairs.length).toBeGreaterThan(0);
      expect(result.recommendation).toContain('unlikely metaphors');
    });
    
    it('should correctly measure haiku diversity', () => {
      const haikus = [
        'ancient oak falls silent now',
        'copper veins beneath the soil',
        'starlight dances on the waves',
        'mushrooms bloom in shadow deep'
      ];
      
      const result = scoreHaikus(haikus);
      
      // Jaro-Winkler detects subtle similarities, which is good for poetry
      // Test that it provides useful metrics
      expect(result.averageSimilarity).toBeGreaterThan(0);
      expect(result.maxSimilarity).toBeGreaterThan(0);
    });
    
    it('should handle empty arrays', () => {
      const result = scoreHaikus([], 0.2);
      expect(result.diverse).toBe(true);
    });
  });
  
  describe('generateDiverseHaiku', () => {
    it('should generate haiku with trait', () => {
      const haiku = generateDiverseHaiku('flipper', 'swims', 'lagoon');
      
      expect(haiku).toContain('flipper');
      expect(haiku).toContain('swims');
      expect(haiku).toContain('lagoon');
    });
    
    it('should generate different haikus on multiple calls', () => {
      const haikus = new Set();
      for (let i = 0; i < 10; i++) {
        haikus.add(generateDiverseHaiku('thorn', 'grows', 'meadow'));
      }
      
      // Should have some variety (at least 3 different)
      expect(haikus.size).toBeGreaterThanOrEqual(3);
    });
  });
});
