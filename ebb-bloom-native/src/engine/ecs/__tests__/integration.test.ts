import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConservationLedger } from '../core/ConservationLedger';
import { SpatialIndex } from '../core/SpatialIndex';
import { ThermodynamicsSystem } from '../systems/ThermodynamicsSystem';
import { MetabolismSystem } from '../systems/MetabolismSystem';
import { World } from '../World';
import { generateEntityId } from '../core/UUID';
import type { Entity } from '../components/CoreComponents';

describe('System Integration', () => {
  let world: World;
  let conservationLedger: ConservationLedger;
  let spatialIndex: SpatialIndex;

  beforeEach(async () => {
    world = new World();
    await world.initialize();
    conservationLedger = new ConservationLedger();
    spatialIndex = new SpatialIndex();
  });

  afterEach(() => {
    world.destroy();
  });

  describe('Conservation Ledger Integration', () => {
    it('should track entity additions and maintain totals', () => {
      conservationLedger.addEntity('entity1', 100, 1000, 0);
      conservationLedger.addEntity('entity2', 50, 500, 0);

      const totals = conservationLedger.getTotals();
      expect(totals.mass).toBe(150);
      expect(totals.energy).toBe(1500);
      expect(totals.charge).toBe(0);
    });

    it('should validate aggregation conservation', () => {
      const childrenTotals = {
        mass: 100,
        energy: 1000,
        charge: 2,
        momentum: { x: 10, y: 5, z: 0 },
      };

      const aggregateTotals = {
        mass: 100,
        energy: 1000,
        charge: 2,
        momentum: { x: 10, y: 5, z: 0 },
      };

      const valid = conservationLedger.validateAggregation(
        ['child1', 'child2'],
        childrenTotals,
        aggregateTotals,
        'Integration test aggregation'
      );

      expect(valid).toBe(true);
      expect(conservationLedger.getViolations()).toHaveLength(0);
    });
  });

  describe('Metabolism System Integration', () => {
    it('should consume energy for organism maintenance', () => {
      const organism: Entity = {
        entityId: generateEntityId(),
        scale: 'organismal',
        mass: 100,
        position: { x: 0, y: 10, z: 0 },
        genome: 'ATCGATCGATCG',
        phenotype: { strength: 1.0 },
        metabolism: {
          pathways: ['aerobic_respiration'],
          energyProduction: 10,
          maintenanceCost: 5,
        },
        energyStores: 200,
      };

      world.add(organism);
      const initialEnergy = organism.energyStores!;

      const metabolismSystem = new MetabolismSystem();
      metabolismSystem.update(world.entities, 1.0);

      expect(organism.energyStores).toBeLessThan(initialEnergy);
      expect(organism.energyStores).toBeGreaterThan(0);
    });
  });

  describe('Thermodynamics System Integration', () => {
    it('should maintain temperature bounds', () => {
      const entity: Entity = {
        entityId: generateEntityId(),
        scale: 'molecular',
        mass: 18,
        position: { x: 0, y: 0, z: 0 },
        temperature: 300,
        elementCounts: { H: 2, O: 1 },
        stateOfMatter: 'liquid',
      };

      world.add(entity);

      const thermodynamicsSystem = new ThermodynamicsSystem();
      thermodynamicsSystem.update(world.entities, 0.1);

      expect(entity.temperature).toBeGreaterThan(2.7);
      expect(entity.temperature).toBeLessThan(10000);
    });
  });

  describe('Spatial Index Integration', () => {
    it('should query entities by radius', () => {
      const center = { x: 0, y: 0, z: 0 };
      
      for (let i = 0; i < 5; i++) {
        spatialIndex.insert({
          entityId: `entity${i}`,
          position: { x: i, y: 0, z: 0 },
        });
      }

      const nearbyEntities = spatialIndex.queryRadius(center, 2);
      expect(nearbyEntities.length).toBeGreaterThan(0);
      expect(nearbyEntities.length).toBeLessThanOrEqual(3);
    });

    it('should query nearest entities', () => {
      const position = { x: 5, y: 0, z: 0 };
      
      spatialIndex.insert({
        entityId: 'entity1',
        position: { x: 0, y: 0, z: 0 },
      });

      spatialIndex.insert({
        entityId: 'entity2',
        position: { x: 4, y: 0, z: 0 },
      });

      spatialIndex.insert({
        entityId: 'entity3',
        position: { x: 10, y: 0, z: 0 },
      });

      const nearest = spatialIndex.queryNearest(position, 1);
      expect(nearest).toHaveLength(1);
      expect(nearest[0].entityId).toBe('entity2');
    });
  });

  describe('Population Dynamics', () => {
    it('should simulate population growth and interactions', () => {
      const population1: Partial<Entity> & Pick<Entity, 'entityId' | 'scale'> = {
        entityId: generateEntityId(),
        scale: 'population',
        populationStats: {
          count: 100,
          density: 10,
          growthRate: 0.1,
        },
        trophicLevel: 1,
        position: { x: 0, y: 0, z: 0 },
      };

      const population2: Partial<Entity> & Pick<Entity, 'entityId' | 'scale'> = {
        entityId: generateEntityId(),
        scale: 'population',
        populationStats: {
          count: 50,
          density: 5,
          growthRate: 0.05,
        },
        trophicLevel: 2,
        position: { x: 1, y: 0, z: 0 },
      };

      world.add(population1);
      world.add(population2);

      world.tick(1.0);

      const populations = Array.from(world.entities.with('populationStats'));
      expect(populations.length).toBe(2);
    });
  });

  describe('Conservation During Complex Interactions', () => {
    it('should maintain conservation across multiple system updates', () => {
      for (let i = 0; i < 10; i++) {
        world.add({
          entityId: generateEntityId(),
          scale: 'molecular',
          mass: 10 + i,
          position: { x: i, y: 0, z: 0 },
          velocity: { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
          charge: 0,
          elementCounts: { C: 1, H: 4 },
        });
      }

      for (let i = 0; i < 10; i++) {
        world.tick(0.1);
      }

      const finalStats = world.getStatistics();
      const finalViolations = finalStats.orchestrator.conservationStats.totalViolations;

      expect(finalViolations).toBeLessThan(10);
    });
  });

  describe('Entity Lifecycle', () => {
    it('should properly add and remove entities', () => {
      const entity: Partial<Entity> & Pick<Entity, 'entityId' | 'scale'> = {
        entityId: generateEntityId(),
        scale: 'atomic',
        mass: 1,
        position: { x: 0, y: 0, z: 0 },
      };

      const added = world.add(entity);
      expect(Array.from(world.entities.entities)).toContain(added);

      world.remove(added);
      expect(Array.from(world.entities.entities)).not.toContain(added);
    });

    it('should track statistics correctly', () => {
      for (let i = 0; i < 5; i++) {
        world.add({
          entityId: generateEntityId(),
          scale: 'atomic',
          mass: 1,
          position: { x: i, y: 0, z: 0 },
        });
      }

      const stats = world.getStatistics();
      expect(stats.entityCount).toBe(5);
      expect(stats.orchestrator.systemCount).toBeGreaterThan(0);
    });
  });
});
