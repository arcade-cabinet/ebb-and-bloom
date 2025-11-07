/**
 * Debug System - Integrated debugging tools for evolution simulation
 * Built into the game as production feature, not external hack
 */

import { World, Entity } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { WorldSchema, Transform, CreatureData, ResourceNode } from '../world/ECSWorld';

export interface DebugBait {
  position: THREE.Vector3;
  traitSignature: number[];    // Programmable traits to attract creatures
  attractionRadius: number;    // How far creatures can sense it
  intensity: number;          // Strength of attraction (0-1)
  activeTime: number;         // How long it's been active
  affectedCreatures: string[]; // Entity IDs that have been influenced
  testLabel: string;          // What we're testing with this bait
}

export interface EvolutionDebugData {
  generationSnapshots: GenerationSnapshot[];
  traitDistributions: Map<string, number[]>;  // Trait histograms over time
  behaviorChanges: BehaviorChangeRecord[];
  spatialEvolution: SpatialEvolutionData;     // How traits spread geographically
}

interface GenerationSnapshot {
  generation: number;
  timestamp: number;
  creatureCount: number;
  averageTraits: number[];
  dominantBehaviors: string[];
  packFormations: number;
  extinctions: number;
  newSpecies: number;
}

interface BehaviorChangeRecord {
  creatureId: string;
  generation: number;
  oldBehavior: string;
  newBehavior: string;
  triggeringFactor: string;  // What caused the change
  traitValues: number[];
}

interface SpatialEvolutionData {
  traitHotspots: Array<{
    position: THREE.Vector3;
    radius: number;
    dominantTraits: number[];
    influence: number;
  }>;
}

class DebugSystem {
  private world: World<WorldSchema>;
  private debugBaits: Map<string, Entity<WorldSchema>> = new Map();
  private evolutionData: EvolutionDebugData;
  private snapshotInterval: number = 5; // Every 5 generations
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.evolutionData = {
      generationSnapshots: [],
      traitDistributions: new Map(),
      behaviorChanges: [],
      spatialEvolution: { traitHotspots: [] }
    };
    
