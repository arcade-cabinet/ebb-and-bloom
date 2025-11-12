import { GenesisSeedContext } from '../context/GenesisSeedContext';
import { 
  CosmicProfile, 
  StellarProfile, 
  PlanetaryProfile, 
  AtmosphericProfile, 
  ChemistryProfile, 
  DerivedProfile,
  GenesisConstantsData
} from '../types';
import { calculateCosmicConstants } from '../modules/cosmic';
import { calculateStellarConstants } from '../modules/stellar';
import { calculatePlanetaryConstants } from '../modules/planetary';
import { calculateAtmosphericConstants } from '../modules/atmospheric';
import { calculateChemistryConstants } from '../modules/chemistry';
import { calculateDerivedConstants } from '../modules/derived';

export class GenesisKernel {
  private context: GenesisSeedContext;
  private cache: Map<string, any>;

  constructor(context: GenesisSeedContext) {
    this.context = context;
    this.cache = new Map();
  }

  getProfile<T>(domain: string): T {
    if (this.cache.has(domain)) {
      return this.cache.get(domain) as T;
    }

    const profile = this.calculateProfile(domain);
    this.cache.set(domain, profile);
    return profile as T;
  }

  getAllConstants(): GenesisConstantsData {
    return {
      cosmic: this.getProfile<CosmicProfile>('cosmic'),
      stellar: this.getProfile<StellarProfile>('stellar'),
      planetary: this.getProfile<PlanetaryProfile>('planetary'),
      atmospheric: this.getProfile<AtmosphericProfile>('atmospheric'),
      chemistry: this.getProfile<ChemistryProfile>('chemistry'),
      derived: this.getProfile<DerivedProfile>('derived'),
    };
  }

  private calculateProfile(domain: string): any {
    switch (domain) {
      case 'cosmic':
        return calculateCosmicConstants(this.context);

      case 'stellar':
        return calculateStellarConstants(this.context);

      case 'planetary':
        return calculatePlanetaryConstants(this.context);

      case 'atmospheric': {
        const planetary = this.getProfile<PlanetaryProfile>('planetary');
        const stellar = this.getProfile<StellarProfile>('stellar');
        const cosmic = this.getProfile<CosmicProfile>('cosmic');
        return calculateAtmosphericConstants(
          this.context,
          planetary.planet_mass,
          stellar.stellar_temperature,
          planetary.orbital_radius,
          cosmic.metallicity,
          stellar.frost_line_radius
        );
      }

      case 'chemistry': {
        const stellar = this.getProfile<StellarProfile>('stellar');
        const planetary = this.getProfile<PlanetaryProfile>('planetary');
        const atmospheric = this.getProfile<AtmosphericProfile>('atmospheric');
        return calculateChemistryConstants(
          this.context,
          stellar.stellar_luminosity,
          planetary.orbital_radius,
          atmospheric.atmospheric_composition
        );
      }

      case 'derived': {
        const planetary = this.getProfile<PlanetaryProfile>('planetary');
        const stellar = this.getProfile<StellarProfile>('stellar');
        const atmospheric = this.getProfile<AtmosphericProfile>('atmospheric');
        const chemistry = this.getProfile<ChemistryProfile>('chemistry');
        return calculateDerivedConstants(
          this.context,
          planetary.gravity,
          planetary.planet_radius,
          planetary.orbital_radius,
          planetary.planet_mass,
          stellar.stellar_mass,
          stellar.stellar_luminosity,
          chemistry.solar_constant,
          atmospheric.atmospheric_pressure,
          atmospheric.atmospheric_composition
        );
      }

      default:
        throw new Error(`Unknown profile domain: ${domain}`);
    }
  }
}
