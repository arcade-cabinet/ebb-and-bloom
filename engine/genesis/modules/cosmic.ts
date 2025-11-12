import { CosmicProfile } from '../types';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { PHYSICS_CONSTANTS } from '../../../agents/tables/physics-constants';
import { EnhancedRNG } from '../../utils/EnhancedRNG';

export function calculateCosmicConstants(context: GenesisSeedContext): CosmicProfile {
  const raw = context.getTimelineConstants();
  const rng = context.getScopedRNG('cosmic');

  const time_dilation = raw.time_dilation_constant || 1.0;
  const entropy_baseline = raw.entropy_baseline || PHYSICS_CONSTANTS.k_B * Math.log(1e120);
  const expansion_rate = raw.hubble_expansion_rate || 67.4;
  const cosmic_curvature = raw.cosmic_curvature || 0.0;
  
  const hydrogen_fraction = raw.hydrogen_fraction || 0.75;
  const helium_fraction = raw.helium_fraction || 0.25;
  const lithium_fraction = raw.lithium_fraction || 1e-10;
  
  const hubble_expansion_rate = raw.hubble_expansion_rate || 67.4;
  const dark_matter_density = raw.dark_matter_density || 0.268;
  const cmb_temperature = raw.cmb_temperature || 2.725;
  
  const pop3_imf_slope = raw.pop3_imf_slope || -2.35;
  const supernova_energy = raw.supernova_energy || 1e44;
  const iron_peak_yield = raw.iron_peak_yield || 0.1 * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  const distance_from_core = raw.distance_from_core || 8000 * 9.461e15;
  const metallicity = raw.metallicity || 0.02;
  const orbital_velocity = raw.orbital_velocity || 220000;
  
  const cloud_mass = raw.molecular_cloud_mass || 1e5 * PHYSICS_CONSTANTS.SOLAR_MASS;
  const dust_to_gas_ratio = raw.dust_fraction || 0.01;
  
  const cloud_temperature = calculateCloudTemperature(cloud_mass, dust_to_gas_ratio, rng);

  return {
    time_dilation,
    entropy_baseline,
    expansion_rate,
    cosmic_curvature,
    hydrogen_fraction,
    helium_fraction,
    lithium_fraction,
    hubble_expansion_rate,
    dark_matter_density,
    cmb_temperature,
    pop3_imf_slope,
    supernova_energy,
    iron_peak_yield,
    distance_from_core,
    metallicity,
    orbital_velocity,
    cloud_mass,
    dust_to_gas_ratio,
    cloud_temperature,
  };
}

function calculateCloudTemperature(cloudMass: number, dustToGasRatio: number, rng: EnhancedRNG): number {
  const massRatio = cloudMass / (1e5 * PHYSICS_CONSTANTS.SOLAR_MASS);
  const baseTemp = 10 + 20 * Math.log10(massRatio + 1);
  const dustCooling = dustToGasRatio * 5;
  const variation = rng.normal(0, 2);
  return Math.max(5, baseTemp - dustCooling + variation);
}
