import { AtmosphericProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculateAtmosphericConstants(
  context: GenesisSeedContext,
  planetMass: number,
  stellarTemperature: number,
  orbitalRadius: number,
  metallicity: number,
  frostLineRadius: number
): AtmosphericProfile {
  const raw = context.getTimelineConstants();
  const rng = context.getScopedRNG('atmospheric');

  const ocean_mass_fraction = raw.ocean_mass_fraction || 0.0003;
  const atmospheric_pressure = raw.atmospheric_pressure || 101325;
  
  const atmospheric_composition = calculateAtmosphericComposition(
    metallicity,
    planetMass,
    stellarTemperature,
    orbitalRadius,
    rng
  );
  
  const water_delivery_rate = calculateWaterDeliveryRate(
    ocean_mass_fraction,
    planetMass,
    frostLineRadius,
    orbitalRadius,
    rng
  );
  
  const volatile_ratios = calculateVolatileRatios(
    frostLineRadius,
    orbitalRadius,
    metallicity,
    rng
  );

  return {
    ocean_mass_fraction,
    atmospheric_pressure,
    atmospheric_composition,
    water_delivery_rate,
    volatile_ratios,
  };
}

function calculateAtmosphericComposition(
  metallicity: number,
  _planetMass: number,
  stellarTemperature: number,
  orbitalRadius: number,
  rng: EnhancedRNG
): Record<string, number> {
  const tempFactor = Math.min(1.0, 6000 / stellarTemperature);
  const distanceFactor = Math.sqrt(PHYSICS_CONSTANTS.AU / orbitalRadius);
  
  const n2Base = 0.78 * (0.9 + metallicity * 5);
  const o2Base = 0.21 * tempFactor * distanceFactor;
  const co2Base = 0.0004 * (1 + (1 - tempFactor) * 100);
  const arBase = 0.009 * (1 + metallicity * 2);
  
  const variation = 0.05;
  const n2 = Math.max(0, n2Base + rng.normal(0, variation));
  const o2 = Math.max(0, o2Base + rng.normal(0, variation * 0.5));
  const co2 = Math.max(0, co2Base + rng.normal(0, variation * 0.1));
  const ar = Math.max(0, arBase + rng.normal(0, variation * 0.1));
  
  const total = n2 + o2 + co2 + ar;
  
  return {
    N2: n2 / total,
    O2: o2 / total,
    CO2: co2 / total,
    Ar: ar / total,
  };
}

function calculateWaterDeliveryRate(
  oceanMassFraction: number,
  planetMass: number,
  frostLineRadius: number,
  orbitalRadius: number,
  rng: EnhancedRNG
): number {
  const beyondFrostLine = orbitalRadius > frostLineRadius;
  const baseRate = oceanMassFraction * planetMass / (1e9 * 365.25 * 24 * 3600);
  
  const frostFactor = beyondFrostLine ? 10.0 : 0.1;
  const variation = rng.normal(0, baseRate * 0.3);
  
  return Math.max(0, baseRate * frostFactor + variation);
}

function calculateVolatileRatios(
  frostLineRadius: number,
  orbitalRadius: number,
  metallicity: number,
  rng: EnhancedRNG
): Record<string, number> {
  const beyondFrostLine = orbitalRadius > frostLineRadius;
  
  const h2oBase = beyondFrostLine ? 0.7 : 0.1;
  const co2Base = 0.15 * (1 + metallicity * 2);
  const nh3Base = beyondFrostLine ? 0.1 : 0.01;
  const ch4Base = beyondFrostLine ? 0.05 : 0.001;
  
  const variation = 0.05;
  const h2o = Math.max(0, h2oBase + rng.normal(0, variation));
  const co2 = Math.max(0, co2Base + rng.normal(0, variation));
  const nh3 = Math.max(0, nh3Base + rng.normal(0, variation * 0.5));
  const ch4 = Math.max(0, ch4Base + rng.normal(0, variation * 0.5));
  
  const total = h2o + co2 + nh3 + ch4;
  
  return {
    H2O: h2o / total,
    CO2: co2 / total,
    NH3: nh3 / total,
    CH4: ch4 / total,
  };
}
