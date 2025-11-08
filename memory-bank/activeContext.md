# Active Context

**Last Updated**: 2025-11-08  
**Current Phase**: Unified Game Package Migration  
**Status**: Structural Migration 95% Complete, Functional Verification 0%

---

## CRITICAL STATUS

### ❌ SESSION GOALS NOT MET

**What was requested:**
1. Gen0 backend complete with full unit/integration tests
2. Full WARP/WEFT genesis from seed
3. Full exchange with simulation frontend
4. Complete end-to-end testing
5. E2E test in REAL Chromium browser with mouse/keyboard
6. Verify: Main menu > seed > simulation > 3D sphere + materials + celestial bodies
7. Run with process-compose to test on phone
8. Capacitor web build (proper cross-platform)
9. Move everything to packages/game
10. Internal API only (no public REST)

**What's actually done:**
- ✅ Gen0 backend complete (tests exist)
- ✅ WARP/WEFT working (untested post-migration)
- ⚠️ Frontend exchange migrated (NOT TESTED)
- ❌ E2E testing NOT RUN
- ❌ Real browser testing NOT VERIFIED
- ❌ Full flow NOT VERIFIED
- ❌ Phone access NOT TESTED
- ⚠️ Capacitor CONFIGURED but NOT BUILT
- ✅ Move to packages/game COMPLETE
- ✅ Internal API COMPLETE

**BLOCKING ISSUE**: Code does NOT compile (54 TypeScript errors)

---

## Current Focus

**UNIFIED GAME PACKAGE ARCHITECTURE**

### What Just Happened (Last 200+ Tool Calls)

**MASSIVE MIGRATION:**
1. Moved ALL of `packages/backend/` → `packages/game/src/`
2. Moved ALL of `packages/frontend/` → `packages/game/src/scenes/`
3. Removed `packages/backend` package entirely
4. Removed `packages/frontend` package entirely
5. Removed ALL REST API code (server.ts, routes, middleware)
6. Removed ALL React code (hooks, components, App.tsx)
7. Removed ALL Fastify dependencies
8. Created unified `packages/game/` with internal API only
9. Set up Protobuf schema for generation layer communication
10. Updated `packages/gen/` to output to `packages/game/`
11. Updated `packages/shared/` to remove DB code (schemas only)

### Architecture Change

**BEFORE:**
```
packages/backend/  → REST API server (Fastify)
packages/frontend/ → React frontend (fetch() calls)
Communication: HTTP REST API
```

**AFTER:**
```
packages/game/     → Unified package
  src/engine/      → GameEngine (internal API)
  src/gen0-6/      → Generation systems
  src/scenes/      → BabylonJS scenes
Communication: Direct function calls (no HTTP)
```

### File Movement Log

**Backend → Game:**
- `packages/backend/src/engine/` → `packages/game/src/engine/`
- `packages/backend/src/gen0/` → `packages/game/src/gen0/`
- `packages/backend/src/gen1/` → `packages/game/src/gen1/`
- `packages/backend/src/gen2/` → `packages/game/src/gen2/`
- `packages/backend/src/gen3/` → `packages/game/src/gen3/`
- `packages/backend/src/gen4/` → `packages/game/src/gen4/`
- `packages/backend/src/gen5/` → `packages/game/src/gen5/`
- `packages/backend/src/gen6/` → `packages/game/src/gen6/`
- `packages/backend/src/planetary/` → `packages/game/src/planetary/`
- `packages/backend/src/seed/` → `packages/game/src/seed/`
- `packages/backend/src/schemas/` → `packages/game/src/schemas/`
- `packages/backend/src/types/` → `packages/game/src/types/`
- `packages/backend/src/utils/` → `packages/game/src/utils/`
- `packages/backend/src/gen-systems/` → `packages/game/src/gen-systems/`
- `packages/backend/data/archetypes/` → `packages/game/data/archetypes/`
- `packages/backend/test/` → `packages/game/test-backend/`

**Frontend → Game:**
- `packages/frontend/src/scenes/` → `packages/game/src/scenes/`
- `packages/frontend/public/` → `packages/game/public/`
- `packages/frontend/test/` → `packages/game/test-frontend/`
- `packages/frontend/simulation/` → (merged into game)

**Removed:**
- `packages/backend/src/server.ts` (REST server)
- `packages/backend/src/resources/` (REST route handlers)
- `packages/backend/src/seed/seed-routes.ts` (REST routes)
- `packages/backend/src/seed/seed-middleware.ts` (Fastify middleware)
- `packages/frontend/src/hooks/` (React hooks - incompatible with BabylonJS)
- `packages/frontend/src/components/` (React components)
- `packages/frontend/src/App.tsx` (React app)
- `packages/frontend/src/index.tsx` (React entry)

