# 🔥 PHASE 0: SDF RENDERING FOUNDATION - COMPLETE IMPLEMENTATION HANDOFF

**Date:** January 2025  
**Status:** 🚀 **READY FOR IMPLEMENTATION**  
**Priority:** **CRITICAL FOUNDATION** - Blocks all rendering work  
**Estimated Effort:** 4 weeks (160 hours)

---

## 📋 EXECUTIVE SUMMARY

This handoff document provides **COMPLETE** implementation instructions for Phase 0: SDF Rendering Foundation. This is the foundational rendering API that will support all domain-specific rendering (chemistry, biology, physics, ecology).

**Current State:** ~15% complete (basic primitives exist, missing critical API features)  
**Target State:** 100% complete with full API, comprehensive tests, documentation, and vertical slice demos

**This handoff includes:**
1. Complete API specifications
2. Implementation tasks for all 4 sub-phases
3. Test requirements (unit, integration, E2E)
4. Playwright MCP server usage for screenshot generation
5. Vertical slice demo requirements
6. Documentation requirements
7. Performance benchmarks
8. Success criteria

---

## 🎯 PHASE 0 OVERVIEW

### Sub-Phases

- **Phase 0.1:** Core API Expansion (Week 1) - 40 hours
- **Phase 0.2:** Advanced Features (Week 2) - 40 hours
- **Phase 0.3:** ECS Integration (Week 3) - 40 hours
- **Phase 0.4:** Performance & Polish (Week 4) - 40 hours

### Success Criteria

Phase 0 is complete when:
1. ✅ All 20+ primitives implemented and tested
2. ✅ MaterialRegistry system working with chemical/ecological integration
3. ✅ Per-primitive texture mapping functional
4. ✅ Coordinate targeting API working
5. ✅ Material blending API working
6. ✅ Foreign body joining API working
7. ✅ R3F lighting auto-detection working
8. ✅ miniplex-react hooks reactive to ECS changes
9. ✅ All unit tests passing (>90% coverage)
10. ✅ All integration tests passing
11. ✅ All E2E tests passing (including BaseSDFProof)
12. ✅ Performance: 60fps with 100+ primitives
13. ✅ Complete API documentation
14. ✅ Working examples for all features
15. ✅ Vertical slice demos with Playwright screenshots

---

## 📦 PHASE 0.1: CORE API EXPANSION (Week 1)

### Task 1.1: Add Missing Primitives

**Goal:** Expand from 11 to 20+ primitive types

**Current Primitives (11):**
- sphere, box, cylinder, cone, pyramid, torus, octahedron, hexprism, capsule, porbital, dorbital

**New Primitives to Add (10):**
1. `sdEllipsoid` - For organic shapes, cells
2. `sdRoundedBox` - For smooth structures
3. `sdCappedCylinder` - For limbs, tools
4. `sdTriPrism` - For crystals, structures (GLSL exists, needs exposure)
5. `sdPlane` - For surfaces, terrain features
6. `sdRoundCone` - For smooth transitions
7. `sdMengerSponge` - For fractal structures
8. `sdGyroid` - For complex organic surfaces
9. `sdSuperellipsoid` - For parameterized organic shapes
10. `sdTorusKnot` - For complex molecular structures

**Implementation:**
```typescript
// File: engine/rendering/sdf/SDFPrimitives.ts

// Add GLSL functions for each new primitive
export const SDF_PRIMITIVES_GLSL = `
  // ... existing primitives ...
  
  // NEW PRIMITIVES
  float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    if (k0 < 1.0) return k0 * (k0 - 1.0) / k1;
    return length(p) - r.x;
  }
  
  float sdRoundedBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - r;
  }
  
  float sdCappedCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }
  
  float sdPlane(vec3 p, vec3 n, float h) {
    return dot(p, normalize(n)) + h;
  }
  
  float sdRoundCone(vec3 p, float r1, float r2, float h) {
    vec2 q = vec2(length(p.xz), p.y);
    float b = (r1 - r2) / h;
    float a = sqrt(1.0 - b * b);
    float k = dot(q, vec2(-b, a));
    if (k < 0.0) return length(q) - r1;
    if (k > a * h) return length(q - vec2(0.0, h)) - r2;
    return dot(q, vec2(a, b)) - r1;
  }
  
  // ... more primitives ...
`;

// Update SDFPrimitive interface
export interface SDFPrimitive {
  type: 'sphere' | 'box' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 
        'octahedron' | 'hexprism' | 'capsule' | 'porbital' | 'dorbital' |
        'ellipsoid' | 'roundedBox' | 'cappedCylinder' | 'triPrism' | 
        'plane' | 'roundCone' | 'mengerSponge' | 'gyroid' | 
        'superellipsoid' | 'torusKnot'; // NEW TYPES
  position: [number, number, number];
  rotation?: [number, number, number]; // NEW - Rotation support
  scale?: [number, number, number];     // NEW - Non-uniform scaling
  params: number[];
  materialId: string;                    // CHANGED - String ID, not number
  textureSet?: TextureSet;               // NEW - Per-primitive textures
  operation?: BooleanOperation;
  operationStrength?: number;
  blendMode?: BlendMode;                 // NEW - Material blending
  coordinateTarget?: CoordinateTarget;   // NEW - Surface targeting
}
```

**Update SDFRenderer.tsx:**
- Add cases for all new primitive types in `generateSceneSDF`
- Support rotation and scaling transforms
- Support per-primitive texture sets

**Tests:**
- Unit tests for each new primitive SDF function
- Verify correct distance calculations
- Test edge cases (zero size, negative params, etc.)

**Files to Create/Modify:**
- `engine/rendering/sdf/SDFPrimitives.ts` - Add GLSL functions and types
- `engine/rendering/sdf/SDFRenderer.tsx` - Add primitive cases
- `tests/unit/rendering/sdf/SDFPrimitives.test.ts` - Unit tests

---

### Task 1.2: Implement MaterialRegistry System

**Goal:** Replace hardcoded material IDs with dynamic material registry

