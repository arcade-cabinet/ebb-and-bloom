# Agent Permanent Context

**For**: All AI agents (Cursor, Claude, Cline, Copilot)  
**Purpose**: Critical permanent information that should never be lost  
**Last Updated**: 2025-11-08

---

## Project

**Ebb & Bloom**: Law-based universe simulation game with deterministic generation.

**Core Principle**: "Everything emerges from LAWS" - physics, chemistry, biology, ecology, taxonomy, and social laws generate complete universes from three-word seeds.

**Platform**: Cross-platform (iOS, Android, Web) via Capacitor

---

## 🔥 CRITICAL: LAW-BASED ARCHITECTURE

**WE DELETED THE AI GENERATION SYSTEM**

**What we removed:**
- ❌ `packages/gen/` - Entire AI generation pipeline
- ❌ `manifests/` - All hardcoded archetypes
- ❌ OpenAI API dependencies for content generation

**What we built instead:**
- ✅ `packages/game/src/laws/` - Complete mathematical law system
- ✅ `packages/game/src/tables/` - Universal constants (periodic table, physics, linguistics)
- ✅ `packages/game/src/utils/EnhancedRNG.ts` - Deterministic RNG (seedrandom)
- ✅ Law-based generation for everything

**The new flow:**
```
Three-word seed → Laws → Complete Universe
```

**Same seed = same universe. Always. Deterministic.**

---

## Architecture

**Monorepo Structure**:
```
packages/
├── game/          # ✅ UNIFIED PACKAGE (frontend + backend)
│   ├── src/
│   │   ├── laws/           # Mathematical law system
│   │   ├── tables/         # Universal constants
│   │   ├── engine/         # GameEngine (internal API)
│   │   ├── scenes/         # BabylonJS scenes
│   │   ├── seed/           # Seed management
│   │   └── utils/          # EnhancedRNG, etc.
│   ├── public/             # Assets
│   └── simulation.html     # Reports view (for validation)
├── shared/        # Zod schemas only
└── (gen/ deleted)
```

**Technology Stack**:
- **Game Logic**: Direct function calls (no HTTP)
- **Frontend**: BabylonJS (3D + GUI)
- **State**: GameEngine state (no React, no Zustand)
- **Platform**: Capacitor (iOS, Android, Web)
- **RNG**: seedrandom (deterministic, string seeds)
- **Physics**: Custom law system
- **Build**: Vite + TypeScript

---

## Critical Rules

1. **Law-Based Generation**: Everything emerges from mathematical laws
2. **Deterministic**: Same seed must produce same result
3. **No AI Generation**: Laws replace OpenAI API calls
4. **String Seeds**: Three-word format (`v1-word-word-word`)
5. **Internal API**: Direct function calls (no HTTP)
6. **Unified Package**: Single `packages/game` for everything
7. **Cross-Platform**: Single codebase for Web/iOS/Android

---

## Law System Structure

**`src/laws/`**:
- `physics.ts` - Gravity, thermodynamics, orbital mechanics
- `stellar.ts` - Star formation, habitable zones
- `biology.ts` - Kleiber's Law, allometric scaling
- `ecology.ts` - Lotka-Volterra, carrying capacity
- `social.ts` - Dunbar's number, Service typology
- `taxonomy.ts` - Linnaean classification, binomial nomenclature

**`src/tables/`**:
- `physics-constants.ts` - G, c, k_B, fundamental constants
- `periodic-table.ts` - Complete element data
- `linguistic-roots.ts` - Latin/Greek roots for naming

**`src/utils/EnhancedRNG.ts`**:
- Uses `seedrandom` (accepts string seeds directly)
- Provides statistical distributions (normal, Poisson, exponential, etc.)
- Box-Muller transform for Gaussian
- Deterministic - same seed = same sequence

---

## Development Commands

```bash
cd packages/game

# Development
pnpm dev                      # Dev server (localhost:5173)
pnpm dev --host               # Network accessible

# Building
pnpm build                    # Web build
just build-android            # Android APK (see justfile)

# Testing
pnpm exec tsx src/cli-tools/test-determinism.ts <seed>
pnpm exec tsx src/cli-tools/test-rng-quality.ts
pnpm exec tsx src/cli-tools/test-stochastic.ts

# Validation
./validate-all-laws.sh        # Comprehensive test suite
```

---

## Key Files

