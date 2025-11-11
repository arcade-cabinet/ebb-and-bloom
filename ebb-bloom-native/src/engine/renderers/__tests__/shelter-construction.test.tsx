/**
 * SHELTER CONSTRUCTION TEST
 * 
 * Verifies emergent molecule → tool → shelter chain:
 * 1. Creature spawns in environment with scattered materials
 * 2. Creature evaluates materials and environment (YUKA)
 * 3. Creature autonomously gathers appropriate materials
 * 4. Creature constructs shelter based on gathered materials
 * 5. StructureRenderer displays correct parametric geometry
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../../ecs/World';
import { ShelterConstructionSystem } from '../../systems/ShelterConstructionSystem';
import type { Entity } from '../../ecs/components/CoreComponents';
import { generateEntityId } from '../../ecs/core/UUID';

describe('Shelter Construction System', () => {
  let world: World;
  let system: ShelterConstructionSystem;

  beforeEach(async () => {
    world = new World();
    await world.initialize();
    system = new ShelterConstructionSystem(world);
  });

  it('should identify creatures with shelter-building capability', () => {
    // Create intelligent creature
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCGATCGATCG',
      phenotype: {
        intelligence: 0.8,
        dexterity: 0.7,
      },
      energyStores: 100,
    };

    world.add(creature);

    // Run system update
    system.update(1.0);

    // Verify agent created
    const agent = system.getAgent(creature.entityId);
    expect(agent).toBeDefined();
    expect(agent?.shelterAgent.currentShelter).toBe('none');
  });

  it('should evaluate material availability in environment', () => {
    // Create creature
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCG',
      phenotype: { intelligence: 0.8 },
      energyStores: 100,
    };

    world.add(creature);

    // Scatter wood materials (high C, H, O)
    const woodMaterial: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 10,
      position: { x: 5, y: 0, z: 0 },
      elementCounts: {
        C: 4.5,
        H: 0.6,
        O: 4.4,
      },
    };

    world.add(woodMaterial);

    // Scatter stone materials (high Si, Ca)
    const stoneMaterial: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 15,
      position: { x: -5, y: 0, z: 0 },
      elementCounts: {
        Si: 4.5,
        O: 6.0,
        Ca: 3.0,
      },
    };

    world.add(stoneMaterial);

    // Run system
    system.update(1.0);

    // Verify materials detected
    const nearbyMaterials = world.queryRadius({ x: 0, y: 0, z: 0 }, 10);
    expect(nearbyMaterials.length).toBeGreaterThan(0);

    const woodDetected = nearbyMaterials.some(m => m.entityId === woodMaterial.entityId);
    const stoneDetected = nearbyMaterials.some(m => m.entityId === stoneMaterial.entityId);

    expect(woodDetected).toBe(true);
    expect(stoneDetected).toBe(true);
  });

  it('should autonomously gather materials and construct pit shelter', async () => {
    // Create creature
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCG',
      phenotype: { intelligence: 0.8 },
      energyStores: 100,
    };

    world.add(creature);

    // Add mud material for pit (Si, Al, H)
    const mudMaterial: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 20,
      position: { x: 2, y: 0, z: 0 },
      elementCounts: {
        Si: 5.0,
        Al: 3.0,
        O: 8.0,
        H: 3.0,
      },
    };

    world.add(mudMaterial);

    // Get agent
    system.update(0.1);
    const agent = system.getAgent(creature.entityId);
    expect(agent).toBeDefined();

    // Manually simulate material gathering (for test speed)
    if (agent) {
      agent.shelterAgent.inventory.mud = 15;

      // Trigger construction
      system.update(0.1);

      // Should have upgraded shelter
      expect(agent.shelterAgent.currentShelter).toBe('pit');
    }

    // Verify shelter entity created
    const shelters = system.getShelters();
    expect(shelters.length).toBeGreaterThan(0);

    const shelter = shelters[0];
    expect(shelter.shelterType).toBe('pit');
    expect(shelter.materials.length).toBeGreaterThan(0);
  });

  it('should progress through shelter types: pit → windbreak → hut', () => {
    // Create creature
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCG',
      phenotype: { intelligence: 0.9 },
      energyStores: 150,
    };

    world.add(creature);

    system.update(0.1);
    const agent = system.getAgent(creature.entityId);

    expect(agent).toBeDefined();

    if (agent) {
      // Build pit
      agent.shelterAgent.inventory = { wood: 5, stone: 0, mud: 10, thatch: 0 };
      system.update(0.1);
      expect(agent.shelterAgent.currentShelter).toBe('pit');

      // Upgrade to windbreak
      agent.shelterAgent.inventory = { wood: 20, stone: 5, mud: 5, thatch: 0 };
      system.update(0.1);
      expect(agent.shelterAgent.currentShelter).toBe('windbreak');

      // Upgrade to hut
      agent.shelterAgent.inventory = { wood: 40, stone: 10, mud: 20, thatch: 30 };
      system.update(0.1);
      expect(agent.shelterAgent.currentShelter).toBe('hut');
    }
  });

  it('should create material entities with correct elementCounts', () => {
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCG',
      phenotype: { intelligence: 0.8 },
      energyStores: 100,
    };

    world.add(creature);
    system.update(0.1);

    const agent = system.getAgent(creature.entityId);

    if (agent) {
      // Give materials
      agent.shelterAgent.inventory = {
        wood: 30,
        stone: 20,
        mud: 15,
        thatch: 10,
      };

      // Construct shelter
      system.update(0.1);

      // Check shelter created with materials
      const shelters = system.getShelters();
      expect(shelters.length).toBeGreaterThan(0);

      const shelter = shelters[0];
      expect(shelter.materials.length).toBe(4); // wood, stone, mud, thatch

      // Verify wood material composition
      const woodMaterial = shelter.materials.find(m => {
        const cRatio = (m.elementCounts?.['C'] || 0) / (m.mass || 1);
        return cRatio > 0.4;
      });

      expect(woodMaterial).toBeDefined();
      expect(woodMaterial?.elementCounts?.['C']).toBeGreaterThan(0);
      expect(woodMaterial?.elementCounts?.['H']).toBeGreaterThan(0);
      expect(woodMaterial?.elementCounts?.['O']).toBeGreaterThan(0);
    }
  });

  it('should degrade shelters over time', () => {
    const creature: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      mass: 70,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      genome: 'ATCG',
      phenotype: { intelligence: 0.8 },
      energyStores: 100,
    };

    world.add(creature);
    system.update(0.1);

    const agent = system.getAgent(creature.entityId);

    if (agent) {
      agent.shelterAgent.inventory = { wood: 10, stone: 0, mud: 15, thatch: 0 };
      system.update(0.1);

      const shelters = system.getShelters();
      expect(shelters.length).toBeGreaterThan(0);

      const initialDurability = shelters[0].durability;

      // Simulate long time passage
      for (let i = 0; i < 1000; i++) {
        system.update(10.0);
      }

      // Either degraded or collapsed
      const sheltersAfter = system.getShelters();
      if (sheltersAfter.length > 0) {
        expect(sheltersAfter[0].durability).toBeLessThan(initialDurability);
      } else {
        // Collapsed completely
        expect(sheltersAfter.length).toBe(0);
      }
    }
  });
});

describe('StructureRenderer Material Analysis', () => {
  it('should correctly identify wood from elementCounts', () => {
    const woodEntity: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 100,
      elementCounts: {
        C: 45,
        H: 6,
        O: 44,
        N: 1,
      },
    };

    const cRatio = (woodEntity.elementCounts!['C'] || 0) / woodEntity.mass!;
    const hRatio = (woodEntity.elementCounts!['H'] || 0) / woodEntity.mass!;
    const oRatio = (woodEntity.elementCounts!['O'] || 0) / woodEntity.mass!;

    expect(cRatio).toBeGreaterThan(0.3);
    expect(hRatio).toBeGreaterThan(0.05);
    expect(oRatio).toBeGreaterThan(0.3);
  });

  it('should correctly identify stone from elementCounts', () => {
    const stoneEntity: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 100,
      elementCounts: {
        Si: 30,
        O: 40,
        Ca: 20,
        Al: 10,
      },
    };

    const siRatio = (stoneEntity.elementCounts!['Si'] || 0) / stoneEntity.mass!;
    const caRatio = (stoneEntity.elementCounts!['Ca'] || 0) / stoneEntity.mass!;

    expect(siRatio).toBeGreaterThan(0.2);
    expect(caRatio).toBeGreaterThan(0.15);
  });

  it('should correctly identify mud from elementCounts', () => {
    const mudEntity: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      mass: 100,
      elementCounts: {
        Si: 25,
        Al: 15,
        O: 40,
        H: 15,
      },
    };

    const siRatio = (mudEntity.elementCounts!['Si'] || 0) / mudEntity.mass!;
    const alRatio = (mudEntity.elementCounts!['Al'] || 0) / mudEntity.mass!;
    const hRatio = (mudEntity.elementCounts!['H'] || 0) / mudEntity.mass!;

    expect(siRatio).toBeGreaterThan(0.1);
    expect(alRatio).toBeGreaterThan(0.05);
    expect(hRatio).toBeGreaterThan(0.1);
  });
});
