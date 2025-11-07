# PLANETARY COMPOSITION: THE MATH

## It's All Concentric Mathematical Layers

The planet is **not** a voxel grid or stored geometry.  
It's a **mathematical function** that returns material based on distance from center.

---

## The Mathematical Model

### Input
```typescript
{
  position: { x, y, z },
  seed: string,
  generation: number
}
```

### Output
```typescript
{
  material: string,
  density: number,
  temperature: number,
  pressure: number,
  state: 'solid' | 'liquid' | 'gas'
}
```

---

## Layer Definition (Concentric Spheres)

### Structure
```typescript
interface PlanetaryLayer {
  name: string;
  minRadius: number;      // Distance from center (km)
  maxRadius: number;      // Distance from center (km)
  materials: MaterialDistribution[];
  temperature: (radius: number) => number;  // Function!
  pressure: (radius: number) => number;     // Function!
  state: 'solid' | 'liquid' | 'gas';
}

interface MaterialDistribution {
  type: string;
  abundance: number;      // 0-1
  noiseScale: number;     // For spatial variation
  noiseThreshold: number; // When this material appears
}
```

### Real Earth-Like Planet
```typescript
const PLANET_LAYERS: PlanetaryLayer[] = [
  // INNER CORE (0-1220 km from center)
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
        noiseThreshold: 0.0,
      },
      {
        type: 'nickel',
        abundance: 0.15,
        noiseScale: 100,
        noiseThreshold: 0.85,
      }
    ],
    temperature: (r) => 5200 + (r / 1220) * 200, // 5200-5400°C
    pressure: (r) => 3640000 - (r / 1220) * 280000, // 3.64-3.36 million bar
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
        noiseThreshold: 0.0,
      },
      {
        type: 'molten_nickel',
        abundance: 0.10,
        noiseScale: 200,
        noiseThreshold: 0.80,
      },
      {
        type: 'sulfur',
        abundance: 0.05,
        noiseScale: 150,
        noiseThreshold: 0.90,
      },
      {
        type: 'oxygen',
        abundance: 0.05,
        noiseScale: 150,
        noiseThreshold: 0.95,
      }
    ],
    temperature: (r) => {
      const t = (r - 1220) / (3400 - 1220); // 0-1
      return 5200 - t * 1200; // 5200°C -> 4000°C
    },
    pressure: (r) => {
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
        type: 'bridgmanite',      // High-pressure silicate
        abundance: 0.60,
        noiseScale: 300,
        noiseThreshold: 0.0,
      },
      {
        type: 'ferropericlase',   // Iron-magnesium oxide
        abundance: 0.30,
        noiseScale: 300,
        noiseThreshold: 0.60,
      },
      {
        type: 'calcium_perovskite',
        abundance: 0.10,
        noiseScale: 250,
        noiseThreshold: 0.90,
      }
    ],
    temperature: (r) => {
      const t = (r - 3400) / (5700 - 3400);
      return 4000 - t * 2500; // 4000°C -> 1500°C
    },
    pressure: (r) => {
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
        noiseThreshold: 0.0,
      },
      {
        type: 'pyroxene',
        abundance: 0.30,
        noiseScale: 200,
        noiseThreshold: 0.50,
      },
      {
        type: 'garnet',
        abundance: 0.20,
        noiseScale: 180,
        noiseThreshold: 0.80,
      }
    ],
    temperature: (r) => {
      const t = (r - 5700) / (6350 - 5700);
      return 1500 - t * 1000; // 1500°C -> 500°C
    },
    pressure: (r) => {
      const t = (r - 5700) / (6350 - 5700);
      return 230000 - t * 226000; // 230k -> 4k bar
    },
  },
  
  // CRUST (6350-6371 km) - Only 21km thick!
  {
    name: 'crust',
    minRadius: 6350,
    maxRadius: 6371,
    state: 'solid',
    materials: [
      {
        type: 'basalt',          // Oceanic crust
        abundance: 0.30,
        noiseScale: 50,
        noiseThreshold: 0.0,
      },
      {
        type: 'granite',         // Continental crust
        abundance: 0.30,
        noiseScale: 50,
        noiseThreshold: 0.30,
      },
      {
        type: 'limestone',       // Sedimentary
        abundance: 0.15,
        noiseScale: 30,
        noiseThreshold: 0.60,
      },
      {
        type: 'sandstone',       // Sedimentary
        abundance: 0.15,
        noiseScale: 30,
        noiseThreshold: 0.75,
      },
      {
        type: 'soil',           // Surface
        abundance: 0.10,
        noiseScale: 10,
        noiseThreshold: 0.90,
      }
    ],
    temperature: (r) => {
      const t = (r - 6350) / (6371 - 6350);
      return 500 - t * 480; // 500°C -> 20°C (surface)
    },
    pressure: (r) => {
      const t = (r - 6350) / (6371 - 6350);
      return 4000 - t * 3999; // 4k -> 1 bar (surface)
    },
  },
];
```

