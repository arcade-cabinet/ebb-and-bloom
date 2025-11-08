# Agent Permanent Context

**For**: All AI agents (Cursor, Claude, Cline, Copilot)  
**Purpose**: Critical permanent information that should never be lost  
**Last Updated**: 2025-11-08

---

## Project

**Ebb & Bloom**: Cross-platform procedural evolution game with seed-driven planetary physics.

**Core Principle**: "Everything is Squirrels" - base archetypes evolve through environmental pressure. NO hardcoded progression.

**Platform**: Cross-platform (iOS, Android, Web) via Capacitor

---

## Architecture

**Monorepo Structure** (UPDATED - November 8, 2025):
- `packages/game/` - ✅ **UNIFIED PACKAGE** (frontend + backend in one)
- `packages/gen/` - AI archetype generation pipeline (OpenAI workflows)
- `packages/shared/` - Zod schemas only (DB code removed)

**Generational System**:
- **Gen 0**: Planetary genesis from seed (gravity, materials, climate)
- **Gen 1**: Creature archetypes spawn (Yuka AI decision-making)
- **Gen 2+**: Yuka AI spheres coordinate evolution

**Technology Stack**:
- **Game Logic**: GameEngine (internal API - direct function calls)
- **Gen Pipeline**: OpenAI SDK (archetype generation), Zod (validation)
- **Frontend**: BabylonJS (3D rendering + GUI)
- **State**: Zustand (in-memory)
- **Platform**: Capacitor (iOS, Android, Web)
- **Seed**: Three-word hyphen-delimited (`v1-word-word-word`)
- **Physics/AI**: Yuka (Gen0-6 systems), seedrandom (deterministic RNG)
- **Communication**: Protobuf (generation layer protocol)

**Frontend Architecture**: BabylonJS chosen for unified 3D + UI, built-in raycasting, procedural generation tools, and mature GUI system. See `docs/ARCHITECTURE.md` for full rationale.

**Backend Architecture**: Internal API only - no public REST endpoints. All functions callable directly and testable.

---

## Critical Architectural Rules

1. **Unified Package**: packages/game contains both frontend and backend
2. **No HTTP**: Direct function calls only (no REST API)
3. **Type Safety**: DRY types from `@ebb/shared/schemas`
4. **Seed-Driven**: All generation uses deterministic seeds
5. **WARP/WEFT Flow**: 
   - **WARP (Vertical)**: Gen N → Gen N+1 causal influence
   - **WEFT (Horizontal)**: Macro → Meso → Micro scales within each generation
6. **Visual Blueprints**: All archetypes include rendering instructions (PBR, textures, colors)
7. **Yuka AI**: Gen0-Gen6 systems use appropriate Yuka systems (GoalEvaluator, FuzzyModule, StateMachine, etc.)
8. **Internal API**: GameEngine exposes methods for direct calling (not HTTP endpoints)
9. **NO Hardcoded Values**: Calculate from physics/AI generation
10. **Quality Assurance**: Automatic regeneration of anemic archetypes
11. **Idempotency**: Repeated runs do not regenerate existing valid data
12. **Cross-Platform**: Single codebase for iOS/Android/Web via Capacitor

---

## Key Documentation

**Read these for architectural decisions**:
- `AGENT_HANDOFF.md` - Comprehensive agent-to-agent handoff with TOC
- `docs/ARCHITECTURE.md` - System architecture
- `docs/ARCHITECTURE_UNIFIED_GAME.md` - Unified package rationale
- `docs/DESIGN.md` - UI/UX design system
- `docs/architecture/generations.md` - Gen0-Gen6 system specifications
- `memory-bank/activeContext.md` - Current focus
- `memory-bank/progress.md` - Project progress
- `MIGRATION_ASSESSMENT.md` - Migration status

---

## File Structure (UPDATED)

