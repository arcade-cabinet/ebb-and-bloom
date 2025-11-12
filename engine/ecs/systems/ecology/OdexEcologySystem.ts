import type { World } from 'miniplex';
import type { Entity } from '../../components/CoreComponents';
import { Solver } from 'odex';

interface PopulationState {
  populations: number[];
  entityIds: string[];
  interactions: InteractionMatrix;
}

interface InteractionMatrix {
  predationRates: number[][];
  competitionRates: number[][];
  cooperationRates: number[][];
}

export class OdexEcologySystem {
  private solver: Solver | null = null;
  private state: PopulationState | null = null;
  private lastUpdateTime = 0;

  constructor() {
    this.initializeSolver();
  }

  private initializeSolver(): void {
    this.solver = new Solver(this.populationDynamics.bind(this), 2);
  }

  update(ecsWorld: World<Entity>, delta: number): void {
    const ecologicalEntities = ecsWorld.with('populationStats', 'scale');
    
    const entities = Array.from(ecologicalEntities).filter(
      e => e.scale === 'population'
    );

    if (entities.length === 0) return;

    if (!this.state || this.state.entityIds.length !== entities.length) {
      this.initializeState(entities);
      if (this.state) {
        this.solver = new Solver(this.populationDynamics.bind(this), this.state.populations.length);
      }
    }

    if (!this.solver || !this.state) return;

    const currentTime = this.lastUpdateTime + delta;
    
    try {
      this.solver.solve(
        this.lastUpdateTime,
        this.state.populations,
        currentTime
      );
    } catch (error) {
      console.warn('ODE solver error:', error);
    }

    this.updateEntityPopulations(entities, this.state.populations);

    this.lastUpdateTime = currentTime;
    this.handleExtinctions(entities);
  }

  private initializeState(entities: Entity[]): void {
    const populations = entities.map(e => e.populationStats?.count || 100);
    const entityIds = entities.map(e => e.entityId);

    const n = entities.length;
    const predationRates = Array(n).fill(0).map(() => Array(n).fill(0));
    const competitionRates = Array(n).fill(0).map(() => Array(n).fill(0));
    const cooperationRates = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          competitionRates[i][j] = 0.0001;
        } else {
          const trophicDiff = (entities[i].trophicLevel || 1) - (entities[j].trophicLevel || 1);
          
          if (trophicDiff === 1) {
            predationRates[i][j] = 0.001;
          }
          
          if (Math.abs(trophicDiff) < 0.5) {
            competitionRates[i][j] = 0.0005;
          }
        }
      }
    }

    this.state = {
      populations,
      entityIds,
      interactions: {
        predationRates,
        competitionRates,
        cooperationRates,
      },
    };
  }

  private populationDynamics(t: number, y: number[]): number[] {
    if (!this.state) return y.map(() => 0);

    if (t % 10 < 0.01) {
      console.log(`Time ${t.toFixed(2)}: populations`, y.map(p => p.toFixed(1)));
    }

    const dydt: number[] = [];
    const n = y.length;

    for (let i = 0; i < n; i++) {
      const population = Math.max(0, y[i]);
      
      const growthRate = 0.1;
      const carryingCapacity = 10000;
      
      let dPdt = growthRate * population * (1 - population / carryingCapacity);

      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const otherPop = Math.max(0, y[j]);
        
        dPdt -= this.state.interactions.predationRates[j][i] * population * otherPop;
        
        dPdt += this.state.interactions.predationRates[i][j] * 0.1 * population * otherPop;
        
        dPdt -= this.state.interactions.competitionRates[i][j] * population * otherPop;
        
        dPdt += this.state.interactions.cooperationRates[i][j] * population * otherPop;
      }

      dydt.push(dPdt);
    }

    return dydt;
  }

  private updateEntityPopulations(entities: Entity[], populations: number[]): void {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.populationStats) {
        const newCount = Math.max(0, Math.round(populations[i]));
        const oldCount = entity.populationStats.count;
        
        entity.populationStats.count = newCount;
        entity.populationStats.growthRate = (newCount - oldCount) / oldCount;
      }
    }
  }

  private handleExtinctions(entities: Entity[]): void {
    for (const entity of entities) {
      if (entity.populationStats && entity.populationStats.count < 1) {
        entity.populationStats.count = 0;
        console.log(`Species ${entity.entityId} has gone extinct`);
      }
    }
  }

  reset(): void {
    this.state = null;
    this.lastUpdateTime = 0;
    this.initializeSolver();
  }
}
