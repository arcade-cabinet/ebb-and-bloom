/**
 * Creature Archetype System Tests - Validate evolutionary creature spawning and behavior
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { World } from 'miniplex';
import CreatureArchetypeSystem, { ArchetypeFamily } from '../systems/CreatureArchetypeSystem';
import type { WorldSchema } from '../world/ECSWorld';
import * as THREE from 'three';

describe('CreatureArchetypeSystem', () => {
  let world: World<WorldSchema>;
  let creatureSystem: CreatureArchetypeSystem;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    creatureSystem = new CreatureArchetypeSystem(world);
  });
  
  test('initializes with creature archetypes', () => {
    expect(creatureSystem).toBeDefined();
    
    // Should initialize without errors
    expect(() => creatureSystem.getEvolutionSummary()).not.toThrow();
  });
  
  test('spawns creature with correct archetype', () => {
    const position = new THREE.Vector3(10, 2, 10);
    const archetype = ArchetypeFamily.TINY_SCAVENGER;
    
    const creature = creatureSystem.spawnCreature(archetype, position);
    
    expect(creature).toBeDefined();
    expect(creature.transform).toBeDefined();
    expect(creature.creature).toBeDefined();
    expect(creature.yukaAgent).toBeDefined();
    expect(creature.render).toBeDefined();
    
    expect(creature.transform!.position).toEqual(position);
    expect(creature.creature!.species).toBe(archetype);
  });
  
  test('spawns creature with inherited traits from parents', () => {
    const position = new THREE.Vector3(5, 2, 5);
    const parentTraits = [
      [0.8, 0.6, 0.4, 0.7, 0.5, 0.3, 0.9, 0.2, 0.6, 0.8], // Parent 1 traits
      [0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6]  // Parent 2 traits
    ];
    
    const offspring = creatureSystem.spawnCreature(
      ArchetypeFamily.SMALL_BROWSER,
      position,
      parentTraits,
      2 // Generation 2
    );
    
    expect(offspring).toBeDefined();
    
    const evolutionData = (offspring as any).evolutionaryCreature;
    expect(evolutionData).toBeDefined();
    expect(evolutionData.generation).toBe(2);
    expect(evolutionData.parentTraits).toEqual(parentTraits);
    expect(evolutionData.currentTraits).toBeDefined();
    expect(evolutionData.currentTraits.length).toBe(10);
  });
  
  test('creates debug creature with custom traits', () => {
    const position = new THREE.Vector3(-10, 2, -10);
    const customTraits = [0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4, 0.5, 0.8];
    const testLabel = 'high_tool_use_test';
    
    const debugCreature = creatureSystem.requestDebugCreature(
      ArchetypeFamily.TOOL_EXPERIMENTER,
      position,
      customTraits,
      testLabel
    );
    
    expect(debugCreature).toBeDefined();
    expect((debugCreature as any).debugLabel).toBe(testLabel);
    
    const evolutionData = (debugCreature as any).evolutionaryCreature;
    expect(evolutionData.currentTraits).toEqual(expect.arrayContaining(customTraits));
  });
  
  test('updates creature behaviors over time', () => {
    const creature = creatureSystem.spawnCreature(
      ArchetypeFamily.MEDIUM_FORAGER,
      new THREE.Vector3(0, 2, 0)
    );
    
    // Update system
    expect(() => creatureSystem.update(1.0)).not.toThrow();
    
    // Creature should still exist and be valid
    expect(creature.creature).toBeDefined();
    expect(creature.yukaAgent).toBeDefined();
  });
  
  test('evolution summary provides meaningful data', () => {
    // Spawn several creatures
    const positions = [
      new THREE.Vector3(5, 2, 5),
      new THREE.Vector3(-5, 2, -5),
      new THREE.Vector3(10, 2, -10)
    ];
    
    positions.forEach((pos, i) => {
      creatureSystem.spawnCreature(ArchetypeFamily.TINY_SCAVENGER, pos, undefined, i);
    });
    
    const summary = creatureSystem.getEvolutionSummary();
    
    expect(summary.totalCreatures).toBe(3);
    expect(summary.generationDistribution).toBeDefined();
    expect(summary.averageTraits).toBeDefined();
    expect(summary.averageTraits.length).toBe(10);
  });
  
  test('archetype families have distinct characteristics', () => {
    const scavenger = creatureSystem.spawnCreature(
      ArchetypeFamily.TINY_SCAVENGER,
      new THREE.Vector3(0, 2, 0)
    );
    
    const browser = creatureSystem.spawnCreature(
      ArchetypeFamily.SMALL_BROWSER, 
      new THREE.Vector3(10, 2, 0)
    );
    
    const scavengerData = (scavenger as any).evolutionaryCreature;
    const browserData = (browser as any).evolutionaryCreature;
    
    // Different archetypes should have different characteristics
    expect(scavengerData.archetype.category).not.toBe(browserData.archetype.category);
    expect(scavengerData.archetype.behaviorPattern).toBeDefined();
    expect(browserData.archetype.behaviorPattern).toBeDefined();
  });
  
  test('creatures have valid Yuka vehicle integration', () => {
    const creature = creatureSystem.spawnCreature(
      ArchetypeFamily.AERIAL_DRIFTER,
      new THREE.Vector3(20, 5, 20)
    );
    
    expect(creature.yukaAgent).toBeDefined();
    expect(creature.yukaAgent!.vehicle).toBeDefined();
    expect(creature.yukaAgent!.behaviorType).toBeDefined();
    expect(creature.yukaAgent!.territory).toBeGreaterThan(0);
    
    // Yuka vehicle should have behaviors
    const vehicle = creature.yukaAgent!.vehicle;
    expect(vehicle.steering).toBeDefined();
    expect(vehicle.maxSpeed).toBeGreaterThan(0);
  });
});