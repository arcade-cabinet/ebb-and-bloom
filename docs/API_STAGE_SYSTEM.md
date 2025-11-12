# Stage/Layer System API Specification

**Version**: 1.0  
**Status**: Design Phase  
**Purpose**: Define the spatial organization architecture for Ebb & Bloom's Spore-style diorama view

---

## Overview

The Stage/Layer System provides the fundamental spatial framework for organizing all rendered content in deterministic depth bands with proper camera framing, gyroscope control, and horizon perspective.

**Core Principle**: "Hold the world in your hands" - gyroscope-driven diorama view with layered spatial organization.

---

## Layer Architecture

### Four Spatial Bands

```typescript
enum LayerDepth {
  FOREGROUND_MICRO = 0,   // Quantum/molecular scale (0-2m from camera)
  NEARGROUND_LIFE = 1,    // Creatures, tools, buildings (2-10m from camera)
  BACKGROUND_BIOME = 2,   // Terrain, vegetation, horizon (10-50m from camera)
  SKY_COSMIC = 3          // Atmosphere, celestial objects (50m+ from camera)
}

interface LayerConfig {
  depth: LayerDepth;
  depthRange: [number, number];  // [near, far] in meters
  materialPalette: string[];     // Allowed material IDs
  occlusionOrder: number;        // Render order (0 = back, 3 = front)
  lodBias: number;               // LOD multiplier for this layer
}
```

### Layer Definitions

**FOREGROUND_MICRO:**
- Depth: 0-2m from camera
- Materials: Elements (H, O, C, N, etc.)
- Use: Molecular visualization, particle effects
- LOD Bias: 1.0 (full detail)

**NEARGROUND_LIFE:**
- Depth: 2-10m from camera  
- Materials: Creatures, tools, structures
- Use: Primary gameplay focus (creatures, buildings)
- LOD Bias: 1.0 (full detail)

**BACKGROUND_BIOME:**
- Depth: 10-50m from camera
- Materials: Biomes (forest, desert, ocean, etc.)
- Use: Terrain, vegetation, environmental context
- LOD Bias: 0.5 (reduced detail)

**SKY_COSMIC:**
- Depth: 50m+ from camera
- Materials: Atmosphere, stars, planets
- Use: Skybox, celestial objects, ambient lighting
- LOD Bias: 0.25 (minimal detail)

---

## Camera System

### GyroGovernorCamera

```typescript
interface GyroGovernorCameraConfig {
  baseDistance: number;      // Distance from focus point (computed from biome scale)
  baseTilt: number;          // Base tilt angle in degrees (35-45°)
  fov: number;               // Field of view in degrees (55-65°)
  
  tiltRange: [number, number];  // Gyro tilt limits [min, max] (±12°)
  panRange: [number, number];   // Gyro pan limits [min, max] (±18°)
  
  smoothingFactor: number;   // Low-pass filter (0-1, default 0.85)
  horizonLock: boolean;      // Keep horizon stable
}

class GyroGovernorCamera {
  update(gyroInput: GyroInput, deltaTime: number): void;
  setFocusPoint(position: Vector3): void;
  transitionTo(target: CameraState, duration: number): Promise<void>;
  getViewFrustum(): Frustum;
}
```

### Camera Hierarchy

```
OrbitParent (rotation around focus point)
  ├─ TiltNode (gyro-driven tilt ±12°)
  │   └─ Camera (PerspectiveCamera, 55-65° FOV)
  └─ ZoomDolly (distance from focus)
```

### Gyroscope Mapping

```typescript
interface GyroInput {
  alpha: number;  // Z-axis rotation (compass heading)
  beta: number;   // X-axis rotation (front-to-back tilt)
  gamma: number;  // Y-axis rotation (left-to-right tilt)
}

// Low-pass filter to smooth gyro input
function applyLowPassFilter(
  current: number, 
  target: number, 
  smoothing: number
): number {
  return current * smoothing + target * (1 - smoothing);
}
```

---

## Placement System

### LayerPlacement Intent

```typescript
interface LayerPlacement {
  layer: LayerDepth;
  position: Vector3;        // World position
  elevation: number;        // Height above terrain
  scale: number;            // Scale multiplier
  avoidanceRadius: number;  // Collision radius
  seed: string;             // Deterministic seed
}

interface PlacementConstraints {
  minDistance: number;      // Minimum distance between objects
  maxDensity: number;       // Max objects per unit area
  terrainFollow: boolean;   // Align to terrain normal
  layerLock: boolean;       // Prevent depth bleeding
}
```

### Procedural Placement Pipeline

```
ChunkGenerator.generate(seed, chunkPos)
  ↓
BiomeSystem.classifyBiome(temperature, precipitation)
  ↓
Spawners.generatePlacements(biome, seed) → LayerPlacement[]
  ↓
PlacementResolver.resolve(placements, constraints) → ValidatedPlacement[]
  ↓
StageSystem.addToLayer(layer, placements)
  ↓
SDFRenderer.render(layerPrimitives)
```

