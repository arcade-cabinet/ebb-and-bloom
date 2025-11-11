import { describe, it, expect, beforeEach } from 'vitest';
import { YukaGovernorBase } from '../../../agents/governors/YukaGovernorBase';
import { Vehicle } from 'yuka';

class TestGovernor extends YukaGovernorBase {
  protected onUpdate(_delta: number): void {
  }
}

describe('YukaGovernorBase', () => {
  let governor: TestGovernor;

  beforeEach(() => {
    governor = new TestGovernor();
  });

  it('should create entity manager on construction', () => {
    expect(governor['entityManager']).toBeDefined();
  });

  it('should register entities correctly', () => {
    const vehicle = new Vehicle();
    governor.registerEntity('test-vehicle', vehicle as any);

    expect(governor.getEntity('test-vehicle')).toBe(vehicle);
    expect(governor.getEntityCount()).toBe(1);
  });

  it('should remove entities correctly', () => {
    const vehicle = new Vehicle();
    governor.registerEntity('test-vehicle', vehicle as any);
    governor.removeEntity('test-vehicle');

    expect(governor.getEntity('test-vehicle')).toBeUndefined();
    expect(governor.getEntityCount()).toBe(0);
  });

  it('should get all entities', () => {
    const vehicle1 = new Vehicle();
    const vehicle2 = new Vehicle();
    
    governor.registerEntity('vehicle-1', vehicle1 as any);
    governor.registerEntity('vehicle-2', vehicle2 as any);

    const allEntities = governor.getAllEntities();
    expect(allEntities).toHaveLength(2);
    expect(allEntities).toContain(vehicle1);
    expect(allEntities).toContain(vehicle2);
  });

  it('should clear all entities', () => {
    const vehicle1 = new Vehicle();
    const vehicle2 = new Vehicle();
    
    governor.registerEntity('vehicle-1', vehicle1 as any);
    governor.registerEntity('vehicle-2', vehicle2 as any);
    
    governor.clear();

    expect(governor.getEntityCount()).toBe(0);
  });

  it('should call entityManager.update on update', () => {
    let updateCalled = false;
    const originalUpdate = governor['entityManager'].update.bind(governor['entityManager']);
    
    governor['entityManager'].update = (delta: number) => {
      updateCalled = true;
      return originalUpdate(delta);
    };

    governor.update(0.016);
    expect(updateCalled).toBe(true);
  });

  it('should handle multiple vehicles with steering behaviors', () => {
    const vehicle1 = new Vehicle();
    const vehicle2 = new Vehicle();
    
    vehicle1.position.set(0, 0, 0);
    vehicle2.position.set(10, 0, 0);
    
    governor.registerEntity('v1', vehicle1 as any);
    governor.registerEntity('v2', vehicle2 as any);

    governor.update(0.016);

    expect(governor.getEntityCount()).toBe(2);
  });
});
