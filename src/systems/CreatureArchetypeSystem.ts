/**
 * Creature Archetype System - Complete behavioral foundation  
 * Based on Daggerfall's MobileTypes/Behavior approach + evolutionary enhancement
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { SimplexNoise } from 'simplex-noise';
import { log, measurePerformance } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import { AffinityType } from './RawMaterialsSystem';
import type { WorldSchema, Transform, CreatureData, YukaAgent } from '../world/ECSWorld';

// Base archetype families (not specific creatures)
export enum ArchetypeFamily {
  // Fundamental ecological niches
  TINY_SCAVENGER = 'tiny_scavenger',       // Base archetype: small, quick, opportunistic
  SMALL_BROWSER = 'small_browser',         // Base archetype: medium, nibbles, cautious  
  MEDIUM_FORAGER = 'medium_forager',       // Base archetype: larger, seeks, social
  AERIAL_DRIFTER = 'aerial_drifter',       // Base archetype: flying, observing, mobile
  AQUATIC_FILTER = 'aquatic_filter',       // Base archetype: water-bound, flowing, filtering
  
  // Social organization potential
  PACK_FORMER = 'pack_former',             // Tendency toward group coordination
  TERRITORY_HOLDER = 'territory_holder',   // Tendency toward area defense
  NOMADIC_WANDERER = 'nomadic_wanderer',   // Tendency toward migration
  
  // Emergent specializations (develop through evolution)
  TOOL_EXPERIMENTER = 'tool_experimenter', // Develops manipulation behaviors
  SYMBIOSIS_SEEKER = 'symbiosis_seeker',   // Develops cooperation behaviors  
  CONSTRUCTION_PIONEER = 'construction_pioneer', // Develops building behaviors
}

// Daggerfall's behavior patterns enhanced for evolution
export enum BehaviorPattern {
  WANDER = 'wander',           // Random exploration (Daggerfall General)
  TERRITORIAL = 'territorial',  // Defends area (Daggerfall Guard-like)
  SOCIAL = 'social',           // Pack coordination (Daggerfall team-based)
  FLEE = 'flee',              // Avoidance behaviors
  STALK = 'stalk',            // Hunting/tracking
  FORAGE = 'forage',          // Resource seeking
  MIGRATE = 'migrate',        // Seasonal/environmental movement
  CONSTRUCT = 'construct',    // Building behaviors (evolved)
}

// Morphological traits (not human-centric)
export interface MorphologyTraits {
  bodyPlan: {
    limbCount: number;          // 2, 4, 6, 8+ legs/appendages
    locomotionType: 'terrestrial' | 'aquatic' | 'aerial' | 'climbing' | 'burrowing';
    bodySize: number;           // 0-1 scale factor
    symmetry: number;           // 0-1, bilateral to radial
  };
  
  specializations: {
    manipulationAppendages: number; // 0-1, tool use capability  
    sensoryEnhancement: number;     // 0-1, detection abilities
    defensiveFeatures: number;     // 0-1, protection/armor
    speedAdaptation: number;       // 0-1, movement efficiency
  };
  
  environmentalAdaptation: {
    thermoregulation: number;      // 0-1, temperature tolerance
    oxygenEfficiency: number;      // 0-1, altitude/water adaptation
    toxinResistance: number;       // 0-1, pollution tolerance
    camouflage: number;           // 0-1, visual blending
  };
}

// Complete creature archetype
export interface CreatureArchetype {
  category: CreatureCategory;
  baseSpecies: string;              // "proto_squirrel", "base_deer", etc.
  
  // Daggerfall-style classification
  behaviorPattern: BehaviorPattern;
  affinityMask: number;            // What resources/conditions they seek
  reactionType: 'passive' | 'curious' | 'territorial' | 'aggressive' | 'cooperative';
  spawnRarity: number;             // Base spawn probability
  
  // Morphological potential
  morphology: MorphologyTraits;
  
  // Evolution parameters
  mutationRate: number;            // How fast traits change
  traitInheritance: number[];      // Susceptibility to player trait influence (10 values)
  generationLifespan: number;      // How many generations they live
  breedingThreshold: number;       // When they reproduce
  
  // Yuka behavior configuration
  yukaBehaviors: YukaBehaviorConfig[];
  detectionRange: number;          // Sight/awareness radius
  territorySize: number;           // Home range
  socialGroupSize: number;         // Max pack/herd size
}

interface YukaBehaviorConfig {
  behaviorType: string;            // 'wander', 'seek', 'flee', 'flock'
  weight: number;                  // Importance (0-1)
  parameters: Record<string, number>; // Behavior-specific params
  conditions: string[];            // When to activate this behavior
}

// Evolutionary creature instance
export interface EvolutionaryCreature {
  archetype: CreatureArchetype;
  generation: number;              // Which generation this individual is
  age: number;                    // Current age in generations
  
  // Current trait values (inherited + mutations)
  currentTraits: number[];         // 10 trait values influenced by player
  parentTraits: number[][];        // Trait values from parents
  mutationHistory: MutationEvent[];
  
  // Behavioral state  
  currentBehavior: BehaviorPattern;
  behaviorState: 'active' | 'resting' | 'breeding' | 'exploring' | 'territorial';
  energy: number;                  // 0-1, affects behavior choices
  stress: number;                  // Environmental pressure
  
  // Social connections
  packMembership: string | null;   // Pack entity ID
  mateBond: string | null;         // Mate entity ID  
  offspring: string[];             // Child entity IDs
  
  // Environmental tracking
  homeTerritory: THREE.Vector3;
  favoriteResources: string[];     // Material entity IDs they frequent
  pollutionExposure: number;       // Cumulative environmental damage
}

interface MutationEvent {
  generation: number;
  traitIndex: number;              // Which trait mutated
  previousValue: number;
  newValue: number;
  cause: 'player_influence' | 'environmental_pressure' | 'breeding' | 'random';
  significance: number;            // 0-1, how major the change
}

class CreatureArchetypeSystem {
  private world: World<WorldSchema>;
  private archetypes = new Map<CreatureCategory, CreatureArchetype>();
  private creatures: Entity<WorldSchema>[] = [];
  private populationNoise = new SimplexNoise();
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.initializeArchetypes();
    log.info('CreatureArchetypeSystem initialized with complete behavioral foundation');
  }
  
  private initializeArchetypes(): void {
    log.info('Initializing creature archetypes based on Daggerfall + evolution...');
    
    // Small forager archetype (squirrel-like)
    this.archetypes.set(CreatureCategory.SMALL_FORAGER, {
      category: CreatureCategory.SMALL_FORAGER,
      baseSpecies: 'proto_forager',
      behaviorPattern: BehaviorPattern.FORAGE,
      affinityMask: AffinityType.LIFE | AffinityType.BIND,
      reactionType: 'curious',
      spawnRarity: 0.8,             // Common
      
      morphology: {
        bodyPlan: {
          limbCount: 4,
          locomotionType: 'climbing',
          bodySize: 0.2,
          symmetry: 0.9             // Bilateral
        },
        specializations: {
          manipulationAppendages: 0.6, // Good dexterity
          sensoryEnhancement: 0.7,     // Sharp senses
          defensiveFeatures: 0.2,      // Minimal armor
          speedAdaptation: 0.8         // Quick escape
        },
        environmentalAdaptation: {
          thermoregulation: 0.6,
          oxygenEfficiency: 0.7,
          toxinResistance: 0.3,
          camouflage: 0.8
        }
      },
      
      mutationRate: 0.3,           // Moderate evolution speed
      traitInheritance: [0.4, 0.7, 0.2, 0.5, 0.6, 0.3, 0.8, 0.4, 0.3, 0.5], // How susceptible to each player trait
      generationLifespan: 3,       // Lives 3 generations
      breedingThreshold: 0.7,      // Breeds when energy > 70%
      
      yukaBehaviors: [
        {
          behaviorType: 'wander',
          weight: 0.6,
          parameters: { radius: 15, distance: 10, jitter: 3 },
          conditions: ['default']
        },
        {
          behaviorType: 'seek',
          weight: 0.8,
          parameters: { maxDistance: 20 },
          conditions: ['resource_detected', 'low_energy']
        },
        {
          behaviorType: 'flee',
          weight: 0.9,
          parameters: { panicDistance: 8, fleeDistance: 25 },
          conditions: ['threat_detected', 'high_stress']
        }
      ],
      
      detectionRange: 12,
      territorySize: 25,
      socialGroupSize: 4            // Small family groups
    });
    
    // Medium grazer archetype (rabbit/deer-like)  
    this.archetypes.set(CreatureCategory.MEDIUM_GRAZER, {
      category: CreatureCategory.MEDIUM_GRAZER,
      baseSpecies: 'proto_grazer',
      behaviorPattern: BehaviorPattern.SOCIAL,
      affinityMask: AffinityType.LIFE | AffinityType.FLOW,
      reactionType: 'passive',
      spawnRarity: 0.6,
      
      morphology: {
        bodyPlan: {
          limbCount: 4,
          locomotionType: 'terrestrial',
          bodySize: 0.5,
          symmetry: 0.95
        },
        specializations: {
          manipulationAppendages: 0.2, // Limited dexterity
          sensoryEnhancement: 0.9,     // Excellent awareness
          defensiveFeatures: 0.4,      // Some protective features
          speedAdaptation: 0.7         // Good escape speed
        },
        environmentalAdaptation: {
          thermoregulation: 0.8,
          oxygenEfficiency: 0.6,
          toxinResistance: 0.4,
          camouflage: 0.6
        }
      },
      
      mutationRate: 0.2,           // Slower evolution
      traitInheritance: [0.8, 0.3, 0.6, 0.4, 0.7, 0.2, 0.9, 0.8, 0.5, 0.3], // High influence from movement traits
      generationLifespan: 5,       // Longer-lived
      breedingThreshold: 0.6,
      
      yukaBehaviors: [
        {
          behaviorType: 'flock',
          weight: 0.8,
          parameters: { separationRadius: 3, alignmentRadius: 8, cohesionRadius: 12 },
          conditions: ['pack_nearby', 'safe_conditions']
        },
        {
          behaviorType: 'wander',
          weight: 0.4,
          parameters: { radius: 20, distance: 15, jitter: 2 },
          conditions: ['default']
        }
      ],
      
      detectionRange: 18,
      territorySize: 40,
      socialGroupSize: 12           // Larger herds
    });
    
    // Debug testing archetype (configurable for experiments)
    this.archetypes.set(CreatureCategory.HYBRID_FORM, {
      category: CreatureCategory.HYBRID_FORM,
      baseSpecies: 'proto_hybrid',
      behaviorPattern: BehaviorPattern.WANDER,
      affinityMask: AffinityType.WILD,  // Attracted to everything
      reactionType: 'curious',
      spawnRarity: 0.0,             // Only spawned for testing
      
      morphology: {
        bodyPlan: {
          limbCount: 4,             // Will evolve based on pressure
          locomotionType: 'terrestrial',
          bodySize: 0.4,
          symmetry: 0.7             // Slightly asymmetrical
        },
        specializations: {
          manipulationAppendages: 0.5, // Moderate starting point
          sensoryEnhancement: 0.5,
          defensiveFeatures: 0.5,
          speedAdaptation: 0.5
        },
        environmentalAdaptation: {
          thermoregulation: 0.5,
          oxygenEfficiency: 0.5,
          toxinResistance: 0.5,
          camouflage: 0.5
        }
      },
      
      mutationRate: 0.8,           // High mutation for testing
      traitInheritance: Array(10).fill(0.7), // High susceptibility to all traits
      generationLifespan: 2,       // Short for rapid testing
      breedingThreshold: 0.5,
      
      yukaBehaviors: [
        {
          behaviorType: 'wander',
          weight: 0.5,
          parameters: { radius: 12, distance: 8, jitter: 4 },
          conditions: ['default']
        }
      ],
      
      detectionRange: 15,
      territorySize: 30,
      socialGroupSize: 6
    });
    
    log.info('Creature archetypes initialized', {
      totalArchetypes: this.archetypes.size,
      categories: Array.from(this.archetypes.keys())
    });
  }
  
  /**
   * Spawn creature using archetype with evolutionary potential
   */
  spawnCreature(
    category: CreatureCategory,
    position: THREE.Vector3,
    parentTraits?: number[][],     // For breeding/inheritance
    generation: number = 0
  ): Entity<WorldSchema> {
    
    const perf = measurePerformance(`Spawn ${category}`);
    const archetype = this.archetypes.get(category);
    
    if (!archetype) {
      throw new Error(`No archetype found for category: ${category}`);
    }
    
    log.creature('Spawning evolutionary creature', `${category}_gen${generation}`, {
      category,
      position: position.toArray(),
      generation,
      hasParents: !!parentTraits
    });
    
    // Create evolutionary creature data
    const evolutionaryCreature: EvolutionaryCreature = {
      archetype,
      generation,
      age: 0,
      
      // Inherit traits from parents or start with base
      currentTraits: this.generateTraits(archetype, parentTraits),
      parentTraits: parentTraits || [],
      mutationHistory: [],
      
      currentBehavior: archetype.behaviorPattern,
      behaviorState: 'active',
      energy: 0.8,
      stress: 0.1,
      
      packMembership: null,
      mateBond: null,
      offspring: [],
      
      homeTerritory: position.clone(),
      favoriteResources: [],
      pollutionExposure: 0
    };
    
    // Create Yuka vehicle with dynamic behaviors
    const yukaVehicle = this.createYukaVehicle(evolutionaryCreature, position);
    
    // Create visual representation
    const mesh = this.createEvolutionaryMesh(evolutionaryCreature);
    
    // Create ECS entity
    const entity = this.world.add({
      transform: {
        position: position.clone(),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(archetype.morphology.bodyPlan.bodySize, archetype.morphology.bodyPlan.bodySize, archetype.morphology.bodyPlan.bodySize)
      },
      creature: {
        species: category as any,
        size: archetype.morphology.bodyPlan.bodySize,
        personality: archetype.reactionType as any,
        energy: evolutionaryCreature.energy * 100,
        mood: 0
      },
      yukaAgent: {
        vehicle: yukaVehicle,
        behaviorType: 'wander',
        homePosition: position.clone(),
        territory: archetype.territorySize
      },
      render: {
        mesh,
        material: mesh.material as THREE.Material,
        visible: true,
        castShadow: true,
        receiveShadow: true
      }
    });
    
    // Store evolutionary data (would be better as ECS component)
    (entity as any).evolutionaryCreature = evolutionaryCreature;
    
    this.creatures.push(entity);
    
    perf.end();
    log.creature('Evolutionary creature spawned successfully', `${category}_gen${generation}`, {
      entityId: entity,
      traits: evolutionaryCreature.currentTraits,
      yukaBehaviors: archetype.yukaBehaviors.length
    });
    
    return entity;
  }
  
  private generateTraits(
    archetype: CreatureArchetype,
    parentTraits?: number[][]
  ): number[] {
    
    const traits = Array(10).fill(0);
    
    if (parentTraits && parentTraits.length > 0) {
      // Inherit from parents with mutations
      for (let i = 0; i < 10; i++) {
        // Average parent traits
        const parentAvg = parentTraits.reduce((sum, parent) => 
          sum + (parent[i] || 0), 0) / parentTraits.length;
        
        // Apply mutation
        const mutation = (this.populationNoise.noise2D(i, Date.now() * 0.001) * 0.1) * archetype.mutationRate;
        
        traits[i] = Math.max(0, Math.min(1, parentAvg + mutation));
      }
    } else {
      // Base traits from archetype
      for (let i = 0; i < 10; i++) {
        traits[i] = archetype.traitInheritance[i] * 0.1; // Start with low base values
      }
    }
    
    return traits;
  }
  
  private createYukaVehicle(creature: EvolutionaryCreature, position: THREE.Vector3): YUKA.Vehicle {
    const vehicle = new YUKA.Vehicle();
    vehicle.position.set(position.x, position.y, position.z);
    
    // Add behaviors from archetype
    for (const behaviorConfig of creature.archetype.yukaBehaviors) {
      const behavior = this.createYukaBehavior(behaviorConfig);
      if (behavior) {
        vehicle.steering.add(behavior);
      }
    }
    
    vehicle.maxSpeed = 3 + (creature.currentTraits[0] || 0) * 5; // Speed influenced by first trait
    vehicle.maxForce = 2 + (creature.currentTraits[1] || 0) * 3; // Force influenced by second trait
    
    return vehicle;
  }
  
  private createYukaBehavior(config: YukaBehaviorConfig): YUKA.SteeringBehavior | null {
    try {
      switch (config.behaviorType) {
        case 'wander':
          const wander = new YUKA.WanderBehavior();
          wander.radius = config.parameters.radius || 10;
          wander.distance = config.parameters.distance || 8;
          wander.jitter = config.parameters.jitter || 2;
          return wander;
          
        case 'seek':
          // Would be configured with specific targets
          return new YUKA.SeekBehavior();
          
        case 'flee':
          // Would be configured with threat sources
          return new YUKA.EvadeBehavior();
          
        case 'flock':
          // Would need pack members as context
          return null; // Configured later when pack forms
          
        default:
          log.warn('Unknown Yuka behavior type', { type: config.behaviorType });
          return null;
      }
    } catch (error) {
      log.error('Failed to create Yuka behavior', error, config);
      return null;
    }
  }
  
  private createEvolutionaryMesh(creature: EvolutionaryCreature): THREE.Group {
    const group = new THREE.Group();
    const morphology = creature.archetype.morphology;
    const traits = creature.currentTraits;
    
    // Base body influenced by traits and morphology
    const bodyGeometry = new THREE.SphereGeometry(0.3 * morphology.bodyPlan.bodySize);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: this.generateTraitColor(traits)
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);
    
    // Add appendages based on limb count and specializations
    const limbCount = morphology.bodyPlan.limbCount;
    const manipulationLevel = morphology.specializations.manipulationAppendages;
    
    for (let i = 0; i < limbCount; i++) {
      const angle = (i / limbCount) * Math.PI * 2;
      const limbGeometry = new THREE.CylinderGeometry(0.02, 0.05, 0.2 + manipulationLevel * 0.3);
      const limb = new THREE.Mesh(limbGeometry, bodyMaterial.clone());
      
      limb.position.set(
        Math.cos(angle) * 0.25,
        -0.15,
        Math.sin(angle) * 0.25
      );
      limb.rotation.z = angle + Math.PI / 2;
      limb.castShadow = true;
      
      group.add(limb);
    }
    
    // Add sensory features based on enhancement level
    if (morphology.specializations.sensoryEnhancement > 0.5) {
      const eyeGeometry = new THREE.SphereGeometry(0.04);
      const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.1, 0.1, 0.25);
      group.add(leftEye);
      
      const rightEye = leftEye.clone();
      rightEye.position.set(0.1, 0.1, 0.25);
      group.add(rightEye);
    }
    
    return group;
  }
  
  private generateTraitColor(traits: number[]): THREE.Color {
    // Color based on dominant traits
    const hue = (traits[0] || 0) * 0.3 + 0.05;        // Brown to reddish
    const saturation = 0.6 + (traits[1] || 0) * 0.4;  // Intensity
    const lightness = 0.4 + (traits[2] || 0) * 0.3;   // Brightness
    
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }
  
  /**
   * Update all creatures for evolution, breeding, behavior changes
   */
  update(deltaTime: number): void {
    try {
      const currentTime = gameClock.getCurrentTime();
      
      for (const entity of this.creatures) {
        if (!(entity as any).evolutionaryCreature) continue;
        
        const creature = (entity as any).evolutionaryCreature as EvolutionaryCreature;
        
        // Age the creature
        creature.age += deltaTime / 1000; // Age in seconds
        
        // Update energy/stress based on environmental factors
        this.updateCreatureCondition(entity, creature);
        
        // Check for evolution events
        this.checkEvolutionTriggers(entity, creature, currentTime.generation);
        
        // Update Yuka behaviors based on current state
        this.updateDynamicBehaviors(entity, creature);
      }
      
    } catch (error) {
      log.error('CreatureArchetypeSystem update failed', error);
    }
  }
  
  private updateCreatureCondition(
    entity: Entity<WorldSchema>,
    creature: EvolutionaryCreature
  ): void {
    // Update energy based on nearby resources, pack support, etc.
    // Update stress based on environmental threats, pollution, etc.
    
    if (entity.creature) {
      entity.creature.energy = creature.energy * 100;
      entity.creature.mood = Math.max(-1, Math.min(1, 0.5 - creature.stress));
    }
  }
  
  private checkEvolutionTriggers(
    entity: Entity<WorldSchema>,
    creature: EvolutionaryCreature,
    currentGeneration: number
  ): void {
    
    // Check if significant evolution should occur
    const evolutionThreshold = 0.3;
    let totalChange = 0;
    
    for (let i = 0; i < creature.currentTraits.length; i++) {
      const inheritanceRate = creature.archetype.traitInheritance[i];
      const environmentalPressure = 0.1; // Would calculate from nearby materials/creatures
      const change = inheritanceRate * environmentalPressure * creature.archetype.mutationRate;
      
      if (Math.abs(change) > 0.05) {
        const oldValue = creature.currentTraits[i];
        creature.currentTraits[i] = Math.max(0, Math.min(1, oldValue + change));
        
        // Record mutation
        creature.mutationHistory.push({
          generation: currentGeneration,
          traitIndex: i,
          previousValue: oldValue,
          newValue: creature.currentTraits[i],
          cause: 'environmental_pressure',
          significance: Math.abs(change)
        });
        
        totalChange += Math.abs(change);
      }
    }
    
    // Record significant evolution events
    if (totalChange > evolutionThreshold) {
      const event: EvolutionEvent = {
        generation: currentGeneration,
        timestamp: gameClock.getCurrentTime().gameTimeMs,
        eventType: 'trait_emergence',
        description: `${creature.archetype.category} evolved ${totalChange.toFixed(2)} trait change`,
        affectedCreatures: [entity.toString()],
        traits: [...creature.currentTraits],
        significance: Math.min(1, totalChange)
      };
      
      gameClock.recordEvent(event);
    }
  }
  
  private updateDynamicBehaviors(
    entity: Entity<WorldSchema>,
    creature: EvolutionaryCreature
  ): void {
    
    if (!entity.yukaAgent?.vehicle) return;
    
    // Modify Yuka behaviors based on current traits
    const vehicle = entity.yukaAgent.vehicle;
    
    // Example: High social traits = stronger flocking
    const socialTrait = creature.currentTraits[3] || 0; // Arbitrary trait index
    if (socialTrait > 0.6 && creature.archetype.socialGroupSize > 1) {
      // Would add/strengthen flock behavior
      log.creature('Social behavior strengthened', `${creature.archetype.category}`, {
        socialTrait,
        generation: creature.generation
      });
    }
  }
  
  /**
   * Request specific creature for debugging evolution (proper game mechanic)
   */
  requestDebugCreature(
    category: CreatureCategory,
    position: THREE.Vector3,
    customTraits?: number[],
    testLabel: string = 'debug_evolution'
  ): Entity<WorldSchema> {
    
    log.info('Requesting debug creature from archetype inventory', {
      category,
      position: position.toArray(),
      customTraits,
      testLabel
    });
    
    const creature = this.spawnCreature(category, position, customTraits ? [customTraits] : undefined, 0);
    (creature as any).debugLabel = testLabel;
    
    return creature;
  }
  
  // Analysis methods
  getEvolutionSummary(): {
    totalCreatures: number;
    generationDistribution: Record<number, number>;
    averageTraits: number[];
    mostEvolvedCreatures: any[];
  } {
    const summary = {
      totalCreatures: this.creatures.length,
      generationDistribution: {} as Record<number, number>,
      averageTraits: Array(10).fill(0),
      mostEvolvedCreatures: []
    };
    
    // Calculate statistics
    for (const entity of this.creatures) {
      const creature = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (!creature) continue;
      
      // Generation distribution
      summary.generationDistribution[creature.generation] = 
        (summary.generationDistribution[creature.generation] || 0) + 1;
      
      // Average traits
      for (let i = 0; i < creature.currentTraits.length; i++) {
        summary.averageTraits[i] += creature.currentTraits[i];
      }
    }
    
    // Normalize averages
    if (this.creatures.length > 0) {
      for (let i = 0; i < summary.averageTraits.length; i++) {
        summary.averageTraits[i] /= this.creatures.length;
      }
    }
    
    return summary;
  }
}

export default CreatureArchetypeSystem;
export type { MaterialArchetype, EvolutionaryCreature, MutationEvent, CreatureArchetype };