# MIGRATION CHECKLIST

## Immediate Tasks (To Get Backend Working)

### 1. Move Core Game Logic to Backend ✅ START HERE

**Files to move** from `/src` to `/packages/backend/src`:

```bash
# Systems (ALL game logic)
mv src/systems packages/backend/src/

# Stores (Zustand state management)
mv src/stores packages/backend/src/

# Core types and utilities
mv src/core packages/backend/src/
mv src/utils packages/backend/src/

# World definitions
mv src/world packages/backend/src/
```

### 2. Delete Redundant Files ❌ CLEANUP

**Files to DELETE** (consolidated into proper CLI):
```bash
rm src/dev/cli-game.ts
rm src/dev/comprehensive-game-cli.ts
rm src/dev/simulate-game.ts
```

**Keep for now** (will be moved/refactored):
```bash
src/dev/GameDevCLI.ts          → Asset generation tools (keep)
src/dev/MockGen0Data.ts        → Move to backend
src/dev/test-gen0.ts           → Move to backend tests
src/dev/MasterEvolutionPipeline.ts → Move to backend
src/dev/EvolutionaryAgentWorkflows.ts → Move to backend
```

### 3. Wire Backend Systems to GameEngine

**File**: `packages/backend/src/engine/GameEngine.ts`

Currently skeleton. Needs to:
- Initialize all ECS systems
- Initialize Zustand stores
- Wire PlanetaryStructureStore
- Wire CreatureEvolutionStore
- Process commands through systems

### 4. Complete Backend API Endpoints

**File**: `packages/backend/src/server.ts`

Add endpoints for:
- Get creatures
- Get materials at position
- Get packs/tribes/buildings
- Get world score
- Execute dig command
- etc.

### 5. Complete CLI Commands

**File**: `packages/cli/src/index.ts`

Add commands:
- creatures
- packs
- tribes
- buildings
- dig <x> <y> <z>
- events
- score
- etc.

### 6. Test Backend + CLI Together

```bash
# Terminal 1
cd packages/backend
pnpm dev

# Terminal 2
cd packages/cli
pnpm dev

# Play!
ebb> init volcanic-world
ebb> gen
ebb> creatures
```

---

## File Movement Map

### From `/src` → `/packages/backend/src`

```
src/systems/                        → packages/backend/src/systems/
  - AIWorkflowRuntime.ts           ✅ KEEP
  - YukaIntegration.ts             ✅ KEEP
  - YukaSphereCoordinator.ts       ✅ KEEP
  - RawMaterialsSystem.ts          ✅ KEEP
  - CreatureArchetypeSystem.ts     ✅ KEEP
  - ToolArchetypeSystem.ts         ✅ KEEP
  - BuildingSystem.ts              ✅ KEEP
  - PackSocialSystem.ts            ✅ KEEP
  - CombatSystem.ts                ✅ KEEP
  - ConsciousnessSystem.ts         ✅ KEEP
  - DeconstructionSystem.ts        ✅ KEEP
  - GeneticSynthesisSystem.ts      ✅ KEEP
  - EnvironmentalPressureSystem.ts ✅ KEEP
  - PopulationDynamicsSystem.ts    ✅ KEEP
  - GameClock.ts                   ✅ KEEP
  - HaikuNarrativeSystem.ts        ✅ KEEP
  - SporeStyleCameraSystem.ts      → Frontend (not backend)
  - HapticGestureSystem.ts         → Frontend (not backend)
  - GestureActionMapper.ts         → Frontend (not backend)
  - TerrainSystem.ts               ✅ KEEP (procedural generation)
  - TextureSystem.ts               → Frontend (not backend)

src/stores/                         → packages/backend/src/stores/
  - PlanetaryStructureStore.ts     ✅ KEEP
  - CreatureEvolutionStore.ts      ✅ KEEP
  - EvolutionDataStore.ts          → Frontend (UI state)

src/core/                           → packages/backend/src/core/
  - generation-zero-types.ts       ✅ KEEP
  - rayStride.ts                   → Frontend (rendering)

src/utils/                          → packages/backend/src/utils/
  - Logger.ts                      ✅ KEEP (already copied)
  - FreesoundClient.ts             ✅ KEEP

src/world/                          → packages/backend/src/world/
  - ECSWorld.ts                    ✅ KEEP
  - CombatComponents.ts            ✅ KEEP

src/dev/                            → packages/backend/src/dev/ (SOME)
  - MockGen0Data.ts                ✅ MOVE
  - test-gen0.ts                   → packages/backend/test/
  - MasterEvolutionPipeline.ts     ✅ MOVE
  - EvolutionaryAgentWorkflows.ts  ✅ MOVE
  - GameDevCLI.ts                  ✅ MOVE (asset generation)
  - meshy/                         ✅ MOVE
  
  - cli-game.ts                    ❌ DELETE (replaced by proper CLI)
  - comprehensive-game-cli.ts      ❌ DELETE (replaced by proper CLI)
  - simulate-game.ts               ❌ DELETE (replaced by proper CLI)
```