**Implementation:**
```typescript
// File: engine/rendering/sdf/MaterialRegistry.ts

import * as THREE from 'three';
import { periodicTableData } from '../../../data/periodic-table.json';

export interface MaterialDefinition {
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

export interface TextureSet {
  diffuse?: THREE.Texture | string;    // Path or loaded texture
  normal?: THREE.Texture | string;
  roughness?: THREE.Texture | string;
  metallic?: THREE.Texture | string;
  ao?: THREE.Texture | string;         // Ambient occlusion
  emission?: THREE.Texture | string;
  tiling?: [number, number];          // UV tiling
  offset?: [number, number];           // UV offset
}

class MaterialRegistryClass {
  private materials: Map<string, MaterialDefinition> = new Map();
  
  register(material: MaterialDefinition): void {
    this.materials.set(material.id, material);
  }
  
  get(id: string): MaterialDefinition {
    const material = this.materials.get(id);
    if (!material) {
      throw new Error(`Material ${id} not found`);
    }
    return material;
  }
  
  fromElement(symbol: string): MaterialDefinition {
    const element = periodicTableData.find(e => e.symbol === symbol);
    if (!element) {
      throw new Error(`Element ${symbol} not found`);
    }
    
    // Extract CPK color
    const cpkHex = element['cpk-hex'] || '#FFFFFF';
    const rgb = this.hexToRgb(cpkHex);
    
    // Determine metallic/roughness from element properties
    const isMetal = element.category === 'metal' || 
                    element.category === 'metalloid' ||
                    ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'].includes(symbol);
    
    return {
      id: `element-${symbol.toLowerCase()}`,
      name: element.name,
      albedo: rgb,
      metallic: isMetal ? 0.9 : 0.1,
      roughness: isMetal ? 0.1 : 0.8,
      emission: 0.0,
      emissiveColor: [0, 0, 0],
      transparency: element.category === 'noble gas' ? 0.3 : 0.0,
    };
  }
  
  fromBiome(biome: string): MaterialDefinition {
    // Biome-specific materials
    const biomeMaterials: Record<string, MaterialDefinition> = {
      'ocean': {
        id: 'biome-ocean',
        name: 'Ocean Water',
        albedo: [0.1, 0.3, 0.5],
        metallic: 0.0,
        roughness: 0.1,
        emission: 0.0,
        emissiveColor: [0, 0, 0],
        transparency: 0.8,
      },
      'desert': {
        id: 'biome-desert',
        name: 'Desert Sand',
        albedo: [0.9, 0.8, 0.6],
        metallic: 0.0,
        roughness: 0.9,
        emission: 0.0,
        emissiveColor: [0, 0, 0],
        transparency: 0.0,
      },
      // ... more biomes
    };
    
    return biomeMaterials[biome] || this.get('default');
  }
  
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
  }
}

export const MaterialRegistry = new MaterialRegistryClass();

// Register default materials
MaterialRegistry.register({
  id: 'default',
  name: 'Default Material',
  albedo: [0.5, 0.5, 0.5],
  metallic: 0.5,
  roughness: 0.5,
  emission: 0.0,
  emissiveColor: [0, 0, 0],
  transparency: 0.0,
});
```

**Update SDFRenderer.tsx:**
- Replace hardcoded `getMaterial(materialId)` with MaterialRegistry lookup
- Support texture sets from MaterialDefinition
- Generate GLSL material code dynamically

**Tests:**
- Unit tests for MaterialRegistry (register, get, fromElement, fromBiome)
- Test chemical integration (all 118 elements)
- Test ecological integration (all 11 biomes)

**Files to Create/Modify:**
- `engine/rendering/sdf/MaterialRegistry.ts` - NEW FILE
- `engine/rendering/sdf/SDFPrimitives.ts` - Update material system
- `engine/rendering/sdf/SDFRenderer.tsx` - Use MaterialRegistry
- `tests/unit/rendering/sdf/MaterialRegistry.test.ts` - NEW FILE

---

### Task 1.3: Add Per-Primitive Texture Mapping

**Goal:** Support texture sets per primitive, not global textures

**Implementation:**
```typescript
// Update SDFRenderer.tsx

interface SDFRendererProps {
  primitives: SDFPrimitive[];
  // Remove: textures?: Record<string, THREE.Texture>; // OLD - global
  maxSteps?: number;
  precision?: number;
  maxDistance?: number;
}

// In SDFRenderer component:
const generateSceneSDF = useMemo(() => {
  // ... existing code ...
  
  // For each primitive, check if it has a textureSet
  primitives.forEach((primitive, index) => {
    // ... existing primitive generation ...
    
    // If primitive has textureSet, register it
    if (primitive.textureSet) {
      // Register textures for this primitive
      // Pass texture indices to shader
    }
  });
}, [primitives]);

// Update fragment shader to support per-primitive textures
const fragmentShader = useMemo(() => `
  // ... existing code ...
  
  // Texture arrays (one per primitive)
  uniform sampler2D uTextures[${primitives.length}][6]; // [primitive][diffuse, normal, roughness, metallic, ao, emission]
  
  // Material lookup with texture support
  vec3 getMaterialColor(int primitiveIndex, vec3 p, vec3 n) {
    Material mat = getMaterial(primitiveIndex);
    
    // Sample textures if available
    if (hasTextures(primitiveIndex)) {
      vec2 uv = calculateUV(p, primitiveIndex);
      vec3 diffuse = texture2D(uTextures[primitiveIndex][0], uv).rgb;
      vec3 normal = texture2D(uTextures[primitiveIndex][1], uv).rgb * 2.0 - 1.0;
      float roughness = texture2D(uTextures[primitiveIndex][2], uv).r;
      // ... use sampled values ...
    }
    
    return mat.albedo;
  }
`, [primitives]);
```

**Tests:**
- Integration test: Multiple primitives with different texture sets
- Verify textures apply correctly to each primitive
- Test texture tiling and offset

**Files to Create/Modify:**
- `engine/rendering/sdf/SDFRenderer.tsx` - Per-primitive texture support
- `tests/integration/rendering/sdf/SDFRenderer.test.tsx` - Texture mapping tests

---

### Task 1.4: Add Rotation and Scaling Support

**Goal:** Support rotation and non-uniform scaling for primitives

