import type { CosmicStage, StageCalculator } from '../types';
import { PHYSICS_CONSTANTS } from '../../../../agents/tables/physics-constants';

const YEAR = 31557600;

export class StarsCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'population-iii-stars',
        name: 'Population III Stars',
        description: 'First stars ignite in dark matter halos. Pure H/He composition, 100-1000 solar masses.',
        timeStart: 400e6 * YEAR,
        timeEnd: 500e6 * YEAR,
        causalTrigger: 'Dark matter halos reach critical mass (~10^6 M_☉)',
        seedInfluence: ['imf_slope', 'star_formation_efficiency', 'mass_range'],
        constantsGenerated: [
          {
            name: 'pop3_imf_slope',
            formula: 'α = -2.35 + seed_variation * 0.2 (Salpeter-like)',
            seedParameters: ['imf_slope']
          },
          {
            name: 'star_formation_efficiency',
            formula: 'ε_* = M_* / M_gas ≈ 0.01 * seed_factor',
            seedParameters: ['star_formation_efficiency']
          },
          {
            name: 'min_stellar_mass',
            formula: 'M_min ≈ 100 M_☉ * seed_factor',
            seedParameters: ['mass_range']
          }
        ],
        visualCharacteristics: {
          particleCount: 1000,
          colorPalette: ['#0000ff', '#3333ff', '#6666ff', '#9999ff'],
          scaleRange: [1e9, 1e11],
          cameraDistance: 1e12
        },
        audioCharacteristics: {
          frequencyRange: [220, 440],
          waveform: 'sine',
          motif: 'First harmonic overtones representing stellar fusion'
        },
        conservationLedger: {
          massEnergy: 'E_fusion = 0.007 * M_H * c^2 (H→He)',
          entropy: 'S increases (photon production)'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'pop3_imf_slope':
        return -2.35 + (seedFactor - 1.0) * 0.2;
      case 'star_formation_efficiency':
        return 0.01 * seedFactor;
      case 'min_stellar_mass':
        return 100 * PHYSICS_CONSTANTS.SOLAR_MASS * seedFactor;
      default:
        return null;
    }
  }
}
