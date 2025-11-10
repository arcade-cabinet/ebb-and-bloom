/**
 * Enhanced Universe Generator using Scientific Computing Libraries
 *
 * Improvements over basic version:
 * - Proper statistical distributions (normal, power-law, Poisson)
 * - N-body gravity simulation for realistic orbits
 * - Stochastic variation in parameters
 * - Scientifically validated scaling relationships
 */

import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { STELLAR_LAWS } from '../laws/stellar.js';
import { PHYSICS_CONSTANTS as C } from '../laws/physics.js';

// Type definitions
export interface Star {
  mass: number;
  radius: number;
  luminosity: number;
  temperature: number;
  age: number;
  spectralType: string;
  luminosityClass: string;
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
  surfaceTemperature: number;
  composition: any;
  atmosphere: any;
  magneticField: number;
  rotationPeriod: number;
  axialTilt: number;
  habitability: any;
}

export interface Universe {
  seed: string;
  star: Star;
  planets: Planet[];
  habitablePlanet?: Planet;
  age: number;
}

export class EnhancedUniverseGenerator {
  private rng: EnhancedRNG;
  private seed: string;
  private useMonteCarloAccretion: boolean;

  constructor(seed: string, useMonteCarloAccretion = true) {
    this.rng = new EnhancedRNG(seed);
    this.seed = seed;
    this.useMonteCarloAccretion = useMonteCarloAccretion;
  }

  /**
   * Generate complete universe with enhanced physics
   */
  generate(): Universe {
    const star = this.generateStar();

    // Choose generation method
    const planets = this.useMonteCarloAccretion
      ? this.generatePlanetsWithMonteCarlo(star)
      : this.generatePlanetsWithNBody(star);

    const habitablePlanet = planets.find((p) => p.habitability.score > 0.5);

    return {
      seed: this.seed,
      star,
      planets,
      habitablePlanet,
      age: star.age,
    };
  }

  /**
   * Generate star using proper IMF (Salpeter/Kroupa)
   */
  private generateStar(): Star {
    // Use power-law distribution for IMF instead of uniform
    // Salpeter IMF: dN/dM ∝ M^(-2.35)
    const mass = this.rng.powerLaw(2.35, 0.08, 100);

    // Add slight variation to main-sequence relationships
    const massVariation = this.rng.normal(1.0, 0.05); // ±5% variation
    const adjustedMass = mass * massVariation;

    // Apply main sequence relationships
    const luminosity = LAWS.stellar.mainSequence.luminosity(adjustedMass);
    const radius = LAWS.stellar.mainSequence.radius(adjustedMass);
    const temperature = LAWS.stellar.mainSequence.temperature(adjustedMass);
    const lifetime = LAWS.stellar.mainSequence.lifetime(adjustedMass);

    // Use beta distribution for age (weighted toward younger stars)
    const ageRatio = this.rng.beta(2, 5); // Skewed toward 0
    const age = lifetime * ageRatio;

    const spectralType = LAWS.stellar.mainSequence.spectralType(temperature);
    const luminosityClass = LAWS.stellar.mainSequence.luminosityClass(adjustedMass, age, lifetime);

    return {
      mass: adjustedMass,
      radius,
      luminosity,
      temperature,
      age,
      spectralType,
      luminosityClass,
    };
  }

  /**
   * Generate planets with N-body simulation for realistic orbits
   */
  private generatePlanetsWithNBody(star: Star): Planet[] {
    // Use Poisson distribution for planet count (observed data)
    const lambda = 2.5; // Average planets per star
    const planetCount = Math.min(this.rng.poisson(lambda) + 1, 10);

    // Generate initial planet parameters
    const planetParams = [];
    let orbitRadius = 0.1 + this.rng.exponential(2); // Exponential spacing

    for (let i = 0; i < planetCount; i++) {
      // Log-normal distribution for mass (multiplicative process)
      const isBeyondFrostLine = orbitRadius > LAWS.stellar.condensation.frostLine(star.luminosity);
      const muLog = isBeyondFrostLine ? Math.log(50) : Math.log(1); // Gas giant vs rocky
      const sigmaLog = 1.5;
      const massEarths = this.rng.logNormal(muLog, sigmaLog);
      const mass = Math.max(0.01, Math.min(1000, massEarths)) * C.EARTH_MASS;

      // Eccentricity from beta distribution
      const eccentricity = this.rng.beta(1, 5); // Most orbits nearly circular

      planetParams.push({
        mass,
        radius: this.estimateRadius(mass, isBeyondFrostLine),
        orbitRadius,
        eccentricity,
      });

      // Next orbit with log-normal spacing
      const spacingFactor = this.rng.logNormal(Math.log(1.5), 0.3);
      orbitRadius *= spacingFactor;
    }

    // Initialize N-body system
    const bodies = initializePlanetarySystem(star.mass * C.SOLAR_MASS, planetParams);
    const simulator = new NBodySimulator(bodies);

    // Run simulation for short time to let orbits stabilize
    const yearInSeconds = 365.25 * 86400;
    const dt = yearInSeconds / 100; // 100 steps per year

    for (let i = 0; i < 100; i++) {
      simulator.step(dt);
    }

    // Extract final planet data
    const state = simulator.getState();
    const planets: Planet[] = [];

    state.bodies.forEach((body, idx) => {
      if (idx === 0) return; // Skip star

      const orbitRadiusAU =
        Math.sqrt(
          body.position[0] * body.position[0] +
            body.position[1] * body.position[1] +
            body.position[2] * body.position[2]
        ) / C.AU;

      const planet = this.createPlanetFromBody(body, star, orbitRadiusAU, idx - 1);
      planets.push(planet);
    });

    return planets.sort((a, b) => a.orbitalRadius - b.orbitalRadius);
  }

