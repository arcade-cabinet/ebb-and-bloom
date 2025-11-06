/**
 * Pack System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld } from 'bitecs';
import {
  shouldFormPack,
  updatePackLoyalty,
  shouldPackSchism,
  assignPackRole,
  getPackType,
  calculateInheritanceChance,
  Pack,
  Critter,
  PACK_FORMATION,
  PACK_ROLES
} from '../ecs/systems/PackSystem';

describe('PackSystem', () => {
  let world;
  
  beforeEach(() => {
    world = createWorld();
  });
  
  describe('Pack Formation', () => {
    it('should not form pack with less than 3 critters', () => {
      const critters = [1, 2];
      const positions = new Map([[1, { x: 0, y: 0 }], [2, { x: 10, y: 10 }]]);
      const traits = new Map([[1, 1], [2, 1]]);
      
      const result = shouldFormPack(critters, positions, traits);
      
      expect(result.form).toBe(false);
    });
    
    it('should form pack with 3+ nearby critters', () => {
      const critters = [1, 2, 3, 4];
      const positions = new Map([
        [1, { x: 0, y: 0 }],
        [2, { x: 10, y: 10 }],
        [3, { x: 15, y: 5 }],
        [4, { x: 5, y: 15 }]
      ]);
      const traits = new Map([[1, 1], [2, 2], [3, 1], [4, 1]]);
      
      const result = shouldFormPack(critters, positions, traits);
      
      expect(result.form).toBe(true);
      expect(result.members.length).toBeGreaterThanOrEqual(3);
      expect(result.leader).toBe(2); // Highest trait level
    });
    
    it('should select leader with highest trait level', () => {
      const critters = [1, 2, 3];
      const positions = new Map([
        [1, { x: 0, y: 0 }],
        [2, { x: 10, y: 10 }],
        [3, { x: 15, y: 5 }]
      ]);
      const traits = new Map([[1, 1], [2, 3], [3, 2]]);
      
      const result = shouldFormPack(critters, positions, traits);
      
      expect(result.leader).toBe(2);
    });
  });
  
  describe('Pack Loyalty', () => {
    beforeEach(() => {
      Pack.loyalty[1] = 0.5;
    });
    
    it('should increase loyalty on shared snap', () => {
      const newLoyalty = updatePackLoyalty(1, 'snap', { harmony: 0.5, conquest: 0.3, frolick: 0.2 });
      
      expect(newLoyalty).toBeGreaterThan(0.5);
    });
    
    it('should decrease loyalty on shock', () => {
      const newLoyalty = updatePackLoyalty(1, 'shock', { harmony: 0.5, conquest: 0.3, frolick: 0.2 });
      
      expect(newLoyalty).toBeLessThan(0.5);
    });
    
    it('should bonus loyalty for harmony players', () => {
      const newLoyalty = updatePackLoyalty(1, 'harmony', { harmony: 0.8, conquest: 0.1, frolick: 0.1 });
      
      expect(newLoyalty).toBeGreaterThan(0.5);
    });
    
    it('should clamp loyalty between 0 and 1', () => {
      Pack.loyalty[1] = 0.95;
      const newLoyalty = updatePackLoyalty(1, 'snap', { harmony: 0.5, conquest: 0.3, frolick: 0.2 });
      
      expect(newLoyalty).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Pack Schism', () => {
    it('should trigger schism when loyalty < 0.3', () => {
      Pack.loyalty[1] = 0.2;
      
      expect(shouldPackSchism(1)).toBe(true);
    });
    
    it('should not schism with healthy loyalty', () => {
      Pack.loyalty[1] = 0.6;
      
      expect(shouldPackSchism(1)).toBe(false);
    });
  });
  
  describe('Pack Roles', () => {
    it('should assign leader role', () => {
      const role = assignPackRole(1, true, false);
      
      expect(role).toBe(PACK_ROLES.LEADER);
      expect(Critter.role[1]).toBe(PACK_ROLES.LEADER);
    });
    
    it('should assign specialist role for diluted trait', () => {
      const role = assignPackRole(1, false, true);
      
      expect(role).toBe(PACK_ROLES.SPECIALIST);
    });
    
    it('should assign follower role by default', () => {
      const role = assignPackRole(1, false, false);
      
      expect(role).toBe(PACK_ROLES.FOLLOWER);
    });
  });
  
  describe('Pack Types', () => {
    it('should classify as ally with high loyalty', () => {
      expect(getPackType(0.8)).toBe('ally');
    });
    
    it('should classify as rival with low loyalty', () => {
      expect(getPackType(0.3)).toBe('rival');
    });
    
    it('should classify as neutral with medium loyalty', () => {
      expect(getPackType(0.5)).toBe('neutral');
    });
  });
  
  describe('Trait Inheritance', () => {
    it('should calculate inheritance chance', () => {
      const chance = calculateInheritanceChance(2, 0.8, 0.15);
      
      expect(chance).toBeGreaterThan(0.2); // Above base
      expect(chance).toBeLessThanOrEqual(0.8); // Capped
    });
    
    it('should increase chance with player proximity', () => {
      const farChance = calculateInheritanceChance(2, 0.2, 0);
      const nearChance = calculateInheritanceChance(2, 0.9, 0);
      
      expect(nearChance).toBeGreaterThan(farChance);
    });
    
    it('should cap inheritance at 80%', () => {
      const chance = calculateInheritanceChance(10, 1.0, 0.2);
      
      expect(chance).toBe(0.8);
    });
  });
});
