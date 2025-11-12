import { PlanetaryProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculatePlanetaryConstants(context: GenesisSeedContext): PlanetaryProfile {
  const raw = context.getTimelineConstants();
  const rng = context.getScopedRNG('planetary');

  const planet_mass = raw.terrestrial_planet_mass || PHYSICS_CONSTANTS.EARTH_MASS;
  const orbital_radius = raw.semi_major_axis || PHYSICS_CONSTANTS.AU;
  const core_fraction = raw.core_fraction || 0.33;
  const magnetic_field = raw.magnetic_field || 50e-6;
  
  const planet_radius = calculatePlanetRadius(planet_mass, core_fraction);
  const gravity = calculateGravity(planet_mass, planet_radius);
  const mantle_fraction = calculateMantleFraction(core_fraction);
  const crust_thickness = calculateCrustThickness(planet_radius, core_fraction, rng);

  return {
    planet_mass,
    planet_radius,
    gravity,
    orbital_radius,
    core_fraction,
    mantle_fraction,
    crust_thickness,
    magnetic_field,
  };
}

function calculatePlanetRadius(mass: number, coreFraction: number): number {
  const densityRatio = 1.0 + 0.2 * (coreFraction - 0.33);
  const earthDensity = PHYSICS_CONSTANTS.EARTH_MASS / ((4/3) * Math.PI * Math.pow(PHYSICS_CONSTANTS.EARTH_RADIUS, 3));
  const planetDensity = earthDensity * densityRatio;
  
  return Math.pow((3 * mass) / (4 * Math.PI * planetDensity), 1/3);
}

function calculateGravity(mass: number, radius: number): number {
  return (PHYSICS_CONSTANTS.G * mass) / (radius * radius);
}

function calculateMantleFraction(coreFraction: number): number {
  const crustFraction = 0.01;
  return Math.max(0, 1.0 - coreFraction - crustFraction);
}

function calculateCrustThickness(planetRadius: number, coreFraction: number, rng: EnhancedRNG): number {
  const radiusKm = planetRadius / 1000;
  const baseThickness = radiusKm * 0.005 * (1 - coreFraction * 0.5);
  const variation = rng.normal(0, baseThickness * 0.2);
  return Math.max(5, baseThickness + variation);
}
