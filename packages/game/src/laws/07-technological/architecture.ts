/**
 * Architectural Engineering Laws
 * Structural mechanics, load-bearing, thermal design.
 */

export const StructuralMechanics = {
  maxSpan_m: (material: string, thickness_m: number): number => {
    const strengths: Record<string, number> = {
      wood: 90,
      stone: 130,
      steel: 500,
    };
    const strength_MPa = strengths[material] || 50;
    return Math.sqrt((strength_MPa * thickness_m) / 10);
  },

  columnCapacity_kg: (diameter_m: number, height_m: number, material: string): number => {
    const E_Pa = { wood: 1e10, stone: 5e10, steel: 2e11 }[material] || 1e10;
    const I = (Math.PI * Math.pow(diameter_m, 4)) / 64;
    const criticalLoad = (Math.pow(Math.PI, 2) * E_Pa * I) / Math.pow(height_m, 2);
    return criticalLoad / 9.81 / 4; // Safety factor 4
  },

  thermalMass_JK: (volume_m3: number, material: string): number => {
    const densities: Record<string, number> = { stone: 2400, wood: 600, mud: 1800 };
    const heatCapacities: Record<string, number> = { stone: 840, wood: 1700, mud: 900 };
    const density = densities[material] || 1000;
    const cp = heatCapacities[material] || 1000;
    return volume_m3 * density * cp;
  },
};

export const ArchitectureLaws = {
  structural: StructuralMechanics,
} as const;
