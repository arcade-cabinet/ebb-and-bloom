# Visual Blueprint Prioritization

**Updated**: 2025-01-09  
**Status**: POC Focus - Visual Blueprints First

## New Prioritization Order

### Phase 1: GEN0 Visual Blueprints (CURRENT POC)
**Goal**: Full rendering of planetary genesis with all visual blueprints

1. **GEN0 Macro**: Stellar system contexts
   - Visual properties: PBR materials, color palettes, procedural rules
   - Texture references: Metal, Rock textures from AmbientCG
   - Rendering: Full planet sphere with PBR materials

2. **GEN0 Meso**: Accretion patterns
   - Visual properties: Surface formation patterns
   - Texture references: Rock, Metal textures
   - Rendering: Surface features, craters, geological formations

3. **GEN0 Micro**: Core compositions
   - Visual properties: Material distributions
   - Texture references: Metal, Rock textures
   - Rendering: Stratified layers, material composition

**Implementation**: `packages/simulation` - React Three Fiber rendering

---

### Phase 2: GEN1 Visual Blueprints
**Goal**: Creature archetypes with full visual representation

1. **GEN1 Macro**: Ecological niches
   - Visual properties: Creature appearance, traits visualization
   - Texture references: Organic textures
   - Rendering: Creature models, trait indicators

2. **GEN1 Meso**: Population dynamics
   - Visual properties: Group behaviors, social structures
   - Rendering: Flocking behaviors, population density

3. **GEN1 Micro**: Individual physiology
   - Visual properties: Metabolic systems, health indicators
   - Rendering: Health bars, metabolic states

---

### Phase 3: GEN2 Visual Blueprints
**Goal**: Pack formations with visual representation

1. **GEN2 Macro**: Territorial geography
2. **GEN2 Meso**: Pack sociology
3. **GEN2 Micro**: Individual pack behavior

---

### Phase 4: GEN3 Visual Blueprints
**Goal**: Tool emergence with visual representation

1. **GEN3 Macro**: Tool categories
2. **GEN3 Meso**: Tool crafting processes
3. **GEN3 Micro**: Individual tool properties

---

### Phase 5: GEN4 Visual Blueprints
**Goal**: Tribe structures with visual representation

1. **GEN4 Macro**: Tribal structures
2. **GEN4 Meso**: Governance systems
3. **GEN4 Micro**: Traditions and rituals

---

### Phase 6: GEN5 Visual Blueprints
**Goal**: Building construction with visual representation

1. **GEN5 Macro**: Building types
2. **GEN5 Meso**: Construction processes
3. **GEN5 Micro**: Building details

---

### Phase 7: GEN6 Visual Blueprints
**Goal**: Abstract systems (religion, democracy) with visual representation

1. **GEN6 Macro**: Cosmologies
2. **GEN6 Meso**: Rituals
3. **GEN6 Micro**: Beliefs

---

## Implementation Strategy

### Current Focus: GEN0 POC
- ✅ All GEN0 data pools generated with proper nested JSON
- ✅ Backend integration to load GEN0 data
- ✅ `packages/simulation` created with React Three Fiber
- 🔄 Full GEN0 rendering implementation
- ⏳ Texture loading from AmbientCG manifest
- ⏳ Procedural surface generation from visual blueprints

### Next Steps
1. Complete GEN0 rendering in `packages/simulation`
2. Load textures from `packages/gen/public/textures/`
3. Apply PBR properties from visual blueprints
4. Implement procedural rules for surface variation
5. Add atmospheric effects
6. Move to GEN1 visual blueprints

---

## Key Principles

1. **Visual First**: Each generation's visual blueprints must be fully rendered before moving to next generation
2. **Progressive Enhancement**: Start with basic rendering, add complexity iteratively
3. **Data-Driven**: All visual properties come from generated data pools
4. **Idempotent Generation**: Regeneration doesn't overwrite existing data
5. **WARP/WEFT**: Visual blueprints inherit from previous generations (WARP) and define current generation (WEFT)

---

## File Structure

```
packages/
├── gen/                    # AI generation (complete)
│   └── data/archetypes/    # Generated JSON files
│       ├── gen0/
│       ├── gen1/
│       └── ...
│
├── backend/                # Simulation + API (complete)
│   └── src/gen-systems/
│       └── loadGenData.ts  # Loads gen data pools
│
└── simulation/             # Visual rendering (CURRENT POC)
    └── src/
        ├── components/
        │   └── PlanetSphere.tsx  # GEN0 rendering
        ├── hooks/
        │   └── useGen0Data.ts    # Load GEN0 data
        └── App.tsx               # Main app
```

---

**Status**: 🟢 GEN0 POC in progress - Full rendering implementation next

