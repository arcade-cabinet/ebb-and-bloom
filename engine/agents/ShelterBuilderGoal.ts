/**
 * SHELTER BUILDER GOAL
 * 
 * YUKA-based autonomous shelter construction decision system.
 * Evaluates environment and materials to make emergent shelter-building decisions.
 * 
 * Decision chain:
 * 1. Scan ECS for available materials (wood, stone, mud)
 * 2. Evaluate environmental threats (temperature, predators, weather)
 * 3. Decide what to gather based on shelter requirements
 * 4. Construct appropriate shelter type from gathered materials
 * 5. Upgrade shelter when materials + environmental pressure sufficient
 */

import { Goal, CompositeGoal, GoalEvaluator, Vector3 } from 'yuka';
import type { World } from '../ecs/World';
import type { Entity } from '../ecs/components/CoreComponents';

export type ShelterType = 'none' | 'pit' | 'windbreak' | 'hut' | 'shelter' | 'longhouse';

export interface ShelterAgent {
  position: Vector3;
  velocity: Vector3;
  maxSpeed: number;
  world: World;
  currentShelter: ShelterType;
  inventory: {
    wood: number;
    stone: number;
    mud: number;
    thatch: number;
  };
  energy: number;
  maxEnergy: number;
  brain?: any;
}

/**
 * SHELTER NEED EVALUATOR
 * 
 * Determines urgency of shelter construction based on:
 * - Temperature extremes (hot/cold stress)
 * - Predator presence (safety need)
 * - Weather conditions (rain, wind)
 * - Current shelter quality
 */
export class ShelterNeedEvaluator extends GoalEvaluator {
  calculateDesirability(agent: ShelterAgent): number {
    const world = agent.world;
    if (!world) return 0;

    // Query environment for threats
    const nearbyEntities = world.queryRadius(agent.position, 50);
    
    // Temperature stress
    const tempStress = this.calculateTemperatureStress(nearbyEntities);
    
    // Predator threat
    const predatorThreat = this.calculatePredatorThreat(nearbyEntities);
    
    // Shelter quality (lower = more need)
    const shelterQuality = this.getShelterQuality(agent.currentShelter);
    
    // Combined desirability (0-1)
    const urgency = (tempStress * 0.4 + predatorThreat * 0.4 + (1 - shelterQuality) * 0.2);
    
    return Math.min(1, urgency);
  }

  setGoal(agent: ShelterAgent): void {
    const currentGoal = agent.brain?.currentSubgoal();
    if (!(currentGoal instanceof ShelterBuilderGoal)) {
      agent.brain?.clearSubgoals();
      agent.brain?.addSubgoal(new ShelterBuilderGoal(agent));
    }
  }

  private calculateTemperatureStress(entities: Entity[]): number {
    const temperatures = entities
      .filter(e => e.temperature !== undefined)
      .map(e => e.temperature!);
    
    if (temperatures.length === 0) return 0.3;
    
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    
    // Stress increases at extremes (optimal ~20C)
    const tempDiff = Math.abs(avgTemp - 293);
    return Math.min(1, tempDiff / 50);
  }

  private calculatePredatorThreat(entities: Entity[]): number {
    const predators = entities.filter(e => 
      e.phenotype && 
      typeof e.phenotype === 'object' && 
      'predatory' in e.phenotype &&
      e.phenotype.predatory
    );
    
    return Math.min(1, predators.length / 5);
  }

  private getShelterQuality(shelterType: ShelterType): number {
    const qualities: Record<ShelterType, number> = {
      none: 0,
      pit: 0.2,
      windbreak: 0.4,
      hut: 0.6,
      shelter: 0.8,
      longhouse: 1.0,
    };
    return qualities[shelterType];
  }
}

/**
 * MATERIAL AVAILABILITY EVALUATOR
 * 
 * Evaluates desirability of gathering specific materials based on:
 * - Distance to material sources
 * - Quantity available
 * - Quality (elementCounts purity)
 * - Shelter requirements
 */
export class MaterialAvailabilityEvaluator extends GoalEvaluator {
  private targetMaterial: 'wood' | 'stone' | 'mud' | 'thatch';

  constructor(targetMaterial: 'wood' | 'stone' | 'mud' | 'thatch') {
    super();
    this.targetMaterial = targetMaterial;
  }

  calculateDesirability(agent: ShelterAgent): number {
    const world = agent.world;
    if (!world) return 0;

    // Current inventory
    const currentAmount = agent.inventory[this.targetMaterial];
    
    // Requirement based on next shelter upgrade
    const requirement = this.getMaterialRequirement(agent.currentShelter, this.targetMaterial);
    
    // If already have enough, low desirability
    if (currentAmount >= requirement) return 0.1;
    
    // Find nearest material source
    const nearbyMaterials = this.findNearbyMaterials(agent, world);
    if (nearbyMaterials.length === 0) return 0;
    
    const nearest = nearbyMaterials[0];
    const distance = agent.position.distanceTo(nearest.position);
    const quality = nearest.quality;
    
    // Desirability: high quality, close distance, high need
    const distanceFactor = Math.max(0, 1 - distance / 100);
    const needFactor = (requirement - currentAmount) / requirement;
    
    return distanceFactor * 0.4 + quality * 0.3 + needFactor * 0.3;
  }

