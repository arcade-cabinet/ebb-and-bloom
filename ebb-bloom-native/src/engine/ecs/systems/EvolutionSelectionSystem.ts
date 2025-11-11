import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { generateEntityId } from '../core/UUID';

export class EvolutionSelectionSystem {
  private mutationRate = 1e-8;
  private generationTime = 0;

  update(ecsWorld: World<Entity>, delta: number): void {
    this.generationTime += delta;
    const biologicalEntities = Array.from(ecsWorld.with('genome', 'phenotype', 'energyStores'));

    for (const entity of biologicalEntities) {
      this.evaluateFitness(entity);
      this.attemptReproduction(entity, ecsWorld, delta);
      this.applySelection(entity, ecsWorld);
    }
  }

  private evaluateFitness(entity: Entity): void {
    if (!entity.phenotype || entity.energyStores === undefined) return;

    let fitness = 1.0;

    if (entity.energyStores > 100) {
      fitness *= 1.5;
    } else if (entity.energyStores < 10) {
      fitness *= 0.5;
    }

    if (entity.mass) {
      const optimalMass = 100;
      const massFitness = 1.0 - Math.abs(entity.mass - optimalMass) / optimalMass;
      fitness *= Math.max(0.1, massFitness);
    }

    entity.phenotype.fitness = fitness;
  }

  private attemptReproduction(entity: Entity, ecsWorld: World<Entity>, delta: number): void {
    if (!entity.genome || !entity.phenotype || entity.energyStores === undefined) return;

    const fitness = entity.phenotype.fitness || 0;
    const energyThreshold = 200;
    const reproductionProbability = fitness * 0.01 * delta;

    if (entity.energyStores > energyThreshold && Math.random() < reproductionProbability) {
      this.reproduce(entity, ecsWorld);
    }
  }

  private reproduce(parent: Entity, ecsWorld: World<Entity>): void {
    if (!parent.genome || !parent.phenotype || !parent.position) return;

    const offspringGenome = this.mutateGenome(parent.genome);

    const offspring: Entity = {
      entityId: generateEntityId(),
      scale: 'organismal',
      genome: offspringGenome,
      phenotype: { ...parent.phenotype },
      lineageId: parent.lineageId || parent.entityId,
      generation: (parent.generation || 0) + 1,
      parentId: parent.entityId,
      mass: (parent.mass || 0) * 0.8,
      energyStores: 50,
      position: {
        x: parent.position.x + (Math.random() - 0.5) * 2,
        y: parent.position.y + (Math.random() - 0.5) * 2,
        z: parent.position.z + (Math.random() - 0.5) * 2,
      },
      velocity: { x: 0, y: 0, z: 0 },
    };

    if (parent.metabolism) {
      offspring.metabolism = { ...parent.metabolism };
    }

    ecsWorld.add(offspring);

    if (parent.energyStores !== undefined) {
      parent.energyStores -= 100;
    }

    console.log(`Entity ${parent.entityId} reproduced, offspring: ${offspring.entityId} (gen ${offspring.generation})`);
  }

  private mutateGenome(genome: string): string {
    const chars = genome.split('');
    
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < this.mutationRate) {
        const nucleotides = ['A', 'T', 'G', 'C'];
        chars[i] = nucleotides[Math.floor(Math.random() * nucleotides.length)];
      }
    }

    return chars.join('');
  }

  private applySelection(entity: Entity, ecsWorld: World<Entity>): void {
    if (entity.energyStores !== undefined && entity.energyStores <= 0) {
      console.log(`Entity ${entity.entityId} died from starvation`);
      ecsWorld.remove(entity);
    }

    if (entity.phenotype?.fitness !== undefined && entity.phenotype.fitness < 0.1) {
      if (Math.random() < 0.01) {
        console.log(`Entity ${entity.entityId} died from low fitness`);
        ecsWorld.remove(entity);
      }
    }
  }
}
