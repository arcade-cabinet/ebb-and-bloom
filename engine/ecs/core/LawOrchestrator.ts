import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { ConservationLedger } from './ConservationLedger';
import { lawLogger } from '../../logging/logger';
import { CosmicEnvironmentSystem } from '../systems/CosmicEnvironmentSystem';
import { ThermodynamicsSystem } from '../systems/ThermodynamicsSystem';
import { ReactionKineticsSystem } from '../systems/ReactionKineticsSystem';
import { DiffusionSystem } from '../systems/DiffusionSystem';
import { AggregationSystem } from '../systems/AggregationSystem';
import { ConservationValidationSystem } from '../systems/ConservationValidationSystem';
import { RapierPhysicsSystem } from '../systems/RapierPhysicsSystem';
import { MetabolismSystem } from '../systems/MetabolismSystem';
import { EvolutionSelectionSystem } from '../systems/EvolutionSelectionSystem';
import { CulturalTransmissionSystem } from '../systems/CulturalTransmissionSystem';
import { OdexEcologySystem } from '../systems/OdexEcologySystem';

export interface System {
  update(world: World<Entity>, delta: number): void;
}

export class LawOrchestrator {
  private systems: System[] = [];
  private conservationLedger: ConservationLedger;
  private rapierPhysicsSystem: RapierPhysicsSystem;
  private initialized = false;

  constructor() {
    this.conservationLedger = new ConservationLedger();
    this.rapierPhysicsSystem = new RapierPhysicsSystem(this.conservationLedger);
    
    this.systems = [
      new CosmicEnvironmentSystem(),
      new ThermodynamicsSystem(),
      new ReactionKineticsSystem(this.conservationLedger),
      new DiffusionSystem(),
      new AggregationSystem(this.conservationLedger),
      new ConservationValidationSystem(this.conservationLedger),
      this.rapierPhysicsSystem,
      new MetabolismSystem(),
      new EvolutionSelectionSystem(),
      new OdexEcologySystem(),
      new CulturalTransmissionSystem(),
    ];
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    lawLogger.debug({ systemCount: this.systems.length }, 'Initializing LawOrchestrator');
    await this.rapierPhysicsSystem.initialize();
    this.initialized = true;
    lawLogger.info({ 
      systemCount: this.systems.length,
      systems: this.systems.map(s => s.constructor.name),
    }, 'LawOrchestrator initialized');
  }

  tick(world: World<Entity>, delta: number): void {
    if (!this.initialized) {
      lawLogger.warn('LawOrchestrator not initialized');
      return;
    }

    for (const system of this.systems) {
      try {
        system.update(world, delta);
      } catch (error) {
        lawLogger.error({ 
          system: system.constructor.name,
          error: error instanceof Error ? error.message : String(error),
        }, 'System update failed');
      }
    }
  }

  getConservationLedger(): ConservationLedger {
    return this.conservationLedger;
  }

  getStatistics() {
    return {
      systemCount: this.systems.length,
      systems: this.systems.map(s => s.constructor.name),
      conservationStats: this.conservationLedger.getStatistics(),
    };
  }

  destroy(): void {
    this.rapierPhysicsSystem.destroy();
    this.initialized = false;
  }
}
