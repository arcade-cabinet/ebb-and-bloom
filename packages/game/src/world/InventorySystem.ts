/**
 * INVENTORY SYSTEM
 * 
 * Simple inventory management for player items.
 * Based on Daggerfall's weight-based system.
 * 
 * Features:
 * - Weight limit (based on strength - future)
 * - Item stacking
 * - Item categories (tools, food, materials)
 * - Deterministic item generation from laws
 */

export enum ItemCategory {
  TOOL = 'tool',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  FOOD = 'food',
  MATERIAL = 'material',
  QUEST = 'quest'
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  weight: number;        // kg
  stackable: boolean;
  maxStack?: number;
  description: string;
  value?: number;        // Base trade value
}

export interface InventoryItem {
  definition: ItemDefinition;
  quantity: number;
  condition?: number;    // 0-100 (for tools/weapons)
}

export class InventorySystem {
  private items: Map<string, InventoryItem> = new Map();
  private maxWeight: number = 50;  // kg (future: based on player strength)
  
  constructor(maxWeight: number = 50) {
    this.maxWeight = maxWeight;
  }
  
  /**
   * Add item to inventory
   * Returns true if successful, false if inventory full
   */
  addItem(definition: ItemDefinition, quantity: number = 1, condition: number = 100): boolean {
    // Check weight limit
    const totalWeight = this.getTotalWeight();
    const newWeight = definition.weight * quantity;
    
    if (totalWeight + newWeight > this.maxWeight) {
      console.warn(`[Inventory] Too heavy! ${totalWeight + newWeight}kg > ${this.maxWeight}kg`);
      return false;
    }
    
    // If stackable, try to add to existing stack
    if (definition.stackable) {
      const existing = this.items.get(definition.id);
      if (existing) {
        const maxStack = definition.maxStack || Infinity;
        const canAdd = Math.min(quantity, maxStack - existing.quantity);
        existing.quantity += canAdd;
        
        // Return true if we added all, false if some leftover
        return canAdd === quantity;
      }
    }
    
    // Add new item
    this.items.set(definition.id, {
      definition,
      quantity,
      condition
    });
    
    console.log(`[Inventory] Added ${quantity}x ${definition.name}`);
    return true;
  }
  
  /**
   * Remove item from inventory
   * Returns true if successful
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`[Inventory] Item not found: ${itemId}`);
      return false;
    }
    
    if (item.quantity < quantity) {
      console.warn(`[Inventory] Not enough ${item.definition.name} (have ${item.quantity}, need ${quantity})`);
      return false;
    }
    
    item.quantity -= quantity;
    
    // Remove if quantity is 0
    if (item.quantity <= 0) {
      this.items.delete(itemId);
    }
    
    console.log(`[Inventory] Removed ${quantity}x ${item.definition.name}`);
    return true;
  }
  
  /**
   * Check if player has item
   */
  hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    return item !== undefined && item.quantity >= quantity;
  }
  
  /**
   * Get item count
   */
  getItemCount(itemId: string): number {
    const item = this.items.get(itemId);
    return item ? item.quantity : 0;
  }
  
  /**
   * Get all items
   */
  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }
  
  /**
   * Get items by category
   */
  getItemsByCategory(category: ItemCategory): InventoryItem[] {
    return Array.from(this.items.values())
      .filter(item => item.definition.category === category);
  }
  
  /**
   * Get total weight
   */
  getTotalWeight(): number {
    let total = 0;
    for (const item of this.items.values()) {
      total += item.definition.weight * item.quantity;
    }
    return total;
  }
  
  /**
   * Get remaining capacity
   */
  getRemainingCapacity(): number {
    return this.maxWeight - this.getTotalWeight();
  }
  
  /**
   * Clear inventory
   */
  clear(): void {
    this.items.clear();
    console.log('[Inventory] Cleared');
  }
  
  /**
   * Serialize inventory for saving
   */
  serialize(): string {
    const data = {
      maxWeight: this.maxWeight,
      items: Array.from(this.items.entries())
    };
    return JSON.stringify(data);
  }
  
  /**
   * Deserialize inventory from save
   */
  static deserialize(json: string): InventorySystem {
    const data = JSON.parse(json);
    const inventory = new InventorySystem(data.maxWeight);
    
    for (const [id, item] of data.items) {
      inventory.items.set(id, item as InventoryItem);
    }
    
    return inventory;
  }
}

/**
 * PREDEFINED ITEMS
 * 
 * Basic item library. In future, these will be procedurally generated
 * from MaterialLaws, BiologyLaws, etc.
 */
export const ItemLibrary: Record<string, ItemDefinition> = {
  // Tools
  STONE_AXE: {
    id: 'stone_axe',
    name: 'Stone Axe',
    category: ItemCategory.TOOL,
    weight: 1.5,
    stackable: false,
    description: 'A crude axe with a stone head. Good for chopping wood.',
    value: 5
  },
  
  STONE_PICKAXE: {
    id: 'stone_pickaxe',
    name: 'Stone Pickaxe',
    category: ItemCategory.TOOL,
    weight: 2.0,
    stackable: false,
    description: 'A stone tool for mining.',
    value: 8
  },
  
  // Weapons
  WOODEN_CLUB: {
    id: 'wooden_club',
    name: 'Wooden Club',
    category: ItemCategory.WEAPON,
    weight: 1.0,
    stackable: false,
    description: 'A simple wooden club.',
    value: 3
  },
  
  STONE_SPEAR: {
    id: 'stone_spear',
    name: 'Stone Spear',
    category: ItemCategory.WEAPON,
    weight: 1.2,
    stackable: false,
    description: 'A wooden spear with a stone tip.',
    value: 10
  },
  
  // Materials
  WOOD: {
    id: 'wood',
    name: 'Wood',
    category: ItemCategory.MATERIAL,
    weight: 0.5,
    stackable: true,
    maxStack: 99,
    description: 'Logs suitable for crafting.',
    value: 1
  },
  
  STONE: {
    id: 'stone',
    name: 'Stone',
    category: ItemCategory.MATERIAL,
    weight: 1.0,
    stackable: true,
    maxStack: 99,
    description: 'Hard rock for tools and construction.',
    value: 1
  },
  
  FLINT: {
    id: 'flint',
    name: 'Flint',
    category: ItemCategory.MATERIAL,
    weight: 0.2,
    stackable: true,
    maxStack: 99,
    description: 'Sharp stone for making tools.',
    value: 2
  },
  
  FIBER: {
    id: 'fiber',
    name: 'Plant Fiber',
    category: ItemCategory.MATERIAL,
    weight: 0.1,
    stackable: true,
    maxStack: 99,
    description: 'Tough plant fibers for rope and binding.',
    value: 1
  },
  
  // Food
  BERRIES: {
    id: 'berries',
    name: 'Berries',
    category: ItemCategory.FOOD,
    weight: 0.1,
    stackable: true,
    maxStack: 50,
    description: 'Wild berries. Restores a little hunger.',
    value: 1
  },
  
  MEAT: {
    id: 'meat',
    name: 'Raw Meat',
    category: ItemCategory.FOOD,
    weight: 0.5,
    stackable: true,
    maxStack: 20,
    description: 'Raw animal meat. Should be cooked.',
    value: 3
  },
  
  COOKED_MEAT: {
    id: 'cooked_meat',
    name: 'Cooked Meat',
    category: ItemCategory.FOOD,
    weight: 0.4,
    stackable: true,
    maxStack: 20,
    description: 'Cooked meat. Restores hunger.',
    value: 5
  }
};

