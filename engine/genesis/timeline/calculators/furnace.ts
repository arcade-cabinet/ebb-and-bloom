import type { CosmicStage, StageCalculator } from '../types';

export class FurnaceCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'nucleosynthesis',
        name: 'Big Bang Nucleosynthesis',
        description: 'Protons and neutrons fuse into first atomic nuclei. H, He, Li formed in first 3 minutes.',
        timeStart: 1,
        timeEnd: 180,
        causalTrigger: 'Temperature drops to ~10^9 K allowing nuclear binding',
        seedInfluence: ['neutron_proton_ratio', 'reaction_rates', 'primordial_abundances'],
        constantsGenerated: [
          {
            name: 'hydrogen_fraction',
            formula: 'X_H ≈ 0.75 * (1 + seed_variation * 0.01)',
            seedParameters: ['primordial_abundances']
          },
          {
            name: 'helium_fraction',
            formula: 'X_He ≈ 0.25 * (1 + seed_variation * 0.01)',
            seedParameters: ['primordial_abundances']
          },
          {
            name: 'lithium_fraction',
            formula: 'X_Li ≈ 10^-10 * seed_factor',
            seedParameters: ['primordial_abundances']
          },
          {
            name: 'deuterium_fraction',
            formula: 'X_D ≈ 2.5e-5 * seed_factor',
            seedParameters: ['primordial_abundances']
          }
        ],
        visualCharacteristics: {
          particleCount: 10000,
          colorPalette: ['#ffff00', '#ffee00', '#ffdd00', '#ffcc00'],
          scaleRange: [1e-15, 1e-14],
          cameraDistance: 1e-14
        },
        audioCharacteristics: {
          frequencyRange: [440, 880],
          waveform: 'sine',
          motif: 'Discrete harmonic tones representing nuclear binding energies'
        },
        conservationLedger: {
          massEnergy: 'E_binding = Δm * c^2 (mass defect)',
          entropy: 'S decreases locally (binding), increases globally (radiation)'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'hydrogen_fraction':
        return 0.75 * (1 + (seedFactor - 1.0) * 0.01);
      case 'helium_fraction':
        return 0.25 * (1 + (seedFactor - 1.0) * 0.01);
      case 'lithium_fraction':
        return 1e-10 * seedFactor;
      case 'deuterium_fraction':
        return 2.5e-5 * seedFactor;
      default:
        return null;
    }
  }
}
