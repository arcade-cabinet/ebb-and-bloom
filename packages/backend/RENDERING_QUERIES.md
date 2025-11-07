# RENDERING THE SPHERE

## The Key Insight

If the backend can compute material at **any point (x, y, z)**, then:

1. **Any renderer** can query it
2. **Any layer** can be visualized
3. **No voxel storage** needed - compute on demand

---

## REST API for Rendering

### Query Material at Point
```http
GET /api/game/:id/materials/query?x=10&y=-5&z=3

Response:
{
  "position": { "x": 10, "y": -5, "z": 3 },
  "material": {
    "type": "limestone",
    "category": "stone",
    "hardness": 3.2,
    "density": 2.7,
    "color": "#D4C5B9",
    "accessible": true
  },
  "depth": 5,
  "layer": "sedimentary"
}
```

### Query Entire Layer (Cross-Section)
```http
GET /api/game/:id/materials/layer?y=-10&resolution=1

Response:
{
  "y": -10,
  "depth": 10,
  "resolution": 1,
  "grid": [
    // 2D array of materials at this depth
    [
      { "x": 0, "z": 0, "material": "limestone", "color": "#D4C5B9" },
      { "x": 1, "z": 0, "material": "sandstone", "color": "#F4E4C1" },
      { "x": 2, "z": 0, "material": "limestone", "color": "#D4C5B9" },
      // ... entire layer
    ]
  ]
}
```

### Query Vertical Column (Raycast)
```http
GET /api/game/:id/materials/column?x=10&z=5

Response:
{
  "position": { "x": 10, "z": 5 },
  "surfaceHeight": 0,
  "coreDepth": 6371000, // meters
  "column": [
    {
      "depth": 0,
      "y": 0,
      "material": "soil",
      "layer": "surface",
      "accessible": true
    },
    {
      "depth": 5,
      "y": -5,
      "material": "limestone",
      "layer": "sedimentary",
      "accessible": true
    },
    {
      "depth": 50,
      "y": -50,
      "material": "granite",
      "layer": "igneous",
      "accessible": false
    },
    {
      "depth": 500,
      "y": -500,
      "material": "basalt",
      "layer": "crust",
      "accessible": false
    },
    // ... all the way to core
  ]
}
```

### Query Region (3D Volume)
```http
GET /api/game/:id/materials/region?x=0&y=-10&z=0&width=10&height=10&depth=10&resolution=1

Response:
{
  "bounds": {
    "min": { "x": 0, "y": -10, "z": 0 },
    "max": { "x": 10, "y": 0, "z": 10 }
  },
  "resolution": 1,
  "volume": [
    // 3D array of materials
    [
      [
        { "x": 0, "y": -10, "z": 0, "material": "limestone" },
        { "x": 1, "y": -10, "z": 0, "material": "sandstone" },
        // ...
      ],
      // ... entire volume
    ]
  ]
}
```

### Query Stratification Overview
```http
GET /api/game/:id/planet/stratification

Response:
{
  "radius": 6371000,
  "layers": [
    {
      "name": "surface",
      "minDepth": 0,
      "maxDepth": 1,
      "materials": [
        { "type": "soil", "abundance": 0.7 },
        { "type": "sand", "abundance": 0.3 }
      ],
      "accessible": true
    },
    {
      "name": "sedimentary",
      "minDepth": 1,
      "maxDepth": 50,
      "materials": [
        { "type": "limestone", "abundance": 0.5 },
        { "type": "sandstone", "abundance": 0.3 },
        { "type": "shale", "abundance": 0.2 }
      ],
      "accessible": true
    },
    {
      "name": "igneous",
      "minDepth": 50,
      "maxDepth": 200,
      "materials": [
        { "type": "granite", "abundance": 0.6 },
        { "type": "basalt", "abundance": 0.4 }
      ],
      "accessible": false
    },
    // ... all layers to core
  ]
}
```

---

## Backend Implementation

### Material Query (The Fundamental Function)
```typescript
function queryMaterialAt(
  x: number, 
  y: number, 
  z: number, 
  state: GameState
): MaterialQuery {
  // 1. Calculate depth from surface
  const surfaceHeight = state.planet.terrainNoise.get(x, z, state.seed);
  const depth = surfaceHeight - y;
  
  // 2. Find layer at this depth
  const layer = state.planet.stratification.find(layer => 
    depth >= layer.minDepth && depth <= layer.maxDepth
  );
  
  if (!layer) {
    return {
      position: { x, y, z },
      material: null,
      depth,
      layer: 'void',
      accessible: false,
    };
  }
  
  // 3. Select material within layer using noise
  const noise = state.planet.materialNoise.get(x, y, z, state.seed);
  const material = layer.selectMaterial(noise);
  
  // 4. Check accessibility
  const capability = getMaxCreatureCapability(state);
  const accessible = 
    depth <= capability.maxDepth && 
    material.hardness <= capability.maxHardness;
  
  return {
    position: { x, y, z },
    material: {
      type: material.type,
      category: material.category,
      hardness: material.hardness,
      density: material.density,
      color: material.color,
      accessible,
    },
    depth,
    layer: layer.name,
    accessible,
  };
}
```

