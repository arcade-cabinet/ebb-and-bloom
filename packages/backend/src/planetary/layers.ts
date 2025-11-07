/**
 * Planetary Layer Definitions
 * Mathematical model of concentric spherical layers
 */

export interface MaterialDistribution {
  type: string;
  abundance: number;      // 0-1 (percentage)
  noiseScale: number;     // Spatial variation scale
  noiseThreshold: number; // Cumulative threshold for selection
  color: string;          // Hex color for visualization
  hardness: number;       // Mohs scale (1-10)
  density: number;        // g/cm³
  value: number;          // Game value (0-10)
}

export interface PlanetaryLayer {
  name: string;
  minRadius: number;      // km from center
  maxRadius: number;      // km from center
  state: 'solid' | 'liquid' | 'gas';
  materials: MaterialDistribution[];
  temperatureFunc: (radius: number) => number;  // Celsius
  pressureFunc: (radius: number) => number;     // bar
}

/**
 * Earth-like planetary composition
 * Radius: 6371 km
 */
export const EARTH_LIKE_LAYERS: PlanetaryLayer[] = [
  // INNER CORE (0-1220 km)
  {
    name: 'inner_core',
    minRadius: 0,
    maxRadius: 1220,
    state: 'solid',
    materials: [
      {
        type: 'iron',
        abundance: 0.85,
        noiseScale: 100,
        noiseThreshold: 0.85,
        color: '#B87333',
        hardness: 10,
        density: 13.0,
        value: 10,
      },
      {
        type: 'nickel',
        abundance: 0.15,
        noiseScale: 100,
        noiseThreshold: 1.0,
        color: '#C0C0C0',
        hardness: 9,
        density: 8.9,
        value: 9,
      },
    ],
    temperatureFunc: (r) => 5200 + (r / 1220) * 200, // 5200-5400°C
    pressureFunc: (r) => 3640000 - (r / 1220) * 280000, // 3.64-3.36M bar
  },

  // OUTER CORE (1220-3400 km)
  {
    name: 'outer_core',
    minRadius: 1220,
    maxRadius: 3400,
    state: 'liquid',
    materials: [
      {
        type: 'molten_iron',
        abundance: 0.80,
        noiseScale: 200,
        noiseThreshold: 0.80,
        color: '#FF4500',
        hardness: 0, // Liquid
        density: 10.0,
        value: 10,
      },
      {
        type: 'molten_nickel',
        abundance: 0.10,
        noiseScale: 200,
        noiseThreshold: 0.90,
        color: '#FF6347',
        hardness: 0,
        density: 7.8,
        value: 9,
      },
      {
        type: 'sulfur',
        abundance: 0.05,
        noiseScale: 150,
        noiseThreshold: 0.95,
        color: '#FFFF00',
        hardness: 0,
        density: 2.0,
        value: 3,
      },
      {
        type: 'oxygen',
        abundance: 0.05,
        noiseScale: 150,
        noiseThreshold: 1.0,
        color: '#87CEEB',
        hardness: 0,
        density: 0.001,
        value: 1,
      },
    ],
    temperatureFunc: (r) => {
      const t = (r - 1220) / (3400 - 1220);
      return 5200 - t * 1200; // 5200 -> 4000°C
    },
    pressureFunc: (r) => {
      const t = (r - 1220) / (3400 - 1220);
      return 3360000 - t * 2230000; // 3.36M -> 1.13M bar
    },
  },

  // LOWER MANTLE (3400-5700 km)
  {
    name: 'lower_mantle',
    minRadius: 3400,
    maxRadius: 5700,
    state: 'solid',
    materials: [
      {
        type: 'bridgmanite',
        abundance: 0.60,
        noiseScale: 300,
        noiseThreshold: 0.60,
        color: '#8B4513',
        hardness: 8,
        density: 4.0,
        value: 7,
      },
      {
        type: 'ferropericlase',
        abundance: 0.30,
        noiseScale: 300,
        noiseThreshold: 0.90,
        color: '#A0522D',
        hardness: 7,
        density: 3.8,
        value: 6,
      },
      {
        type: 'calcium_perovskite',
        abundance: 0.10,
        noiseScale: 250,
        noiseThreshold: 1.0,
        color: '#D2691E',
        hardness: 7,
        density: 4.2,
        value: 5,
      },
    ],
    temperatureFunc: (r) => {
      const t = (r - 3400) / (5700 - 3400);
      return 4000 - t * 2500; // 4000 -> 1500°C
    },
    pressureFunc: (r) => {
      const t = (r - 3400) / (5700 - 3400);
      return 1130000 - t * 900000; // 1.13M -> 230k bar
    },
  },

  // UPPER MANTLE (5700-6350 km)
  {
    name: 'upper_mantle',
    minRadius: 5700,
    maxRadius: 6350,
    state: 'solid',
    materials: [
      {
        type: 'olivine',
        abundance: 0.50,
        noiseScale: 200,
        noiseThreshold: 0.50,
        color: '#9ACD32',
        hardness: 6.5,
        density: 3.3,
        value: 5,
      },
      {
        type: 'pyroxene',
        abundance: 0.30,
        noiseScale: 200,
        noiseThreshold: 0.80,
        color: '#556B2F',
        hardness: 6,
        density: 3.2,
        value: 4,
      },
      {
        type: 'garnet',
        abundance: 0.20,
        noiseScale: 180,
        noiseThreshold: 1.0,
        color: '#8B0000',
        hardness: 7,
        density: 3.6,
        value: 6,
      },
    ],
    temperatureFunc: (r) => {
      const t = (r - 5700) / (6350 - 5700);
      return 1500 - t * 1000; // 1500 -> 500°C
    },
    pressureFunc: (r) => {
      const t = (r - 5700) / (6350 - 5700);
      return 230000 - t * 226000; // 230k -> 4k bar
    },
  },

  // CRUST (6350-6371 km)
  {
    name: 'crust',
    minRadius: 6350,
    maxRadius: 6371,
    state: 'solid',
    materials: [
      {
        type: 'basalt',
        abundance: 0.25,
        noiseScale: 50,
        noiseThreshold: 0.25,
        color: '#2F4F4F',
        hardness: 6,
        density: 3.0,
        value: 3,
      },
      {
        type: 'granite',
        abundance: 0.25,
        noiseScale: 50,
        noiseThreshold: 0.50,
        color: '#FFB6C1',
        hardness: 6.5,
        density: 2.7,
        value: 3,
      },
      {
        type: 'limestone',
        abundance: 0.20,
        noiseScale: 30,
        noiseThreshold: 0.70,
        color: '#F5F5DC',
        hardness: 3,
        density: 2.7,
        value: 2,
      },
      {
        type: 'sandstone',
        abundance: 0.15,
        noiseScale: 30,
        noiseThreshold: 0.85,
        color: '#F4A460',
        hardness: 2.5,
        density: 2.3,
        value: 1,
      },
      {
        type: 'soil',
        abundance: 0.15,
        noiseScale: 10,
        noiseThreshold: 1.0,
        color: '#8B4513',
        hardness: 1,
        density: 1.5,
        value: 1,
      },
    ],
    temperatureFunc: (r) => {
      const t = (r - 6350) / (6371 - 6350);
      return 500 - t * 480; // 500 -> 20°C
    },
    pressureFunc: (r) => {
      const t = (r - 6350) / (6371 - 6350);
      return 4000 - t * 3999; // 4k -> 1 bar
    },
  },
];

/**
 * Get all unique materials across all layers
 */
export function getAllMaterials(): MaterialDistribution[] {
  const materials: MaterialDistribution[] = [];
  const seen = new Set<string>();

  for (const layer of EARTH_LIKE_LAYERS) {
    for (const mat of layer.materials) {
      if (!seen.has(mat.type)) {
        seen.add(mat.type);
        materials.push(mat);
      }
    }
  }

  return materials;
}
