import { StellarProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculateStellarConstants(context: GenesisSeedContext): StellarProfile {
  const raw = context.getTimelineConstants();
  const rng = context.getScopedRNG('stellar');

  const frost_line_radius = raw.frost_line_radius || 2.7 * PHYSICS_CONSTANTS.AU;
  const disk_mass = raw.disk_mass || 0.01 * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  const stellar_mass = calculateStellarMass(disk_mass);
  const stellar_luminosity = calculateStellarLuminosity(stellar_mass);
  const stellar_temperature = calculateStellarTemperature(stellar_luminosity, stellar_mass);
  
  const orbital_radius = raw.semi_major_axis || PHYSICS_CONSTANTS.AU;
  const angular_momentum = raw.specific_angular_momentum || 
    Math.sqrt(PHYSICS_CONSTANTS.G * stellar_mass * orbital_radius);
  
  const temperature_gradient = calculateTemperatureGradient(stellar_luminosity, frost_line_radius, rng);

  return {
    angular_momentum,
    stellar_mass,
    stellar_luminosity,
    stellar_temperature,
    frost_line_radius,
    disk_mass,
    temperature_gradient,
  };
}

function calculateStellarMass(diskMass: number): number {
  return diskMass * 100;
}

function calculateStellarLuminosity(stellarMass: number): number {
  const massRatio = stellarMass / PHYSICS_CONSTANTS.SOLAR_MASS;
  return PHYSICS_CONSTANTS.SOLAR_LUMINOSITY * Math.pow(massRatio, 3.5);
}

function calculateStellarTemperature(luminosity: number, mass: number): number {
  const massRatio = mass / PHYSICS_CONSTANTS.SOLAR_MASS;
  const radius = PHYSICS_CONSTANTS.SOLAR_RADIUS * Math.pow(massRatio, 0.8);
  
  const temp4 = luminosity / (4 * Math.PI * radius * radius * PHYSICS_CONSTANTS.σ);
  return Math.pow(temp4, 0.25);
}

function calculateTemperatureGradient(luminosity: number, frostLineRadius: number, rng: EnhancedRNG): number {
  const baseGradient = Math.sqrt(luminosity / PHYSICS_CONSTANTS.SOLAR_LUMINOSITY) / 
                       Math.pow(frostLineRadius / PHYSICS_CONSTANTS.AU, 0.5);
  const variation = rng.normal(0, 0.1);
  return Math.max(0.1, baseGradient * (1 + variation));
}