```
packages/
├── game/                # ✅ UNIFIED PACKAGE
│   ├── src/
│   │   ├── engine/      # GameEngine (internal API)
│   │   ├── gen0-6/      # Generation systems
│   │   ├── scenes/      # BabylonJS scenes
│   │   ├── gen-systems/ # WARP/WEFT data loaders
│   │   ├── planetary/   # Physics (composition, layers, noise)
│   │   ├── seed/        # Seed management (pure functions)
│   │   ├── schemas/     # Type re-exports from @ebb/shared
│   │   ├── types/       # Type definitions
│   │   ├── utils/       # Utilities (Logger, textureLoader)
│   │   └── index.ts     # Entry point
│   ├── data/archetypes/ # Generated archetypes (gen0-6/)
│   ├── public/          # Assets (fonts, textures, UI, splash)
│   ├── test-backend/    # Backend unit/integration tests
│   ├── test-frontend/   # Frontend tests
│   ├── test-e2e/        # E2E tests (Playwright)
│   └── proto/           # Protobuf schemas
├── gen/                 # AI archetype generation
│   ├── src/
│   │   ├── workflows/   # WARP/WEFT agent
│   │   ├── prompts/     # Generation prompts
│   │   ├── schemas/     # Zod schemas (exported)
│   │   └── tools/       # Quality assessor, texture tool
│   └── data/
│       └── manifests/   # UI assets, fonts manifests
└── shared/              # Schemas only (DB removed)
    └── src/schemas/     # Zod schemas

docs/
├── architecture/        # Architecture documentation
│   ├── README.md       # Master architecture
│   ├── generations.md  # Gen0-Gen6 specs
│   └── api.md          # (Outdated - was REST API)
├── ARCHITECTURE.md      # System architecture
├── DESIGN.md           # UI/UX design
└── WORLD.md           # Game design document

memory-bank/
├── activeContext.md     # Current focus (ephemeral)
├── progress.md          # Project progress
├── agent-permanent-context.md  # This file
└── agent-collaboration.md  # Multi-agent rules
```

---

## Development Commands

### Game Package (packages/game)
```bash
cd packages/game

# Development
pnpm dev                   # Start dev server (http://localhost:5173)
pnpm dev --host            # Accessible on network (phone)

# Building
pnpm build                 # TypeScript + Vite build
pnpm build:capacitor       # Build + Capacitor sync
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run all tests (Vitest)
pnpm test:watch            # Watch mode
pnpm test:e2e              # E2E tests (Playwright)
pnpm test:e2e:ui           # E2E with UI
pnpm test:e2e:debug        # E2E debug mode

# Type checking
pnpm exec tsc --noEmit     # TypeScript compilation check
```

### Gen Pipeline (packages/gen)
```bash
cd packages/gen

# Generate archetypes
pnpm cli archetypes        # Generate all Gen0-6 archetypes

# Generate assets
pnpm cli ui-assets         # Generate UI assets (icons, HUD, frames, backgrounds)
pnpm cli fonts             # Set up Google Fonts
pnpm cli textures          # Download AmbientCG textures

# Quality & Documentation
pnpm cli quality           # Assess quality, regenerate anemic archetypes
pnpm cli documentation     # Generate comprehensive review doc
pnpm cli status            # Check generation status
```

### Process Compose (Orchestration)
```bash
# Start unified dev environment
process-compose up dev-game

# Type checking (watch mode)
process-compose up typecheck-game

# Test watching
process-compose up test-watch

# E2E tests
process-compose up test-e2e

# Gen pipeline
process-compose up gen-archetypes
process-compose up gen-quality
process-compose up gen-docs
```

---

## Testing

**Framework**: Vitest (unit/integration), Playwright (E2E)

**Test Structure**:
- `packages/game/test-backend/` - Backend tests (Gen0-6, GameEngine, seed, planetary)
- `packages/game/test-frontend/` - Frontend tests (scenes, integration)
- `packages/game/test-e2e/` - E2E tests (complete user flows)

**Timeout Protection**: All test configs include automatic timeouts and stall detection

**Target Coverage**: 70%+ for core systems

**Test Commands**:
```bash
cd packages/game
pnpm test                  # All unit/integration
pnpm test:watch           # Watch mode
pnpm test:e2e             # E2E in real Chromium
```

