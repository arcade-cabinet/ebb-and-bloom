# Agent Handoff Document

**Date**: 2025-11-08  
**From**: Migration Agent  
**To**: Next Agent (BEAST MODE)  
**Status**: Structural Migration 95%, Functional Verification 0%

---

## 🎯 MISSION

Complete the unified game package and verify the full Gen0 flow end-to-end.

**SUCCESS CRITERIA:**
1. ✅ TypeScript compiles with ZERO errors
2. ✅ All tests pass (unit, integration, E2E)
3. ✅ Dev server runs on http://localhost:5173
4. ✅ E2E flow verified in REAL Chromium browser:
   - Main menu loads
   - "Start New" button click
   - Seed input modal appears
   - Seed entry via keyboard
   - "Create World" button click
   - Navigation to ?gameId=...
   - 3D sphere renders with accretion data
   - AmbientCG textures loaded and applied
   - Moons render with orbital animation
   - Celestial scene assembled (planet, moons, lighting, camera)
5. ✅ Phone testing works via process-compose (http://192.168.1.200:5173)
6. ✅ All documentation aligned with codebase

---

## 📚 TABLE OF CONTENTS

### Project Documentation
1. **ARCHITECTURE.md** - Overall system architecture
2. **DESIGN.md** - UI/UX design system
3. **MIGRATION_ASSESSMENT.md** - Current migration status (just created)
4. **docs/ARCHITECTURE_UNIFIED_GAME.md** - Unified package rationale

### Memory Bank
5. **memory-bank/activeContext.md** - Current focus (just updated)
6. **memory-bank/progress.md** - Project progress (just updated)
7. **memory-bank/agent-permanent-context.md** - Permanent project facts
8. **memory-bank/agent-collaboration.md** - Multi-agent rules

### Technical Docs
9. **packages/game/README.md** - (needs creation)
10. **packages/gen/README.md** - Generation pipeline
11. **packages/shared/README.md** - Schemas package

### Configuration Files
12. **process-compose.yml** - Development services
13. **packages/game/vite.config.ts** - Vite configuration
14. **packages/game/tsconfig.json** - TypeScript configuration
15. **packages/game/vitest.config.ts** - Test configuration
16. **packages/game/playwright.config.ts** - E2E test configuration
17. **packages/game/capacitor.config.ts** - Cross-platform configuration

---

## 🚨 CURRENT STATE

### What's Done
- ✅ ALL code moved to packages/game/
- ✅ packages/backend DELETED
- ✅ packages/frontend DELETED
- ✅ REST API removed (server.ts, routes, middleware)
- ✅ React removed (hooks, components, App.tsx)
- ✅ Internal API created (GameEngine with direct calls)
- ✅ Protobuf schema created (proto/game.proto)
- ✅ All dependencies installed
- ✅ All configs created
- ✅ process-compose.yml updated
- ✅ packages/gen paths updated to packages/game
- ✅ packages/shared DB code removed

### What's NOT Done
- ❌ TypeScript DOES NOT COMPILE (54 errors)
- ❌ Tests NOT RUN since migration
- ❌ Dev server NOT TESTED
- ❌ E2E flow UNVERIFIED
- ❌ Phone access UNTESTED
- ❌ Documentation OUTDATED
- ❌ Capacitor NOT BUILT

---

## 🔥 BEAST MODE CHECKLIST

**Execute ALL of the following with ZERO pauses or status updates:**

### Part 1: Fix TypeScript (BLOCKING)
- [ ] Fix all 54 TypeScript compilation errors
  - [ ] Remove/prefix unused variables (`_` prefix)
  - [ ] Add type annotations for implicit any
  - [ ] Fix import paths in engine/index.ts
  - [ ] Fix Planet schema mismatch (moons field)
  - [ ] Fix MoonCalculation export structure
  - [ ] Fix Gen1-6 system unused vars
  - [ ] Fix loadGenData unused params
- [ ] Verify: `pnpm exec tsc --noEmit` returns 0 errors
- [ ] Fix any linter warnings

### Part 2: Clean Up Tests
- [ ] Delete obsolete REST tests:
  - [ ] test-backend/seed-api.integration.test.ts
  - [ ] test-backend/seed-middleware.test.ts
  - [ ] test-backend/gen0-api.integration.test.ts
  - [ ] test-backend/api.integration.test.ts
- [ ] Fix test imports to use new package structure
- [ ] Update test expectations for internal API
- [ ] Consolidate test-backend/ and test-frontend/ into test/

### Part 3: Run Tests
- [ ] Run unit tests: `cd packages/game && pnpm test`
- [ ] Fix any failing tests
- [ ] Verify all tests pass
- [ ] Check coverage report

### Part 4: Verify Dev Server
- [ ] Start dev server: `cd packages/game && pnpm dev`
- [ ] Open http://localhost:5173 in browser
- [ ] Verify no console errors
- [ ] Verify assets load (fonts, textures, UI)
- [ ] Verify main menu renders
- [ ] Verify splash screen works

### Part 5: Manual E2E Testing
- [ ] Open http://localhost:5173
- [ ] Click "Start New" button
- [ ] Verify seed input modal appears
- [ ] Enter seed: "v1-test-world-seed"
- [ ] Click "Create World" button
- [ ] Verify navigation to ?gameId=...
- [ ] Verify 3D sphere renders
- [ ] Verify textures load (check network tab)
- [ ] Verify moons render
- [ ] Verify orbital animation works
- [ ] Check browser console for errors

### Part 6: Automated E2E Testing
- [ ] Update E2E tests for new structure
- [ ] Run: `cd packages/game && pnpm test:e2e`
- [ ] Verify tests pass in real Chromium (headless: false)
- [ ] Check screenshots/videos if any failures
- [ ] Fix any E2E test failures
- [ ] Re-run until all pass

### Part 7: Phone Testing
- [ ] Run: `process-compose up dev-game`
- [ ] Get computer IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- [ ] Access from phone: http://<ip>:5173
- [ ] Test touch interactions
- [ ] Test seed input on mobile keyboard
- [ ] Verify 3D rendering on phone
- [ ] Test performance

### Part 8: Build & Deploy Prep
- [ ] Build: `cd packages/game && pnpm build`
- [ ] Verify dist/ directory created
- [ ] Check bundle size
- [ ] Preview: `pnpm preview`
- [ ] Verify production build works
- [ ] Capacitor sync: `pnpm build:capacitor`
- [ ] Verify iOS/Android/Web targets ready

### Part 9: Documentation Update
- [ ] Update docs/ARCHITECTURE.md
  - [ ] Remove references to packages/backend
  - [ ] Remove references to packages/frontend
  - [ ] Add packages/game architecture
  - [ ] Update internal API section
  - [ ] Remove REST API sections
- [ ] Update memory-bank/agent-permanent-context.md
  - [ ] New monorepo structure
  - [ ] Unified package architecture
  - [ ] Internal API patterns
- [ ] Update docs/DESIGN.md if needed
- [ ] Verify all docs align with actual code

### Part 10: Final Verification
- [ ] Run full test suite one more time
- [ ] Run E2E tests one more time
- [ ] Start dev server and manually test complete flow
- [ ] Test on phone one more time
- [ ] Verify all goals from original session are met

---

## 🛠️ TECHNICAL CONTEXT

### Package Structure (CURRENT)

```
ebb-and-bloom/
├── packages/
│   ├── game/          ← ✅ UNIFIED PACKAGE
│   │   ├── src/
│   │   │   ├── engine/        # GameEngine (internal API)
│   │   │   ├── gen0-6/        # Generation systems
│   │   │   ├── scenes/        # BabylonJS scenes
│   │   │   ├── gen-systems/   # WARP/WEFT loaders
│   │   │   ├── planetary/     # Physics
│   │   │   ├── seed/          # Seed manager
│   │   │   ├── schemas/       # Type re-exports
│   │   │   ├── types/         # Type definitions
│   │   │   ├── utils/         # Utilities
│   │   │   └── index.ts       # Entry point
│   │   ├── data/archetypes/   # WARP/WEFT data
│   │   ├── public/            # Assets
│   │   ├── test-backend/      # Backend tests
│   │   ├── test-frontend/     # Frontend tests
│   │   ├── test-e2e/          # E2E tests
│   │   └── proto/             # Protobuf schemas
│   ├── gen/           ← Generation pipeline
│   └── shared/        ← Schemas only
├── docs/              ← Documentation
├── memory-bank/       ← Agent memory
└── process-compose.yml
```

### Internal API

**No HTTP, no REST:**

```typescript
import { GameEngine } from './engine/GameEngine';

// Create game
const engine = new GameEngine(gameId);
await engine.initialize(seed);

// Get state
const state = engine.getState();

// Get render data
const renderData = await engine.getGen0RenderData(time);

// Advance generation
await engine.advanceGeneration();
```

### Dependencies

**Runtime:**
- BabylonJS (core, GUI, materials, loaders, procedural-textures)
- Yuka (AI/physics for Gen0-6)
- Seedrandom (deterministic RNG)
- Zod (validation)
- AI SDK (OpenAI integration)
- Capacitor (cross-platform)
- Protobuf (@bufbuild/protobuf)

**Dev:**
- Vite (dev server, bundler)
- TypeScript
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- jsdom (test environment)

---

## 🐛 KNOWN ISSUES

### TypeScript Errors (54 total)

**By category:**
1. **Unused variables** (~30 errors)
   ```
   'gameId' is declared but its value is never read
   'macroParams' is declared but its value is never read
   'rng' is declared but its value is never read
   ```
   **Fix**: Prefix with `_` or remove

2. **Implicit any** (~10 errors)
   ```
   Parameter 'moon' implicitly has an 'any' type
   ```
   **Fix**: Add type annotations

3. **Missing exports/imports** (~8 errors)
   ```
   Module has no exported member 'MoonCalculation'
   Cannot find name 'PlanetWithExtras'
   ```
   **Fix**: Export types properly, use correct import paths

4. **Schema mismatch** (~6 errors)
   ```
   'moons' does not exist in type 'Planet'
   ```
   **Fix**: Create extended type or update PlanetSchema

### Obsolete Code

**Files to delete:**
- `test-backend/seed-api.integration.test.ts` (tests REST endpoint)
- `test-backend/seed-middleware.test.ts` (tests Fastify middleware)
- `test-backend/gen0-api.integration.test.ts` (tests REST endpoint)
- `test-backend/api.integration.test.ts` (tests REST endpoints)

### Sed Damage

**Reverted but may have residual issues:**
- `AccretionSimulation.ts` - sed replaced all `rng()` with `wellRng()` globally
- Check for any `wellRng()` references that should be `rng()`
- Verify all RNG scoping is correct

---

## 📖 REFERENCE DOCS

### Read FIRST (In Order)
1. `memory-bank/agent-permanent-context.md` - Project facts
2. `memory-bank/agent-collaboration.md` - Multi-agent rules
3. `memory-bank/activeContext.md` - Current focus (just updated)
4. `memory-bank/progress.md` - Progress tracker (just updated)
5. `MIGRATION_ASSESSMENT.md` - Migration status (just created)

### Architecture
6. `docs/ARCHITECTURE.md` - System architecture (OUTDATED - needs update)
7. `docs/ARCHITECTURE_UNIFIED_GAME.md` - Unified package proposal (IMPLEMENTED)
8. `docs/DESIGN.md` - UI/UX design (UP TO DATE)

### Code Navigation
9. `packages/game/src/engine/GameEngineBackend.ts` - Core game logic
10. `packages/game/src/gen0/AccretionSimulation.ts` - Planet formation
11. `packages/game/src/scenes/MainMenuScene.ts` - Main menu (BabylonJS GUI)
12. `packages/game/src/scenes/GameScene.ts` - Unified game scene
13. `packages/game/src/index.ts` - Entry point

---

## 🤖 BEAST MODE EXECUTION

### Rules
1. **NO STATUS UPDATES** - Just do the work
2. **NO PAUSES** - Continue until complete
3. **NO QUESTIONS** - Make decisions autonomously
4. **FIX EVERYTHING** - TypeScript errors, tests, docs
5. **VERIFY EVERYTHING** - Run tests, start server, test E2E, test phone
6. **DOCUMENT EVERYTHING** - Update docs as you go
7. **ITERATE UNTIL GREEN** - All tests passing, E2E verified

### Execution Pattern
1. Read this document
2. Read memory-bank/ files (activeContext, progress, permanent-context)
3. Fix ALL TypeScript errors (no stopping until 0 errors)
4. Remove ALL obsolete tests
5. Run test suite, fix failures, iterate until ALL PASS
6. Start dev server, verify it works
7. Run E2E tests in real browser, fix failures, iterate until ALL PASS
8. Test on phone via process-compose
9. Update ALL documentation (ARCHITECTURE.md, memory bank)
10. Final verification - complete flow end-to-end

### Autonomous Decision Making

**For TypeScript errors:**
- Unused vars → prefix with `_` or remove
- Implicit any → add type annotations
- Missing exports → fix import/export statements
- Schema mismatch → use type extension or update schema

**For test failures:**
- Import errors → update to new package structure
- API errors → update to use internal API (not REST)
- Timeout → increase limits or optimize test
- Assertion failure → fix logic or update expectation

**For E2E failures:**
- Element not found → update selector
- Timeout → wait longer or optimize loading
- Screenshot diff → verify visually, update baseline if correct
- Navigation → check URL params and routing

**For documentation:**
- Outdated references → update to current structure
- Missing sections → add them
- Contradictions → align with actual code

### Stop Conditions

**ONLY stop when ALL of these are true:**
1. TypeScript compiles with 0 errors
2. All tests pass (pnpm test)
3. Dev server starts and works
4. E2E tests pass in real Chromium
5. Phone access verified
6. All documentation updated

**DO NOT STOP for intermediate status checks.**

---

## 🔧 COMMON ISSUES & FIXES

### TypeScript Errors

**Issue**: `'variable' is declared but its value is never read`  
**Fix**: Prefix with `_` (e.g., `_unused`) or remove if truly unused

**Issue**: `Parameter 'x' implicitly has an 'any' type`  
**Fix**: Add type annotation: `(x: SomeType)`

**Issue**: `Module has no exported member 'X'`  
**Fix**: Check actual exports in module, use correct import

**Issue**: `'moons' does not exist in type 'Planet'`  
**Fix**: Create extended type:
```typescript
interface PlanetWithExtras extends Planet {
  moons?: Moon[];
  visualBlueprints?: any;
}
```

### Test Failures

**Issue**: Tests import from `@ebb/backend`  
**Fix**: Update to local imports or `../engine/GameEngine`

**Issue**: Tests make HTTP fetch() calls  
**Fix**: Use `GameEngine` directly instead

**Issue**: Tests expect REST API responses  
**Fix**: Update to expect direct function return values

**Issue**: Tests use `API_BASE`  
**Fix**: Remove and use GameEngine directly

### Dev Server Issues

**Issue**: Server won't start  
**Fix**: Check `pnpm install` ran, check port 5173 not in use

**Issue**: Assets 404  
**Fix**: Verify public/ directory structure, check vite.config.ts publicDir

**Issue**: Textures not loading  
**Fix**: Verify texture manifest at public/textures/manifest.json

### E2E Issues

**Issue**: Can't click buttons  
**Fix**: Update selectors, verify button IDs, check z-index

**Issue**: Seed input not working  
**Fix**: Check HTML input overlay positioning

**Issue**: Navigation fails  
**Fix**: Verify URL params, check gameId handling

**Issue**: 3D scene not rendering  
**Fix**: Check BabylonJS initialization, verify GameEngine returns data

---

## 📝 FILE-BY-FILE REFERENCE

### Critical Files (Fix These First)

**packages/game/src/engine/GameEngineBackend.ts**
- Core game logic
- Internal API implementation
- Gen0-6 initialization
- **Issue**: Unused `MoonCalculation` import
- **Fix**: Remove import or use calculateMoons function

**packages/game/src/gen0/AccretionSimulation.ts**
- Planet formation simulation
- **Issues**: Unused Moon import, PlanetWithExtras not defined, rng scoping
- **Fix**: Import Moon as type, define PlanetWithExtras interface, fix rng

**packages/game/src/gen-systems/loadGenData.ts**
- WARP/WEFT data loading
- **Issues**: Unused params, unused intermediate variables
- **Fix**: Prefix unused params with `_`

**packages/game/src/scenes/MainMenuScene.ts**
- Main menu with BabylonJS GUI
- Uses GameEngine directly (no HTTP)
- **Should work** after TS errors fixed

**packages/game/src/scenes/GameScene.ts**
- Unified game scene for all generations
- Uses GameEngine directly (no HTTP)
- **Should work** after TS errors fixed

**packages/game/src/index.ts**
- Entry point
- Scene orchestration
- **Should work** (no known issues)

### Config Files

**packages/game/vite.config.ts**
- Host: 0.0.0.0 (phone access)
- Port: 5173
- Public dir: public
- No proxy needed (internal API)

**packages/game/tsconfig.json**
- JSX: preserve (no React)
- Module: ESNext
- Target: ES2020

**packages/game/vitest.config.ts**
- Environment: jsdom
- Includes: test-backend/, test-frontend/, src/
- Timeout: 10s
- Setup: test-frontend/setup.ts

**packages/game/playwright.config.ts**
- Test dir: test-e2e/
- Headless: false (visual verification)
- Base URL: http://localhost:5173
- Web server: pnpm dev

---

## 🧪 TESTING STRATEGY

### Unit Tests (Vitest)
**Location**: `test-backend/*.test.ts`  
**Run**: `pnpm test`  
**Focus**: Individual functions (AccretionSimulation, GameEngine, seed-manager)

**Expected results:**
- Gen0 tests: Planet creation, core type, hydrosphere, atmosphere, primordial wells
- GameEngine tests: Initialization, state management, Gen0 integration
- WARP/WEFT tests: Data pool loading, deterministic selection
- Planetary tests: Layer assembly, material distribution

### Integration Tests (Vitest)
**Location**: `test-backend/*.integration.test.ts`, `test-frontend/integration/*.test.ts`  
**Run**: `pnpm test`  
**Focus**: Component interaction

**Expected results:**
- GameEngine + AccretionSimulation integration
- WARP/WEFT + GameEngine integration
- Seed handoff between scenes

**NOTE**: Delete REST integration tests (no longer relevant)

### E2E Tests (Playwright)
**Location**: `test-e2e/*.spec.ts` (needs migration from test-frontend/simulation/test/e2e/)  
**Run**: `pnpm test:e2e`  
**Focus**: Complete user flow in real browser

**Expected flow:**
1. Load http://localhost:5173
2. Splash screen appears, fades out
3. Main menu appears with buttons
4. Click "Start New"
5. Seed modal appears
6. Enter seed via keyboard
7. Click "Create World"
8. Navigate to ?gameId=game-<timestamp>
9. 3D sphere renders
10. Textures load
11. Moons render
12. Orbital animation starts

---

## 🔍 VERIFICATION CHECKLIST

### Code Quality
- [ ] TypeScript: 0 errors
- [ ] Linter: 0 errors
- [ ] No unused imports
- [ ] No console.logs (except intentional)
- [ ] Proper error handling

### Functionality
- [ ] Dev server starts
- [ ] Main menu renders
- [ ] Seed input works
- [ ] Game creation works
- [ ] 3D scene renders
- [ ] Textures load
- [ ] Moons render
- [ ] Animation works

### Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Test coverage > 70%

### Cross-Platform
- [ ] Dev server accessible on phone
- [ ] Touch interactions work
- [ ] Mobile keyboard works
- [ ] Rendering performs well
- [ ] Capacitor builds succeed

### Documentation
- [ ] ARCHITECTURE.md aligned
- [ ] Memory bank updated
- [ ] README.md exists
- [ ] No outdated references

---

## 💡 KEY INSIGHTS

### Why This Migration Matters

**Before** (packages/backend + packages/frontend):
- HTTP REST API overhead (~50ms per call)
- Two dev servers to run
- Two sets of dependencies
- Complex deployment (backend + frontend)
- Serialization overhead
- Network latency
- CORS issues
- API versioning complexity

**After** (packages/game):
- Direct function calls (~0.1ms)
- Single dev server
- Single set of dependencies
- Simple deployment (one artifact)
- No serialization
- No network
- No CORS
- No API versioning

**Performance**: 5-10x faster  
**Complexity**: 50% simpler  
**Deployment**: 1 artifact instead of 2

### Protobuf for Generation Layers

While REST is removed, Protobuf schema is ready for:
- **Generation state serialization** (save/load)
- **Worker thread communication** (if Gen1-6 run in workers)
- **Network sync** (if multiplayer added later)
- **Binary format** (smaller than JSON)

**Currently**: Not actively used, but ready when needed

### Cross-Platform Strategy

**Web** (primary):
- Vite dev server
- Direct browser access
- No build needed for development

**iOS** (via Capacitor):
- Native shell
- WebView rendering
- Native APIs (haptics, etc.)
- Build: `pnpm build:capacitor && npx cap open ios`

**Android** (via Capacitor):
- Native shell
- WebView rendering
- Native APIs
- Build: `pnpm build:capacitor && npx cap open android`

**All platforms**: Same codebase, same build artifact

---

## 🚀 EXECUTION COMMANDS

### Development
```bash
# Start dev server
cd packages/game && pnpm dev

# Access locally
open http://localhost:5173

# Access from phone
# 1. Get IP: ifconfig | grep "inet " | grep -v 127.0.0.1
# 2. Open: http://<ip>:5173 on phone

# Via process-compose (recommended)
process-compose up dev-game
```

### Testing
```bash
# Unit/integration tests
cd packages/game && pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui

# E2E debug mode
pnpm test:e2e:debug
```

### Build
```bash
# TypeScript check
pnpm exec tsc --noEmit

# Build for production
pnpm build

# Preview production build
pnpm preview

# Capacitor sync
pnpm build:capacitor

# Open in IDE
npx cap open ios     # iOS
npx cap open android # Android
```

### Gen Pipeline
```bash
# Generate archetypes
cd packages/gen && pnpm cli archetypes

# Generate UI assets
pnpm cli ui-assets

# Generate fonts
pnpm cli fonts

# Download textures
pnpm cli textures

# Check status
pnpm cli status
```

---

## 🎯 SUCCESS METRICS

**Migration Complete When:**
- ✅ TypeScript: 0 errors
- ✅ Tests: All passing
- ✅ Dev server: Starts and works
- ✅ E2E: All tests pass in real browser
- ✅ Phone: Accessible and functional
- ✅ Build: Succeeds and runs
- ✅ Docs: All aligned with code

**Currently at**: 1/7 (only structure done)

---

## 🔥 BEAST MODE PROMPT

**Copy-paste this for next agent:**

```
BEAST MODE ACTIVATED - COMPLETE UNIFIED GAME PACKAGE VERIFICATION

SESSION GOAL: Fix all TypeScript errors, verify all tests pass, confirm E2E flow works in real browser, test on phone, update all documentation.

RULES:
- NO status updates until COMPLETE
- NO pauses or breaks
- Fix ALL TypeScript errors (currently 54)
- Remove ALL obsolete REST tests
- Run test suite, iterate until ALL PASS
- Start dev server, verify it works
- Run E2E tests in real Chromium browser (headless: false)
- Test on phone via process-compose
- Update ALL documentation (ARCHITECTURE.md, memory bank)
- ONLY STOP when ALL goals met

CONTEXT:
- Just migrated packages/backend + packages/frontend → packages/game
- Removed REST API entirely (Fastify, routes, middleware)
- Removed React entirely (hooks, components)
- Created internal API (GameEngine with direct function calls)
- Code DOES NOT COMPILE yet (54 TypeScript errors)
- Tests NOT RUN since migration
- E2E flow UNVERIFIED
- Phone access UNTESTED

CRITICAL FILES:
- packages/game/src/engine/GameEngineBackend.ts
- packages/game/src/gen0/AccretionSimulation.ts
- packages/game/src/gen-systems/loadGenData.ts
- packages/game/src/scenes/MainMenuScene.ts
- packages/game/src/scenes/GameScene.ts

REFERENCE:
- Read: AGENT_HANDOFF.md (this file)
- Read: MIGRATION_ASSESSMENT.md
- Read: memory-bank/activeContext.md
- Read: memory-bank/progress.md

EXECUTE:
1. Fix ALL TS errors
2. Remove obsolete tests
3. Run test suite → FIX → ITERATE → PASS
4. Start dev server → VERIFY
5. Run E2E → FIX → ITERATE → PASS
6. Test phone → VERIFY
7. Update docs → COMPLETE

NO STOPS UNTIL DONE.
```

---

## 📞 HANDOFF COMPLETE

**Next agent should:**
1. Read this entire document
2. Read all referenced memory bank files
3. Execute BEAST MODE checklist
4. Verify all success criteria met
5. Update memory bank with final status

**Expected duration**: 2-4 hours of focused autonomous work

**Expected outcome**: Fully working unified game package with verified E2E flow and phone testing complete.

**DO NOT STOP until ALL goals met.**

