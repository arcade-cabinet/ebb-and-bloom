/**
 * Entity Creators - Factory functions for game entities
 */

import { addEntity, addComponent } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Position, Velocity, Traits, Inventory, Sprite, Trail, Player } from '../components';

export const createPlayer = (world: IWorld, x: number, y: number) => {
  const eid = addEntity(world);
  
  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;
  
  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;
  
  addComponent(world, Traits, eid);
  Traits.flipper[eid] = 0;
  Traits.chainsaw[eid] = 0;
  
  addComponent(world, Inventory, eid);
  Inventory.ore[eid] = 0;
  Inventory.water[eid] = 0;
  Inventory.alloy[eid] = 0;
  
  addComponent(world, Sprite, eid);
  Sprite.textureId[eid] = 0;
  Sprite.flipX[eid] = 0;
  
  addComponent(world, Trail, eid);
  Trail.active[eid] = 1;
  Trail.maxLength[eid] = 10;
  
  addComponent(world, Player, eid);
  Player.isPlayer[eid] = 1;
  
  return eid;
};

export const createTile = (world: IWorld, x: number, y: number, type: number, biomeValue: number) => {
  const eid = addEntity(world);
  
  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;
  
  addComponent(world, Tile, eid);
  Tile.type[eid] = type;
  Tile.biomeValue[eid] = biomeValue;
  
  return eid;
};