  setGoal(agent: ShelterAgent): void {
    agent.brain?.clearSubgoals();
    agent.brain?.addSubgoal(new GatherMaterialGoal(agent, this.targetMaterial));
  }

  private findNearbyMaterials(
    agent: ShelterAgent,
    world: World
  ): Array<{ position: Vector3; quality: number; entity: Entity }> {
    const nearby = world.queryRadius(agent.position, 100);
    const materials: Array<{ position: Vector3; quality: number; entity: Entity }> = [];

    for (const entity of nearby) {
      if (!entity.elementCounts || !entity.position) continue;

      const quality = this.assessMaterialQuality(entity, this.targetMaterial);
      if (quality > 0) {
        materials.push({
          position: new Vector3(entity.position.x, entity.position.y, entity.position.z),
          quality,
          entity,
        });
      }
    }

    // Sort by distance
    materials.sort((a, b) => {
      const distA = agent.position.distanceTo(a.position);
      const distB = agent.position.distanceTo(b.position);
      return distA - distB;
    });

    return materials;
  }

  private assessMaterialQuality(entity: Entity, materialType: string): number {
    if (!entity.elementCounts) return 0;

    const elements = entity.elementCounts;
    const totalMass = entity.mass || 1;

    switch (materialType) {
      case 'wood': {
        const cRatio = (elements['C'] || 0) / totalMass;
        const hRatio = (elements['H'] || 0) / totalMass;
        const oRatio = (elements['O'] || 0) / totalMass;
        if (cRatio > 0.3 && hRatio > 0.05 && oRatio > 0.3) {
          return (cRatio + hRatio * 5 + oRatio) / 3;
        }
        return 0;
      }
      case 'stone': {
        const siRatio = (elements['Si'] || 0) / totalMass;
        const caRatio = (elements['Ca'] || 0) / totalMass;
        const alRatio = (elements['Al'] || 0) / totalMass;
        if (siRatio > 0.2 || caRatio > 0.2 || alRatio > 0.1) {
          return (siRatio + caRatio + alRatio * 2) / 3;
        }
        return 0;
      }
      case 'mud': {
        const siRatio = (elements['Si'] || 0) / totalMass;
        const alRatio = (elements['Al'] || 0) / totalMass;
        const hRatio = (elements['H'] || 0) / totalMass;
        if (siRatio > 0.1 && alRatio > 0.05 && hRatio > 0.1) {
          return (siRatio + alRatio * 2 + hRatio) / 3;
        }
        return 0;
      }
      case 'thatch': {
        const cRatio = (elements['C'] || 0) / totalMass;
        const oRatio = (elements['O'] || 0) / totalMass;
        if (cRatio > 0.4 && oRatio > 0.2) {
          return (cRatio + oRatio) / 2;
        }
        return 0;
      }
      default:
        return 0;
    }
  }

  private getMaterialRequirement(
    currentShelter: ShelterType,
    material: 'wood' | 'stone' | 'mud' | 'thatch'
  ): number {
    const requirements: Record<ShelterType, Record<string, number>> = {
      none: { wood: 10, stone: 0, mud: 0, thatch: 0 },
      pit: { wood: 20, stone: 5, mud: 10, thatch: 0 },
      windbreak: { wood: 40, stone: 10, mud: 15, thatch: 20 },
      hut: { wood: 60, stone: 20, mud: 30, thatch: 30 },
      shelter: { wood: 80, stone: 40, mud: 40, thatch: 20 },
      longhouse: { wood: 100, stone: 50, mud: 50, thatch: 40 },
    };

    return requirements[currentShelter][material] || 0;
  }
}

/**
 * GATHER MATERIAL GOAL
 * 
 * Move to and collect specific material from environment
 */
export class GatherMaterialGoal extends Goal {
  owner: ShelterAgent;
  materialType: 'wood' | 'stone' | 'mud' | 'thatch';
  targetEntity: Entity | null = null;

  constructor(owner: ShelterAgent, materialType: 'wood' | 'stone' | 'mud' | 'thatch') {
    super(owner);
    this.owner = owner;
    this.materialType = materialType;
  }

  activate(): void {
    const materials = this.findNearbyMaterials();
    if (materials.length > 0) {
      this.targetEntity = materials[0];
    } else {
      this.status = Goal.STATUS.FAILED;
    }
  }

