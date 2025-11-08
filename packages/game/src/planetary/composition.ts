/**
 * Planetary Composition Engine
 * Query material at any point in 3D space
 */

import { PerlinNoise } from './noise.js';
import { EARTH_LIKE_LAYERS, type PlanetaryLayer, type MaterialDistribution } from './layers.js';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlanetaryPoint {
  position: Vector3;
  distanceFromCenter: number;
  radiusKm: number;
  layer: string;
  material: string;
  materialData: MaterialDistribution | null;
  temperature: number;
  pressure: number;
  state: 'solid' | 'liquid' | 'gas';
  depth: number;
}

export class PlanetaryComposition {
  private noise: PerlinNoise;
  private layers: PlanetaryLayer[];
  private planetRadius: number; // km

  constructor(seed: string, layers: PlanetaryLayer[] = EARTH_LIKE_LAYERS) {
    this.noise = new PerlinNoise(seed);
    this.layers = layers;
    this.planetRadius = layers[layers.length - 1].maxRadius;
  }

  /**
   * Query material at a specific 3D point
   * @param x - X coordinate in meters
   * @param y - Y coordinate in meters (up from center)
   * @param z - Z coordinate in meters
   */
  public queryPoint(x: number, y: number, z: number): PlanetaryPoint {
    // Calculate distance from center (origin at planet center)
    const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
    const radiusKm = distanceFromCenter / 1000;

    // Find which layer this radius falls into
    const layer = this.layers.find(
      (l) => radiusKm >= l.minRadius && radiusKm <= l.maxRadius
    );

    // If outside all layers, return void
    if (!layer) {
      return {
        position: { x, y, z },
        distanceFromCenter,
        radiusKm,
        layer: 'void',
        material: 'void',
        materialData: null,
        temperature: -270, // Near absolute zero
        pressure: 0,
        state: 'gas',
        depth: radiusKm - this.planetRadius,
      };
    }

    // Calculate temperature and pressure at this radius
    const temperature = layer.temperatureFunc(radiusKm);
    const pressure = layer.pressureFunc(radiusKm);

    // Select material using Perlin noise
    const material = this.selectMaterial(x, y, z, layer);

    return {
      position: { x, y, z },
      distanceFromCenter,
      radiusKm,
      layer: layer.name,
      material: material.type,
      materialData: material,
      temperature,
      pressure,
      state: layer.state,
      depth: this.planetRadius - radiusKm, // Depth from surface
    };
  }

  /**
   * Select material within a layer using noise
   */
  private selectMaterial(
    x: number,
    y: number,
    z: number,
    layer: PlanetaryLayer
  ): MaterialDistribution {
    // Use first material's noise scale as default
    const noiseScale = layer.materials[0]?.noiseScale || 100;

    // Get 3D Perlin noise value (-1 to 1)
    const noiseValue = this.noise.octaveNoise3D(
      x / noiseScale / 1000,
      y / noiseScale / 1000,
      z / noiseScale / 1000,
      4,
      0.5,
      2.0
    );

    // Normalize to 0-1
    const normalized = (noiseValue + 1) / 2;

    // Select material based on cumulative thresholds
    for (const mat of layer.materials) {
      if (normalized <= mat.noiseThreshold) {
        return mat;
      }
    }

    // Fallback to last material
    return layer.materials[layer.materials.length - 1];
  }

  /**
   * Query a vertical column from surface to core
   */
  public queryColumn(x: number, z: number, stepSize: number = 1000): PlanetaryPoint[] {
    const points: PlanetaryPoint[] = [];
    const maxRadius = this.planetRadius * 1000; // Convert to meters

    // Start from surface and go down to center
    for (let y = maxRadius; y >= 0; y -= stepSize) {
      const point = this.queryPoint(x, y, z);
      points.push(point);
    }

    return points;
  }

  /**
   * Query a 2D slice at a specific Y level
   */
  public querySlice(
    y: number,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    resolution: number = 1000
  ): PlanetaryPoint[][] {
    const grid: PlanetaryPoint[][] = [];

    for (let x = bounds.minX; x <= bounds.maxX; x += resolution) {
      const row: PlanetaryPoint[] = [];
      for (let z = bounds.minZ; z <= bounds.maxZ; z += resolution) {
        const point = this.queryPoint(x, y, z);
        row.push(point);
      }
      grid.push(row);
    }

    return grid;
  }

  /**
   * Get layer structure overview
   */
  public getLayerStructure() {
    return {
      radius: this.planetRadius,
      layers: this.layers.map((layer) => ({
        name: layer.name,
        radiusRange: [layer.minRadius, layer.maxRadius],
        depthRange: [
          this.planetRadius - layer.maxRadius,
          this.planetRadius - layer.minRadius,
        ],
        state: layer.state,
        temperatureRange: [
          layer.temperatureFunc(layer.minRadius),
          layer.temperatureFunc(layer.maxRadius),
        ],
        pressureRange: [
          layer.pressureFunc(layer.minRadius),
          layer.pressureFunc(layer.maxRadius),
        ],
        materials: layer.materials.map((m) => ({
          type: m.type,
          abundance: m.abundance,
          color: m.color,
          hardness: m.hardness,
          density: m.density,
          value: m.value,
        })),
      })),
    };
  }

  /**
   * Raycast from a point in a direction
   */
  public raycast(
    start: Vector3,
    direction: Vector3,
    maxDistance: number = this.planetRadius * 2 * 1000,
    stepSize: number = 1000
  ): PlanetaryPoint[] {
    const points: PlanetaryPoint[] = [];

    // Normalize direction
    const len = Math.sqrt(
      direction.x ** 2 + direction.y ** 2 + direction.z ** 2
    );
    const dir = {
      x: direction.x / len,
      y: direction.y / len,
      z: direction.z / len,
    };

    // March along ray
    for (let t = 0; t < maxDistance; t += stepSize) {
      const point = {
        x: start.x + dir.x * t,
        y: start.y + dir.y * t,
        z: start.z + dir.z * t,
      };

      const data = this.queryPoint(point.x, point.y, point.z);
      points.push(data);

      // Stop if we're outside the planet
      if (data.layer === 'void') {
        break;
      }
    }

    return points;
  }
}
