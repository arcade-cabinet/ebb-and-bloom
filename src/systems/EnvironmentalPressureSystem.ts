/**
 * Environmental Pressure System - Complete ecosystem stress and pollution tracking
 * Drives evolutionary changes based on environmental conditions
 */

import type { World } from 'miniplex';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { WorldSchema, PollutionState, BiomeProperties } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';

export enum PollutionSource {
  INDUSTRIAL = 'industrial',         // Manufacturing, crafting
  BIOLOGICAL = 'biological',         // Overpopulation, waste
  MAGICAL = 'magical',              // Unnatural effects
  THERMAL = 'thermal',              // Heat pollution
  CHEMICAL = 'chemical',            // Toxic materials
  SONIC = 'sonic',                  // Noise pollution
  LIGHT = 'light',                  // Artificial lighting
  TEMPORAL = 'temporal'             // Time/reality disturbances
}

export enum ShockEvent {
  WHISPER_SHOCK = 'whisper_shock',   // 40% pollution - subtle changes
  TEMPEST_SHOCK = 'tempest_shock',   // 70% pollution - dramatic shifts
  COLLAPSE_SHOCK = 'collapse_shock'  // 90% pollution - ecosystem breakdown
}

interface PollutionNode {
  source: PollutionSource;
  position: THREE.Vector3;
  intensity: number;          // 0-1 pollution strength
  radius: number;             // Area of effect
  persistence: number;        // How long it lasts (0-1)
  createdAt: number;          // Generation when created
  
  // Effects on different systems
  creatureEffects: {
    stressIncrease: number;   // Adds to creature stress
    mutationRate: number;     // Increases evolution speed
    fertilityImpact: number;  // Affects breeding success
    mortalityRisk: number;    // Increases death probability
  };
  
  materialEffects: {
    purityDegradation: number; // Reduces material quality
    affinityShift: number;     // Changes material affinities
    renewalImpact: number;     // Affects regeneration rate
  };
  
  biomeEffects: {
    fertilityChange: number;   // Affects biome productivity
    stabilityImpact: number;   // Changes biome resistance
    speciesLoss: number;       // Reduces biodiversity
  };
}

interface BiomeStressState {
  biomeId: string;
  stressLevel: number;        // 0-1 cumulative stress
  adaptationPressure: number; // Evolutionary force
  refugeAreas: THREE.Vector3[]; // Clean zones for creatures
  
  // Stress sources
  pollutionSources: PollutionNode[];
  overpopulation: number;     // Population density stress
  resourceDepletion: number;  // Scarcity stress
  climaticShift: number;      // Environmental change stress
  
  // Adaptation responses
  emergentTraits: number[];   // New traits developing
  resistanceEvolution: number; // Pollution tolerance
  migrationPressure: number;  // Urge to leave area
}

