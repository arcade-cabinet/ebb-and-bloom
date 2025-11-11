/**
 * TEST SCENE HARNESSES
 * 
 * Pre-configured test scenarios for integration and e2e testing.
 * Each scene represents a common testing scenario with proper setup.
 */

import { EntityManager, Vehicle, Vector3 } from 'yuka';
import { createTestVehicle, createTestEntityManager } from './entities';

export interface TestScene {
  manager: EntityManager;
  vehicles: Vehicle[];
  description: string;
}

/**
 * Empty scene - just an entity manager
 */
export function createEmptyScene(): TestScene {
  return {
    manager: createTestEntityManager(),
    vehicles: [],
    description: 'Empty scene with no entities',
  };
}

/**
 * Two-body scene - useful for gravity tests
 */
export function createTwoBodyScene(): TestScene {
  const manager = createTestEntityManager();
  
  const body1 = createTestVehicle(1000, new Vector3(-5, 0, 0));
  const body2 = createTestVehicle(1, new Vector3(5, 0, 0));
  
  body1.manager = manager;
  body2.manager = manager;
  
  manager.add(body1);
  manager.add(body2);
  
  return {
    manager,
    vehicles: [body1, body2],
    description: 'Two-body system (massive and light)',
  };
}

/**
 * Flocking scene - useful for behavior tests
 */
export function createFlockingScene(count = 10): TestScene {
  const manager = createTestEntityManager();
  const vehicles: Vehicle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * 5;
    const z = Math.sin(angle) * 5;
    
    const vehicle = createTestVehicle(1, new Vector3(x, 0, z));
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = 10;
    vehicle.manager = manager;
    
    vehicles.push(vehicle);
    manager.add(vehicle);
  }
  
  return {
    manager,
    vehicles,
    description: `Flocking scene with ${count} vehicles in circle`,
  };
}

/**
 * Orbit scene - planet with satellites
 */
export function createOrbitScene(): TestScene {
  const manager = createTestEntityManager();
  
  const planet = createTestVehicle(10000, new Vector3(0, 0, 0));
  const satellite1 = createTestVehicle(1, new Vector3(10, 0, 0));
  const satellite2 = createTestVehicle(1, new Vector3(0, 0, 10));
  
  planet.manager = manager;
  satellite1.manager = manager;
  satellite2.manager = manager;
  
  manager.add(planet);
  manager.add(satellite1);
  manager.add(satellite2);
  
  return {
    manager,
    vehicles: [planet, satellite1, satellite2],
    description: 'Central planet with two satellites',
  };
}
