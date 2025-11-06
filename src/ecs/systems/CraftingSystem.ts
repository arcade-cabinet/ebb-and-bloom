/**
 * Crafting System - Handles resource combination
 */

import { defineQuery } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Player, Inventory } from '../components';

const playerQuery = defineQuery([Player, Inventory]);

export const createCraftingSystem = () => {
  return {
    canCraft(world: IWorld, recipe: string): boolean {
      const entities = playerQuery(world);
      if (entities.length === 0) return false;
      
      const eid = entities[0];
      
      if (recipe === 'alloy') {
        return Inventory.ore[eid] > 0 && Inventory.water[eid] > 0;
      }
      
      return false;
    },
    
    craft(world: IWorld, recipe: string): { success: boolean; pollution: number } {
      const entities = playerQuery(world);
      if (entities.length === 0) return { success: false, pollution: 0 };
      
      const eid = entities[0];
      
      if (recipe === 'alloy' && this.canCraft(world, recipe)) {
        Inventory.ore[eid]--;
        Inventory.water[eid]--;
        Inventory.alloy[eid]++;
        
        return { success: true, pollution: 1 };
      }
      
      return { success: false, pollution: 0 };
    }
  };
};
