/**
 * Monte Carlo Planetary Accretion
 * 
 * Simulates planet formation through probabilistic collisions
 * of protoplanets. Much more realistic than deterministic models.
 */

import { vec3 } from 'gl-matrix';
import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { LAWS, PHYSICS_CONSTANTS as C } from '../laws/index.js';

export interface Protoplanet {
  id: string;
  mass: number; // kg
  position: vec3; // orbital position
  orbit: number; // semi-major axis (AU)
  eccentricity: number;
  composition: {
    rock: number;
    ice: number;
    gas: number;
  };
}

export interface AccretionSimulation {
  bodies: Protoplanet[];
  collisions: number;
  time: number; // years
}

/**
 * Monte Carlo planetary accretion simulator
 */
export class MonteCarloAccretion {
  private rng: EnhancedRNG;
  private starMass: number;
  
  constructor(seed: string, starMass: number) {
    this.rng = new EnhancedRNG(seed);
    this.starMass = starMass * C.SOLAR_MASS;
  }
  
  /**
   * Initialize protoplanetary disk
   */
  initializeDisk(
    diskMass: number, // Solar masses
    innerRadius: number, // AU
    outerRadius: number, // AU
    numBodies: number = 100
  ): Protoplanet[] {
    
    const bodies: Protoplanet[] = [];
    const totalMass = diskMass * C.SOLAR_MASS;
    
    // Surface density: Σ(r) ∝ r^(-3/2) (Minimum Mass Solar Nebula)
    const surfaceDensity = (r: number) => Math.pow(r, -1.5);
    
    // Frost line (where water ice condenses)
    const frostLine = LAWS.stellar.condensation.frostLine(1.0); // Assuming solar-type
    
    for (let i = 0; i < numBodies; i++) {
      // Sample orbital radius weighted by surface density
      const r = this.sampleOrbitalRadius(innerRadius, outerRadius, surfaceDensity);
      
      // Mass from surface density (with random variation)
      const massFraction = surfaceDensity(r) / numBodies;
      const mass = totalMass * massFraction * this.rng.logNormal(0, 0.5);
      
      // Composition based on temperature
      const composition = this.determineComposition(r, frostLine);
      
      // Orbital eccentricity (initially low)
      const eccentricity = this.rng.beta(1, 10); // Very circular
      
      // Random angle
      const angle = this.rng.uniform() * 2 * Math.PI;
      const position = vec3.fromValues(
        r * Math.cos(angle),
        r * Math.sin(angle),
        0
      );
      
      bodies.push({
        id: `proto-${i}`,
        mass,
        position,
        orbit: r,
        eccentricity,
        composition,
      });
    }
    
    return bodies;
  }
  
  /**
   * Sample orbital radius from surface density distribution
   */
  private sampleOrbitalRadius(
    inner: number,
    outer: number,
    density: (r: number) => number
  ): number {
    
    // Inverse transform sampling
    // CDF(r) = ∫ r * Σ(r) dr from inner to r
    
    const u = this.rng.uniform();
    
    // For Σ ∝ r^(-3/2), CDF ∝ r^(1/2)
    const cdfInner = Math.sqrt(inner);
    const cdfOuter = Math.sqrt(outer);
    
    const cdf = cdfInner + u * (cdfOuter - cdfInner);
    return cdf * cdf; // r = CDF^2
  }
  
  /**
   * Determine composition from temperature
   */
  private determineComposition(orbit: number, frostLine: number) {
    if (orbit < frostLine * 0.5) {
      // Inner: rocky
      return { rock: 0.95, ice: 0.0, gas: 0.05 };
    } else if (orbit < frostLine) {
      // Transition: mix
      return { rock: 0.7, ice: 0.2, gas: 0.1 };
    } else if (orbit < frostLine * 3) {
      // Outer: icy + rocky
      return { rock: 0.3, ice: 0.5, gas: 0.2 };
    } else {
      // Far: mostly gas
      return { rock: 0.1, ice: 0.2, gas: 0.7 };
    }
  }
  
  /**
   * Run Monte Carlo collision simulation
   */
  simulate(
    initialBodies: Protoplanet[],
    maxIterations: number = 10000,
    timeStep: number = 1000 // years per iteration
  ): AccretionSimulation {
    
    let bodies = [...initialBodies];
    let collisions = 0;
    let time = 0;
    
    for (let iter = 0; iter < maxIterations && bodies.length > 1; iter++) {
      time += timeStep;
      
      // Check for collisions
      const toMerge: [number, number][] = [];
      
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          if (this.checkCollision(bodies[i], bodies[j])) {
            toMerge.push([i, j]);
            break; // Each body can only collide once per step
          }
        }
      }
      
      // Merge colliding bodies
      for (const [i, j] of toMerge.reverse()) {
        bodies = this.mergeBodies(bodies, i, j);
        collisions++;
      }
      
      // Update orbital elements (gravitational stirring)
      bodies = this.updateOrbits(bodies, timeStep);
      
