import type { CosmicStage, StageCalculator } from '../types';
import { PHYSICS_CONSTANTS } from '../../../../agents/tables/physics-constants';

const YEAR = 31557600;

export class SupernovaeCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'first-supernovae',
        name: 'First Supernovae',
        description: 'Pop III stars explode as pair-instability supernovae. ALL heavy elements created here.',
        timeStart: 500e6 * YEAR,
        timeEnd: 600e6 * YEAR,
        causalTrigger: 'Massive stars exhaust nuclear fuel',
        seedInfluence: ['explosion_energy', 'metal_yields', 'element_ratios'],
        constantsGenerated: [
          {
            name: 'supernova_energy',
            formula: 'E_SN ≈ 10^53 erg * seed_factor',
            seedParameters: ['explosion_energy']
          },
          {
            name: 'iron_peak_yield',
            formula: 'Y_Fe ≈ 0.1 M_☉ * seed_factor',
            seedParameters: ['metal_yields']
          },
          {
            name: 'alpha_element_ratio',
            formula: '[α/Fe] = log(N_α/N_Fe) * seed_variation',
            seedParameters: ['element_ratios']
          }
        ],
        visualCharacteristics: {
          particleCount: 50000,
          colorPalette: ['#ff0000', '#ff6600', '#ffcc00', '#ffffff'],
          scaleRange: [1e14, 1e17],
          cameraDistance: 1e16
        },
        audioCharacteristics: {
          frequencyRange: [100, 2000],
          waveform: 'percussion',
          motif: 'Explosive percussion with metallic resonances'
        },
        conservationLedger: {
          massEnergy: 'E_kinetic = gravitational binding energy',
          entropy: 'S increases (explosive mixing)'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'supernova_energy':
        return 1e44 * seedFactor;
      case 'iron_peak_yield':
        return 0.1 * PHYSICS_CONSTANTS.SOLAR_MASS * seedFactor;
      case 'alpha_element_ratio':
        return Math.log10(seedFactor);
      default:
        return null;
    }
  }
}
