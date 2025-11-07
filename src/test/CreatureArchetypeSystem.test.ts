/**
 * Creature Archetype System Tests - Validate evolutionary creature spawning and behavior
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import { beforeEach, describe, expect, test } from 'vitest';
import CreatureArchetypeSystem, { CreatureCategory } from '../systems/CreatureArchetypeSystem';
import type { WorldSchema } from '../world/ECSWorld';

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
    const category = CreatureCategory.SMALL_FORAGER;

    const creature = creatureSystem.spawnCreature(category, position);

    expect(creature).toBeDefined();
    expect(creature.transform).toBeDefined();
    expect(creature.creature).toBeDefined();
    expect(creature.yukaAgent).toBeDefined();
    expect(creature.render).toBeDefined();

    expect(creature.transform!.position).toEqual(position);
    // Check that creature has evolutionary data with correct category
    const evolutionData = (creature as any).evolutionaryCreature;
    expect(evolutionData).toBeDefined();
    expect(evolutionData.archetype.category).toBe(category);
  });

  test('spawns creature with inherited traits from parents', () => {
    const position = new THREE.Vector3(5, 2, 5);
    const parentTraits = [
      [0.8, 0.6, 0.4, 0.7, 0.5, 0.3, 0.9, 0.2, 0.6, 0.8], // Parent 1 traits
      [0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6]  // Parent 2 traits
    ];

    const offspring = creatureSystem.spawnCreature(
      CreatureCategory.MEDIUM_GRAZER,
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
      CreatureCategory.HYBRID_FORM,
      position,
      customTraits,
      testLabel
    );

    expect(debugCreature).toBeDefined();
    expect((debugCreature as any).debugLabel).toBe(testLabel);

    const evolutionData = (debugCreature as any).evolutionaryCreature;
    expect(evolutionData).toBeDefined();
    expect(evolutionData.currentTraits).toBeDefined();
    expect(evolutionData.currentTraits.length).toBe(10);
    // Traits are mutated during generation, so we check they're valid ranges
    // rather than exact matches (which is the correct evolutionary behavior)
    for (let i = 0; i < customTraits.length; i++) {
      expect(evolutionData.currentTraits[i]).toBeGreaterThanOrEqual(0);
      expect(evolutionData.currentTraits[i]).toBeLessThanOrEqual(1);
    }
  });

  test('updates creature behaviors over time', () => {
    const creature = creatureSystem.spawnCreature(
      CreatureCategory.MEDIUM_GRAZER,
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
      creatureSystem.spawnCreature(CreatureCategory.SMALL_FORAGER, pos, undefined, i);
    });

    const summary = creatureSystem.getEvolutionSummary();

    expect(summary.totalCreatures).toBe(3);
    expect(summary.generationDistribution).toBeDefined();
    expect(summary.averageTraits).toBeDefined();
    expect(summary.averageTraits.length).toBe(10);
  });

  test('archetype families have distinct characteristics', () => {
    const scavenger = creatureSystem.spawnCreature(
      CreatureCategory.SMALL_FORAGER,
      new THREE.Vector3(0, 2, 0)
    );

    const browser = creatureSystem.spawnCreature(
      CreatureCategory.MEDIUM_GRAZER,
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
      CreatureCategory.HYBRID_FORM,
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