import { describe, it, expect } from 'vitest';
import { GravityBehavior } from '../../../agents/governors/physics/GravityBehavior';
import { Vector3 } from 'yuka';
import { createTestVehicle, createTestEntityManager } from '../../fixtures/entities';

describe('GravityBehavior', () => {
  it('should use module-level vector for zero allocation', () => {
    const behavior = new GravityBehavior();
    const vehicle = createTestVehicle(10);
    const force = new Vector3();
    
    behavior.calculate(vehicle, force, 0.016);
  });

  it('should integrate delta for frame-rate independence', () => {
    const behavior = new GravityBehavior();
    const manager = createTestEntityManager();
    
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const attractor = createTestVehicle(1000, new Vector3(10, 0, 0));
    
    vehicle.manager = manager;
    attractor.manager = manager;
    
    manager.add(vehicle);
    manager.add(attractor);
    
    const force1 = new Vector3();
    const force2 = new Vector3();
    
    behavior.calculate(vehicle, force1, 0.016);
    behavior.calculate(vehicle, force2, 0.032);
    
    const ratio = force2.length() / force1.length();
    expect(ratio).toBeCloseTo(2.0, 1);
  });

  it('should apply force toward massive body', () => {
    const behavior = new GravityBehavior();
    const manager = createTestEntityManager();
    
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const attractor = createTestVehicle(1000, new Vector3(10, 0, 0));
    
    vehicle.manager = manager;
    attractor.manager = manager;
    
    manager.add(vehicle);
    manager.add(attractor);
    
    const force = new Vector3();
    behavior.calculate(vehicle, force, 0.016);
    
    expect(force.x).toBeGreaterThan(0);
    expect(Math.abs(force.y)).toBeCloseTo(0, 5);
    expect(Math.abs(force.z)).toBeCloseTo(0, 5);
  });

  it('should respect minimum distance to prevent singularities', () => {
    const behavior = new GravityBehavior();
    behavior.minDistance = 1.0;
    
    const manager = createTestEntityManager();
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const attractor = createTestVehicle(1000, new Vector3(0.01, 0, 0));
    
    vehicle.manager = manager;
    attractor.manager = manager;
    
    manager.add(vehicle);
    manager.add(attractor);
    
    const force = new Vector3();
    behavior.calculate(vehicle, force, 0.016);
    
    expect(force.length()).toBeLessThan(behavior.maxForce * 0.016);
  });

  it('should clamp force to maxForce', () => {
    const behavior = new GravityBehavior();
    behavior.maxForce = 10;
    behavior.scale = 1e20;
    
    const manager = createTestEntityManager();
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const attractor = createTestVehicle(1000, new Vector3(1, 0, 0));
    
    vehicle.manager = manager;
    attractor.manager = manager;
    
    manager.add(vehicle);
    manager.add(attractor);
    
    const force = new Vector3();
    behavior.calculate(vehicle, force, 0.016);
    
    const maxPossible = behavior.maxForce * 0.016;
    expect(force.length()).toBeLessThanOrEqual(maxPossible * 1.01);
  });

  it('should ignore entities without mass', () => {
    const behavior = new GravityBehavior();
    const manager = createTestEntityManager();
    
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const massless = createTestVehicle(0, new Vector3(10, 0, 0));
    
    vehicle.manager = manager;
    massless.manager = manager;
    
    manager.add(vehicle);
    manager.add(massless);
    
    const force = new Vector3();
    behavior.calculate(vehicle, force, 0.016);
    
    expect(force.length()).toBeCloseTo(0, 5);
  });

  it('should accumulate forces from multiple bodies', () => {
    const behavior = new GravityBehavior();
    const manager = createTestEntityManager();
    
    const vehicle = createTestVehicle(1, new Vector3(0, 0, 0));
    const attractor1 = createTestVehicle(1000, new Vector3(10, 0, 0));
    const attractor2 = createTestVehicle(1000, new Vector3(-10, 0, 0));
    
    vehicle.manager = manager;
    attractor1.manager = manager;
    attractor2.manager = manager;
    
    manager.add(vehicle);
    manager.add(attractor1);
    manager.add(attractor2);
    
    const force = new Vector3();
    behavior.calculate(vehicle, force, 0.016);
    
    expect(Math.abs(force.x)).toBeLessThan(0.01);
  });
});
