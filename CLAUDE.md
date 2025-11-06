# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ebb & Bloom** is a mobile-first procedural evolution game built with Vue 3, Phaser 3, and BitECS. The project follows a strict Entity-Component-System (ECS) architecture where all game logic lives in ECS systems, with Phaser handling only rendering and UI state managed through Zustand.

## Architecture Principles

### ECS as Single Source of Truth
- **BitECS World**: All game state lives here (`src/ecs/world.ts`)
- **Components**: Pure data structures (Position, Velocity, Inventory, Traits, Pack)
- **Systems**: Pure logic that modifies components (`src/ecs/systems/`)
- **Entities**: Numeric IDs linking components together

**Critical Rule**: Phaser and Zustand can only READ from ECS, never WRITE to it.

### Data Flow Pattern
```
ECS Systems (modify state) → Zustand Store (sync UI) → Vue Components (display)
                          → Phaser Scene (render sprites)
```

## Development Commands

### Core Development
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing
```bash
# Run all tests (57/57 must pass)
pnpm test

# Watch mode for development
pnpm test:watch

# Visual test interface
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### Mobile Development
```bash
# Build and sync to Android
pnpm build && npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK directly
./build-android.sh
```

### Type Checking
```bash
# TypeScript check (configured in tsconfig.json)
npx tsc --noEmit
```

## Key Development Patterns

### Memory Bank First
**Always** read the Memory Bank before starting any task:
1. `memory-bank/activeContext.md` - Current work focus
2. `memory-bank/techContext.md` - Technical context
3. `memory-bank/progress.md` - Current status

### ECS Development Pattern
1. **Define Component**: Add to `src/ecs/components/`
2. **Create System**: Add to `src/ecs/systems/`
3. **Write Tests**: Add to `src/test/` (TDD approach)
4. **Hook to Scene**: Update `src/game/GameScene.ts`

### Testing Requirements
- All systems MUST have tests
- Target 80%+ coverage
- Tests run with Vitest + happy-dom
- Mock setup in `src/test/setup.ts`

## Code Architecture

### Package Structure
```
src/
├── ecs/                 # Game logic (BitECS)
│   ├── components/      # Data-only components
│   ├── systems/         # Logic that modifies components
│   ├── entities/        # Entity factory functions
│   └── world.ts         # ECS world management
│
├── game/                # Phaser rendering (READ-ONLY from ECS)
│   ├── GameScene.ts     # Main scene, game loop
│   └── core/            # World generation, perlin noise
│
├── systems/             # Cross-cutting systems
│   ├── HaikuScorer.ts   # Narrative diversity guard
│   ├── HapticSystem.ts  # Touch feedback
│   └── GestureSystem.ts # Touch input handling
│
├── stores/              # Zustand UI state (READ-ONLY from ECS)
│   └── gameStore.ts     # UI state management
│
├── views/               # Vue components
├── test/                # Vitest test suites
└── utils/               # Shared utilities
```

### Critical Components

#### ECS Systems (src/ecs/systems/)
- `MovementSystem.ts` - Position/velocity updates
- `CraftingSystem.ts` - Recipe validation, inventory management
- `SnappingSystem.ts` - Affinity-based resource combining
- `PackSystem.ts` - Critter pack formation and loyalty
- `PollutionSystem.ts` - Global pollution tracking
- `BehaviorSystem.ts` - Playstyle profiling (Harmony/Conquest/Frolick)

#### Game Systems (src/systems/)
- `HaikuScorer.ts` - Jaro-Winkler similarity for narrative diversity
- `HapticSystem.ts` - 20+ haptic patterns for mobile feedback
- `GestureSystem.ts` - 7 gesture types for touch input

### Technology Stack
- **Mobile**: Capacitor 6.1+ (native bridge)
- **UI Framework**: Vue 3.5+ with Composition API
- **Game Engine**: Phaser 3.87+ (rendering only)
- **Game Logic**: BitECS 0.3+ (ECS architecture)
- **State Management**: Zustand (UI state, read-only from ECS)
- **Build Tool**: Vite 6.0+
- **Testing**: Vitest 2.1+ with happy-dom
- **Package Manager**: pnpm

## Development Workflow

### Before Coding
1. Read Memory Bank (`memory-bank/activeContext.md`, `progress.md`)
2. Check existing tests related to your changes
3. Review package READMEs for affected areas
4. Understand the ECS architecture pattern

### During Development
1. **Write Tests First** (TDD approach)
2. **Implement in ECS** if it's game logic
3. **Update Phaser Scene** if rendering changes needed
4. **Sync UI Store** if UI state changes needed
5. **Run Tests**: `pnpm test` (all 57 must pass)

### After Development
1. Update relevant package READMEs
2. Update Memory Bank with significant changes
3. Use semantic commit messages (`feat:`, `fix:`, `docs:`, `chore:`)
4. Ensure all tests pass

## Performance Considerations

### Mobile-First Constraints
- Target 60 FPS on mobile devices
- Use sprite pooling (no create/destroy in game loop)
- Implement viewport culling for large worlds
- Battery-conscious rendering optimizations

### ECS Performance
- Systems operate on component queries
- Avoid entity lookup in hot paths
- Batch component updates when possible

## Common Issues and Solutions

### ECS Integration
- **Problem**: Game logic in Phaser scene
- **Solution**: Move to ECS system, update from ECS in scene

### Testing
- **Problem**: Phaser/Capacitor not available in tests
- **Solution**: Use mocks in `src/test/setup.ts`

### State Synchronization
- **Problem**: UI state out of sync with game
- **Solution**: Ensure Zustand store updates from ECS systems

## Configuration Files

- `vite.config.js` - Build configuration with Vue plugin and testing setup
- `tsconfig.json` - TypeScript configuration with strict mode
- `capacitor.config.ts` - Mobile app configuration
- `package.json` - Dependencies and scripts (ES modules enabled)

## Important Rules from .cursor/rules

1. **Memory Bank First**: Always check memory bank before starting tasks
2. **ECS Architecture**: Game logic only in ECS systems, not Phaser scenes
3. **Testing**: All systems must have tests, run before committing
4. **Performance**: Use sprite pooling, target 60 FPS mobile
5. **Design Docs**: Reference `docs/` before implementing features