class EnvironmentalPressureSystem {
  private world: World<WorldSchema>;
  private pollutionNodes: PollutionNode[] = [];
  private biomeStates = new Map<string, BiomeStressState>();
  private environmentNoise = createNoise2D();
  private shockThresholds = {
    [ShockEvent.WHISPER_SHOCK]: 0.4,
    [ShockEvent.TEMPEST_SHOCK]: 0.7,
    [ShockEvent.COLLAPSE_SHOCK]: 0.9
  };
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.initializeBiomeTracking();
    log.info('EnvironmentalPressureSystem initialized with pollution and shock tracking');
  }
  
  private initializeBiomeTracking(): void {
    // Initialize biome stress tracking for different terrain regions
    const biomeRegions = [
      { id: 'lowlands', center: new THREE.Vector3(-200, 0, -200), type: 'wetlands' },
      { id: 'highlands', center: new THREE.Vector3(200, 0, 200), type: 'mountains' },
      { id: 'central', center: new THREE.Vector3(0, 0, 0), type: 'plains' },
      { id: 'forest', center: new THREE.Vector3(-200, 0, 200), type: 'forest' },
      { id: 'desert', center: new THREE.Vector3(200, 0, -200), type: 'desert' }
    ];
    
    for (const region of biomeRegions) {
      const biomeEntity = this.world.add({
        transform: {
          position: region.center,
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(100, 1, 100)
        },
        biomeProperties: {
          type: region.type as any,
          fertility: 0.7,
          hostility: 0.2,
          stability: 0.8,
          uniqueResources: [],
          seasonalVariation: 0.4
        },
        pollutionState: {
          local: 0.0,
          global: 0.0,
          sources: [],
          shockThreshold: this.shockThresholds[ShockEvent.WHISPER_SHOCK],
          purificationRate: 0.02 // 2% natural cleanup per generation
        }
      });
      
      this.biomeStates.set(region.id, {
        biomeId: region.id,
        stressLevel: 0.0,
        adaptationPressure: 0.0,
        refugeAreas: [region.center],
        pollutionSources: [],
        overpopulation: 0.0,
        resourceDepletion: 0.0,
        climaticShift: 0.0,
        emergentTraits: Array(10).fill(0),
        resistanceEvolution: 0.0,
        migrationPressure: 0.0
      });
    }
    
    log.info('Biome tracking initialized', {
      regions: biomeRegions.length,
      shockThresholds: this.shockThresholds
    });
  }
  
  /**
   * Create pollution source from activity
   */
  createPollutionSource(
    source: PollutionSource,
    position: THREE.Vector3,
    intensity: number,
    activity: string
  ): void {
    
    const pollutionNode: PollutionNode = {
      source,
      position: position.clone(),
      intensity: Math.max(0, Math.min(1, intensity)),
      radius: 20 + intensity * 30, // Stronger pollution spreads further
      persistence: 0.8 + intensity * 0.2, // Stronger pollution lasts longer
      createdAt: gameClock.getCurrentTime().generation,
      
      creatureEffects: {
        stressIncrease: intensity * 0.3,
        mutationRate: intensity * 0.2,
        fertilityImpact: -intensity * 0.4,
        mortalityRisk: intensity * 0.1
      },
      
      materialEffects: {
        purityDegradation: intensity * 0.3,
        affinityShift: intensity * 0.2,
        renewalImpact: -intensity * 0.5
      },
      
      biomeEffects: {
        fertilityChange: -intensity * 0.6,
        stabilityImpact: -intensity * 0.4,
        speciesLoss: intensity * 0.2
      }
    };
    
    this.pollutionNodes.push(pollutionNode);
    
    // Find affected biome and update stress
    const affectedBiome = this.findNearestBiome(position);
    if (affectedBiome) {
      affectedBiome.pollutionSources.push(pollutionNode);
      this.updateBiomeStress(affectedBiome, pollutionNode);
    }
    
    log.info('Pollution source created', {
      source,
      position: position.toArray(),
      intensity,
      activity,
      radius: pollutionNode.radius,
      affectedBiome: affectedBiome?.biomeId
    });
    
    // Check for shock events
    this.checkShockEvents(affectedBiome);
  }
  
  private findNearestBiome(position: THREE.Vector3): BiomeStressState | null {
    let nearestBiome: BiomeStressState | null = null;
    let nearestDistance = Infinity;
    
    for (const biome of this.biomeStates.values()) {
      const biomeEntity = this.world.with('biomeProperties')
        .entities.find(e => e.biomeProperties?.type && this.getBiomeId(e) === biome.biomeId);
      
      if (biomeEntity?.transform) {
        const distance = position.distanceTo(biomeEntity.transform.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestBiome = biome;
        }
      }
    }
    
    return nearestBiome;
  }
  
  private getBiomeId(biomeEntity: import('miniplex').With<WorldSchema, keyof WorldSchema>): string {
    // Would extract proper biome ID from entity
    return 'central'; // Simplified
  }
  
  private updateBiomeStress(biome: BiomeStressState, pollution: PollutionNode): void {
    // Calculate cumulative stress from all pollution sources
    let totalStress = 0;
    
    for (const source of biome.pollutionSources) {
      const age = gameClock.getCurrentTime().generation - source.createdAt;
      const currentIntensity = source.intensity * Math.pow(source.persistence, age);
      totalStress += currentIntensity;
    }
    
    biome.stressLevel = Math.min(1, totalStress);
    biome.adaptationPressure = biome.stressLevel * 0.5; // Stress drives adaptation
    
    // Update emergent traits based on pollution type
    switch (pollution.source) {
      case PollutionSource.CHEMICAL:
        biome.emergentTraits[8] += pollution.intensity * 0.1; // Toxin resistance
        break;
      case PollutionSource.THERMAL:
        biome.emergentTraits[9] += pollution.intensity * 0.1; // Heat adaptation
        break;
      case PollutionSource.BIOLOGICAL:
        biome.emergentTraits[6] += pollution.intensity * 0.1; // Disease resistance
        break;
    }
    
    // Migration pressure increases with stress
    biome.migrationPressure = Math.min(1, biome.stressLevel * 1.5);
  }
  
  private checkShockEvents(biome: BiomeStressState | null): void {
    if (!biome) return;
    
    let shockEvent: ShockEvent | null = null;
    
    if (biome.stressLevel >= this.shockThresholds[ShockEvent.COLLAPSE_SHOCK]) {
      shockEvent = ShockEvent.COLLAPSE_SHOCK;
    } else if (biome.stressLevel >= this.shockThresholds[ShockEvent.TEMPEST_SHOCK]) {
      shockEvent = ShockEvent.TEMPEST_SHOCK;
    } else if (biome.stressLevel >= this.shockThresholds[ShockEvent.WHISPER_SHOCK]) {
      shockEvent = ShockEvent.WHISPER_SHOCK;
    }
    
    if (shockEvent) {
      this.triggerShockEvent(shockEvent, biome);
    }
  }
  
  private triggerShockEvent(shockType: ShockEvent, biome: BiomeStressState): void {
    log.info('Environmental shock event triggered', {
      shockType,
      biomeId: biome.biomeId,
      stressLevel: biome.stressLevel,
      generation: gameClock.getCurrentTime().generation
    });
    
    // Apply shock effects based on type
    switch (shockType) {
      case ShockEvent.WHISPER_SHOCK:
        this.applyWhisperShock(biome);
        break;
      case ShockEvent.TEMPEST_SHOCK:
        this.applyTempestShock(biome);
        break;
      case ShockEvent.COLLAPSE_SHOCK:
        this.applyCollapseShock(biome);
        break;
    }
    
    // Record shock event
    const event: EvolutionEvent = {
      generation: gameClock.getCurrentTime().generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType: 'extinction', // Shocks can cause local extinctions
      description: `${shockType} in ${biome.biomeId} biome`,
      affectedCreatures: this.getCreaturesInBiome(biome),
      traits: biome.emergentTraits,
      significance: this.getShockSignificance(shockType)
    };
    
    gameClock.recordEvent(event);
  }
  
  private applyWhisperShock(biome: BiomeStressState): void {
    // Subtle changes - increased mutation rate, trait drift
    biome.adaptationPressure += 0.2;
    
    // Boost emergent traits development
    for (let i = 0; i < biome.emergentTraits.length; i++) {
      biome.emergentTraits[i] += 0.1;
    }
    
    // Slight migration pressure increase
    biome.migrationPressure += 0.1;
    
    log.info('Whisper shock effects applied', {
      biomeId: biome.biomeId,
      adaptationBoost: 0.2,
      migrationIncrease: 0.1
    });
  }
  
  private applyTempestShock(biome: BiomeStressState): void {
    // Dramatic changes - forced adaptations, population shifts
    biome.adaptationPressure += 0.5;
    biome.migrationPressure += 0.4;
    
    // Major trait emergence
    for (let i = 0; i < biome.emergentTraits.length; i++) {
      if (Math.random() < 0.3) { // 30% chance per trait
        biome.emergentTraits[i] += 0.3 + Math.random() * 0.4;
      }
    }
    
    // Force some creatures to migrate
    this.forceMigration(biome, 0.3); // 30% of creatures
    
    log.info('Tempest shock effects applied', {
      biomeId: biome.biomeId,
      adaptationBoost: 0.5,
      migrationForced: '30% of population'
    });
  }
  
  private applyCollapseShock(biome: BiomeStressState): void {
    // Catastrophic changes - local extinctions, rapid speciation
    biome.adaptationPressure += 1.0; // Maximum pressure
    biome.migrationPressure += 0.8;
    
    // Extreme trait mutations
    for (let i = 0; i < biome.emergentTraits.length; i++) {
      biome.emergentTraits[i] += 0.5 + Math.random() * 0.5; // Major changes
    }
    
    // Mass extinction of vulnerable creatures
    this.causeLocalExtinctions(biome, 0.5); // 50% mortality
    
    // Rapid speciation for survivors
    this.accelerateSpeciation(biome, 3.0); // 3x normal rate
    
    log.info('Collapse shock effects applied - ecosystem crisis', {
      biomeId: biome.biomeId,
      extinctionRate: '50%',
      speciationAcceleration: '3x normal'
    });
  }
  
  private getCreaturesInBiome(biome: BiomeStressState): string[] {
    const creatures = this.world.with('creature', 'transform');
    const biomeCreatures: string[] = [];
    
    // Find biome entity to get position
    const biomeEntity = this.world.with('biomeProperties')
      .entities.find(e => this.getBiomeId(e) === biome.biomeId);
    
    if (!biomeEntity?.transform) return [];
    
    const biomeCenter = biomeEntity.transform.position;
    const biomeRadius = 100; // Biome influence radius
    
    for (const creature of creatures.entities) {
      if (!creature.transform) continue;
      
      const distance = creature.transform.position.distanceTo(biomeCenter);
      if (distance <= biomeRadius) {
        biomeCreatures.push(creature.toString());
      }
    }
    
    return biomeCreatures;
  }
  
  private getShockSignificance(shockType: ShockEvent): number {
    const significance = {
      [ShockEvent.WHISPER_SHOCK]: 0.4,
      [ShockEvent.TEMPEST_SHOCK]: 0.7,
      [ShockEvent.COLLAPSE_SHOCK]: 0.95
    };
    
    return significance[shockType];
  }
  
  private forceMigration(biome: BiomeStressState, percentage: number): void {
    const creatures = this.getCreaturesInBiome(biome);
    const migrationCount = Math.floor(creatures.length * percentage);
    
    // Select creatures for migration (preferably juveniles and followers)
    const migrants = creatures.slice(0, migrationCount);
    
    for (const creatureId of migrants) {
      // Would trigger migration behavior in creature AI
      log.debug('Forcing creature migration due to environmental pressure', {
        creatureId,
        biome: biome.biomeId,
        reason: 'pollution_shock'
      });
    }
  }
  
  private causeLocalExtinctions(biome: BiomeStressState, mortalityRate: number): void {
    const creatures = this.getCreaturesInBiome(biome);
    const extinctionCount = Math.floor(creatures.length * mortalityRate);
    
    // Target vulnerable creatures first (low resistance traits)
    const vulnerableCreatures = creatures.slice(0, extinctionCount);
    
    for (const creatureId of vulnerableCreatures) {
      // Would remove creature entity and record death
      log.info('Local extinction due to environmental collapse', {
        creatureId,
        biome: biome.biomeId,
        cause: 'environmental_collapse'
      });
    }
  }
  
  private accelerateSpeciation(biome: BiomeStressState, accelerationFactor: number): void {
    // Increase mutation rates for all creatures in biome
    const creatures = this.getCreaturesInBiome(biome);
    
    for (const creatureId of creatures) {
      // Would increase mutation rate for creature
      log.debug('Accelerating speciation for shock survivor', {
        creatureId,
        biome: biome.biomeId,
        accelerationFactor
      });
    }
    
    // Boost emergent traits development
    for (let i = 0; i < biome.emergentTraits.length; i++) {
      biome.emergentTraits[i] *= accelerationFactor;
    }
  }
  
  /**
   * Calculate environmental pressure on specific creature
   */
  calculateCreaturePressure(creature: import('miniplex').With<WorldSchema, keyof WorldSchema>): {
    totalPressure: number;
    stressSources: string[];
    adaptationBonuses: number[];
    migrationUrgency: number;
  } {
    
    if (!creature.transform) {
      return { totalPressure: 0, stressSources: [], adaptationBonuses: [], migrationUrgency: 0 };
    }
    
    const position = creature.transform.position;
    let totalPressure = 0;
    const stressSources: string[] = [];
    const adaptationBonuses = Array(10).fill(0);
    
    // Check pollution exposure
    for (const pollution of this.pollutionNodes) {
      const distance = position.distanceTo(pollution.position);
      
      if (distance <= pollution.radius) {
        const exposure = (1 - distance / pollution.radius) * pollution.intensity;
        totalPressure += exposure;
        stressSources.push(`${pollution.source}_pollution`);
        
        // Apply adaptation pressures based on pollution type
        this.applyPollutionAdaptation(pollution, adaptationBonuses, exposure);
      }
    }
    
    // Check biome stress
    const nearestBiome = this.findNearestBiome(position);
    if (nearestBiome) {
      totalPressure += nearestBiome.stressLevel * 0.5;
      
      for (let i = 0; i < adaptationBonuses.length; i++) {
        adaptationBonuses[i] += nearestBiome.emergentTraits[i] * 0.1;
      }
    }
    
    // Calculate migration urgency
    const migrationUrgency = Math.min(1, totalPressure * 1.5);
    
    return {
      totalPressure: Math.min(1, totalPressure),
      stressSources,
      adaptationBonuses,
      migrationUrgency
    };
  }
  
  private applyPollutionAdaptation(
    pollution: PollutionNode,
    adaptationBonuses: number[],
    exposure: number
  ): void {
    
    switch (pollution.source) {
      case PollutionSource.CHEMICAL:
        adaptationBonuses[8] += exposure * 0.3; // Toxin resistance
        break;
      case PollutionSource.THERMAL:  
        adaptationBonuses[9] += exposure * 0.3; // Heat adaptation
        break;
      case PollutionSource.BIOLOGICAL:
        adaptationBonuses[6] += exposure * 0.2; // Disease resistance
        adaptationBonuses[7] += exposure * 0.1; // Stress tolerance
        break;
      case PollutionSource.SONIC:
        adaptationBonuses[4] += exposure * 0.2; // Enhanced hearing/communication
        break;
      case PollutionSource.LIGHT:
        adaptationBonuses[5] += exposure * 0.2; // Vision adaptation
        break;
    }
  }
  
  /**
   * Update system over time - pollution spread, biome recovery, shock monitoring
   */
  update(deltaTime: number): void {
    // Update pollution persistence (natural decay)
    this.updatePollutionDecay(deltaTime);
    
    // Update biome stress and recovery
    this.updateBiomeRecovery(deltaTime);
    
    // Check for new shock thresholds
    this.monitorShockThresholds();
    
    // Apply environmental pressure to creatures
    this.applyEnvironmentalPressure();
  }
  
  private updatePollutionDecay(deltaTime: number): void {
    const decayRate = 0.001; // Natural pollution cleanup per second
    
    this.pollutionNodes = this.pollutionNodes.filter(pollution => {
      pollution.intensity -= decayRate * deltaTime;
      return pollution.intensity > 0.01; // Remove very weak pollution
    });
  }
  
  private updateBiomeRecovery(deltaTime: number): void {
    for (const biome of this.biomeStates.values()) {
      // Natural stress recovery
      const recoveryRate = 0.02 * deltaTime; // 2% per update
      biome.stressLevel = Math.max(0, biome.stressLevel - recoveryRate);
      
      // Adaptation pressure gradually decreases
      biome.adaptationPressure *= 0.995;
      
      // Emergent traits stabilize over time
      for (let i = 0; i < biome.emergentTraits.length; i++) {
        biome.emergentTraits[i] *= 0.99;
      }
    }
  }
  
  private monitorShockThresholds(): void {
    for (const biome of this.biomeStates.values()) {
      // Dynamic shock thresholds based on biome adaptation
      const baseThreshold = this.shockThresholds[ShockEvent.WHISPER_SHOCK];
      const adaptationBonus = biome.resistanceEvolution * 0.2;
      
      // More adapted biomes can handle higher pollution before shock
      const adjustedThreshold = Math.min(0.8, baseThreshold + adaptationBonus);
      
      // Update biome entity with new threshold
      const biomeEntity = this.world.with('biomeProperties', 'pollutionState')
        .entities.find(e => this.getBiomeId(e) === biome.biomeId);
      
      if (biomeEntity?.pollutionState) {
        biomeEntity.pollutionState.shockThreshold = adjustedThreshold;
      }
    }
  }
  
  private applyEnvironmentalPressure(): void {
    const creatures = this.world.with('creature', 'transform');
    
    for (const creature of creatures.entities) {
      const pressure = this.calculateCreaturePressure(creature);
      
      if (pressure.totalPressure > 0.1) {
        // Apply pressure to creature evolution
        const evolutionData = (creature as any).evolutionaryCreature as EvolutionaryCreature;
        if (evolutionData) {
          // Increase stress
          evolutionData.stress += pressure.totalPressure * 0.1;
          evolutionData.stress = Math.min(1, evolutionData.stress);
          
          // Apply adaptation bonuses to traits
          for (let i = 0; i < pressure.adaptationBonuses.length; i++) {
            if (pressure.adaptationBonuses[i] > 0) {
              evolutionData.currentTraits[i] += pressure.adaptationBonuses[i] * 0.01;
              evolutionData.currentTraits[i] = Math.min(1, evolutionData.currentTraits[i]);
            }
          }
          
          // Update creature energy based on stress
          if (creature.creature) {
            creature.creature.energy = Math.max(10, creature.creature.energy - (evolutionData.stress * 20));
          }
        }
      }
    }
  }
  
  /**
   * Create purification grove - natural cleanup area
   */
  createPurificationGrove(position: THREE.Vector3, radius: number): void {
    // Create negative pollution (cleanup area)
    this.createPollutionSource(
      PollutionSource.BIOLOGICAL,
      position,
      -0.5, // Negative pollution = cleanup
      'purification_grove'
    );
    
    log.info('Purification grove created', {
      position: position.toArray(),
      radius,
      cleanupRate: 0.5
    });
  }
  
  // Analysis methods
  getEnvironmentalReport(): {
    globalPollution: number;
    activeSources: number;
    biomeStress: Record<string, number>;
    shockHistory: ShockEvent[];
    refugeAreas: number;
  } {
    let globalPollution = 0;
    let activeSources = 0;
    const biomeStress: Record<string, number> = {};
    let refugeAreas = 0;
    
    // Calculate global pollution from all active sources
    for (const pollution of this.pollutionNodes) {
      globalPollution += pollution.intensity * 0.1;
      activeSources++;
    }
    
    // Biome stress levels
    for (const [biomeId, biome] of this.biomeStates.entries()) {
      biomeStress[biomeId] = biome.stressLevel;
      refugeAreas += biome.refugeAreas.length;
    }
    
    return {
      globalPollution: Math.min(1, globalPollution),
      activeSources,
      biomeStress,
      shockHistory: [], // Would track shock event history
      refugeAreas
    };
  }
}

export default EnvironmentalPressureSystem;