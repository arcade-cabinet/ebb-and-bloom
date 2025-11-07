# Asset Generation Strategy

**Version**: 1.0  
**Status**: FROZEN  

---

## Core Principle: Archetypal Synthesis vs Static Assets

**The Key Distinction**:
- **Archetypal Forms** (evolve, combine, synthesize) → PROCEDURAL
- **Inventory Items** (picked up, placed, static) → MESHY

**Why This Matters**:
Creatures and buildings are **archetypal** - they evolve, recombine traits, and synthesize new forms. This requires **textures over geometric frameworks** for infinite recombination.

Props and inventory items are **static** - they're just picked up or placed. They never join together or evolve. Meshy models work perfectly.

**Ebb & Bloom uses:**
- **Procedural (textures + geometry)**: Creatures, buildings (archetypal forms)
- **Meshy 3D Models**: Props, collectibles, inventory (static items)
- **gpt-image-1**: UI elements

---

## Asset Categories

### 1. Creatures - PROCEDURAL (Archetypal Forms)
**Method**: Geometric shapes + AmbientCG textures + ECS traits

**Why Procedural**: Creatures are **archetypal** - they evolve and synthesize new forms from trait recombination. Can't do this with static models.

**Generation Process**:
1. ECS traits define morphology (size, limbs, features)
2. Procedural geometry builder creates mesh from traits
3. AmbientCG textures applied based on environment/evolution
4. Traits recombine → new archetypal forms emerge
5. Result: Infinite creature variations through synthesis

**Textures Needed**:
- Skin/fur: `Leather003`, `Fabric020`, `FurPattern001`
- Scales: `RockFacet002`, `Metal012` (for armored)
- Organic: `Moss001`, `TreeBark002` (for forest creatures)

**Examples**:
- **Cursorial Forager**: Lean body, long limbs → `Leather003` + `Fabric020`
- **Burrow Engineer**: Compact, clawed → `Leather003` + `Metal012` (claws)
- **Littoral Harvester**: Webbed, moisture-adapted → `Leather003` + `Moss001`

---

### 2. Buildings - PROCEDURAL (Archetypal Forms)
**Method**: Geometric construction + AmbientCG textures + assembly manifests

**Why Procedural**: Buildings are **archetypal** - they evolve through tiers (Windbreak→Hut→Longhouse) and combine materials. Need texture-over-framework synthesis.

**Generation Process**:
1. Assembly manifest defines structure (posts, beams, cladding)
2. Procedural builder creates geometry from manifest
3. AmbientCG textures applied per material type
4. Archetypes evolve and merge (workshop + shelter = crafting hall)
5. Result: Buildings synthesize from archetypal components

**Textures Needed** (from manifests):
- Wood beams: `WoodBeam001-004`
- Roundwood: `WoodRound001`
- Bark panels: `TreeBarkBirch002`
- Thatch: `ThatchRoof001`
- Leather/hides: `Leather003`
- Rope: `Rope001`
- Daub/clay: `PlasterRough014`, `Clay002`
- Stone: `StoneFieldstone010`, `CobblestoneHex001`
- Earth: `Gravel019`, `GroundMud007`

**Examples**:
- **Windbreak**: Forked posts + ridge pole + hide skin
- **Hut**: Timber frame + thatch roof + daub walls
- **Longhouse**: Extended frame + workshop bays + smoke vents

---

### 3. Props & Collectibles - MESHY 3D MODELS (Static Items)
**Method**: Meshy text-to-3D → GLB models

**Why Meshy**: Props are **static inventory items** - they're picked up, placed, or held. They NEVER combine into evolved forms. No need for archetypal synthesis.

**Generation Process**:
1. Define prop in manifest with prompt
2. Meshy generates base model (preview → refine)
3. Optional: Generate texture variants via retexturing
4. Download GLB to `public/models/`
5. Result: Game-ready low-poly 3D models

**What Needs Meshy** (static items, never synthesize):
- **Raw materials**: Ore clumps, river rocks, crystal clusters (just picked up)
- **Environmental detail**: Shrubs, bushes, debris piles, fallen logs (just scenery)
- **Sign posts**: Directional markers, territory markers (just placed)
- **Indoor props**: Furniture, tools, containers, decorative items (just objects)
- **Held items**: Tools, weapons, gathered resources (just equipped)
- **Collectibles**: Unique pickups, artifacts (just inventory)

