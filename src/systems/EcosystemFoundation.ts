/**
 * Ecosystem Foundation - Master coordinator for all ecological systems
 * Integrates all systems into complete evolutionary simulation
 */

import { World } from 'miniplex';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';

import TerrainSystem from './TerrainSystem';
import RawMaterialsSystem from './RawMaterialsSystem';
import CreatureArchetypeSystem from './CreatureArchetypeSystem';
import GeneticSynthesisSystem from './GeneticSynthesisSystem';
import PopulationDynamicsSystem from './PopulationDynamicsSystem';
import TextureSystem from './TextureSystem';
import BuildingSystem from './BuildingSystem';
import PackSocialSystem from './PackSocialSystem';
import EnvironmentalPressureSystem from './EnvironmentalPressureSystem';
import HaikuNarrativeSystem from './HaikuNarrativeSystem';
import HapticGestureSystem from './HapticGestureSystem';

export interface EcosystemState {
  totalCreatures: number;
  uniqueArchetypes: number;
  materialDistribution: Record<string, number>;
  evolutionRate: number;
  populationPressure: number;
  averageTraitValues: number[];
  emergentSpecies: string[];
  significantEvents: number;
}

class EcosystemFoundation {
  private world: World<WorldSchema>;
  
  // All major systems
  private terrainSystem: TerrainSystem;
  private materialsSystem: RawMaterialsSystem;
  private creatureSystem: CreatureArchetypeSystem;
  private geneticsSystem: GeneticSynthesisSystem;
  private populationSystem: PopulationDynamicsSystem;
  private textureSystem: TextureSystem;
  private buildingSystem: BuildingSystem;
  private packSocialSystem: PackSocialSystem;
  private environmentalSystem: EnvironmentalPressureSystem;
  private narrativeSystem: HaikuNarrativeSystem;
  private gestureSystem: HapticGestureSystem;
  
  // System state
  private initialized = false;
  private running = false;
  
