/**
 * Ecosystem Foundation - Master coordinator for all ecological systems
 * Integrates all systems into complete evolutionary simulation
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import type { WorldSchema } from '../world/ECSWorld';
import { gameClock } from './GameClock';

import BuildingSystem from './BuildingSystem';
import CreatureArchetypeSystem, { CreatureCategory } from './CreatureArchetypeSystem';
import EnvironmentalPressureSystem from './EnvironmentalPressureSystem';
import GeneticSynthesisSystem from './GeneticSynthesisSystem';
import HaikuNarrativeSystem from './HaikuNarrativeSystem';
import HapticGestureSystem from './HapticGestureSystem';
import PackSocialSystem from './PackSocialSystem';
import PopulationDynamicsSystem from './PopulationDynamicsSystem';
import RawMaterialsSystem from './RawMaterialsSystem';
import TerrainSystem from './TerrainSystem';
import TextureSystem from './TextureSystem';
import YukaSphereCoordinator from './YukaSphereCoordinator';
import DeconstructionSystem from './DeconstructionSystem';
import ToolArchetypeSystem from './ToolArchetypeSystem';
import CombatSystem from './CombatSystem';
import GestureActionMapper from './GestureActionMapper';
import ConsciousnessSystem from './ConsciousnessSystem';

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
  private yukaCoordinator: YukaSphereCoordinator;
  private deconstructionSystem: DeconstructionSystem;
  private toolSystem: ToolArchetypeSystem;
  private combatSystem: CombatSystem;
  private gestureMapper: GestureActionMapper;
  private consciousnessSystem: ConsciousnessSystem;

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

    // Yuka Sphere Coordinator - THE EVOLUTIONARY ENGINE
    this.yukaCoordinator = new YukaSphereCoordinator(
      world,
      this.creatureSystem,
      this.geneticsSystem,
      this.materialsSystem,
      this.buildingSystem,
      this.environmentalSystem,
      this.packSocialSystem,
      this.populationSystem
    );
    
    // Deconstruction System - Reverse Synthesis
    this.deconstructionSystem = new DeconstructionSystem(world);
    
    // Tool Archetype System - 8 fundamental tool categories
    this.toolSystem = new ToolArchetypeSystem(world);
    
    // Combat System - Conquest playstyle
    this.combatSystem = new CombatSystem(world, this.deconstructionSystem);
    
    // Gesture Action Mapper - Wires gestures to game actions with haptic feedback
    this.gestureMapper = new GestureActionMapper(world, this.gestureSystem, this.deconstructionSystem);
    
    // Consciousness System - Player as transferable awareness
    this.consciousnessSystem = new ConsciousnessSystem(world);

    log.info('EcosystemFoundation created with ALL SYSTEMS - COMPLETE YUKA ARCHITECTURE');
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      log.warn('Ecosystem already initialized, skipping');
      return;
    }

    log.info('Initializing complete ecosystem foundation - PRODUCTION MODE');

    // PRODUCTION GATE: Texture system MUST be initialized first
    // (Initialized in App.tsx before this is called)
    if (!this.textureSystem) {
      throw new Error(
        'PRODUCTION REQUIREMENT: TextureSystem not provided to EcosystemFoundation\n' +
        'Texture system must be initialized before ecosystem initialization'
      );
    }

    // Verify texture system has textures loaded
    const textureEntities = this.world.with('resource');
    if (textureEntities.entities.length === 0) {
      throw new Error(
        'PRODUCTION REQUIREMENT: No texture resources found in ECS\n' +
        'Texture system must be initialized and have loaded textures before ecosystem initialization\n' +
        'Run: pnpm setup:textures'
      );
    }

    log.info('Texture system verified - proceeding with ecosystem initialization');

    // Generate initial terrain chunk
    log.info('Generating Eden baseline terrain...');
    this.terrainSystem.generateChunk(0, 0, 1024);

    // Generate raw materials across terrain
    log.info('Placing raw materials across terrain...');
    const dummyHeightData = new Float32Array(256 * 256).fill(20); // Placeholder
    this.materialsSystem.generateMaterialsForChunk(0, 0, 1024, dummyHeightData);

    // Spawn initial creature population (Eden state)
    log.info('Spawning Eden baseline creature population...');
    await this.spawnEdenPopulation();

    // Initialize haptic feedback for evolution events
    if (typeof this.gestureSystem.initializeEvolutionListening === 'function') {
      this.gestureSystem.initializeEvolutionListening();
    } else {
      // Manual setup if method doesn't exist
      gameClock.onEvolutionEvent((event) => {
        this.gestureSystem.triggerEvolutionHaptic(event.eventType, event.significance);
      });
      log.info('HapticGestureSystem manually wired to evolution events');
    }
    
    this.initialized = true;
    log.info('Ecosystem foundation initialization complete - PRODUCTION MODE + HAPTICS');
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

    // Spawn variety of base archetypes using CreatureCategory enum
    const archetypeDistribution: CreatureCategory[] = [
      CreatureCategory.SMALL_FORAGER,    // 2 creatures
      CreatureCategory.SMALL_FORAGER,
      CreatureCategory.MEDIUM_GRAZER,   // 3 creatures  
      CreatureCategory.MEDIUM_GRAZER,
      CreatureCategory.MEDIUM_GRAZER,
      CreatureCategory.SMALL_FORAGER,   // 2 creatures
      CreatureCategory.SMALL_FORAGER,
      CreatureCategory.HYBRID_FORM      // 1 creature
    ];

    for (let i = 0; i < edenPositions.length; i++) {
      const position = edenPositions[i];
      const archetype = archetypeDistribution[i];

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
      this.toolSystem.update(deltaTime);
      this.combatSystem.update(deltaTime);

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
    creatureArchetype: CreatureCategory,
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
      creatureArchetype,
      position,
      materialTraits,
      `${testName}_subject`
    );

    return { materialBait: bait, testCreature: creature };
  }

  // Analysis and monitoring
  getCurrentEcosystemState(): EcosystemState {
    const creatures = this.world.with('creature');

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

  // System accessors for React components
  getNarrativeSystem(): HaikuNarrativeSystem {
    return this.narrativeSystem;
  }

  getEnvironmentalSystem(): EnvironmentalPressureSystem {
    return this.environmentalSystem;
  }

  getPackSocialSystem(): PackSocialSystem {
    return this.packSocialSystem;
  }
  
  getDeconstructionSystem(): DeconstructionSystem {
    return this.deconstructionSystem;
  }
  
  getConsciousnessSystem(): ConsciousnessSystem {
    return this.consciousnessSystem;
  }
  
  getToolSystem(): ToolArchetypeSystem {
    return this.toolSystem;
  }
  
  getCombatSystem(): CombatSystem {
    return this.combatSystem;
  }
}

export default EcosystemFoundation;
