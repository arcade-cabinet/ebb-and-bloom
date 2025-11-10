/**
 * STELLAR VISUAL BLUEPRINTS
 * 
 * Stars are NOT just yellow blobs!
 * Each star has color, size, and features based on ACTUAL physics:
 * - Spectral type (O, B, A, F, G, K, M)
 * - Temperature → Color (Wien's Law)
 * - Mass → Radius (mass-radius relation)
 * - Rotation, magnetic fields, coronae
 * 
 * POINT: Give stellar physics MEANING!
 */

import {
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Color3,
  Vector3,
  GlowLayer,
  Texture,
} from '@babylonjs/core';

/**
 * Spectral types (Harvard classification)
 */
export enum SpectralType {
  O = 'O', // Blue, >30,000 K
  B = 'B', // Blue-white, 10,000-30,000 K
  A = 'A', // White, 7,500-10,000 K
  F = 'F', // Yellow-white, 6,000-7,500 K
  G = 'G', // Yellow, 5,200-6,000 K (Sun)
  K = 'K', // Orange, 3,700-5,200 K
  M = 'M', // Red, 2,400-3,700 K
}

/**
 * Stellar visual blueprint
 */
export interface StellarBlueprint {
  spectralType: SpectralType;
  temperature: number;         // Kelvin
  mass: number;                // Solar masses
  radius: number;              // Solar radii
  color: Color3;               // Based on blackbody radiation
  luminosity: number;          // Solar luminosities
  rotation: number;            // Rotation period (days)
}

/**
 * Stellar Visual System
 * 
 * Creates scientifically accurate stellar representations
 */
export class StellarVisuals {
  /**
   * Create stellar blueprint from mass
   * Uses mass-temperature, mass-radius, mass-luminosity relations
   */
  static createBlueprint(massInSolarMasses: number): StellarBlueprint {
    // Mass-temperature relation (main sequence)
    // T ∝ M^0.5 for M < 1 M☉
    // T ∝ M^0.7 for M > 1 M☉
    const T_sun = 5778; // K
    let temperature: number;
    if (massInSolarMasses < 1) {
      temperature = T_sun * Math.pow(massInSolarMasses, 0.5);
    } else {
      temperature = T_sun * Math.pow(massInSolarMasses, 0.7);
    }

    // Determine spectral type from temperature
    const spectralType = this.getSpectralType(temperature);

    // Mass-radius relation (main sequence)
    // R ∝ M^0.8 for M < 1 M☉
    // R ∝ M^0.6 for M > 1 M☉
    let radius: number;
    if (massInSolarMasses < 1) {
      radius = Math.pow(massInSolarMasses, 0.8);
    } else {
      radius = Math.pow(massInSolarMasses, 0.6);
    }

    // Mass-luminosity relation
    // L ∝ M^3.5 for main sequence
    const luminosity = Math.pow(massInSolarMasses, 3.5);

    // Color from temperature (Wien's Law + blackbody)
    const color = this.temperatureToColor(temperature);

    // Rotation period (rough correlation with mass)
    // Massive stars rotate faster
    const rotation = 25 / massInSolarMasses; // Days (Sun rotates in 25 days)

    return {
      spectralType,
      temperature,
      mass: massInSolarMasses,
      radius,
      color,
      luminosity,
      rotation,
    };
  }

  /**
   * Get spectral type from temperature
   */
  private static getSpectralType(temp: number): SpectralType {
    if (temp >= 30000) return SpectralType.O;
    if (temp >= 10000) return SpectralType.B;
    if (temp >= 7500) return SpectralType.A;
    if (temp >= 6000) return SpectralType.F;
    if (temp >= 5200) return SpectralType.G;
    if (temp >= 3700) return SpectralType.K;
    return SpectralType.M;
  }

