import type { CosmicStage, StageCalculator } from '../types';
import { PHYSICS_CONSTANTS } from '../../../../agents/tables/physics-constants';

const YEAR = 31557600;

export class CloudsCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'molecular-cloud',
        name: 'Molecular Cloud Formation',
        description: 'Multiple supernova cycles enrich gas. Dense molecular clouds form from enriched material.',
        timeStart: 4e9 * YEAR,
        timeEnd: 4.5e9 * YEAR,
        causalTrigger: 'Enrichment cycles + thermal instability',
        seedInfluence: ['cloud_mass', 'dust_to_gas_ratio', 'chemical_abundances'],
        constantsGenerated: [
          {
            name: 'molecular_cloud_mass',
            formula: 'M_cloud ≈ 10^5 M_☉ * seed_factor',
            seedParameters: ['cloud_mass']
          },
          {
            name: 'dust_fraction',
            formula: 'f_dust = 0.01 * (Z/Z_☉) * seed_variation',
            seedParameters: ['dust_to_gas_ratio']
          },
          {
            name: 'carbon_oxygen_ratio',
            formula: 'C/O = 0.5 * seed_ratio',
            seedParameters: ['chemical_abundances']
          }
        ],
        visualCharacteristics: {
          particleCount: 20000,
          colorPalette: ['#330000', '#660000', '#990000', '#cc3300'],
          scaleRange: [1e15, 1e17],
          cameraDistance: 1e16
        },
        audioCharacteristics: {
          frequencyRange: [100, 500],
          waveform: 'sine',
          motif: 'Layered harmonics representing complex chemistry'
        },
        conservationLedger: {
          massEnergy: 'E_thermal balanced by radiative cooling',
          entropy: 'S decreases (cooling, condensation)'
        }
      },
      {
        id: 'cloud-collapse',
        name: 'Cloud Collapse Trigger',
        description: 'Nearby supernova shockwave compresses cloud, triggering gravitational collapse.',
        timeStart: 4.567e9 * YEAR - 50000 * YEAR,
        timeEnd: 4.567e9 * YEAR,
        causalTrigger: 'External shockwave + self-gravity',
        seedInfluence: ['angular_momentum', 'initial_spin', 'collapse_timescale'],
        constantsGenerated: [
          {
            name: 'specific_angular_momentum',
            formula: 'j = L / M = seed_factor * sqrt(G * M * R)',
            seedParameters: ['angular_momentum']
          },
          {
            name: 'rotation_period',
            formula: 'P_rot = 2π * sqrt(R^3 / (G * M)) * seed_spin',
            seedParameters: ['initial_spin']
          },
          {
            name: 'free_fall_time',
            formula: 't_ff = sqrt(3π / (32 G ρ))',
            seedParameters: ['collapse_timescale']
          }
        ],
        visualCharacteristics: {
          particleCount: 50000,
          colorPalette: ['#0033ff', '#0066ff', '#0099ff', '#00ccff'],
          scaleRange: [1e14, 1e16],
          cameraDistance: 1e15
        },
        audioCharacteristics: {
          frequencyRange: [50, 200],
          waveform: 'sine',
          motif: 'Impact trigger transitioning to rotational whoosh'
        },
        conservationLedger: {
          massEnergy: 'E_gravitational converts to E_kinetic + E_thermal',
          entropy: 'S increases (shock heating)'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'molecular_cloud_mass':
        return 1e5 * PHYSICS_CONSTANTS.SOLAR_MASS * seedFactor;
      case 'dust_fraction':
        return 0.01 * seedFactor;
      case 'carbon_oxygen_ratio':
        return 0.5 * seedFactor;
      case 'specific_angular_momentum':
        return 1e15 * seedFactor;
      case 'rotation_period':
        return 86400 * seedFactor;
      case 'free_fall_time':
        return 1e13 * seedFactor;
      default:
        return null;
    }
  }
}
