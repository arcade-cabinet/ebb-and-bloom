/**
 * Creature Visual Generation
 * From anatomy + tissue composition → complete visual
 */

import { Color3 } from '@babylonjs/core';
import { AnatomyLaws } from '../laws/04-biological/anatomy';

export class CreatureVisuals {
  /**
   * Generate creature appearance from biological properties
   */
  static generate(mass_kg: number, locomotion: string, diet: string, environment: string) {
    // Tissue composition (standard organic)
    const tissue = { O: 0.65, C: 0.18, H: 0.1, N: 0.03, Ca: 0.015, P: 0.01, other: 0.015 };

    // Base color from environment (camouflage)
    const baseColor = this.environmentalCamouflage(environment);

    // Body proportions from anatomy laws
    const proportions = this.calculateProportions(mass_kg, locomotion);

    // Surface type from environment
    const surface = this.surfaceType(environment, mass_kg);

    // Pigmentation (varies by species)
    const pigmentation = 0.5 + (mass_kg % 1); // Deterministic variation

    return {
      baseColor: Color3.Lerp(baseColor, new Color3(0.3, 0.25, 0.2), pigmentation),
      roughness: surface === 'scales' ? 0.3 : surface === 'fur' ? 0.9 : 0.6,
      proportions,
      surfaceType: surface,
    };
  }

  /**
   * Camouflage color from environment
   */
  private static environmentalCamouflage(env: string): Color3 {
    const colors: Record<string, Color3> = {
      desert: new Color3(0.85, 0.75, 0.6), // Sandy
      forest: new Color3(0.3, 0.4, 0.25), // Green-brown
      grassland: new Color3(0.7, 0.65, 0.4), // Tan
      ocean: new Color3(0.3, 0.4, 0.5), // Blue-gray
      tundra: new Color3(0.9, 0.9, 0.9), // White
      mountain: new Color3(0.5, 0.5, 0.45), // Gray-brown
    };
    return colors[env] || new Color3(0.6, 0.55, 0.5);
  }

  /**
   * Body proportions from locomotion type
   */
  private static calculateProportions(mass_kg: number, locomotion: string) {
    const limbLength = AnatomyLaws.skeletal.limbLength(mass_kg, locomotion);
    const bodyLength = Math.pow(mass_kg / 500, 1 / 3);
    const bodyRadius = bodyLength * 0.3;

    return {
      bodyLength,
      bodyRadius,
      limbLength,
      limbCount: locomotion === 'cursorial' ? 4 : locomotion === 'arboreal' ? 4 : 2,
      headSize: bodyRadius * 0.6,
    };
  }

  /**
   * Surface covering type
   */
  private static surfaceType(env: string, mass_kg: number): 'skin' | 'fur' | 'scales' | 'feathers' {
    if (env === 'ocean') return 'scales';
    if (mass_kg < 1) return 'feathers'; // Small = likely flyer
    if (env === 'tundra') return 'fur'; // Cold = insulation
    return 'skin';
  }
}
