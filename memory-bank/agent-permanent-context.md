# Agent Permanent Context

**For**: All AI agents (Cursor, Claude, Cline, Copilot)  
**Purpose**: Critical permanent information that should never be lost  
**Last Updated**: 2025-11-10 (Engine refactor complete)

---

## Project

**Ebb & Bloom Engine**: Law-based universe simulation engine with deterministic procedural generation.

**Core Principle**: "Everything emerges from LAWS" - 57 scientific laws from physics, biology, ecology, and social sciences generate complete universes from three-word seeds.

**Platform**: Web (React Three Fiber) + Cross-platform (iOS, Android via Capacitor)

---

## 🔥 CRITICAL: ENGINE ARCHITECTURE

**MAJOR REFACTOR + LAW PORT COMPLETED (Nov 10, 2025):**

**What changed:**
- ✅ Flattened monorepo → `engine/` + `demo/` structure
- ✅ Added React Three Fiber + Drei + Zustand
- ✅ Removed BabylonJS completely
- ✅ Removed pnpm workspace (now npm)
- ✅ **ELIMINATED engine/laws (8,755 lines deleted)**
- ✅ **PORTED to engine/governors (17 Yuka-native governors)**
- ✅ Proper engine/game separation

**Current Structure:**
```
engine/              # Pure simulation logic (no rendering)
├── governors/      # 17 Yuka-native governors (2,271 lines)
├── spawners/       # World generation
├── agents/         # Yuka AI integration
├── simulation/     # Timeline engine
├── tables/         # Constants (physics, biology, ecology, social)
├── core/           # GameEngine
└── index.ts        # Main export

demo/               # R3F demos (presentation layer)
├── src/
│   ├── demos/      # Terrain, Universe, Playground, Governors
│   ├── store/      # Zustand state
│   └── components/ # R3F components
└── package.json    # Separate dependencies
```

**The new flow:**
```
Three-word seed → Governors (Yuka-native) → Complete Universe
                    ↓
                 Engine API
                    ↓
            R3F Components → Visual
```

**Same seed = same universe. Always. Deterministic.**

**100% Yuka governors - no external law calls!**

---

## Architecture

**Engine Structure:**
```
engine/
├── governors/         # 17 Yuka-native agent behaviors
│   ├── physics/       # Gravity, Orbit, Temperature, Stellar (4)
│   ├── biological/    # Metabolism, Lifecycle, Reproduction, Genetics, Cognitive (5)
│   ├── ecological/    # Flocking, PredatorPrey, Territory, Foraging, Migration (5)
│   ├── social/        # Hierarchy, Warfare, Cooperation (3)
│   ├── README.md      # Governor architecture guide
│   └── index.ts       # Main export
│
├── tables/            # Universal constants
│   ├── physics-constants.ts
│   ├── biological-constants.ts
│   ├── ecological-constants.ts
│   ├── social-constants.ts
│   ├── periodic-table.ts
│   └── linguistic-roots.ts
│
├── spawners/          # World generation (Daggerfall-inspired)
│   ├── ChunkManager.ts      # 7x7 chunk streaming
│   ├── BiomeSystem.ts       # 11 biomes
│   ├── SimplexNoise.ts      # Terrain heightmaps
│   ├── VegetationSpawner.ts # Instanced trees
│   ├── SettlementPlacer.ts  # Law-based cities
│   ├── NPCSpawner.ts        # Daily schedules
│   ├── CreatureSpawner.ts   # Kleiber's Law
│   └── WaterSystem.ts       # Animated shaders
│
├── agents/            # Yuka AI integration
│   ├── AgentSpawner.ts
│   ├── AgentLODSystem.ts
│   ├── CreatureAgent.ts
│   ├── PlanetaryAgent.ts
│   ├── evaluators/    # Decision-making
│   └── behaviors/     # Steering behaviors
│
├── simulation/        # Timeline engine
│   ├── UniverseSimulator.ts
│   ├── TimelineSimulator.ts
│   └── UniverseActivityMap.ts
│
├── utils/             # Core utilities
│   ├── EnhancedRNG.ts       # Deterministic RNG
│   └── seed/                # Seed management
│
└── tables/            # Universal constants
    ├── periodic-table.ts
    ├── physics-constants.ts
    └── linguistic-roots.ts
```

**Technology Stack:**
- **Engine**: TypeScript (pure logic, no rendering)
- **Demo**: React + React Three Fiber + Drei
- **State**: Zustand
- **AI**: Yuka (steering behaviors)
- **RNG**: seedrandom (deterministic)
- **Build**: Vite + npm

---

## Critical Rules

1. **Law-Based Generation**: Everything emerges from mathematical laws
2. **Deterministic**: Same seed must produce same result
3. **Engine/Demo Separation**: Engine has NO rendering code
4. **String Seeds**: Three-word format (`v1-word-word-word`)
5. **No Status Docs**: All status goes in memory-bank/ only
6. **React Three Fiber**: Use R3F for all 3D rendering

---

## Development Commands

```bash
# Engine (root)
npm install              # Install engine dependencies
npm test                 # Run tests
npm run type-check       # TypeScript validation

# Demo (separate package)
cd demo
npm install              # Install demo dependencies
npm run dev              # Dev server (localhost:5173)
npm run build            # Production build

# Tools
cd tools/cli
tsx validate-laws.ts     # Validate all laws
tsx test-determinism.ts  # Test determinism
```

---

## Key Files

**Engine Core:**
- `engine/index.ts` - Main API export
- `engine/laws/*.ts` - All 57 law implementations
- `engine/spawners/ChunkManager.ts` - Terrain streaming
- `engine/utils/EnhancedRNG.ts` - Deterministic RNG

**Demo:**
- `demo/src/demos/TerrainDemo.tsx` - R3F terrain demo
- `demo/src/store/gameStore.ts` - Zustand state
- `demo/index.html` - Entry point

**Documentation:**
- `README.md` - Engine overview
- `ENGINE.md` - Complete API docs
- `ENGINE_ARCHITECTURE.md` - Technical architecture
- `docs/` - Additional architecture docs

---

## Current Status

**Engine**: ✅ Complete (v1.0)
- 57 law files implemented
- DFU proven patterns (7x7 chunks, steepness check, clearance)
- SimplexNoise terrain (superior to Perlin)
- Instanced vegetation (efficient)
- Yuka AI agents
- Deterministic generation verified

**Demo**: ✅ Working
- R3F integration complete
- 3 demos created (Terrain, Universe, Playground)
- Zustand state management
- Beautiful landing page

**Documentation**: ✅ Comprehensive
- README.md (engine overview)
- ENGINE.md (400 lines API docs)
- ENGINE_ARCHITECTURE.md (600 lines architecture)
- Memory bank updated

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

**CRITICAL**: 
- Engine is in `engine/` (not `packages/game/src/`)
- Use R3F for rendering (not BabylonJS)
- Import from `ebb-and-bloom-engine` package
- Status docs go in `memory-bank/` ONLY
