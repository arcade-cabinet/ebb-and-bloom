# Codebase Refactoring Roadmap - Eliminate Monoliths

**Status:** IN PROGRESS  
**Total Effort:** 9.5 weeks (10 steps)  
**Priority:** HIGH - Critical technical debt

---

## 🎯 Goals

Decompose all monolithic files (>400 LOC) into cohesive modular packages following single-responsibility principle.

**Target:** Every module ≤200 LOC, clear separation of concerns, tree-shakeable, testable

---

## 📊 Current State

### Critical Monoliths (>800 LOC)
1. ❌ **SDFPrimitives.ts** - 1562 lines (GLSL, primitives, operations, transforms, lighting)
2. ❌ **CosmicExpansionFMV.tsx** - 1206 lines (visualization, audio, haptics, controls)
3. ❌ **CosmicAudioSonification.ts** - 1080 lines (audio system for all cosmic stages)
4. ❌ **CosmicProvenanceTimeline.ts** - 967 lines (9 stages with constant calculations)
5. ❌ **SDFRenderer.tsx** - 805 lines (shader generation, uniforms, textures, lighting)
6. ❌ **MaterialRegistry.ts** - 764 lines (materials, blending, serialization, GLSL)

### Moderate Monoliths (400-700 LOC)
7. ❌ CosmicStageDescriptor.ts - 635 lines
8. ❌ ForeignBodyDemo.tsx - 529 lines
9. ❌ ForeignBodySystem.ts - 512 lines
10. ❌ CoordinateTargetingDemo.tsx - 437 lines
11. ❌ CulturalExpressionSystem.ts - 434 lines
12. ❌ ShelterBuilderGoal.ts - 427 lines
13. ❌ TradeSystem.ts - 401 lines
14. ❌ CosmicHapticFeedback.ts - 392 lines
15. ❌ WorkshopSystem.ts - 385 lines

---

## 🚀 Refactoring Plan

### **PHASE 1: SDF Rendering Stack** (2.5 weeks, HIGH PRIORITY)

#### **Step 1: SDFPrimitives.ts → Modular GLSL** (1 week)
**Current:** 1562 lines monolith  
**Target Structure:**
```
engine/rendering/sdf/
├── glsl/
│   ├── primitives/
│   │   ├── basic.glsl.ts (sphere, box, cylinder, cone, pyramid)
│   │   ├── advanced.glsl.ts (torus, octahedron, capsule, ellipsoid)
│   │   ├── complex.glsl.ts (mengerSponge, gyroid, torusKnot)
│   │   └── orbital.glsl.ts (porbital, dorbital - chemistry specific)
│   ├── operations.glsl.ts (union, subtract, intersect, smooth ops)
│   ├── transforms.glsl.ts (rotation, scaling, positioning)
│   ├── uv-generation.glsl.ts (UV mapping per primitive)
│   ├── lighting.glsl.ts (PBR, Phong, shadows, AO)
│   ├── blending.glsl.ts (material blending modes)
│   ├── targeting.glsl.ts (coordinate targeting regions)
│   ├── sampling.glsl.ts (surface normals, attachment points)
│   └── index.ts (exports combined shader code)
├── primitives/
│   ├── types.ts (SDFPrimitive interface, configs)
│   └── index.ts (TypeScript API)
└── types.ts (shared types)
```

**Acceptance:**
- [  ] Each GLSL module ≤150 LOC
- [  ] Tree-shakeable shader imports
- [  ] Shader compilation tests (Jest snapshots)
- [  ] All existing SDF tests pass
- [  ] No runtime performance regression

---

#### **Step 2: MaterialRegistry.ts → Modular Materials** (0.75 week)
**Current:** 764 lines monolith  
**Target Structure:**
```
engine/rendering/sdf/materials/
├── core/
│   ├── MaterialRegistry.ts (registry orchestrator <200 LOC)
│   └── types.ts (Material, TextureSet interfaces)
├── definitions/
│   ├── elements.ts (periodic table materials)
│   ├── special.ts (bond, default, custom materials)
│   └── index.ts
├── blending/
│   ├── modes.ts (linear, smooth, noise, gradient)
│   └── utils.ts (blend calculations)
├── serialization/
│   ├── json.ts (toJSON, fromJSON)
│   └── validation.ts
└── glsl/
    └── generator.ts (GLSL shader code generation)
```

**Acceptance:**
- [  ] Registry core ≤200 LOC
- [  ] Blending utilities unit-tested
- [  ] Existing MaterialRegistry behavior preserved
- [  ] SDFRenderer resolves materials/textures correctly

**Dependencies:** Step 1 (reorganized shader imports)

---