### Gen Package Updates

**ALL paths updated:**
- `packages/gen/src/workflows/ui-asset-generator.ts` → outputs to `packages/game/public/`
- `packages/gen/src/workflows/fonts.ts` → outputs to `packages/game/public/fonts/`
- `packages/gen/src/downloaders/ambientcg.ts` → outputs to `packages/game/public/textures/`
- `packages/gen/src/generators/archetype-pools.ts` → outputs to `packages/game/data/archetypes/`
- `packages/gen/src/tools/structured-texture-tool.ts` → reads from `packages/game/public/textures/`
- `packages/gen/data/manifests/fonts.json` → references `packages/game/public/fonts/`

### Shared Package Updates

**DB code removed:**
- Deleted `packages/shared/src/db/` (drizzle, connection, schema)
- Deleted `packages/shared/migrations/`
- Deleted `packages/shared/drizzle.config.ts`
- Deleted `packages/shared/*.db` files
- Removed dependencies: drizzle-orm, drizzle-kit, drizzle-zod, better-sqlite3, axios
- **Result**: Schemas only (Zod schemas for game data structures)

---

## 🚨 BLOCKING ISSUES

### TypeScript Compilation Errors: 54

**Categories:**
1. **Unused variables** (~30): Variables declared but never read
2. **Implicit any** (~10): Missing type annotations
3. **Missing modules** (~8): Import path issues
4. **Schema mismatch** (~6): Planet type doesn't include moons/visualBlueprints

**Impact**: Code WILL NOT build until fixed

### Obsolete Tests: 4

Tests for REST endpoints that no longer exist:
- `test-backend/seed-api.integration.test.ts`
- `test-backend/seed-middleware.test.ts`
- `test-backend/gen0-api.integration.test.ts`
- `test-backend/api.integration.test.ts`

### Unverified Functionality

**Nothing has been tested since migration:**
- Dev server may not start
- Tests may be completely broken
- E2E flow completely unknown
- Phone access not attempted
- Capacitor build not run

---

## packages/game/ Structure

```
packages/game/
├── src/
│   ├── engine/
│   │   ├── GameEngine.ts (wrapper)
│   │   ├── GameEngineBackend.ts (core logic)
│   │   └── index.ts (exports)
│   ├── gen0/ (Accretion, Moons)
│   ├── gen1/ (Creatures)
│   ├── gen2/ (Packs)
│   ├── gen3/ (Tools)
│   ├── gen4/ (Tribes)
│   ├── gen5/ (Buildings)
│   ├── gen6/ (Religion/Democracy)
│   ├── gen-systems/ (WARP/WEFT data loaders)
│   ├── planetary/ (composition, layers, noise)
│   ├── seed/ (seed-manager.ts only - pure functions)
│   ├── schemas/ (type re-exports from @ebb/shared)
│   ├── scenes/
│   │   ├── MainMenuScene.ts (BabylonJS GUI)
│   │   ├── GameScene.ts (Unified scene for all gens)
│   │   └── SplashScreenScene.ts
│   ├── types/ (yuka.d.ts, generation-zero.ts)
│   └── utils/ (Logger, textureLoader)
├── data/archetypes/ (Gen0-6 WARP/WEFT data)
├── public/
│   ├── fonts/ (Playfair Display, Work Sans, JetBrains Mono)
│   ├── textures/ (AmbientCG materials)
│   ├── ui/ (icons, frames, hud, backgrounds, banners)
│   └── splash/ (splash screens)
├── test-backend/ (18 test files)
├── test-frontend/ (1 test file)
├── test-e2e/ (Playwright - empty, needs migration)
├── proto/ (game.proto - protobuf schema)
└── configs (vite, ts, vitest, playwright, capacitor)
```

---

## Internal API

**No HTTP, no REST, just function calls:**

```typescript
// packages/game/src/engine/GameEngine.ts
const engine = new GameEngine(gameId);
await engine.initialize(seed);         // Create game
const state = engine.getState();        // Get state
const data = await engine.getGen0RenderData(time); // Render data
await engine.advanceGeneration();      // Next generation
```

**Used by:**
- `MainMenuScene.ts` - Create/load games
- `GameScene.ts` - Load render data
- Tests - Direct function calls

---

## NEXT (Critical Path)

### IMMEDIATE (BLOCKING)
1. **Fix TypeScript errors** (54 errors)
   - Unused variables (prefix with `_` or remove)
   - Implicit any (add type annotations)
   - Missing exports (fix import paths)
   - Planet schema (add moons field or use type extension)

2. **Remove obsolete REST tests** (4 files)
   - Delete tests for endpoints that don't exist
   - Update remaining tests to use internal API

