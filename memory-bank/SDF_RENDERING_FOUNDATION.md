# SDF Rendering Foundation - Complete Assessment

**Date:** January 2025  
**Status:** 🔴 **CRITICAL FOUNDATION PHASE** - Must be completed before any domain-specific rendering  
**Priority:** Phase 0 (Foundation) - Blocks all other rendering work

---

## Executive Summary

The SDF (Signed Distance Field) raymarching rendering layer is the **foundational rendering API** for the entire project. It must be built to support:
- **Chemistry**: Molecular structures, bonds, orbitals, reactions
- **Biology**: Organisms, organs, tissues, cellular structures
- **Physics**: Tools, structures, materials, foreign body joining
- **Ecology**: Terrain features, vegetation, geological formations

**Current State:** ~15% complete - Basic primitives exist, but missing critical API features, proper integration, and comprehensive testing.

**Required State:** 100% complete with full API, miniplex-react integration, comprehensive tests, and documentation.

---

## What Exists (Current Implementation)

### ✅ Basic Infrastructure
- `SDFRenderer.tsx` - Core raymarching component
- `SDFPrimitives.ts` - GLSL primitive functions (11 shapes)
- Basic boolean operations (union, subtract, intersect, smooth-union)
- Hardcoded material system (5 material IDs)
- Basic texture support (global textures, not per-primitive)
- One demo (`BaseSDFProof.tsx`) - Currently failing tests

### ✅ Primitives Available
- Basic: sphere, box, cylinder, cone, pyramid, torus, octahedron, hexprism
- Advanced: capsule (for bonds), porbital, dorbital (molecular)
- Total: 11 primitive types

### ❌ Critical Gaps
1. **No per-primitive material assignment** - All primitives use hardcoded material IDs
2. **No per-primitive texture mapping** - Textures are global, not per-primitive
3. **No coordinate system targeting** - Cannot target specific surface areas
4. **No material blending API** - Cannot blend materials smoothly
5. **No foreign body joining API** - Cannot join separate objects cleanly
6. **No proper R3F lighting integration** - Uses hardcoded light direction
7. **No miniplex-react hooks** - Not reactive to ECS changes
8. **No comprehensive tests** - Only one failing E2E test
9. **No performance optimization** - No LOD, batching, or optimization
10. **No documentation** - No API docs, examples, or usage guides

---

## Required Foundation API (Complete Specification)

### 1. Primitive System (Expand & Complete)

**Current:** 11 primitives  
**Required:** 20+ primitives covering all use cases

**Missing Primitives:**
- `sdEllipsoid` - For organic shapes, cells
- `sdRoundedBox` - For smooth structures
- `sdCappedCylinder` - For limbs, tools
- `sdTriPrism` - For crystals, structures (exists in GLSL but not exposed)
- `sdPlane` - For surfaces, terrain features
- `sdRoundCone` - For smooth transitions
- `sdMengerSponge` - For fractal structures
- `sdGyroid` - For complex organic surfaces
- `sdSuperellipsoid` - For parameterized organic shapes
- `sdTorusKnot` - For complex molecular structures

**Primitive API Requirements:**
```typescript
interface SDFPrimitive {
  type: PrimitiveType;
  position: [number, number, number];
  rotation?: [number, number, number]; // NEW - Rotation support
  scale?: [number, number, number];     // NEW - Non-uniform scaling
  params: number[];                      // Size/shape parameters
  materialId: string;                   // CHANGED - String ID, not number
  textureSet?: TextureSet;               // NEW - Per-primitive textures
  operation?: BooleanOperation;
  operationStrength?: number;
  blendMode?: BlendMode;                 // NEW - Material blending
  coordinateTarget?: CoordinateTarget;   // NEW - Surface targeting
}
```

### 2. Material System (Complete Overhaul)

**Current:** Hardcoded material IDs (0-4)  
**Required:** Dynamic material registry with PBR properties

**Material API:**
```typescript
interface MaterialDefinition {
  id: string;
  name: string;
  albedo: [number, number, number] | string; // RGB or color name
  metallic: number;      // 0-1
  roughness: number;     // 0-1
  emission: number;      // 0-1
  emissiveColor: [number, number, number];
  transparency: number;  // 0-1
  ior?: number;          // Index of refraction
  textureSet?: TextureSet;
}

interface TextureSet {
  diffuse?: THREE.Texture | string;    // Path or loaded texture
  normal?: THREE.Texture | string;
  roughness?: THREE.Texture | string;
  metallic?: THREE.Texture | string;
  ao?: THREE.Texture | string;         // Ambient occlusion
  emission?: THREE.Texture | string;
  tiling?: [number, number];          // UV tiling
  offset?: [number, number];           // UV offset
}

class MaterialRegistry {
  static register(material: MaterialDefinition): void;
  static get(id: string): MaterialDefinition;
  static fromElement(symbol: string): MaterialDefinition; // Chemical integration
  static fromBiome(biome: string): MaterialDefinition;    // Ecological integration
}
```

**Chemical Integration:**
- Auto-generate materials from periodic table data
- CPK colors, metallic properties, transparency from element properties
- Bond materials (covalent, ionic, metallic)