#### **Step 3: SDFRenderer.tsx → Modular Renderer** (0.75 week)
**Current:** 805 lines monolith  
**Target Structure:**
```
engine/rendering/sdf/renderer/
├── SDFRenderer.tsx (orchestrator <250 LOC)
├── uniforms/
│   ├── packer.ts (pack primitives to uniforms)
│   ├── materials.ts (material uniforms)
│   ├── transforms.ts (rotation/scale uniforms)
│   └── textures.ts (texture uniforms)
├── shaders/
│   ├── composer.ts (combine GLSL modules)
│   ├── fragment.ts (fragment shader template)
│   └── vertex.ts (vertex shader)
├── textures/
│   └── loader.ts (texture loading, fallbacks)
└── integration/
    ├── lights.ts (R3F light detection)
    └── hosts.ts (foreign body integration)
```

**Acceptance:**
- [  ] Main component ≤250 LOC
- [  ] Uniform packing unit-tested
- [  ] Runtime benchmarks unchanged
- [  ] All demos still work

**Dependencies:** Steps 1-2 (uses new material/shader APIs)

---

### **PHASE 2: Genesis Cinematic Pipeline** (3 weeks, HIGH PRIORITY)

#### **Step 4: CosmicProvenanceTimeline.ts → Modular Timeline** (1 week)
**Current:** 967 lines monolith  
**Target Structure:**
```
engine/genesis/timeline/
├── CosmicProvenanceTimeline.ts (orchestrator <300 LOC)
├── config/
│   ├── stages.json (stage metadata)
│   └── types.ts (stage interfaces)
├── calculators/
│   ├── quantum.ts (quantum fluctuation calcs)
│   ├── inflation.ts (cosmic inflation calcs)
│   ├── darkmatter.ts (dark matter web calcs)
│   ├── stars.ts (Pop III stars calcs)
│   ├── supernovae.ts (supernova calcs)
│   ├── galaxies.ts (galaxy formation calcs)
│   ├── clouds.ts (molecular cloud calcs)
│   ├── furnace.ts (stellar furnace calcs)
│   └── accretion.ts (planetary accretion calcs)
└── constants/
    └── extractor.ts (extract constants from stages)
```

**Acceptance:**
- [  ] Stage data as JSON configs
- [  ] Calculator functions unit-tested
- [  ] Consumers (GameState, FMV) unaffected
- [  ] Each calculator ≤150 LOC

---

#### **Step 5: CosmicAudioSonification.ts → Modular Audio** (1 week)
**Current:** 1080 lines monolith  
**Target Structure:**
```
engine/audio/cosmic/
├── CosmicAudioSonification.ts (orchestrator <200 LOC)
├── init/
│   ├── context.ts (Web Audio API context)
│   └── routing.ts (audio routing/buses)
├── voices/
│   ├── quantum.ts (quantum fluctuation audio)
│   ├── inflation.ts (cosmic inflation audio)
│   ├── darkmatter.ts (dark matter web audio)
│   ├── stars.ts (Pop III stars audio)
│   ├── supernovae.ts (supernova audio)
│   ├── galaxies.ts (galaxy formation audio)
│   ├── clouds.ts (molecular cloud audio)
│   ├── furnace.ts (stellar furnace audio)
│   └── accretion.ts (planetary accretion audio)
├── dsp/
│   ├── oscillators.ts (shared oscillator utils)
│   ├── envelopes.ts (ADSR envelopes)
│   ├── filters.ts (filter utilities)
│   └── effects.ts (reverb, delay, etc.)
└── scheduler/
    └── playback.ts (timeline synchronization)
```

**Acceptance:**
- [  ] Per-stage voice modules ≤150 LOC
- [  ] Audio unit tests updated
- [  ] Fallback handling isolated
- [  ] No audio glitches

**Dependencies:** Step 4 (aligned with timeline stages)

---

#### **Step 6: CosmicExpansionFMV.tsx → Modular FMV** (1 week)
**Current:** 1206 lines monolith  
**Target Structure:**
```
game/components/fmv/
├── CosmicExpansionFMV.tsx (container <300 LOC)
├── state/
│   ├── useFMVState.ts (state management hook)
│   └── useFMVControls.ts (play/pause/skip hooks)
├── visuals/
│   ├── QuantumFluctuationStage.tsx
│   ├── CosmicInflationStage.tsx
│   ├── DarkMatterWebStage.tsx
│   ├── PopIIIStarsStage.tsx
│   ├── SupernovaeStage.tsx
│   ├── GalaxyFormationStage.tsx
│   ├── MolecularCloudStage.tsx
│   ├── StellarFurnaceStage.tsx
│   └── PlanetaryAccretionStage.tsx
├── ui/
│   ├── ProgressBar.tsx
│   ├── StageInfo.tsx
│   └── Controls.tsx (play/pause/skip buttons)
└── integration/
    ├── useAudio.ts (audio integration hook)
    ├── useHaptics.ts (haptics integration hook)
    └── useGyroscope.ts (gyroscope integration hook)
```

