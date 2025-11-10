/**
 * Procedural Terrain from Geology Laws
 * No heightmaps. Pure calculation from plate tectonics + erosion.
 */

import { GeologyLaws } from '../laws/02-planetary/geology';
import { SoilScienceLaws } from '../laws/02-planetary/soil-science';

export class TerrainGenerator {
  generateFromGeology(
    planetRadius_m: number,
    tectonicPlates: number,
    volcanism_rate: number,
    erosion_rate: number,
    age_years: number
  ) {
    const vertices: Array<[number, number, number]> = [];
    const resolution = 100; // Points around sphere

    for (let lat = -90; lat <= 90; lat += 180 / resolution) {
      for (let lon = -180; lon <= 180; lon += 360 / resolution) {
        const elevation = this.calculateElevation(lat, lon, {
          tectonicPlates,
          volcanism_rate,
          erosion_rate,
          age_years,
        });

        const r = planetRadius_m + elevation;
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        vertices.push([x, y, z]);
      }
    }

    return vertices;
  }

  private calculateElevation(lat: number, lon: number, params: any): number {
    const plateBoundaryDist = this.distanceToNearestBoundary(lat, lon, params.tectonicPlates);
    const volcanicContrib = params.volcanism_rate / (1 + plateBoundaryDist);
    const erosionReduction = (params.erosion_rate * params.age_years) / 1e6;

    let elevation = volcanicContrib * 5000 - erosionReduction * 1000;
    elevation = Math.max(-11000, Math.min(8000, elevation));

    return elevation;
  }

  private distanceToNearestBoundary(lat: number, lon: number, plateCount: number): number {
    const boundarySpacing = 180 / plateCount;
    const distLat = Math.abs((lat % boundarySpacing) - boundarySpacing / 2);
    const distLon = Math.abs((lon % boundarySpacing) - boundarySpacing / 2);
    return Math.sqrt(distLat * distLat + distLon * distLon);
  }
}
