import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { ConservationLedger } from '../core/ConservationLedger';
import { bondEnergy, arrhenius } from '../laws/LawKernels';

export class ReactionKineticsSystem {
  private conservationLedger: ConservationLedger;

  constructor(conservationLedger: ConservationLedger) {
    this.conservationLedger = conservationLedger;
  }

  update(ecsWorld: World<Entity>, delta: number): void {
    const chemicalEntities = ecsWorld.with('elementCounts', 'temperature', 'scale');

    const reactableEntities = Array.from(chemicalEntities).filter(
      e => e.scale === 'molecular' || e.scale === 'atomic'
    );

    for (let i = 0; i < reactableEntities.length; i++) {
      for (let j = i + 1; j < reactableEntities.length; j++) {
        this.attemptReaction(reactableEntities[i], reactableEntities[j], delta);
      }
    }
  }

  private attemptReaction(entity1: Entity, entity2: Entity, delta: number): void {
    if (!entity1.position || !entity2.position || !entity1.temperature) return;

    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;
    const dz = entity2.position.z - entity1.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > 1.0) return;

    const activationEnergy = 50000;
    const reactionRate = arrhenius(activationEnergy, entity1.temperature);
    const reactionProbability = reactionRate * delta;

    if (Math.random() < reactionProbability) {
      this.executeReaction(entity1, entity2);
    }
  }

  private executeReaction(entity1: Entity, entity2: Entity): void {
    if (!entity1.elementCounts || !entity2.elementCounts) return;

    const combinedElements: Record<string, number> = {};

    for (const [element, count] of Object.entries(entity1.elementCounts)) {
      combinedElements[element] = (combinedElements[element] || 0) + count;
    }

    for (const [element, count] of Object.entries(entity2.elementCounts)) {
      combinedElements[element] = (combinedElements[element] || 0) + count;
    }

    const mass1 = entity1.mass || 0;
    const mass2 = entity2.mass || 0;
    const totalMass = mass1 + mass2;

    const charge1 = entity1.charge || 0;
    const charge2 = entity2.charge || 0;
    const totalCharge = charge1 + charge2;

    const reactantEnergy1 = this.calculateBondEnergy(entity1.elementCounts);
    const reactantEnergy2 = this.calculateBondEnergy(entity2.elementCounts);
    const totalReactantEnergy = reactantEnergy1 + reactantEnergy2;

    const productEnergy = this.calculateBondEnergy(combinedElements);
    const bondEnergyChange = productEnergy - totalReactantEnergy;

    const reactantTotals = {
      mass: mass1 + mass2,
      energy: totalReactantEnergy,
      charge: charge1 + charge2,
      momentum: { x: 0, y: 0, z: 0 },
    };

    const productTotals = {
      mass: totalMass,
      energy: productEnergy,
      charge: totalCharge,
      momentum: { x: 0, y: 0, z: 0 },
    };

    this.conservationLedger.validateReaction(
      [entity1.entityId, entity2.entityId],
      ['product'],
      reactantTotals,
      productTotals,
      `Reaction: ${entity1.entityId} + ${entity2.entityId}`
    );

    console.log(`Reaction: ${entity1.entityId} + ${entity2.entityId} -> product`, {
      elements: combinedElements,
      mass: totalMass,
      charge: totalCharge,
      bondEnergyChange,
    });
  }

  private calculateBondEnergy(elements: Record<string, number>): number {
    let totalEnergy = 0;

    const elementSymbols = Object.keys(elements);
    for (let i = 0; i < elementSymbols.length; i++) {
      for (let j = i + 1; j < elementSymbols.length; j++) {
        const energy = bondEnergy(elementSymbols[i], elementSymbols[j]);
        totalEnergy += energy;
      }
    }

    return totalEnergy;
  }
}