### From `/src` → `/packages/frontend/src` (LATER)

```
src/components/                     → packages/frontend/src/components/
  - All React components           ✅ LATER

src/contexts/                       → packages/frontend/src/contexts/
  - WorldContext.tsx               ✅ LATER

src/stores/
  - EvolutionDataStore.ts          ✅ LATER (UI state only)

src/hooks/                          → packages/frontend/src/hooks/
  - usePlatformEvents.ts           ✅ LATER
  - useResponsiveScene.ts          ✅ LATER

src/audio/                          → packages/frontend/src/audio/
  - evoMorph.ts                    ✅ LATER

src/main.tsx                        → packages/frontend/src/main.tsx
src/App.tsx                         → packages/frontend/src/App.tsx
```

---

## Commands to Execute

### Step 1: Create backend source directories
```bash
cd packages/backend
mkdir -p src/systems src/stores src/core src/utils src/world src/dev
```

### Step 2: Move files (from workspace root)
```bash
# Systems
cp -r src/systems/* packages/backend/src/systems/

# Stores
cp -r src/stores/PlanetaryStructureStore.ts packages/backend/src/stores/
cp -r src/stores/CreatureEvolutionStore.ts packages/backend/src/stores/

# Core
cp -r src/core/generation-zero-types.ts packages/backend/src/core/

# Utils
cp -r src/utils/Logger.ts packages/backend/src/utils/
cp -r src/utils/FreesoundClient.ts packages/backend/src/utils/

# World
cp -r src/world/* packages/backend/src/world/

# Dev tools
cp src/dev/MockGen0Data.ts packages/backend/src/dev/
cp src/dev/MasterEvolutionPipeline.ts packages/backend/src/dev/
cp src/dev/EvolutionaryAgentWorkflows.ts packages/backend/src/dev/
cp src/dev/GameDevCLI.ts packages/backend/src/dev/
cp -r src/dev/meshy packages/backend/src/dev/
```

### Step 3: Install backend dependencies
```bash
cd packages/backend
pnpm install
```

### Step 4: Install CLI dependencies
```bash
cd ../cli
pnpm install
```

### Step 5: Test backend builds
```bash
cd ../backend
pnpm build
```

### Step 6: Test CLI builds
```bash
cd ../cli
pnpm build
```

### Step 7: Start backend
```bash
cd ../backend
pnpm dev
```

### Step 8: Start CLI (in another terminal)
```bash
cd packages/cli
pnpm dev
```

---

## Success Criteria

### ✅ Backend is working when:
- [ ] `pnpm dev:backend` starts server on port 3001
- [ ] `/health` endpoint responds
- [ ] Can create game via `/api/game/create`
- [ ] Can query game state via `/api/game/:id`
- [ ] All systems are initialized in GameEngine

### ✅ CLI is working when:
- [ ] `pnpm dev:cli` connects to backend
- [ ] `init` command creates game
- [ ] `cycle` command advances time
- [ ] `gen` command advances generation
- [ ] `status` command shows state

### ✅ Architecture is clean when:
- [ ] No game logic in CLI (only API calls)
- [ ] No React in backend
- [ ] No Three.js in backend
- [ ] All stores in backend
- [ ] All systems in backend
- [ ] Old CLI files deleted

---

## Next Session Plan

1. **Move all files** using commands above
2. **Wire GameEngine** to systems and stores
3. **Complete REST API** endpoints
4. **Complete CLI** commands
5. **Test backend + CLI** together
6. **Delete old files** that are redundant
7. **Update tests** to use new structure

**Goal**: Have working backend + CLI by end of session, with clear path to adding frontend later.

---

## Long-Term Vision

```
Current State:         Target State:
┌──────────────┐      ┌──────────────┐
│  /src        │      │ @ebb/backend │ ← All game logic
│  (everything)│      │  - systems   │
│              │ →    │  - stores    │
│              │      │  - REST API  │
│              │      └──────────────┘
│              │               ↓
│              │      ┌──────────────┐
│              │      │  @ebb/cli    │ ← Text interface
│              │      │  - commands  │
│              │      └──────────────┘
│              │               ↓
│              │      ┌──────────────┐
└──────────────┘      │ @ebb/frontend│ ← 3D visualization
                      │  - React     │
                      │  - Three.js  │
                      └──────────────┘
```

**Clean. Decomposed. Maintainable.**
