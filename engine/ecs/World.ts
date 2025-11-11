import { World as MiniplexWorld } from 'miniplex';
import type { Entity } from './components/CoreComponents';
import { LawOrchestrator } from './core/LawOrchestrator';
import { SpatialIndex } from './core/SpatialIndex';

export class World {
  private world: MiniplexWorld<Entity>;
  private orchestrator: LawOrchestrator;
  private spatialIndex: SpatialIndex;
  private initialized = false;
  private timeElapsed = 0;

  constructor() {
    this.world = new MiniplexWorld<Entity>();
    this.orchestrator = new LawOrchestrator();
    this.spatialIndex = new SpatialIndex();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.orchestrator.initialize();
    this.initialized = true;
  }

  tick(delta: number): void {
    if (!this.initialized) {
      console.warn('World not initialized. Call initialize() first.');
      return;
    }

    this.orchestrator.tick(this.world, delta);
    this.updateSpatialIndex();
    this.timeElapsed += delta;
  }

  private updateSpatialIndex(): void {
    const spatialEntities = Array.from(this.world.with('entityId', 'position'))
      .map(e => ({
        entityId: e.entityId,
        position: e.position!,
        radius: 1.0,
      }));

    this.spatialIndex.rebuild(spatialEntities);
  }

  add(entity: Partial<Entity> & Pick<Entity, 'entityId' | 'scale'>): Entity {
    const fullEntity: Entity = {
      ...entity,
      entityId: entity.entityId,
      scale: entity.scale,
    };

    this.world.add(fullEntity);

    if (fullEntity.mass && fullEntity.position) {
      this.orchestrator.getConservationLedger().addEntity(
        fullEntity.entityId,
        fullEntity.mass,
        0,
        fullEntity.charge,
        fullEntity.velocity
      );
    }

    return fullEntity;
  }

  remove(entity: Entity): void {
    if (entity.mass) {
      this.orchestrator.getConservationLedger().removeEntity(
        entity.entityId,
        entity.mass,
        0,
        entity.charge,
        entity.velocity
      );
    }

    this.world.remove(entity);
  }

  queryRadius(center: { x: number; y: number; z: number }, radius: number): Entity[] {
    const spatialResults = this.spatialIndex.queryRadius(center, radius);
    return spatialResults
      .map(sr => this.getEntityById(sr.entityId))
      .filter((e): e is Entity => e !== undefined);
  }

  queryNearest(position: { x: number; y: number; z: number }, count: number = 1): Entity[] {
    const spatialResults = this.spatialIndex.queryNearest(position, count);
    return spatialResults
      .map(sr => this.getEntityById(sr.entityId))
      .filter((e): e is Entity => e !== undefined);
  }

  getEntityById(entityId: string): Entity | undefined {
    return Array.from(this.world.entities).find(e => e.entityId === entityId);
  }

  get entities() {
    return this.world;
  }

  get physicalEntities() {
    return this.world.with('mass', 'position');
  }

  get chemicalEntities() {
    return this.world.with('elementCounts');
  }

  get biologicalEntities() {
    return this.world.with('genome', 'phenotype');
  }

  get aggregateEntities() {
    return this.world.with('aggregateOf');
  }

  getStatistics() {
    return {
      entityCount: Array.from(this.world.entities).length,
      timeElapsed: this.timeElapsed,
      orchestrator: this.orchestrator.getStatistics(),
      spatialIndex: this.spatialIndex.getStatistics(),
    };
  }

  destroy(): void {
    this.orchestrator.destroy();
    this.spatialIndex.clear();
    this.initialized = false;
  }
}
