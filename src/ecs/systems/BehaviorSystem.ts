/**
 * Behavior Profiling System
 * From docs/03-pollutionShocks.md and docs/06-crafting.md
 * 
 * Yuka-inspired player behavior tracking
 * Harmony vs Conquest vs Frolick - no judgment, just consequence
 */

import { defineComponent, Types } from 'bitecs';

// Player behavior profile component
export const BehaviorProfile = defineComponent({
  harmony: Types.f32,    // 0-1: Balanced, restoration-focused
  conquest: Types.f32,   // 0-1: Extractive, forge-building
  frolick: Types.f32,    // 0-1: Whimsical, low-impact exploration
  
  // Action counters (last 100 actions)
  plantActions: Types.ui8,
  chopActions: Types.ui8,
  mineActions: Types.ui8,
  craftActions: Types.ui8,
  wanderActions: Types.ui8,
  restoreActions: Types.ui8
});

// Rolling window for action tracking
const ACTION_WINDOW_SIZE = 100;

interface ActionHistory {
  actions: Array<'plant' | 'chop' | 'mine' | 'craft' | 'wander' | 'restore'>;
  timestamps: number[];
}

/**
 * Record player action and update behavior profile
 */
export function recordAction(
  eid: number,
  action: 'plant' | 'chop' | 'mine' | 'craft' | 'wander' | 'restore',
  history: ActionHistory
): void {
  
  // Add to rolling window
  history.actions.push(action);
  history.timestamps.push(Date.now());
  
  // Keep only last 100 actions
  if (history.actions.length > ACTION_WINDOW_SIZE) {
    history.actions.shift();
    history.timestamps.shift();
  }
  
  // Update counters
  switch (action) {
    case 'plant':
    case 'restore':
      BehaviorProfile.restoreActions[eid]++;
      break;
    case 'chop':
    case 'mine':
      if (action === 'chop') BehaviorProfile.chopActions[eid]++;
      if (action === 'mine') BehaviorProfile.mineActions[eid]++;
      break;
    case 'craft':
      BehaviorProfile.craftActions[eid]++;
      break;
    case 'wander':
      BehaviorProfile.wanderActions[eid]++;
      break;
  }
  
  // Recalculate profile
  updateBehaviorProfile(eid, history);
}

/**
 * Calculate behavior profile from action history
 * Harmony: Balance, restoration
 * Conquest: Extraction, crafting
 * Frolick: Wandering, low impact
 */
function updateBehaviorProfile(eid: number, history: ActionHistory): void {
  const actions = history.actions;
  const total = actions.length;
  
  if (total === 0) {
    BehaviorProfile.harmony[eid] = 0.33;
    BehaviorProfile.conquest[eid] = 0.33;
    BehaviorProfile.frolick[eid] = 0.33;
    return;
  }
  
  // Count action types
  const plantCount = actions.filter(a => a === 'plant' || a === 'restore').length;
  const extractCount = actions.filter(a => a === 'chop' || a === 'mine').length;
  const craftCount = actions.filter(a => a === 'craft').length;
  const wanderCount = actions.filter(a => a === 'wander').length;
  
  // Calculate balance ratio (plant vs extract)
  const balanceRatio = extractCount > 0 ? plantCount / extractCount : 1.0;
  
  // Harmony: High balance + restoration
  const harmonyScore = Math.min(1.0, (balanceRatio * 0.6) + ((plantCount / total) * 0.4));
  
  // Conquest: High extraction + crafting
  const conquestScore = Math.min(1.0, 
    ((extractCount / total) * 0.5) + ((craftCount / total) * 0.5)
  );
  
  // Frolick: High wandering, low everything else
  const frolickScore = Math.min(1.0, 
    (wanderCount / total) * 0.8 + (1 - ((extractCount + craftCount) / total)) * 0.2
  );
  
  // Normalize to sum to 1.0
  const sum = harmonyScore + conquestScore + frolickScore;
  
  BehaviorProfile.harmony[eid] = harmonyScore / sum;
  BehaviorProfile.conquest[eid] = conquestScore / sum;
  BehaviorProfile.frolick[eid] = frolickScore / sum;
}

/**
 * Get dominant playstyle
 */
export function getDominantPlaystyle(eid: number): 'harmony' | 'conquest' | 'frolick' {
  const harmony = BehaviorProfile.harmony[eid] || 0;
  const conquest = BehaviorProfile.conquest[eid] || 0;
  const frolick = BehaviorProfile.frolick[eid] || 0;
  
  if (harmony > conquest && harmony > frolick) return 'harmony';
  if (conquest > harmony && conquest > frolick) return 'conquest';
  return 'frolick';
}

/**
 * Get behavior-specific buff/consequence
 */
export function getPlaystyleEffect(eid: number): {
  name: string;
  description: string;
  buff: string;
  consequence: string;
} {
  const style = getDominantPlaystyle(eid);
  
  switch (style) {
    case 'harmony':
      return {
        name: 'Harmonic Resonance',
        description: 'Balanced restoration and growth',
        buff: '+20% Evo Point gain from serene vibes',
        consequence: 'Pollution dissipates 50% faster'
      };
      
    case 'conquest':
      return {
        name: 'Apex Forge-Lord',
        description: 'Industrial extraction and crafting',
        buff: 'Unlock heat-resistant traits and golem workers',
        consequence: 'Shocks trigger 30% sooner, evolved rivals emerge'
      };
      
    case 'frolick':
      return {
        name: 'Whimsy Wanderer',
        description: 'Low-impact exploration and wonder',
        buff: 'Random delight events: bioluminescent migrations, echo wings',
        consequence: 'Resources spawn slower, but with unique variants'
      };
  }
}

/**
 * World reaction based on playstyle
 * Used by ecosystem and pollution systems
 */
export function getWorldReactionModifiers(eid: number): {
  pollutionRate: number;      // Multiplier for pollution accumulation
  shockThreshold: number;     // Modifier to shock threshold
  evolutionBias: string;      // How creatures evolve
  resourceSpawnRate: number;  // Resource availability
} {
  const style = getDominantPlaystyle(eid);
  const profile = {
    harmony: BehaviorProfile.harmony[eid] || 0,
    conquest: BehaviorProfile.conquest[eid] || 0,
    frolick: BehaviorProfile.frolick[eid] || 0
  };
  
  switch (style) {
    case 'harmony':
      return {
        pollutionRate: 0.7,           // 30% less pollution
        shockThreshold: 1.2,          // 20% higher threshold
        evolutionBias: 'symbiotic',   // Creatures become allies
        resourceSpawnRate: 1.1        // 10% more resources
      };
      
    case 'conquest':
      return {
        pollutionRate: 1.5,           // 50% more pollution
        shockThreshold: 0.8,          // 20% lower threshold (shocks sooner)
        evolutionBias: 'territorial',  // Creatures become rivals
        resourceSpawnRate: 0.9        // 10% fewer resources (depletion)
      };
      
    case 'frolick':
      return {
        pollutionRate: 0.5,           // 50% less pollution
        shockThreshold: 1.5,          // 50% higher threshold
        evolutionBias: 'whimsical',   // Creatures become playful
        resourceSpawnRate: 0.8        // 20% fewer but more unique
      };
  }
}

export const createBehaviorSystem = () => {
  return {
    recordAction,
    getDominantPlaystyle,
    getPlaystyleEffect,
    getWorldReactionModifiers
  };
};
