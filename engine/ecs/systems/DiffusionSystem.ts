import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { diffusionCoefficient, ficksDiffusion } from '../laws/LawKernels';

export class DiffusionSystem {
  update(ecsWorld: World<Entity>, delta: number): void {
    const gasEntities = Array.from(ecsWorld.with('stateOfMatter', 'position', 'temperature')).filter(
      e => e.stateOfMatter === 'gas'
    );

    for (let i = 0; i < gasEntities.length; i++) {
      for (let j = i + 1; j < gasEntities.length; j++) {
        this.applyDiffusion(gasEntities[i], gasEntities[j], delta);
      }
    }
  }

  private applyDiffusion(entity1: Entity, entity2: Entity, delta: number): void {
    if (!entity1.position || !entity2.position || !entity1.temperature) return;

    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;
    const dz = entity2.position.z - entity1.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 0.1 || distance > 10) return;

    const temperature = (entity1.temperature + (entity2.temperature || entity1.temperature)) / 2;
    const particleRadius = 1e-10;
    const fluidViscosity = 1e-5;

    const D = diffusionCoefficient(temperature, particleRadius, fluidViscosity);

    const concentration1 = (entity1.mass || 0) / Math.max(1, distance ** 3);
    const concentration2 = (entity2.mass || 0) / Math.max(1, distance ** 3);

    const flux = ficksDiffusion(concentration1, concentration2, distance, D);

    const massTransfer = flux * delta * 0.001;

    if (entity1.velocity && entity2.velocity) {
      const diffusionVelocity = (massTransfer / Math.max(entity1.mass || 1, 1)) * (dx / distance);
      
      entity1.velocity.x += diffusionVelocity * (dx / distance);
      entity1.velocity.y += diffusionVelocity * (dy / distance);
      entity1.velocity.z += diffusionVelocity * (dz / distance);

      entity2.velocity.x -= diffusionVelocity * (dx / distance);
      entity2.velocity.y -= diffusionVelocity * (dy / distance);
      entity2.velocity.z -= diffusionVelocity * (dz / distance);
    }
  }
}