  execute(): void {
    if (this.status === Goal.STATUS.FAILED) return;

    if (!this.targetEntity || !this.targetEntity.position) {
      this.status = Goal.STATUS.FAILED;
      return;
    }

    const targetPos = new Vector3(
      this.targetEntity.position.x,
      this.targetEntity.position.y,
      this.targetEntity.position.z
    );
    const distance = this.owner.position.distanceTo(targetPos);

    if (distance < 2.0) {
      const amount = Math.min(5, this.targetEntity.mass || 5);
      this.owner.inventory[this.materialType] += amount;
      
      this.owner.world.remove(this.targetEntity);
      this.status = Goal.STATUS.COMPLETED;
    } else {
      const direction = new Vector3().subVectors(targetPos, this.owner.position).normalize();
      this.owner.velocity.add(direction.multiplyScalar(0.1));
    }
  }

  terminate(): void {
    this.targetEntity = null;
  }

  private findNearbyMaterials(): Entity[] {
    const nearby = this.owner.world.queryRadius(this.owner.position, 100);
    const evaluator = new MaterialAvailabilityEvaluator(this.materialType);

    return nearby.filter(entity => {
      if (!entity.elementCounts) return false;
      return (evaluator as any).assessMaterialQuality(entity, this.materialType) > 0;
    });
  }
}

/**
 * SHELTER BUILDER GOAL
 * 
 * Main goal orchestrating shelter construction process:
 * 1. Evaluate current shelter state
 * 2. Determine next shelter upgrade
 * 3. Gather required materials
 * 4. Construct shelter when materials sufficient
 */
export class ShelterBuilderGoal extends CompositeGoal {
  owner: ShelterAgent;
  targetShelterType: ShelterType = 'pit';

  constructor(owner: ShelterAgent) {
    super(owner);
    this.owner = owner;
  }

  activate(): void {
    this.targetShelterType = this.determineNextShelter();
  }

  execute(): void {
    // Process subgoals if any
    if (this.hasSubgoals()) {
      const status = this.executeSubgoals();

      // If subgoals are active, we remain active
      if (status === Goal.STATUS.ACTIVE) {
        this.status = Goal.STATUS.ACTIVE;
        return;
      }

      // If executeSubgoals returns COMPLETED or FAILED, subgoals are done.
      // We keep ourselves active to check logic in next frame.
      this.status = Goal.STATUS.ACTIVE;
      return;
    }

    if (!this.hasSufficientMaterials()) {
      const neededMaterial = this.getNextNeededMaterial();
      if (neededMaterial) {
        // Add subgoal to gather material
        this.addSubgoal(new GatherMaterialGoal(this.owner, neededMaterial));
        this.status = Goal.STATUS.ACTIVE;
      }
    } else {
      this.constructShelter();
      this.status = Goal.STATUS.COMPLETED;
    }
  }

  terminate(): void {
    this.clearSubgoals();
  }

  private determineNextShelter(): ShelterType {
    const progression: ShelterType[] = ['pit', 'windbreak', 'hut', 'shelter', 'longhouse'];
    const currentIndex = progression.indexOf(this.owner.currentShelter);
    return progression[Math.min(currentIndex + 1, progression.length - 1)];
  }

  private hasSufficientMaterials(): boolean {
    const requirements = this.getMaterialRequirements(this.targetShelterType);
    return (
      this.owner.inventory.wood >= requirements.wood &&
      this.owner.inventory.stone >= requirements.stone &&
      this.owner.inventory.mud >= requirements.mud &&
      this.owner.inventory.thatch >= requirements.thatch
    );
  }

  private getNextNeededMaterial(): 'wood' | 'stone' | 'mud' | 'thatch' | null {
    const requirements = this.getMaterialRequirements(this.targetShelterType);
    const materials: Array<'wood' | 'stone' | 'mud' | 'thatch'> = [
      'wood',
      'stone',
      'mud',
      'thatch',
    ];

    for (const material of materials) {
      if (this.owner.inventory[material] < requirements[material]) {
        return material;
      }
    }

    return null;
  }

  private getMaterialRequirements(shelterType: ShelterType): Record<string, number> {
    const requirements: Record<ShelterType, Record<string, number>> = {
      none: { wood: 0, stone: 0, mud: 0, thatch: 0 },
      pit: { wood: 5, stone: 0, mud: 10, thatch: 0 },
      windbreak: { wood: 20, stone: 5, mud: 5, thatch: 0 },
      hut: { wood: 40, stone: 10, mud: 20, thatch: 30 },
      shelter: { wood: 60, stone: 30, mud: 40, thatch: 20 },
      longhouse: { wood: 100, stone: 50, mud: 50, thatch: 40 },
    };

    return requirements[shelterType];
  }

  private constructShelter(): void {
    const requirements = this.getMaterialRequirements(this.targetShelterType);
    
    this.owner.inventory.wood -= requirements.wood;
    this.owner.inventory.stone -= requirements.stone;
    this.owner.inventory.mud -= requirements.mud;
    this.owner.inventory.thatch -= requirements.thatch;
    
    this.owner.currentShelter = this.targetShelterType;
    
    console.log(`Shelter constructed: ${this.targetShelterType} at`, this.owner.position);
  }
}