      // Stop if we have a stable system
      if (bodies.length < 20 && iter > 1000) {
        const stable = this.checkStability(bodies);
        if (stable) break;
      }
    }
    
    return {
      bodies,
      collisions,
      time,
    };
  }
  
  /**
   * Check if two bodies collide
   */
  private checkCollision(body1: Protoplanet, body2: Protoplanet): boolean {
    // Collision probability based on Hill sphere overlap
    const hillRadius1 = this.calculateHillRadius(body1);
    const hillRadius2 = this.calculateHillRadius(body2);
    
    // Orbital separation
    const deltaOrbit = Math.abs(body1.orbit - body2.orbit);
    
    // If Hill spheres overlap, collision is possible
    if (deltaOrbit < (hillRadius1 + hillRadius2)) {
      // Probability based on eccentricities
      const p = Math.min(1.0, (hillRadius1 + hillRadius2) / deltaOrbit);
      return this.rng.uniform() < p;
    }
    
    return false;
  }
  
  /**
   * Calculate Hill radius (gravitational sphere of influence)
   */
  private calculateHillRadius(body: Protoplanet): number {
    // r_H = a * (m / 3M)^(1/3)
    return body.orbit * Math.pow(body.mass / (3 * this.starMass), 1/3);
  }
  
  /**
   * Merge two bodies
   */
  private mergeBodies(
    bodies: Protoplanet[],
    idx1: number,
    idx2: number
  ): Protoplanet[] {
    
    const b1 = bodies[idx1];
    const b2 = bodies[idx2];
    
    const totalMass = b1.mass + b2.mass;
    
    // Conservation of momentum → new orbit
    const newOrbit = (b1.orbit * b1.mass + b2.orbit * b2.mass) / totalMass;
    
    // New eccentricity (collisions tend to circularize)
    const newEccentricity = Math.min(
      (b1.eccentricity * b1.mass + b2.eccentricity * b2.mass) / totalMass * 0.7, // Damping factor
      0.3 // Max eccentricity
    );
    
    // Mix compositions
    const newComposition = {
      rock: (b1.composition.rock * b1.mass + b2.composition.rock * b2.mass) / totalMass,
      ice: (b1.composition.ice * b1.mass + b2.composition.ice * b2.mass) / totalMass,
      gas: (b1.composition.gas * b1.mass + b2.composition.gas * b2.mass) / totalMass,
    };
    
    // Create merged body
    const merged: Protoplanet = {
      id: `merged-${b1.id}-${b2.id}`,
      mass: totalMass,
      position: vec3.create(), // Will be updated
      orbit: newOrbit,
      eccentricity: newEccentricity,
      composition: newComposition,
    };
    
    // Remove old bodies, add merged
    const newBodies = [...bodies];
    newBodies.splice(Math.max(idx1, idx2), 1);
    newBodies.splice(Math.min(idx1, idx2), 1);
    newBodies.push(merged);
    
    return newBodies;
  }
  
  /**
   * Update orbits due to gravitational interactions
   */
  private updateOrbits(bodies: Protoplanet[], timeStep: number): Protoplanet[] {
    // Gravitational stirring: increase eccentricities slightly
    return bodies.map(body => {
      // Random walk in eccentricity
      const deltaE = this.rng.normal(0, 0.001 * timeStep / 1000);
      const newE = Math.max(0, Math.min(0.5, body.eccentricity + deltaE));
      
      return {
        ...body,
        eccentricity: newE,
      };
    });
  }
  
  /**
   * Check if system is stable (wide orbital spacing)
   */
  private checkStability(bodies: Protoplanet[]): boolean {
    // Sort by orbit
    const sorted = [...bodies].sort((a, b) => a.orbit - b.orbit);
    
    // Check mutual Hill radii spacing
    for (let i = 0; i < sorted.length - 1; i++) {
      const hillRadius1 = this.calculateHillRadius(sorted[i]);
      const hillRadius2 = this.calculateHillRadius(sorted[i + 1]);
      const separation = sorted[i + 1].orbit - sorted[i].orbit;
      
      // Need at least 3 Hill radii separation for stability
      if (separation < 3 * (hillRadius1 + hillRadius2)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get final planet list
   */
  getFormattedPlanets(simulation: AccretionSimulation): any[] {
    return simulation.bodies
      .sort((a, b) => a.orbit - b.orbit)
      .map((body, i) => {
        // Determine planet type from composition
        const isGasGiant = body.composition.gas > 0.5;
        const isIceGiant = body.composition.ice > 0.3 && !isGasGiant;
        
        // Estimate radius from mass and composition
        const radius = this.estimateRadius(body.mass, body.composition);
        
        return {
          name: `Planet ${i + 1}`,
          mass: body.mass,
          radius,
          orbit: body.orbit,
          eccentricity: body.eccentricity,
          composition: body.composition,
          type: isGasGiant ? 'gas_giant' : isIceGiant ? 'ice_giant' : 'rocky',
        };
      });
  }
  
  /**
   * Estimate radius from mass and composition
   */
  private estimateRadius(mass: number, composition: any): number {
    if (composition.gas > 0.5) {
      // Gas giant: roughly constant radius
      return 6e7; // ~Jupiter size
    } else {
      // Rocky/icy: R ∝ M^0.27
      return C.EARTH_RADIUS * Math.pow(mass / C.EARTH_MASS, 0.27);
    }
  }
}
