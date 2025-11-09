/**
 * Structure Visual Generation
 * From materials + construction method → appearance
 */

import { Color3 } from '@babylonjs/core';

export class StructureVisuals {
  /**
   * Generate structure appearance
   */
  static generate(materials: string[], construction: string, age_years: number) {
    const primaryMaterial = materials[0];
    const color = this.materialColor(primaryMaterial, age_years);
    const geometry = this.constructionGeometry(construction);

    return {
      baseColor: color,
      roughness: this.weatheringRoughness(primaryMaterial, age_years),
      geometry,
      scale: this.structureScale(construction),
    };
  }

  /**
   * Material colors
   */
  private static materialColor(material: string, age_years: number): Color3 {
    const fresh: Record<string, Color3> = {
      wood: new Color3(0.65, 0.45, 0.3),
      stone: new Color3(0.55, 0.55, 0.5),
      mud: new Color3(0.6, 0.5, 0.4),
      thatch: new Color3(0.8, 0.75, 0.5),
      brick: new Color3(0.7, 0.4, 0.3),
    };

    const base = fresh[material] || fresh.stone;

    // Weathering darkens and grays
    const weathering = Math.min(1, age_years / 1000);
    const gray = 0.5;

    return Color3.Lerp(base, new Color3(gray, gray, gray), weathering * 0.4);
  }

  /**
   * Weathering increases roughness
   */
  private static weatheringRoughness(material: string, age_years: number): number {
    const baseRoughness = material === 'stone' ? 0.7 : material === 'wood' ? 0.8 : 0.6;
    const weathering = Math.min(1, age_years / 500);
    return Math.min(1, baseRoughness + weathering * 0.2);
  }

  /**
   * Construction method → geometric form
   */
  private static constructionGeometry(construction: string): string {
    const forms: Record<string, string> = {
      pit: 'excavated',
      'post-and-beam': 'rectangular',
      wattle: 'rounded',
      masonry: 'blocky',
      thatch: 'conical',
      platform: 'elevated',
    };
    return forms[construction] || 'rectangular';
  }

  /**
   * Structure scale
   */
  private static structureScale(construction: string): number {
    const scales: Record<string, number> = {
      windbreak: 1,
      hut: 2,
      house: 3,
      longhouse: 5,
      hall: 6,
    };
    return scales[construction] || 2;
  }
}