---

## The Composition Algorithm

### Query Material at Point
```typescript
function getMaterialAt(
  x: number, 
  y: number, 
  z: number, 
  seed: string
): PlanetaryPoint {
  // 1. Calculate distance from planet center
  const center = { x: 0, y: 0, z: 0 };
  const distanceFromCenter = Math.sqrt(
    Math.pow(x - center.x, 2) +
    Math.pow(y - center.y, 2) +
    Math.pow(z - center.z, 2)
  );
  
  // Convert to km (assuming game units are meters)
  const radiusKm = distanceFromCenter / 1000;
  
  // 2. Find which layer this radius falls into
  const layer = PLANET_LAYERS.find(layer => 
    radiusKm >= layer.minRadius && radiusKm < layer.maxRadius
  );
  
  if (!layer) {
    return {
      material: 'void',
      temperature: 2.7, // Space background temperature (Kelvin)
      pressure: 0,
      state: 'gas',
      layer: 'space',
    };
  }
  
  // 3. Calculate temperature and pressure at this radius
  const temperature = layer.temperature(radiusKm);
  const pressure = layer.pressure(radiusKm);
  
  // 4. Select material using Perlin noise
  const noise = perlinNoise3D(
    x / layer.materials[0].noiseScale,
    y / layer.materials[0].noiseScale,
    z / layer.materials[0].noiseScale,
    seed
  );
  
  // Normalize noise to 0-1
  const normalizedNoise = (noise + 1) / 2;
  
  // 5. Select material based on noise threshold
  let cumulativeAbundance = 0;
  let selectedMaterial = layer.materials[0];
  
  for (const matDist of layer.materials) {
    cumulativeAbundance += matDist.abundance;
    if (normalizedNoise <= cumulativeAbundance) {
      selectedMaterial = matDist;
      break;
    }
  }
  
  return {
    position: { x, y, z },
    distanceFromCenter: distanceFromCenter,
    material: selectedMaterial.type,
    temperature,
    pressure,
    state: layer.state,
    layer: layer.name,
    depth: PLANET_LAYERS[PLANET_LAYERS.length - 1].maxRadius - radiusKm,
  };
}
```

---

## Example Queries

### Query at Surface
```typescript
getMaterialAt(10, 6371000, 5, 'seed123')

→ {
  position: { x: 10, y: 6371000, z: 5 },
  distanceFromCenter: 6371000.000001,
  material: 'soil',
  temperature: 20,
  pressure: 1,
  state: 'solid',
  layer: 'crust',
  depth: 0.000001
}
```

### Query at Crustal Depth
```typescript
getMaterialAt(10, 6360000, 5, 'seed123')

→ {
  position: { x: 10, y: 6360000, z: 5 },
  distanceFromCenter: 6360000,
  material: 'granite',
  temperature: 350,
  pressure: 3000,
  state: 'solid',
  layer: 'crust',
  depth: 11
}
```

### Query at Mantle
```typescript
getMaterialAt(10, 6000000, 5, 'seed123')

→ {
  position: { x: 10, y: 6000000, z: 5 },
  distanceFromCenter: 6000000,
  material: 'olivine',
  temperature: 1200,
  pressure: 150000,
  state: 'solid',
  layer: 'upper_mantle',
  depth: 371
}
```