**Implementation:**
```typescript
// Update SDFPrimitives.ts

export interface SDFPrimitive {
  // ... existing fields ...
  rotation?: [number, number, number]; // Euler angles in radians
  scale?: [number, number, number];     // Non-uniform scaling
}

// In SDFRenderer.tsx generateSceneSDF:

primitives.forEach((primitive, index) => {
  let transformedP = `p - ${pos}`;
  
  // Apply rotation
  if (primitive.rotation) {
    const [rx, ry, rz] = primitive.rotation;
    transformedP = `rotateEuler(${transformedP}, vec3(${rx}, ${ry}, ${rz}))`;
  }
  
  // Apply scaling
  if (primitive.scale) {
    const [sx, sy, sz] = primitive.scale;
    transformedP = `scale(${transformedP}, vec3(${sx}, ${sy}, ${sz}))`;
  }
  
  // Generate SDF with transformed point
  switch (primitive.type) {
    case 'sphere':
      sdfCode += `current = sdSphere(${transformedP}, ${primitive.params[0]});\n`;
      break;
    // ... other primitives ...
  }
});

// Add GLSL transform functions
const TRANSFORM_GLSL = `
vec3 rotateEuler(vec3 p, vec3 angles) {
  float cx = cos(angles.x);
  float sx = sin(angles.x);
  float cy = cos(angles.y);
  float sy = sin(angles.y);
  float cz = cos(angles.z);
  float sz = sin(angles.z);
  
  mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cx, -sx, 0.0, sx, cx);
  mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
  mat3 rotZ = mat3(cz, -sz, 0.0, sz, cz, 0.0, 0.0, 0.0, 1.0);
  
  return rotZ * rotY * rotX * p;
}

vec3 scale(vec3 p, vec3 s) {
  return p / s;
}
`;
```

**Tests:**
- Unit tests: Verify rotation and scaling transforms
- Integration test: Render rotated/scaled primitives
- Visual test: Screenshot comparison

**Files to Create/Modify:**
- `engine/rendering/sdf/SDFPrimitives.ts` - Add transform types
- `engine/rendering/sdf/SDFRenderer.tsx` - Add transform support
- `tests/unit/rendering/sdf/SDFPrimitives.test.ts` - Transform tests

---

### Task 1.5: Unit Tests for All Primitives

**Goal:** >90% test coverage for all primitive SDF functions

**Implementation:**
```typescript
// File: tests/unit/rendering/sdf/SDFPrimitives.test.ts

import { describe, it, expect } from 'vitest';

describe('SDF Primitives', () => {
  describe('sdSphere', () => {
    it('should return correct distance at origin', () => {
      // Test sphere SDF function
      // Verify distance calculations
    });
    
    it('should handle edge cases', () => {
      // Zero radius
      // Negative radius
      // Very large radius
    });
  });
  
  // Repeat for all 20+ primitives
});
```

**Coverage Requirements:**
- All primitive types tested
- Edge cases covered (zero, negative, very large values)
- Distance calculations verified
- Transform combinations tested

**Files to Create:**
- `tests/unit/rendering/sdf/SDFPrimitives.test.ts` - Complete test suite

---

## 🚀 PHASE 0.2: ADVANCED FEATURES (Week 2)

### Task 2.1: Coordinate System Targeting

**Goal:** Target specific surface areas for foreign body joining, material blending

**Implementation:**
```typescript
// File: engine/rendering/sdf/CoordinateTargeting.ts

export interface CoordinateTarget {
  type: 'surface' | 'volume' | 'edge' | 'vertex';
  region: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'custom';
  customRegion?: (p: [number, number, number]) => boolean; // SDF function
  blendRadius?: number; // For smooth transitions
}

export function isInTargetRegion(
  point: [number, number, number],
  target: CoordinateTarget,
  primitive: SDFPrimitive
): boolean {
  switch (target.region) {
    case 'top':
      // Check if point is on top surface
      return point[1] > primitive.position[1] + primitive.params[0] * 0.9;
    case 'bottom':
      return point[1] < primitive.position[1] - primitive.params[0] * 0.9;
    case 'sides':
      // Check if point is on side surfaces
      return Math.abs(point[1] - primitive.position[1]) < primitive.params[0] * 0.1;
    case 'custom':
      return target.customRegion?.(point) ?? false;
    default:
      return true;
  }
}
```

**Integration:**
- Add to SDFPrimitive interface
- Use in foreign body joining
- Use in material blending

**Tests:**
- Unit tests for region detection
- Integration test: Visual verification of targeted regions

**Files to Create:**
- `engine/rendering/sdf/CoordinateTargeting.ts` - NEW FILE
- `tests/unit/rendering/sdf/CoordinateTargeting.test.ts` - NEW FILE

---

### Task 2.2: Material Blending API

**Goal:** Smooth material transitions (e.g., creature skin to fur, metal to rust)

**Implementation:**
```typescript
// File: engine/rendering/sdf/MaterialBlending.ts

export interface BlendMode {
  type: 'linear' | 'smooth' | 'noise' | 'gradient';
  strength: number;        // 0-1
  transitionDistance: number; // World units
  noiseScale?: number;     // For noise-based blending
  gradientDirection?: [number, number, number]; // For directional blending
}

export function blendMaterials(
  mat1: MaterialDefinition,
  mat2: MaterialDefinition,
  blendMode: BlendMode,
  distance: number
): MaterialDefinition {
  const t = Math.min(distance / blendMode.transitionDistance, 1.0);
  
  let blendFactor = t;
  if (blendMode.type === 'smooth') {
    blendFactor = t * t * (3 - 2 * t); // Smoothstep
  } else if (blendMode.type === 'noise') {
    // Add noise-based blending
    blendFactor = t + (Math.random() - 0.5) * blendMode.strength * 0.1;
  }
  
  return {
    id: `${mat1.id}-${mat2.id}-blend`,
    name: `${mat1.name} + ${mat2.name}`,
    albedo: lerpColor(mat1.albedo, mat2.albedo, blendFactor),
    metallic: lerp(mat1.metallic, mat2.metallic, blendFactor),
    roughness: lerp(mat1.roughness, mat2.roughness, blendFactor),
    // ... other properties
  };
}
```

