import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { blackBodyRadiation, thermalEnergy } from '../laws/LawKernels';

export class ThermodynamicsSystem {

  update(ecsWorld: World<Entity>, delta: number): void {
    const thermalEntities = ecsWorld.with('temperature', 'mass');

    for (const entity of thermalEntities) {
      if (!entity.temperature || !entity.mass) continue;

      this.updateHeatTransfer(entity, ecsWorld, delta);
      this.updateBlackBodyRadiation(entity, delta);
      this.updatePhaseTransitions(entity);
    }
  }

  private updateHeatTransfer(entity: Entity, ecsWorld: World<Entity>, delta: number): void {
    if (!entity.temperature || !entity.position) return;

    const nearbyEntities = Array.from(ecsWorld.with('temperature', 'position'))
      .filter(e => {
        if (e.entityId === entity.entityId || !e.position || !entity.position) return false;
        const dx = e.position.x - entity.position.x;
        const dy = e.position.y - entity.position.y;
        const dz = e.position.z - entity.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return distance < 10;
      });

    for (const other of nearbyEntities) {
      if (!other.temperature || !other.position || !entity.position) continue;

      const dx = other.position.x - entity.position.x;
      const dy = other.position.y - entity.position.y;
      const dz = other.position.z - entity.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 0.1) continue;

      const tempDiff = other.temperature - entity.temperature;
      const heatTransferCoeff = 1.0 / (distance * distance);
      const heatTransfer = heatTransferCoeff * tempDiff * delta;

      const heatCapacity = this.getHeatCapacity(entity);
      if (heatCapacity > 0) {
        entity.temperature += heatTransfer / heatCapacity;
      }
    }
  }

  private updateBlackBodyRadiation(entity: Entity, delta: number): void {
    if (!entity.temperature || !entity.mass) return;

    const surfaceArea = this.estimateSurfaceArea(entity.mass);
    const radiatedPower = blackBodyRadiation(entity.temperature, surfaceArea);
    const energyLoss = radiatedPower * delta;

    const heatCapacity = this.getHeatCapacity(entity);
    if (heatCapacity > 0) {
      const tempDecrease = energyLoss / heatCapacity;
      entity.temperature = Math.max(2.7, entity.temperature - tempDecrease);
    }
  }

  private updatePhaseTransitions(entity: Entity): void {
    if (!entity.temperature || !entity.elementCounts) return;

    const dominantElement = this.getDominantElement(entity.elementCounts);
    if (!dominantElement) return;

    if (entity.stateOfMatter === 'solid' && entity.temperature > dominantElement.meltingPoint) {
      entity.stateOfMatter = 'liquid';
    } else if (entity.stateOfMatter === 'liquid') {
      if (entity.temperature < dominantElement.meltingPoint) {
        entity.stateOfMatter = 'solid';
      } else if (entity.temperature > dominantElement.boilingPoint) {
        entity.stateOfMatter = 'gas';
      }
    } else if (entity.stateOfMatter === 'gas' && entity.temperature < dominantElement.boilingPoint) {
      entity.stateOfMatter = 'liquid';
    }
  }

  private getHeatCapacity(entity: Entity): number {
    if (!entity.mass || !entity.elementCounts) return 1000;

    let totalHeatCapacity = 0;
    let totalMass = 0;

    for (const [element, count] of Object.entries(entity.elementCounts)) {
      const elemData = this.getElementData(element);
      if (elemData) {
        const mass = elemData.atomicMass * count;
        totalHeatCapacity += elemData.heatCapacity * count;
        totalMass += mass;
      }
    }

    const calculatedThermalEnergy = entity.temperature ? thermalEnergy(entity.temperature) : 0;
    
    return totalHeatCapacity > 0 ? totalHeatCapacity + calculatedThermalEnergy * 0.001 : 1000;
  }

  private estimateSurfaceArea(mass: number): number {
    const density = 1000;
    const volume = mass / density;
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1/3);
    return 4 * Math.PI * radius * radius;
  }

  private getDominantElement(elementCounts: Record<string, number>): any {
    let maxCount = 0;
    let dominantSymbol = '';

    for (const [symbol, count] of Object.entries(elementCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantSymbol = symbol;
      }
    }

    return this.getElementData(dominantSymbol);
  }

  private getElementData(symbol: string): any {
    const { PERIODIC_TABLE } = require('../../../agents/tables/periodic-table');
    return PERIODIC_TABLE[symbol];
  }
}
