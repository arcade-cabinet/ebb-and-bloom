import { EnhancedRNG } from '../../utils/EnhancedRNG';
import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { GenesisKernel } from '../core/GenesisKernel';
import { CosmicProvenanceTimeline } from '../timeline/CosmicProvenanceTimeline';
import { 
  CosmicProfile, 
  StellarProfile, 
  PlanetaryProfile, 
  AtmosphericProfile, 
  ChemistryProfile, 
  DerivedProfile 
} from '../types';

export class GenesisFacade {
  private kernel: GenesisKernel;
  private context: GenesisSeedContext;

  constructor(masterRNG: EnhancedRNG, baseSeed?: string) {
    this.context = new GenesisSeedContext(masterRNG, baseSeed);
    this.kernel = new GenesisKernel(this.context);
  }

  getTimeline(): CosmicProvenanceTimeline {
    return this.context.getTimeline();
  }

  getGravity(): number {
    return this.kernel.getProfile<PlanetaryProfile>('planetary').gravity;
  }

  getMetallicity(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').metallicity;
  }

  getSurfaceTemperature(): number {
    return this.kernel.getProfile<DerivedProfile>('derived').surface_temperature;
  }

  getPlanetMass(): number {
    return this.kernel.getProfile<PlanetaryProfile>('planetary').planet_mass;
  }

  getPlanetRadius(): number {
    return this.kernel.getProfile<PlanetaryProfile>('planetary').planet_radius;
  }

  getStellarMass(): number {
    return this.kernel.getProfile<StellarProfile>('stellar').stellar_mass;
  }

  getStellarLuminosity(): number {
    return this.kernel.getProfile<StellarProfile>('stellar').stellar_luminosity;
  }

  getOrbitalRadius(): number {
    return this.kernel.getProfile<PlanetaryProfile>('planetary').orbital_radius;
  }

  getAtmosphericPressure(): number {
    return this.kernel.getProfile<AtmosphericProfile>('atmospheric').atmospheric_pressure;
  }

  getAtmosphericComposition(): Record<string, number> {
    return this.kernel.getProfile<AtmosphericProfile>('atmospheric').atmospheric_composition;
  }

  getHydrogenFraction(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').hydrogen_fraction;
  }

  getHeliumFraction(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').helium_fraction;
  }

  getEscapeVelocity(): number {
    return this.kernel.getProfile<DerivedProfile>('derived').escape_velocity;
  }

  getHabitableZoneInner(): number {
    return this.kernel.getProfile<DerivedProfile>('derived').habitable_zone_inner;
  }

  getHabitableZoneOuter(): number {
    return this.kernel.getProfile<DerivedProfile>('derived').habitable_zone_outer;
  }

  getCMBTemperature(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').cmb_temperature;
  }

  getDarkMatterDensity(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').dark_matter_density;
  }

  getExpansionRate(): number {
    return this.kernel.getProfile<CosmicProfile>('cosmic').expansion_rate;
  }

  getPhValue(): number {
    return this.kernel.getProfile<ChemistryProfile>('chemistry').ph_value;
  }

  getSolarConstant(): number {
    return this.kernel.getProfile<ChemistryProfile>('chemistry').solar_constant;
  }

  getMagneticField(): number {
    return this.kernel.getProfile<PlanetaryProfile>('planetary').magnetic_field;
  }

  getOceanMassFraction(): number {
    return this.kernel.getProfile<AtmosphericProfile>('atmospheric').ocean_mass_fraction;
  }

  getAllConstants() {
    return this.kernel.getAllConstants();
  }
}
