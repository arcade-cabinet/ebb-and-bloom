# Engine Cleanup Plan

**Status:** In Progress  
**Goal:** Properly organize engine/src-old and engine/agents-old

---

## Current Situation

During the engine refactor, I created two temporary directories:

1. **`engine/src-old/`** - Full copy of `packages/game/src` as backup
2. **`engine/agents-old/`** - Moved from `packages/game/src/yuka-integration`

These need to be triaged: keep in engine, move to demo, or delete.

---

## Analysis

### `engine/agents-old/` (Yuka Integration)

**Contents:**
- `AgentLODSystem.ts` - ✅ KEEP (engine core)
- `AgentSpawner.ts` - ✅ KEEP (engine core)
- `agents/CreatureAgent.ts` - ✅ KEEP (engine core)
- `agents/PlanetaryAgent.ts` - ✅ KEEP (engine core)
- `agents/EntropyAgent.ts.bak` - ❌ DELETE (backup file)
- `agents/evaluators/*.ts` - ✅ KEEP (engine core)
- `behaviors/GravityBehavior.ts` - ✅ KEEP (engine core)

**Action:**
```bash
# Move to proper engine/agents/ structure
mv engine/agents-old/* engine/agents/
rmdir engine/agents-old
```

---

### `engine/src-old/` (Full Source Backup)

**Triage by Category:**

#### ✅ KEEP IN ENGINE (Already Moved)
- `laws/` - ✅ Already in `engine/laws/`
- `tables/` - ✅ Already in `engine/tables/`
- `utils/EnhancedRNG.ts` - ✅ Already in `engine/utils/`
- `seed/` - ✅ Already in `engine/utils/seed/`
- `simulation/` - ✅ Already in `engine/simulation/`
- `synthesis/` - ✅ Already in `engine/synthesis/`
- `ecology/` - ✅ Already in `engine/ecology/`
- `world/*.ts` (spawners) - ✅ Already in `engine/spawners/`

#### ✅ KEEP IN ENGINE (Need to Move)
- `src-old/engine/GameEngine.ts` - Core engine class
- `src-old/engine/GameEngineBackend.ts` - Backend API
- `src-old/generation/UniverseGenerator.ts` - Universe generation
- `src-old/physics/MonteCarloAccretion.ts` - Physics simulation
- `src-old/planetary/` - Planetary systems
- `src-old/procedural/` - Procedural generation (some parts)
- `src-old/systems/` - Core systems (creature behavior, etc.)

#### 📦 MOVE TO `src/demo/` (Game Layer)
- `src-old/player/` - FirstPersonControls, VirtualJoystick, ActionButtons
- `src-old/ui/` - Minimap, AdaptiveHUD
- `src-old/world/DialogueSystem.ts` - Game-specific
- `src-old/world/DialogueUI.ts` - Game-specific
- `src-old/world/InventorySystem.ts` - Game-specific
- `src-old/core/GameStateManager.ts` - Game state (not engine state)

#### 🔧 MOVE TO `tools/` or `scripts/`
- `src-old/cli/` - CLI tools (validation, testing, demos)
- `src-old/cli-tools/` - RNG testing tools

#### ⚠️ NEEDS REVIEW (BabylonJS-specific)
- `src-old/rendering/BabylonPBRSystem.ts` - ❌ DELETE (BabylonJS)
- `src-old/rendering/ElementalRenderer.ts` - 🔄 CONVERT to R3F
- `src-old/rendering/LODSystem.ts` - 🔄 ADAPT for R3F
- `src-old/renderers/` - 🔄 CONVERT to R3F components
- `src-old/audio/` - ⏳ FUTURE (audio engine)

#### ❌ DELETE (Duplicates/Obsolete)
- `src-old/constants/` - Duplicate of `engine/tables/`
- `src-old/utils/EventEmitter.ts` - Can use native EventTarget
- `src-old/utils/Logger.ts` - Use console or pino
- `src-old/utils/MobileGUI.ts` - Superseded by R3F
- `src-old/utils/router.ts` - Not needed
- `src-old/utils/storage.ts` - Use Web Storage API
- `src-old/gen-systems/` - Old generation system
- `src-old/schemas/` - Old schemas

---

## Recommended Actions

### Phase 1: Move Core Engine Systems ✅
```bash
# Create proper engine structure
mkdir -p engine/core engine/generation engine/physics engine/planetary engine/procedural

# Move core engine
mv engine/src-old/engine/* engine/core/

# Move generation
mv engine/src-old/generation/* engine/generation/

# Move physics
mv engine/src-old/physics/* engine/physics/

# Move planetary
mv engine/src-old/planetary/* engine/planetary/

# Move procedural systems (non-rendering)
mv engine/src-old/procedural/YukaGuidedGeneration.ts engine/procedural/
mv engine/src-old/procedural/CreatureMeshGenerator.ts engine/procedural/

# Move core systems
mv engine/src-old/systems/* engine/systems/
```

### Phase 2: Move Game Layer to Demo 📦
```bash
# Create demo structure
mkdir -p src/demo/{controls,ui,game-systems}

# Move player controls
mv engine/src-old/player/* src/demo/controls/

# Move UI
mv engine/src-old/ui/* src/demo/ui/

# Move game systems
mv engine/src-old/world/Dialogue*.ts src/demo/game-systems/
mv engine/src-old/world/InventorySystem.ts src/demo/game-systems/
mv engine/src-old/core/GameStateManager.ts src/demo/game-systems/
```

### Phase 3: Move Tools 🔧
```bash
# Create tools directory
mkdir -p tools/{cli,validation,testing}

# Move CLI tools
mv engine/src-old/cli/* tools/cli/
mv engine/src-old/cli-tools/* tools/testing/
```

