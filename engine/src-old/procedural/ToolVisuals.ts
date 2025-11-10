/**
 * Tool Visual Generation
 * From material composition + function → appearance
 */

import { Color3 } from '@babylonjs/core';
import { MaterialsScienceLaws } from '../laws/02-planetary/materials-science';

export class ToolVisuals {
  /**
   * Generate tool appearance from material + use
   */
  static generate(material: string, purpose: string, weathering: number) {
    const composition = this.materialComposition(material);
    const color = this.materialColor(material, weathering);
    const properties = this.materialProperties(material);

    return {
      baseColor: color,
      metallic: properties.metallic,
      roughness: properties.roughness + weathering * 0.3,
      shape: this.toolShape(purpose),
      wear: weathering,
    };
  }

  /**
   * Material composition lookup
   */
  private static materialComposition(material: string): Record<string, number> {
    const compositions: Record<string, Record<string, number>> = {
      stone: { Si: 0.28, O: 0.46, Al: 0.08, Fe: 0.05, other: 0.13 },
      bronze: { Cu: 0.88, Sn: 0.12 },
      iron: { Fe: 1.0 },
      steel: { Fe: 0.99, C: 0.01 },
      bone: { Ca: 0.35, P: 0.17, C: 0.25, O: 0.2, other: 0.03 },
      wood: { C: 0.5, O: 0.42, H: 0.06, N: 0.02 },
    };
    return compositions[material] || compositions.stone;
  }

  /**
   * Material color
   */
  private static materialColor(material: string, weathering: number): Color3 {
    const colors: Record<string, Color3> = {
      stone: new Color3(0.5, 0.5, 0.45),
      bronze: new Color3(0.8, 0.6, 0.3),
      iron: new Color3(0.6, 0.6, 0.6),
      steel: new Color3(0.7, 0.7, 0.75),
      bone: new Color3(0.9, 0.85, 0.8),
      wood: new Color3(0.6, 0.4, 0.25),
    };

    const base = colors[material] || colors.stone;

    // Weathering darkens
    const weatherFactor = 1 - weathering * 0.3;
    return new Color3(base.r * weatherFactor, base.g * weatherFactor, base.b * weatherFactor);
  }

  /**
   * Material physical properties
   */
  private static materialProperties(material: string) {
    return {
      metallic: ['bronze', 'iron', 'steel'].includes(material) ? 0.9 : 0.1,
      roughness: material === 'stone' ? 0.8 : material === 'bone' ? 0.6 : 0.3,
    };
  }

  /**
   * Tool shape from purpose
   */
  private static toolShape(purpose: string): string {
    const shapes: Record<string, string> = {
      cutting: 'blade',
      striking: 'hammerhead',
      piercing: 'point',
      scraping: 'edge',
      digging: 'scoop',
    };
    return shapes[purpose] || 'generic';
  }
}
