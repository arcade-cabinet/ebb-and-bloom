/**
 * Combat System - Territorial conflict and predation
 * 
 * Emerges from:
 * - Resource scarcity
 * - Territorial pressure
 * - Conquest playstyle
 * - Trait evolution (high aggression/toxicity)
 * 
 * Integrated with Deconstruction System - kills yield generational parts
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';
import type { HealthComponent, CombatComponent, MomentumComponent, CombatStateComponent } from '../world/CombatComponents';
import DeconstructionSystem from './DeconstructionSystem';

class CombatSystem {
  private world: World<WorldSchema>;
  private deconstructionSystem: DeconstructionSystem;
  private combatPairs: Map<string, string> = new Map(); // entity1 -> entity2

  constructor(world: World<WorldSchema>, deconstructionSystem: DeconstructionSystem) {
    this.world = world;
    this.deconstructionSystem = deconstructionSystem;
    log.info('CombatSystem initialized - Conquest playstyle enabled');
  }

  /**
   * Initialize combat components on a creature
   */
  initializeCombatant(entity: Entity<WorldSchema>): void {
    const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
    if (!evolutionData || !entity.creature) return;

    const traits = evolutionData.currentTraits;

    // Derive combat stats from traits
    const health: HealthComponent = {
      maxHealth: 100 + (traits[8] * 50), // Defense trait increases max health
      currentHealth: 100 + (traits[8] * 50),
      regenerationRate: 0.5 + (traits[7] * 1.0), // Filtration affects regen
      damageResistance: traits[8] || 0,  // Defense trait
      toxinResistance: traits[7] || 0    // Filtration trait
    };

    const combat: CombatComponent = {
      attackPower: 10 + (traits[0] * 15) + (traits[1] * 10), // Mobility + manipulation
      attackSpeed: 0.5 + (traits[0] * 1.0),  // Mobility affects attack speed
      attackRange: 1.0 + (traits[1] * 1.5),  // Manipulation affects range
      combatStyle: this.determineCombatStyle(traits),
      physicalDamage: 10 + (traits[1] * 20),
      toxicDamage: (traits[9] || 0) * 30,    // Toxicity trait
      armorPenetration: (traits[2] || 0) * 0.5  // Excavation as penetration
    };

    const momentum: MomentumComponent = {
      currentMomentum: 0,
      momentumDecayRate: 5, // Decays 5 per second
      damageMultiplier: 1.0,
      speedMultiplier: 1.0,
      resistanceBonus: 0
    };

    const combatState: CombatStateComponent = {
      inCombat: false,
      target: null,
      lastAttackTime: 0,
      combatStartTime: 0,
      kills: 0,
      deaths: 0
    };

    // Store combat data on entity
    (entity as any).health = health;
    (entity as any).combat = combat;
    (entity as any).momentum = momentum;
    (entity as any).combatState = combatState;

    log.debug('Combatant initialized', {
      species: entity.creature.species,
      maxHealth: health.maxHealth,
      attackPower: combat.attackPower,
      combatStyle: combat.combatStyle
    });
  }

  private determineCombatStyle(traits: number[]): 'aggressive' | 'defensive' | 'evasive' | 'toxic' {
    if (traits[9] > 0.6) return 'toxic';      // High toxicity
    if (traits[8] > 0.6) return 'defensive';  // High defense
    if (traits[0] > 0.7) return 'evasive';    // High mobility
    return 'aggressive';                       // Default
  }

  /**
   * Update combat logic - detect conflicts, process attacks
   */
  update(deltaTime: number): void {
    const creatures = this.world.with('creature', 'transform');

    for (const entity of creatures.entities) {
      const combatState = (entity as any).combatState as CombatStateComponent;
      const health = (entity as any).health as HealthComponent;
      const momentum = (entity as any).momentum as MomentumComponent;

      if (!combatState || !health || !momentum) {
        // Initialize combat components if missing
        this.initializeCombatant(entity);
        continue;
      }

      // Regenerate health
      if (health.currentHealth < health.maxHealth && !combatState.inCombat) {
        health.currentHealth = Math.min(
          health.maxHealth,
          health.currentHealth + health.regenerationRate * deltaTime
        );
      }

      // Decay momentum when not in combat
      if (!combatState.inCombat && momentum.currentMomentum > 0) {
        momentum.currentMomentum = Math.max(0, momentum.currentMomentum - momentum.momentumDecayRate * deltaTime);
        this.updateMomentumEffects(momentum);
      }

      // Detect nearby threats
      if (!combatState.inCombat) {
        const threat = this.detectNearbyThreat(entity, creatures.entities);
        if (threat) {
          this.initiateCombat(entity, threat);
        }
      }

      // Process ongoing combat
      if (combatState.inCombat && combatState.target) {
        this.processCombat(entity, combatState.target, deltaTime);
      }

      // Check for death
      if (health.currentHealth <= 0) {
        this.handleDeath(entity);
      }
    }
  }

  private detectNearbyThreat(entity: Entity<WorldSchema>, allCreatures: Iterable<Entity<WorldSchema>>): Entity<WorldSchema> | null {
    if (!entity.transform) return null;

    const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
    if (!evolutionData) return null;

    // Conquest playstyle creatures seek combat
    const aggressionLevel = evolutionData.currentTraits[0] * evolutionData.currentTraits[8]; // Mobility * defense

    if (aggressionLevel < 0.3) return null; // Too passive for combat

    const THREAT_RANGE = 10;

    for (const other of allCreatures) {
      if (other === entity || !other.transform) continue;

      const distance = entity.transform.position.distanceTo(other.transform.position);

      if (distance < THREAT_RANGE) {
        // Check if other is threat (different pack, territorial conflict)
        const otherEvolution = (other as any).evolutionaryCreature as EvolutionaryCreature;
        if (otherEvolution && otherEvolution.packMembership !== evolutionData.packMembership) {
          return other;
        }
      }
    }

    return null;
  }

  private initiateCombat(attacker: Entity<WorldSchema>, target: Entity<WorldSchema>): void {
    const attackerState = (attacker as any).combatState as CombatStateComponent;
    const targetState = (target as any).combatState as CombatStateComponent;

    if (!attackerState || !targetState) return;

    attackerState.inCombat = true;
    attackerState.target = target.toString();
    attackerState.combatStartTime = Date.now();

    targetState.inCombat = true;
    targetState.target = attacker.toString();
    targetState.combatStartTime = Date.now();

    this.combatPairs.set(attacker.toString(), target.toString());

    log.info('Combat initiated', {
      attacker: (attacker.creature as any)?.species,
      target: (target.creature as any)?.species
    });

    // Record combat event
    gameClock.recordEvent({
      generation: gameClock.getCurrentTime().generation,
      timestamp: Date.now(),
      eventType: 'environmental_shift',
      description: 'Territorial combat initiated',
      affectedCreatures: [attacker, target],
      traits: [],
      significance: 0.6
    });
  }

  private processCombat(attacker: Entity<WorldSchema>, targetId: string, deltaTime: number): void {
    const attackerCombat = (attacker as any).combat as CombatComponent;
    const attackerMomentum = (attacker as any).momentum as MomentumComponent;
    const attackerState = (attacker as any).combatState as CombatStateComponent;

    if (!attackerCombat || !attackerMomentum || !attackerState) return;

    // Find target entity
    const target = this.findEntityById(targetId);
    if (!target) {
      this.endCombat(attacker);
      return;
    }

    const targetHealth = (target as any).health as HealthComponent;
    if (!targetHealth) {
      this.endCombat(attacker);
      return;
    }

    // Check attack cooldown
    const now = Date.now();
    const attackCooldown = 1000 / attackerCombat.attackSpeed; // ms between attacks

    if (now - attackerState.lastAttackTime < attackCooldown) {
      return;
    }

    // Execute attack
    const damage = this.calculateDamage(attacker, target);
    targetHealth.currentHealth -= damage;
    attackerState.lastAttackTime = now;

    // Build momentum
    attackerMomentum.currentMomentum = Math.min(100, attackerMomentum.currentMomentum + 10);
    this.updateMomentumEffects(attackerMomentum);

    log.debug('Combat attack executed', {
      damage,
      targetHealthRemaining: targetHealth.currentHealth,
      attackerMomentum: attackerMomentum.currentMomentum
    });
  }

  private calculateDamage(attacker: Entity<WorldSchema>, target: Entity<WorldSchema>): number {
    const attackerCombat = (attacker as any).combat as CombatComponent;
    const attackerMomentum = (attacker as any).momentum as MomentumComponent;
    const targetHealth = (target as any).health as HealthComponent;

    if (!attackerCombat || !attackerMomentum || !targetHealth) return 0;

    let damage = attackerCombat.attackPower;

    // Momentum multiplier
    damage *= attackerMomentum.damageMultiplier;

    // Toxic damage
    damage += attackerCombat.toxicDamage * (1 - targetHealth.toxinResistance);

    // Armor penetration vs resistance
    const effectiveResistance = Math.max(0, targetHealth.damageResistance - attackerCombat.armorPenetration);
    damage *= (1 - effectiveResistance);

    return damage;
  }

  private updateMomentumEffects(momentum: MomentumComponent): void {
    // Momentum 0-100 affects multipliers
    const momentumRatio = momentum.currentMomentum / 100;

    momentum.damageMultiplier = 1.0 + (momentumRatio * 1.0); // 1.0 → 2.0
    momentum.speedMultiplier = 1.0 + (momentumRatio * 0.5);  // 1.0 → 1.5
    momentum.resistanceBonus = momentumRatio * 0.5;          // 0 → 0.5
  }

  private handleDeath(entity: Entity<WorldSchema>): void {
    if (!entity.creature) return;

    log.info('Creature death via combat', {
      species: entity.creature.species,
      position: entity.transform?.position.toArray()
    });

    // CRITICAL: Deconstruct creature into generational parts
    const parts = this.deconstructionSystem.deconstructCreature(entity);

    log.info('Creature deconstructed on death', {
      partsYielded: parts.length,
      partNames: parts.map(p => p.name)
    });

    // Record death event
    gameClock.recordEvent({
      generation: gameClock.getCurrentTime().generation,
      timestamp: Date.now(),
      eventType: 'trait_loss',
      description: `Creature died - ${parts.length} parts yielded`,
      affectedCreatures: [entity],
      traits: [],
      significance: 0.8
    });

    // End any combat this creature was in
    this.endCombat(entity);
  }

  private endCombat(entity: Entity<WorldSchema>): void {
    const combatState = (entity as any).combatState as CombatStateComponent;
    if (!combatState) return;

    combatState.inCombat = false;
    combatState.target = null;

    this.combatPairs.delete(entity.toString());
  }

  private findEntityById(id: string): Entity<WorldSchema> | null {
    const creatures = this.world.with('creature', 'transform');
    for (const entity of creatures.entities) {
      if (entity.toString() === id) {
        return entity;
      }
    }
    return null;
  }
}

export default CombatSystem;

