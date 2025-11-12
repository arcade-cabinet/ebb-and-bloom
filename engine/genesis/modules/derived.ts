import { DerivedProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculateDerivedConstants(
  context: GenesisSeedContext,
  gravity: number,
  planetRadius: number,
  orbitalRadius: number,
  planetMass: number,
  stellarMass: number,
  stellarLuminosity: number,
  solarConstant: number,
  atmosphericPressure: number,
  atmosphericComposition: Record<string, number>
): DerivedProfile {
  const rng = context.getScopedRNG('derived');

  const escape_velocity = calculateEscapeVelocity(gravity, planetRadius);
  const hill_sphere = calculateHillSphere(orbitalRadius, planetMass, stellarMass);
  const { inner, outer } = calculateHabitableZone(stellarLuminosity);
  const tidal_locking_timescale = calculateTidalLockingTimescale(
    planetMass,
    planetRadius,
    orbitalRadius,
    stellarMass
  );
  const surface_temperature = calculateSurfaceTemperature(
    solarConstant,
    atmosphericPressure,
    atmosphericComposition,
    rng
  );

  return {
    escape_velocity,
    hill_sphere,
    habitable_zone_inner: inner,
    habitable_zone_outer: outer,
    tidal_locking_timescale,
    surface_temperature,
  };
}

function calculateEscapeVelocity(gravity: number, radius: number): number {
  return Math.sqrt(2 * gravity * radius);
}

function calculateHillSphere(orbitalRadius: number, planetMass: number, stellarMass: number): number {
  return orbitalRadius * Math.pow(planetMass / (3 * stellarMass), 1/3);
}

function calculateHabitableZone(stellarLuminosity: number): { inner: number; outer: number } {
  const luminosityRatio = stellarLuminosity / PHYSICS_CONSTANTS.SOLAR_LUMINOSITY;
  const inner = 0.95 * Math.sqrt(luminosityRatio) * PHYSICS_CONSTANTS.AU;
  const outer = 1.37 * Math.sqrt(luminosityRatio) * PHYSICS_CONSTANTS.AU;
  return { inner, outer };
}

function calculateTidalLockingTimescale(
  _planetMass: number,
  planetRadius: number,
  orbitalRadius: number,
  stellarMass: number
): number {
  const years = 365.25 * 24 * 3600;
  const factor = Math.pow(orbitalRadius / PHYSICS_CONSTANTS.AU, 6) / 
                 (Math.pow(stellarMass / PHYSICS_CONSTANTS.SOLAR_MASS, 2) * 
                  Math.pow(planetRadius / PHYSICS_CONSTANTS.EARTH_RADIUS, 5));
  return 1e10 * factor * years;
}

function calculateSurfaceTemperature(
  solarConstant: number,
  atmosphericPressure: number,
  atmosphericComposition: Record<string, number>,
  rng: EnhancedRNG
): number {
  const earthSolarConstant = 1361;
  const equilibriumTemp = 255 * Math.pow(solarConstant / earthSolarConstant, 0.25);
  
  const co2Level = atmosphericComposition.CO2 || 0.0004;
  const pressureRatio = atmosphericPressure / 101325;
  
  const greenhouseEffect = 33 * Math.log(1 + co2Level * 1000) * pressureRatio;
  const variation = rng.normal(0, 5);
  
  return equilibriumTemp + greenhouseEffect + variation;
}
