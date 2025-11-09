/**
 * N-Body Gravity Simulation
 * 
 * Uses Runge-Kutta 4 integration for accurate orbital mechanics.
 * Much better than simplified 2-body Kepler orbits.
 */

import { vec3 } from 'gl-matrix';
import { PHYSICS_CONSTANTS as C } from '../tables/physics-constants.js';

export interface CelestialBody {
  id: string;
  mass: number; // kg
  position: vec3; // m
  velocity: vec3; // m/s
  radius: number; // m (for collision detection)
}

export interface NBodyState {
  bodies: CelestialBody[];
  time: number; // s
}

/**
 * N-Body gravity simulator using RK4 integration
 */
export class NBodySimulator {
  private bodies: CelestialBody[];
  private time: number;
  
  constructor(initialState: CelestialBody[]) {
    this.bodies = initialState.map(b => ({
      ...b,
      position: vec3.clone(b.position),
      velocity: vec3.clone(b.velocity),
    }));
    this.time = 0;
  }
  
  /**
   * Get current state
   */
  getState(): NBodyState {
    return {
      bodies: this.bodies.map(b => ({
        ...b,
        position: vec3.clone(b.position),
        velocity: vec3.clone(b.velocity),
      })),
      time: this.time,
    };
  }
  
  /**
   * Advance simulation by dt seconds using RK4
   */
  step(dt: number): void {
    // RK4 integration
    const k1 = this.computeDerivatives(this.bodies);
    const bodies2 = this.updateBodies(this.bodies, k1, dt / 2);
    
    const k2 = this.computeDerivatives(bodies2);
    const bodies3 = this.updateBodies(this.bodies, k2, dt / 2);
    
    const k3 = this.computeDerivatives(bodies3);
    const bodies4 = this.updateBodies(this.bodies, k3, dt);
    
    const k4 = this.computeDerivatives(bodies4);
    
    // Weighted average: (k1 + 2*k2 + 2*k3 + k4) / 6
    this.bodies = this.bodies.map((body, i) => {
      const newPos = vec3.create();
      const newVel = vec3.create();
      
      // Position: x = x0 + dt * (v1 + 2*v2 + 2*v3 + v4) / 6
      vec3.scaleAndAdd(newPos, body.position, k1[i].velocity, dt / 6);
      vec3.scaleAndAdd(newPos, newPos, k2[i].velocity, dt / 3);
      vec3.scaleAndAdd(newPos, newPos, k3[i].velocity, dt / 3);
      vec3.scaleAndAdd(newPos, newPos, k4[i].velocity, dt / 6);
      
      // Velocity: v = v0 + dt * (a1 + 2*a2 + 2*a3 + a4) / 6
      vec3.scaleAndAdd(newVel, body.velocity, k1[i].acceleration, dt / 6);
      vec3.scaleAndAdd(newVel, newVel, k2[i].acceleration, dt / 3);
      vec3.scaleAndAdd(newVel, newVel, k3[i].acceleration, dt / 3);
      vec3.scaleAndAdd(newVel, newVel, k4[i].acceleration, dt / 6);
      
      return {
        ...body,
        position: newPos,
        velocity: newVel,
      };
    });
    
    this.time += dt;
  }
  
  /**
   * Compute derivatives (velocities and accelerations)
   */
  private computeDerivatives(bodies: CelestialBody[]): { velocity: vec3; acceleration: vec3 }[] {
    return bodies.map((body, i) => {
      const acceleration = vec3.create();
      
      // Sum gravitational forces from all other bodies
      bodies.forEach((other, j) => {
        if (i === j) return;
        
        // Vector from body to other
        const r = vec3.create();
        vec3.subtract(r, other.position, body.position);
        
        const distSq = vec3.squaredLength(r);
        const dist = Math.sqrt(distSq);
        
        if (dist < 1e-10) return; // Avoid division by zero
        
        // Gravitational acceleration: a = G * M / r²
        const accelMag = C.G * other.mass / distSq;
        
        // Direction
        vec3.normalize(r, r);
        
        // Add to total acceleration
        vec3.scaleAndAdd(acceleration, acceleration, r, accelMag);
      });
      
      return {
        velocity: vec3.clone(body.velocity),
        acceleration,
      };
    });
  }
  
  /**
   * Update bodies by derivatives
   */
  private updateBodies(
    bodies: CelestialBody[],
    derivatives: { velocity: vec3; acceleration: vec3 }[],
    dt: number
  ): CelestialBody[] {
    return bodies.map((body, i) => {
      const newPos = vec3.create();
      const newVel = vec3.create();
      
      vec3.scaleAndAdd(newPos, body.position, derivatives[i].velocity, dt);
      vec3.scaleAndAdd(newVel, body.velocity, derivatives[i].acceleration, dt);
      
      return {
        ...body,
        position: newPos,
        velocity: newVel,
      };
    });
  }
  
