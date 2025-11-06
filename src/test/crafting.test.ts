/**
 * Crafting System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld } from 'bitecs';
import { createPlayer } from '../ecs/entities';
import { Inventory } from '../ecs/components';
import { createCraftingSystem } from '../ecs/systems/CraftingSystem';

describe('CraftingSystem', () => {
  let world;
  let craftingSystem;
  let playerEid;
  
  beforeEach(() => {
    world = createWorld();
    craftingSystem = createCraftingSystem();
    playerEid = createPlayer(world, 0, 0);
  });
  
  it('should craft alloy from ore and water', () => {
    Inventory.ore[playerEid] = 1;
    Inventory.water[playerEid] = 1;
    Inventory.alloy[playerEid] = 0;
    
    const result = craftingSystem.craft(world, 'alloy');
    
    expect(result.success).toBe(true);
    expect(result.pollution).toBe(1);
    expect(Inventory.ore[playerEid]).toBe(0);
    expect(Inventory.water[playerEid]).toBe(0);
    expect(Inventory.alloy[playerEid]).toBe(1);
  });
  
  it('should not craft without resources', () => {
    Inventory.ore[playerEid] = 0;
    Inventory.water[playerEid] = 0;
    
    const result = craftingSystem.craft(world, 'alloy');
    
    expect(result.success).toBe(false);
    expect(result.pollution).toBe(0);
  });
  
  it('should check if crafting is possible', () => {
    Inventory.ore[playerEid] = 1;
    Inventory.water[playerEid] = 1;
    
    expect(craftingSystem.canCraft(world, 'alloy')).toBe(true);
    
    Inventory.ore[playerEid] = 0;
    expect(craftingSystem.canCraft(world, 'alloy')).toBe(false);
  });
});
