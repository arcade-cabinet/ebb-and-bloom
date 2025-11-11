/**
 * SHELTER CONSTRUCTION SYSTEM
 * 
 * ECS system that integrates YUKA shelter-building agents with the ECS world.
 * Runs YUKA decision-making for creatures with shelter-building capability.
 * 
 * Flow:
 * 1. Identify creatures with shelter-building capability
 * 2. Create/update YUKA agents for each creature
 * 3. Execute YUKA decision-making (ShelterBuilderGoal)
 * 4. Sync YUKA agent state back to ECS entities
 * 5. Create shelter entities when construction completes
 */

import { EntityManager, Vehicle } from 'yuka';
import type { World } from '../ecs/World';
import type { Entity } from '../ecs/components/CoreComponents';
import {
  ShelterBuilderGoal,
  type ShelterAgent,
  type ShelterType,
} from '../agents/ShelterBuilderGoal';
import { generateEntityId } from '../ecs/core/UUID';

interface ShelterEntity extends Entity {
  shelterType: ShelterType;
  materials: Entity[];
  constructedAt: number;
  durability: number;
}

export class ShelterConstructionSystem {
  private world: World;
  private entityManager: EntityManager;
  private agents: Map<string, ShelterAgentWrapper> = new Map();
  private shelters: Map<string, ShelterEntity> = new Map();
  private timeElapsed: number = 0;

  constructor(world: World) {
    this.world = world;
    this.entityManager = new EntityManager();
  }

  /**
   * Update system - runs YUKA agents for all shelter-building creatures
   */
  update(delta: number): void {
    this.timeElapsed += delta;

    // Find creatures with shelter-building capability
    const builders = this.findShelterBuilders();

    // Create or update agents
    for (const creature of builders) {
      let agent = this.agents.get(creature.entityId);

      if (!agent) {
        agent = this.createAgent(creature);
        this.agents.set(creature.entityId, agent);
      } else {
        this.syncCreatureToAgent(creature, agent);
      }

      // Update YUKA agent (executes goals)
      agent.vehicle.update(delta);

      // Sync agent state back to creature
      this.syncAgentToCreature(agent, creature);

      // Check if shelter construction completed
      if (this.checkConstructionComplete(agent)) {
        this.constructShelter(agent, creature);
      }
    }

    // Update YUKA EntityManager
    this.entityManager.update(delta);

    // Update existing shelters (degradation)
    this.updateShelters(delta);

    // Clean up removed creatures
    this.cleanupRemovedAgents(builders);
  }

  /**
   * Find creatures capable of building shelters
   * Criteria: biological entities with intelligence phenotype
   */
  private findShelterBuilders(): Entity[] {
    const biologicalEntities = Array.from(this.world.biologicalEntities);

    return biologicalEntities.filter(
      entity =>
        entity.phenotype &&
        typeof entity.phenotype === 'object' &&
        'intelligence' in entity.phenotype &&
        entity.position
    );
  }

  /**
   * Create YUKA agent wrapper for creature
   */
  private createAgent(creature: Entity): ShelterAgentWrapper {
    const vehicle = new Vehicle();

    if (creature.position) {
      vehicle.position.set(creature.position.x, creature.position.y, creature.position.z);
    }

    if (creature.velocity) {
      vehicle.velocity.set(creature.velocity.x, creature.velocity.y, creature.velocity.z);
    }

    vehicle.maxSpeed = 5.0;

    // Create shelter agent wrapper
    const shelterAgent: ShelterAgent = {
      position: vehicle.position,
      velocity: vehicle.velocity,
      maxSpeed: vehicle.maxSpeed,
      world: this.world,
      currentShelter: 'none',
      inventory: {
        wood: 0,
        stone: 0,
        mud: 0,
        thatch: 0,
      },
      energy: creature.energyStores || 100,
      maxEnergy: 100,
      brain: vehicle,
    };

    // Set initial goal
    (vehicle as any).currentGoal = new ShelterBuilderGoal(shelterAgent);

    // Register with entity manager
    this.entityManager.add(vehicle);

    return {
      vehicle,
      shelterAgent,
      creatureId: creature.entityId,
    };
  }

  /**
   * Sync creature ECS entity to YUKA agent
   */
  private syncCreatureToAgent(creature: Entity, agent: ShelterAgentWrapper): void {
    if (creature.position) {
      agent.vehicle.position.set(creature.position.x, creature.position.y, creature.position.z);
      agent.shelterAgent.position = agent.vehicle.position;
    }

    if (creature.velocity) {
      agent.vehicle.velocity.set(creature.velocity.x, creature.velocity.y, creature.velocity.z);
      agent.shelterAgent.velocity = agent.vehicle.velocity;
    }

    agent.shelterAgent.energy = creature.energyStores || 100;
  }

