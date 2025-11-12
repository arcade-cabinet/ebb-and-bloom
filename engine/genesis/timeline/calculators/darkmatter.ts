import type { CosmicStage, StageCalculator } from '../types';

const YEAR = 31557600;

export class DarkMatterCalculator implements StageCalculator {
  getStages(): CosmicStage[] {
    return [
      {
        id: 'recombination',
        name: 'Recombination Era',
        description: 'Electrons bind to nuclei forming neutral atoms. Universe becomes transparent to light.',
        timeStart: 380000 * YEAR,
        timeEnd: 400000 * YEAR,
        causalTrigger: 'Temperature drops to 3000K (0.26 eV)',
        seedInfluence: ['ionization_history', 'acoustic_peaks', 'cmb_temperature_seed'],
        constantsGenerated: [
          {
            name: 'cmb_temperature',
            formula: 'T_CMB ≈ 2.725 K * (1 + seed_variation * 0.001)',
            seedParameters: ['cmb_temperature_seed']
          },
          {
            name: 'sound_horizon',
            formula: 'r_s = ∫ c_s dt / a(t)',
            seedParameters: ['acoustic_peaks']
          },
          {
            name: 'photon_mean_free_path',
            formula: 'λ_mfp = (n_e * σ_T)^-1 → ∞',
            seedParameters: ['ionization_history']
          }
        ],
        visualCharacteristics: {
          particleCount: 5000,
          colorPalette: ['#ff6600', '#ff9933', '#ffcc66', '#ffffff'],
          scaleRange: [1e20, 1e23],
          cameraDistance: 1e22
        },
        audioCharacteristics: {
          frequencyRange: [2000, 8000],
          waveform: 'sine',
          motif: 'Sudden clarity as high frequencies emerge (transparency)'
        },
        conservationLedger: {
          massEnergy: 'E_photons decouples from E_matter',
          entropy: 'S_photons = constant (free streaming)'
        }
      },
      {
        id: 'dark-matter-web',
        name: 'Dark Matter Web Formation',
        description: 'Dark matter collapses into filamentary cosmic web under gravity. Seeds for all galaxies.',
        timeStart: 200e6 * YEAR,
        timeEnd: 400e6 * YEAR,
        causalTrigger: 'Gravitational instability amplifies density perturbations',
        seedInfluence: ['web_topology', 'halo_mass_function', 'filament_density'],
        constantsGenerated: [
          {
            name: 'dark_matter_density',
            formula: 'Ω_DM ≈ 0.268 * (1 + seed_variation * 0.01)',
            seedParameters: ['halo_mass_function']
          },
          {
            name: 'structure_formation_scale',
            formula: 'λ_Jeans = c_s * sqrt(π / (G * ρ))',
            seedParameters: ['filament_density']
          },
          {
            name: 'cosmic_web_connectivity',
            formula: 'κ = N_filaments / N_nodes',
            seedParameters: ['web_topology']
          }
        ],
        visualCharacteristics: {
          particleCount: 100000,
          colorPalette: ['#000033', '#000066', '#000099', '#0000cc'],
          scaleRange: [1e22, 1e25],
          cameraDistance: 1e24
        },
        audioCharacteristics: {
          frequencyRange: [20, 100],
          waveform: 'sine',
          motif: 'Deep gravitational bass representing structure formation'
        },
        conservationLedger: {
          massEnergy: 'E_kinetic converts to E_gravitational (virialisation)',
          entropy: 'S decreases locally (clumping), increases globally'
        }
      }
    ];
  }

  evaluateConstant(constantName: string, seedFactor: number): number | null {
    switch (constantName) {
      case 'cmb_temperature':
        return 2.725 * (1 + (seedFactor - 1.0) * 0.001);
      case 'sound_horizon':
        return 147 * seedFactor;
      case 'photon_mean_free_path':
        return 1e26 * seedFactor;
      case 'dark_matter_density':
        return 0.268 * (1 + (seedFactor - 1.0) * 0.01);
      case 'structure_formation_scale':
        return 1e21 * seedFactor;
      case 'cosmic_web_connectivity':
        return 3.5 * seedFactor;
      default:
        return null;
    }
  }
}