  /**
   * Convert temperature to color (blackbody radiation)
   * Uses Wien's Law and approximate RGB values
   */
  private static temperatureToColor(temp: number): Color3 {
    // Simplified blackbody → RGB conversion
    // Based on Mitchell Charity's algorithm

    // Normalize to 100-400 range
    const t = temp / 100;

    let r: number, g: number, b: number;

    // Red
    if (t <= 66) {
      r = 255;
    } else {
      r = Math.min(255, Math.max(0, 329.698727446 * Math.pow(t - 60, -0.1332047592)));
    }

    // Green
    if (t <= 66) {
      g = Math.min(255, Math.max(0, 99.4708025861 * Math.log(t) - 161.1195681661));
    } else {
      g = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(t - 60, -0.0755148492)));
    }

    // Blue
    if (t >= 66) {
      b = 255;
    } else if (t <= 19) {
      b = 0;
    } else {
      b = Math.min(255, Math.max(0, 138.5177312231 * Math.log(t - 10) - 305.0447927307));
    }

    return new Color3(r / 255, g / 255, b / 255);
  }

  /**
   * Render star with proper color, size, and glow
   * Size depends on camera zoom level for LOD
   */
  static renderStar(
    blueprint: StellarBlueprint,
    position: Vector3,
    scene: Scene,
    id: string,
    zoomLevel: 'cosmic' | 'galactic' | 'stellar' = 'galactic'
  ): Mesh {
    // Size varies by zoom level
    let visualSize: number;
    if (zoomLevel === 'cosmic') {
      // MASSIVE spheres for cosmic view (camera can be 1,000,000 units away!)
      // Need 1000-5000 unit spheres to be visible
      visualSize = 2000 + Math.log10(blueprint.luminosity + 1) * 500;
    } else if (zoomLevel === 'galactic') {
      // Medium size for galactic view
      visualSize = 100 + Math.log10(blueprint.radius + 1) * 20;
    } else {
      // Full size for stellar zoom  
      visualSize = 20 + Math.log10(blueprint.radius + 1) * 10;
    }

    const star = MeshBuilder.CreateSphere(
      `star-${id}`,
      {
        diameter: visualSize,
        segments: 16, // Reduce poly count for performance
      },
      scene
    );

    star.position = position;

    // MAXIMUM BRIGHTNESS emissive material (stars GLOW!)
    const mat = new StandardMaterial(`star-mat-${id}`, scene);
    mat.emissiveColor = blueprint.color; // FULL COLOR
    mat.diffuseColor = blueprint.color;
    mat.specularColor = new Color3(0, 0, 0); // No specular

    // NO brightness reduction - stars are always BRIGHT!
    // (Removed the scale reduction)

    star.material = mat;

    // Add rotation (stars spin!)
    star.metadata = {
      rotationSpeed: (2 * Math.PI) / (blueprint.rotation * 86400), // rad/s
      spectralType: blueprint.spectralType,
      temperature: blueprint.temperature,
    };

    return star;
  }

  /**
   * Animate star (rotation)
   */
  static animateStar(star: Mesh, delta: number): void {
    if (star.metadata && star.metadata.rotationSpeed) {
      star.rotation.y += star.metadata.rotationSpeed * delta;
    }
  }

  /**
   * Get stellar description for HUD
   */
  static getDescription(blueprint: StellarBlueprint): string[] {
    return [
      `Type: ${blueprint.spectralType} (${this.getSpectralDescription(blueprint.spectralType)})`,
      `Temp: ${blueprint.temperature.toFixed(0)} K`,
      `Mass: ${blueprint.mass.toFixed(2)} M☉`,
      `Radius: ${blueprint.radius.toFixed(2)} R☉`,
      `Luminosity: ${blueprint.luminosity.toFixed(1)} L☉`,
    ];
  }

  private static getSpectralDescription(type: SpectralType): string {
    switch (type) {
      case SpectralType.O:
        return 'Blue Giant';
      case SpectralType.B:
        return 'Blue-White';
      case SpectralType.A:
        return 'White';
      case SpectralType.F:
        return 'Yellow-White';
      case SpectralType.G:
        return 'Yellow (Sun-like)';
      case SpectralType.K:
        return 'Orange';
      case SpectralType.M:
        return 'Red Dwarf';
    }
  }
}

