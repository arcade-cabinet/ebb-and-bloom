# Ebb & Bloom

**Procedural evolution game where consciousness flows through living forms**

Cross-platform evolutionary ecosystem with emergent complexity from simple archetypes.

---

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm setup:textures   # Setup textures
pnpm dev              # Start dev server
pnpm test             # Run tests (57/57 passing)
```

---

## Core Concept

**"Everything is Squirrels"**: Base archetypes evolve through environmental pressure into infinite variations.

### Generational Architecture

- **Generation 0**: Planetary genesis from seed (gravity, materials, climate) - **TO BE IMPLEMENTED**
- **Generation 1**: ECS archetypes spawn (Daggerfall-style prefabs)
- **Generation 2+**: Yuka AI spheres coordinate evolution

**Key Innovation**: NO hardcoded progression. Everything emerges from seed-driven planetary physics.

---

## Technology

- **ECS**: Miniplex (game logic)
- **Rendering**: React Three Fiber (3D graphics)
- **UI**: @react-three/uikit (3D UI, NO DOM)
- **AI**: Yuka (creature behavior)
- **State**: Zustand (syncs FROM ECS, never writes)
- **Platform**: Capacitor (web, Android, iOS, desktop)
- **Build**: Vite
- **Test**: Vitest

---

## Current Status

**Foundation missing**: Generation 0 does not exist. All systems use hardcoded values.

**What works**: ECS, rendering, creature evolution, packs, haikus, camera, haptics, gestures.

**What's broken**: Tools never emerge, materials never unlock, buildings never construct. Game loop broken at Gen 3+.

**Blocker**: Need Gen 0 foundation before other work can proceed.

---

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[docs/DESIGN.md](docs/DESIGN.md)** - Vision, brand, UI/UX
- **[memory-bank/](memory-bank/)** - AI agent context

---

## Development

### File Structure
```
src/
├── systems/      # ECS systems (game logic)
├── world/        # ECS schema (WorldSchema)
├── components/   # React Three Fiber (rendering)
├── stores/       # Zustand (UI state)
└── App.tsx       # Entry point
```

### Architecture Rules
1. ECS for game logic
2. React Three Fiber for rendering ONLY
3. Zustand syncs FROM ECS, never writes
4. UIKit for ALL UI (NO DOM)
5. NO hardcoded values (calculate from Gen 0)

### Before Contributing
1. Read `memory-bank/activeContext.md`
2. Read `docs/ARCHITECTURE.md`
3. Write tests first (TDD)
4. Run `pnpm test` (all must pass)

---

## License

MIT