3. **Run test suite** - Verify migration didn't break tests
   - `pnpm test` in packages/game
   - Fix any broken imports
   - Update test expectations

### VERIFICATION
4. **Start dev server** - `pnpm dev` in packages/game
   - Verify it starts on port 5173
   - Verify assets load correctly
   - Check browser console for errors

5. **Manual E2E test**
   - Open http://localhost:5173
   - Click "Start New"
   - Enter seed
   - Click "Create World"
   - Verify navigation to ?gameId=...
   - Verify 3D sphere renders
   - Verify textures load
   - Verify moons render

6. **Automated E2E test**
   - `pnpm test:e2e`
   - Run in real Chromium (headless: false)
   - Verify mouse clicks work
   - Verify keyboard input works
   - Verify scene transitions

7. **Phone testing**
   - `process-compose up dev-game`
   - Access http://192.168.1.200:5173 on phone
   - Test touch interactions
   - Verify rendering performance

### BUILD
8. **Build for production**
   - `pnpm build`
   - Verify dist/ contains all assets
   - Check bundle size

9. **Capacitor sync**
   - `pnpm build:capacitor`
   - Verify iOS/Android/Web targets

---

## Documentation Status

### ❌ OUTDATED (Need updates):
- `docs/ARCHITECTURE.md` - References packages/backend, packages/frontend
- `memory-bank/agent-permanent-context.md` - Old structure
- `memory-bank/activeContext.md` - (THIS FILE - being updated now)
- `memory-bank/progress.md` - Missing migration work

### ✅ UP TO DATE:
- `docs/DESIGN.md` - BabylonJS, UI assets strategy
- `docs/ARCHITECTURE_UNIFIED_GAME.md` - Proposed architecture (now implemented)
- `MIGRATION_ASSESSMENT.md` - Just created with full status

---

## Key Decisions Made

1. **No cp usage** - All files written/moved properly with git mv or direct write
2. **No React** - BabylonJS only, React incompatible
3. **No REST** - Internal API with direct function calls
4. **No public API** - All functions internal and testable
5. **Protobuf ready** - Schema created for future generation layer protocol
6. **Cross-platform** - Capacitor configured for iOS/Android/Web
7. **Single source of truth** - packages/game/ is the only package

---

## What Works (Theoretically)

**IF TypeScript compiled:**
- GameEngine initialization
- Gen0 planet creation
- WARP/WEFT data loading
- BabylonJS scene rendering
- Seed management
- Internal API

**Actually verified:**
- File structure
- Dependencies installed
- Configs created

**NOT verified:**
- Compilation
- Runtime execution
- Test suite
- E2E flow
- Phone access
- Build process

---

## Agent Instructions

**For next agent (BEAST MODE):**
1. Fix all TypeScript errors - NO STATUS UPDATES until done
2. Remove obsolete tests - NO PAUSES
3. Run full test suite - ITERATE until passing
4. Start dev server - VERIFY it works
5. Run E2E tests - REAL Chromium browser
6. Test on phone - process-compose
7. Update documentation - ALL files aligned
8. Build for production - Capacitor sync
9. Final verification - Complete flow end-to-end

**NO STOPS. NO BREAKS. COMPLETE THE MISSION.**

See: `AGENT_HANDOFF.md` for comprehensive instructions.

---

## Warnings & Gotchas

- **sed usage broke code** - Reverted but may have residual issues
- **Planet schema mismatch** - Needs moons field or type extension
- **Test imports** - May reference old package locations
- **REST test files** - Will fail (endpoints don't exist)
- **React artifacts** - Hooks/components lingering, needs removal
- **Gen code still uses rng()** - Some instances not properly scoped

---

## Files Modified (Last Session)

**Created:**
- `packages/game/` (entire package)
- `packages/game/proto/game.proto`
- `packages/game/vitest.config.ts`
- `packages/game/playwright.config.ts`
- `MIGRATION_ASSESSMENT.md`

**Moved:**
- ALL backend code → packages/game/src/
- ALL frontend code → packages/game/src/scenes/
- ALL data → packages/game/data/
- ALL tests → packages/game/test-*/
- ALL assets → packages/game/public/

**Deleted:**
- `packages/backend/` (entire package)
- `packages/frontend/` (entire package)
- `packages/shared/src/db/`
- React hooks, components, App.tsx
- REST server, routes, middleware

**Modified:**
- `packages/gen/` - All output paths to packages/game
- `packages/shared/` - DB code removed
- `process-compose.yml` - Single dev-game service
- All scene files - Use GameEngine directly (no fetch)

---

## Current Task

**FIX TYPESCRIPT ERRORS** - 54 remaining

Then run tests, verify E2E, test on phone, update docs.

**Status**: IN PROGRESS (paused for documentation)