---

## Internal API (No HTTP)

**GameEngine** - All functions callable directly:

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

**Used by:**
- MainMenuScene - Create/load games
- GameScene - Load render data
- Tests - Direct function calls

**Benefits:**
- 5-10x faster (no HTTP overhead)
- Fully testable (import and call)
- Type-safe (TypeScript end-to-end)
- No serialization overhead
- No network latency
- No CORS issues

---

## Current Status

**Phase**: Unified Game Package Migration  
**Completion**: 95% (structural), 0% (functional verification)

**What Works**:
- ✅ Unified package structure
- ✅ Internal API created
- ✅ Dependencies installed
- ✅ Configs created

**What's Broken**:
- ❌ TypeScript does NOT compile (54 errors)
- ❌ Tests NOT RUN since migration
- ❌ Dev server NOT TESTED
- ❌ E2E flow UNVERIFIED
- ❌ Phone access UNTESTED

**Next**: Fix TypeScript errors, run tests, verify E2E, test phone, update docs

See: `AGENT_HANDOFF.md` for comprehensive handoff instructions

---

## Critical Files

### Entry Points
- `packages/game/src/index.ts` - Main application entry
- `packages/game/src/engine/GameEngineBackend.ts` - Core game logic
- `packages/gen/src/cli.ts` - Generation CLI

### Core Systems
- `packages/game/src/gen0/AccretionSimulation.ts` - Planet formation
- `packages/game/src/gen1-6/*.ts` - Generation systems
- `packages/game/src/scenes/MainMenuScene.ts` - Main menu (BabylonJS GUI)
- `packages/game/src/scenes/GameScene.ts` - Unified game scene

### Gen Pipeline
- `packages/gen/src/workflows/warp-weft-agent.ts` - WARP/WEFT orchestration
- `packages/gen/src/prompts/generation-prompts.ts` - AI prompts
- `packages/gen/src/tools/quality-assessor.ts` - Quality assurance

### Configuration
- `process-compose.yml` - Development orchestration
- `packages/game/vite.config.ts` - Vite configuration
- `packages/game/tsconfig.json` - TypeScript configuration
- `packages/game/vitest.config.ts` - Test configuration
- `packages/game/playwright.config.ts` - E2E test configuration
- `packages/game/capacitor.config.ts` - Cross-platform configuration

---

## Memory Bank Usage

**For all agents:**

1. **Start of session**: Read in order:
   - `agent-permanent-context.md` (this file)
   - `agent-collaboration.md` (multi-agent rules)
   - `activeContext.md` (current focus)
   - `progress.md` (project progress)
   - `AGENT_HANDOFF.md` (comprehensive handoff)

2. **During work**: Update as you go:
   - `activeContext.md` - Current tasks, blockers, decisions
   - `progress.md` - Completed milestones, next steps

3. **End of session**: Ensure:
   - `activeContext.md` reflects current state
   - `progress.md` shows what was completed
   - No duplicate/contradictory info across files

**NEVER create**: Status documents, planning documents, gap analyses, completion reports → All goes in memory bank

---

## Agent Behavioral Rules

### YOLO Mode (Autonomous Execution)

**When user says** "do it", "implement", "fix", "build", "beast mode":
1. Read memory bank (permanent-context → collaboration → activeContext → progress)
2. Read relevant docs (ARCHITECTURE.md, core systems)
3. **Execute immediately** - No planning phase
4. Iterate until complete
5. Update memory bank
6. Run tests

**Behaviors**:
- Act immediately - implement real functionality
- Make large changes - not small atomic steps
- Independent decisions - refactors, deletions, dependencies
- Stop only for hard blockers - missing specs, conflicts
- Keep iterating - until done and tests pass
- Show code - not explanations
- No placeholders - real implementations
- Research-driven - use web search when needed
- Test rigorously - multiple times

---

## Common Patterns

### Seed Management
```typescript
import { validateSeed, getGenerationSeed } from './seed/seed-manager';

const validation = validateSeed(seed);
if (!validation.valid) throw new Error(validation.error);

const gen0Seed = getGenerationSeed(baseSeed, 0);
```

