/**
 * Universe Generator
 * 
 * The main engine that applies laws in sequence to generate
 * a complete, scientifically consistent universe from a seed.
 * 
 * NO AI CALLS. PURE DETERMINISTIC EXTRAPOLATION.
 */

import seedrandom from 'seedrandom';
import { LAWS, PHYSICS_CONSTANTS } from '../laws/index.js';

export interface UniverseSeed {
  seed: string;
  timestamp?: number;
}

export interface Star {
  mass: number; // Solar masses
  radius: number; // Solar radii
  luminosity: number; // Solar luminosities
  temperature: number; // Kelvin
  age: number; // Years
  spectralType: string; // O, B, A, F, G, K, M
  luminosityClass: string; // I, III, V
}

export interface Planet {
  name: string;
  mass: number; // kg
  radius: number; // m
  density: number; // kg/m³
  orbitalRadius: number; // AU
  orbitalPeriod: number; // years
  surfaceGravity: number; // m/s²
  escapeVelocity: number; // m/s
  surfaceTemperature: number; // K
  
  composition: {
    core: { [element: string]: number }; // Mass fractions
    mantle: { [element: string]: number };
    crust: { [element: string]: number };
  };
  
  atmosphere: {
    pressure: number; // Pa
    composition: { [element: string]: number }; // Volume fractions
    scaleHeight: number; // m
  } | null;
  
  magneticField: number; // Tesla
  rotationPeriod: number; // hours
  axialTilt: number; // degrees
  
  habitability: {
    inHabitableZone: boolean;
    hasLiquidWater: boolean;
    hasAtmosphere: boolean;
    hasMagneticField: boolean;
    score: number; // 0-1
  };
}

export interface Universe {
  seed: string;
  star: Star;
  planets: Planet[];
  habitablePlanet?: Planet;
  age: number; // Universe age in years
}

