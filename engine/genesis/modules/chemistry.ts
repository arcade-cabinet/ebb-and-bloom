import { ChemistryProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculateChemistryConstants(
  context: GenesisSeedContext,
  stellarLuminosity: number,
  orbitalRadius: number,
  atmosphericComposition: Record<string, number>
): ChemistryProfile {
  const raw = context.getTimelineConstants();
  const rng = context.getScopedRNG('chemistry');

  const ph_value = raw.ph_value || 7.0;
  const organic_carbon_concentration = raw.organic_carbon_concentration || 1e-6;
  
  const solar_constant = calculateSolarConstant(stellarLuminosity, orbitalRadius);
  const uv_index = calculateUVIndex(stellarLuminosity, orbitalRadius, rng);
  
  const amino_acid_formation_rate = calculateAminoAcidFormationRate(
    organic_carbon_concentration,
    atmosphericComposition,
    stellarLuminosity,
    orbitalRadius,
    rng
  );

  return {
    ph_value,
    organic_carbon_concentration,
    amino_acid_formation_rate,
    solar_constant,
    uv_index,
  };
}

function calculateSolarConstant(stellarLuminosity: number, orbitalRadius: number): number {
  return stellarLuminosity / (4 * Math.PI * orbitalRadius * orbitalRadius);
}

function calculateUVIndex(stellarLuminosity: number, orbitalRadius: number, rng: EnhancedRNG): number {
  const solarConstant = calculateSolarConstant(stellarLuminosity, orbitalRadius);
  const earthSolarConstant = PHYSICS_CONSTANTS.SOLAR_LUMINOSITY / 
    (4 * Math.PI * PHYSICS_CONSTANTS.AU * PHYSICS_CONSTANTS.AU);
  
  const ratio = solarConstant / earthSolarConstant;
  const baseUV = 5 * ratio;
  const variation = rng.normal(0, 1);
  
  return Math.max(0, baseUV + variation);
}

function calculateAminoAcidFormationRate(
  organicCarbonConcentration: number,
  atmosphericComposition: Record<string, number>,
  stellarLuminosity: number,
  orbitalRadius: number,
  rng: EnhancedRNG
): number {
  const co2Level = atmosphericComposition.CO2 || 0.0004;
  const energyFlux = stellarLuminosity / (4 * Math.PI * orbitalRadius * orbitalRadius);
  
  const earthFlux = PHYSICS_CONSTANTS.SOLAR_LUMINOSITY / (4 * Math.PI * PHYSICS_CONSTANTS.AU * PHYSICS_CONSTANTS.AU);
  const energyFactor = Math.sqrt(energyFlux / earthFlux);
  
  const baseRate = organicCarbonConcentration * co2Level * energyFactor * 1e-12;
  const variation = rng.normal(0, baseRate * 0.3);
  
  return Math.max(0, baseRate + variation);
}