**Core Systems**:
- `src/engine/GameEngineBackend.ts` - Main game engine
- `src/laws/*.ts` - All law implementations
- `src/tables/*.ts` - Universal constants
- `src/utils/EnhancedRNG.ts` - Deterministic RNG
- `src/seed/seed-manager.ts` - Seed validation

**Scenes**:
- `src/scenes/SimulationScene.ts` - Reports view (VCR controls, URL parameters)
- `simulation.html` - Entry point for reports

**Build**:
- `justfile` - Build recipes (Android, iOS, web)
- `vite.config.ts` - Vite configuration
- `capacitor.config.ts` - Cross-platform config

---

## Current Status

**Law System**: ✅ Complete
- 6 law files implemented
- 3 table files complete
- EnhancedRNG working with seedrandom
- Deterministic generation verified

**Build System**: ✅ Working
- Android APK builds successfully
- Web dev server running
- Simulation view functional with URL controls

**What's Next**:
- Validate all laws with comprehensive test suite
- Fix any remaining RNG issues (seedrandom vs Mersenne Twister)
- Add more laws (climate, hydrology, materials science)
- Refactor old Gen0-5 code to use law system

---

## Memory Bank Usage

**Start of session**, read in order:
1. `agent-permanent-context.md` (this file)
2. `activeContext.md` (current focus)
3. `progress.md` (what's done)

**During work**:
- Update `activeContext.md` with current tasks
- Update `progress.md` when milestones complete

**Never create**: Status docs, planning docs → all goes in memory bank

---

## YOLO Mode

**When user says** "do it", "implement", "beast mode":
1. Read memory bank
2. Execute immediately (no planning phase)
3. Make large changes
4. Iterate until complete
5. Update memory bank
6. Validate with tests

---

## Critical Patterns

**Seed Management**:
```typescript
import { validateSeed, generateSeed } from './seed/seed-manager';

const seed = generateSeed(); // "v1-wild-ocean-glow"
const validation = validateSeed(seed);
if (!validation.valid) throw new Error(validation.error);
```

**EnhancedRNG Usage**:
```typescript
import { EnhancedRNG } from './utils/EnhancedRNG';

const rng = new EnhancedRNG(seed); // String seed directly!
const value = rng.uniform(0, 1);
const gaussian = rng.normal(0, 1);
const count = rng.poisson(5);
```

**GameEngine Usage**:
```typescript
import { GameEngine } from './engine/GameEngineBackend';

const engine = new GameEngine({ seed });
const universe = engine.generateUniverse();
```

---

## Key Decisions

### Reverted to seedrandom (2025-11-08)
**Why**: Mersenne Twister (@stdlib) had seed overflow issues, seedrandom works perfectly with string seeds
**Impact**: Simpler, no hash conversion needed, deterministic, good enough quality

### Law-Based Architecture (2025-11-08)
**Why**: Scientific rigor, infinite content, deterministic, educational, enables Gen6+
**Impact**: Deleted entire AI generation system, built complete law system from scratch

### Unified Package (2025-11-08)
**Why**: Simpler deployment, no HTTP overhead, faster, easier testing
**Impact**: Single packages/game for everything, direct function calls only

---

## Build System

**Android APK**:
```bash
just build-android
# Output: /workspace/dev-builds/<timestamp>/app-debug.apk
```

**Web**:
```bash
pnpm build
# Output: dist/
```

**Simulation View** (for validation):
- URL: http://localhost:5173/simulation.html
- Supports URL parameters: `?seed=v1-test&cycle=10&autoplay=true&speed=2`
- Exposes `window.simulation` API for programmatic control

---

## Documentation

**Primary**: `README.md` - Single source of truth  
**Architecture**: `docs/LAW_BASED_ARCHITECTURE.md` - Complete law system docs  
**Build**: `BUILD.md` - Production build instructions

**Archived**: `memory-bank/archived-docs/` - Old status docs (obsolete)

---

## Emergency Contacts

**Blocking issues**:
1. Check `activeContext.md` for current blockers
2. Check `progress.md` for known issues
3. Run `./validate-all-laws.sh` to verify system health

**Common issues**:
- TypeScript errors → Fix imports, add types
- RNG overflow → We reverted to seedrandom (fixed)
- Build failures → Check Java 21, Gradle, dependencies

---

## Quality Standards

- TypeScript: 0 errors, 0 warnings
- Determinism: 100% (same seed = same result)
- Tests: All core laws validated
- Performance: < 5s universe generation

---

**CRITICAL**: This is a law-based system now. Do not reference `packages/gen/`, `manifests/`, or OpenAI generation. Use `src/laws/` instead.