**GLSL Implementation:**
- Add blending functions to shader
- Support per-primitive blend modes
- Visual blending verification

**Tests:**
- Unit tests for blend calculations
- Integration test: Visual material blending
- Performance test: Blending overhead

**Files to Create:**
- `engine/rendering/sdf/MaterialBlending.ts` - NEW FILE
- `tests/unit/rendering/sdf/MaterialBlending.test.ts` - NEW FILE

---

### Task 2.3: Foreign Body Joining API

**Goal:** Join separate objects cleanly (creature + tool, structure + foundation)

**Implementation:**
```typescript
// File: engine/rendering/sdf/ForeignBodyJoining.ts

export interface JoinOperation {
  type: 'attach' | 'merge' | 'weld';
  targetPrimitive: number;  // Index of primitive to join to
  targetCoordinate: CoordinateTarget;
  joinStrength: number;    // 0-1 (0 = loose, 1 = seamless)
  blendMaterials: boolean; // Blend materials at join point
}

export function joinPrimitives(
  source: SDFPrimitive,
  target: SDFPrimitive,
  operation: JoinOperation
): SDFPrimitive {
  // Calculate join point
  const joinPoint = calculateJoinPoint(source, target, operation.targetCoordinate);
  
  // Adjust source primitive position to join point
  const joinedPrimitive: SDFPrimitive = {
    ...source,
    position: joinPoint,
    operation: operation.type === 'weld' ? 'smooth-union' : 'union',
    operationStrength: operation.joinStrength,
  };
  
  if (operation.blendMaterials) {
    // Apply material blending at join point
    joinedPrimitive.blendMode = {
      type: 'smooth',
      strength: operation.joinStrength,
      transitionDistance: 0.1,
    };
  }
  
  return joinedPrimitive;
}
```

**GLSL Implementation:**
- Add join point calculations to shader
- Support smooth transitions at join points
- Visual verification

**Tests:**
- Unit tests for join calculations
- Integration test: Visual foreign body joining
- Test tool + creature, structure + foundation scenarios

**Files to Create:**
- `engine/rendering/sdf/ForeignBodyJoining.ts` - NEW FILE
- `tests/unit/rendering/sdf/ForeignBodyJoining.test.ts` - NEW FILE

---

### Task 2.4: R3F Lighting Integration

**Goal:** Auto-detect R3F scene lights instead of hardcoded light direction

**Implementation:**
```typescript
// Update SDFRenderer.tsx

import { useThree } from '@react-three/fiber';

export function SDFRenderer({ primitives, ... }: SDFRendererProps) {
  const { scene } = useThree();
  
  // Auto-detect lights
  const lights = useMemo(() => {
    const detectedLights: Array<{
      type: string;
      position: [number, number, number];
      color: [number, number, number];
      intensity: number;
      direction?: [number, number, number];
    }> = [];
    
    scene.traverse((child) => {
      if (child.type.includes('Light')) {
        if (child.type === 'DirectionalLight') {
          detectedLights.push({
            type: 'directional',
            position: [child.position.x, child.position.y, child.position.z],
            color: [child.color.r, child.color.g, child.color.b],
            intensity: child.intensity,
            direction: [child.position.x, child.position.y, child.position.z], // Directional
          });
        } else if (child.type === 'PointLight') {
          detectedLights.push({
            type: 'point',
            position: [child.position.x, child.position.y, child.position.z],
            color: [child.color.r, child.color.g, child.color.b],
            intensity: child.intensity,
          });
        }
        // ... other light types
      }
    });
    
    return detectedLights;
  }, [scene]);
  
  // Pass lights to shader
  const uniforms = useMemo(() => ({
    // ... existing uniforms ...
    uLights: { value: lights },
    uLightCount: { value: lights.length },
  }), [lights, ...]);
  
  // Update fragment shader
  const fragmentShader = useMemo(() => `
    // ... existing code ...
    
    uniform vec3 uLights[10]; // Max 10 lights
    uniform int uLightCount;
    
    vec3 lighting(vec3 p, vec3 n, vec3 rd, Material mat) {
      vec3 color = vec3(0.0);
      
      // Ambient
      color += mat.albedo * 0.1;
      
      // Loop through all lights
      for (int i = 0; i < uLightCount; i++) {
        vec3 lightDir = normalize(uLights[i].position - p);
        float diff = max(dot(n, lightDir), 0.0);
        color += mat.albedo * diff * uLights[i].intensity;
        
        // Specular
        vec3 halfDir = normalize(lightDir + -rd);
        float spec = pow(max(dot(n, halfDir), 0.0), 32.0 / (mat.roughness + 0.01));
        color += vec3(1.0) * spec * mat.metallic * 0.5;
      }
      
      return color;
    }
  `, [lights, ...]);
}
```

**Tests:**
- Integration test: Multiple light types
- Visual test: Lighting matches R3F scene
- Performance test: Multiple lights overhead

**Files to Create/Modify:**
- `engine/rendering/sdf/SDFRenderer.tsx` - R3F lighting integration
- `tests/integration/rendering/sdf/R3FLighting.test.tsx` - NEW FILE

---

### Task 2.5: Integration Tests

**Goal:** Comprehensive integration tests for all advanced features

**Test Files:**
- `tests/integration/rendering/sdf/CoordinateTargeting.test.tsx`
- `tests/integration/rendering/sdf/MaterialBlending.test.tsx`
- `tests/integration/rendering/sdf/ForeignBodyJoining.test.tsx`
- `tests/integration/rendering/sdf/R3FLighting.test.tsx`

**Coverage:**
- All features work together
- Performance acceptable
- Visual correctness

---

## 🔗 PHASE 0.3: ECS INTEGRATION (Week 3)

### Task 3.1: miniplex-react Hooks

**Goal:** Reactive rendering from ECS entities

