/**
 * SIMPLE Universe Generator - No Over-Engineering
 * 
 * Uses seedrandom + laws. That's it. No complex physics libraries.
 * KISS principle - Keep It Simple, Stupid.
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';
import { StellarLaws } from '../laws/stellar';
import { PERIODIC_TABLE } from '../tables/periodic-table';

export interface Star {
  mass: number;
  radius: number;
  luminosity: number;
  temperature: number;
  age: number;
  spectralType: string;
}

export interface Planet {
  name: string;
  mass: number;
  radius: number;
  density: number;
  orbitalRadius: number;
  orbitalPeriod: number;
  surfaceGravity: number;
  escapeVelocity: number;
  surfaceTemp: number;
  composition: any;
  atmosphere: any;
  magneticField: boolean;
  rotationPeriod: number;
  axialTilt: number;
}

export interface Universe {
  seed: string;
  star: Star;
  planets: Planet[];
  habitablePlanet?: Planet;
}

/**
 * Generate universe from seed - SIMPLE AND WORKING
 */
export function generateUniverse(seed: string): Universe {
  const rng = new EnhancedRNG(seed);
  
  // Generate star using Salpeter IMF
  const starMass = rng.powerLaw(2.35, 0.08, 100);
  const luminosity = StellarLaws.mainSequence.luminosity(starMass);
  const radius = StellarLaws.mainSequence.radius(starMass);
  const temperature = StellarLaws.mainSequence.temperature(starMass);
  const star: Star = {
    mass: starMass,
    luminosity,
    radius,
    temperature,
    age: rng.uniform(1, 10), // Billion years
    spectralType: StellarLaws.mainSequence.spectralType(temperature),
  };
  
  // Generate planets using Poisson distribution
  // Observed data shows mean ~2.5 planets per star, so lambda=1.5 (since we +1)
  const planetCount = Math.min(rng.poisson(1.5) + 1, 8);
  const planets: Planet[] = [];
  
  for (let i = 0; i < planetCount; i++) {
    // Orbital radius (log-spaced from 0.1 to 50 AU)
    const a = 0.1 * Math.pow(10, rng.uniform(0, 2.7)); // 0.1 - 50 AU
    
    // Mass (log-normal distribution)
    const massMJ = rng.logNormal(0, 2); // Jupiter masses
    const massEarth = massMJ * 317.8;
    const mass = massEarth * 5.972e24; // kg
    
    // Frost line determines composition (simple)
    const frostLine = Math.sqrt(star.luminosity) * 2.7; // AU
    const isRocky = a < frostLine;
    
    // Composition
    const composition = isRocky ? {
      core: { Fe: 0.88, Ni: 0.06, S: 0.04, Other: 0.02 },
      mantle: { O: 0.44, Si: 0.21, Mg: 0.22, Fe: 0.06, Other: 0.07 },
      crust: { O: 0.46, Si: 0.28, Al: 0.08, Fe: 0.05, Other: 0.13 },
    } : {
      core: { H: 0.75, He: 0.24, Other: 0.01 },
      mantle: { H: 0.80, He: 0.19, Other: 0.01 },
      atmosphere: { H: 0.90, He: 0.09, CH4: 0.01 },
    };
    
    // Radius from mass-radius relationship
    const density = isRocky ? 5500 : 1300; // kg/m³
    const radius = Math.pow((3 * mass) / (4 * Math.PI * density), 1/3);
    
    // Surface gravity
    const g = mass / (radius * radius) * 6.67430e-11;
    
    // Orbital period (Kepler's 3rd law: T² ∝ a³)
    const G_AU = 39.476; // G in AU³/(M☉·year²)
    const T = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (G_AU * star.mass));
    
    // Escape velocity
    const vEsc = Math.sqrt(2 * 6.67430e-11 * mass / radius);
    
    // Surface temperature from stellar flux
    const flux = star.luminosity * 3.828e26 / (4 * Math.PI * Math.pow(a * 1.496e11, 2));
    const surfaceTemp = Math.pow(flux / (4 * 5.670374419e-8), 0.25);
    
    // Rotation period (randomized with tidal locking for close planets)
    const rotationPeriod = a < 0.1 ? T : rng.normal(24, 12); // hours
    
    // Axial tilt
    const axialTilt = rng.normal(15, 10); // degrees
    
    // Atmosphere retention (Jeans escape)
    const hasAtmosphere = isRocky && mass > 1e24 && surfaceTemp < 400;
    
    planets.push({
      name: `Planet-${i+1}`,
      mass,
      radius,
      density,
      orbitalRadius: a,
      orbitalPeriod: T,
      surfaceGravity: g,
      escapeVelocity: vEsc,
      surfaceTemp,
      composition,
      atmosphere: hasAtmosphere ? {
        composition: { N2: 0.78, O2: 0.21, Ar: 0.01 },
        pressure: 101325, // Pa
      } : null,
      magneticField: isRocky && mass > 1e24,
      rotationPeriod,
      axialTilt,
    });
  }
  
  const habitablePlanet = planets.find(p => 
    p.surfaceTemp > 273 && 
    p.surfaceTemp < 373 && 
    p.atmosphere
  );
  
  return {
    seed,
    star,
    planets,
    habitablePlanet,
  };
}

