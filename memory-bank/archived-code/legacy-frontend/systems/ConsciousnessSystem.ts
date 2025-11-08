/**
 * Consciousness System - Player as transferable awareness sphere
 * 
 * Player is NOT a fixed character - consciousness can possess any creature
 * Death is relocation, not game over
 * Knowledge persists through RECORDER tool archetypes
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';

export interface ConsciousnessState {
  currentHost: string | null;    // Entity ID of possessed creature
  previousHosts: string[];       // History of possessed creatures
  knowledgePreserved: string[];  // IDs of RECORDER tools accessed
  
  // Consciousness properties (persist across hosts)
  awareness: number;             // 0-1, understanding of ecosystem
  culturalMemory: any[];         // Preserved knowledge from RECORDERs
  preferredPlaystyle: 'harmony' | 'conquest' | 'frolick' | 'observer';
}

class ConsciousnessSystem {
  private world: World<WorldSchema>;
  private consciousnessState: ConsciousnessState;
  private autoMode: boolean = false;  // True = full Yuka control

  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.consciousnessState = {
      currentHost: null,
      previousHosts: [],
      knowledgePreserved: [],
      awareness: 0,
      culturalMemory: [],
      preferredPlaystyle: 'observer'
    };

    log.info('ConsciousnessSystem initialized - Player as awareness sphere');
  }

  /**
   * Possess a creature - transfer consciousness
   */
  possessCreature(targetEntity: Entity<WorldSchema>): void {
    if (!targetEntity.creature || !targetEntity.yukaAgent) {
      log.warn('Cannot possess entity - not a valid creature');
      return;
    }

    // Release current host (if any)
    if (this.consciousnessState.currentHost) {
      const previousHost = this.findEntityById(this.consciousnessState.currentHost);
      if (previousHost) {
        this.releaseHost(previousHost);
      }
    }

    // Possess new host
    this.consciousnessState.currentHost = targetEntity.toString();
    this.consciousnessState.previousHosts.push(targetEntity.toString());

    // Mark entity as player-controlled
    (targetEntity as any).playerControlled = true;

    log.info('Consciousness transferred', {
      newHost: targetEntity.creature.species,
      totalHostsLifetime: this.consciousnessState.previousHosts.length
    });

    // Record consciousness transfer event
    gameClock.recordEvent({
      generation: gameClock.getCurrentTime().generation,
      timestamp: Date.now(),
      eventType: 'environmental_shift',
      description: `Consciousness possessed ${targetEntity.creature.species}`,
      affectedCreatures: [targetEntity],
      traits: [],
      significance: 0.5
    });
  }

  /**
   * Release host - return to Yuka control or switch to another
   */
  private releaseHost(entity: Entity<WorldSchema>): void {
    (entity as any).playerControlled = false;

    log.debug('Host released to Yuka control', {
      species: entity.creature?.species
    });
  }

  /**
   * Auto mode - let Yuka control everything
   */
  setAutoMode(enabled: boolean): void {
    this.autoMode = enabled;

    if (enabled && this.consciousnessState.currentHost) {
      // Release current host to full Yuka
      const host = this.findEntityById(this.consciousnessState.currentHost);
      if (host) {
        this.releaseHost(host);
      }
      this.consciousnessState.currentHost = null;
    }

    log.info('Auto mode toggled', { enabled, message: enabled ? 'Full Yuka control' : 'Player control' });
  }

  /**
   * Handle death of current host
   */
  handleHostDeath(): void {
    if (!this.consciousnessState.currentHost) return;

    log.info('Current host died - consciousness persists', {
      previousHost: this.consciousnessState.currentHost,
      totalPreviousHosts: this.consciousnessState.previousHosts.length
    });

    this.consciousnessState.currentHost = null;

    // Auto-possess another creature if available
    const creatures = this.world.with('creature', 'transform');
    const availableCreatures = Array.from(creatures.entities);

    if (availableCreatures.length > 0) {
      // Pick random creature to possess
      const randomCreature = availableCreatures[Math.floor(Math.random() * availableCreatures.length)];
      this.possessCreature(randomCreature);
    } else {
      log.warn('No creatures available to possess - player in observer mode');
    }
  }

  /**
   * Access knowledge from RECORDER tool
   */
  accessRecorder(recorderEntity: Entity<WorldSchema>): void {
    const toolData = (recorderEntity as any).toolInstance;
    if (!toolData || toolData.archetype !== 'RECORDER') {
      log.warn('Not a valid RECORDER tool');
      return;
    }

    // Preserve knowledge
    const recorderId = recorderEntity.toString();
    if (!this.consciousnessState.knowledgePreserved.includes(recorderId)) {
      this.consciousnessState.knowledgePreserved.push(recorderId);
      this.consciousnessState.awareness += 0.1;

      log.info('Knowledge accessed from RECORDER', {
        totalKnowledgeSources: this.consciousnessState.knowledgePreserved.length,
        awareness: this.consciousnessState.awareness
      });
    }
  }

  /**
   * Get current consciousness state
   */
  getState(): ConsciousnessState {
    return { ...this.consciousnessState };
  }

  /**
   * Get currently possessed creature
   */
  getCurrentHost(): Entity<WorldSchema> | null {
    if (!this.consciousnessState.currentHost) return null;
    return this.findEntityById(this.consciousnessState.currentHost);
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

export default ConsciousnessSystem;
export type { ConsciousnessState };

