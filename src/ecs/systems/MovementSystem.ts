/**
 * Movement System - Updates entity positions based on velocity
 */

import { defineQuery } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Position, Velocity } from '../components';

const movementQuery = defineQuery([Position, Velocity]);

export const createMovementSystem = () => {
  return (world: IWorld, deltaTime: number) => {
    const entities = movementQuery(world);
    
    for (const eid of entities) {
      // Update position
      Position.x[eid] += Velocity.x[eid] * deltaTime;
      Position.y[eid] += Velocity.y[eid] * deltaTime;
      
      // Apply friction
      Velocity.x[eid] *= 0.9;
      Velocity.y[eid] *= 0.9;
    }
  };
};