**Ecological Integration:**
- Biome-specific materials (rock, soil, vegetation)
- Weathering effects (roughness changes over time)
- Seasonal variations (color shifts)

### 3. Coordinate System Targeting

**Purpose:** Target specific surface areas for foreign body joining, material blending, texture mapping

**API:**
```typescript
interface CoordinateTarget {
  type: 'surface' | 'volume' | 'edge' | 'vertex';
  region: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'custom';
  customRegion?: (p: [number, number, number]) => boolean; // SDF function
  blendRadius?: number; // For smooth transitions
}

// Usage: Join tool to hand at specific surface region
const toolPrimitive: SDFPrimitive = {
  type: 'cylinder',
  position: [0, 0, 0],
  materialId: 'iron',
  coordinateTarget: {
    type: 'surface',
    region: 'top',
    blendRadius: 0.1
  }
};
```

### 4. Material Blending API

**Purpose:** Smooth material transitions (e.g., creature skin to fur, metal to rust)

**API:**
```typescript
interface BlendMode {
  type: 'linear' | 'smooth' | 'noise' | 'gradient';
  strength: number;        // 0-1
  transitionDistance: number; // World units
  noiseScale?: number;     // For noise-based blending
  gradientDirection?: [number, number, number]; // For directional blending
}

// Usage: Blend metal to rust over distance
const rustBlend: BlendMode = {
  type: 'smooth',
  strength: 0.5,
  transitionDistance: 0.2
};
```

### 5. Foreign Body Joining API

**Purpose:** Join separate objects cleanly (creature + tool, structure + foundation, molecule + bond)

**API:**
```typescript
interface JoinOperation {
  type: 'attach' | 'merge' | 'weld';
  targetPrimitive: number;  // Index of primitive to join to
  targetCoordinate: CoordinateTarget;
  joinStrength: number;    // 0-1 (0 = loose, 1 = seamless)
  blendMaterials: boolean; // Blend materials at join point
}

// Usage: Attach tool to creature hand
const toolPrimitive: SDFPrimitive = {
  type: 'cylinder',
  position: handPosition,
  materialId: 'iron',
  joinOperation: {
    type: 'attach',
    targetPrimitive: handPrimitiveIndex,
    targetCoordinate: { type: 'surface', region: 'top' },
    joinStrength: 0.8,
    blendMaterials: true
  }
};
```

### 6. R3F Lighting Integration

**Current:** Hardcoded `lightDir = normalize(vec3(1.0, 1.0, -1.0))`  
**Required:** Automatic detection of R3F scene lights

**API:**
```typescript
// Auto-detect from R3F scene
const lights = useThree(state => state.scene.children.filter(c => c.type.includes('Light')));
// Pass to shader as uniforms
uniforms.uLights = { value: lights.map(light => ({
  type: light.type,
  position: light.position,
  color: light.color,
  intensity: light.intensity
})) };
```

**Shader Updates:**
- Support multiple lights (directional, point, spot)
- Proper shadow mapping (future)
- Ambient occlusion from textures
- Environment mapping (future)

### 7. miniplex-react Integration

**Purpose:** Reactive rendering from ECS entities

**API:**
```typescript
// Hook for reactive SDF rendering
function useSDFEntities(query: EntityQuery) {
  const { world } = useGameState();
  const entities = useEntities(world.entities.with(query));
  
  return useMemo(() => {
    return entities.map(entity => {
      // Convert ECS entity to SDF primitive
      return entityToSDFPrimitive(entity);
    });
  }, [entities]);
}

// Component that auto-updates from ECS
function SDFEntityRenderer({ query }: { query: EntityQuery }) {
  const primitives = useSDFEntities(query);
  return <SDFRenderer primitives={primitives} />;
}
```

**ECS Component Requirements:**
```typescript
// Add to CoreComponents.ts
export const SDFShape = {
  type: 'sdf-shape',
  primitiveType: string,
  position: [number, number, number],
  params: number[],
  materialId: string,
  // ... other SDF properties
};
```

### 8. Performance Optimization

**Required Features:**
- **LOD System:** Reduce raymarching steps for distant objects
- **Batching:** Combine multiple primitives into single raymarch when possible
- **Spatial Indexing:** Skip raymarching for primitives outside view frustum
- **Adaptive Steps:** Increase step size for empty space, decrease near surfaces
- **Early Termination:** Stop raymarching when depth buffer indicates occlusion

**API:**
```typescript
interface SDFRendererProps {
  primitives: SDFPrimitive[];
  // ... existing props
  lodLevels?: LODLevel[];        // NEW
  enableBatching?: boolean;       // NEW
  enableFrustumCulling?: boolean; // NEW
  adaptiveStepping?: boolean;     // NEW
}
```

### 9. Comprehensive Testing

**Required Test Coverage:**

**Unit Tests:**
- All primitive SDF functions (verify correct distance calculations)
- Boolean operations (union, subtract, intersect, smooth variants)
- Material system (registration, lookup, chemical/ecological integration)
- Coordinate targeting (surface region detection)
- Material blending (transition calculations)
- Foreign body joining (join point calculations)

