/**
 * Ecosystem Integration Tests - Complete system validation
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CreatureArchetypeSystem, { CreatureCategory } from '../systems/CreatureArchetypeSystem';
import EcosystemFoundation from '../systems/EcosystemFoundation';
import { gameClock } from '../systems/GameClock';
import GeneticSynthesisSystem from '../systems/GeneticSynthesisSystem';
import RawMaterialsSystem from '../systems/RawMaterialsSystem';
import TextureSystem from '../systems/TextureSystem';
import type { WorldSchema } from '../world/ECSWorld';

describe('Ecosystem Integration', () => {
  let world: World<WorldSchema>;
  let textureSystem: TextureSystem;
  let ecosystem: EcosystemFoundation;

  beforeEach(async () => {
    world = new World<WorldSchema>();
    textureSystem = new TextureSystem(world);
    ecosystem = new EcosystemFoundation(world, textureSystem);

    // Mock fetch for texture system
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            assets: [
              {
                assetId: 'test_wood_001',
                category: 'wood',
                name: 'Test Wood',
                filePath: '/textures/wood/test_wood_001_color_2K.jpg',
                mapType: 'color'
              }
            ]
          })
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200 } as Response);
    });

    // Initialize texture system and create mock texture entities in ECS
    // This satisfies the production gate in EcosystemFoundation
    try {
      await textureSystem.initialize();
    } catch (error) {
      // If initialization fails, create mock texture entities directly
      world.add({
        resource: {
          materialType: 'wood',
          category: 'wood',
          purity: 0.8,
          influenceRadius: 10,
          affinityMask: 0,
          evolutionPressure: Array(10).fill(0)
        },
        transform: {
          position: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        }
      });
    }
  });

  test('ecosystem initializes complete foundation systems', async () => {
    // Should initialize without errors (texture entities created in beforeEach)
    await ecosystem.initialize();

    // Should create initial population
    const creatures = world.with('creature', 'transform');
    expect(creatures.entities.length).toBeGreaterThan(0);

    // Should create material resources
    const materials = world.with('resource');
    expect(materials.entities.length).toBeGreaterThan(0);

    // Should create terrain chunks
    const terrain = world.with('terrain');
    expect(terrain.entities.length).toBeGreaterThan(0);
  });

  test('evolutionary test scenarios create proper entities', async () => {
    await ecosystem.initialize();

    const testResult = ecosystem.requestEvolutionTest(
      'tool_use_test',
      [0.1, 0.2, 0.8, 0.6, 0.9, 0.3, 0.4, 0.2, 0.5, 0.3],
      CreatureCategory.SMALL_FORAGER,
      new THREE.Vector3(20, 2, 20)
    );

    expect(testResult).toBeDefined();
    expect(testResult.materialBait).toBeDefined();
    expect(testResult.testCreature).toBeDefined();

    // Bait should be DEBUG_BAIT material type
    expect(testResult.materialBait.resource?.materialType).toBe('debug_bait');

    // Test creature should have custom traits
    const evolutionData = (testResult.testCreature as any).evolutionaryCreature;
    expect(evolutionData).toBeDefined();
    expect(evolutionData.currentTraits).toBeDefined();
  });

  test('ecosystem state analysis provides meaningful data', async () => {
    await ecosystem.initialize();
    ecosystem.start();

    const state = ecosystem.getCurrentEcosystemState();

    expect(state.totalCreatures).toBeGreaterThan(0);
    expect(state.materialDistribution).toBeDefined();
    expect(Array.isArray(state.averageTraitValues)).toBe(true);
    expect(state.averageTraitValues.length).toBe(10);
    expect(state.populationPressure).toBeGreaterThanOrEqual(0);
    expect(state.populationPressure).toBeLessThanOrEqual(1);
  });

  test('ecosystem update cycle runs without errors', async () => {
    await ecosystem.initialize();
    ecosystem.start();

    // Should update without throwing
    expect(() => ecosystem.update(1 / 60)).not.toThrow();
    expect(() => ecosystem.update(1 / 60)).not.toThrow();
    expect(() => ecosystem.update(1 / 60)).not.toThrow();
  });

  test('game clock integration works properly', async () => {
    await ecosystem.initialize();
    ecosystem.start();

    const initialGeneration = gameClock.getCurrentTime().generation;

    // Simulate some time passing
    for (let i = 0; i < 5; i++) {
      gameClock.update();
      ecosystem.update(1 / 60);
    }

    const currentTime = gameClock.getCurrentTime();
    expect(currentTime.realTimeMs).toBeGreaterThan(0);
    expect(currentTime.gameTimeMs).toBeGreaterThan(0);
  });

  test('ecosystem can be paused and resumed', async () => {
    await ecosystem.initialize();
    ecosystem.start();

    expect(() => ecosystem.pause()).not.toThrow();
    expect(() => ecosystem.resume()).not.toThrow();
  });
});

describe('System Health Validation', () => {
  test('texture system validates manifest exists', async () => {
    const world = new World<WorldSchema>();
    const textureSystem = new TextureSystem(world);

    // Mock fetch for manifest
    global.fetch = vi.fn((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ assets: [] })
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200 } as Response);
    });

    // Should throw if no textures (production gate)
    await expect(textureSystem.initialize()).rejects.toThrow();
  });

  test('materials system generates valid archetypes', () => {
    const world = new World<WorldSchema>();
    const materialsSystem = new RawMaterialsSystem(world);

    // Should create materials without errors
    const heightData = new Float32Array(256 * 256).fill(25);
    const materials = materialsSystem.generateMaterialsForChunk(0, 0, 1024, heightData);

    expect(materials.length).toBeGreaterThan(0);

    // All materials should have valid components
    for (const material of materials) {
      expect(material.transform).toBeDefined();
      expect(material.resource).toBeDefined();
      expect(material.resource!.purity).toBeGreaterThanOrEqual(0);
      expect(material.resource!.purity).toBeLessThanOrEqual(1);
    }
  });

  test('creature system creates valid archetypes', () => {
    const world = new World<WorldSchema>();
    const creatureSystem = new CreatureArchetypeSystem(world);

    const creature = creatureSystem.spawnCreature(
      CreatureCategory.MEDIUM_GRAZER,
      new THREE.Vector3(0, 2, 0)
    );

    expect(creature).toBeDefined();
    expect(creature.creature).toBeDefined();
    expect(creature.yukaAgent).toBeDefined();
    expect(creature.render).toBeDefined();

    // Evolutionary data should be attached
    const evolutionData = (creature as any).evolutionaryCreature;
    expect(evolutionData).toBeDefined();
    expect(evolutionData.archetype).toBeDefined();
    expect(evolutionData.currentTraits).toBeDefined();
  });

  test('genetic synthesis produces valid results', () => {
    const genetics = new GeneticSynthesisSystem();

    const testTraits = [0.7, 0.4, 0.6, 0.8, 0.9, 0.2, 0.5, 0.3, 0.7, 0.6];
    const synthesis = genetics.synthesizeCreatureForm(testTraits);

    expect(synthesis).toBeDefined();
    expect(synthesis.morphology).toBeDefined();
    expect(synthesis.behavior).toBeDefined();
    expect(synthesis.emergentName).toBeDefined();
    expect(synthesis.compatibility).toBeGreaterThanOrEqual(0);
    expect(synthesis.compatibility).toBeLessThanOrEqual(1);

    // Morphological changes should be bounded
    expect(synthesis.morphology.bodyProportions.height).toBeGreaterThanOrEqual(-1);
    expect(synthesis.morphology.bodyProportions.height).toBeLessThanOrEqual(1);
    expect(synthesis.morphology.bodyProportions.limbCount).toBeGreaterThanOrEqual(0);
  });
});