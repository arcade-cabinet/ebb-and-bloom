/**
 * Crafting System
 * Handles resource combination and pollution mechanics
 * Basic snap: ore + water = alloy (with haptic feedback)
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class CraftingSystem {
  constructor() {
    this.recipes = {
      alloy: {
        inputs: { ore: 1, water: 1 },
        output: { alloy: 1 },
        pollutionCost: 1
      }
    };
    
    this.pollutionLevel = 0;
    this.maxPollution = 100;
  }

  canCraft(recipe, inventory) {
    const recipeData = this.recipes[recipe];
    if (!recipeData) return false;
    
    // Check if player has required resources
    for (const [resource, amount] of Object.entries(recipeData.inputs)) {
      if (!inventory[resource] || inventory[resource] < amount) {
        return false;
      }
    }
    
    return true;
  }

  async craft(recipe, inventory) {
    if (!this.canCraft(recipe, inventory)) {
      return { success: false, message: 'Insufficient resources' };
    }
    
    const recipeData = this.recipes[recipe];
    
    // Consume inputs
    for (const [resource, amount] of Object.entries(recipeData.inputs)) {
      inventory[resource] -= amount;
    }
    
    // Add outputs
    for (const [resource, amount] of Object.entries(recipeData.output)) {
      if (!inventory[resource]) {
        inventory[resource] = 0;
      }
      inventory[resource] += amount;
    }
    
    // Increase pollution
    this.pollutionLevel = Math.min(
      this.maxPollution,
      this.pollutionLevel + recipeData.pollutionCost
    );
    
    // Trigger haptic feedback
    await this.triggerHapticFeedback();
    
    return {
      success: true,
      message: `Crafted ${recipe}!`,
      pollution: this.pollutionLevel
    };
  }

  async triggerHapticFeedback() {
    try {
      // Medium impact vibration for crafting success
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      // Haptics might not be available in browser/simulator
      console.log('Haptics not available:', error.message);
    }
  }

  getPollutionLevel() {
    return this.pollutionLevel;
  }

  getPollutionPercentage() {
    return (this.pollutionLevel / this.maxPollution) * 100;
  }

  resetPollution() {
    this.pollutionLevel = 0;
  }
}

export default CraftingSystem;