### Layer Query (2D Slice)
```typescript
function queryLayer(
  y: number, 
  resolution: number, 
  bounds: Bounds2D, 
  state: GameState
): LayerQuery {
  const grid = [];
  
  for (let x = bounds.minX; x <= bounds.maxX; x += resolution) {
    const row = [];
    for (let z = bounds.minZ; z <= bounds.maxZ; z += resolution) {
      const query = queryMaterialAt(x, y, z, state);
      row.push({
        x, z,
        material: query.material?.type,
        color: query.material?.color,
        accessible: query.accessible,
      });
    }
    grid.push(row);
  }
  
  return {
    y,
    depth: -y,
    resolution,
    bounds,
    grid,
  };
}
```

### Column Query (Vertical Raycast)
```typescript
function queryColumn(
  x: number, 
  z: number, 
  resolution: number, 
  state: GameState
): ColumnQuery {
  const surfaceHeight = state.planet.terrainNoise.get(x, z, state.seed);
  const coreDepth = state.planet.radius;
  
  const column = [];
  
  for (let y = surfaceHeight; y >= -coreDepth; y -= resolution) {
    const query = queryMaterialAt(x, y, z, state);
    column.push({
      depth: surfaceHeight - y,
      y,
      material: query.material?.type,
      layer: query.layer,
      accessible: query.accessible,
      color: query.material?.color,
    });
  }
  
  return {
    position: { x, z },
    surfaceHeight,
    coreDepth,
    column,
  };
}
```

### Region Query (3D Volume)
```typescript
function queryRegion(
  bounds: Bounds3D,
  resolution: number,
  state: GameState
): RegionQuery {
  const volume = [];
  
  for (let y = bounds.maxY; y >= bounds.minY; y -= resolution) {
    const layer = [];
    for (let x = bounds.minX; x <= bounds.maxX; x += resolution) {
      const row = [];
      for (let z = bounds.minZ; z <= bounds.maxZ; z += resolution) {
        const query = queryMaterialAt(x, y, z, state);
        row.push({
          x, y, z,
          material: query.material?.type,
          color: query.material?.color,
          accessible: query.accessible,
        });
      }
      layer.push(row);
    }
    volume.push(layer);
  }
  
  return {
    bounds,
    resolution,
    volume,
  };
}
```

---

## Frontend Rendering Examples

### CLI: Text-Based Cross-Section
```typescript
async function renderLayerCLI(gameId: string, depth: number) {
  const response = await fetch(
    `/api/game/${gameId}/materials/layer?y=${-depth}&resolution=2`
  );
  const layer = await response.json();
  
  console.log(`\nLayer at depth ${depth}m:\n`);
  
  for (const row of layer.grid) {
    let line = '';
    for (const cell of row) {
      // Use colored blocks for materials
      const symbol = getMaterialSymbol(cell.material);
      const color = cell.accessible ? chalk.green : chalk.red;
      line += color(symbol);
    }
    console.log(line);
  }
}

function getMaterialSymbol(material: string): string {
  const symbols = {
    'soil': '░',
    'sand': '▒',
    'limestone': '▓',
    'granite': '█',
    'basalt': '■',
  };
  return symbols[material] || '?';
}
```

### CLI: Vertical Column
```typescript
async function renderColumnCLI(gameId: string, x: number, z: number) {
  const response = await fetch(
    `/api/game/${gameId}/materials/column?x=${x}&z=${z}`
  );
  const column = await response.json();
  
  console.log(`\nVertical column at (${x}, ${z}):\n`);
  console.log('Depth | Material      | Layer         | Accessible');
  console.log('------|---------------|---------------|------------');
  
  for (const point of column.column) {
    const accessible = point.accessible ? '✓' : '✗';
    const color = point.accessible ? chalk.green : chalk.red;
    
    console.log(color(
      `${point.depth.toString().padEnd(5)} | ` +
      `${point.material.padEnd(13)} | ` +
      `${point.layer.padEnd(13)} | ` +
      `${accessible}`
    ));
  }
}
```

### 3D Frontend: Voxel Rendering
```typescript
async function renderPlanetSlice(gameId: string, y: number, scene: THREE.Scene) {
  const response = await fetch(
    `/api/game/${gameId}/materials/layer?y=${y}&resolution=1`
  );
  const layer = await response.json();
  
  // Create instanced mesh for performance
  const geometry = new THREE.BoxGeometry(1, 0.1, 1);
  const materials = createMaterialMap(); // Material -> THREE.Material
  
  for (let i = 0; i < layer.grid.length; i++) {
    for (let j = 0; j < layer.grid[i].length; j++) {
      const cell = layer.grid[i][j];
      
      const material = materials[cell.material];
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(cell.x, y, cell.z);
      
      // Dim inaccessible materials
      if (!cell.accessible) {
        mesh.material.opacity = 0.3;
        mesh.material.transparent = true;
      }
      
      scene.add(mesh);
    }
  }
}
```