**Integration Tests:**
- SDFRenderer with multiple primitives
- Material system with textures
- miniplex-react hooks with ECS updates
- R3F lighting integration
- Performance optimizations (LOD, batching)

**E2E Tests:**
- BaseSDFProof demo (complex primitives, textures, operations)
- Chemical rendering (molecules, bonds)
- Foreign body joining (tool + creature)
- Material blending (rust, weathering)
- Performance benchmarks (FPS, memory)

**Test Files Required:**
```
tests/unit/rendering/sdf/
  ├── SDFPrimitives.test.ts
  ├── SDFOperations.test.ts
  ├── MaterialRegistry.test.ts
  ├── CoordinateTargeting.test.ts
  ├── MaterialBlending.test.ts
  └── ForeignBodyJoining.test.ts

tests/integration/rendering/sdf/
  ├── SDFRenderer.test.tsx
  ├── MaterialSystem.test.tsx
  ├── MiniplexIntegration.test.tsx
  └── R3FLighting.test.tsx

tests/e2e/rendering/sdf/
  ├── base-sdf-proof.spec.ts (fix existing)
  ├── chemical-rendering.spec.ts
  ├── foreign-body-joining.spec.ts
  └── performance.spec.ts
```

### 10. Documentation

**Required Documentation:**

**API Documentation:**
- `docs/rendering/SDF_API.md` - Complete API reference
- `docs/rendering/SDF_PRIMITIVES.md` - All primitive types
- `docs/rendering/SDF_MATERIALS.md` - Material system
- `docs/rendering/SDF_OPERATIONS.md` - Boolean operations, blending, joining

**Integration Guides:**
- `docs/rendering/SDF_MINIPLEX_INTEGRATION.md` - ECS integration
- `docs/rendering/SDF_CHEMICAL_RENDERING.md` - Chemical layer (Phase 2)
- `docs/rendering/SDF_BIOLOGICAL_RENDERING.md` - Biological layer (Phase 3)

**Examples:**
- `examples/sdf-basic-primitives.tsx`
- `examples/sdf-material-blending.tsx`
- `examples/sdf-foreign-body-joining.tsx`
- `examples/sdf-chemical-molecule.tsx`

---

## Implementation Phases

### Phase 0.1: Core API Expansion (Week 1)
- [ ] Add missing primitives (10 new types)
- [ ] Implement MaterialRegistry system
- [ ] Add per-primitive texture mapping
- [ ] Add rotation and scaling support
- [ ] Unit tests for all primitives

### Phase 0.2: Advanced Features (Week 2)
- [ ] Coordinate system targeting
- [ ] Material blending API
- [ ] Foreign body joining API
- [ ] R3F lighting integration
- [ ] Integration tests

### Phase 0.3: ECS Integration (Week 3)
- [ ] miniplex-react hooks
- [ ] ECS component definitions
- [ ] Reactive rendering system
- [ ] E2E tests for ECS integration

### Phase 0.4: Performance & Polish (Week 4)
- [ ] LOD system
- [ ] Batching optimization
- [ ] Frustum culling
- [ ] Adaptive stepping
- [ ] Performance benchmarks
- [ ] Documentation

---

## Success Criteria

**Phase 0 is complete when:**

1. ✅ **All 20+ primitives implemented and tested**
2. ✅ **MaterialRegistry system working with chemical/ecological integration**
3. ✅ **Per-primitive texture mapping functional**
4. ✅ **Coordinate targeting API working**
5. ✅ **Material blending API working**
6. ✅ **Foreign body joining API working**
7. ✅ **R3F lighting auto-detection working**
8. ✅ **miniplex-react hooks reactive to ECS changes**
9. ✅ **All unit tests passing (>90% coverage)**
10. ✅ **All integration tests passing**
11. ✅ **All E2E tests passing (including BaseSDFProof)**
12. ✅ **Performance: 60fps with 100+ primitives**
13. ✅ **Complete API documentation**
14. ✅ **Working examples for all features**

---

## Blocking Dependencies

**This phase blocks:**
- Phase 1: Chemical Rendering Layer (molecules, bonds, reactions)
- Phase 2: Biological Rendering Layer (organisms, organs, tissues)
- Phase 3: Physics Rendering Layer (tools, structures, foreign body joining)
- Phase 4: Ecological Rendering Layer (terrain, vegetation, geological features)

**This phase depends on:**
- ✅ React Three Fiber (already integrated)
- ✅ miniplex-react (already integrated)
- ✅ AmbientCG texture system (already exists)
- ⏳ MaterialRegistry implementation (needs to be built)
- ⏳ Comprehensive test suite (needs to be built)

---

## Estimated Effort

**Total:** 4 weeks (160 hours)

- Week 1: Core API expansion (40 hours)
- Week 2: Advanced features (40 hours)
- Week 3: ECS integration (40 hours)
- Week 4: Performance & polish (40 hours)

**Critical Path:** This is the foundation. Nothing else can proceed until this is complete.

---

**Last Updated:** January 2025  
**Next Review:** After Phase 0.1 completion