### WARP/WEFT Loading
```typescript
import { generateGen0DataPools } from './gen-systems/loadGenData';

const dataPools = await generateGen0DataPools(baseSeed, context);
const macroArchetype = dataPools.macro.selectedContext;
```

### GameEngine Usage
```typescript
import { GameEngine } from './engine/GameEngine';

const engine = new GameEngine(gameId);
await engine.initialize(seed);
const state = engine.getState();
const renderData = await engine.getGen0RenderData(time);
```

### BabylonJS Scenes
```typescript
import { Scene, Engine } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, TextBlock } from '@babylonjs/gui';

const gui = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);
const button = Button.CreateSimpleButton('btn', 'Click Me');
button.fontFamily = 'Work Sans, sans-serif';
gui.addControl(button);
```

---

## Typography

**Brand-aligned fonts** (Google Fonts CDN):
- **Playfair Display**: Titles, headings, haikus, poetic text
- **Work Sans**: Body text, UI labels, buttons, readable interface
- **JetBrains Mono**: Seed codes, technical data, coordinates, numbers

**Usage**:
```typescript
title.fontFamily = 'Playfair Display, serif';
button.fontFamily = 'Work Sans, sans-serif';
seed.fontFamily = 'JetBrains Mono, monospace';
```

---

## Color Palette

**From design system**:
- `#1A202C` - Deep indigo background
- `#4A5568` - Ebb indigo (panels, borders)
- `#38A169` - Bloom emerald (primary actions)
- `#D69E2E` - Seed gold (seed input, highlights)
- `#F7FAFC` - Accent white (text)
- `#A0AEC0` - Muted slate (secondary text)

---

## Key Decisions (Historical)

### BabylonJS over React Three Fiber (2025-11-07)
**Rationale**: Unified 3D + GUI, built-in raycasting, procedural generation, mature GUI system  
**Impact**: Removed React entirely, use BabylonJS GUI for all UI

### Unified Package (2025-11-08)
**Rationale**: Simpler deployment, no HTTP overhead, faster performance, easier testing  
**Impact**: Removed packages/backend and packages/frontend, created packages/game  
**Breaking**: REST API removed, React removed, all fetch() replaced with direct calls

### Internal API Only (2025-11-08)
**Rationale**: No need for public API, everything testable, 5-10x faster  
**Impact**: Removed Fastify, removed server.ts, removed all route handlers

### UI Asset Strategy (2025-11-07)
**Rationale**: BabylonJS GUI handles basic UI, only generate artistic elements  
**Impact**: Focused generation on icons, HUD, frames, backgrounds - not buttons/panels

### Protobuf for Generation Layers (2025-11-08)
**Rationale**: Future-proof for worker threads, network sync, binary format  
**Impact**: Schema created but not actively used yet

---

## Critical Paths

### Current: Verify Unified Package Works
1. Fix TypeScript compilation errors
2. Run test suite
3. Verify dev server
4. Run E2E tests in real browser
5. Test on phone

### Next: Complete Gen0 Flow
1. Verify main menu loads
2. Verify seed input works
3. Verify game creation works
4. Verify 3D sphere renders with textures
5. Verify moons render with orbital animation

### Future: Gen1+ Implementation
1. Tool Sphere system
2. Inter-Sphere communication
3. Material refactor
4. Yuka AI integration

---

## Testing Infrastructure

**Timeout Protection** (ALL configs):
- Test timeout: 10s (unit), 30s (E2E)
- Hook timeout: 10s
- Teardown timeout: 5s
- Bail on 5 failures
- Stall detection in setup files

**Test Utilities**:
- `withTimeout()` - Wrap async tests
- `retryWithTimeout()` - Retry with exponential backoff
- `createStallDetector()` - Detect hanging tests

**E2E Strategy**:
- Real Chromium browser (headless: false)
- Mouse clicks (page.click())
- Keyboard input (page.keyboard.type())
- Visual verification (screenshots)
- Animation verification (waitForCondition)

