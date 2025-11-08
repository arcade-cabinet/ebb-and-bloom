/**
 * Creature Interaction System (Gen2)
 * 
 * Handles creature-to-creature interactions:
 * - Territorial disputes
 * - Mating behaviors
 * - Predator-prey dynamics
 * - Social learning
 * - Pack coordination
 */

export interface Interaction {
  type: 'territorial' | 'mating' | 'predation' | 'social' | 'pack_coordination';
  actorId: string;
  targetId: string;
  strength: number; // 0-1, how intense
  outcome?: 'success' | 'failure' | 'ongoing';
  timestamp: number;
}

export interface CreatureInteractionState {
  position: { lat: number; lon: number };
  traits?: {
    social?: string;
    temperament?: string;
    strength?: number;
    intelligence?: number;
  };
  energy?: number;
  fear?: number;
}

export class CreatureInteractionSystem {
  private activeInteractions: Map<string, Interaction> = new Map();
  private nextInteractionId: number = 0;
  
  // Interaction ranges (in degrees on sphere)
  private readonly TERRITORIAL_RANGE = 5;
  private readonly SOCIAL_RANGE = 10;
  private readonly PREDATION_RANGE = 3;

  /**
   * Update all creature interactions
   */
  update(
    creatures: Map<string, CreatureInteractionState>
  ): Map<string, Interaction> {
    // Clear old interactions
    for (const [id, interaction] of this.activeInteractions) {
      if (Date.now() - interaction.timestamp > 5000) { // 5 second timeout
        this.activeInteractions.delete(id);
      }
    }

    // Check for new interactions
    const creatureList = Array.from(creatures.entries());
    
    for (let i = 0; i < creatureList.length; i++) {
      for (let j = i + 1; j < creatureList.length; j++) {
        const [id1, creature1] = creatureList[i];
        const [id2, creature2] = creatureList[j];
        
        this.checkInteraction(id1, creature1, id2, creature2);
      }
    }

    return this.activeInteractions;
  }

  /**
   * Check if two creatures should interact
   */
  private checkInteraction(
    id1: string,
    creature1: CreatureInteractionState,
    id2: string,
    creature2: CreatureInteractionState
  ): void {
    const dist = this.distanceOnSphere(creature1.position, creature2.position);
    
    // Territorial interaction
    if (dist < this.TERRITORIAL_RANGE) {
      this.checkTerritorialInteraction(id1, creature1, id2, creature2, dist);
    }
    
    // Social interaction (for pack creatures)
    if (dist < this.SOCIAL_RANGE) {
      this.checkSocialInteraction(id1, creature1, id2, creature2);
    }
    
    // Predation (very close range)
    if (dist < this.PREDATION_RANGE) {
      this.checkPredationInteraction(id1, creature1, id2, creature2);
    }
  }

  /**
   * Territorial disputes (two creatures compete for space)
   */
  private checkTerritorialInteraction(
    id1: string,
    creature1: CreatureInteractionState,
    id2: string,
    creature2: CreatureInteractionState,
    distance: number
  ): void {
    const temp1 = creature1.traits?.temperament || 'neutral';
    const temp2 = creature2.traits?.temperament || 'neutral';
    
    // Aggressive creatures engage more
    const isAggressive = temp1 === 'aggressive' || temp2 === 'aggressive';
    
    if (!isAggressive && Math.random() > 0.3) return; // 30% chance for non-aggressive
    
    // Create territorial interaction
    const strength = Math.max(
      creature1.traits?.strength || 0.5,
      creature2.traits?.strength || 0.5
    );
    
    const interaction: Interaction = {
      type: 'territorial',
      actorId: id1,
      targetId: id2,
      strength: strength * (1 - distance / this.TERRITORIAL_RANGE), // Closer = stronger
      outcome: 'ongoing',
      timestamp: Date.now()
    };
    
    this.activeInteractions.set(`interaction-${this.nextInteractionId++}`, interaction);
  }

  /**
   * Social interactions (creatures communicate)
   */
  private checkSocialInteraction(
    id1: string,
    creature1: CreatureInteractionState,
    id2: string,
    creature2: CreatureInteractionState
  ): void {
    const social1 = creature1.traits?.social || 'solitary';
    const social2 = creature2.traits?.social || 'solitary';
    
    // Only pack creatures interact socially
    if (social1 !== 'pack' && social2 !== 'pack') return;
    
    // Both must be pack creatures
    if (social1 === 'pack' && social2 === 'pack') {
      const intelligence = Math.max(
        creature1.traits?.intelligence || 0.5,
        creature2.traits?.intelligence || 0.5
      );
      
      const interaction: Interaction = {
        type: 'social',
        actorId: id1,
        targetId: id2,
        strength: intelligence,
        outcome: 'success',
        timestamp: Date.now()
      };
      
      this.activeInteractions.set(`interaction-${this.nextInteractionId++}`, interaction);
    }
  }

  /**
   * Predation (hunting/fleeing)
   */
  private checkPredationInteraction(
    id1: string,
    creature1: CreatureInteractionState,
    id2: string,
    _creature2: CreatureInteractionState
  ): void {
    // For now, just check if creature1 has low energy (hungry)
    const isHungry = (creature1.energy || 1.0) < 0.3;
    
    if (!isHungry) return;
    
    const interaction: Interaction = {
      type: 'predation',
      actorId: id1,
      targetId: id2,
      strength: 0.8, // High intensity
      outcome: 'ongoing',
      timestamp: Date.now()
    };
    
    this.activeInteractions.set(`interaction-${this.nextInteractionId++}`, interaction);
  }

  /**
   * Calculate distance on sphere
   */
  private distanceOnSphere(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    const dLat = pos2.lat - pos1.lat;
    const dLon = pos2.lon - pos1.lon;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Get interactions for a specific creature
   */
  getInteractionsForCreature(creatureId: string): Interaction[] {
    const result: Interaction[] = [];
    
    for (const interaction of this.activeInteractions.values()) {
      if (interaction.actorId === creatureId || interaction.targetId === creatureId) {
        result.push(interaction);
      }
    }
    
    return result;
  }

  /**
   * Get all active interactions
   */
  getActiveInteractions(): Interaction[] {
    return Array.from(this.activeInteractions.values());
  }
}