  /**
   * Compute orbital energy (for validation)
   */
  computeEnergy(): { kinetic: number; potential: number; total: number } {
    let kinetic = 0;
    let potential = 0;
    
    // Kinetic energy
    this.bodies.forEach(body => {
      const vSq = vec3.squaredLength(body.velocity);
      kinetic += 0.5 * body.mass * vSq;
    });
    
    // Potential energy
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const r = vec3.create();
        vec3.subtract(r, this.bodies[i].position, this.bodies[j].position);
        const dist = vec3.length(r);
        
        potential -= C.G * this.bodies[i].mass * this.bodies[j].mass / dist;
      }
    }
    
    return {
      kinetic,
      potential,
      total: kinetic + potential,
    };
  }
  
  /**
   * Compute center of mass
   */
  computeCenterOfMass(): { position: vec3; velocity: vec3 } {
    const totalMass = this.bodies.reduce((sum, b) => sum + b.mass, 0);
    const com = vec3.create();
    const comVel = vec3.create();
    
    this.bodies.forEach(body => {
      vec3.scaleAndAdd(com, com, body.position, body.mass / totalMass);
      vec3.scaleAndAdd(comVel, comVel, body.velocity, body.mass / totalMass);
    });
    
    return { position: com, velocity: comVel };
  }
  
  /**
   * Compute angular momentum (conserved quantity)
   */
  computeAngularMomentum(): vec3 {
    const L = vec3.create();
    
    this.bodies.forEach(body => {
      const r_cross_v = vec3.create();
      vec3.cross(r_cross_v, body.position, body.velocity);
      vec3.scaleAndAdd(L, L, r_cross_v, body.mass);
    });
    
    return L;
  }
  
  /**
   * Detect collisions (simple sphere-sphere)
   */
  detectCollisions(): { body1: string; body2: string }[] {
    const collisions: { body1: string; body2: string }[] = [];
    
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const b1 = this.bodies[i];
        const b2 = this.bodies[j];
        
        const r = vec3.create();
        vec3.subtract(r, b1.position, b2.position);
        const dist = vec3.length(r);
        
        if (dist < b1.radius + b2.radius) {
          collisions.push({ body1: b1.id, body2: b2.id });
        }
      }
    }
    
    return collisions;
  }
  
  /**
   * Merge two bodies (inelastic collision)
   */
  mergeBodies(id1: string, id2: string): void {
    const idx1 = this.bodies.findIndex(b => b.id === id1);
    const idx2 = this.bodies.findIndex(b => b.id === id2);
    
    if (idx1 === -1 || idx2 === -1) return;
    
    const b1 = this.bodies[idx1];
    const b2 = this.bodies[idx2];
    
    // Conservation of momentum: p_total = m1*v1 + m2*v2
    const totalMass = b1.mass + b2.mass;
    const newVel = vec3.create();
    vec3.scaleAndAdd(newVel, newVel, b1.velocity, b1.mass / totalMass);
    vec3.scaleAndAdd(newVel, newVel, b2.velocity, b2.mass / totalMass);
    
    // Conservation of mass center
    const newPos = vec3.create();
    vec3.scaleAndAdd(newPos, newPos, b1.position, b1.mass / totalMass);
    vec3.scaleAndAdd(newPos, newPos, b2.position, b2.mass / totalMass);
    
    // Volume adds (assuming same density)
    const newRadius = Math.pow(
      Math.pow(b1.radius, 3) + Math.pow(b2.radius, 3),
      1/3
    );
    
    // Create merged body
    const merged: CelestialBody = {
      id: `${b1.id}_${b2.id}`,
      mass: totalMass,
      position: newPos,
      velocity: newVel,
      radius: newRadius,
    };
    
    // Remove old bodies, add merged
    this.bodies.splice(Math.max(idx1, idx2), 1);
    this.bodies.splice(Math.min(idx1, idx2), 1);
    this.bodies.push(merged);
  }
}

/**
 * Create stable circular orbit velocity
 */
export function circularOrbitVelocity(
  centralMass: number,
  orbitRadius: number,
  eccentricity: number = 0
): number {
  // v = √(GM/r) * √((1+e)/(1-e)) for elliptical
  const vCirc = Math.sqrt(C.G * centralMass / orbitRadius);
  return vCirc * Math.sqrt((1 + eccentricity) / (1 - eccentricity));
}

/**
 * Initialize planetary system with stable orbits
 */
export function initializePlanetarySystem(
  starMass: number,
  planets: { mass: number; radius: number; orbitRadius: number; eccentricity?: number }[]
): CelestialBody[] {
  const bodies: CelestialBody[] = [];
  
  // Star at center
  bodies.push({
    id: 'star',
    mass: starMass,
    position: vec3.fromValues(0, 0, 0),
    velocity: vec3.fromValues(0, 0, 0),
    radius: C.SOLAR_RADIUS,
  });
  
  // Planets in circular orbits (for now, all in XY plane)
  planets.forEach((planet, i) => {
    const angle = (i / planets.length) * 2 * Math.PI; // Spread around star
    const r = planet.orbitRadius * C.AU;
    
    const position = vec3.fromValues(
      r * Math.cos(angle),
      r * Math.sin(angle),
      0
    );
    
    const v = circularOrbitVelocity(starMass, r, planet.eccentricity || 0);
    const velocity = vec3.fromValues(
      -v * Math.sin(angle),
      v * Math.cos(angle),
      0
    );
    
    bodies.push({
      id: `planet-${i}`,
      mass: planet.mass,
      position,
      velocity,
      radius: planet.radius,
    });
  });
  
  return bodies;
}
