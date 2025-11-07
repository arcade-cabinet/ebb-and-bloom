/**
 * Raw Materials System - Complete ecology foundation
 * Material classification and resource generation for evolutionary systems
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { log, measurePerformance } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { WorldSchema, Transform, ResourceNode } from '../world/ECSWorld';

// Material classification system
export enum MaterialCategory {
  // Organic materials
  WOOD = 'wood',
  PLANT = 'plant', 
  FIBER = 'fiber',
  
  // Mineral materials  
  STONE = 'stone',
  ORE = 'ore',
  CRYSTAL = 'crystal',
  
  // Liquid materials
  WATER = 'water',
  OIL = 'oil',
  ACID = 'acid',
  
  // Energy materials
  HEAT = 'heat',
  ELECTRIC = 'electric',
  MAGIC = 'magic',
  
  // Composite materials (for evolution)
  ALLOY = 'alloy',
  BIOMETAL = 'biometal',
  LIVINGSTONE = 'livingstone',
  
  // Debug materials
  DEBUG_BAIT = 'debug_bait'
}

// Affinity system - what creatures/materials are attracted to
export enum AffinityType {
  HEAT = 1 << 0,      // Fire, warmth, energy
  FLOW = 1 << 1,      // Water, movement, liquid
  BIND = 1 << 2,      // Adhesion, structure, connection  
  POWER = 1 << 3,     // Energy, electricity, force
  LIFE = 1 << 4,      // Organic, growth, healing
  METAL = 1 << 5,     // Conductivity, hardness, tools
  VOID = 1 << 6,      // Pollution, decay, emptiness
  WILD = 1 << 7,      // Chaos, mutation, unpredictability
}

// Material archetype definition
export interface MaterialArchetype {
  category: MaterialCategory;
  affinityMask: number;           // Combination of AffinityType flags
  rarity: number;                 // 0-1, spawn probability
  renewalRate: number;            // How fast it regenerates
  mutabilityFactor: number;       // How susceptible to evolutionary change
  
  // Physical properties
  density: number;                // Affects size/weight
  volatility: number;            // Reaction intensity
  magnetism: number;             // Attraction to other materials
  purity: number;                // Base quality
  
  // Evolution properties
  traitInfluence: number[];      // How it affects creature traits (10 values for 10 traits)
  generationStability: number;   // Resistance to change over time
  inheritancePattern: 'additive' | 'dominant' | 'recessive' | 'codominant';
}

// Procedural material instance
export interface MaterialInstance {
  archetype: MaterialArchetype;
  position: THREE.Vector3;
  currentPurity: number;          // Can degrade/improve over time
  age: number;                   // How long it's existed
  influenceRadius: number;       // How far traits affect creatures
  harvestCount: number;          // Times it's been used
  
  // Evolution tracking
  nearbyCreatureTraits: number[][]; // Traits of creatures that have been near it
  evolutionPressure: number[];      // Accumulated evolutionary pressure
  lastEvolutionEvent: number;       // When it last caused evolution
}

class RawMaterialsSystem {
  private world: World<WorldSchema>;
  private materialNoise = createNoise2D();
  private archetypes = new Map<MaterialCategory, MaterialArchetype>();
  private instances: Entity<WorldSchema>[] = [];
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.initializeArchetypes();
    log.info('RawMaterialsSystem initialized with complete archetype foundation');
  }
  
  private initializeArchetypes(): void {
    log.info('Initializing material archetypes...');
    
    // Organic materials (nature-based resources)
    this.archetypes.set(MaterialCategory.WOOD, {
      category: MaterialCategory.WOOD,
      affinityMask: AffinityType.LIFE | AffinityType.BIND,
      rarity: 0.7,          // Common in forest areas
      renewalRate: 0.8,     // Trees grow back
      mutabilityFactor: 0.6, // Moderately changeable
      density: 0.6,
      volatility: 0.3,
      magnetism: 0.4,
      purity: 0.8,
      traitInfluence: [0, 0.3, 0, 0, 0.5, 0, 0, 0.2, 0, 0], // Affects ChainsawHands, StorageSacs
      generationStability: 0.7,
      inheritancePattern: 'additive'
    });
    
    this.archetypes.set(MaterialCategory.ORE, {
      category: MaterialCategory.ORE,
      affinityMask: AffinityType.METAL | AffinityType.HEAT,
      rarity: 0.4,          // Less common, concentrated in mountains
      renewalRate: 0.1,     // Very slow regeneration
      mutabilityFactor: 0.3, // Resistant to change
      density: 1.0,         // Heavy, dense
      volatility: 0.2,
      magnetism: 0.8,       // Highly magnetic for combining
      purity: 0.9,
      traitInfluence: [0, 0, 0.6, 0, 0, 0, 0, 0, 0.4, 0], // Affects DrillArms, ShieldCarapace  
      generationStability: 0.9,
      inheritancePattern: 'dominant'
    });
    
    this.archetypes.set(MaterialCategory.WATER, {
      category: MaterialCategory.WATER,
      affinityMask: AffinityType.FLOW | AffinityType.LIFE,
      rarity: 0.5,          // Moderate, depends on terrain
      renewalRate: 1.0,     // Constant flow
      mutabilityFactor: 0.9, // Highly changeable
      density: 0.8,
      volatility: 0.7,
      magnetism: 0.6,
      purity: 0.7,
      traitInfluence: [0.8, 0, 0, 0, 0, 0, 0, 0.6, 0, 0], // Affects FlipperFeet, FiltrationGills
      generationStability: 0.4,
      inheritancePattern: 'additive'
    });
    
    // Debug bait material
    this.archetypes.set(MaterialCategory.DEBUG_BAIT, {
      category: MaterialCategory.DEBUG_BAIT,
      affinityMask: AffinityType.WILD, // Configurable attraction
      rarity: 0.0,          // Only manually spawned
      renewalRate: 0.0,     // Doesn't regenerate
      mutabilityFactor: 1.0, // Fully configurable
      density: 0.5,
      volatility: 0.8,      // High reaction for testing
      magnetism: 1.0,       // Maximum attraction
      purity: 1.0,
      traitInfluence: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], // Affects all traits equally for testing
      generationStability: 1.0, // Stable for consistent testing
      inheritancePattern: 'dominant'
    });
    
    log.info('Material archetypes initialized', {
      totalArchetypes: this.archetypes.size,
      categories: Array.from(this.archetypes.keys())
    });
  }
  
  /**
   * Generate materials across terrain using environmental placement rules
   */
  generateMaterialsForChunk(
    chunkX: number,
    chunkZ: number,
    chunkSize: number,
    terrainHeightData: Float32Array
  ): Entity<WorldSchema>[] {
    
    const perf = measurePerformance(`Materials Generation Chunk ${chunkX},${chunkZ}`);
    const materials: Entity<WorldSchema>[] = [];
    
    log.info('Generating materials for terrain chunk', { chunkX, chunkZ, chunkSize });
    
    // Sample terrain characteristics for material placement
    for (let localX = 0; localX < chunkSize; localX += 16) { // 16-unit grid for material placement
      for (let localZ = 0; localZ < chunkSize; localZ += 16) {
        
        const worldX = (chunkX * chunkSize) + localX;
        const worldZ = (chunkZ * chunkSize) + localZ;
        
        // Determine material spawn based on terrain characteristics
        const terrainHeight = this.sampleTerrainHeight(worldX, worldZ, terrainHeightData, chunkSize);
        const moisture = this.materialNoise(worldX * 0.003, worldZ * 0.003);
        const temperature = this.materialNoise(worldX * 0.004, worldZ * 0.004);
        const mineralization = this.materialNoise(worldX * 0.002, worldZ * 0.002);
        
        // Placement rules based on environmental factors
        if (terrainHeight < 0.3 && moisture > 0.2) {
          // Low, wet areas = water sources
          materials.push(this.spawnMaterial(MaterialCategory.WATER, worldX, terrainHeight, worldZ));
        }
        
        if (terrainHeight > 0.7 && mineralization > 0.4) {
          // High, rocky areas = ore deposits  
          materials.push(this.spawnMaterial(MaterialCategory.ORE, worldX, terrainHeight, worldZ));
        }
        
        if (terrainHeight > 0.2 && terrainHeight < 0.8 && moisture > 0.0) {
          // Mid-range, moderate moisture = wood sources
          if (this.materialNoise(worldX * 0.01, worldZ * 0.01) > 0.3) {
            materials.push(this.spawnMaterial(MaterialCategory.WOOD, worldX, terrainHeight, worldZ));
          }
        }
      }
    }
    
    perf.end();
    log.info('Material generation complete', {
      chunkX,
      chunkZ, 
      materialsGenerated: materials.length,
      categories: this.categorizeMaterials(materials)
    });
    
    return materials;
  }
  
  private spawnMaterial(
    category: MaterialCategory,
    worldX: number,
    terrainHeight: number,
    worldZ: number
  ): Entity<WorldSchema> {
    
    const archetype = this.archetypes.get(category);
    if (!archetype) {
      throw new Error(`No archetype found for material category: ${category}`);
    }
    
    // Create material instance with procedural variation
    const materialInstance: MaterialInstance = {
      archetype,
      position: new THREE.Vector3(worldX, terrainHeight + 1, worldZ),
      currentPurity: archetype.purity + (this.materialNoise(worldX * 0.05, worldZ * 0.05) * 0.2),
      age: 0,
      influenceRadius: 10 + (archetype.magnetism * 15),
      harvestCount: 0,
      nearbyCreatureTraits: [],
      evolutionPressure: Array(10).fill(0),
      lastEvolutionEvent: 0
    };
    
    // Create ECS entity
    const entity = this.world.add({
      transform: {
        position: materialInstance.position.clone(),
        rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
        scale: new THREE.Vector3(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4)
      },
      resource: {
        materialType: category as any,
        quantity: Math.floor(10 + (archetype.rarity * 20)),
        purity: materialInstance.currentPurity,
        magneticRadius: materialInstance.influenceRadius,
        harvestable: true
      }
    });
    
    // Store instance data (would be better in ECS component)
    (entity as any).materialInstance = materialInstance;
    
    this.instances.push(entity);
    
    log.debug('Material spawned', {
      category,
      position: [worldX, terrainHeight, worldZ],
      purity: materialInstance.currentPurity,
      influenceRadius: materialInstance.influenceRadius
    });
    
    return entity;
  }
  
  private sampleTerrainHeight(
    worldX: number,
    worldZ: number, 
    heightData: Float32Array,
    chunkSize: number
  ): number {
    
    // Simplified height sampling - would use proper terrain system
    const resolution = Math.sqrt(heightData.length);
    const localX = Math.floor((worldX % chunkSize) / chunkSize * resolution);
    const localZ = Math.floor((worldZ % chunkSize) / chunkSize * resolution);
    const idx = Math.max(0, Math.min(resolution - 1, localZ)) * resolution + Math.max(0, Math.min(resolution - 1, localX));
    
    return (heightData[idx] || 0) / 60.0; // Normalize to 0-1
  }
  
  private categorizeMaterials(materials: Entity<WorldSchema>[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const material of materials) {
      if (material.resource?.materialType) {
        const type = material.resource.materialType;
        counts[type] = (counts[type] || 0) + 1;
      }
    }
    
    return counts;
  }
  
  /**
   * Request specific bait material for debugging (proper game mechanic)
   */
  requestDebugBait(
    position: THREE.Vector3,
    traitSignature: number[],
    intensity: number = 0.8,
    label: string = 'debug_test'
  ): Entity<WorldSchema> {
    
    log.info('Requesting debug bait from materials inventory', {
      position: position.toArray(),
      traitSignature,
      intensity,
      label
    });
    
    // Create custom archetype for this bait
    const customArchetype: MaterialArchetype = {
      ...this.archetypes.get(MaterialCategory.DEBUG_BAIT)!,
      traitInfluence: traitSignature, // Custom trait influence
      magnetism: intensity,
      purity: intensity
    };
    
    // Create bait instance
    const baitInstance: MaterialInstance = {
      archetype: customArchetype,
      position: position.clone(),
      currentPurity: intensity,
      age: 0,
      influenceRadius: 15 + (intensity * 25),
      harvestCount: 0,
      nearbyCreatureTraits: [],
      evolutionPressure: Array(10).fill(0),
      lastEvolutionEvent: 0
    };
    
    // Create ECS entity
    const baitEntity = this.world.add({
      transform: {
        position: position.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(0.5 + intensity * 0.5, 0.5 + intensity * 0.5, 0.5 + intensity * 0.5)
      },
      resource: {
        materialType: MaterialCategory.DEBUG_BAIT as any,
        quantity: 999,
        purity: intensity,
        magneticRadius: baitInstance.influenceRadius,
        harvestable: false // Debug baits don't get consumed
      }
    });
    
    (baitEntity as any).materialInstance = baitInstance;
    (baitEntity as any).debugLabel = label;
    
    this.instances.push(baitEntity);
    
    return baitEntity;
  }
  
  /**
   * Update materials over time - evolution pressure, regeneration, trait influence
   */
  update(deltaTime: number): void {
    try {
      const currentGeneration = gameClock.getCurrentTime().generation;
      
      for (const material of this.instances) {
        if (!material.resource || !(material as any).materialInstance) continue;
        
        const instance = (material as any).materialInstance as MaterialInstance;
        
        // Age the material
        instance.age += deltaTime;
        
        // Apply regeneration
        if (instance.archetype.renewalRate > 0) {
          const renewalAmount = instance.archetype.renewalRate * deltaTime * 0.01;
          instance.currentPurity = Math.min(1.0, instance.currentPurity + renewalAmount);
          material.resource.purity = instance.currentPurity;
        }
        
        // Check for nearby creatures and record trait influence
        this.updateCreatureTraitInfluence(material, instance);
        
        // Apply evolution pressure to modify material properties
        if (currentGeneration > instance.lastEvolutionEvent + 5) { // Every 5 generations
          this.applyEvolutionPressure(material, instance, currentGeneration);
        }
      }
      
    } catch (error) {
      log.error('RawMaterialsSystem update failed', error);
    }
  }
  
  private updateCreatureTraitInfluence(
    material: Entity<WorldSchema>,
    instance: MaterialInstance
  ): void {
    
    if (!material.transform) return;
    
    // Find nearby creatures
    const creatures = this.world.with('creature', 'transform');
    const nearbyCreatures = creatures.entities.filter(creature => {
      if (!creature.transform) return false;
      const distance = creature.transform.position.distanceTo(material.transform!.position);
      return distance <= instance.influenceRadius;
    });
    
    // Record their traits for evolution pressure calculation
    for (const creature of nearbyCreatures) {
      if (!creature.creature) continue;
      
      // Simplified - would extract actual trait values
      const creatureTraits = [
        creature.creature.energy / 100,  // Simplified trait extraction
        creature.creature.mood + 1 / 2,  // Normalize to 0-1
        // ... would have all 10 trait values
      ];
      
      instance.nearbyCreatureTraits.push(creatureTraits);
      
      // Limit history for memory management  
      if (instance.nearbyCreatureTraits.length > 100) {
        instance.nearbyCreatureTraits = instance.nearbyCreatureTraits.slice(-50);
      }
    }
  }
  
  private applyEvolutionPressure(
    material: Entity<WorldSchema>,
    instance: MaterialInstance,
    currentGeneration: number
  ): void {
    
    if (instance.nearbyCreatureTraits.length === 0) return;
    
    // Calculate average trait influence from nearby creatures
    const avgTraits = Array(10).fill(0);
    for (const creatureTraits of instance.nearbyCreatureTraits) {
      for (let i = 0; i < Math.min(creatureTraits.length, 10); i++) {
        avgTraits[i] += creatureTraits[i];
      }
    }
    
    // Normalize
    for (let i = 0; i < avgTraits.length; i++) {
      avgTraits[i] /= instance.nearbyCreatureTraits.length;
    }
    
    // Apply evolutionary pressure to material properties
    let significantChange = false;
    for (let i = 0; i < instance.archetype.traitInfluence.length; i++) {
      const influence = instance.archetype.traitInfluence[i];
      const creaturePressure = avgTraits[i] || 0;
      const pressure = influence * creaturePressure * instance.archetype.mutabilityFactor;
      
      instance.evolutionPressure[i] += pressure;
      
      // Check for significant evolution
      if (Math.abs(pressure) > 0.1) {
        significantChange = true;
      }
    }
    
    // Record evolution event if significant
    if (significantChange) {
      const event: EvolutionEvent = {
        generation: currentGeneration,
        timestamp: gameClock.getCurrentTime().gameTimeMs,
        eventType: 'trait_emergence',
        description: `Material ${instance.archetype.category} evolved under creature pressure`,
        affectedCreatures: [], // Would list actual creature IDs
        traits: avgTraits,
        significance: 0.6
      };
      
      gameClock.recordEvent(event);
      instance.lastEvolutionEvent = currentGeneration;
    }
  }
  
  // Get materials by affinity for creature AI
  getMaterialsByAffinity(affinityMask: number, position: THREE.Vector3, radius: number): Entity<WorldSchema>[] {
    return this.instances.filter(material => {
      if (!material.resource || !material.transform) return false;
      
      const distance = material.transform.position.distanceTo(position);
      if (distance > radius) return false;
      
      const materialArchetype = this.archetypes.get(material.resource.materialType as MaterialCategory);
      if (!materialArchetype) return false;
      
      // Check affinity overlap
      return (materialArchetype.affinityMask & affinityMask) > 0;
    });
  }
  
  // Analysis methods for debugging
  getMaterialAnalysis(): {
    totalMaterials: number;
    categoryCounts: Record<string, number>;
    averagePurity: number;
    evolutionActivity: number;
  } {
    const analysis = {
      totalMaterials: this.instances.length,
      categoryCounts: this.categorizeMaterials(this.instances),
      averagePurity: 0,
      evolutionActivity: 0
    };
    
    let puritySum = 0;
    let evolutionEvents = 0;
    
    for (const material of this.instances) {
      if (material.resource) {
        puritySum += material.resource.purity;
      }
      
      const instance = (material as any).materialInstance as MaterialInstance;
      if (instance?.evolutionPressure.some(p => Math.abs(p) > 0.1)) {
        evolutionEvents++;
      }
    }
    
    analysis.averagePurity = this.instances.length > 0 ? puritySum / this.instances.length : 0;
    analysis.evolutionActivity = this.instances.length > 0 ? evolutionEvents / this.instances.length : 0;
    
    return analysis;
  }
}

export default RawMaterialsSystem;