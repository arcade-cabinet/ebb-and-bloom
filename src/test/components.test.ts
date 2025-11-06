/**
 * ECS Components Tests
 */

import { describe, it, expect } from 'vitest';
import { createWorld, addEntity, addComponent } from 'bitecs';
import { Position, Velocity, Inventory, Traits } from '../ecs/components';

describe('ECS Components', () => {
  it('should create Position component', () => {
    const world = createWorld();
    const eid = addEntity(world);
    
    addComponent(world, Position, eid);
    Position.x[eid] = 100;
    Position.y[eid] = 200;
    
    expect(Position.x[eid]).toBe(100);
    expect(Position.y[eid]).toBe(200);
  });
  
  it('should create Velocity component', () => {
    const world = createWorld();
    const eid = addEntity(world);
    
    addComponent(world, Velocity, eid);
    Velocity.x[eid] = 5;
    Velocity.y[eid] = 10;
    
    expect(Velocity.x[eid]).toBe(5);
    expect(Velocity.y[eid]).toBe(10);
  });
  
  it('should create Inventory component', () => {
    const world = createWorld();
    const eid = addEntity(world);
    
    addComponent(world, Inventory, eid);
    Inventory.ore[eid] = 5;
    Inventory.water[eid] = 3;
    Inventory.alloy[eid] = 0;
    
    expect(Inventory.ore[eid]).toBe(5);
    expect(Inventory.water[eid]).toBe(3);
    expect(Inventory.alloy[eid]).toBe(0);
  });
  
  it('should create Traits component', () => {
    const world = createWorld();
    const eid = addEntity(world);
    
    addComponent(world, Traits, eid);
    Traits.flipper[eid] = 2;
    Traits.chainsaw[eid] = 1;
    
    expect(Traits.flipper[eid]).toBe(2);
    expect(Traits.chainsaw[eid]).toBe(1);
  });
});
