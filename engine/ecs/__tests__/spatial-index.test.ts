import { describe, it, expect, beforeEach } from 'vitest';
import { SpatialIndex } from '../core/SpatialIndex';

describe('SpatialIndex', () => {
  let index: SpatialIndex;

  beforeEach(() => {
    index = new SpatialIndex({
      min: { x: -100, y: -100, z: -100 },
      max: { x: 100, y: 100, z: 100 },
    });
  });

  describe('Basic Operations', () => {
    it('should insert and query entities', () => {
      index.insert({
        entityId: 'test1',
        position: { x: 0, y: 0, z: 0 },
      });

      const results = index.queryRadius({ x: 0, y: 0, z: 0 }, 10);
      expect(results).toHaveLength(1);
      expect(results[0].entityId).toBe('test1');
    });

    it('should handle multiple entities', () => {
      for (let i = 0; i < 10; i++) {
        index.insert({
          entityId: `entity${i}`,
          position: { x: i, y: 0, z: 0 },
        });
      }

      const results = index.queryRadius({ x: 5, y: 0, z: 0 }, 3);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(30);
    });

    it('should remove entities', () => {
      index.insert({
        entityId: 'test1',
        position: { x: 0, y: 0, z: 0 },
      });

      index.remove('test1');

      const results = index.queryRadius({ x: 0, y: 0, z: 0 }, 10);
      expect(results).toHaveLength(0);
    });

    it('should update entity positions', () => {
      index.insert({
        entityId: 'test1',
        position: { x: 0, y: 0, z: 0 },
      });

      index.update({
        entityId: 'test1',
        position: { x: 50, y: 0, z: 0 },
      });

      const resultsAtOrigin = index.queryRadius({ x: 0, y: 0, z: 0 }, 10);
      expect(resultsAtOrigin).toHaveLength(0);

      const resultsAtNewPos = index.queryRadius({ x: 50, y: 0, z: 0 }, 10);
      expect(resultsAtNewPos).toHaveLength(1);
    });
  });

  describe('Radius Queries', () => {
    beforeEach(() => {
      index.insert({ entityId: 'e1', position: { x: 0, y: 0, z: 0 } });
      index.insert({ entityId: 'e2', position: { x: 5, y: 0, z: 0 } });
      index.insert({ entityId: 'e3', position: { x: 10, y: 0, z: 0 } });
      index.insert({ entityId: 'e4', position: { x: 20, y: 0, z: 0 } });
    });

    it('should find entities within radius', () => {
      const results = index.queryRadius({ x: 0, y: 0, z: 0 }, 6);
      expect(results.length).toBe(2);
    });

    it('should return empty array for radius with no entities', () => {
      const results = index.queryRadius({ x: 100, y: 100, z: 100 }, 1);
      expect(results).toHaveLength(0);
    });
  });

  describe('AABB Queries', () => {
    beforeEach(() => {
      index.insert({ entityId: 'e1', position: { x: 0, y: 0, z: 0 } });
      index.insert({ entityId: 'e2', position: { x: 5, y: 5, z: 5 } });
      index.insert({ entityId: 'e3', position: { x: 10, y: 10, z: 10 } });
    });

    it('should find entities within AABB', () => {
      const results = index.queryAABB({
        min: { x: -1, y: -1, z: -1 },
        max: { x: 6, y: 6, z: 6 },
      });

      expect(results.length).toBe(2);
    });

    it('should handle AABB with no entities', () => {
      const results = index.queryAABB({
        min: { x: 50, y: 50, z: 50 },
        max: { x: 60, y: 60, z: 60 },
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('Nearest Queries', () => {
    beforeEach(() => {
      index.insert({ entityId: 'e1', position: { x: 0, y: 0, z: 0 } });
      index.insert({ entityId: 'e2', position: { x: 10, y: 0, z: 0 } });
      index.insert({ entityId: 'e3', position: { x: 5, y: 0, z: 0 } });
    });

    it('should find single nearest entity', () => {
      const results = index.queryNearest({ x: 4, y: 0, z: 0 }, 1);
      expect(results).toHaveLength(1);
      expect(results[0].entityId).toBe('e3');
    });

    it('should find multiple nearest entities in order', () => {
      const results = index.queryNearest({ x: 4, y: 0, z: 0 }, 3);
      expect(results).toHaveLength(3);
      expect(results[0].entityId).toBe('e3');
      expect(results[1].entityId).toBe('e1');
      expect(results[2].entityId).toBe('e2');
    });
  });

  describe('Rebuild', () => {
    it('should rebuild index from entities', () => {
      const entities = [
        { entityId: 'e1', position: { x: 0, y: 0, z: 0 } },
        { entityId: 'e2', position: { x: 5, y: 0, z: 0 } },
        { entityId: 'e3', position: { x: 10, y: 0, z: 0 } },
      ];

      index.rebuild(entities);

      const results = index.queryRadius({ x: 5, y: 0, z: 0 }, 6);
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      for (let i = 0; i < 20; i++) {
        index.insert({
          entityId: `entity${i}`,
          position: { x: i * 5, y: 0, z: 0 },
        });
      }

      const stats = index.getStatistics();
      expect(stats.totalEntities).toBe(20);
      expect(stats.treeDepth).toBeGreaterThan(0);
      expect(stats.nodesCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle entities at exact boundaries', () => {
      index.insert({
        entityId: 'boundary',
        position: { x: 100, y: 100, z: 100 },
      });

      const results = index.queryRadius({ x: 100, y: 100, z: 100 }, 1);
      expect(results).toHaveLength(1);
    });

    it('should handle overlapping entities', () => {
      index.insert({ entityId: 'e1', position: { x: 0, y: 0, z: 0 } });
      index.insert({ entityId: 'e2', position: { x: 0, y: 0, z: 0 } });

      const results = index.queryRadius({ x: 0, y: 0, z: 0 }, 1);
      expect(results).toHaveLength(2);
    });

    it('should handle clearing', () => {
      index.insert({ entityId: 'e1', position: { x: 0, y: 0, z: 0 } });
      index.insert({ entityId: 'e2', position: { x: 5, y: 0, z: 0 } });

      index.clear();

      const results = index.queryRadius({ x: 0, y: 0, z: 0 }, 100);
      expect(results).toHaveLength(0);

      const stats = index.getStatistics();
      expect(stats.totalEntities).toBe(0);
    });
  });
});