---

## Asset Management

**Texture Pipeline**:
- AmbientCG downloader → `packages/game/public/textures/`
- Manifest at `packages/game/public/textures/manifest.json`
- Categories: Metal, Rock, Wood, Stone, Grass, Fabric, Leather, Concrete, Bricks
- Resolution: 2K
- Format: JPG (color maps)

**Font Pipeline**:
- Google Fonts CDN (no local download)
- CSS generated at `packages/game/public/fonts/fonts.css`
- @import URLs for each font family

**UI Asset Pipeline**:
- AI-generated via GPT-image-1
- Format: WebP (better compression + transparency)
- Adaptive quality: 80-90 based on image size
- Compliance checking: dimensions, file size, format, transparency
- Categories: Icons, HUD, Frames, Backgrounds, Splash

**Output Paths**:
- Textures → `packages/game/public/textures/`
- Fonts → `packages/game/public/fonts/`
- UI assets → `packages/game/public/ui/` and `public/splash/`
- Archetypes → `packages/game/data/archetypes/`

---

## Common Issues & Solutions

### TypeScript Import Issues
**Issue**: Can't find module  
**Fix**: Use `.js` extension in imports (TS module resolution)  
**Note**: User prefers NO `.js` suffixes in TypeScript - configure bundler instead

### Seed Validation
**Issue**: Invalid seed format  
**Fix**: Use `v1-word-word-word` format (3 words, hyphen-delimited, v1 prefix)

### Texture Loading
**Issue**: Texture not found  
**Fix**: Use texture ID from manifest (e.g., "Metal049A"), not file path

### React in BabylonJS Project
**Issue**: React hooks/components won't work  
**Fix**: Remove React entirely, use BabylonJS GUI instead

### REST API Calls After Migration
**Issue**: fetch() calls to http://localhost:3001  
**Fix**: Use `GameEngine` directly (import and call functions)

---

## Git Workflow

**Branching**: (Project uses default branch)  
**Commits**: Semantic commit messages  
**Never**: Force push to main/master  
**Always**: Run tests before committing

---

## Performance Targets

- **Initial Load**: < 3s
- **Frame Rate**: 60 FPS (3D rendering)
- **Gen0 Simulation**: < 5s (4.5 billion simulated years)
- **API Calls**: N/A (no HTTP - direct calls only)
- **Bundle Size**: < 5MB (production)

---

## Cross-Platform Targets

**Web** (Primary):
- Chrome, Safari, Firefox
- Desktop and mobile browsers
- Progressive Web App (PWA)

**iOS** (via Capacitor):
- iOS 13+
- Native shell + WebView
- Native APIs (haptics, etc.)

**Android** (via Capacitor):
- Android 8+
- Native shell + WebView
- Native APIs

---

## Quality Standards

- TypeScript: 0 errors, 0 warnings
- Tests: 100% passing
- Coverage: > 70% for core systems
- Linter: 0 errors
- Bundle: Optimized for production
- Performance: 60 FPS maintained

---

## Emergency Contacts

**For blocking issues**, check:
1. `AGENT_HANDOFF.md` - Comprehensive troubleshooting
2. `memory-bank/activeContext.md` - Current blockers
3. `MIGRATION_ASSESSMENT.md` - Known issues

**Common blockers**:
- TypeScript errors → Fix unused vars, add types
- Test failures → Update imports, use internal API
- Dev server issues → Check port, dependencies
- E2E failures → Update selectors, increase timeouts

---

## Version History

**v0.1.0** (2025-11-08): Initial unified game package  
**v0.2.0** (2025-11-07): Gen0 complete implementation  
**v0.1.0** (2025-01-09): Gen0-6 archetypes generated

---

## CRITICAL: Read on Every Session

1. `AGENT_HANDOFF.md` - Full context and instructions
2. `memory-bank/activeContext.md` - Current focus
3. `memory-bank/progress.md` - What's done/pending
4. This file - Permanent rules

**Then execute autonomously** - no status updates, no pauses, complete the mission.
