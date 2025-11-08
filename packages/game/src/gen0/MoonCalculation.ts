/**
 * Moon Calculation - Orbital Mechanics for Gen0
 * Calculates moon positions based on accretion physics
 */

import seedrandom from 'seedrandom';
import type { Planet } from '../schemas/index.js';

export interface Moon {
  id: string;
  name: string;
  radius: number; // meters
  mass: number; // kg
  orbitalDistance: number; // meters (semi-major axis)
  orbitalPeriod: number; // seconds
  eccentricity: number; // 0-1
  inclination: number; // radians
  argumentOfPeriapsis: number; // radians
  meanAnomaly: number; // radians (current position)
}

/**
 * Calculate moons based on accretion history and planet properties
 */
export function calculateMoons(planet: Planet, seed: string): Moon[] {
  const rng = seedrandom(`${seed}-moons`);
  
  // Determine number of moons based on planet mass and accretion history
  // Larger planets and more violent accretion = more moons
  const collisionCount = planet.compositionHistory.filter(
    e => e.type === 'collision'
  ).length;
  
  // Probability of moon formation increases with collisions
  const moonProbability = Math.min(0.3 + (collisionCount / 100) * 0.4, 0.7);
  const numMoons = Math.floor(rng() * moonProbability * 3); // 0-2 moons typically
  
  if (numMoons === 0) return [];
  
  const moons: Moon[] = [];
  const G = 6.67430e-11; // Gravitational constant
  
  for (let i = 0; i < numMoons; i++) {
    // Moon mass scales with planet mass (typically 0.01% - 1% of planet mass)
    const massRatio = 0.0001 + rng() * 0.01; // 0.01% - 1%
    const moonMass = planet.mass * massRatio;
    
    // Moon radius from mass (assuming similar density to planet)
    const planetDensity = planet.mass / ((4/3) * Math.PI * Math.pow(planet.radius, 3));
    const moonRadius = Math.pow((3 * moonMass) / (4 * Math.PI * planetDensity), 1/3);
    
    // Orbital distance: Roche limit to Hill sphere
    // Roche limit: ~2.5 * planet radius
    // Hill sphere: ~a * (moonMass / (3 * planetMass))^(1/3)
    const rocheLimit = 2.5 * planet.radius;
    const hillSphere = planet.radius * 10 * Math.pow(moonMass / planet.mass, 1/3);
    const minDistance = rocheLimit;
    const maxDistance = Math.min(hillSphere, planet.radius * 50); // Reasonable max
    
    // Orbital distance (semi-major axis)
    const orbitalDistance = minDistance + rng() * (maxDistance - minDistance);
    
    // Orbital period from Kepler's third law: T^2 = (4π^2 / GM) * a^3
    const orbitalPeriod = Math.sqrt(
      (4 * Math.PI * Math.PI) / (G * planet.mass) * Math.pow(orbitalDistance, 3)
    );
    
    // Orbital parameters
    const eccentricity = rng() * 0.1; // Nearly circular (0-0.1)
    const inclination = (rng() - 0.5) * Math.PI / 6; // ±15 degrees
    const argumentOfPeriapsis = rng() * 2 * Math.PI;
    const meanAnomaly = rng() * 2 * Math.PI; // Random starting position
    
    moons.push({
      id: `moon-${i + 1}`,
      name: `Moon ${i + 1}`,
      radius: moonRadius,
      mass: moonMass,
      orbitalDistance,
      orbitalPeriod,
      eccentricity,
      inclination,
      argumentOfPeriapsis,
      meanAnomaly,
    });
  }
  
  // Sort by orbital distance (closest first)
  moons.sort((a, b) => a.orbitalDistance - b.orbitalDistance);
  
  return moons;
}

/**
 * Calculate current moon position in 3D space (for rendering)
 */
export function calculateMoonPosition(
  moon: Moon,
  _planetRadius: number, // For future collision detection
  time: number = 0 // seconds since epoch
): { x: number; y: number; z: number } {
  // Mean anomaly at current time
  const meanAnomaly = moon.meanAnomaly + (2 * Math.PI * time) / moon.orbitalPeriod;
  
  // Solve Kepler's equation for eccentric anomaly (simplified: use mean anomaly for small e)
  const eccentricAnomaly = meanAnomaly + moon.eccentricity * Math.sin(meanAnomaly);
  
  // True anomaly
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + moon.eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - moon.eccentricity) * Math.cos(eccentricAnomaly / 2)
  );
  
  // Distance at current position (ellipse)
  const distance = moon.orbitalDistance * (1 - moon.eccentricity * moon.eccentricity) /
    (1 + moon.eccentricity * Math.cos(trueAnomaly));
  
  // Position in orbital plane
  const xOrbital = distance * Math.cos(trueAnomaly + moon.argumentOfPeriapsis);
  const yOrbital = distance * Math.sin(trueAnomaly + moon.argumentOfPeriapsis);
  
  // Rotate by inclination
  const x = xOrbital;
  const y = yOrbital * Math.cos(moon.inclination);
  const z = yOrbital * Math.sin(moon.inclination);
  
  return { x, y, z };
}

