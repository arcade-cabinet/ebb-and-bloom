/**
 * Level of Detail System
 * 10 zoom levels from cosmic to molecular.
 */

export enum ZoomLevel {
  COSMIC = 0,      // 10^9 ly - Observable universe
  SUPERCLUSTER = 1, // 10^8 ly - Galaxy clusters
  GALACTIC = 2,    // 10^5 ly - Galaxies
  STELLAR = 3,     // 10^2 ly - Star clusters
  SYSTEM = 4,      // 10 AU - Planetary systems
  PLANETARY = 5,   // 10^4 km - Planets
  REGIONAL = 6,    // 10^3 km - Continents
  LOCAL = 7,       // 10 km - Cities/landscapes
  GROUND = 8,      // 100 m - Creatures/structures
  DETAIL = 9,      // 1 m - Individual organisms
}

export class LODSystem {
  private currentLevel: ZoomLevel = ZoomLevel.GALACTIC;
  
  getLevelFromDistance(distance_m: number): ZoomLevel {
    const ly = distance_m / 9.461e15;
    if (ly > 1e9) return ZoomLevel.COSMIC;
    if (ly > 1e8) return ZoomLevel.SUPERCLUSTER;
    if (ly > 1e5) return ZoomLevel.GALACTIC;
    if (ly > 100) return ZoomLevel.STELLAR;
    if (distance_m > 1.496e12) return ZoomLevel.SYSTEM; // > 10 AU
    if (distance_m > 1e7) return ZoomLevel.PLANETARY; // > 10,000 km
    if (distance_m > 1e6) return ZoomLevel.REGIONAL; // > 1,000 km
    if (distance_m > 1e4) return ZoomLevel.LOCAL; // > 10 km
    if (distance_m > 100) return ZoomLevel.GROUND; // > 100 m
    return ZoomLevel.DETAIL;
  }
  
  shouldRender(objectType: string, level: ZoomLevel): boolean {
    const renderRules: Record<string, ZoomLevel[]> = {
      galaxy: [ZoomLevel.COSMIC, ZoomLevel.SUPERCLUSTER, ZoomLevel.GALACTIC],
      star: [ZoomLevel.GALACTIC, ZoomLevel.STELLAR, ZoomLevel.SYSTEM],
      planet: [ZoomLevel.SYSTEM, ZoomLevel.PLANETARY],
      terrain: [ZoomLevel.PLANETARY, ZoomLevel.REGIONAL, ZoomLevel.LOCAL],
      structure: [ZoomLevel.LOCAL, ZoomLevel.GROUND],
      creature: [ZoomLevel.GROUND, ZoomLevel.DETAIL],
      pointLight: [ZoomLevel.REGIONAL, ZoomLevel.LOCAL],
    };
    
    return renderRules[objectType]?.includes(level) || false;
  }
  
  getInstanceCount(level: ZoomLevel): number {
    const counts = [100, 500, 5000, 10000, 100, 1, 10, 1000, 10000, 50000];
    return counts[level];
  }
}

