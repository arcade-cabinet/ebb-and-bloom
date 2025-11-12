import type { World } from 'miniplex';
import type { Entity } from '../../components/CoreComponents';
import { metabolicRate, kleiber } from '../../laws/LawKernels';

const KLEIBER_REFERENCE = kleiber(70);

export class MetabolismSystem {
  update(ecsWorld: World<Entity>, delta: number): void {
    const metabolicEntities = ecsWorld.with('metabolism', 'mass', 'energyStores');

    for (const entity of metabolicEntities) {
      if (!entity.metabolism || !entity.mass || entity.energyStores === undefined) continue;

      this.updateEnergyProduction(entity, delta);
      this.payMaintenanceCost(entity, delta);
      this.processWaste(entity, delta);
      this.checkStarvation(entity);
    }
  }

  private updateEnergyProduction(entity: Entity, delta: number): void {
    if (!entity.metabolism || entity.energyStores === undefined) return;

    const energyProduced = entity.metabolism.energyProduction * delta;
    entity.energyStores += energyProduced;
  }

  private payMaintenanceCost(entity: Entity, delta: number): void {
    if (!entity.metabolism || !entity.mass || entity.energyStores === undefined) return;

    const temperature = entity.temperature || 310;
    const basalMetabolicRate = metabolicRate(entity.mass, temperature);
    const maintenanceCost = entity.metabolism.maintenanceCost * delta;
    const totalCost = (basalMetabolicRate + maintenanceCost) * delta;

    entity.energyStores -= totalCost;

    if (entity.energyStores < 0) {
      entity.energyStores = 0;
    }
  }

  private processWaste(entity: Entity, delta: number): void {
    if (!entity.metabolism || entity.wasteStores === undefined) return;

    const wasteProduction = entity.metabolism.maintenanceCost * 0.1 * delta;
    entity.wasteStores = (entity.wasteStores || 0) + wasteProduction;

    const wasteEliminationRate = 0.5;
    const wasteEliminated = entity.wasteStores * wasteEliminationRate * delta;
    entity.wasteStores = Math.max(0, entity.wasteStores - wasteEliminated);
  }

  private checkStarvation(entity: Entity): void {
    if (entity.energyStores === undefined) return;

    if (entity.energyStores <= 0) {
      const kleiber_value = entity.mass ? kleiber(entity.mass) : KLEIBER_REFERENCE;
      console.warn(`Entity ${entity.entityId} is starving (energy: ${entity.energyStores}, kleiber: ${kleiber_value})`);
    }
  }
}
