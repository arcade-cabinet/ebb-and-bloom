/**
 * ECS World - BitECS Foundation
 * Central world instance for all game entities
 */

import { createWorld, IWorld } from 'bitecs';

let world: IWorld | null = null;

export const getWorld = (): IWorld => {
  if (!world) {
    world = createWorld();
  }
  return world;
};

export const resetWorld = (): IWorld => {
  world = createWorld();
  return world;
};

export default getWorld;