    log.info('DebugSystem initialized', {
      snapshotInterval: this.snapshotInterval
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Listen to game clock for generation snapshots
    gameClock.onTimeUpdate((time) => {
      if (time.generation > 0 && time.generation % this.snapshotInterval === 0) {
        this.captureGenerationSnapshot(time);
      }
    });
    
    // Listen to evolution events for behavior tracking
    gameClock.onEvolutionEvent((event) => {
      this.recordEvolutionEvent(event);
    });
  }
  
  /**
   * Create debug bait to test creature attraction and evolution
   */
  createDebugBait(
    position: THREE.Vector3,
    traitSignature: number[],
    testLabel: string,
    intensity: number = 0.8
  ): string {
    
    const baitId = `debug_bait_${Date.now()}`;
    
    log.info('Creating debug bait', {
      baitId,
      position: position.toArray(),
      traitSignature,
      testLabel,
      intensity
    });
    
    // Create visual bait entity
    const baitEntity = this.world.add({
      transform: {
        position: position.clone(),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      resource: {
        materialType: 'debug_bait' as any,
        quantity: 999, // Infinite for testing
        purity: intensity,
        magneticRadius: 20 + (intensity * 30), // Variable attraction range
        harvestable: false // Can't be consumed
      }
    });
    
    // Store bait data
    this.debugBaits.set(baitId, baitEntity);
    
    // Create visual representation - little brown lump as requested
    const mesh = this.createBaitMesh(intensity, testLabel);
    mesh.position.copy(position);
    
    // Add to entity's render data (if renderer supports it)
    (baitEntity as any).render = {
      mesh,
      material: mesh.material,
      visible: true,
      castShadow: true,
      receiveShadow: true
    };
    
    return baitId;
  }
  
  private createBaitMesh(intensity: number, label: string): THREE.Group {
    const group = new THREE.Group();
    
    // Brown lump base
    const lumpGeometry = new THREE.SphereGeometry(0.5 + (intensity * 0.5), 8, 8);
    const lumpMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color().setHSL(0.08, 0.6, 0.3), // Brown
      transparent: true,
      opacity: 0.8
    });
    
    const lump = new THREE.Mesh(lumpGeometry, lumpMaterial);
    lump.castShadow = true;
    group.add(lump);
    
    // Pulsing glow to indicate debug nature
    const glowGeometry = new THREE.SphereGeometry(1 + intensity, 12, 12);
    const glowMaterial = new THREE.MeshLambertMaterial({
      color: 0x44ff44,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Debug label (floating text would be ideal, but simple geometry for now)
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
    const labelMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.y = 2;
    labelMesh.rotateX(-Math.PI / 2);
    group.add(labelMesh);
    
    // Store metadata
    group.userData = {
      debugType: 'bait',
      label,
      intensity,
      created: Date.now()
    };
    
    return group;
  }
  
  /**
   * Update bait attraction and record creature responses
   */
  updateBaits(deltaTime: number): void {
    const creatures = this.world.with('creature', 'transform', 'yukaAgent');
    
    for (const [baitId, baitEntity] of this.debugBaits.entries()) {
      if (!baitEntity.transform || !baitEntity.resource) continue;
      
      const baitPosition = baitEntity.transform.position;
      const attractionRadius = baitEntity.resource.magneticRadius;
      const intensity = baitEntity.resource.purity;
      
      // Check creature attraction
      for (const creature of creatures) {
        if (!creature.transform || !creature.creature || !creature.yukaAgent) continue;
        
        const distance = creature.transform.position.distanceTo(baitPosition);
        
        if (distance <= attractionRadius) {
          this.recordBaitInteraction(baitId, creature, distance, intensity);
          
          // Influence creature behavior toward bait
          this.influenceCreatureBehavior(creature, baitPosition, intensity);
        }
      }
    }
  }
  
  private recordBaitInteraction(
    baitId: string,
    creature: Entity<WorldSchema>,
    distance: number,
    intensity: number
  ): void {
    
    const interaction = {
      baitId,
      creatureId: `creature_${creature}`,
      generation: gameClock.getCurrentTime().generation,
      distance,
      intensity,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      creatureTraits: creature.creature?.energy || 0, // Simplified for now
      behaviorBefore: creature.yukaAgent?.behaviorType || 'unknown'
    };
    
    log.debug('Debug bait interaction', interaction);
  }
  
  private influenceCreatureBehavior(
    creature: Entity<WorldSchema>,
    baitPosition: THREE.Vector3,
    intensity: number
  ): void {
    
    if (!creature.yukaAgent?.vehicle) return;
    
    // Add seek behavior toward bait (for testing attraction)
    const seekBait = new (window as any).YUKA.SeekBehavior();
    seekBait.target = new (window as any).YUKA.Vector3(
      baitPosition.x,
      baitPosition.y, 
      baitPosition.z
    );
    seekBait.weight = intensity;
    
    // Temporarily add to steering (would be more sophisticated in production)
    creature.yukaAgent.vehicle.steering.add(seekBait);
    
    // Record the behavioral influence
    log.creature('Bait influence applied', `creature_${creature}`, {
      baitIntensity: intensity,
      seekWeight: intensity
    });
  }
  
  private captureGenerationSnapshot(time: any): void {
    const creatures = this.world.with('creature', 'transform');
    
    const snapshot: GenerationSnapshot = {
      generation: time.generation,
      timestamp: time.gameTimeMs,
      creatureCount: creatures.entities.length,
      averageTraits: this.calculateAverageTraits(creatures),
      dominantBehaviors: this.getDominantBehaviors(creatures),
      packFormations: this.countPackFormations(creatures),
      extinctions: 0, // Would track species that disappeared
      newSpecies: 0   // Would track new species that emerged
    };
    
    this.evolutionData.generationSnapshots.push(snapshot);
    
    log.info('Generation snapshot captured', snapshot);
    
    // Export for external analysis
    this.exportEvolutionData();
  }
  
  private calculateAverageTraits(creatures: any): number[] {
    // Simplified - would calculate actual trait averages
    return [0.5, 0.3, 0.7]; // Placeholder
  }
  
  private getDominantBehaviors(creatures: any): string[] {
    // Simplified - would analyze actual behaviors
    return ['foraging', 'wandering'];
  }
  
  private countPackFormations(creatures: any): number {
    // Simplified - would count actual pack formations
    return 0;
  }
  
  private recordEvolutionEvent(event: EvolutionEvent): void {
    // Store event for analysis
    log.info('Evolution event recorded for analysis', event);
  }
  
  private exportEvolutionData(): void {
    // Export data for external analysis tools
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        totalGenerations: this.evolutionData.generationSnapshots.length,
        timeScale: gameClock.getConfig().timeScale
      },
      snapshots: this.evolutionData.generationSnapshots,
      summary: this.getEvolutionSummary()
    };
    
    // Log as structured data for file output
    log.info('Evolution data export', exportData);
  }
  
  private getEvolutionSummary(): any {
    const snapshots = this.evolutionData.generationSnapshots;
    if (snapshots.length === 0) return null;
    
    const latest = snapshots[snapshots.length - 1];
    const first = snapshots[0];
    
    return {
      generationSpan: latest.generation - first.generation,
      creatureCountChange: latest.creatureCount - first.creatureCount,
      evolutionRate: 'calculated from trait distributions',
      significantEvents: 'extracted from event log'
    };
  }
  
  // Public debug controls
  setEvolutionPressure(pressure: number): void {
    // Would modify evolution parameters
    log.info('Debug: Evolution pressure changed', { pressure });
  }
  
  triggerEvolutionEvent(eventType: EvolutionEvent['eventType']): void {
    // Manually trigger evolution for testing
    const event: EvolutionEvent = {
      generation: gameClock.getCurrentTime().generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType,
      description: `Debug-triggered ${eventType}`,
      affectedCreatures: [],
      traits: [],
      significance: 0.9
    };
    
    gameClock.recordEvent(event);
  }
  
  // Get debug info for UI display
  getDebugStatus(): {
    activeBaits: number;
    currentGeneration: number;
    evolutionEvents: number;
    averageEventsPerGeneration: number;
  } {
    const currentTime = gameClock.getCurrentTime();
    const summary = gameClock.getEvolutionSummary();
    
    return {
      activeBaits: this.debugBaits.size,
      currentGeneration: currentTime.generation,
      evolutionEvents: currentTime.evolutionEvents.length,
      averageEventsPerGeneration: summary.averageEventsPerGeneration
    };
  }
}

export default DebugSystem;