/**
 * YUKA ENTITY SCAFFOLDS FOR TESTING
 * 
 * Factory functions for creating test entities with proper YUKA patterns.
 * These helpers ensure consistent entity setup across all tests.
 */

import { EntityManager, Vehicle, Vector3 } from 'yuka';

/**
 * Create a test vehicle with optional mass and position
 * 
 * @param mass - Vehicle mass (default: 1)
 * @param position - Initial position (default: origin)
 * @returns Configured test vehicle
 */
export function createTestVehicle(mass = 1, position = new Vector3()): Vehicle {
  const vehicle = new Vehicle();
  vehicle.mass = mass;
  vehicle.position.copy(position);
  vehicle.maxSpeed = 10;
  vehicle.updateNeighborhood = false;
  return vehicle;
}

/**
 * Create a test entity manager
 * 
 * @returns Empty EntityManager instance
 */
export function createTestEntityManager(): EntityManager {
  return new EntityManager();
}

/**
 * Create a fleet of test vehicles at random positions
 * 
 * @param count - Number of vehicles to create
 * @param radius - Spawn radius
 * @param mass - Mass for all vehicles
 * @returns Array of vehicles
 */
export function createTestFleet(count: number, radius = 10, mass = 1): Vehicle[] {
  const vehicles: Vehicle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const position = new Vector3(x, 0, z);
    
    vehicles.push(createTestVehicle(mass, position));
  }
  
  return vehicles;
}

/**
 * Create an entity manager with a fleet of vehicles
 * 
 * @param count - Number of vehicles
 * @param radius - Spawn radius
 * @param mass - Vehicle mass
 * @returns EntityManager with vehicles added
 */
export function createTestFleetManager(count: number, radius = 10, mass = 1): EntityManager {
  const manager = createTestEntityManager();
  const vehicles = createTestFleet(count, radius, mass);
  
  vehicles.forEach(vehicle => {
    vehicle.manager = manager;
    manager.add(vehicle);
  });
  
  return manager;
}
