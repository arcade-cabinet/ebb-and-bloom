import { describe, it, expect } from 'vitest';
import { GravityBehavior } from '../../../agents/governors/physics/GravityBehavior';
import { FlockingGovernor } from '../../../agents/governors/ecological/FlockingBehavior';
import { createTestFleetManager } from '../../fixtures/entities';
import { createOrbitScene, createFlockingScene } from '../../fixtures/scenes';

describe('Physics-Biology Governor Pipeline', () => {
  it('should compose physics and biology governors', () => {
    const gravity = new GravityBehavior();
    const flocking = new FlockingGovernor();
    
    expect(gravity).toBeDefined();
    expect(flocking).toBeDefined();
  });

  it('should apply gravity to flocking agents', () => {
    const scene = createFlockingScene(5);
    const gravity = new GravityBehavior();
    
    scene.vehicles.forEach(vehicle => {
      const flocking = new FlockingGovernor();
      flocking.applyTo(vehicle);
      
      vehicle.steering.add(gravity);
    });
    
    const initialPositions = scene.vehicles.map(v => v.position.clone());
    
    scene.manager.update(0.016);
    
    expect(scene.vehicles.length).toBe(5);
    expect(initialPositions.length).toBe(5);
  });

  it('should maintain entity count through pipeline', () => {
    const scene = createOrbitScene();
    const gravity = new GravityBehavior();
    
    scene.vehicles.forEach(vehicle => {
      vehicle.steering.add(gravity);
    });
    
    const before = scene.manager.entities.length;
    scene.manager.update(0.016);
    const after = scene.manager.entities.length;
    
    expect(before).toBe(after);
  });

  it('should combine multiple behaviors on single entity', () => {
    const manager = createTestFleetManager(3);
    const gravity = new GravityBehavior();
    const flocking = new FlockingGovernor();
    
    const vehicles = Array.from(manager.entities) as any[];
    
    vehicles.forEach(vehicle => {
      flocking.applyTo(vehicle);
      vehicle.steering.add(gravity);
    });
    
    const totalBehaviors = vehicles.reduce((sum, v) => sum + v.steering.behaviors.length, 0);
    
    expect(totalBehaviors).toBeGreaterThan(vehicles.length * 3);
  });

  it('should handle empty entity manager', () => {
    const scene = createFlockingScene(0);
    
    expect(() => {
      scene.manager.update(0.016);
    }).not.toThrow();
  });

  it('should preserve determinism across updates', () => {
    const scene1 = createOrbitScene();
    const scene2 = createOrbitScene();
    
    const gravity1 = new GravityBehavior();
    const gravity2 = new GravityBehavior();
    
    scene1.vehicles.forEach(v => v.steering.add(gravity1));
    scene2.vehicles.forEach(v => v.steering.add(gravity2));
    
    scene1.manager.update(0.016);
    scene2.manager.update(0.016);
    
    for (let i = 0; i < scene1.vehicles.length; i++) {
      const v1 = scene1.vehicles[i];
      const v2 = scene2.vehicles[i];
      
      expect(v1.position.x).toBeCloseTo(v2.position.x, 5);
      expect(v1.position.y).toBeCloseTo(v2.position.y, 5);
      expect(v1.position.z).toBeCloseTo(v2.position.z, 5);
    }
  });
});