**Implementation:**
```typescript
// File: engine/rendering/sdf/useSDFEntities.ts

import { useEntities } from 'miniplex-react';
import { useMemo } from 'react';
import { useGameState } from '../../../game/state/GameState';
import { SDFPrimitive } from './SDFPrimitives';
import { Entity } from 'miniplex';

export interface EntityQuery {
  with: string[];
  without?: string[];
}

export function useSDFEntities(query: EntityQuery): SDFPrimitive[] {
  const { world } = useGameState();
  
  if (!world) return [];
  
  const entities = useEntities(
    query.without
      ? world.entities.with(...query.with).without(...query.without)
      : world.entities.with(...query.with)
  );
  
  return useMemo(() => {
    return Array.from(entities).map(entity => entityToSDFPrimitive(entity));
  }, [entities]);
}

function entityToSDFPrimitive(entity: Entity): SDFPrimitive {
  // Convert ECS entity to SDF primitive
  const shape = entity.sdfShape;
  if (!shape) {
    throw new Error('Entity missing sdfShape component');
  }
  
  return {
    type: shape.primitiveType,
    position: entity.position ? [entity.position.x, entity.position.y, entity.position.z] : [0, 0, 0],
    rotation: shape.rotation,
    scale: shape.scale,
    params: shape.params,
    materialId: shape.materialId,
    textureSet: shape.textureSet,
    operation: shape.operation,
    operationStrength: shape.operationStrength,
    blendMode: shape.blendMode,
    coordinateTarget: shape.coordinateTarget,
  };
}
```

**Tests:**
- Unit tests for hook
- Integration test: Reactive updates
- E2E test: ECS changes trigger re-render

**Files to Create:**
- `engine/rendering/sdf/useSDFEntities.ts` - NEW FILE
- `tests/unit/rendering/sdf/useSDFEntities.test.ts` - NEW FILE

---

### Task 3.2: ECS Component Definitions

**Goal:** Add SDF shape component to ECS

**Implementation:**
```typescript
// File: engine/ecs/components/CoreComponents.ts

import { z } from 'zod';

export const SDFShape = {
  type: 'sdf-shape',
  schema: z.object({
    primitiveType: z.enum([
      'sphere', 'box', 'cylinder', 'cone', 'pyramid', 'torus',
      'octahedron', 'hexprism', 'capsule', 'porbital', 'dorbital',
      'ellipsoid', 'roundedBox', 'cappedCylinder', 'triPrism',
      'plane', 'roundCone', 'mengerSponge', 'gyroid',
      'superellipsoid', 'torusKnot'
    ]),
    params: z.array(z.number()),
    materialId: z.string(),
    rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
    scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
    textureSet: z.object({
      diffuse: z.string().optional(),
      normal: z.string().optional(),
      roughness: z.string().optional(),
      // ... other texture fields
    }).optional(),
    operation: z.enum(['union', 'subtract', 'intersect', 'smooth-union', 'smooth-subtract']).optional(),
    operationStrength: z.number().optional(),
    blendMode: z.object({
      type: z.enum(['linear', 'smooth', 'noise', 'gradient']),
      strength: z.number(),
      transitionDistance: z.number(),
    }).optional(),
    coordinateTarget: z.object({
      type: z.enum(['surface', 'volume', 'edge', 'vertex']),
      region: z.enum(['all', 'top', 'bottom', 'sides', 'front', 'back', 'custom']),
      blendRadius: z.number().optional(),
    }).optional(),
  }),
};
```

**Integration:**
- Add to CoreComponents export
- Update entity factory functions
- Test entity creation with SDF shapes

**Files to Create/Modify:**
- `engine/ecs/components/CoreComponents.ts` - Add SDFShape component
- `tests/unit/ecs/components/CoreComponents.test.ts` - Test SDFShape

---

### Task 3.3: Reactive Rendering System

**Goal:** Component that auto-updates from ECS

**Implementation:**
```typescript
// File: game/components/SDFEntityRenderer.tsx

import { useSDFEntities } from '../../../engine/rendering/sdf/useSDFEntities';
import { SDFRenderer } from '../../../engine/rendering/sdf/SDFRenderer';
import { EntityQuery } from '../../../engine/rendering/sdf/useSDFEntities';

interface SDFEntityRendererProps {
  query: EntityQuery;
}

export function SDFEntityRenderer({ query }: SDFEntityRendererProps) {
  const primitives = useSDFEntities(query);
  
  if (primitives.length === 0) return null;
  
  return <SDFRenderer primitives={primitives} />;
}
```

**Usage:**
```typescript
// In game scene
<SDFEntityRenderer query={{ with: ['sdfShape', 'position'] }} />
```

**Tests:**
- Integration test: ECS updates trigger re-render
- E2E test: Full reactive rendering pipeline
- Performance test: Many entities

**Files to Create:**
- `game/components/SDFEntityRenderer.tsx` - NEW FILE
- `tests/integration/rendering/sdf/MiniplexIntegration.test.tsx` - NEW FILE

---

### Task 3.4: E2E Tests for ECS Integration

**Goal:** End-to-end tests proving ECS integration works

**Implementation:**
```typescript
// File: tests/e2e/rendering/sdf-ecs-integration.spec.ts

import { test, expect } from '@playwright/test';

test.describe('SDF ECS Integration', () => {
  test('should render entities from ECS', async ({ page }) => {
    await page.goto('/demos/sdf-ecs');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    // Wait for entities to render
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await expect(canvas).toHaveScreenshot('sdf-ecs-integration.png', {
      threshold: 0.3,
    });
  });
  
  test('should update when ECS entities change', async ({ page }) => {
    await page.goto('/demos/sdf-ecs');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Trigger entity update
    await page.click('[data-testid="add-entity"]');
    
    await page.waitForTimeout(1000);
    
    // Verify update
    await expect(canvas).toHaveScreenshot('sdf-ecs-updated.png', {
      threshold: 0.3,
    });
  });
});
```

**Files to Create:**
- `tests/e2e/rendering/sdf-ecs-integration.spec.ts` - NEW FILE

---

## ⚡ PHASE 0.4: PERFORMANCE & POLISH (Week 4)

### Task 4.1: LOD System

**Goal:** Reduce raymarching steps for distant objects

