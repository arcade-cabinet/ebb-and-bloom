# Ebb & Bloom

**A mobile-first procedural evolution game where one world's ache becomes endless.**

[![Build Android APK](https://github.com/jbcom/ebb-and-bloom/actions/workflows/build-android.yml/badge.svg)](https://github.com/jbcom/ebb-and-bloom/actions/workflows/build-android.yml)
[![Tests](https://github.com/jbcom/ebb-and-bloom/actions/workflows/build-android.yml/badge.svg)](https://github.com/jbcom/ebb-and-bloom/actions/workflows/build-android.yml)

> *"One-World Ache, Tidal Evo Ripples"*

## What is this?

Ebb & Bloom is a mobile game about witnessing one world's evolution through your touch. Your catalyst creature evolves traits, snaps resources magnetically, and influences an ecosystem of critter packs—all in a procedurally-generated world that breathes with your actions.

**Stage 1 Complete**: Core architecture implemented, 57/57 tests passing, 4MB APK (very lean!)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build Android APK
pnpm build
npx cap sync android
```

## Documentation

### For Developers 👨‍💻

Start here to understand the codebase:

1. **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Quick start, workflow, code standards
2. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture, ECS patterns, data flow
3. **[VISION.md](docs/VISION.md)** - Game design philosophy and pillars
4. **[CODE_QUALITY_STANDARDS.md](docs/CODE_QUALITY_STANDARDS.md)** - "Leave it better" principle

### Memory Bank 🧠

The source of truth for AI and human developers:

- **[productContext.md](memory-bank/productContext.md)** - What we're building
- **[techContext.md](memory-bank/techContext.md)** - How it's built
- **[progress.md](memory-bank/progress.md)** - Where we are
- **[activeContext.md](memory-bank/activeContext.md)** - What's happening now
- **[systemPatterns.md](memory-bank/systemPatterns.md)** - How we work (PR process, patterns)

### Package Documentation 📦

Each package has its own README explaining purpose and usage:

- [src/ecs/](src/ecs/README.md) - Entity-Component-System (game logic)
- [src/systems/](src/systems/README.md) - Cross-cutting systems (Haiku, Haptics, Gestures)
- [src/game/](src/game/README.md) - Phaser rendering layer
- [src/stores/](src/stores/README.md) - Zustand state management
- [src/test/](src/test/README.md) - Testing infrastructure

## Core Features (Stage 1)

### ✅ Implemented

- **ECS Architecture** - BitECS with clean separation of concerns
- **10 Trait System** - FlipperFeet, ChainsawHands, DrillArms, etc. with synergies
- **Resource Snapping** - Affinity-based magnetic combining (8-bit flags)
- **Crafting System** - 5 recipes with resource validation
- **Pack System** - Critter social dynamics with loyalty and roles
- **Pollution & Shocks** - Global tracking with threshold events
- **Behavior Profiling** - Harmony/Conquest/Frolick playstyle tracking
- **Haiku Scorer** - Jaro-Winkler similarity for narrative journal
- **Haptic System** - 20+ patterns, playstyle-aware
- **Enhanced Gestures** - 7 types for mobile-first interaction
- **World Generation** - Perlin noise, chunk-based (5x5 chunks)
- **57 Passing Tests** - Comprehensive coverage

### 🔜 Coming in Stage 2

- UI/UX Polish (splash screens, onboarding)
- Catalyst Creator (trait selection UI)
- Combat System (wisp clashes)
- Ritual Mechanics (abyss reclamation)
- Nova Cycles (45-90min world resets)
- Stardust Hops (sibling worlds)

## Technology Stack

- **Mobile**: Capacitor 6.1+ (native bridge), Ionic Vue 8.7+ (UI)
- **Game Engine**: Phaser 3.87+ (rendering), BitECS 0.3.19 (game logic)
- **State**: Zustand 5.0+ (UI sync, read-only from ECS)
- **Frontend**: Vue 3.5+ (composition API), TypeScript 5.7+
- **Build**: Vite 6.0+, pnpm 9.x
- **Testing**: Vitest 2.1+, happy-dom
- **CI/CD**: GitHub Actions, Renovate Bot

## Architecture Principles

### ECS as Single Source of Truth

```
┌─────────────────────────────────────┐
│  BitECS (Source of Truth)          │
│  - Components: Position, Traits    │
│  - Systems: Movement, Crafting     │
└──────────────┬──────────────────────┘
               │ (one-way, read-only)
               ▼
    ┌──────────────────────┐
    │  Zustand UI Store    │
    │  Never writes to ECS │
    └──────┬────────┬───────┘
           │        │
           ▼        ▼
      ┌────┐    ┌───────┐
      │Vue │    │Phaser │
      └────┘    └───────┘
```

### Mobile-First Always

- Touch gestures as primary input
- Haptic feedback for all interactions
- Portrait orientation optimized
- 60 FPS non-negotiable
- Battery-conscious rendering

### Test-First Development

- Write tests before implementation
- 57/57 tests passing
- Coverage tracked in CI
- Fast test runs (< 5s)

## Project Structure

```
/
├── docs/                  # Architecture bible
│   ├── VISION.md         # Design philosophy
│   ├── ARCHITECTURE.md   # System architecture
│   └── DEVELOPMENT.md    # Developer guide
├── memory-bank/          # Source of truth
│   ├── productContext.md # What we're building
│   ├── techContext.md    # How it's built
│   └── progress.md       # Where we are
├── src/
│   ├── ecs/             # Game logic (BitECS)
│   ├── game/            # Phaser rendering
│   ├── systems/         # Cross-cutting concerns
│   ├── stores/          # UI state (Zustand)
│   ├── views/           # Vue components
│   └── test/            # Test suites
└── public/              # Static assets
```

## Development Workflow

1. **Start with Memory Bank** - Read productContext, techContext, progress
2. **Find the Right Package** - Check package READMEs
3. **Write Tests First** - TDD always
4. **Implement in ECS** - Components + Systems
5. **Update Documentation** - Memory bank + READMEs
6. **Commit & Push** - Follow conventional commits
7. **Handle PR Reviews** - Address ALL feedback immediately

See [systemPatterns.md](memory-bank/systemPatterns.md) for complete PR review process.

## Commands

```bash
# Development
pnpm dev                # Start Vite dev server
pnpm build              # Build for production
pnpm preview            # Preview production build

# Testing
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:ui            # Open Vitest UI
pnpm test:coverage      # Generate coverage

# Mobile
npx cap sync android    # Sync web assets to Android
npx cap open android    # Open in Android Studio
./build-android.sh      # Build APK
```

## Contributing

This project follows the **"Leave It Better Than You Found It"** principle:

- ✅ Fix ALL TODOs and placeholders immediately
- ✅ Address ALL PR review feedback before merge
- ✅ Update memory bank with changes
- ✅ Write tests for new features
- ✅ Document in package READMEs

See [CODE_QUALITY_STANDARDS.md](docs/CODE_QUALITY_STANDARDS.md) for details.

## Current Status

**Stage 1**: Complete ✅  
**Documentation**: Organized ✅  
**PR #3**: Ready for merge ✅  
**Next**: Stage 2 UX Polish (splash screens, catalyst creator, onboarding)

See [progress.md](memory-bank/progress.md) for detailed status.

## Design Philosophy

> **One-World Ache**: 80% of gameplay happens in a single persistent world. No galaxy-hopping menus—just intimate, procedural evolution in one breathing ecosystem.

> **Touch as Language**: Mobile gestures aren't just controls—they're how you speak to the world. Swipe to stride, pinch to terraform, long-press to commune.

> **Tidal Rhythm**: 45-minute nova cycles with haiku persistence. The world resets, but your journal remembers. Impermanence becomes the game loop.

## Inspiration

- **Elite (1984)** - Procedural scale with deterministic seeds
- **Outer Wilds** - One solar system, endless discovery
- **Subnautica** - Intimate world-building and exploration
- **No Man's Sky** - Procedural variety with meaningful choices

## License

MIT © 2025

---

**Built for mobile. Powered by ECS. Driven by evolution.**
