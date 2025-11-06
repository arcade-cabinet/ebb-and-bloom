/**
 * Pollution & Shock System
 * From docs/03-pollutionShocks.md
 * 
 * Tracks pollution accumulation and triggers world transformation "shocks"
 * No punishment - just consequence and evolution
 */

import { defineQuery } from 'bitecs';
import type { IWorld } from 'bitecs';
import { defineComponent, Types } from 'bitecs';

// Pollution component for tiles
export const Pollution = defineComponent({
  echo: Types.ui8,  // 0-100 pollution level
  tainted: Types.ui8 // Boolean: permanently corrupted
});

// Shock history component
export const ShockHistory = defineComponent({
  shockCount: Types.ui8,
  lastShockTime: Types.f32,
  scarMarkers: Types.ui8 // Number of permanent scars
});

// Pollution thresholds for shock events
export const SHOCK_THRESHOLDS = {
  WHISPER: 40,   // Mild shock - subtle mutations
  TEMPEST: 70,   // Major shock - cataclysmic event
  COLLAPSE: 90   // World-altering transformation
};

// Pollution sources with echo values
export const POLLUTION_SOURCES = {
  chainsaw: 5,      // Chopping trees
  mining: 3,        // Ore extraction
  forge: 10,        // Heavy industry
  alloy_craft: 1,   // Basic crafting
  circuit_craft: 2, // Advanced crafting
  flood: 3          // Terraforming water
};

/**
 * Calculate global pollution from all tiles
 */
export function calculateGlobalPollution(world: IWorld, tiles: number[]): number {
  let totalPollution = 0;
  let tileCount = 0;
  
  for (const eid of tiles) {
    if (Pollution.echo[eid] !== undefined) {
      totalPollution += Pollution.echo[eid];
      tileCount++;
    }
  }
  
  return tileCount > 0 ? totalPollution / tileCount : 0;
}

/**
 * Add pollution to a tile/chunk
 */
export function addPollution(eid: number, amount: number): void {
  const current = Pollution.echo[eid] || 0;
  Pollution.echo[eid] = Math.min(100, current + amount);
}

/**
 * Check if shock should trigger
 */
export function shouldTriggerShock(
  globalPollution: number,
  lastShockTime: number,
  currentTime: number
): { trigger: boolean; type: 'whisper' | 'tempest' | 'collapse' | null } {
  
  // Minimum time between shocks: 5 minutes (300000ms)
  const MIN_SHOCK_INTERVAL = 300000;
  const timeSinceShock = currentTime - lastShockTime;
  
  if (timeSinceShock < MIN_SHOCK_INTERVAL) {
    return { trigger: false, type: null };
  }
  
  if (globalPollution >= SHOCK_THRESHOLDS.COLLAPSE) {
    return { trigger: true, type: 'collapse' };
  } else if (globalPollution >= SHOCK_THRESHOLDS.TEMPEST) {
    return { trigger: true, type: 'tempest' };
  } else if (globalPollution >= SHOCK_THRESHOLDS.WHISPER) {
    return { trigger: true, type: 'whisper' };
  }
  
  return { trigger: false, type: null };
}

/**
 * Execute shock event
 * @returns Description of what happened
 */
export function executeShock(
  world: IWorld,
  type: 'whisper' | 'tempest' | 'collapse',
  playstyle: { harmony: number; conquest: number; frolick: number }
): {
  description: string;
  mutations: string[];
  pollutionChange: number;
  evoCost: number;
} {
  
  switch (type) {
    case 'whisper':
      // Mild shock: Subtle mutations
      return {
        description: 'The world whispers... creatures stir with new defenses.',
        mutations: [
          'Fish gain toxin spines',
          'Trees develop thorns',
          'Ore veins shift deeper'
        ],
        pollutionChange: -10, // Slight cleanup
        evoCost: 2 // Adaptation cost
      };
      
    case 'tempest':
      // Major shock: Cataclysmic transformation
      const tempestMutations = [
        'Rivers boil over, spawning lava biomes',
        '50% creature cull - survivors hyper-evolve',
        'World expands by 20% at borders'
      ];
      
      if (playstyle.conquest > 0.6) {
        tempestMutations.push('Acid Wyrms emerge to guard clean zones');
      } else if (playstyle.harmony > 0.6) {
        tempestMutations.push('Eternal groves bloom in clean pockets');
      } else {
        tempestMutations.push('Whimsy fissures open with random buffs');
      }
      
      return {
        description: 'TEMPEST! The world transforms in fury and beauty.',
        mutations: tempestMutations,
        pollutionChange: -40, // Major cleanup
        evoCost: 5
      };
      
    case 'collapse':
      // World-altering: Complete reset with memory
      return {
        description: 'COLLAPSE... then REBIRTH. The world remembers.',
        mutations: [
          'All pollution cleared',
          'Biomes reseed with scars',
          'Mega-evolutions unlock',
          'New resource types emerge from chaos'
        ],
        pollutionChange: -100, // Complete reset
        evoCost: 0 // Free adaptation - world's gift
      };
      
    default:
      return {
        description: '',
        mutations: [],
        pollutionChange: 0,
        evoCost: 0
      };
  }
}

/**
 * Mitigation: Purity Grove ritual
 * Costs resources but reduces pollution in radius
 */
export function plantPurityGrove(
  centerTile: number,
  radius: number,
  tiles: number[]
): { success: boolean; pollutionReduced: number } {
  
  let reduced = 0;
  
  // Simple radius check - reduce pollution for nearby tiles
  // Assuming centerTile is an entity ID with a Position component
  const centerX = Position.x[centerTile];
  const centerY = Position.y[centerTile];

  for (const tileEid of tiles) {
    const tileX = Position.x[tileEid];
    const tileY = Position.y[tileEid];
    const dx = tileX - centerX;
    const dy = tileY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      const current = Pollution.echo[tileEid] || 0;
      const reduction = Math.min(current, 15); // -15 pollution per tile
      Pollution.echo[tileEid] = current - reduction;
      reduced += reduction;
    }
  }
  
  return {
    success: true,
    pollutionReduced: reduced
  };
}

export const createPollutionSystem = () => {
  return {
    calculateGlobalPollution,
    addPollution,
    shouldTriggerShock,
    executeShock,
    plantPurityGrove,
    POLLUTION_SOURCES,
    SHOCK_THRESHOLDS
  };
};
