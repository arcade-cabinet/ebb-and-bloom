import type { World } from 'miniplex';
import type { Entity } from '../../../components/CoreComponents';
import { PHYSICS_CONSTANTS } from '../../../../agents/tables/physics-constants';

export class CosmicEnvironmentSystem {
  private readonly COSMIC_BACKGROUND_TEMP = 2.725;
  private readonly SOLAR_CONSTANT = 1361;

  update(ecsWorld: World<Entity>, delta: number): void {
    const allEntities = ecsWorld.with('position', 'temperature');

    for (const entity of allEntities) {
      this.applyCosmicBackground(entity, delta);
      this.applySolarRadiation(entity, delta);
      this.applyGravitationalInfluence(entity, ecsWorld, delta);
    }
  }

  private applyCosmicBackground(entity: Entity, delta: number): void {
    if (!entity.temperature) return;

    const coolingRate = PHYSICS_CONSTANTS.σ * Math.pow(entity.temperature - this.COSMIC_BACKGROUND_TEMP, 4);
    
    const temperatureChange = -coolingRate * 0.0001 * delta;
    entity.temperature = Math.max(this.COSMIC_BACKGROUND_TEMP, entity.temperature + temperatureChange);
  }

  private applySolarRadiation(entity: Entity, delta: number): void {
    if (!entity.position || !entity.temperature || entity.mass === undefined) return;

    const distanceFromOrigin = Math.sqrt(
      entity.position.x ** 2 + entity.position.y ** 2 + entity.position.z ** 2
    );

    if (distanceFromOrigin < 1e-10) return;

    const solarRadiation = this.SOLAR_CONSTANT / (distanceFromOrigin ** 2);
    const surfaceArea = this.estimateSurfaceArea(entity.mass);
    const energyAbsorbed = solarRadiation * surfaceArea * 0.01 * delta;

    const heatCapacity = 1000;
    const temperatureIncrease = energyAbsorbed / heatCapacity;

    entity.temperature += temperatureIncrease;
  }

  private applyGravitationalInfluence(entity: Entity, ecsWorld: World<Entity>, delta: number): void {
    if (!entity.position || entity.mass === undefined || !entity.velocity) return;

    const massiveEntities = Array.from(ecsWorld.with('mass', 'position')).filter(
      e => e.entityId !== entity.entityId && e.mass !== undefined && e.mass > entity.mass! * 10
    );

    for (const massive of massiveEntities) {
      if (!massive.position || !massive.mass) continue;

      const dx = massive.position.x - entity.position.x;
      const dy = massive.position.y - entity.position.y;
      const dz = massive.position.z - entity.position.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      const distance = Math.sqrt(distanceSquared);

      if (distance < 1e-10) continue;

      const force = (PHYSICS_CONSTANTS.G * entity.mass! * massive.mass) / distanceSquared;
      const acceleration = force / entity.mass!;

      entity.velocity.x += (dx / distance) * acceleration * 0.001 * delta;
      entity.velocity.y += (dy / distance) * acceleration * 0.001 * delta;
      entity.velocity.z += (dz / distance) * acceleration * 0.001 * delta;
    }
  }

  private estimateSurfaceArea(mass: number): number {
    const density = 1000;
    const volume = mass / density;
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1/3);
    return 4 * Math.PI * radius * radius;
  }
}
