import { describe, it, expect, beforeEach } from 'vitest';
import { ConservationLedger } from '../core/ConservationLedger';

describe('Conservation Laws', () => {
  let ledger: ConservationLedger;

  beforeEach(() => {
    ledger = new ConservationLedger();
  });

  describe('Mass Conservation', () => {
    it('should conserve mass during aggregation', () => {
      const childrenTotals = {
        mass: 100,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const aggregateTotals = {
        mass: 100,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateAggregation(
        ['entity1', 'entity2'],
        childrenTotals,
        aggregateTotals,
        'Test aggregation'
      );

      expect(valid).toBe(true);
      expect(ledger.getViolations()).toHaveLength(0);
    });

    it('should detect mass violation during aggregation', () => {
      const childrenTotals = {
        mass: 100,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const aggregateTotals = {
        mass: 95,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateAggregation(
        ['entity1', 'entity2'],
        childrenTotals,
        aggregateTotals,
        'Test mass violation'
      );

      expect(valid).toBe(false);
      expect(ledger.getViolations().length).toBeGreaterThan(0);
      
      const massViolation = ledger.getViolations().find(v => v.quantityType === 'mass');
      expect(massViolation).toBeDefined();
      expect(massViolation?.drift).toBeCloseTo(5, 1);
    });

    it('should track entity additions and removals', () => {
      ledger.addEntity('test1', 50, 500, 0);
      
      let totals = ledger.getTotals();
      expect(totals.mass).toBe(50);
      expect(totals.energy).toBe(500);

      ledger.addEntity('test2', 30, 300, 0);
      
      totals = ledger.getTotals();
      expect(totals.mass).toBe(80);
      expect(totals.energy).toBe(800);

      ledger.removeEntity('test1', 50, 500, 0);
      
      totals = ledger.getTotals();
      expect(totals.mass).toBe(30);
      expect(totals.energy).toBe(300);
    });
  });

  describe('Energy Conservation', () => {
    it('should conserve energy during reactions within threshold', () => {
      const reactantTotals = {
        mass: 100,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const productTotals = {
        mass: 100,
        energy: 1020,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateReaction(
        ['reactant1'],
        ['product1'],
        reactantTotals,
        productTotals,
        'Test reaction'
      );

      expect(valid).toBe(true);
    });

    it('should detect energy drift exceeding threshold', () => {
      const reactantTotals = {
        mass: 100,
        energy: 1000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const productTotals = {
        mass: 100,
        energy: 1100,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateReaction(
        ['reactant1'],
        ['product1'],
        reactantTotals,
        productTotals,
        'Test energy drift'
      );

      expect(valid).toBe(false);
      
      const energyViolation = ledger.getViolations().find(v => v.quantityType === 'energy');
      expect(energyViolation).toBeDefined();
      expect(energyViolation?.drift).toBeGreaterThan(0.05);
    });
  });

  describe('Charge Conservation', () => {
    it('should conserve charge during reactions', () => {
      const reactantTotals = {
        mass: 100,
        energy: 1000,
        charge: 2,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const productTotals = {
        mass: 100,
        energy: 1000,
        charge: 2,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateReaction(
        ['reactant1'],
        ['product1'],
        reactantTotals,
        productTotals,
        'Test charge conservation'
      );

      expect(valid).toBe(true);
      expect(ledger.getViolations()).toHaveLength(0);
    });

    it('should detect charge violation', () => {
      const reactantTotals = {
        mass: 100,
        energy: 1000,
        charge: 2,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const productTotals = {
        mass: 100,
        energy: 1000,
        charge: 3,
        momentum: { x: 0, y: 0, z: 0 },
      };

      const valid = ledger.validateReaction(
        ['reactant1'],
        ['product1'],
        reactantTotals,
        productTotals,
        'Test charge violation'
      );

      expect(valid).toBe(false);
      
      const chargeViolation = ledger.getViolations().find(v => v.quantityType === 'charge');
      expect(chargeViolation).toBeDefined();
    });
  });

  describe('Audit Trail', () => {
    it('should maintain audit trail', () => {
      ledger.addEntity('test1', 50, 500, 0);
      ledger.addEntity('test2', 30, 300, 0);
      ledger.removeEntity('test1', 50, 500, 0);

      const trail = ledger.getAuditTrail();
      expect(trail.length).toBe(3);
      expect(trail[0].operation).toBe('add');
      expect(trail[1].operation).toBe('add');
      expect(trail[2].operation).toBe('remove');
    });

    it('should provide statistics', () => {
      ledger.addEntity('test1', 50, 500, 0);
      
      const stats = ledger.getStatistics();
      expect(stats.totalViolations).toBe(0);
      expect(stats.auditTrailSize).toBeGreaterThan(0);
      expect(stats.currentTotals.mass).toBe(50);
    });
  });

  describe('Reset and Clear', () => {
    it('should reset all state', () => {
      ledger.addEntity('test1', 50, 500, 0);
      ledger.reset();

      const totals = ledger.getTotals();
      expect(totals.mass).toBe(0);
      expect(totals.energy).toBe(0);
      expect(ledger.getViolations()).toHaveLength(0);
      expect(ledger.getAuditTrail()).toHaveLength(0);
    });

    it('should clear violations', () => {
      const invalidTotals = {
        mass: 100,
        energy: 2000,
        charge: 0,
        momentum: { x: 0, y: 0, z: 0 },
      };

      ledger.validateAggregation(
        ['e1'],
        invalidTotals,
        { ...invalidTotals, mass: 50 },
        'Force violation'
      );

      expect(ledger.getViolations().length).toBeGreaterThan(0);

      ledger.clearViolations();
      expect(ledger.getViolations()).toHaveLength(0);
    });
  });
});