**Implementation:**
```typescript
// File: engine/rendering/sdf/LODSystem.ts

export interface LODLevel {
  distance: number;      // Distance threshold
  maxSteps: number;      // Reduced steps for this LOD
  precision: number;     // Reduced precision
  skipPrimitives?: number[]; // Primitives to skip at this LOD
}

export function calculateLOD(
  primitive: SDFPrimitive,
  cameraPosition: [number, number, number],
  lodLevels: LODLevel[]
): LODLevel {
  const distance = Math.sqrt(
    Math.pow(primitive.position[0] - cameraPosition[0], 2) +
    Math.pow(primitive.position[1] - cameraPosition[1], 2) +
    Math.pow(primitive.position[2] - cameraPosition[2], 2)
  );
  
  // Find appropriate LOD level
  for (let i = lodLevels.length - 1; i >= 0; i--) {
    if (distance >= lodLevels[i].distance) {
      return lodLevels[i];
    }
  }
  
  return lodLevels[0]; // Highest detail
}
```

**Integration:**
- Add to SDFRenderer
- Pass LOD levels to shader
- Adjust raymarching per primitive

**Tests:**
- Performance test: LOD improves FPS
- Visual test: LOD doesn't degrade quality too much

**Files to Create:**
- `engine/rendering/sdf/LODSystem.ts` - NEW FILE
- `tests/unit/rendering/sdf/LODSystem.test.ts` - NEW FILE

---

### Task 4.2: Batching Optimization

**Goal:** Combine multiple primitives into single raymarch when possible

**Implementation:**
```typescript
// File: engine/rendering/sdf/BatchingSystem.ts

export function batchPrimitives(primitives: SDFPrimitive[]): SDFPrimitive[][] {
  const batches: SDFPrimitive[][] = [];
  const batchSize = 50; // Primitives per batch
  
  for (let i = 0; i < primitives.length; i += batchSize) {
    batches.push(primitives.slice(i, i + batchSize));
  }
  
  return batches;
}
```

**Integration:**
- Batch primitives in SDFRenderer
- Render batches separately
- Combine results

**Tests:**
- Performance test: Batching improves FPS
- Visual test: Batching doesn't change appearance

**Files to Create:**
- `engine/rendering/sdf/BatchingSystem.ts` - NEW FILE
- `tests/unit/rendering/sdf/BatchingSystem.test.ts` - NEW FILE

---

### Task 4.3: Frustum Culling

**Goal:** Skip raymarching for primitives outside view frustum

**Implementation:**
```typescript
// File: engine/rendering/sdf/FrustumCulling.ts

export function isInFrustum(
  primitive: SDFPrimitive,
  camera: THREE.Camera,
  bounds: THREE.Box3
): boolean {
  // Calculate primitive bounding box
  const primitiveBounds = calculatePrimitiveBounds(primitive);
  
  // Check if bounds intersect camera frustum
  return bounds.intersectsBox(primitiveBounds);
}
```

**Integration:**
- Filter primitives before rendering
- Update on camera movement

**Tests:**
- Performance test: Culling improves FPS
- Visual test: No visible primitives are culled

**Files to Create:**
- `engine/rendering/sdf/FrustumCulling.ts` - NEW FILE
- `tests/unit/rendering/sdf/FrustumCulling.test.ts` - NEW FILE

---

### Task 4.4: Adaptive Stepping

**Goal:** Increase step size for empty space, decrease near surfaces

**Implementation:**
```typescript
// Update SDFRenderer fragment shader

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  float stepSize = 0.1; // Initial step size
  
  for (int i = 0; i < int(uMaxSteps); i++) {
    vec3 p = ro + t * rd;
    float d = sceneSDF(p);
    
    if (d < uPrecision) break;
    
    // Adaptive stepping: larger steps in empty space
    if (d > 1.0) {
      stepSize = d * 0.9; // Large step
    } else {
      stepSize = d * 0.5; // Smaller step near surface
    }
    
    t += stepSize;
    
    if (t > uMaxDistance) break;
  }
  
  return t < uMaxDistance ? t : -1.0;
}
```

**Tests:**
- Performance test: Adaptive stepping improves FPS
- Visual test: No quality degradation

**Files to Create/Modify:**
- `engine/rendering/sdf/SDFRenderer.tsx` - Adaptive stepping

---

### Task 4.5: Performance Benchmarks

**Goal:** Verify 60fps with 100+ primitives

**Implementation:**
```typescript
// File: tests/performance/sdf-renderer.spec.ts

import { test, expect } from '@playwright/test';

test.describe('SDF Renderer Performance', () => {
  test('should maintain 60fps with 100 primitives', async ({ page }) => {
    await page.goto('/demos/sdf-performance?primitives=100');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Measure FPS
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function measure() {
          frames++;
          if (frames < 60) {
            requestAnimationFrame(measure);
          } else {
            const elapsed = performance.now() - start;
            resolve(frames / (elapsed / 1000));
          }
        }
        
        requestAnimationFrame(measure);
      });
    });
    
    expect(fps).toBeGreaterThan(55); // Allow some variance
  });
});
```

**Files to Create:**
- `tests/performance/sdf-renderer.spec.ts` - NEW FILE

---

### Task 4.6: Documentation

**Goal:** Complete API documentation

**Files to Create:**
- `docs/rendering/SDF_API.md` - Complete API reference
- `docs/rendering/SDF_PRIMITIVES.md` - All primitive types
- `docs/rendering/SDF_MATERIALS.md` - Material system
- `docs/rendering/SDF_OPERATIONS.md` - Boolean operations, blending, joining
- `docs/rendering/SDF_MINIPLEX_INTEGRATION.md` - ECS integration
- `examples/sdf-basic-primitives.tsx` - Basic examples
- `examples/sdf-material-blending.tsx` - Material blending examples
- `examples/sdf-foreign-body-joining.tsx` - Foreign body joining examples
- `examples/sdf-chemical-molecule.tsx` - Chemical rendering example

---

## 📸 VERTICAL SLICE DEMOS & PLAYWRIGHT SCREENSHOTS

### Demo Requirements

**Goal:** Create comprehensive vertical slice demos proving all Phase 0 capabilities

### Demo 1: Basic Primitives Showcase

**File:** `game/demos/SDFPrimitivesShowcase.tsx`

**Features:**
- All 20+ primitives rendered
- Different materials per primitive
- Rotation and scaling examples
- Boolean operations (union, subtract, intersect, smooth-union)

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-primitives-showcase.spec.ts

