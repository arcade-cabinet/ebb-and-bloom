# Agent Permanent Context

**For**: All AI agents (Cursor, Claude, Cline, Copilot)  
**Purpose**: Critical permanent information that should never be lost  
**Last Updated**: 2025-11-10 (DFU parity verified, all bugs fixed, docs consolidated)

---

## Project Overview

**Ebb & Bloom**: Law-based multi-agent universe simulator. Start at t=0 (Big Bang), watch emergence.

**Core Principle**: Bottom-up emergence - Molecular → Stars → Galaxies → Cosmic web. Yuka decides everything. EntropyAgent governs. Legal Brokers mediate.

**Platform**: Web (React Three Fiber) + Cross-platform (iOS, Android via Capacitor)

---

## 🔥 CRITICAL: ENGINE ARCHITECTURE

**PURE ENGINE MODE + GENERATION SEPARATION (Jan 2025):**

**What changed:**
- ✅ **Feature flags system** - Pure engine mode (agentic systems disabled by default)
- ✅ **Generation package** - Spawners/prefabs moved from `engine/` to `generation/` root
- ✅ **Three-word seed system** - Integrated into main menu (shuffle/copy/validate)
- ✅ **Governor-prefab integration** - Governors work WITH prefabs (composable, law-aligned)
- ✅ **Production ready** - Vite build + Capacitor for web (NO Python server)

**Current Structure:**
```
engine/              # Pure rendering/physics/coordination engine
├── governors/      # Yuka-native governors (optional, feature-flagged)
├── procedural/     # Synthesis systems (create visuals)
├── core/           # WorldManager, TerrainSystem, PlayerController, CreatureManager
├── systems/        # Tools, structures, trade
├── tables/         # Constants
├── agents/         # CreatureAgent
├── config/         # Feature flags (agentic systems on/off)
├── types/          # TypeScript definitions
└── utils/          # RNG, seeds (three-word format)

generation/          # Generation logic (NOT engine code)
├── spawners/       # All spawners/generators (terrain, creatures, settlements, vegetation)
│   ├── BuildingPrefab.ts         # Prefab definitions (law-aligned, composable)
│   ├── BuildingGenerator.ts      # Mesh generation from prefabs
│   ├── GovernorPrefabIntegration.ts  # Bridge governors ↔ prefabs
│   └── ...                        # ChunkManager, BiomeSystem, etc.

game/               # Game package (UI + game loop)
├── Game.tsx        # Main component (uses WorldManager API)
├── ui/             # React UI (MenuScreen with seed input)
├── main.tsx        # Entry point
└── index.html      # HTML shell

tests/              # Test suite
├── unit/           # Unit tests
└── integration/    # Integration tests
```

**The new flow:**
```
Three-Word Seed (MenuScreen)
    ↓
sessionStorage → Game.tsx → WorldManager.initialize(seed)
    ↓
Generation Package (spawners/prefabs) - Determines WHAT/WHERE
    ↓
Engine (rendering/physics) - Renders results
    ↓
Game Loop (world.update())
    ↓
Living World
```

**Pure Engine Mode (default):**
- Feature flags: `ENABLE_AGENTIC_SYSTEMS = false`
- Deterministic prefab-based spawning
- No governor decisions
- Simple, predictable, testable

**Governor Mode (optional):**
- Feature flags: `ENABLE_AGENTIC_SYSTEMS = true`
- Governors evolve/compose prefabs
- Law-aligned generation
- Emergent behavior

**Same seed = same world. Always. Deterministic.**

---

## Architecture

