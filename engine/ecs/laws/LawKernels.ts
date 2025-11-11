import * as chemicaltools from 'chemicaltools';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { PERIODIC_TABLE } from '../../../agents/tables/periodic-table';

export const gravityForce = (m1: number, m2: number, r: number): number => {
  if (r === 0) return 0;
  const force = (PHYSICS_CONSTANTS.G * m1 * m2) / (r * r);
  return force;
};

export const gravitationalPotentialEnergy = (m1: number, m2: number, r: number): number => {
  if (r === 0) return 0;
  return -(PHYSICS_CONSTANTS.G * m1 * m2) / r;
};

export const escapeVelocity = (mass: number, radius: number): number => {
  return Math.sqrt((2 * PHYSICS_CONSTANTS.G * mass) / radius);
};

export const orbitalVelocity = (centralMass: number, radius: number): number => {
  return Math.sqrt((PHYSICS_CONSTANTS.G * centralMass) / radius);
};

export const calculateMolecularMass = (formula: string): number => {
  try {
    const result = chemicaltools.calculateMass(formula);
    return result.mass;
  } catch (error) {
    console.warn(`Failed to calculate molecular mass for ${formula}:`, error);
    return 0;
  }
};

export const calculateMolecularMassFromElements = (elementCounts: Record<string, number>): number => {
  let totalMass = 0;
  for (const [symbol, count] of Object.entries(elementCounts)) {
    const element = PERIODIC_TABLE[symbol];
    if (element) {
      totalMass += element.atomicMass * count;
    }
  }
  return totalMass;
};

export const bondEnergy = (element1: string, element2: string): number => {
  const elem1 = PERIODIC_TABLE[element1];
  if (!elem1 || !elem1.bondEnergies) return 0;
  return elem1.bondEnergies[element2] || 0;
};

export const ionizationEnergy = (element: string): number => {
  const elem = PERIODIC_TABLE[element];
  return elem?.ionizationEnergy || 0;
};

export const stellarLuminosity = (starMass: number): number => {
  const solarMasses = starMass / PHYSICS_CONSTANTS.SOLAR_MASS;
  return Math.pow(solarMasses, 3.5) * PHYSICS_CONSTANTS.SOLAR_LUMINOSITY;
};

export const stellarLifetime = (starMass: number): number => {
  const solarMasses = starMass / PHYSICS_CONSTANTS.SOLAR_MASS;
  const lifetimeYears = 1e10 / Math.pow(solarMasses, 2.5);
  return lifetimeYears * 365.25 * 24 * 3600;
};

export const schwarzschildRadius = (mass: number): number => {
  return (2 * PHYSICS_CONSTANTS.G * mass) / (PHYSICS_CONSTANTS.c * PHYSICS_CONSTANTS.c);
};

export const maxwellBoltzmannSpeed = (mass: number, temperature: number): number => {
  return Math.sqrt((2 * PHYSICS_CONSTANTS.k_B * temperature) / mass);
};

export const thermalEnergy = (temperature: number): number => {
  return (3/2) * PHYSICS_CONSTANTS.k_B * temperature;
};

export const blackBodyRadiation = (temperature: number, surfaceArea: number): number => {
  return PHYSICS_CONSTANTS.σ * Math.pow(temperature, 4) * surfaceArea;
};

export const stefanBoltzmannLaw = (temperature: number): number => {
  return PHYSICS_CONSTANTS.σ * Math.pow(temperature, 4);
};

export const idealGasPressure = (n: number, volume: number, temperature: number): number => {
  return (n * PHYSICS_CONSTANTS.R * temperature) / volume;
};

export const kineticEnergy = (mass: number, velocity: { x: number; y: number; z: number }): number => {
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  return 0.5 * mass * speed * speed;
};

export const momentum = (mass: number, velocity: { x: number; y: number; z: number }): { x: number; y: number; z: number } => {
  return {
    x: mass * velocity.x,
    y: mass * velocity.y,
    z: mass * velocity.z,
  };
};

export const coulombForce = (q1: number, q2: number, r: number): number => {
  if (r === 0) return 0;
  const k = 1 / (4 * Math.PI * PHYSICS_CONSTANTS.epsilon_0);
  return (k * q1 * q2) / (r * r);
};

