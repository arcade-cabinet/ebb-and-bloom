import type { CosmicStage, StageCalculator } from '../types';
import { PHYSICS_CONSTANTS } from '../../../../agents/tables/physics-constants';

const YEAR = 31557600;

export class AccretionCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'protoplanetary-disk',
        name: 'Protoplanetary Disk',
        description: 'Rotating disk flattens due to angular momentum conservation. Temperature gradient forms.',
        timeStart: 4.567e9 * YEAR,
        timeEnd: 4.567e9 * YEAR + 50000 * YEAR,
        causalTrigger: 'Conservation of angular momentum during collapse',
        seedInfluence: ['disk_mass', 'frost_line_position', 'temperature_profile'],
        constantsGenerated: [
          {
            name: 'disk_mass',
            formula: 'M_disk ≈ 0.01 M_☉ * seed_factor',
            seedParameters: ['disk_mass']
          },
          {
            name: 'frost_line_radius',
            formula: 'R_frost ≈ 2.7 AU * (L_*/L_☉)^0.5 * seed_variation',
            seedParameters: ['frost_line_position']
          },
          {
            name: 'temperature_at_1AU',
            formula: 'T(1AU) ≈ 280 K * (L_*/L_☉)^0.25 * seed_factor',
            seedParameters: ['temperature_profile']
          }
        ],
        visualCharacteristics: {
          particleCount: 100000,
          colorPalette: ['#ff6600', '#ff9900', '#ffcc00', '#ffff66'],
          scaleRange: [1e11, 1e13],
          cameraDistance: 1e12
        },
        audioCharacteristics: {
          frequencyRange: [100, 400],
          waveform: 'sine',
          motif: 'Orbital rhythms with temperature gradient pitch shifts'
        },
        conservationLedger: {
          massEnergy: 'E_rotational conserved, viscosity redistributes',
          entropy: 'S increases (viscous dissipation)'
        }
      },
      {
        id: 'planetary-accretion',
        name: 'Planetary Accretion',
        description: 'Planetesimals collide and grow into planets. Migration reshuffles orbital architecture.',
        timeStart: 4.567e9 * YEAR + 50000 * YEAR,
        timeEnd: 4.567e9 * YEAR + 100e6 * YEAR,
        causalTrigger: 'Particle collisions + gravitational focusing',
        seedInfluence: ['planet_masses', 'orbital_elements', 'migration_history'],
        constantsGenerated: [
          {
            name: 'terrestrial_planet_mass',
            formula: 'M_p = M_⊕ * 10^(seed_mass) (0.1 - 10 M_⊕)',
            seedParameters: ['planet_masses']
          },
          {
            name: 'semi_major_axis',
            formula: 'a = a_0 * seed_orbital * exp(migration_factor)',
            seedParameters: ['orbital_elements']
          },
          {
            name: 'eccentricity',
            formula: 'e = seed_ecc * exp(-t / τ_damp)',
            seedParameters: ['orbital_elements']
          }
        ],
        visualCharacteristics: {
          particleCount: 10000,
          colorPalette: ['#996633', '#cc9966', '#ffcc99', '#ffffff'],
          scaleRange: [1e6, 1e9],
          cameraDistance: 1e10
        },
        audioCharacteristics: {
          frequencyRange: [50, 500],
          waveform: 'percussion',
          motif: 'Impact percussion increasing in scale and decreasing in frequency'
        },
        conservationLedger: {
          massEnergy: 'E_collision = inelastic (heat dissipation)',
          entropy: 'S increases (impact heating)'
        }
      },
      {
        id: 'planetary-differentiation',
        name: 'Planetary Differentiation',
        description: 'Gravitational heating melts planet interior. Iron sinks to core, silicates float to mantle.',
        timeStart: 4.567e9 * YEAR + 100e6 * YEAR,
        timeEnd: 4.567e9 * YEAR + 200e6 * YEAR,
        causalTrigger: 'Gravitational heating + radioactive decay',
        seedInfluence: ['core_mass_fraction', 'magnetic_field_strength', 'heat_production'],
        constantsGenerated: [
          {
            name: 'core_fraction',
            formula: 'f_core = 0.33 * (1 + seed_variation * 0.1)',
            seedParameters: ['core_mass_fraction']
          },
          {
            name: 'magnetic_field',
            formula: 'B_surface ≈ sqrt(ρ_core * μ_0 * Ω) * seed_dynamo',
            seedParameters: ['magnetic_field_strength']
          },
          {
            name: 'heat_flow',
            formula: 'Q = 4πR^2 * k * dT/dr',
            seedParameters: ['heat_production']
          }
        ],
        visualCharacteristics: {
          particleCount: 5000,
          colorPalette: ['#ff0000', '#ff6600', '#ffcc00', '#666666'],
          scaleRange: [1e6, 1e7],
          cameraDistance: 1e7
        },
        audioCharacteristics: {
          frequencyRange: [20, 100],
          waveform: 'sine',
          motif: 'Rumbling bass representing core settling and convection'
        },
        conservationLedger: {
          massEnergy: 'E_gravitational → E_thermal (differentiation)',
          entropy: 'S increases (irreversible mixing)'
        }
      },
      {
        id: 'surface-and-life',
        name: 'Surface Formation & First Life',
        description: 'Late bombardment delivers volatiles. Oceans form, atmosphere stabilizes, prebiotic chemistry begins.',
        timeStart: 4.567e9 * YEAR + 200e6 * YEAR,
        timeEnd: 4.567e9 * YEAR + 800e6 * YEAR,
        causalTrigger: 'Late heavy bombardment + atmospheric evolution',
        seedInfluence: ['water_delivery', 'atmospheric_composition', 'prebiotic_molecules'],
        constantsGenerated: [
          {
            name: 'ocean_mass_fraction',
            formula: 'f_ocean = 0.0003 * seed_water (Earth ≈ 0.0003)',
            seedParameters: ['water_delivery']
          },
          {
            name: 'atmospheric_pressure',
            formula: 'P_0 = ρ_atm * g * H_scale * seed_pressure',
            seedParameters: ['atmospheric_composition']
          },
          {
            name: 'organic_carbon_concentration',
            formula: 'C_org = seed_organics * [Miller-Urey yield]',
            seedParameters: ['prebiotic_molecules']
          },
          {
            name: 'ph_value',
            formula: 'pH = 7 + seed_acidity * 2 (range 5-9)',
            seedParameters: ['atmospheric_composition']
          }
        ],
        visualCharacteristics: {
          particleCount: 20000,
          colorPalette: ['#0066cc', '#00cc66', '#66cc00', '#cccc00'],
          scaleRange: [1e3, 1e6],
          cameraDistance: 1e7
        },
        audioCharacteristics: {
          frequencyRange: [100, 1000],
          waveform: 'sine',
          motif: 'Bubbling chemistry transitioning to rhythmic bio-patterns'
        },
        conservationLedger: {
          massEnergy: 'E_chemical (organic synthesis) from solar radiation',
          entropy: 'S decreases locally (life), increases globally (2nd law)'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'disk_mass':
        return 0.01 * PHYSICS_CONSTANTS.SOLAR_MASS * seedFactor;
      case 'frost_line_radius':
        return 2.7 * PHYSICS_CONSTANTS.AU * seedFactor;
      case 'temperature_at_1AU':
        return 280 * seedFactor;
      case 'terrestrial_planet_mass':
        return PHYSICS_CONSTANTS.EARTH_MASS * Math.pow(10, (seedFactor - 1.0));
      case 'semi_major_axis':
        return PHYSICS_CONSTANTS.AU * seedFactor;
      case 'eccentricity':
        return 0.1 * seedFactor;
      case 'core_fraction':
        return 0.33 * (1 + (seedFactor - 1.0) * 0.1);
      case 'magnetic_field':
        return 50e-6 * seedFactor;
      case 'heat_flow':
        return 0.1 * seedFactor;
      case 'ocean_mass_fraction':
        return 0.0003 * seedFactor;
      case 'atmospheric_pressure':
        return 101325 * seedFactor;
      case 'organic_carbon_concentration':
        return 1e-6 * seedFactor;
      case 'ph_value':
        return 7 + (seedFactor - 1.0) * 2;
      default:
        return null;
    }
  }
}
