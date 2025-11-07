# Agent Permanent Context

**For**: All AI agents (Cline, Cursor, Claude, Copilot)  
**Purpose**: Critical permanent information that should never be lost

---

## Project

**Ebb & Bloom**: Mobile-first procedural evolution game with seed-driven planetary physics.

**Core Principle**: "Everything is Squirrels" - base archetypes evolve through environmental pressure. NO hardcoded progression.

---

## Architecture

**Generational System**:
- **Gen 0**: Planetary genesis from seed (gravity, materials, climate)
- **Gen 1**: ECS archetypes spawn (Daggerfall-style prefabs)
- **Gen 2+**: Yuka AI spheres coordinate evolution

**Technology Stack**:
- ECS: Miniplex (game logic)
- Rendering: React Three Fiber (visuals only)
- UI: @react-three/uikit (NO DOM)
- AI: Yuka (creature behavior)
- State: Zustand (syncs FROM ECS, never writes)
- Platform: Capacitor (mobile)
- Seed: seedrandom (deterministic RNG)

---

## Critical Architectural Rules

1. **ECS for logic** - React Three Fiber for rendering ONLY
2. **Zustand syncs FROM ECS** - Never writes to it
3. **UIKit only** - NO DOM-based UI
4. **Property-based design** - Usage from properties, NOT names
5. **NO hardcoded values** - Calculate from planetary physics
6. **Yuka coordinates Gen 2+** - ALL evolution after Gen 1

---

## Key Documentation

**Read these for architectural decisions**:
- `docs/ARCHITECTURE.md` - Complete system architecture
- `docs/core/YUKA_SPHERE_ARCHITECTURE.md` - Yuka AI coordination
- `docs/core/UNIVERSAL_EVOLUTION_FRAMEWORK.md` - "Everything is Squirrels"
- `docs/core/TOOL_ARCHETYPES.md` - 8 tool categories
- `docs/core/CONSCIOUSNESS_AND_KNOWLEDGE.md` - Player as transferable awareness
- `docs/design/VISION.md` - Design philosophy
- `docs/design/brand/BRAND_IDENTITY_2025.md` - Brand guidelines

---

## File Structure

```
src/
├── systems/      # Game logic (ECS systems)
├── world/        # ECS schema (WorldSchema)
├── components/   # React Three Fiber rendering
├── stores/       # Zustand state management
└── App.tsx       # Entry point

docs/
├── ARCHITECTURE.md          # Master architecture
├── core/                    # Core system designs
├── design/                  # UI/UX & brand
└── archive/                 # Historical docs

memory-bank/
├── activeContext.md         # Current focus (ephemeral)
├── progress.md              # Status (ephemeral)
├── agent-permanent-context.md  # This file (permanent)
├── agent-collaboration.md   # Shared collaboration rules (permanent)
├── systemPatterns.md        # Architecture patterns (permanent)
├── techContext.md           # Stack & commands (permanent)
└── productContext.md        # What we're building (permanent)
```

---

## Development Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm test             # Run tests (must pass all)
pnpm test:watch       # Watch mode
npx cap sync android  # Sync to Android
npx cap open android  # Open Android Studio
```

---

## Testing

**All tests must pass before commit**: `pnpm test`

**Current**: 57/57 passing

**Target**: 80%+ coverage

---

## Current Blocker

**Generation 0 (Planetary Genesis) missing**

All systems use hardcoded values. Need seed-driven planetary physics as foundation.

See `memory-bank/activeContext.md` for current priority.