export const electricPotentialEnergy = (q1: number, q2: number, r: number): number => {
  if (r === 0) return 0;
  const k = 1 / (4 * Math.PI * PHYSICS_CONSTANTS.epsilon_0);
  return (k * q1 * q2) / r;
};

export const planckEnergy = (frequency: number): number => {
  return PHYSICS_CONSTANTS.h * frequency;
};

export const deBroglieWavelength = (mass: number, velocity: number): number => {
  return PHYSICS_CONSTANTS.h / (mass * velocity);
};

export const relativisticMass = (restMass: number, velocity: number): number => {
  const beta = velocity / PHYSICS_CONSTANTS.c;
  return restMass / Math.sqrt(1 - beta * beta);
};

export const relativisticEnergy = (mass: number, velocity: number): number => {
  const beta = velocity / PHYSICS_CONSTANTS.c;
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return gamma * mass * PHYSICS_CONSTANTS.c * PHYSICS_CONSTANTS.c;
};

export const heatCapacity = (element: string, amount: number): number => {
  const elem = PERIODIC_TABLE[element];
  if (!elem) return 0;
  return elem.heatCapacity * amount;
};

export const thermalConductivity = (element: string): number => {
  const elem = PERIODIC_TABLE[element];
  return elem?.thermalConductivity || 0;
};

export const phaseTransitionEnergy = (element: string, mass: number, transition: 'melt' | 'boil'): number => {
  const elem = PERIODIC_TABLE[element];
  if (!elem) return 0;
  
  const moles = mass / elem.atomicMass;
  const latentHeat = transition === 'melt' ? 6000 : 40000;
  return latentHeat * moles;
};

export const arrhenius = (
  activationEnergy: number,
  temperature: number,
  preExponentialFactor: number = 1e13
): number => {
  return preExponentialFactor * Math.exp(-activationEnergy / (PHYSICS_CONSTANTS.R * temperature));
};

export const diffusionCoefficient = (temperature: number, particleRadius: number, fluidViscosity: number): number => {
  return (PHYSICS_CONSTANTS.k_B * temperature) / (6 * Math.PI * fluidViscosity * particleRadius);
};

export const reynoldsNumber = (density: number, velocity: number, length: number, viscosity: number): number => {
  return (density * velocity * length) / viscosity;
};

export const hillEquation = (substrate: number, km: number, hillCoefficient: number): number => {
  return Math.pow(substrate, hillCoefficient) / (Math.pow(km, hillCoefficient) + Math.pow(substrate, hillCoefficient));
};

export const logisticGrowth = (population: number, carryingCapacity: number, growthRate: number): number => {
  return growthRate * population * (1 - population / carryingCapacity);
};

export const lotkaVolterraPreyGrowth = (
  preyPopulation: number,
  predatorPopulation: number,
  preyGrowthRate: number,
  predationRate: number
): number => {
  return preyGrowthRate * preyPopulation - predationRate * preyPopulation * predatorPopulation;
};

export const lotkaVolterraPredatorGrowth = (
  preyPopulation: number,
  predatorPopulation: number,
  conversionEfficiency: number,
  predatorDeathRate: number,
  predationRate: number
): number => {
  return conversionEfficiency * predationRate * preyPopulation * predatorPopulation - predatorDeathRate * predatorPopulation;
};

export const kleiber = (mass: number): number => {
  return 70 * Math.pow(mass, 0.75);
};

export const metabolicRate = (mass: number, temperature: number, referenceTemp: number = 310): number => {
  const basalRate = kleiber(mass);
  const temperatureEffect = Math.exp(0.05 * (temperature - referenceTemp));
  return basalRate * temperatureEffect;
};

export const ficksDiffusion = (
  concentration1: number,
  concentration2: number,
  distance: number,
  diffusionCoef: number
): number => {
  return diffusionCoef * (concentration1 - concentration2) / distance;
};

export const entropyChange = (heat: number, temperature: number): number => {
  return heat / temperature;
};

export const gibbsFreeEnergy = (enthalpy: number, temperature: number, entropy: number): number => {
  return enthalpy - temperature * entropy;
};

export const chemicalEquilibrium = (kForward: number, kReverse: number): number => {
  return kForward / kReverse;
};
