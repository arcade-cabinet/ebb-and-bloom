/**
 * Combat Components - Health, Combat, Momentum for Conquest playstyle
 * 
 * Combat emerges from environmental pressure and territorial conflict
 * NOT a separate game mode - integrated into evolutionary ecosystem
 */

export interface HealthComponent {
  maxHealth: number;
  currentHealth: number;
  regenerationRate: number;  // HP per second
  damageResistance: number;  // 0-1, from defense trait
  toxinResistance: number;   // 0-1, from filtration trait
}

export interface CombatComponent {
  attackPower: number;       // Base damage
  attackSpeed: number;       // Attacks per second
  attackRange: number;       // Meters
  combatStyle: 'aggressive' | 'defensive' | 'evasive' | 'toxic';
  
  // Derived from traits
  physicalDamage: number;    // From strength/manipulation
  toxicDamage: number;       // From toxicity trait
  armorPenetration: number;  // From attack precision
}

export interface MomentumComponent {
  currentMomentum: number;   // 0-100, builds during combat
  momentumDecayRate: number; // How fast it decays
  
  // Momentum effects
  damageMultiplier: number;  // 1.0-2.0 based on momentum
  speedMultiplier: number;   // 1.0-1.5 based on momentum
  resistanceBonus: number;   // 0-0.5 based on momentum
}

export interface CombatStateComponent {
  inCombat: boolean;
  target: string | null;     // Entity ID of combat target
  lastAttackTime: number;
  combatStartTime: number;
  kills: number;
  deaths: number;
}

