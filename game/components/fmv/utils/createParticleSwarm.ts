import { Vehicle, Vector3 } from 'yuka';
import { EnhancedRNG } from '../../../../engine/utils/EnhancedRNG';

export interface ParticleVehicle extends Vehicle {
  elementType: 'H' | 'He' | 'Fe' | 'Mg' | 'Si' | 'H2O' | 'N2';
  locked: boolean;
  targetRadius: number;
  layerType?: 'core' | 'mantle' | 'crust' | 'ocean' | 'atmosphere';
  gridKey?: string;
}

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, ParticleVehicle[]>;

  constructor(cellSize: number = 2.0) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear(): void {
    this.grid.clear();
  }

  private getKey(x: number, y: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx},${cy},${cz}`;
  }

  insert(vehicle: ParticleVehicle): void {
    const key = this.getKey(vehicle.position.x, vehicle.position.y, vehicle.position.z);
    vehicle.gridKey = key;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(vehicle);
  }

  getNearby(vehicle: ParticleVehicle, radius: number): ParticleVehicle[] {
    const nearby: ParticleVehicle[] = [];
    const cells = Math.ceil(radius / this.cellSize);
    
    const cx = Math.floor(vehicle.position.x / this.cellSize);
    const cy = Math.floor(vehicle.position.y / this.cellSize);
    const cz = Math.floor(vehicle.position.z / this.cellSize);

    for (let dx = -cells; dx <= cells; dx++) {
      for (let dy = -cells; dy <= cells; dy++) {
        for (let dz = -cells; dz <= cells; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = this.grid.get(key);
          if (cell) {
            nearby.push(...cell);
          }
        }
      }
    }

    return nearby;
  }
}

export interface SwarmConfig {
  count: number;
  spawnRadius: number;
  maxSpeed: number;
  maxForce: number;
  elementDistribution?: { [key: string]: number };
}

export function createParticleSwarm(
  config: SwarmConfig,
  rng: EnhancedRNG
): ParticleVehicle[] {
  const vehicles: ParticleVehicle[] = [];
  const { count, spawnRadius, maxSpeed, maxForce, elementDistribution } = config;

  const distribution = elementDistribution || { H: 0.75, He: 0.25 };
  const elements = Object.keys(distribution);
  const thresholds: number[] = [];
  let cumulative = 0;
  
  for (const element of elements) {
    cumulative += distribution[element];
    thresholds.push(cumulative);
  }

  for (let i = 0; i < count; i++) {
    const vehicle = new Vehicle() as ParticleVehicle;
    
    const theta = rng.uniform() * Math.PI * 2;
    const phi = Math.acos(2 * rng.uniform() - 1);
    const r = spawnRadius * Math.cbrt(rng.uniform());
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    vehicle.position.set(x, y, z);
    
    const vx = (rng.uniform() - 0.5) * maxSpeed * 0.1;
    const vy = (rng.uniform() - 0.5) * maxSpeed * 0.1;
    const vz = (rng.uniform() - 0.5) * maxSpeed * 0.1;
    vehicle.velocity.set(vx, vy, vz);
    
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    
    const rand = rng.uniform();
    let elementType: ParticleVehicle['elementType'] = 'H';
    for (let j = 0; j < thresholds.length; j++) {
      if (rand < thresholds[j]) {
        elementType = elements[j] as ParticleVehicle['elementType'];
        break;
      }
    }
    
    vehicle.elementType = elementType;
    vehicle.locked = false;
    vehicle.targetRadius = 0;
    
    vehicles.push(vehicle);
  }

  return vehicles;
}

export function createDebrisField(
  layerConfigs: Array<{ type: 'core' | 'mantle' | 'crust' | 'ocean' | 'atmosphere'; element: string; count: number; radius: number }>,
  spawnRadius: number,
  maxSpeed: number,
  maxForce: number,
  rng: EnhancedRNG
): ParticleVehicle[] {
  const vehicles: ParticleVehicle[] = [];

  for (const layer of layerConfigs) {
    for (let i = 0; i < layer.count; i++) {
      const vehicle = new Vehicle() as ParticleVehicle;
      
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const r = spawnRadius * (0.5 + rng.uniform() * 0.5);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      vehicle.position.set(x, y, z);
      
      const vx = (rng.uniform() - 0.5) * maxSpeed * 0.2;
      const vy = (rng.uniform() - 0.5) * maxSpeed * 0.2;
      const vz = (rng.uniform() - 0.5) * maxSpeed * 0.2;
      vehicle.velocity.set(vx, vy, vz);
      
      vehicle.maxSpeed = maxSpeed;
      vehicle.maxForce = maxForce;
      vehicle.elementType = layer.element as ParticleVehicle['elementType'];
      vehicle.locked = false;
      vehicle.targetRadius = layer.radius;
      vehicle.layerType = layer.type;
      
      vehicles.push(vehicle);
    }
  }

  return vehicles;
}

export function applyGravityForce(vehicle: ParticleVehicle, center: Vector3, strength: number): void {
  if (vehicle.locked) return;
  
  const toCenter = new Vector3().subVectors(center, vehicle.position);
  const distance = toCenter.length();
  
  if (distance < 0.01) return;
  
  const forceMagnitude = strength / (distance * distance);
  toCenter.normalize();
  toCenter.multiplyScalar(forceMagnitude);
  
  vehicle.velocity.add(toCenter);
}

export function applySeparationForce(vehicle: ParticleVehicle, neighbors: ParticleVehicle[], radius: number, strength: number): void {
  if (vehicle.locked) return;
  
  const separationForce = new Vector3();
  let count = 0;
  
  for (const other of neighbors) {
    if (other === vehicle || other.locked) continue;
    
    const distance = vehicle.position.distanceTo(other.position);
    
    if (distance < radius && distance > 0) {
      const diff = new Vector3().subVectors(vehicle.position, other.position);
      diff.normalize();
      diff.divideScalar(distance);
      separationForce.add(diff);
      count++;
    }
  }
  
  if (count > 0) {
    separationForce.divideScalar(count);
    separationForce.multiplyScalar(strength);
    vehicle.velocity.add(separationForce);
  }
}

export function applyCohesionForce(vehicle: ParticleVehicle, neighbors: ParticleVehicle[], radius: number, strength: number): void {
  if (vehicle.locked) return;
  
  const cohesionForce = new Vector3();
  let count = 0;
  
  for (const other of neighbors) {
    if (other === vehicle || other.locked) continue;
    
    const distance = vehicle.position.distanceTo(other.position);
    
    if (distance < radius) {
      cohesionForce.add(other.position);
      count++;
    }
  }
  
  if (count > 0) {
    cohesionForce.divideScalar(count);
    cohesionForce.sub(vehicle.position);
    cohesionForce.normalize();
    cohesionForce.multiplyScalar(strength);
    vehicle.velocity.add(cohesionForce);
  }
}

export function updateSpatialGrid(grid: SpatialGrid, vehicles: ParticleVehicle[]): void {
  grid.clear();
  for (const vehicle of vehicles) {
    grid.insert(vehicle);
  }
}
