import type { CosmicStage, StageCalculator } from '../types';

const YEAR = 31557600;

export class GalaxiesCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'galaxy-position',
        name: 'Galaxy Position Determination',
        description: 'Local galaxy position in cosmic web determines metal enrichment history.',
        timeStart: 1e9 * YEAR,
        timeEnd: 1.5e9 * YEAR,
        causalTrigger: 'Seed + expansion history + dark matter web',
        seedInfluence: ['galactic_radius', 'metallicity_gradient', 'rotation_curve'],
        constantsGenerated: [
          {
            name: 'distance_from_core',
            formula: 'R_gal = R_0 + seed_offset * σ_R',
            seedParameters: ['galactic_radius']
          },
          {
            name: 'metallicity',
            formula: 'Z = Z_☉ * 10^(seed_metallicity) * exp(-R/R_scale)',
            seedParameters: ['metallicity_gradient']
          },
          {
            name: 'orbital_velocity',
            formula: 'v_circ = sqrt(G * M(<R) / R)',
            seedParameters: ['rotation_curve']
          }
        ],
        visualCharacteristics: {
          particleCount: 10000,
          colorPalette: ['#ffaa00', '#ff8800', '#ff6600', '#ff4400'],
          scaleRange: [1e19, 1e21],
          cameraDistance: 1e22
        },
        audioCharacteristics: {
          frequencyRange: [200, 1000],
          waveform: 'sine',
          motif: 'Spatial panning (center = metal-rich higher tones)'
        },
        conservationLedger: {
          massEnergy: 'E_rotational = 0.5 * M * v^2',
          entropy: 'S determined by mixing history'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'distance_from_core':
        return 8000 * 9.461e15 * seedFactor;
      case 'metallicity':
        return 0.02 * seedFactor;
      case 'orbital_velocity':
        return 220000 * seedFactor;
      default:
        return null;
    }
  }
}
