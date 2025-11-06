/**
 * Movement System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld, addEntity, addComponent } from 'bitecs';
import { Position, Velocity } from '../ecs/components';
import { createMovementSystem } from '../ecs/systems/MovementSystem';

describe('MovementSystem', () => {
  let world;
  let movementSystem;
  
  beforeEach(() => {
    world = createWorld();
    movementSystem = createMovementSystem();
  });
  
  it('should update position based on velocity', () => {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    
    Position.x[eid] = 0;
    Position.y[eid] = 0;
    Velocity.x[eid] = 10;
    Velocity.y[eid] = 20;
    
    movementSystem(world, 1); // 1 second delta
    
    expect(Position.x[eid]).toBe(10);
    expect(Position.y[eid]).toBe(20);
  });
  
  it('should apply friction to velocity', () => {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    
    Velocity.x[eid] = 100;
    Velocity.y[eid] = 100;
    
    movementSystem(world, 1);
    
    expect(Velocity.x[eid]).toBe(90); // 0.9 friction
    expect(Velocity.y[eid]).toBe(90);
  });
  
  it('should handle deltaTime correctly', () => {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    
    Position.x[eid] = 0;
    Velocity.x[eid] = 100;
    
    movementSystem(world, 0.5); // Half second
    
    expect(Position.x[eid]).toBe(50);
  });
});
