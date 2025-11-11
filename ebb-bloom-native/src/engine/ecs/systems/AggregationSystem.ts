import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { ConservationLedger, ConservedQuantities } from '../core/ConservationLedger';
import { generateEntityId } from '../core/UUID';

export class AggregationSystem {
  private conservationLedger: ConservationLedger;
  private timeSinceLastAggregation = 0;
  private readonly AGGREGATION_THRESHOLD = 1.0;

  constructor(conservationLedger: ConservationLedger) {
    this.conservationLedger = conservationLedger;
  }

  update(ecsWorld: World<Entity>, delta: number): void {
    this.timeSinceLastAggregation += delta;
    
    if (this.timeSinceLastAggregation < this.AGGREGATION_THRESHOLD) {
      return;
    }

    const aggregateCandidates = this.findAggregationCandidates(ecsWorld);

    for (const group of aggregateCandidates) {
      this.attemptAggregation(ecsWorld, group);
    }

    this.timeSinceLastAggregation = 0;
  }

  private findAggregationCandidates(ecsWorld: World<Entity>): Entity[][] {
    const candidates: Entity[][] = [];
    
    const molecularEntities = Array.from(ecsWorld.with('scale', 'position')).filter(
      e => e.scale === 'molecular'
    );

    for (let i = 0; i < molecularEntities.length; i++) {
      const group: Entity[] = [molecularEntities[i]];
      
      for (let j = i + 1; j < molecularEntities.length; j++) {
        if (this.areNearby(molecularEntities[i], molecularEntities[j])) {
          group.push(molecularEntities[j]);
        }
      }

      if (group.length >= 2) {
        candidates.push(group);
      }
    }

    return candidates;
  }

  private areNearby(entity1: Entity, entity2: Entity): boolean {
    if (!entity1.position || !entity2.position) return false;

    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;
    const dz = entity2.position.z - entity1.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return distance < 2.0;
  }

  private attemptAggregation(ecsWorld: World<Entity>, entities: Entity[]): void {
    const childrenTotals = this.calculateTotals(entities);

    const aggregateEntity: Entity = {
      entityId: generateEntityId(),
      scale: 'material',
      simulationDetail: 'aggregate',
      aggregateOf: entities.map(e => e.entityId),
      aggregateScale: 'material',
      conservedMass: childrenTotals.mass,
      conservedCharge: childrenTotals.charge,
      conservedEnergy: childrenTotals.energy,
      mass: childrenTotals.mass,
      charge: childrenTotals.charge,
      position: this.calculateCenterOfMass(entities),
      velocity: this.calculateAverageVelocity(entities),
    };

    const aggregateTotals: ConservedQuantities = {
      mass: aggregateEntity.mass!,
      energy: aggregateEntity.conservedEnergy!,
      charge: aggregateEntity.charge!,
      momentum: childrenTotals.momentum,
    };

    const valid = this.conservationLedger.validateAggregation(
      entities.map(e => e.entityId),
      childrenTotals,
      aggregateTotals,
      `Aggregation of ${entities.length} molecules`
    );

    if (valid) {
      ecsWorld.add(aggregateEntity);
      console.log(`Created aggregate ${aggregateEntity.entityId} from ${entities.length} entities`);
    }
  }

  private calculateTotals(entities: Entity[]): ConservedQuantities {
    const totals: ConservedQuantities = {
      mass: 0,
      energy: 0,
      charge: 0,
      momentum: { x: 0, y: 0, z: 0 },
    };

    for (const entity of entities) {
      totals.mass += entity.mass || 0;
      totals.charge += entity.charge || 0;

      if (entity.velocity && entity.mass) {
        const ke = 0.5 * entity.mass * (
          entity.velocity.x ** 2 + entity.velocity.y ** 2 + entity.velocity.z ** 2
        );
        totals.energy += ke;

        totals.momentum.x += entity.mass * entity.velocity.x;
        totals.momentum.y += entity.mass * entity.velocity.y;
        totals.momentum.z += entity.mass * entity.velocity.z;
      }
    }

    return totals;
  }

  private calculateCenterOfMass(entities: Entity[]): { x: number; y: number; z: number } {
    let totalMass = 0;
    const com = { x: 0, y: 0, z: 0 };

    for (const entity of entities) {
      if (entity.position && entity.mass) {
        com.x += entity.position.x * entity.mass;
        com.y += entity.position.y * entity.mass;
        com.z += entity.position.z * entity.mass;
        totalMass += entity.mass;
      }
    }

    if (totalMass > 0) {
      com.x /= totalMass;
      com.y /= totalMass;
      com.z /= totalMass;
    }

    return com;
  }

  private calculateAverageVelocity(entities: Entity[]): { x: number; y: number; z: number } {
    let totalMass = 0;
    const avgVel = { x: 0, y: 0, z: 0 };

    for (const entity of entities) {
      if (entity.velocity && entity.mass) {
        avgVel.x += entity.velocity.x * entity.mass;
        avgVel.y += entity.velocity.y * entity.mass;
        avgVel.z += entity.velocity.z * entity.mass;
        totalMass += entity.mass;
      }
    }

    if (totalMass > 0) {
      avgVel.x /= totalMass;
      avgVel.y /= totalMass;
      avgVel.z /= totalMass;
    }

    return avgVel;
  }
}
