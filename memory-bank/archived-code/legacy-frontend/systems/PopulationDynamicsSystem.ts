/**
 * Population Dynamics System - Breeding, death, carrying capacity
 * Manages population growth, death, and ecological carrying capacity
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';
import type { EvolutionaryCreature, CreatureArchetype } from './CreatureArchetypeSystem';

interface PopulationStats {
  totalPopulation: number;
  carryingCapacity: number;
  birthRate: number;
  deathRate: number;
  populationPressure: number;      // 0-1, how crowded
  averageAge: number;
  generationTurnover: number;      // How often new generations appear
}

interface BreedingEvent {
  generation: number;
  parents: [string, string];       // Parent entity IDs
  offspring: string;               // Child entity ID
  inheritedTraits: number[];
  hybridization: boolean;          // Cross-archetype breeding
  location: THREE.Vector3;
}

interface DeathEvent {
  generation: number;
  creature: string;                // Entity ID
  cause: 'old_age' | 'starvation' | 'predation' | 'environmental' | 'overpopulation';
  age: number;
  traits: number[];
  offspring: string[];             // Genetic legacy
}

class PopulationDynamicsSystem {
  private world: World<WorldSchema>;
  private populationStats: PopulationStats;
  private breedingEvents: BreedingEvent[] = [];
  private deathEvents: DeathEvent[] = [];
  private maxPopulation: number = 100;     // Carrying capacity
  private breedingCooldown = new Map<string, number>();
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.populationStats = {
      totalPopulation: 0,
      carryingCapacity: this.maxPopulation,
      birthRate: 0,
      deathRate: 0,
      populationPressure: 0,
      averageAge: 0,
      generationTurnover: 0
    };
    
    log.info('PopulationDynamicsSystem initialized', {
      maxPopulation: this.maxPopulation
    });
  }
  
  update(deltaTime: number): void {
    const currentTime = gameClock.getCurrentTime();
    const creatures = this.world.with('creature', 'transform');
    
    // Update population statistics
    this.updatePopulationStats(creatures, currentTime.generation);
    
    // Process breeding opportunities
    this.processBreeding(creatures, currentTime.generation);
    
    // Process natural deaths and lifecycle
    this.processLifecycle(creatures, currentTime.generation);
    
    // Apply population pressure effects
    this.applyPopulationPressure(creatures);
  }
  
  private updatePopulationStats(creatures: any, generation: number): void {
    const activeCreatures = creatures.entities.filter((c: any) => c.creature?.energy > 0);
    
    this.populationStats.totalPopulation = activeCreatures.length;
    this.populationStats.populationPressure = Math.min(1, 
      this.populationStats.totalPopulation / this.populationStats.carryingCapacity
    );
    
    // Calculate average age
    let totalAge = 0;
    let ageCount = 0;
    
    for (const entity of activeCreatures) {
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (evolutionData) {
        totalAge += evolutionData.age;
        ageCount++;
      }
    }
    
    this.populationStats.averageAge = ageCount > 0 ? totalAge / ageCount : 0;
    
    log.debug('Population stats updated', {
      generation,
      population: this.populationStats.totalPopulation,
      pressure: this.populationStats.populationPressure.toFixed(2),
      averageAge: this.populationStats.averageAge.toFixed(2)
    });
  }
  
  private processBreeding(creatures: any, generation: number): void {
    const breedingCandidates = creatures.entities.filter((entity: any) => {
      const evolutionData = entity.evolutionaryCreature as EvolutionaryCreature;
      return evolutionData && 
        evolutionData.energy > evolutionData.archetype.breedingThreshold &&
        evolutionData.age > 1 && // Minimum breeding age
        !this.breedingCooldown.has(entity.toString());
    });
    
    // Find breeding pairs within proximity
    for (let i = 0; i < breedingCandidates.length; i++) {
      for (let j = i + 1; j < breedingCandidates.length; j++) {
        const parent1 = breedingCandidates[i];
        const parent2 = breedingCandidates[j];
        
        if (!parent1.transform || !parent2.transform) continue;
        
        const distance = parent1.transform.position.distanceTo(parent2.transform.position);
        const breedingRange = 10; // Close proximity required
        
        if (distance <= breedingRange) {
          this.attemptBreeding(parent1, parent2, generation);
        }
      }
    }
  }
  
  private attemptBreeding(
    parent1: Entity<WorldSchema>,
    parent2: Entity<WorldSchema>, 
    generation: number
  ): void {
    
    const evolution1 = (parent1 as any).evolutionaryCreature as EvolutionaryCreature;
    const evolution2 = (parent2 as any).evolutionaryCreature as EvolutionaryCreature;
    
    if (!evolution1 || !evolution2 || !parent1.transform || !parent2.transform) return;
    
    // Check archetype compatibility for breeding
    const sameArchetype = evolution1.archetype.category === evolution2.archetype.category;
    const breedingSuccess = sameArchetype ? 0.8 : 0.3; // Cross-archetype breeding is harder
    
    if (Math.random() > breedingSuccess) return;
    
    log.info('Breeding attempt successful', {
      generation,
      parent1: evolution1.archetype.baseSpecies,
      parent2: evolution2.archetype.baseSpecies,
      crossBreeding: !sameArchetype
    });
    
    // Create offspring position (between parents)
    const offspringPos = parent1.transform.position.clone()
      .add(parent2.transform.position)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        0,
        (Math.random() - 0.5) * 5
      ));
    
    // Combine parent traits
    const inheritedTraits = this.combineParentTraits(
      evolution1.currentTraits,
      evolution2.currentTraits,
      evolution1.archetype.mutationRate
    );
    
    // Determine offspring archetype (usually same as parents, sometimes hybrid)
    const offspringArchetype = sameArchetype ? 
      evolution1.archetype.category :
      this.determineHybridArchetype(evolution1.archetype, evolution2.archetype);
    
    // Spawn offspring through CreatureArchetypeSystem
    // Would need reference to CreatureArchetypeSystem here
    
    // Record breeding event
    const breedingEvent: BreedingEvent = {
      generation,
      parents: [parent1.toString(), parent2.toString()],
      offspring: 'offspring_id', // Would be actual entity ID
      inheritedTraits,
      hybridization: !sameArchetype,
      location: offspringPos
    };
    
    this.breedingEvents.push(breedingEvent);
    
    // Add breeding cooldown
    this.breedingCooldown.set(parent1.toString(), generation + 3); // 3 generation cooldown
    this.breedingCooldown.set(parent2.toString(), generation + 3);
    
    // Record evolution event
    const evolutionEvent: EvolutionEvent = {
      generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType: sameArchetype ? 'trait_emergence' : 'speciation',
      description: `New ${!sameArchetype ? 'hybrid ' : ''}offspring from breeding`,
      affectedCreatures: [parent1.toString(), parent2.toString()],
      traits: inheritedTraits,
      significance: sameArchetype ? 0.4 : 0.8
    };
    
    gameClock.recordEvent(evolutionEvent);
  }
  
  private combineParentTraits(
    traits1: number[],
    traits2: number[],
    mutationRate: number
  ): number[] {
    
    const offspring = Array(10).fill(0);
    
    for (let i = 0; i < offspring.length; i++) {
      const trait1 = traits1[i] || 0;
      const trait2 = traits2[i] || 0;
      
      // Genetic combination (simplified Mendelian inheritance)
      const inherited = Math.random() < 0.5 ? trait1 : trait2; // Random parent selection
      const blended = (trait1 + trait2) / 2;                   // Average of both
      
      // Use inherited vs blended based on trait type
      const baseValue = Math.random() < 0.7 ? inherited : blended;
      
      // Apply mutation
      const mutation = (Math.random() - 0.5) * 0.2 * mutationRate;
      
      offspring[i] = Math.max(0, Math.min(1, baseValue + mutation));
    }
    
    return offspring;
  }
  
  private determineHybridArchetype(
    archetype1: CreatureArchetype,
    archetype2: CreatureArchetype
  ): any {
    // Cross-archetype breeding creates hybrid forms
    return 'hybrid_form'; // Would be more sophisticated
  }
  
  private processLifecycle(creatures: any, generation: number): void {
    const entitiesToRemove: Entity<WorldSchema>[] = [];
    
    for (const entity of creatures.entities) {
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (!evolutionData) continue;
      
      // Age-based death
      const maxAge = evolutionData.archetype.generationLifespan;
      if (evolutionData.age >= maxAge) {
        this.processNaturalDeath(entity, evolutionData, generation, 'old_age');
        entitiesToRemove.push(entity);
        continue;
      }
      
      // Starvation death (low energy)
      if (evolutionData.energy < 0.1) {
        this.processNaturalDeath(entity, evolutionData, generation, 'starvation');
        entitiesToRemove.push(entity);
        continue;
      }
      
      // Overpopulation pressure death
      if (this.populationStats.populationPressure > 0.9 && Math.random() < 0.1) {
        this.processNaturalDeath(entity, evolutionData, generation, 'overpopulation');
        entitiesToRemove.push(entity);
        continue;
      }
    }
    
    // Remove dead creatures
    for (const entity of entitiesToRemove) {
      this.world.remove(entity);
    }
    
    if (entitiesToRemove.length > 0) {
      log.info('Creatures removed from population', {
        generation,
        removedCount: entitiesToRemove.length,
        remainingPopulation: this.populationStats.totalPopulation - entitiesToRemove.length
      });
    }
  }
  
  private processNaturalDeath(
    entity: Entity<WorldSchema>,
    evolutionData: EvolutionaryCreature,
    generation: number,
    cause: DeathEvent['cause']
  ): void {
    
    const deathEvent: DeathEvent = {
      generation,
      creature: entity.toString(),
      cause,
      age: evolutionData.age,
      traits: [...evolutionData.currentTraits],
      offspring: [...evolutionData.offspring]
    };
    
    this.deathEvents.push(deathEvent);
    
    // Record significant deaths
    if (evolutionData.offspring.length > 3 || evolutionData.currentTraits.some(t => t > 0.8)) {
      const evolutionEvent: EvolutionEvent = {
        generation,
        timestamp: gameClock.getCurrentTime().gameTimeMs,
        eventType: 'extinction',
        description: `Significant creature died: ${cause}`,
        affectedCreatures: [entity.toString()],
        traits: evolutionData.currentTraits,
        significance: 0.6
      };
      
      gameClock.recordEvent(evolutionEvent);
    }
    
    log.creature('Natural death processed', evolutionData.archetype.baseSpecies, {
      cause,
      age: evolutionData.age,
      offspring: evolutionData.offspring.length,
      traits: evolutionData.currentTraits.slice(0, 3)
    });
  }
  
  private applyPopulationPressure(creatures: any): void {
    const pressure = this.populationStats.populationPressure;
    
    if (pressure > 0.7) {
      // High population pressure affects all creatures
      for (const entity of creatures.entities) {
        const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
        if (evolutionData) {
          evolutionData.stress += pressure * 0.1;
          evolutionData.energy -= pressure * 0.05;
          
          // Pressure encourages migration/territorial behavior
          if (evolutionData.stress > 0.6) {
            evolutionData.currentBehavior = 'MIGRATE';
          }
        }
      }
      
      log.info('Population pressure effects applied', {
        pressure: pressure.toFixed(2),
        affectedCreatures: creatures.entities.length
      });
    }
  }
  
  // Analysis methods
  getPopulationReport(): PopulationStats & {
    recentBirths: BreedingEvent[];
    recentDeaths: DeathEvent[];
    populationTrend: 'growing' | 'stable' | 'declining';
  } {
    
    const recentBirths = this.breedingEvents.slice(-10);
    const recentDeaths = this.deathEvents.slice(-10);
    
    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (recentBirths.length > recentDeaths.length * 1.2) trend = 'growing';
    else if (recentDeaths.length > recentBirths.length * 1.2) trend = 'declining';
    
    return {
      ...this.populationStats,
      recentBirths,
      recentDeaths,
      populationTrend: trend
    };
  }
}

export default PopulationDynamicsSystem;
export type { PopulationStats, BreedingEvent, DeathEvent };