  /**
   * Generate planets using Monte Carlo accretion simulation
   * This is MORE realistic than N-body for planet formation
   */
  private generatePlanetsWithMonteCarlo(star: Star): Planet[] {
    const accretion = new MonteCarloAccretion(this.seed + '-accretion', star.mass);

    // Disk properties from stellar properties
    const diskMass = 0.01 * star.mass; // 1% of star mass (typical)
    const innerEdge = 0.05; // AU
    const outerEdge = 50; // AU
    const numProtoplanets = 200; // Start with many small bodies

    // Initialize protoplanetary disk
    const protoDisk = accretion.initializeDisk(diskMass, innerEdge, outerEdge, numProtoplanets);

    console.log(`[Accretion] Starting with ${numProtoplanets} protoplanets`);

    // Run Monte Carlo simulation
    const simulation = accretion.simulate(
      protoDisk,
      5000, // iterations
      10000 // years per iteration
    );

    console.log(
      `[Accretion] Finished after ${simulation.collisions} collisions, ${simulation.bodies.length} planets remain`
    );

    // Convert protoplanets to Planet objects
    const formattedPlanets = accretion.getFormattedPlanets(simulation);

    return formattedPlanets.map((p, i) => this.createPlanetFromProtoplanet(p, star, i));
  }

  /**
   * Create Planet from protoplanet simulation result
   */
  private createPlanetFromProtoplanet(proto: any, star: Star, index: number): Planet {
    const mass = proto.mass;
    const radius = proto.radius;
    const orbitRadiusAU = proto.orbit;
    const density = mass / ((4 / 3) * Math.PI * Math.pow(radius, 3));

    // Orbital mechanics
    const orbitalPeriod =
      LAWS.physics.orbital.period(orbitRadiusAU * C.AU, star.mass * C.SOLAR_MASS) /
      (365.25 * 86400); // Convert to years

    const surfaceGravity = LAWS.physics.gravity.surfaceGravity(mass, radius);
    const escapeVelocity = LAWS.physics.orbital.escapeVelocity(mass, radius);

    const temperature = LAWS.stellar.condensation.temperature(star.luminosity, orbitRadiusAU);

    const isGasGiant = proto.type === 'gas_giant';
    const composition = proto.composition;
    const atmosphere = this.generateAtmosphere(mass, radius, temperature, isGasGiant);

    const hasIronCore = !isGasGiant && composition.rock > 0.5;
    const magneticField = hasIronCore ? 1e-5 * (mass / C.EARTH_MASS) : 0;

    // Rotation from normal distribution
    const rotationPeriod = Math.abs(this.rng.normal(24, 12));
    const axialTilt = this.rng.beta(2, 2) * 90;

    const inHZ = LAWS.stellar.habitableZone.isHabitable(orbitRadiusAU, star.luminosity);
    const habitability = this.assessHabitability(
      inHZ,
      atmosphere,
      temperature,
      magneticField > 0,
      mass
    );

    return {
      name: proto.name || `Planet ${index + 1}`,
      mass,
      radius,
      density,
      orbitalRadius: orbitRadiusAU,
      orbitalPeriod,
      surfaceGravity,
      escapeVelocity,
      surfaceTemperature: temperature,
      composition: {
        core: {
          Fe: composition.rock * 0.3,
          Si: composition.rock * 0.3,
          other: composition.rock * 0.4,
        },
        mantle: { Si: composition.ice * 0.5, O: composition.ice * 0.5 },
        crust: { Si: 0.3, O: 0.5, other: 0.2 },
      },
      atmosphere,
      magneticField,
      rotationPeriod,
      axialTilt,
      habitability,
    };
  }