**Engine Structure (Pure Engine):**
```
engine/
├── config/
│   └── featureFlags.ts      # ENABLE_AGENTIC_SYSTEMS, etc.
├── governors/         # Yuka-native governors (optional, feature-flagged)
│   ├── physics/       # Gravity, Temperature
│   ├── biological/    # Metabolism, Lifecycle, Reproduction, Genetics, Cognitive
│   ├── ecological/    # Flocking, PredatorPrey, Territory, Foraging, Migration
│   └── social/        # Hierarchy, Warfare, Cooperation
├── core/              # Core systems (WorldManager API)
│   ├── WorldManager.ts      # Central coordinator (DFU GameManager pattern)
│   ├── TerrainSystem.ts     # Chunk streaming (DFU StreamingWorld pattern)
│   ├── PlayerController.ts  # Player movement (DFU PlayerMotor pattern)
│   └── CreatureManager.ts   # Creature management
├── procedural/        # Synthesis systems (molecular → visuals)
├── systems/           # Tools, structures, trade
├── agents/            # CreatureAgent (Yuka integration)
├── tables/            # Universal constants
├── types/             # TypeScript definitions
└── utils/             # RNG, seeds (three-word format)

generation/            # Generation logic (separated from engine)
├── spawners/
│   ├── ChunkManager.ts           # 7x7 chunk streaming
│   ├── BiomeSystem.ts            # 11 biomes
│   ├── SimplexNoise.ts           # Terrain heightmaps
│   ├── VegetationSpawner.ts      # Instanced trees
│   ├── SettlementPlacer.ts       # Settlement placement
│   ├── NPCSpawner.ts             # Daily schedules
│   ├── CreatureSpawner.ts        # Creature spawning
│   ├── BuildingPrefab.ts         # Prefab definitions (law-aligned)
│   ├── BuildingGenerator.ts      # Mesh generation
│   ├── GovernorPrefabIntegration.ts  # Governors ↔ prefabs bridge
│   └── WaterSystem.ts           # Animated shaders
└── README.md          # Generation package docs

game/                  # Game package
├── Game.tsx           # Main component (uses WorldManager API)
├── ui/
│   ├── screens/
│   │   └── MenuScreen.tsx    # Three-word seed input (shuffle/copy/validate)
│   └── UIManager.tsx
├── main.tsx           # Entry point
└── index.html         # HTML shell
```

**Technology Stack:**
- **Engine**: TypeScript (pure logic, no rendering)
- **Demo**: React + React Three Fiber + Drei
- **State**: Zustand
- **AI**: Yuka (steering behaviors)
- **RNG**: seedrandom (deterministic)
- **Build**: Vite + npm

---

## Key Principles (from .clinerules)

1. **Bottom-up emergence** - Molecular → Stars → Galaxies → Cosmic web
2. **Yuka decides everything** - No forcing positions, counts, timing
3. **EntropyAgent governs** - Top-level thermodynamics (lightweight)
4. **Legal Brokers mediate** - All spawning/decisions validated by laws
5. **Law-Based Generation**: Everything emerges from mathematical laws
6. **Deterministic**: Same seed must produce same result
7. **Engine/Game Separation**: Engine has NO rendering code
8. **String Seeds**: Three-word format (`v1-word-word-word`)
9. **No Status Docs**: All status goes in memory-bank/ only (NO root docs except README.md)
10. **React Three Fiber**: Use R3F for all 3D rendering

---

## Development Commands

```bash
# Root (all packages)
pnpm install             # Install dependencies
pnpm dev                 # Dev server (localhost:5173)
pnpm build               # Production build
pnpm preview             # Preview production build
pnpm test                # Run tests
pnpm type-check          # TypeScript validation

# Testing
pnpm test:browser        # Playwright E2E tests
pnpm test:browser:prod   # Test production build
```

---

## Key Files

**Engine Core:**
- `engine/core/WorldManager.ts` - Central coordinator (DFU GameManager pattern)
- `engine/core/TerrainSystem.ts` - Chunk streaming (DFU StreamingWorld pattern)
- `engine/core/PlayerController.ts` - Player movement (DFU PlayerMotor pattern)
- `engine/config/featureFlags.ts` - Feature flags (pure engine mode)
- `engine/utils/EnhancedRNG.ts` - Deterministic RNG
- `engine/utils/seed/seed-manager.ts` - Three-word seed system

