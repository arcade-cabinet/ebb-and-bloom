import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';

export class CulturalTransmissionSystem {
  update(ecsWorld: World<Entity>, delta: number): void {
    const culturalEntities = Array.from(ecsWorld.with('culturalMemetics', 'position'));

    for (let i = 0; i < culturalEntities.length; i++) {
      for (let j = i + 1; j < culturalEntities.length; j++) {
        this.transmitCulture(culturalEntities[i], culturalEntities[j], delta);
      }
    }
  }

  private transmitCulture(entity1: Entity, entity2: Entity, delta: number): void {
    if (!entity1.position || !entity2.position) return;
    if (!entity1.culturalMemetics || !entity2.culturalMemetics) return;

    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;
    const dz = entity2.position.z - entity1.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > 5) return;

    const transmissionRate = 0.1 * delta / Math.max(1, distance);

    for (const [meme, strength] of Object.entries(entity1.culturalMemetics)) {
      const currentStrength = entity2.culturalMemetics[meme] || 0;
      const transmission = (strength - currentStrength) * transmissionRate;
      entity2.culturalMemetics[meme] = currentStrength + transmission;
    }

    for (const [meme, strength] of Object.entries(entity2.culturalMemetics)) {
      const currentStrength = entity1.culturalMemetics[meme] || 0;
      const transmission = (strength - currentStrength) * transmissionRate;
      entity1.culturalMemetics[meme] = currentStrength + transmission;
    }
  }
}
