/**
 * Resource Snapping System - Affinity-based combinatorics
 * From Grok design: Magnetic adjacency with procedural permutations
 */

import { defineQuery } from 'bitecs';
import type { IWorld } from 'bitecs';
import { Position, Inventory } from '../components';
import { Tile } from '../components';

// Affinity bit flags (32-bit mask)
export const AffinityFlags = {
  HEAT: 1 << 0,    // Ores, lava
  FLOW: 1 << 1,    // Water, rivers
  BIND: 1 << 2,    // Wood, soil
  POWER: 1 << 3,   // Wind, geothermal
  LIFE: 1 << 4,    // Plants, critters
  METAL: 1 << 5,   // Refined ores
  VOID: 1 << 6,    // Pollution
  WILD: 1 << 7     // Wildcard (procedural)
};

// Resource affinity definitions
export const RESOURCE_AFFINITIES: Record<string, number> = {
  ore: AffinityFlags.HEAT | AffinityFlags.METAL,
  water: AffinityFlags.FLOW,
  wood: AffinityFlags.BIND | AffinityFlags.LIFE,
  flower: AffinityFlags.LIFE,
  alloy: AffinityFlags.HEAT | AffinityFlags.FLOW | AffinityFlags.METAL,
  circuit: AffinityFlags.METAL | AffinityFlags.POWER,
  power: AffinityFlags.POWER
};

// Snap rules: What combinations create what
interface SnapRule {
  inputs: string[];           // Required resources
  output: string;             // What it creates
  affinityOverlap: number;    // Min bit overlap required
  pollutionCost: number;      // Pollution added
  harmonyBonus?: boolean;     // Bonus for harmony playstyle
}

export const SNAP_RULES: SnapRule[] = [
  {
    inputs: ['ore', 'water'],
    output: 'alloy',
    affinityOverlap: 2,
    pollutionCost: 1
  },
  {
    inputs: ['wood', 'water'],
    output: 'mud',
    affinityOverlap: 1,
    pollutionCost: 0,
    harmonyBonus: true
  },
  {
    inputs: ['alloy', 'power'],
    output: 'circuit',
    affinityOverlap: 2,
    pollutionCost: 2
  },
  {
    inputs: ['ore', 'wood'],
    output: 'tool',
    affinityOverlap: 1,
    pollutionCost: 1
  },
  {
    inputs: ['flower', 'water'],
    output: 'potion',
    affinityOverlap: 2,
    pollutionCost: 0,
    harmonyBonus: true
  }
];

/**
 * Check if two resources have sufficient affinity overlap
 */
export function checkAffinityOverlap(res1: string, res2: string, minOverlap: number): boolean {
  const aff1 = RESOURCE_AFFINITIES[res1] || 0;
  const aff2 = RESOURCE_AFFINITIES[res2] || 0;
  
  const overlap = aff1 & aff2; // Bitwise AND
  const overlapCount = countSetBits(overlap);
  
  return overlapCount >= minOverlap;
}

/**
 * Count set bits in a number (popcount)
 */
function countSetBits(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

/**
 * Attempt to snap/craft resources
 * @returns { success, output, pollution, haiku }
 */
export function attemptSnap(
  inventory: Record<string, number>,
  recipe: string
): { success: boolean; output: string | null; pollution: number; haiku?: string } {
  
  // Find matching snap rule
  const rule = SNAP_RULES.find(r => r.output === recipe);
  
  if (!rule) {
    return { success: false, output: null, pollution: 0 };
  }
  
  // Check if we have all inputs
  const hasInputs = rule.inputs.every(input => inventory[input] > 0);
  
  if (!hasInputs) {
    return { success: false, output: null, pollution: 0 };
  }
  
  // Check affinity overlap for first two inputs
  // Currently disabled for MVP - all snaps work if you have resources
  // TODO: Re-enable after affinity tuning
  /*
  if (rule.inputs.length >= 2) {
    const validAffinity = checkAffinityOverlap(
      rule.inputs[0],
      rule.inputs[1],
      rule.affinityOverlap
    );
    
    if (!validAffinity) {
      return { success: false, output: null, pollution: 0 };
    }
  }
  */
  
  // Success - consume inputs
  rule.inputs.forEach(input => {
    inventory[input]--;
  });
  
  // Add output
  inventory[rule.output] = (inventory[rule.output] || 0) + 1;
  
  // Generate haiku for the snap
  const haiku = generateSnapHaiku(rule.inputs, rule.output);
  
  return {
    success: true,
    output: rule.output,
    pollution: rule.pollutionCost,
    haiku
  };
}

/**
 * Generate a haiku for a successful snap
 */
function generateSnapHaiku(inputs: string[], output: string): string {
  const verb = ['meets', 'joins', 'fuses', 'becomes'][Math.floor(Math.random() * 4)];
  return `${inputs[0]} ${verb} ${inputs[1]}\nthe world whispers\n${output} emerges`;
}

export const createSnappingSystem = () => {
  return {
    attemptSnap,
    checkAffinityOverlap,
    RESOURCE_AFFINITIES,
    SNAP_RULES
  };
};