**Generation:**
- `generation/spawners/ChunkManager.ts` - Terrain chunk generation
- `generation/spawners/BuildingPrefab.ts` - Prefab definitions (law-aligned, composable)
- `generation/spawners/GovernorPrefabIntegration.ts` - Governors ↔ prefabs bridge
- `generation/spawners/SettlementPlacer.ts` - Settlement placement

**Game:**
- `game/Game.tsx` - Main component (uses WorldManager API)
- `game/ui/screens/MenuScreen.tsx` - Three-word seed input (shuffle/copy/validate)
- `game/index.html` - Entry point

**Documentation:**
- `README.md` - Project overview
- `generation/README.md` - Generation package docs
- `memory-bank/` - All status/docs (NO root cruft)

---

## Current Status

**Engine**: ✅ Pure Engine Mode (v1.1) - PRODUCTION READY
- ✅ Feature flags system - Agentic systems disabled by default
- ✅ Three-word seed system - Integrated into main menu
- ✅ Generation package separated - Spawners/prefabs in `generation/` root
- ✅ Governor-prefab integration - Governors work WITH prefabs
- ✅ DFU parity verified - Player movement, world streaming, chunk grid
- ✅ Production build - Vite + Capacitor (NO Python server)
- ✅ Deterministic generation - Same seed = same world

**Game**: ✅ Working
- MenuScreen with seed shuffle/copy/validate
- WorldManager API integration
- React Three Fiber rendering
- Session storage for seed persistence

**Documentation**: ✅ Comprehensive
- Memory bank updated (NO root cruft)
- Generation package docs
- Feature flags documented

---

## Memory Bank Usage

**Start of session**, read in order:
1. `agent-permanent-context.md` (this file)
2. `activeContext.md` (current focus)
3. `progress.md` (what's done)

**During work**:
- Update `activeContext.md` with current tasks
- Update `progress.md` when milestones complete

**NEVER create**: 
- Status docs in root (use memory-bank/)
- Planning docs in root (use memory-bank/)
- Completion announcements (use memory-bank/)

---

## Critical Patterns

**Engine Import**:
```typescript
import {
  EnhancedRNG,
  ChunkManager,
  BiomeSystem,
  calculateGravity
} from 'ebb-and-bloom-engine';
```

**R3F Demo**:
```typescript
import { Canvas } from '@react-three/fiber';
import { ChunkManager } from '@engine/spawners/ChunkManager';

function TerrainDemo() {
  return (
    <Canvas>
      {/* R3F components */}
    </Canvas>
  );
}
```

**Zustand State**:
```typescript
import { useGameStore } from '@demo/store/gameStore';

const { player, world } = useGameStore();
```

---

## Key Decisions

### Engine Refactor (2025-11-10)
**Why**: Separate simulation logic from presentation
**Impact**: Clean API, reusable engine, R3F demos

### React Three Fiber (2025-11-10)
**Why**: Modern web 3D, component-based, huge ecosystem
**Impact**: Replaced BabylonJS, better DX, declarative

### Zustand (2025-11-10)
**Why**: Lightweight state management, simple API
**Impact**: Clean state, no boilerplate, React integration

### Daggerfall Patterns (2025-11-10)
**Why**: 16 years of proven architecture
**Impact**: 7x7 chunks, steepness check, settlement clearance working perfectly

---

## Quality Standards

- TypeScript: 0 errors, 0 warnings
- Determinism: 100% (same seed = same result)
- Performance: 120 FPS target
- Tests: All passing
- Documentation: Comprehensive

---

**CRITICAL RULES**: 
- Engine is in `engine/` (not `packages/game/src/`)
- Use R3F for rendering (not BabylonJS)
- Import from `ebb-and-bloom-engine` package
- Status docs go in `memory-bank/` ONLY
- NO status documents in root (use memory-bank/ only)
- NO forcing outcomes (Yuka decides)
- ALL loops > 100 iterations MUST yield (call stack!)
- Root should ONLY have README.md and CLAUDE.md (if needed)