  constructor(world: World<WorldSchema>, textureSystem: TextureSystem) {
    this.world = world;
    this.textureSystem = textureSystem;
    
    // Initialize all systems
    this.terrainSystem = new TerrainSystem(world);
    this.materialsSystem = new RawMaterialsSystem(world);
    this.creatureSystem = new CreatureArchetypeSystem(world);
    this.geneticsSystem = new GeneticSynthesisSystem();
    this.populationSystem = new PopulationDynamicsSystem(world);
    this.buildingSystem = new BuildingSystem(world);
    this.packSocialSystem = new PackSocialSystem(world);
    this.environmentalSystem = new EnvironmentalPressureSystem(world);
    this.narrativeSystem = new HaikuNarrativeSystem();
    this.gestureSystem = new HapticGestureSystem();
    
    log.info('EcosystemFoundation created with all systems');
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      log.info('Initializing complete ecosystem foundation...');
      
      // Initialize texture system first (materials need it)
      await this.textureSystem.initialize();
      
      // Generate initial terrain chunk
      log.info('Generating Eden baseline terrain...');
      this.terrainSystem.generateChunk(0, 0, 1024, 256);
      
      // Generate raw materials across terrain
      log.info('Placing raw materials using Daggerfall algorithms...');
      const dummyHeightData = new Float32Array(256 * 256).fill(20); // Placeholder
      this.materialsSystem.generateMaterialsForChunk(0, 0, 1024, dummyHeightData);
      
      // Spawn initial creature population (Eden state)
      log.info('Spawning Eden baseline creature population...');
      await this.spawnEdenPopulation();
      
      this.initialized = true;
      log.info('Ecosystem foundation initialization complete');
      
    } catch (error) {
      log.error('Ecosystem initialization failed', error);
      throw error;
    }
  }
  
  private async spawnEdenPopulation(): Promise<void> {
    const edenPositions = [
      new THREE.Vector3(10, 2, 10),
      new THREE.Vector3(-15, 2, 5),  
      new THREE.Vector3(5, 2, -20),
      new THREE.Vector3(25, 2, -10),
      new THREE.Vector3(-8, 2, 15),
      new THREE.Vector3(30, 2, 25),
      new THREE.Vector3(-20, 2, -25),
      new THREE.Vector3(0, 2, 30)
    ];
    
    // Spawn variety of base archetypes
    const archetypeDistribution = [
      'tiny_scavenger',    // 2 creatures
      'tiny_scavenger',
      'small_browser',     // 3 creatures  
      'small_browser',
      'small_browser',
      'medium_forager',    // 2 creatures
      'medium_forager', 
      'aerial_drifter'     // 1 creature
    ];
    
    for (let i = 0; i < edenPositions.length; i++) {
      const position = edenPositions[i];
      const archetype = archetypeDistribution[i] as any;
      
      this.creatureSystem.spawnCreature(archetype, position, undefined, 0);
    }
    
    log.info('Eden population spawned', {
      totalCreatures: edenPositions.length,
      archetypeVariety: new Set(archetypeDistribution).size,
      distribution: archetypeDistribution.reduce((counts, arch) => {
        counts[arch] = (counts[arch] || 0) + 1;
        return counts;
      }, {} as Record<string, number>)
    });
  }
  
  start(): void {
    if (!this.initialized) {
      throw new Error('Must initialize ecosystem before starting');
    }
    
    this.running = true;
    log.info('Ecosystem simulation started');
    
    // Start game clock
    gameClock.resume();
  }
  
  update(deltaTime: number): void {
    if (!this.running) return;
    
    try {
      // Update all systems in proper order
      this.terrainSystem.update(deltaTime);
      this.materialsSystem.update(deltaTime);
      this.environmentalSystem.update(deltaTime);
      this.populationSystem.update(deltaTime);
      this.creatureSystem.update(deltaTime);
      this.packSocialSystem.update(deltaTime);
      this.buildingSystem.update(deltaTime);
      
      // Cross-system interactions
      this.processEcosystemInteractions();
      
    } catch (error) {
      log.error('Ecosystem update failed', error);
    }
  }
  
  private processEcosystemInteractions(): void {
    // Connect materials to creature evolution
    // Connect population pressure to resource competition
    // Connect genetic synthesis to visual morphology
    // This is where the magic happens between systems
  }
  
  /**
   * Request debug materials/creatures for testing (proper game mechanic)
   */
  requestEvolutionTest(
    testName: string,
    materialTraits: number[],
    creatureArchetype: string,
    position: THREE.Vector3
  ): { materialBait: any; testCreature: any } {
    
    log.info('Requesting evolution test setup from ecosystem inventory', {
      testName,
      materialTraits,
      creatureArchetype,
      position: position.toArray()
    });
    
    // Request specific bait material
    const bait = this.materialsSystem.requestDebugBait(
      position.clone().add(new THREE.Vector3(5, 0, 0)),
      materialTraits,
      0.8,
      `${testName}_bait`
    );
    
    // Request specific test creature
    const creature = this.creatureSystem.requestDebugCreature(
      creatureArchetype as any,
      position,
      materialTraits,
      `${testName}_subject`
    );
    
    return { materialBait: bait, testCreature: creature };
  }
  
  // Analysis and monitoring
  getCurrentEcosystemState(): EcosystemState {
    const creatures = this.world.with('creature');
    const materials = this.world.with('resource');
    
    const populationReport = this.populationSystem.getPopulationReport();
    const materialAnalysis = this.materialsSystem.getMaterialAnalysis();
    const evolutionSummary = gameClock.getEvolutionSummary();
    
    return {
      totalCreatures: creatures.entities.length,
      uniqueArchetypes: 0, // Would calculate unique archetype count
      materialDistribution: materialAnalysis.categoryCounts,
      evolutionRate: evolutionSummary.averageEventsPerGeneration,
      populationPressure: populationReport.populationPressure,
      averageTraitValues: Array(10).fill(0), // Would calculate from creature traits
      emergentSpecies: [], // Would track newly evolved species
      significantEvents: evolutionSummary.totalSignificantEvents
    };
  }
  
  pause(): void {
    this.running = false;
    gameClock.pause();
    log.info('Ecosystem simulation paused');
  }
  
  resume(): void {
    this.running = true;
    gameClock.resume();
    log.info('Ecosystem simulation resumed');
  }
}

export default EcosystemFoundation;
export type { EcosystemState };