### 3D Frontend: Ray-Marched Volume
```typescript
// GLSL shader for ray-marching through planet
const volumeShader = `
uniform vec3 planetCenter;
uniform float planetRadius;
uniform sampler3D stratificationTexture;

vec4 queryMaterial(vec3 position) {
  // Send ray position to backend API (via texture lookup or compute shader)
  // Backend has pre-computed stratification into 3D texture
  // OR: Compute stratification in shader using same noise functions
  
  float depth = length(position - planetCenter);
  vec3 uvw = (position - planetCenter) / planetRadius * 0.5 + 0.5;
  
  return texture(stratificationTexture, uvw);
}

void main() {
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
  
  vec4 accumulated = vec4(0.0);
  float t = 0.0;
  
  // Ray march through planet
  for (int i = 0; i < 128; i++) {
    vec3 position = rayOrigin + rayDirection * t;
    
    vec4 material = queryMaterial(position);
    
    // Accumulate color
    accumulated += material * (1.0 - accumulated.a);
    
    if (accumulated.a > 0.99) break;
    
    t += 0.1;
  }
  
  gl_FragColor = accumulated;
}
`;
```

### 3D Frontend: Cross-Section View
```typescript
async function renderCrossSection(
  gameId: string, 
  axis: 'x' | 'y' | 'z', 
  position: number,
  scene: THREE.Scene
) {
  // Query a 2D slice along specified axis
  let query;
  
  if (axis === 'y') {
    query = await fetch(
      `/api/game/${gameId}/materials/layer?y=${position}&resolution=1`
    );
  } else {
    // Query vertical slice (would need additional endpoint)
    query = await fetch(
      `/api/game/${gameId}/materials/slice?axis=${axis}&position=${position}&resolution=1`
    );
  }
  
  const slice = await query.json();
  
  // Create 2D grid of colored quads showing materials
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = slice.grid.length;
  canvas.height = slice.grid[0].length;
  
  // Draw materials as colored pixels
  for (let i = 0; i < slice.grid.length; i++) {
    for (let j = 0; j < slice.grid[i].length; j++) {
      const cell = slice.grid[i][j];
      ctx.fillStyle = cell.color;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  
  // Create textured plane
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const geometry = new THREE.PlaneGeometry(100, 100);
  const mesh = new THREE.Mesh(geometry, material);
  
  // Position based on axis
  if (axis === 'y') {
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = position;
  } else if (axis === 'x') {
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = position;
  } else {
    mesh.position.z = position;
  }
  
  scene.add(mesh);
}
```

---

## Communication Formats

### Human-Readable (CLI)
```
=== Planetary Stratification ===

Depth: 0-1m (Surface)
  • Soil (70%) - Brown, soft, accessible
  • Sand (30%) - Tan, soft, accessible

Depth: 1-50m (Sedimentary)
  • Limestone (50%) - Beige, medium, accessible
  • Sandstone (30%) - Yellow, soft, accessible
  • Shale (20%) - Gray, medium, accessible

Depth: 50-200m (Igneous)
  • Granite (60%) - Pink, hard, NOT accessible
  • Basalt (40%) - Black, hard, NOT accessible

Depth: 200-500m (Metamorphic)
  • Marble (40%) - White, very hard, NOT accessible
  • Quartzite (30%) - Clear, very hard, NOT accessible
  • Slate (30%) - Gray, hard, NOT accessible
```

### Machine-Readable (JSON)
```json
{
  "stratification": {
    "layers": [
      {
        "name": "surface",
        "depthRange": [0, 1],
        "materials": [
          {
            "type": "soil",
            "abundance": 0.7,
            "properties": {
              "hardness": 1.0,
              "density": 1.2,
              "color": "#8B4513"
            },
            "accessible": true
          }
        ]
      }
    ]
  }
}
```

### Visual (3D)
- Colored voxels/meshes
- Ray-marched volume rendering
- Cross-sectional slices
- Layer-by-layer views
- Interactive drill-down

---

## Summary

**The Backend Query Engine enables:**

1. **CLI Rendering** - ASCII art, tables, colored text
2. **2D Rendering** - Cross-sections, maps, charts
3. **3D Rendering** - Voxels, volumes, ray-marching
4. **Data Export** - JSON, CSV, analysis tools
5. **Interactive Exploration** - Click to query, drill down

**All from a single source of truth:**
```typescript
function getMaterialAt(x, y, z, gameState): Material
```

**The renderer doesn't care HOW materials are stored.**
**It just queries and displays the results.**

**No voxel storage. No pre-computation. Just pure mathematical queries.**