import { test, expect } from '@playwright/test';

test.describe('SDF Primitives Showcase', () => {
  test('should render all primitives correctly', async ({ page }) => {
    await page.goto('/demos/sdf-primitives');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000); // Wait for full render
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('sdf-primitives-showcase.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 5000,
    });
    
    // Take canvas-only screenshot
    await expect(canvas).toHaveScreenshot('sdf-primitives-canvas.png', {
      threshold: 0.3,
      maxDiffPixels: 2000,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-primitives-showcase.png` - Full page
- `test-results/sdf-primitives-canvas.png` - Canvas only

---

### Demo 2: Material System Showcase

**File:** `game/demos/SDFMaterialShowcase.tsx`

**Features:**
- Chemical materials (all 118 elements)
- Ecological materials (all 11 biomes)
- Per-primitive texture mapping
- Material blending examples

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-material-showcase.spec.ts

test.describe('SDF Material Showcase', () => {
  test('should render all material types', async ({ page }) => {
    await page.goto('/demos/sdf-materials');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    // Screenshot of chemical materials
    await expect(canvas).toHaveScreenshot('sdf-materials-chemical.png', {
      threshold: 0.3,
    });
    
    // Switch to ecological materials
    await page.click('[data-testid="switch-to-ecological"]');
    await page.waitForTimeout(1000);
    
    // Screenshot of ecological materials
    await expect(canvas).toHaveScreenshot('sdf-materials-ecological.png', {
      threshold: 0.3,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-materials-chemical.png`
- `test-results/sdf-materials-ecological.png`
- `test-results/sdf-materials-textured.png` - With textures

---

### Demo 3: Coordinate Targeting & Foreign Body Joining

**File:** `game/demos/SDFJoiningShowcase.tsx`

**Features:**
- Tool + creature joining
- Structure + foundation joining
- Coordinate targeting visualization
- Material blending at join points

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-joining-showcase.spec.ts

test.describe('SDF Foreign Body Joining', () => {
  test('should join objects correctly', async ({ page }) => {
    await page.goto('/demos/sdf-joining');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    // Screenshot: Tool + creature
    await expect(canvas).toHaveScreenshot('sdf-joining-tool-creature.png', {
      threshold: 0.3,
    });
    
    // Screenshot: Structure + foundation
    await page.click('[data-testid="show-structure"]');
    await page.waitForTimeout(1000);
    
    await expect(canvas).toHaveScreenshot('sdf-joining-structure-foundation.png', {
      threshold: 0.3,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-joining-tool-creature.png`
- `test-results/sdf-joining-structure-foundation.png`
- `test-results/sdf-joining-coordinate-targets.png` - Visualize targeting

---

### Demo 4: Material Blending Showcase

**File:** `game/demos/SDFBlendingShowcase.tsx`

**Features:**
- Linear blending
- Smooth blending
- Noise-based blending
- Gradient blending
- Real-world examples (skin to fur, metal to rust)

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-blending-showcase.spec.ts

test.describe('SDF Material Blending', () => {
  test('should blend materials correctly', async ({ page }) => {
    await page.goto('/demos/sdf-blending');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    // Screenshot: All blend modes
    await expect(canvas).toHaveScreenshot('sdf-blending-all-modes.png', {
      threshold: 0.3,
    });
    
    // Screenshot: Real-world examples
    await page.click('[data-testid="show-real-world"]');
    await page.waitForTimeout(1000);
    
    await expect(canvas).toHaveScreenshot('sdf-blending-real-world.png', {
      threshold: 0.3,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-blending-all-modes.png`
- `test-results/sdf-blending-real-world.png`

---

### Demo 5: R3F Lighting Integration

**File:** `game/demos/SDFLightingShowcase.tsx`

**Features:**
- Multiple directional lights
- Point lights
- Spot lights
- Auto-detection from R3F scene
- Lighting comparison (hardcoded vs auto-detected)

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-lighting-showcase.spec.ts

test.describe('SDF R3F Lighting', () => {
  test('should use R3F scene lights', async ({ page }) => {
    await page.goto('/demos/sdf-lighting');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    // Screenshot: Multiple lights
    await expect(canvas).toHaveScreenshot('sdf-lighting-multiple.png', {
      threshold: 0.3,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-lighting-multiple.png`
- `test-results/sdf-lighting-comparison.png` - Hardcoded vs auto

---

### Demo 6: ECS Integration Showcase

**File:** `game/demos/SDFECSShowcase.tsx`

**Features:**
- Entities from ECS rendered with SDF
- Reactive updates when ECS changes
- miniplex-react hooks integration
- Real-time entity addition/removal

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-ecs-showcase.spec.ts

test.describe('SDF ECS Integration', () => {
  test('should render ECS entities reactively', async ({ page }) => {
    await page.goto('/demos/sdf-ecs');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(2000);
    
    // Initial state
    await expect(canvas).toHaveScreenshot('sdf-ecs-initial.png', {
      threshold: 0.3,
    });
    
    // Add entity
    await page.click('[data-testid="add-entity"]');
    await page.waitForTimeout(1000);
    
    // Updated state
    await expect(canvas).toHaveScreenshot('sdf-ecs-updated.png', {
      threshold: 0.3,
    });
  });
});
```

**Screenshots Required:**
- `test-results/sdf-ecs-initial.png`
- `test-results/sdf-ecs-updated.png`
- `test-results/sdf-ecs-reactive.png` - Show reactivity

---

### Demo 7: Performance Benchmark

**File:** `game/demos/SDFPerformanceBenchmark.tsx`

**Features:**
- 10 primitives
- 50 primitives
- 100 primitives
- 200 primitives
- FPS counter
- Performance metrics

**Playwright Screenshot:**
```typescript
// File: tests/e2e/rendering/sdf-performance.spec.ts

test.describe('SDF Performance', () => {
  for (const count of [10, 50, 100, 200]) {
    test(`should maintain 60fps with ${count} primitives`, async ({ page }) => {
      await page.goto(`/demos/sdf-performance?count=${count}`);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 20000 });
      
      await page.waitForTimeout(3000);
      
      // Screenshot
      await expect(canvas).toHaveScreenshot(`sdf-performance-${count}.png`, {
        threshold: 0.3,
      });
      
      // Verify FPS
      const fps = await page.evaluate(() => {
        // FPS measurement code
      });
      
      expect(fps).toBeGreaterThan(55);
    });
  }
});
```

**Screenshots Required:**
- `test-results/sdf-performance-10.png`
- `test-results/sdf-performance-50.png`
- `test-results/sdf-performance-100.png`
- `test-results/sdf-performance-200.png`

---

### Demo 8: BaseSDFProof (Fixed)

**File:** `game/demos/BaseSDFProof.tsx` (UPDATE EXISTING)

**Features:**
- Complex primitives (octahedron, pyramid, torus, sphere)
- Boolean operations (subtract, smooth-union)
- PBR textures
- All Phase 0 features working together

**Playwright Screenshot:**
```typescript
// File: tests/e2e/base-sdf-proof.spec.ts (UPDATE EXISTING)

test.describe('Base SDF Renderer Proof', () => {
  test('should render complex, textured primitives without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && /shader|webgl|compile/i.test(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto('/demos/proof');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(3000);
    
    // Screenshot
    await expect(canvas).toHaveScreenshot('base-sdf-proof.png', {
      threshold: 0.3,
      maxDiffPixels: 2000,
    });

    expect(errors).toEqual([]);
  });
});
```

**Screenshots Required:**
- `test-results/base-sdf-proof.png` - Main proof screenshot

---

## 🎬 PLAYWRIGHT MCP SERVER USAGE

### Using Playwright MCP Server for Screenshots

**The Playwright MCP server provides tools for automated screenshot generation:**

1. **Navigate to demo page:**
```typescript
await mcp_playwright_navigate({ url: 'http://localhost:5000/demos/sdf-primitives' });
```

2. **Wait for canvas to be visible:**
```typescript
await mcp_playwright_wait_for_selector({ selector: 'canvas', timeout: 20000 });
```

3. **Take screenshot:**
```typescript
await mcp_playwright_screenshot({ 
  path: 'test-results/sdf-primitives-showcase.png',
  fullPage: true 
});
```

**For each vertical slice demo:**
- Navigate to demo URL
- Wait for canvas/rendering
- Take screenshot with descriptive filename
- Store in `test-results/` directory
- Include in PR as proof of functionality

---

## 📋 COMPLETE CHECKLIST

### Phase 0.1: Core API Expansion
- [ ] Add 10 new primitives (ellipsoid, roundedBox, cappedCylinder, triPrism, plane, roundCone, mengerSponge, gyroid, superellipsoid, torusKnot)
- [ ] Implement MaterialRegistry system
- [ ] Add per-primitive texture mapping
- [ ] Add rotation and scaling support
- [ ] Unit tests for all primitives (>90% coverage)

### Phase 0.2: Advanced Features
- [ ] Coordinate system targeting API
- [ ] Material blending API
- [ ] Foreign body joining API
- [ ] R3F lighting auto-detection
- [ ] Integration tests for all features

### Phase 0.3: ECS Integration
- [ ] miniplex-react hooks (useSDFEntities)
- [ ] ECS component definitions (SDFShape)
- [ ] Reactive rendering system (SDFEntityRenderer)
- [ ] E2E tests for ECS integration

### Phase 0.4: Performance & Polish
- [ ] LOD system
- [ ] Batching optimization
- [ ] Frustum culling
- [ ] Adaptive stepping
- [ ] Performance benchmarks (60fps with 100+ primitives)
- [ ] Complete API documentation
- [ ] Working examples for all features

### Vertical Slice Demos
- [ ] Demo 1: Basic Primitives Showcase
- [ ] Demo 2: Material System Showcase
- [ ] Demo 3: Coordinate Targeting & Foreign Body Joining
- [ ] Demo 4: Material Blending Showcase
- [ ] Demo 5: R3F Lighting Integration
- [ ] Demo 6: ECS Integration Showcase
- [ ] Demo 7: Performance Benchmark
- [ ] Demo 8: BaseSDFProof (Fixed)

### Playwright Screenshots
- [ ] All 8 demos have passing E2E tests
- [ ] All screenshots captured and stored in `test-results/`
- [ ] Screenshots included in PR as proof
- [ ] Visual regression tests passing

---

## 🚀 IMPLEMENTATION ORDER

**Week 1 (Phase 0.1):**
1. Add missing primitives
2. Implement MaterialRegistry
3. Add per-primitive textures
4. Add rotation/scaling
5. Write unit tests

**Week 2 (Phase 0.2):**
1. Coordinate targeting
2. Material blending
3. Foreign body joining
4. R3F lighting
5. Integration tests

**Week 3 (Phase 0.3):**
1. miniplex-react hooks
2. ECS components
3. Reactive rendering
4. E2E tests

**Week 4 (Phase 0.4):**
1. Performance optimizations
2. Documentation
3. Examples
4. Vertical slice demos
5. Playwright screenshots

---

## ✅ SUCCESS CRITERIA

**Phase 0 is complete when:**

1. ✅ All 20+ primitives implemented and tested
2. ✅ MaterialRegistry system working with chemical/ecological integration
3. ✅ Per-primitive texture mapping functional
4. ✅ Coordinate targeting API working
5. ✅ Material blending API working
6. ✅ Foreign body joining API working
7. ✅ R3F lighting auto-detection working
8. ✅ miniplex-react hooks reactive to ECS changes
9. ✅ All unit tests passing (>90% coverage)
10. ✅ All integration tests passing
11. ✅ All E2E tests passing (including BaseSDFProof)
12. ✅ Performance: 60fps with 100+ primitives
13. ✅ Complete API documentation
14. ✅ Working examples for all features
15. ✅ Vertical slice demos with Playwright screenshots

---

## 📝 NOTES

- **All code must be TypeScript with strict mode**
- **All tests must pass before PR submission**
- **All screenshots must be included in PR**
- **Documentation must be complete**
- **Performance benchmarks must meet targets**

---

**Last Updated:** January 2025  
**Next Step:** Begin Phase 0.1 implementation