**Meshy Specs**:
- Art style: `sculpture` (cartoon/stylized)
- Target polycount: 500-2000 (mobile-friendly)
- Enable PBR textures
- No rigging needed (static props)

**Examples**:
```typescript
{
  id: 'rock-ore-copper',
  prompt: 'copper ore rock, greenish mineral veins, rough stone, low-poly game asset',
  artStyle: 'realistic',
  polycount: 800,
}
```

---

### 4. UI Elements - AI GENERATED (gpt-image-1)
**Method**: gpt-image-1 → sharp post-processing

**Generation Process**:
1. Generate at 1024+ (gpt-image-1 sizes: 1024x1024, 1024x1536, 1536x1024)
2. Post-process with sharp to target dimensions
3. Verify transparency, optimize compression
4. Result: Clean UI assets at proper sizes

**Asset Types**:
- **Splash screens**: 1080x1920 (portrait, full screen)
- **Buttons**: 200x50 (small, transparent)
- **Icons**: 128x128 (trait indicators, transparent)
- **Panels**: 800x600 (semi-transparent backgrounds)

**Post-Processing Requirements** (from `asset-manifest.ts`):
- `expectedSize`: Target dimensions for resize
- `requiresTransparency`: White background removal
- `maxFileSizeKB`: Compression target
- `aiPrompt`: Generation instructions

---

## Texture Library: AmbientCG

**Source**: https://ambientcg.com/  
**License**: CC0 (Public Domain)  
**Resolution**: 1K for mobile (2K/4K for desktop future)

**Download Script**: `pnpm setup:textures`  
**Manifest**: `public/textures/manifest.json`

**Categories Used**:
- Wood (beams, planks, bark)
- Fabric (leather, textiles)
- Ground (mud, gravel, stone)
- Nature (moss, grass, thatch)
- Metal (for tools, reinforcements)

---

## Workflow Summary

### Creature Generation
```bash
# ECS defines traits → Procedural geometry → Texture application
pnpm evolution:pipeline  # Generates archetype manifests
# Rendering engine reads manifests and builds creatures procedurally
```

### Building Generation
```bash
# Assembly manifest defines structure → Procedural builder → Texture application
# manifests/buildings/*.md → Geometry → AmbientCG textures
```

### UI Generation
```bash
# Asset manifest defines specs → gpt-image-1 → sharp post-processing
pnpm dev:cli generate-all  # Reads asset-manifest.ts, generates all UI
```

---

## Key Files

**Manifests**:
- `src/dev/asset-manifest.ts` - Declarative UI asset definitions
- `manifests/buildings/*.md` - Building assembly instructions
- `manifests/evolutionary-archetypes.json` - Creature trait definitions

**Generators**:
- `src/dev/GameDevCLI.ts` - UI asset generator (gpt-image-1 + sharp)
- `src/build/ambientcg-downloader.ts` - Texture library downloader

**Rendering** (future):
- Procedural creature renderer (reads ECS traits)
- Procedural building renderer (reads assembly manifests)

---

## Why Hybrid Strategy?

**Procedural (Creatures/Buildings)**:
- Infinite variations from trait combinations
- Direct evolution → visual mapping
- Instant iteration (change traits, update visuals)
- Zero per-model costs

**Meshy (Props/Collectibles)**:
- Realistic detail impossible procedurally
- Environmental richness and depth
- Held items and pickups need proper 3D forms
- One-time generation cost, unlimited reuse

**gpt-image-1 (UI)**:
- High-quality 2D assets
- Perfect for splash screens, icons, buttons
- Post-processing ensures proper dimensions/transparency

**Trade-off**: Hybrid approach balances visual quality, performance, and cost

---

## Asset Manifest Pattern (from otter-river-rush)

**Each asset includes**:
- `expectedSize`: Target dimensions after post-processing
- `requiresTransparency`: Boolean for transparency handling
- `maxFileSizeKB`: Compression target
- `aiPrompt`: Generation instructions (UI only)
- `priority`: critical | high | medium | low

**Example**:
```typescript
{
  id: 'button-evolution-tree',
  expectedSize: { width: 200, height: 50 },
  requiresTransparency: true,
  maxFileSizeKB: 20,
  aiPrompt: 'Organic evolution tree button...',
}
```

Post-processor reads this and ensures output matches specs.

