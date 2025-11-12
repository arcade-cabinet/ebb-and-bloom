import type { World } from 'miniplex';
import type { Entity } from '../../components/CoreComponents';
import { ConservationLedger } from '../../core/ConservationLedger';

export class ConservationValidationSystem {
  private conservationLedger: ConservationLedger;
  private lastTotals = { mass: 0, energy: 0, charge: 0 };
  private validationInterval = 1.0;
  private timeSinceLastValidation = 0;

  constructor(conservationLedger: ConservationLedger) {
    this.conservationLedger = conservationLedger;
  }

  update(ecsWorld: World<Entity>, delta: number): void {
    this.timeSinceLastValidation += delta;

    if (this.timeSinceLastValidation >= this.validationInterval) {
      this.validateConservation(ecsWorld);
      this.timeSinceLastValidation = 0;
    }
  }

  private validateConservation(ecsWorld: World<Entity>): void {
    const currentTotals = this.calculateSystemTotals(ecsWorld);

    const ledgerTotals = this.conservationLedger.getTotals();

    const massDrift = Math.abs(currentTotals.mass - ledgerTotals.mass);
    const energyDrift = Math.abs(currentTotals.energy - ledgerTotals.energy);
    const chargeDrift = Math.abs(currentTotals.charge - ledgerTotals.charge);

    if (massDrift > 1e-6) {
      console.warn(`Mass conservation drift detected: ${massDrift.toExponential(2)} kg`);
    }

    if (energyDrift > ledgerTotals.energy * 0.05) {
      console.warn(`Energy conservation drift detected: ${(energyDrift / ledgerTotals.energy * 100).toFixed(2)}%`);
    }

    if (chargeDrift > 1e-10) {
      console.warn(`Charge conservation drift detected: ${chargeDrift.toExponential(2)} C`);
    }

    this.lastTotals = currentTotals;
  }

  private calculateSystemTotals(ecsWorld: World<Entity>): { mass: number; energy: number; charge: number } {
    let totalMass = 0;
    let totalEnergy = 0;
    let totalCharge = 0;

    const allEntities = ecsWorld.with('entityId');

    for (const entity of allEntities) {
      totalMass += entity.mass || 0;
      totalCharge += entity.charge || 0;

      if (entity.velocity && entity.mass) {
        const speed = Math.sqrt(
          entity.velocity.x ** 2 + entity.velocity.y ** 2 + entity.velocity.z ** 2
        );
        totalEnergy += 0.5 * entity.mass * speed ** 2;
      }

      if (entity.energyStores !== undefined) {
        totalEnergy += entity.energyStores;
      }

      if (entity.temperature && entity.mass) {
        const thermalEnergy = 1.5 * 1.380649e-23 * entity.temperature * (entity.mass / 1.66054e-27);
        totalEnergy += thermalEnergy;
      }
    }

    return { mass: totalMass, energy: totalEnergy, charge: totalCharge };
  }

  getStatistics() {
    return {
      ledger: this.conservationLedger.getStatistics(),
      lastMeasured: this.lastTotals,
    };
  }
}
