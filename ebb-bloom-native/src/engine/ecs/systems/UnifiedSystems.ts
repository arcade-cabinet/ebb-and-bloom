import type { UnifiedWorld } from '../UnifiedWorld';

export const physicsSystem = (world: UnifiedWorld, delta: number) => {
  const entities = world.physicalEntities;
  
  for (const entity of entities) {
    if (entity.velocity && entity.position) {
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
      entity.position.z += entity.velocity.z * delta;
    }
  }
};

export const chemistrySystem = (world: UnifiedWorld) => {
  const entities = world.chemicalEntities;
  
  for (const entity of entities) {
    if (entity.bonds && entity.atomicComposition) {
      // Bond formation, reactions, etc.
    }
  }
};

export const structuralSystem = (world: UnifiedWorld, delta: number) => {
  const entities = world.structuralEntities;
  
  for (const entity of entities) {
    if (entity.durability !== undefined) {
      entity.durability -= delta * 0.001;
    }
  }
};

export const metabolismSystem = (world: UnifiedWorld, delta: number) => {
  const entities = world.metabolicEntities;
  
  for (const entity of entities) {
    if (entity.metabolism && entity.energy !== undefined) {
      const maintenanceCost = entity.metabolism.pathways.reduce((sum, pathway) => {
        return sum + (pathway.energyYield < 0 ? Math.abs(pathway.energyYield) : 0);
      }, 0);
      
      entity.energy -= maintenanceCost * delta;
      
      const energyProduction = entity.metabolism.pathways.reduce((sum, pathway) => {
        return sum + (pathway.energyYield > 0 ? pathway.energyYield : 0);
      }, 0);
      
      entity.energy += energyProduction * delta;
    }
  }
};