### Query at Outer Core
```typescript
getMaterialAt(10, 2000000, 5, 'seed123')

→ {
  position: { x: 10, y: 2000000, z: 5 },
  distanceFromCenter: 2000000,
  material: 'molten_iron',
  temperature: 4800,
  pressure: 2500000,
  state: 'liquid',
  layer: 'outer_core',
  depth: 4371
}
```

### Query at Inner Core
```typescript
getMaterialAt(0, 0, 0, 'seed123')

→ {
  position: { x: 0, y: 0, z: 0 },
  distanceFromCenter: 0,
  material: 'iron',
  temperature: 5400,
  pressure: 3640000,
  state: 'solid',
  layer: 'inner_core',
  depth: 6371
}
```

---

## Raycast Through Entire Planet

### Implementation
```typescript
function raycastThroughPlanet(
  start: { x, y, z },
  direction: { x, y, z },
  seed: string
): PlanetaryPoint[] {
  const points = [];
  const stepSize = 10000; // 10km steps
  const maxDistance = 6371 * 2 * 1000; // Diameter
  
  // Normalize direction
  const len = Math.sqrt(
    direction.x ** 2 + direction.y ** 2 + direction.z ** 2
  );
  const dir = {
    x: direction.x / len,
    y: direction.y / len,
    z: direction.z / len,
  };
  
  // March through planet
  for (let t = 0; t < maxDistance; t += stepSize) {
    const point = {
      x: start.x + dir.x * t,
      y: start.y + dir.y * t,
      z: start.z + dir.z * t,
    };
    
    const data = getMaterialAt(point.x, point.y, point.z, seed);
    points.push(data);
    
    // Stop if we exit the planet
    if (data.layer === 'space') break;
  }
  
  return points;
}
```

### Example: Surface to Core
```typescript
raycastThroughPlanet(
  { x: 0, y: 6371000, z: 0 },  // Start at surface
  { x: 0, y: -1, z: 0 },        // Point down to center
  'seed123'
)

→ [
  { layer: 'crust', material: 'soil', temperature: 20, depth: 0 },
  { layer: 'crust', material: 'granite', temperature: 350, depth: 11 },
  { layer: 'crust', material: 'basalt', temperature: 490, depth: 20 },
  { layer: 'upper_mantle', material: 'olivine', temperature: 800, depth: 50 },
  { layer: 'upper_mantle', material: 'pyroxene', temperature: 1300, depth: 300 },
  { layer: 'lower_mantle', material: 'bridgmanite', temperature: 2500, depth: 1000 },
  { layer: 'lower_mantle', material: 'ferropericlase', temperature: 3500, depth: 2000 },
  { layer: 'outer_core', material: 'molten_iron', temperature: 4500, depth: 3500 },
  { layer: 'outer_core', material: 'molten_nickel', temperature: 5000, depth: 4500 },
  { layer: 'inner_core', material: 'iron', temperature: 5300, depth: 5500 },
  { layer: 'inner_core', material: 'iron', temperature: 5400, depth: 6371 },
]
```

---

## REST API Endpoints

### Query Single Point
```http
GET /api/game/:id/planet/query?x=10&y=6000000&z=5

Response:
{
  "position": { "x": 10, "y": 6000000, "z": 5 },
  "distanceFromCenter": 6000000,
  "radiusKm": 6000,
  "layer": "upper_mantle",
  "material": "olivine",
  "temperature": 1200,
  "pressure": 150000,
  "state": "solid",
  "depth": 371000
}
```

### Query Layer Overview
```http
GET /api/game/:id/planet/structure

Response:
{
  "radius": 6371,
  "layers": [
    {
      "name": "inner_core",
      "radiusRange": [0, 1220],
      "depthRange": [5151, 6371],
      "state": "solid",
      "temperatureRange": [5200, 5400],
      "pressureRange": [3360000, 3640000],
      "materials": [
        { "type": "iron", "abundance": 0.85 },
        { "type": "nickel", "abundance": 0.15 }
      ]
    },
    // ... all layers
  ]
}
```

