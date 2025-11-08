/**
 * Yuka Sphere Coordinator - The CORE evolutionary engine
 * 
 * Gen 1 = ECS initial state (Eden)
 * Gen 2+ = ALL Yuka sphere decisions in response to environmental pressure
 * 
 * This is THE system that makes "Everything is Squirrels" work
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import type { WorldSchema } from '../world/ECSWorld';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';
import CreatureArchetypeSystem, { CreatureCategory } from './CreatureArchetypeSystem';
import GeneticSynthesisSystem from './GeneticSynthesisSystem';
import RawMaterialsSystem from './RawMaterialsSystem';
import BuildingSystem from './BuildingSystem';
import EnvironmentalPressureSystem from './EnvironmentalPressureSystem';
import PackSocialSystem from './PackSocialSystem';
import PopulationDynamicsSystem from './PopulationDynamicsSystem';

interface EnvironmentalPressure {
  // Environmental reality (immutable physics)
  pollution: number;
  resourceAbundance: number;
  territorialConflict: number;
  
  // Per-trait pressure (0-1, drives evolution)
  traitPressures: number[]; // 10 traits
}

interface SphereDecision {
  type: 'evolve_creature' | 'spawn_offspring' | 'emerge_tool' | 'construct_building' | 'synthesize_material';
  priority: number;
  data: any;
}

class YukaSphereCoordinator {
  private world: World<WorldSchema>;
  
  // All Yuka spheres
  private creatureSystem: CreatureArchetypeSystem;
  private geneticsSystem: GeneticSynthesisSystem;
  private materialsSystem: RawMaterialsSystem;
  private buildingSystem: BuildingSystem;
  private environmentalSystem: EnvironmentalPressureSystem;
  private packSystem: PackSocialSystem;
  private populationSystem: PopulationDynamicsSystem;
  
  // Evolution state
  private lastEvolutionGeneration: number = 0;
  private currentGeneration: number = 0;

  constructor(
    world: World<WorldSchema>,
    creatureSystem: CreatureArchetypeSystem,
    geneticsSystem: GeneticSynthesisSystem,
    materialsSystem: RawMaterialsSystem,
    buildingSystem: BuildingSystem,
    environmentalSystem: EnvironmentalPressureSystem,
    packSystem: PackSocialSystem,
    populationSystem: PopulationDynamicsSystem
  ) {
    this.world = world;
    this.creatureSystem = creatureSystem;
    this.geneticsSystem = geneticsSystem;
    this.materialsSystem = materialsSystem;
    this.buildingSystem = buildingSystem;
    this.environmentalSystem = environmentalSystem;
    this.packSystem = packSystem;
    this.populationSystem = populationSystem;
    
    log.info('YukaSphereCoordinator initialized - EVOLUTIONARY ENGINE ACTIVE');
    
    // Listen to generation changes
    gameClock.onTimeUpdate((time) => {
      if (time.generation > this.currentGeneration && time.generation > 1) {
        this.triggerGenerationEvolution(time.generation);
      }
      this.currentGeneration = time.generation;
    });
  }
  
  /**
   * THE CORE LOOP - Triggered every generation after Gen 1
   */
  private async triggerGenerationEvolution(generation: number): Promise<void> {
    log.info(`=== GENERATION ${generation} EVOLUTION BEGIN ===`);
    
    // Step 1: Calculate environmental pressure
    const pressure = this.calculateEnvironmentalPressure();
    
    // Step 2: Each Yuka sphere makes decisions
    const decisions: SphereDecision[] = [];
    
    // Creature Sphere: Should creatures evolve? Reproduce?
    const creatureDecisions = this.creatureSphereDecisions(pressure, generation);
    decisions.push(...creatureDecisions);
    
    // Material Sphere: Should new materials emerge? Existing ones change?
    const materialDecisions = this.materialSphereDecisions(pressure, generation);
    decisions.push(...materialDecisions);
    
    // Building Sphere: Should structures appear? (based on creature needs)
    const buildingDecisions = this.buildingSphereDecisions(pressure, generation);
    decisions.push(...buildingDecisions);
    
    // Tool Sphere: Should new tool archetypes emerge? (not implemented yet)
    // const toolDecisions = this.toolSphereDecisions(pressure, generation);
    // decisions.push(...toolDecisions);
    
    // Step 3: Apply decisions in priority order
    const sortedDecisions = decisions.sort((a, b) => b.priority - a.priority);
    for (const decision of sortedDecisions) {
      await this.applyDecision(decision, generation);
    }
    
    log.info(`=== GENERATION ${generation} EVOLUTION COMPLETE ===`, {
      decisions: decisions.length,
      pressure
    });
    
    this.lastEvolutionGeneration = generation;
  }
  
  /**
   * Calculate environmental pressure across all traits
   */
  private calculateEnvironmentalPressure(): EnvironmentalPressure {
    const envReport = this.environmentalSystem.getEnvironmentalReport();
    const materialAnalysis = this.materialsSystem.getMaterialAnalysis();
    const popReport = this.populationSystem.getPopulationReport();
    
    // Environmental reality
    const pollution = envReport.globalPollution;
    const resourceAbundance = materialAnalysis.totalMaterials / 100; // Normalize
    const territorialConflict = popReport.populationPressure;
    
    // Calculate pressure for each of 10 traits
    const traitPressures = Array(10).fill(0);
    
    // Trait 0: Mobility - high if territory conflict
    traitPressures[0] = Math.min(1, territorialConflict * 1.5);
    
    // Trait 1: Manipulation - high if resources scattered
    traitPressures[1] = Math.min(1, (1 - resourceAbundance) * 1.2);
    
    // Trait 2: Excavation - high if deep materials needed (would check material depth)
    // Note: generation parameter not available here, use time-based pressure
    traitPressures[2] = Math.min(1, 0.3 + (this.currentGeneration - 1) * 0.1); // Increases with time
    
    // Trait 3: Social - high if pack advantage
    traitPressures[3] = Math.min(1, popReport.populationPressure * 0.8);
    
    // Trait 4: Sensing - high if predation or threats
    traitPressures[4] = Math.min(1, territorialConflict * 0.7);
    
    // Trait 5: Illumination - low priority, aesthetic
    traitPressures[5] = Math.random() * 0.2;
    
    // Trait 6: Storage - high if resources scarce
    traitPressures[6] = Math.min(1, (1 - resourceAbundance) * 1.1);
    
    // Trait 7: Filtration - HIGH if pollution
    traitPressures[7] = Math.min(1, pollution * 2);
    
    // Trait 8: Defense - high if conflict
    traitPressures[8] = Math.min(1, territorialConflict * 1.3);
    
    // Trait 9: Toxicity - moderate if competition
    traitPressures[9] = Math.min(1, popReport.populationPressure * 0.6);
    
    return {
      pollution,
      resourceAbundance,
      territorialConflict,
      traitPressures
    };
  }
  
  /**
   * Creature Sphere: Yuka decides which creatures evolve/reproduce
   */
  private creatureSphereDecisions(pressure: EnvironmentalPressure, generation: number): SphereDecision[] {
    const decisions: SphereDecision[] = [];
    const creatures = this.world.with('creature', 'transform');
    
    // Evolve existing creatures based on pressure
    for (const entity of creatures.entities) {
      const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
      if (!evolutionData) continue;
      
      // Yuka decision: Should this creature evolve?
      const evolutionProbability = this.calculateEvolutionProbability(evolutionData, pressure);
      
      if (Math.random() < evolutionProbability) {
        decisions.push({
          type: 'evolve_creature',
          priority: evolutionProbability * 10,
          data: { entity, pressure: pressure.traitPressures }
        });
      }
    }
    
    // Yuka decision: Should creatures reproduce?
    const reproductionThreshold = 0.3; // Yuka threshold for reproduction
    if (pressure.resourceAbundance > reproductionThreshold && generation > 2) {
      // Select creatures for reproduction
      const creatureList = Array.from(creatures.entities);
      for (let i = 0; i < creatureList.length - 1; i += 2) {
        if (Math.random() < 0.3) { // 30% chance per pair
          decisions.push({
            type: 'spawn_offspring',
            priority: 5,
            data: { parent1: creatureList[i], parent2: creatureList[i + 1], generation }
          });
        }
      }
    }
    
    return decisions;
  }
  
  /**
   * Calculate probability that a creature should evolve
   */
  private calculateEvolutionProbability(creature: EvolutionaryCreature, pressure: EnvironmentalPressure): number {
    let probability = 0;
    
    // Higher pressure → higher evolution probability
    for (let i = 0; i < creature.currentTraits.length; i++) {
      const traitGap = pressure.traitPressures[i] - creature.currentTraits[i];
      if (traitGap > 0.2) { // Significant gap
        probability += traitGap * 0.2;
      }
    }
    
    // Stress increases evolution probability
    probability += creature.stress * 0.3;
    
    // Pollution exposure increases evolution probability
    probability += creature.pollutionExposure * 0.4;
    
    return Math.min(1, probability);
  }
  
  /**
   * Material Sphere: Yuka decides material changes/emergence
   */
  private materialSphereDecisions(pressure: EnvironmentalPressure, generation: number): SphereDecision[] {
    const decisions: SphereDecision[] = [];
    
    // Yuka decision: Should new material deposits emerge?
    // (Based on depletion, creature needs)
    if (pressure.resourceAbundance < 0.4 && generation > 3) {
      decisions.push({
        type: 'synthesize_material',
        priority: (1 - pressure.resourceAbundance) * 8,
        data: { reason: 'resource_depletion' }
      });
    }
    
    return decisions;
  }
  
  /**
   * Building Sphere: Yuka decides structure emergence
   */
  private buildingSphereDecisions(pressure: EnvironmentalPressure, generation: number): SphereDecision[] {
    const decisions: SphereDecision[] = [];
    
    // Yuka decision: Should buildings appear?
    // (Based on creature coordination, population)
    const popReport = this.populationSystem.getPopulationReport();
    
    if (popReport.totalPopulation > 5 && generation > 4 && pressure.traitPressures[3] > 0.5) { // High social trait pressure
      decisions.push({
        type: 'construct_building',
        priority: 4,
        data: { reason: 'social_coordination', generation }
      });
    }
    
    return decisions;
  }
  
  /**
   * Apply a Yuka sphere decision to the ECS world
   */
  private async applyDecision(decision: SphereDecision, generation: number): Promise<void> {
    try {
      switch (decision.type) {
        case 'evolve_creature':
          await this.evolveCreatureDecision(decision.data, generation);
          break;
          
        case 'spawn_offspring':
          await this.spawnOffspringDecision(decision.data, generation);
          break;
          
        case 'synthesize_material':
          await this.synthesizeMaterialDecision(decision.data, generation);
          break;
          
        case 'construct_building':
          await this.constructBuildingDecision(decision.data, generation);
          break;
      }
    } catch (error) {
      log.error('Failed to apply Yuka decision', error, { decision });
    }
  }
  
  private async evolveCreatureDecision(data: any, generation: number): Promise<void> {
    const entity = data.entity;
    const evolutionData = (entity as any).evolutionaryCreature as EvolutionaryCreature;
    
    // Use GeneticSynthesisSystem to evolve
    const result = this.geneticsSystem.evolveCreature(
      evolutionData,
      data.pressure,
      generation
    );
    
    if (result.evolved) {
      log.info('Creature evolved via Yuka decision', {
        newName: result.newName,
        changes: result.changes.length,
        generation
      });
      
      // CRITICAL: Regenerate visual mesh based on new traits
      const newMesh = this.regenerateCreatureMesh(entity, evolutionData);
      if (newMesh && entity.render) {
        // Remove old mesh from scene (renderer will handle cleanup)
        entity.render.mesh = newMesh;
      }
      
      // Record evolution event
      gameClock.recordEvent({
        generation,
        timestamp: Date.now(),
        eventType: 'trait_emergence',
        description: `Creature evolved: ${result.newName || 'Unknown'}`,
        affectedCreatures: [entity.toString()],
        traits: evolutionData.currentTraits,
        significance: 0.7
      });
      
      // CRITICAL: Trigger haptic feedback for significant evolution
      // Note: HapticGestureSystem listens to gameClock evolution events
      // and triggers appropriate haptics automatically via triggerEvolutionHaptic()
    }
  }
  
  private async spawnOffspringDecision(data: any, generation: number): Promise<void> {
    const parent1 = data.parent1;
    const parent2 = data.parent2;
    
    const evolutionData1 = (parent1 as any).evolutionaryCreature as EvolutionaryCreature;
    const evolutionData2 = (parent2 as any).evolutionaryCreature as EvolutionaryCreature;
    
    if (!evolutionData1 || !evolutionData2 || !parent1.transform || !parent2.transform) return;
    
    // Average position between parents
    const spawnPos = new THREE.Vector3()
      .addVectors(parent1.transform.position, parent2.transform.position)
      .multiplyScalar(0.5);
    
    // Combine parent traits
    const parentTraits = [evolutionData1.currentTraits, evolutionData2.currentTraits];
    
    // Spawn offspring using archetype system
    const category = evolutionData1.archetype.category as CreatureCategory;
    this.creatureSystem.spawnCreature(category, spawnPos, parentTraits, generation);
    
    log.info('Offspring spawned via Yuka decision', {
      parents: [evolutionData1.archetype.baseSpecies, evolutionData2.archetype.baseSpecies],
      generation,
      position: spawnPos.toArray()
    });
    
    // Record birth event
    gameClock.recordEvent({
      generation,
      timestamp: Date.now(),
      eventType: 'pack_formation',
      description: 'New offspring born',
      affectedCreatures: [parent1.toString(), parent2.toString()],
      traits: [],
      significance: 0.6
    });
  }
  
  private async synthesizeMaterialDecision(data: any, generation: number): Promise<void> {
    // TODO: Implement material synthesis
    // For now, just spawn some materials
    const dummyHeightData = new Float32Array(256 * 256).fill(20);
    const chunkX = Math.floor(Math.random() * 3) - 1;
    const chunkZ = Math.floor(Math.random() * 3) - 1;
    this.materialsSystem.generateMaterialsForChunk(
      chunkX,
      chunkZ,
      1024,
      dummyHeightData
    );
    
    log.info('Materials synthesized via Yuka decision', { chunkX, chunkZ, generation });
    
    // Record material synthesis event
    gameClock.recordEvent({
      generation,
      timestamp: Date.now(),
      eventType: 'behavior_shift',
      description: `New materials synthesized at chunk (${chunkX}, ${chunkZ})`,
      affectedCreatures: [],
      traits: [],
      significance: 0.5
    });
  }
  
  private async constructBuildingDecision(data: any, generation: number): Promise<void> {
    // TODO: Implement building construction
    // Would spawn buildings based on creature needs
    log.info('Building construction triggered via Yuka decision', { ...data, generation });
    
    // Record building construction event
    gameClock.recordEvent({
      generation,
      timestamp: Date.now(),
      eventType: 'behavior_shift',
      description: `Building construction initiated: ${data.buildingType || 'structure'}`,
      affectedCreatures: data.affectedCreatures || [],
      traits: [],
      significance: 0.6
    });
  }
  
  /**
   * Regenerate creature mesh based on evolved traits
   */
  private regenerateCreatureMesh(entity: any, evolutionData: EvolutionaryCreature): THREE.Group | null {
    try {
      // Use GeneticSynthesisSystem to get morphological changes
      const synthesis = this.geneticsSystem.synthesizeCreatureForm(evolutionData.currentTraits);
      
      // Create new procedural mesh
      const group = new THREE.Group();
      
      // Base body from traits
      const bodySize = 1 + (synthesis.morphology.bodyProportions.height * 0.5);
      const bodyWidth = 1 + (synthesis.morphology.bodyProportions.width * 0.5);
      
      const bodyGeometry = new THREE.SphereGeometry(bodySize, 8, 8);
      bodyGeometry.scale(bodyWidth, 1, 1);
      
      // Color from traits
      const traitColor = this.generateTraitColor(evolutionData.currentTraits);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: traitColor,
        roughness: 0.7 + (synthesis.morphology.textureModifiers.roughness * 0.3),
        metalness: 0.1,
        emissive: traitColor,
        emissiveIntensity: synthesis.morphology.textureModifiers.emissiveness * 0.3
      });
      
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(body);
      
      // Add limbs based on traits
      const limbCount = Math.floor(synthesis.morphology.bodyProportions.limbCount);
      const limbLength = 0.5 + (synthesis.morphology.bodyProportions.limbLength * 0.5);
      
      for (let i = 0; i < limbCount; i++) {
        const angle = (i / limbCount) * Math.PI * 2;
        const limbGeometry = new THREE.CylinderGeometry(0.1, 0.1, limbLength, 4);
        const limb = new THREE.Mesh(limbGeometry, bodyMaterial.clone());
        
        limb.position.set(
          Math.cos(angle) * bodyWidth * 0.7,
          -limbLength * 0.5,
          Math.sin(angle) * bodyWidth * 0.7
        );
        limb.rotation.x = Math.PI / 2;
        group.add(limb);
      }
      
      // Add sensory organs if trait is high
      if (synthesis.morphology.specializations.sensoryOrgans > 0.5) {
        const eyeGeometry = new THREE.SphereGeometry(0.15, 6, 6);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x4444ff, emissiveIntensity: 0.5 });
        
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(bodyWidth * 0.3, bodySize * 0.3, bodySize * 0.8);
        group.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(-bodyWidth * 0.3, bodySize * 0.3, bodySize * 0.8);
        group.add(eye2);
      }
      
      // Add defensive structures if trait is high
      if (synthesis.morphology.specializations.defensiveStructures > 0.6) {
        const spikeCount = Math.floor(synthesis.morphology.specializations.defensiveStructures * 8);
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.4, 4);
        
        for (let i = 0; i < spikeCount; i++) {
          const spike = new THREE.Mesh(spikeGeometry, bodyMaterial.clone());
          const phi = Math.random() * Math.PI;
          const theta = Math.random() * Math.PI * 2;
          
          spike.position.setFromSphericalCoords(bodySize, phi, theta);
          spike.lookAt(0, 0, 0);
          spike.rotateX(Math.PI);
          group.add(spike);
        }
      }
      
      log.info('Regenerated creature mesh from evolved traits', {
        bodySize,
        limbCount,
        sensoryOrgans: synthesis.morphology.specializations.sensoryOrgans,
        defensiveStructures: synthesis.morphology.specializations.defensiveStructures
      });
      
      return group;
      
    } catch (error) {
      log.error('Failed to regenerate creature mesh', error);
      return null;
    }
  }
  
  private generateTraitColor(traits: number[]): THREE.Color {
    // Generate color from traits - trait 0 affects hue
    const hue = traits[0] || 0.5;
    const saturation = 0.6 + (traits[1] || 0.3) * 0.4;
    const lightness = 0.4 + (traits[2] || 0.3) * 0.3;
    
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }
}

export default YukaSphereCoordinator;