export class UniverseGenerator {
  private rng: ReturnType<typeof seedrandom>;
  
  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }
  
  /**
   * Generate complete universe from seed
   */
  generate(): Universe {
    // Step 1: Generate star
    const star = this.generateStar();
    
    // Step 2: Generate planetary system
    const planets = this.generatePlanets(star);
    
    // Step 3: Find habitable planet
    const habitablePlanet = planets.find(p => p.habitability.score > 0.5);
    
    return {
      seed: '', // Will be set by caller
      star,
      planets,
      habitablePlanet,
      age: star.age,
    };
  }
  
  /**
   * Generate star properties from laws
   */
  private generateStar(): Star {
    // Sample mass from IMF (Initial Mass Function)
    const mass = LAWS.stellar.imf.sampleMass(() => this.rng());
    
    // Apply main sequence relationships
    const luminosity = LAWS.stellar.mainSequence.luminosity(mass);
    const radius = LAWS.stellar.mainSequence.radius(mass);
    const temperature = LAWS.stellar.mainSequence.temperature(mass);
    const lifetime = LAWS.stellar.mainSequence.lifetime(mass);
    
    // Sample age (0 to lifetime, weighted toward younger)
    const age = lifetime * Math.pow(this.rng(), 2); // Younger stars more common
    
    // Classify star
    const spectralType = LAWS.stellar.mainSequence.spectralType(temperature);
    const luminosityClass = LAWS.stellar.mainSequence.luminosityClass(mass, age, lifetime);
    
    return {
      mass,
      radius,
      luminosity,
      temperature,
      age,
      spectralType,
      luminosityClass,
    };
  }
  
  /**
   * Generate planetary system
   */
  private generatePlanets(star: Star): Planet[] {
    const planets: Planet[] = [];
    
    // Number of planets (roughly follows observed distribution)
    const planetCount = Math.floor(1 + this.rng() * 8); // 1-8 planets
    
    // Frost line
    const frostLine = LAWS.stellar.condensation.frostLine(star.luminosity);
    
    // Habitable zone
    const hzInner = LAWS.stellar.habitableZone.innerEdge(star.luminosity);
    const hzOuter = LAWS.stellar.habitableZone.outerEdge(star.luminosity as any);
    
    // Generate planets at increasing orbital distances
    let orbitRadius = 0.1 + this.rng() * 0.3; // Start close (0.1-0.4 AU)
    
    for (let i = 0; i < planetCount; i++) {
      // Planet type based on distance
      const distanceFromFrostLine = orbitRadius / frostLine;
      const inHabitableZone = orbitRadius >= hzInner && orbitRadius <= hzOuter;
      
      // Generate planet
      const planet = this.generatePlanet(star, orbitRadius, distanceFromFrostLine, inHabitableZone, i);
      planets.push(planet);
      
      // Next orbit (roughly exponential spacing)
      const nextOrbitRadius = orbitRadius * (1.4 + this.rng() * 0.6); // 1.4x to 2x spacing
      orbitRadius = nextOrbitRadius;
    }
    
    return planets;
  }
  
  /**
   * Generate individual planet
   */
  private generatePlanet(
    star: Star,
    orbitRadius: number,
    distanceFromFrostLine: number,
    inHabitableZone: boolean,
    index: number
  ): Planet {
    // Temperature at this distance
    const temperature = LAWS.stellar.condensation.temperature(star.luminosity, orbitRadius);
    
    // Available materials
    const materials = LAWS.stellar.condensation.condensedMaterials(temperature);
    
    // Planet type and mass
    let mass: number;
    let isGasGiant = false;
    
    if (distanceFromFrostLine > 1.2 && this.rng() > 0.7) {
      // Gas giant (beyond frost line)
      mass = (50 + this.rng() * 300) * PHYSICS_CONSTANTS.EARTH_MASS; // 50-350 Earth masses
      isGasGiant = true;
    } else {
      // Rocky planet
      mass = (0.1 + this.rng() * 5) * PHYSICS_CONSTANTS.EARTH_MASS; // 0.1-5 Earth masses
    }
    
    // Radius from mass and composition (simplified)
    const density = isGasGiant ? 1000 : 5000; // kg/m³ (rough)
    const volume = mass / density;
    const radius = Math.pow(3 * volume / (4 * Math.PI), 1/3);
    
    // Orbital mechanics
    const orbitalPeriod = LAWS.physics.orbital.period(orbitRadius * PHYSICS_CONSTANTS.AU, star.mass * PHYSICS_CONSTANTS.SOLAR_MASS) / (365.25 * 86400); // years
    const surfaceGravity = LAWS.physics.gravity.surfaceGravity(mass, radius);
    const escapeVelocity = LAWS.physics.orbital.escapeVelocity(mass, radius);
    
    // Composition (simplified)
    const composition = this.generateComposition(materials, isGasGiant);
    
    // Atmosphere (if can retain)
    const atmosphere = this.generateAtmosphere(mass, radius, temperature, isGasGiant);
    
    // Magnetic field (depends on core composition and rotation)
    const hasIronCore = composition.core['Fe'] > 0.5;
    const magneticField = hasIronCore ? 1e-5 * (mass / PHYSICS_CONSTANTS.EARTH_MASS) : 0; // Tesla
    
    // Rotation (simplified)
    const rotationPeriod = 10 + this.rng() * 100; // hours
    const axialTilt = this.rng() * 40; // degrees (most planets < 40°)
    
    // Habitability assessment
    const habitability = this.assessHabitability(
      inHabitableZone,
      atmosphere,
      temperature,
      magneticField > 0,
      mass
    );
    
    return {
      name: `Planet ${index + 1}`,
      mass,
      radius,
      density,
      orbitalRadius,
      orbitalPeriod,
      surfaceGravity,
      escapeVelocity,
      surfaceTemperature: temperature,
      composition,
      atmosphere,
      magneticField,
      rotationPeriod,
      axialTilt,
      habitability,
    };
  }
  
  /**
   * Generate planetary composition
   */
  private generateComposition(
    materials: string[],
    isGasGiant: boolean
  ): Planet['composition'] {
    if (isGasGiant) {
      return {
        core: { Fe: 0.3, Si: 0.3, Ni: 0.2, rock: 0.2 },
        mantle: { H: 0.75, He: 0.25 },
        crust: { H: 0.75, He: 0.25 },
      };
    }
    
    // Rocky planet
    return {
      core: { Fe: 0.85, Ni: 0.15 },
      mantle: { Si: 0.4, O: 0.4, Mg: 0.15, other: 0.05 },
      crust: { Si: 0.3, O: 0.5, Al: 0.08, Fe: 0.05, other: 0.07 },
    };
  }
  
  /**
   * Generate atmosphere (if planet can retain one)
   */
  private generateAtmosphere(
    mass: number,
    radius: number,
    temperature: number,
    isGasGiant: boolean
  ): Planet['atmosphere'] | null {
    // Check if can retain H₂ (lightest gas)
    const H2_mass = 2 * 1.67e-27; // kg
    const canRetainH2 = LAWS.physics.fluid.canRetainGas(mass, radius, H2_mass, temperature);
    
    if (!canRetainH2 && !isGasGiant) {
      return null; // Too small/hot to retain atmosphere
    }
    
    // Gas giant
    if (isGasGiant) {
      return {
        pressure: 1e5, // 1 bar (at some reference level)
        composition: { H: 0.75, He: 0.24, other: 0.01 },
        scaleHeight: LAWS.physics.fluid.scaleHeight(temperature, 2e-3, mass / (radius * radius)),
      };
    }
    
    // Rocky planet atmosphere (Earth-like if in HZ, otherwise different)
    const composition: { [key: string]: number } = {};
    
    // Primordial atmosphere evolves over time
    if (temperature < 200) {
      // Cold: retain volatiles
      composition.N2 = 0.5;
      composition.CH4 = 0.3;
      composition.CO2 = 0.2;
    } else if (temperature < 350) {
      // Temperate: possible life signatures
      composition.N2 = 0.78;
      composition.O2 = 0.21;
      composition.Ar = 0.01;
    } else {
      // Hot: CO2 dominated
      composition.CO2 = 0.96;
      composition.N2 = 0.04;
    }
    
    const avgMolarMass = 29e-3; // kg/mol (roughly N₂)
    const pressure = 1e5; // Pa (1 bar, simplified)
    const scaleHeight = LAWS.physics.fluid.scaleHeight(temperature, avgMolarMass, LAWS.physics.gravity.surfaceGravity(mass, radius));
    
    return {
      pressure,
      composition,
      scaleHeight,
    };
  }
  
  /**
   * Assess habitability
   */
  private assessHabitability(
    inHZ: boolean,
    atmosphere: Planet['atmosphere'] | null,
    temperature: number,
    hasMagneticField: boolean,
    mass: number
  ): Planet['habitability'] {
    const hasLiquidWater = temperature > 273 && temperature < 373 && atmosphere !== null;
    const hasAtmosphere = atmosphere !== null;
    
    // Calculate score
    let score = 0;
    if (inHZ) score += 0.3;
    if (hasLiquidWater) score += 0.4;
    if (hasAtmosphere) score += 0.2;
    if (hasMagneticField) score += 0.1;
    
    return {
      inHabitableZone: inHZ,
      hasLiquidWater,
      hasAtmosphere,
      hasMagneticField,
      score,
    };
  }
}

/**
 * Generate universe from seed string
 */
export function generateUniverse(seed: string): Universe {
  const generator = new UniverseGenerator(seed);
  const universe = generator.generate();
  universe.seed = seed;
  return universe;
}