### Query Raycast
```http
GET /api/game/:id/planet/raycast?startX=0&startY=6371000&startZ=0&dirX=0&dirY=-1&dirZ=0

Response:
{
  "start": { "x": 0, "y": 6371000, "z": 0 },
  "direction": { "x": 0, "y": -1, "z": 0 },
  "points": [
    {
      "distance": 0,
      "layer": "crust",
      "material": "soil",
      "temperature": 20,
      "state": "solid"
    },
    // ... all points along ray
  ]
}
```

### Query Cross-Section (2D Slice)
```http
GET /api/game/:id/planet/slice?plane=xz&y=6000000&resolution=10000

Response:
{
  "plane": "xz",
  "y": 6000000,
  "resolution": 10000,
  "grid": [
    [
      { "x": -6000000, "z": -6000000, "material": "olivine", "layer": "upper_mantle" },
      { "x": -6000000, "z": -5990000, "material": "pyroxene", "layer": "upper_mantle" },
      // ... full 2D grid
    ]
  ]
}
```

---

## Visualization Examples

### CLI: Layered Structure
```
=== PLANETARY COMPOSITION ===

Radius: 6371 km

┌─────────────────────────────────────┐
│ INNER CORE (0-1220 km)              │ 5400°C, 3.64M bar
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ Iron (85%), Nickel (15%)
│ State: SOLID                         │
├─────────────────────────────────────┤
│ OUTER CORE (1220-3400 km)           │ 4000-5200°C, 1.13-3.36M bar
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ Molten Iron (80%), Nickel (10%)
│ State: LIQUID                        │
├─────────────────────────────────────┤
│ LOWER MANTLE (3400-5700 km)         │ 1500-4000°C, 230k-1.13M bar
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ Bridgmanite (60%), Ferropericlase (30%)
│ State: SOLID                         │
├─────────────────────────────────────┤
│ UPPER MANTLE (5700-6350 km)         │ 500-1500°C, 4k-230k bar
│ ▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓ │ Olivine (50%), Pyroxene (30%), Garnet (20%)
│ State: SOLID                         │
├─────────────────────────────────────┤
│ CRUST (6350-6371 km)                │ 20-500°C, 1-4k bar
│ ░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓█░▒▓ │ Granite, Basalt, Limestone, Sandstone, Soil
│ State: SOLID                         │
└─────────────────────────────────────┘

Accessible Depth: 0-50m (Top 0.0008% of crust)
Current Max Reach: 50m
Current Max Hardness: 4.5 Mohs
```

### 3D: Cutaway View
```typescript
// Render planet as concentric spheres with cutaway
function renderPlanetCutaway(gameId: string, scene: THREE.Scene) {
  const layers = [
    { name: 'inner_core', radius: 1220, color: 0xFF6B6B },
    { name: 'outer_core', radius: 3400, color: 0xFF9500 },
    { name: 'lower_mantle', radius: 5700, color: 0xFFD700 },
    { name: 'upper_mantle', radius: 6350, color: 0x8B4513 },
    { name: 'crust', radius: 6371, color: 0x228B22 },
  ];
  
  for (const layer of layers) {
    const geometry = new THREE.SphereGeometry(layer.radius * 1000, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: layer.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.FrontSide,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    
    // Cut away a wedge to show interior
    const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 1), 0);
    material.clippingPlanes = [clipPlane];
    
    scene.add(sphere);
  }
}
```

---

## Summary

**The planet is composed of:**
- Inner Core: Iron/Nickel solid, 5400°C, 3.64M bar
- Outer Core: Molten iron/nickel liquid, 4000-5200°C, 1.13-3.36M bar  
- Lower Mantle: High-pressure silicates solid, 1500-4000°C, 230k-1.13M bar
- Upper Mantle: Olivine/Pyroxene/Garnet solid, 500-1500°C, 4k-230k bar
- Crust: Mixed rocks solid, 20-500°C, 1-4k bar

**All computed mathematically:**
- Distance from center determines layer
- Noise functions determine material distribution
- Temperature/pressure are mathematical functions of radius
- No stored geometry, just equations

**Query at any point:**
```typescript
getMaterialAt(x, y, z, seed) → { material, temperature, pressure, layer }
```

**It's all just math.**
