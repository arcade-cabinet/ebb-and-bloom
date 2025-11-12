import type { World } from 'miniplex';
import type { Entity } from '../components/CoreComponents';
import { ConservationLedger } from './ConservationLedger';
// Physics Systems
import { CosmicEnvironmentSystem } from '../systems/physics/CosmicEnvironmentSystem';
import { ThermodynamicsSystem } from '../systems/physics/ThermodynamicsSystem';
import { DiffusionSystem } from '../systems/physics/DiffusionSystem';
// import { RapierPhysicsSystem } from '../systems/physics/RapierPhysicsSystem';

// Chemistry Systems
import { ReactionKineticsSystem } from '../systems/chemistry/ReactionKineticsSystem';
import { AggregationSystem } from '../systems/chemistry/AggregationSystem';
import { AtomicChemistrySystem } from '../systems/chemistry/AtomicSystems';

// Biology Systems
import { MetabolismSystem } from '../systems/biology/MetabolismSystem';
import { EvolutionSelectionSystem } from '../systems/biology/EvolutionSelectionSystem';

// Ecology Systems
import { OdexEcologySystem } from '../systems/ecology/OdexEcologySystem';

// Social Systems
import { CulturalTransmissionSystem } from '../systems/social/CulturalTransmissionSystem';

// Meta Systems
import { ConservationValidationSystem } from '../systems/ConservationValidationSystem';

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
      new DiffusionSystem(),
      // this.rapierPhysicsSystem,
      new ReactionKineticsSystem(this.conservationLedger),
      new AggregationSystem(this.conservationLedger),
      new AtomicChemistrySystem(),
      new MetabolismSystem(),
      new EvolutionSelectionSystem(),
      new OdexEcologySystem(),
      new CulturalTransmissionSystem(),
      new ConservationValidationSystem(this.conservationLedger),
    ];
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.rapierPhysicsSystem.initialize();
    this.initialized = true;
  }

  tick(world: World<Entity>, delta: number): void {
    if (!this.initialized) {
      console.warn('LawOrchestrator not initialized. Call initialize() first.');
      return;
    }

    for (const system of this.systems) {
      try {
        system.update(world, delta);
      } catch (error) {
        console.error(`Error in system ${system.constructor.name}:`, error);
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