---

## Stage System

### Stage Descriptor

```typescript
interface StageDescriptor {
  id: string;
  name: string;
  layers: LayerConfig[];
  cameraConfig: GyroGovernorCameraConfig;
  lightingPreset: LightingPreset;
  horizonAnchor: Vector3;
  audioMix: AudioMixConfig;
}

interface LightingPreset {
  ambient: Color;
  directional: DirectionalLightConfig;
  fog: FogConfig;
}
```

### Stage Transitions

```typescript
interface StageTransition {
  from: StageDescriptor;
  to: StageDescriptor;
  duration: number;
  
  cameraPath: CameraKeyframe[];
  lightingCrossfade: boolean;
  layerFadeIn: LayerDepth[];
  audioFade: AudioFadeConfig;
}

class StageSystem {
  loadStage(descriptor: StageDescriptor): Promise<void>;
  transition(transition: StageTransition): Promise<void>;
  addToLayer(layer: LayerDepth, placements: LayerPlacement[]): void;
  getLayerPrimitives(layer: LayerDepth): SDFPrimitive[];
  setHorizonAnchor(position: Vector3): void;
}
```

---

## Integration Points

### SDFRenderer Integration

```typescript
// SDFRenderer receives per-layer uniform blocks
interface LayerUniforms {
  uLayerDepth: number;
  uLayerNear: number;
  uLayerFar: number;
  uLODBias: number;
}

// Renderer batches primitives by layer for efficient rendering
SDFRenderer.renderLayer(layer: LayerDepth, primitives: SDFPrimitive[]): void;
```

### ChunkManager Integration

```typescript
// ChunkManager emits LayerPlacement intents
ChunkManager.generateChunk(seed: string): ChunkData {
  placements: LayerPlacement[];
  biome: BiomeType;
  temperature: number;
  precipitation: number;
}

// StageSystem resolves placements into layer primitives
StageSystem.addChunk(chunkData: ChunkData): void;
```

---

## FMV → Diorama Transition

### Handoff Choreography

```typescript
interface FMVToGameplayTransition extends StageTransition {
  cosmicZoomOut: {
    startAltitude: number;    // e.g., 1000m (cosmic scale)
    endAltitude: number;      // e.g., 15m (diorama scale)
    duration: number;         // e.g., 3000ms
    easing: EasingFunction;   // e.g., easeOutCubic
  };
  
  layerStreamIn: {
    SKY_COSMIC: { delay: 0, duration: 500 },
    BACKGROUND_BIOME: { delay: 500, duration: 1000 },
    NEARGROUND_LIFE: { delay: 1500, duration: 1000 },
    FOREGROUND_MICRO: { delay: 2500, duration: 500 }
  };
  
  audioRetarget: {
    from: 'cosmic-mix',
    to: 'biome-ambience',
    crossfadeDuration: 2000
  };
}
```

---

## Performance Targets

From docs/DESIGN.md:
- **Target FPS**: 60 FPS (desktop), 45 FPS (mobile)
- **Layer streaming budget**: ≤4 ms per tick
- **Camera update latency**: <50 ms
- **Gyroscope input lag**: <50 ms
- **Transition smoothness**: No dropped frames

---

## Determinism Requirements

All layer placement must be deterministic:
- Same seed → same positions
- Same layer assignments
- Same material selections
- Reproducible across sessions

```typescript
// Seeded RNG ensures determinism
const layerRNG = createSeededRNG(`${worldSeed}-layer-${chunkX}-${chunkZ}`);
const placement = generatePlacement(layerRNG);
```

---

## Error Handling

### Graceful Degradation

1. **Missing Layer Data**: Fall back to default layer config
2. **Invalid Placement**: Skip and log warning
3. **Gyroscope Unavailable**: Use touch/mouse input
4. **Performance Degradation**: Reduce LOD bias dynamically

### Validation

```typescript
function validatePlacement(placement: LayerPlacement): boolean {
  if (placement.layer < 0 || placement.layer > 3) return false;
  if (!isFinite(placement.position.length())) return false;
  if (placement.scale <= 0) return false;
  return true;
}
```

---

## Testing Requirements

See `tests/ideal/rendering/stageSystem.spec.ts`:

1. **Layer ordering**: Verify depth bands render in correct order
2. **Camera constraints**: Test tilt/pan limits, smoothing, horizon lock
3. **Placement resolution**: Validate collision avoidance, density limits
4. **Transition choreography**: Test FMV handoff timing and smoothness
5. **Performance envelope**: Layer streaming ≤4ms, no dropped frames
6. **Determinism**: Same seed produces identical placements
7. **Gyroscope input**: Test latency <50ms, smoothing correctness

---

**This API must be implemented and tested before FMV work resumes.**
