/**
 * Critter Pack System
 * From docs/01-coreLoop.md
 * 
 * Social dynamics: packs form, bond, and react to player behavior
 * Yuka-driven group steering with loyalty and roles
 */

import { defineComponent, Types } from 'bitecs';

// Pack entity component
export const Pack = defineComponent({
  leaderId: Types.ui32,      // Entity ID of pack leader
  loyalty: Types.f32,         // 0-1: Loyalty to player
  size: Types.ui8,            // Number of members
  affMask: Types.ui32,        // Affinity mask (inherited traits)
  packType: Types.ui8         // 0=neutral, 1=ally, 2=rival
});

// Critter component (for individual creatures)
export const Critter = defineComponent({
  species: Types.ui8,         // 0=fish, 1=squirrel, 2=bird, etc
  packId: Types.ui32,         // Pack entity ID (0 if solo)
  role: Types.ui8,            // 0=leader, 1=specialist, 2=follower
  inheritedTrait: Types.ui8,  // Diluted trait from player
  needState: Types.ui8        // 0=idle, 1=foraging, 2=fleeing
});

// Pack formation thresholds
export const PACK_FORMATION = {
  MIN_SIZE: 3,                // Minimum critters to form pack
  MAX_SIZE: 15,               // Maximum pack size
  COHESION_RADIUS: 50,        // Pixels - stay close
  SEPARATION_MIN: 10,         // Pixels - avoid overcrowd
  RECRUIT_CHANCE: 0.2,        // Base 20% chance to recruit nearby
  INHERITANCE_BOOST: 0.2      // +20% recruit if trait match
};

// Pack loyalty modifiers
export const LOYALTY_MODIFIERS = {
  SHARED_SNAP: 0.1,           // +0.1 per cooperative snap
  SHOCK_PENALTY: -0.2,        // -0.2 on world shock
  HARMONY_BONUS: 0.15,        // +0.15 if player harmony > 0.6
  CONQUEST_PENALTY: -0.1,     // -0.1 if player conquest > 0.7
  SCHISM_THRESHOLD: 0.3       // Pack splits if loyalty < 0.3
};

// Pack roles and their functions
export const PACK_ROLES = {
  LEADER: 0,      // Highest trait level, paths to resources
  SPECIALIST: 1,  // Has diluted trait, performs specific tasks
  FOLLOWER: 2     // Basic member, follows leader
};

// Critter species definitions
export const CRITTER_SPECIES = {
  FISH: 0,        // Aquatic, prefers water tiles
  SQUIRREL: 1,    // Forest, gathers from trees
  BIRD: 2,        // Aerial, scouts resources
  BEAVER: 3       // Dams wood for harmony players
};

/**
 * Check if critters should form a pack
 */
export function shouldFormPack(
  critters: number[],
  positions: Map<number, { x: number; y: number }>,
  traits: Map<number, number>
): { form: boolean; members: number[]; leader: number } {
  
  if (critters.length < PACK_FORMATION.MIN_SIZE) {
    return { form: false, members: [], leader: 0 };
  }
  
  // Check proximity - are they close enough?
  const centerX = critters.reduce((sum, id) => sum + (positions.get(id)?.x || 0), 0) / critters.length;
  const centerY = critters.reduce((sum, id) => sum + (positions.get(id)?.y || 0), 0) / critters.length;
  
  const nearby = critters.filter(id => {
    const pos = positions.get(id);
    if (!pos) return false;
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < PACK_FORMATION.COHESION_RADIUS;
  });
  
  if (nearby.length < PACK_FORMATION.MIN_SIZE) {
    return { form: false, members: [], leader: 0 };
  }
  
  // Find leader (highest trait level)
  const leader = nearby.reduce((best, id) => {
    const traitLevel = traits.get(id) || 0;
    const bestTraitLevel = traits.get(best) || 0;
    return traitLevel > bestTraitLevel ? id : best;
  }, nearby[0]);
  
  return { form: true, members: nearby, leader };
}

/**
 * Update pack loyalty based on player actions
 */
export function updatePackLoyalty(
  packEid: number,
  playerAction: 'snap' | 'shock' | 'harmony' | 'conquest',
  playerBehavior: { harmony: number; conquest: number; frolick: number }
): number {
  
  let currentLoyalty = Pack.loyalty[packEid] || 0.5;
  
  switch (playerAction) {
    case 'snap':
      currentLoyalty += LOYALTY_MODIFIERS.SHARED_SNAP;
      break;
    case 'shock':
      currentLoyalty += LOYALTY_MODIFIERS.SHOCK_PENALTY;
      break;
    case 'harmony':
      if (playerBehavior.harmony > 0.6) {
        currentLoyalty += LOYALTY_MODIFIERS.HARMONY_BONUS;
      }
      break;
    case 'conquest':
      if (playerBehavior.conquest > 0.7) {
        currentLoyalty += LOYALTY_MODIFIERS.CONQUEST_PENALTY;
      }
      break;
  }
  
  // Clamp 0-1
  currentLoyalty = Math.max(0, Math.min(1, currentLoyalty));
  Pack.loyalty[packEid] = currentLoyalty;
  
  return currentLoyalty;
}

/**
 * Check if pack should schism (split)
 */
export function shouldPackSchism(packEid: number): boolean {
  const loyalty = Pack.loyalty[packEid] || 0.5;
  return loyalty < LOYALTY_MODIFIERS.SCHISM_THRESHOLD;
}

/**
 * Assign role to critter based on traits
 */
export function assignPackRole(
  critterEid: number,
  isLeader: boolean,
  hasDilutedTrait: boolean
): number {
  
  if (isLeader) {
    Critter.role[critterEid] = PACK_ROLES.LEADER;
    return PACK_ROLES.LEADER;
  }
  
  if (hasDilutedTrait) {
    Critter.role[critterEid] = PACK_ROLES.SPECIALIST;
    return PACK_ROLES.SPECIALIST;
  }
  
  Critter.role[critterEid] = PACK_ROLES.FOLLOWER;
  return PACK_ROLES.FOLLOWER;
}

/**
 * Get pack type based on loyalty
 */
export function getPackType(loyalty: number): 'ally' | 'neutral' | 'rival' {
  if (loyalty > 0.7) return 'ally';
  if (loyalty < 0.4) return 'rival';
  return 'neutral';
}

/**
 * Calculate inheritance chance
 * Player proximity + trait affinity
 */
export function calculateInheritanceChance(
  playerTraitLevel: number,
  playerProximity: number,  // 0-1, closer = higher
  harmonyBonus: number       // 0-0.2 if harmony player
): number {
  
  const baseChance = 0.2; // 20% base
  const traitBonus = playerTraitLevel * 0.05; // +5% per trait level
  const proximityBonus = playerProximity * 0.15; // Up to +15% when close
  
  return Math.min(0.8, baseChance + traitBonus + proximityBonus + harmonyBonus);
}

export const createPackSystem = () => {
  return {
    shouldFormPack,
    updatePackLoyalty,
    shouldPackSchism,
    assignPackRole,
    getPackType,
    calculateInheritanceChance,
    PACK_FORMATION,
    LOYALTY_MODIFIERS,
    PACK_ROLES,
    CRITTER_SPECIES
  };
};