**Acceptance:**
- [  ] Main component <300 LOC
- [  ] E2E FMV demo passes
- [  ] Lazy loading supported for stages
- [  ] Each stage component ≤200 LOC

**Dependencies:** Steps 4-5 (uses timeline/audio modules)

---

### **PHASE 3: Gameplay Demos & Systems** (2 weeks, MEDIUM PRIORITY)

#### **Step 7: ForeignBodySystem.ts → Modular Foreign Body** (0.5 week)
**Current:** 512 lines  
**Target Structure:**
```
engine/rendering/sdf/foreignbody/
├── ForeignBodySystem.ts (orchestrator <200 LOC)
├── host/
│   └── manager.ts (host primitive management)
├── composite/
│   └── builder.ts (build composite structures)
└── merging/
    └── merger.ts (SDF merge operations)
```

**Acceptance:**
- [  ] Clear interface exports
- [  ] Unit tests cover attach/merge/weld
- [  ] Each module ≤150 LOC

---

#### **Step 8: Demo Components → Shared Scaffolding** (1.5 weeks)
**Current:** ForeignBodyDemo.tsx (529), CoordinateTargetingDemo.tsx (437)  
**Target Structure:**
```
game/demos/
├── shared/
│   ├── DemoScaffold.tsx (common layout)
│   ├── DemoControls.tsx (Leva controls wrapper)
│   └── SceneConfig.tsx (scene setup utilities)
├── foreign-body/
│   ├── ForeignBodyDemo.tsx (<250 LOC)
│   ├── scenes/
│   │   ├── BacteriaScene.tsx
│   │   ├── MoleculeScene.tsx
│   │   └── SquirrelScene.tsx
│   └── controls.ts (control definitions)
└── coordinate-targeting/
    ├── CoordinateTargetingDemo.tsx (<250 LOC)
    ├── scenes/
    │   ├── TargetTypesScene.tsx
    │   └── RegionsScene.tsx
    └── controls.ts
```

**Acceptance:**
- [  ] Each demo component <250 LOC
- [  ] Playwright demo suite passes
- [  ] Shared scaffolding DRY

---

### **PHASE 4: Simulation & ECS** (2 weeks, MEDIUM PRIORITY)

#### **Step 9: CosmicStageDescriptor.ts → Schema Modules** (0.5 week)
**Current:** 635 lines  
**Target Structure:**
```
engine/genesis/stages/
├── CosmicStageDescriptor.ts (orchestrator <200 LOC)
├── schemas/
│   ├── types.ts (stage interfaces)
│   └── validation.ts (schema validation)
└── factories/
    ├── createQuantumStage.ts
    ├── createInflationStage.ts
    (... one factory per stage)
```

**Acceptance:**
- [  ] Descriptors consumed by StageOrchestrator unchanged
- [  ] Schema validation tested
- [  ] Each factory ≤100 LOC

**Dependencies:** Step 4 (aligned with timeline)

---

#### **Step 10: ECS Systems → Rule-Based Architecture** (1.5 weeks)
**Current:** Multiple systems (CulturalExpressionSystem 434, TradeSystem 401, WorkshopSystem 385, ShelterBuilderGoal 427)  
**Target Pattern:**
```
engine/systems/<SystemName>/
├── index.ts (system orchestrator <200 LOC)
├── schemas/
│   └── types.ts (data schemas)
├── rules/
│   └── engine.ts (rule evaluation)
└── ecs/
    └── adapter.ts (ECS integration)
```

**Acceptance:**
- [  ] Each module <200 LOC
- [  ] Integration tests unmodified
- [  ] Clear separation of data/rules/ECS

---

## 📈 Progress Tracking

### Completed
- ✅ GenesisConstants → Modular genesis modules (engine/genesis/modules/)

### In Progress
- [ ] Step 1: SDFPrimitives refactor

### Pending
- [ ] Steps 2-10

---

## 🎯 Success Metrics

- **Target:** 0 files >400 LOC
- **Current:** 15 files >400 LOC
- **Metric:** Average file size <200 LOC
- **Quality:** All tests passing, no performance regressions

---

## 🔧 Implementation Guidelines

1. **One refactoring at a time** - Complete and verify before moving to next
2. **Tests first** - Ensure existing tests pass throughout
3. **Backwards compatibility** - Deprecate old APIs, don't break consumers
4. **Document exports** - Clear JSDoc for each module
5. **Performance check** - Benchmark before/after for critical paths
6. **Git commits** - Small, atomic commits per module

---

**Last Updated:** 2025-01-12  
**Next Review:** After Phase 1 completion