  /**
   * Estimate planet radius from mass and composition
   */
  private estimateRadius(mass: number, isGasGiant: boolean): number {
    if (isGasGiant) {
      // Gas giants: roughly constant radius (electron degeneracy)
      const jupiterMass = 1.898e27;
      const jupiterRadius = 6.9911e7;
      return jupiterRadius * Math.pow(mass / jupiterMass, 0.1);
    } else {
      // Rocky planets: R ∝ M^0.27
      return C.EARTH_RADIUS * Math.pow(mass / C.EARTH_MASS, 0.27);
    }
  }

  /**
   * Create Planet object from N-body simulation body
   */
  private createPlanetFromBody(
    body: any,
    star: Star,
    orbitRadiusAU: number,
    index: number
  ): Planet {
    const mass = body.mass;
    const radius = body.radius;
    const density = mass / ((4 / 3) * Math.PI * Math.pow(radius, 3));

    // Use actual N-body simulation results
    const velocityMag = Math.sqrt(
      body.velocity[0] * body.velocity[0] +
        body.velocity[1] * body.velocity[1] +
        body.velocity[2] * body.velocity[2]
    );

    const orbitalPeriod = (2 * Math.PI * orbitRadiusAU * C.AU) / velocityMag / (365.25 * 86400);

    const surfaceGravity = LAWS.physics.gravity.surfaceGravity(mass, radius);
    const escapeVelocity = LAWS.physics.orbital.escapeVelocity(mass, radius);

    const temperature = LAWS.stellar.condensation.temperature(star.luminosity, orbitRadiusAU);

    const isGasGiant = density < 2000; // kg/m³
    const composition = this.generateComposition(temperature, isGasGiant);
    const atmosphere = this.generateAtmosphere(mass, radius, temperature, isGasGiant);

    const hasIronCore = !isGasGiant && composition.core['Fe'] > 0.3;
    const magneticField = hasIronCore ? 1e-5 * (mass / C.EARTH_MASS) : 0;

    // Use normal distribution for rotation
    const rotationPeriod = Math.abs(this.rng.normal(24, 12)); // hours, ±12h variation
    const axialTilt = this.rng.beta(2, 2) * 90; // Beta distribution 0-90°

    const inHZ = LAWS.stellar.habitableZone.isHabitable(orbitRadiusAU, star.luminosity);
    const habitability = this.assessHabitability(
      inHZ,
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
      orbitalRadius: orbitRadiusAU,
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

  private generateComposition(_temperature: number, isGasGiant: boolean): any {
    if (isGasGiant) {
      return {
        core: { Fe: 0.3, Si: 0.3, Ni: 0.2, rock: 0.2 },
        mantle: { H: 0.75, He: 0.25 },
        crust: { H: 0.75, He: 0.25 },
      };
    }

    return {
      core: { Fe: 0.85, Ni: 0.15 },
      mantle: { Si: 0.4, O: 0.4, Mg: 0.15, other: 0.05 },
      crust: { Si: 0.3, O: 0.5, Al: 0.08, Fe: 0.05, other: 0.07 },
    };
  }

  private generateAtmosphere(
    mass: number,
    radius: number,
    temperature: number,
    isGasGiant: boolean
  ): any {
    const H2_mass = 2 * 1.67e-27;
    const canRetainH2 = LAWS.physics.fluid.canRetainGas(mass, radius, H2_mass, temperature);
    const surfaceGravity = LAWS.physics.gravity.surfaceGravity(mass, radius);

    if (!canRetainH2 && !isGasGiant) return null;

    if (isGasGiant) {
      return {
        pressure: 1e5,
        composition: { H: 0.75, He: 0.24, other: 0.01 },
        scaleHeight: LAWS.physics.fluid.scaleHeight(temperature, 2e-3, mass / (radius * radius)),
      };
    }

    let composition: any = {};
    if (temperature < 200) {
      composition = { N2: 0.5, CH4: 0.3, CO2: 0.2 };
    } else if (temperature < 350) {
      composition = { N2: 0.78, O2: 0.21, Ar: 0.01 };
    } else {
      composition = { CO2: 0.96, N2: 0.04 };
    }

    return {
      pressure: 1e5,
      composition,
      scaleHeight: LAWS.physics.fluid.scaleHeight(temperature, 29e-3, surfaceGravity),
    };
  }

  private assessHabitability(
    inHZ: boolean,
    atmosphere: any,
    temperature: number,
    hasMagneticField: boolean,
    _mass: number
  ): any {
    const hasLiquidWater = temperature > 273 && temperature < 373 && atmosphere !== null;
    const hasAtmosphere = atmosphere !== null;

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
 * Generate universe with enhanced physics
 */
export function generateEnhancedUniverse(seed: string): Universe {
  const generator = new EnhancedUniverseGenerator(seed);
  const universe = generator.generate();
  universe.seed = seed;
  return universe;
}