### Phase 4: Handle Renderers 🔄
```bash
# Keep for conversion to R3F
mkdir -p src/demo/renderers-to-convert
mv engine/src-old/renderers/* src/demo/renderers-to-convert/
mv engine/src-old/rendering/* src/demo/renderers-to-convert/

# These will become R3F components:
# - MolecularVisuals.tsx (R3F)
# - StellarVisuals.tsx (R3F)
# - PlanetRenderer.tsx (R3F)
# - CreatureRenderer.tsx (R3F)
# etc.
```

### Phase 5: Cleanup ❌
```bash
# Delete obsolete/duplicate files
rm -rf engine/src-old/constants
rm -rf engine/src-old/gen-systems
rm -rf engine/src-old/schemas
rm engine/src-old/utils/{EventEmitter,Logger,MobileGUI,router,storage}.ts

# Delete what's left (should be empty)
rm -rf engine/src-old
```

### Phase 6: Fix Agents 🔧
```bash
# Move agents-old to proper location
mv engine/agents-old/* engine/agents/
rm engine/agents/agents/EntropyAgent.ts.bak  # Delete backup
rmdir engine/agents-old
```

---

## New Engine Structure (After Cleanup)

```
engine/
├── core/                  # Core engine classes
│   ├── GameEngine.ts
│   └── GameEngineBackend.ts
├── generation/            # Universe generation
│   ├── EnhancedUniverseGenerator.ts
│   └── SimpleUniverseGenerator.ts
├── physics/               # Physics systems
│   └── MonteCarloAccretion.ts
├── planetary/             # Planetary systems
│   ├── composition.ts
│   ├── layers.ts
│   └── noise.ts
├── procedural/            # Procedural generation
│   ├── YukaGuidedGeneration.ts
│   └── CreatureMeshGenerator.ts
├── systems/               # Core systems
│   ├── CreatureBehaviorSystem.ts
│   ├── PackFormationSystem.ts
│   └── ...
├── agents/                # Yuka agents (merged from agents-old)
│   ├── AgentSpawner.ts
│   ├── AgentLODSystem.ts
│   ├── CreatureAgent.ts
│   ├── PlanetaryAgent.ts
│   ├── evaluators/
│   └── behaviors/
├── laws/                  # Already organized ✅
├── spawners/              # Already organized ✅
├── simulation/            # Already organized ✅
├── synthesis/             # Already organized ✅
├── utils/                 # Already organized ✅
├── tables/                # Already organized ✅
└── index.ts               # Main export

src/demo/                  # Game/demo layer
├── controls/              # Player controls (from src-old/player)
│   ├── FirstPersonControls.ts
│   ├── VirtualJoystick.ts
│   └── ActionButtons.ts
├── ui/                    # UI components (from src-old/ui)
│   ├── Minimap.tsx
│   └── AdaptiveHUD.tsx
├── game-systems/          # Game-specific (from src-old/world)
│   ├── DialogueSystem.ts
│   ├── DialogueUI.ts
│   └── InventorySystem.ts
└── renderers-to-convert/  # BabylonJS → R3F conversion
    ├── MolecularVisuals.ts → MolecularVisuals.tsx (R3F)
    ├── StellarVisuals.ts → StellarVisuals.tsx (R3F)
    └── ...

tools/                     # Development tools
├── cli/                   # CLI tools
├── validation/            # Law validation
└── testing/               # Testing utilities
```

---

## Export Updates Needed

After cleanup, update `engine/index.ts`:

```typescript
// Core Engine
export { GameEngine } from './core/GameEngine';
export { GameEngineBackend } from './core/GameEngineBackend';

// Generation
export { EnhancedUniverseGenerator } from './generation/EnhancedUniverseGenerator';
export { SimpleUniverseGenerator } from './generation/SimpleUniverseGenerator';

// Physics
export { MonteCarloAccretion } from './physics/MonteCarloAccretion';

// Planetary
export * from './planetary';

// Procedural
export { YukaGuidedGeneration } from './procedural/YukaGuidedGeneration';
export { CreatureMeshGenerator } from './procedural/CreatureMeshGenerator';

// Systems
export * from './systems';

// Agents (now properly organized)
export { AgentSpawner } from './agents/AgentSpawner';
export { AgentLODSystem } from './agents/AgentLODSystem';
export { CreatureAgent } from './agents/CreatureAgent';
export { PlanetaryAgent } from './agents/PlanetaryAgent';

// ... existing exports (laws, spawners, simulation, etc.)
```

---

## Timeline

**Estimated:** 2-3 hours

1. **Phase 1** (30 min) - Move core engine systems
2. **Phase 2** (30 min) - Move game layer to demo
3. **Phase 3** (15 min) - Move tools
4. **Phase 4** (30 min) - Handle renderers
5. **Phase 5** (15 min) - Cleanup deletions
6. **Phase 6** (15 min) - Fix agents
7. **Testing** (30 min) - Verify imports work
8. **Git commit** (5 min) - "cleanup: organize engine structure"

---

## Questions to Resolve

1. **Audio engine** - Keep `src-old/audio/` for future or delete?
   - Recommendation: Keep in `engine/audio/` (future feature)

2. **Renderers** - Convert all to R3F or delete some?
   - Recommendation: Keep key ones (molecular, stellar, creature) for R3F conversion
   - Delete obsolete ones (BabylonJS-specific)

3. **CLI tools** - Worth keeping or delete?
   - Recommendation: Keep in `tools/` (useful for validation/testing)

---

**Next Step:** Execute Phase 1 and start organizing?

