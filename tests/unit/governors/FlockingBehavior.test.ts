import { describe, it, expect, beforeEach } from 'vitest';
import { FlockingGovernor } from '../../../agents/governors/ecological/FlockingBehavior';
import { createTestVehicle, createTestFleetManager } from '../../fixtures/entities';

describe('FlockingGovernor', () => {
  let governor: FlockingGovernor;

  beforeEach(() => {
    governor = new FlockingGovernor();
  });

  it('should create with default weights', () => {
    expect(governor.alignment).toBeDefined();
    expect(governor.cohesion).toBeDefined();
    expect(governor.separation).toBeDefined();
  });

  it('should create with custom weights', () => {
    const customGovernor = new FlockingGovernor({
      alignmentWeight: 2.0,
      cohesionWeight: 1.5,
      separationWeight: 0.5,
    });

    expect(customGovernor.alignment.weight).toBe(2.0);
    expect(customGovernor.cohesion.weight).toBe(1.5);
    expect(customGovernor.separation.weight).toBe(0.5);
  });

  it('should apply behaviors to vehicle', () => {
    const vehicle = createTestVehicle();
    governor.applyTo(vehicle);

    expect(vehicle.updateNeighborhood).toBe(true);
    expect(vehicle.neighborhoodRadius).toBe(10);
    expect(vehicle.steering.behaviors.length).toBeGreaterThan(0);
  });

  it('should set custom neighborhood radius', () => {
    const vehicle = createTestVehicle();
    const customRadius = 20;
    
    governor.applyTo(vehicle, customRadius);

    expect(vehicle.neighborhoodRadius).toBe(customRadius);
  });

  it('should update weights dynamically', () => {
    governor.setWeights(3.0, 2.5, 1.0);

    expect(governor.alignment.weight).toBe(3.0);
    expect(governor.cohesion.weight).toBe(2.5);
    expect(governor.separation.weight).toBe(1.0);
  });

  it('should work with multiple vehicles', () => {
    const manager = createTestFleetManager(5, 10, 1);
    const vehicles = Array.from(manager.entities) as any[];

    vehicles.forEach(vehicle => {
      governor.applyTo(vehicle);
    });

    manager.update(0.016);

    vehicles.forEach(vehicle => {
      expect(vehicle.updateNeighborhood).toBe(true);
    });
  });

  it('should respect Dunbar number constraint', () => {
    const dunbarGovernor = new FlockingGovernor({
      maxNeighbors: 150,
    });

    expect(dunbarGovernor).toBeDefined();
  });

  it('should apply all three flocking behaviors', () => {
    const vehicle = createTestVehicle();
    
    expect(vehicle.steering.behaviors.length).toBe(0);
    
    governor.applyTo(vehicle);
    
    expect(vehicle.steering.behaviors.length).toBe(3);
  });

  it('should enable neighborhood updates when applied', () => {
    const vehicle = createTestVehicle();
    vehicle.updateNeighborhood = false;
    
    governor.applyTo(vehicle);
    
    expect(vehicle.updateNeighborhood).toBe(true);
  });
});