  /**
   * Sync YUKA agent back to creature ECS entity
   */
  private syncAgentToCreature(agent: ShelterAgentWrapper, creature: Entity): void {
    if (creature.position) {
      creature.position.x = agent.vehicle.position.x;
      creature.position.y = agent.vehicle.position.y;
      creature.position.z = agent.vehicle.position.z;
    }

    if (creature.velocity) {
      creature.velocity.x = agent.vehicle.velocity.x;
      creature.velocity.y = agent.vehicle.velocity.y;
      creature.velocity.z = agent.vehicle.velocity.z;
    }

    creature.energyStores = agent.shelterAgent.energy;

    // Store shelter info in phenotype
    if (creature.phenotype && typeof creature.phenotype === 'object') {
      (creature.phenotype as any).shelter = agent.shelterAgent.currentShelter;
      (creature.phenotype as any).inventory = agent.shelterAgent.inventory;
    }
  }

  /**
   * Check if agent has completed shelter construction
   */
  private checkConstructionComplete(agent: ShelterAgentWrapper): boolean {
    const goal = (agent.vehicle as any).currentGoal;
    if (goal instanceof ShelterBuilderGoal) {
      return goal.status === 'completed';
    }
    return false;
  }

  /**
   * Construct shelter entity in ECS world
   */
  private constructShelter(agent: ShelterAgentWrapper, creature: Entity): void {
    const shelterType = agent.shelterAgent.currentShelter;

    // Gather material entities used in construction
    const materialEntities = this.createMaterialEntities(agent.shelterAgent.inventory);

    // Create shelter entity
    const shelterId = generateEntityId();
    const shelterEntity: ShelterEntity = {
      entityId: shelterId,
      scale: 'structural',
      shelterType,
      materials: materialEntities,
      constructedAt: this.timeElapsed,
      durability: 1.0,
      position: {
        x: agent.vehicle.position.x,
        y: agent.vehicle.position.y,
        z: agent.vehicle.position.z,
      },
      mass: this.calculateShelterMass(materialEntities),
    };

    this.world.add(shelterEntity);
    this.shelters.set(shelterId, shelterEntity);

    console.log(
      `[ShelterConstructionSystem] Shelter constructed: ${shelterType} by creature ${creature.entityId}`
    );
  }

  /**
   * Create material entities from inventory
   */
  private createMaterialEntities(inventory: Record<string, number>): Entity[] {
    const materials: Entity[] = [];

    // Wood
    if (inventory.wood > 0) {
      materials.push({
        entityId: generateEntityId(),
        scale: 'material',
        mass: inventory.wood,
        elementCounts: {
          C: inventory.wood * 0.45,
          H: inventory.wood * 0.06,
          O: inventory.wood * 0.44,
          N: inventory.wood * 0.01,
        },
      });
    }

    // Stone
    if (inventory.stone > 0) {
      materials.push({
        entityId: generateEntityId(),
        scale: 'material',
        mass: inventory.stone,
        elementCounts: {
          Si: inventory.stone * 0.3,
          O: inventory.stone * 0.4,
          Ca: inventory.stone * 0.2,
          Al: inventory.stone * 0.1,
        },
      });
    }

    // Mud
    if (inventory.mud > 0) {
      materials.push({
        entityId: generateEntityId(),
        scale: 'material',
        mass: inventory.mud,
        elementCounts: {
          Si: inventory.mud * 0.25,
          Al: inventory.mud * 0.15,
          O: inventory.mud * 0.4,
          H: inventory.mud * 0.15,
        },
      });
    }

    // Thatch
    if (inventory.thatch > 0) {
      materials.push({
        entityId: generateEntityId(),
        scale: 'material',
        mass: inventory.thatch,
        elementCounts: {
          C: inventory.thatch * 0.48,
          H: inventory.thatch * 0.05,
          O: inventory.thatch * 0.42,
        },
      });
    }

    return materials;
  }

  /**
   * Calculate total shelter mass from materials
   */
  private calculateShelterMass(materials: Entity[]): number {
    return materials.reduce((total, material) => total + (material.mass || 0), 0);
  }

  /**
   * Update existing shelters (degradation over time)
   */
  private updateShelters(delta: number): void {
    const DEGRADATION_RATE = 0.0001;

    for (const [id, shelter] of this.shelters) {
      shelter.durability -= DEGRADATION_RATE * delta;

      if (shelter.durability <= 0) {
        this.world.remove(shelter);
        this.shelters.delete(id);
        console.log(`[ShelterConstructionSystem] Shelter ${id} collapsed due to degradation`);
      }
    }
  }

  /**
   * Clean up agents for removed creatures
   */
  private cleanupRemovedAgents(activeBuilders: Entity[]): void {
    const activeIds = new Set(activeBuilders.map(c => c.entityId));

    for (const [id, agent] of this.agents) {
      if (!activeIds.has(id)) {
        this.entityManager.remove(agent.vehicle);
        this.agents.delete(id);
      }
    }
  }

  /**
   * Get all constructed shelters
   */
  getShelters(): ShelterEntity[] {
    return Array.from(this.shelters.values());
  }

  /**
   * Get agent for creature (for debugging)
   */
  getAgent(creatureId: string): ShelterAgentWrapper | undefined {
    return this.agents.get(creatureId);
  }
}

interface ShelterAgentWrapper {
  vehicle: Vehicle;
  shelterAgent: ShelterAgent;
  creatureId: string;
}
