import type { World } from 'miniplex';
import type { Entity } from '../../components/CoreComponents';
import { ConservationLedger } from '../../core/ConservationLedger';

export class RapierPhysicsSystem {
  private world: any = null;
  private RAPIER: any = null;
  private bodyMap: Map<string, any> = new Map();
  private initialized = false;
  private conservationLedger: ConservationLedger;
  private previousMomentum: Map<string, { x: number; y: number; z: number }> = new Map();

  constructor(conservationLedger: ConservationLedger) {
    this.conservationLedger = conservationLedger;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Use raw Rapier for web - NOT react-three-rapier (that requires R3F context)
      const RAPIER = await import('@dimforge/rapier3d-compat');
      await RAPIER.init({});
      this.RAPIER = RAPIER;
      
      // Create physics world with default gravity
      const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
      this.world = new RAPIER.World(gravity);
      
      this.initialized = true;
      console.log('[RapierPhysicsSystem] ✅ Initialized with raw Rapier for web');
    } catch (error) {
      console.warn('[RapierPhysicsSystem] ❌ Failed to initialize Rapier, physics system will be disabled:', error);
      this.initialized = false;
    }
  }

  update(ecsWorld: World<Entity>, delta: number): void {
    if (!this.world || !this.initialized) return;

    const structuralEntities = ecsWorld.with('mass', 'position', 'scale');

    for (const entity of structuralEntities) {
      if (entity.scale !== 'structural' && entity.scale !== 'organismal') continue;

      if (entity.rapierBodyHandle === undefined) {
        this.createRigidBody(entity);
      }
    }

    this.world.step(delta);

    for (const entity of structuralEntities) {
      if (entity.rapierBodyHandle !== undefined) {
        this.syncFromRapier(entity);
        this.trackMomentumChange(entity);
      }
    }

    this.reportConservation();
  }

  private trackMomentumChange(entity: Entity): void {
    if (!entity.velocity || !entity.mass) return;

    const body = this.bodyMap.get(entity.entityId);
    if (!body) return;

    const currentMomentum = {
      x: entity.velocity.x * entity.mass,
      y: entity.velocity.y * entity.mass,
      z: entity.velocity.z * entity.mass,
    };

    const previousMomentum = this.previousMomentum.get(entity.entityId);
    if (previousMomentum) {
      const momentumDelta = {
        x: currentMomentum.x - previousMomentum.x,
        y: currentMomentum.y - previousMomentum.y,
        z: currentMomentum.z - previousMomentum.z,
      };

      const deltaMagnitude = Math.sqrt(
        momentumDelta.x ** 2 + momentumDelta.y ** 2 + momentumDelta.z ** 2
      );

      if (deltaMagnitude > 0.001) {
        const kineticEnergy = 0.5 * entity.mass * (
          entity.velocity.x ** 2 + entity.velocity.y ** 2 + entity.velocity.z ** 2
        );
        
        this.conservationLedger.addEntity(
          `${entity.entityId}_impulse`,
          0,
          kineticEnergy,
          0,
          currentMomentum
        );
      }
    }

    this.previousMomentum.set(entity.entityId, currentMomentum);
  }

  private createRigidBody(entity: Entity): void {
    if (!this.world || !this.RAPIER || !entity.position || !entity.mass) return;

    // Use raw Rapier API
    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(entity.position.x, entity.position.y, entity.position.z);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    if (entity.velocity) {
      rigidBody.setLinvel(
        new this.RAPIER.Vector3(entity.velocity.x, entity.velocity.y, entity.velocity.z),
        true
      );
    }

    // Calculate radius from mass (assuming sphere with density 1)
    const radius = Math.pow((3 * entity.mass) / (4 * Math.PI), 1/3);
    const colliderDesc = this.RAPIER.ColliderDesc.ball(radius).setDensity(1.0);
    this.world.createCollider(colliderDesc, rigidBody);

    entity.rapierBodyHandle = rigidBody.handle;
    this.bodyMap.set(entity.entityId, rigidBody);
  }

  private syncFromRapier(entity: Entity): void {
    if (!this.world || entity.rapierBodyHandle === undefined) return;

    const body = this.bodyMap.get(entity.entityId);
    if (!body) return;

    // Get translation and velocity from Rapier body
    const translation = body.translation();
    entity.position = { x: translation.x, y: translation.y, z: translation.z };

    const linvel = body.linvel();
    if (!entity.velocity) {
      entity.velocity = { x: 0, y: 0, z: 0 };
    }
    entity.velocity.x = linvel.x;
    entity.velocity.y = linvel.y;
    entity.velocity.z = linvel.z;
  }

  private reportConservation(): void {
    if (!this.world) return;

    let totalKineticEnergy = 0;
    let totalMomentum = { x: 0, y: 0, z: 0 };

    for (const body of this.bodyMap.values()) {
      const mass = body.mass();
      const velocity = body.linvel();

      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
      totalKineticEnergy += 0.5 * mass * speed ** 2;

      totalMomentum.x += mass * velocity.x;
      totalMomentum.y += mass * velocity.y;
      totalMomentum.z += mass * velocity.z;
    }
  }

  removeEntity(entityId: string): void {
    const body = this.bodyMap.get(entityId);
    if (body && this.world) {
      this.world.removeRigidBody(body);
      this.bodyMap.delete(entityId);
    }
  }

  destroy(): void {
    if (this.world) {
      this.world.free();
      this.world = null;
    }
    this.bodyMap.clear();
    this.initialized = false;
  }
}
