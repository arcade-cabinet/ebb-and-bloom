/**
 * Snapping System Tests
 */

import { describe, it, expect } from 'vitest';
import { attemptSnap, RESOURCE_AFFINITIES, AffinityFlags } from '../ecs/systems/SnappingSystem';

describe('SnappingSystem', () => {
  describe('Resource Affinities', () => {
    it('should have correct affinity flags for ore', () => {
      const oreAff = RESOURCE_AFFINITIES.ore;
      expect(oreAff & AffinityFlags.HEAT).toBeGreaterThan(0);
      expect(oreAff & AffinityFlags.METAL).toBeGreaterThan(0);
    });
    
    it('should have correct affinity flags for water', () => {
      const waterAff = RESOURCE_AFFINITIES.water;
      expect(waterAff & AffinityFlags.FLOW).toBeGreaterThan(0);
    });
  });
  
  describe('attemptSnap', () => {
    it('should craft alloy from ore and water', () => {
      const inventory = { ore: 1, water: 1, alloy: 0 };
      
      const result = attemptSnap(inventory, 'alloy');
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('alloy');
      expect(result.pollution).toBe(1);
      expect(inventory.ore).toBe(0);
      expect(inventory.water).toBe(0);
      expect(inventory.alloy).toBe(1);
      expect(result.haiku).toBeTruthy();
    });
    
    it('should fail without sufficient resources', () => {
      const inventory = { ore: 0, water: 1, alloy: 0 };
      
      const result = attemptSnap(inventory, 'alloy');
      
      expect(result.success).toBe(false);
      expect(result.output).toBeNull();
    });
    
    it('should craft tool from ore and wood', () => {
      const inventory = { ore: 1, wood: 1 };
      
      const result = attemptSnap(inventory, 'tool');
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('tool');
      expect(inventory.tool).toBe(1);
    });
    
    it('should generate haiku for successful snaps', () => {
      const inventory = { ore: 1, water: 1 };
      
      const result = attemptSnap(inventory, 'alloy');
      
      expect(result.haiku).toContain('ore');
      expect(result.haiku).toContain('water');
      expect(result.haiku).toContain('alloy');
    });
  });
});
