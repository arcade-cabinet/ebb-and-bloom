# Ebb & Bloom

**A mobile-first procedural evolution game** where your actions ripple through a living, breathing world.

## 🌸 One-World Ache, Tidal Evo Ripples

80% deep immersion in ONE procedurally generated world that remembers every action. 20% poetic exiles to sibling worlds. Touch-first design with haptic feedback. ECS architecture with 57/57 tests passing.

## 🚀 Quick Start

\`\`\`bash
# Install
pnpm install

# Develop
pnpm dev

# Test
pnpm test

# Build Android APK
./build-android.sh
\`\`\`

## 📚 Documentation

**Start Here**:
- [VISION.md](docs/VISION.md) - Core philosophy and design pillars
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture and ECS patterns
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Developer guide and workflow

**Memory Bank** (AI & Human Reference):
- [productContext.md](memory-bank/productContext.md) - What we're building
- [techContext.md](memory-bank/techContext.md) - How it's built
- [progress.md](memory-bank/progress.md) - Implementation status
- [PROGRESS_ASSESSMENT.md](memory-bank/PROGRESS_ASSESSMENT.md) - Comprehensive assessment

**Package READMEs**:
- [src/ecs/](src/ecs/README.md) - Entity-Component-System core
- [src/systems/](src/systems/README.md) - Cross-cutting systems
- [src/game/](src/game/README.md) - Phaser rendering layer
- [src/stores/](src/stores/README.md) - Zustand state management
- [src/test/](src/test/README.md) - Test suites

## ✅ Current Status

**Stage 1 Complete** - Architecture solid, 8 systems implemented, 57/57 tests passing

**Implemented**:
- ✅ ECS architecture (BitECS)
- ✅ 10 trait components with synergies
- ✅ Resource snapping (affinity-based)
- ✅ Critter packs (formation, loyalty, roles)
- ✅ Pollution system (3 shock types)
- ✅ Behavior profiling (Harmony/Conquest/Frolick)
- ✅ Haptic feedback (20+ patterns)
- ✅ Gesture system (7 types)
- ✅ Haiku journaling (Jaro-Winkler diversity guard)
- ✅ World generation (Perlin noise, 5x5 chunks)
- ✅ CI/CD pipeline (automated builds, tests, releases)

**Next (Stage 2)**:
- Combat system (wisp clashes)
- Ritual mechanics (abyss reclamation)
- Nova cycles (45-90min resets)
- Stardust hops (sibling worlds)
- UX polish (onboarding, tutorials)

## 🎮 What Makes This Special

1. **Magnetic Resource Snapping**: No menus - resources fuse when adjacent
2. **Trait Inheritance**: Your traits ripple through the ecosystem
3. **Procedural Haiku**: Every action generates poetic narrative
4. **Touch as Language**: Gestures ARE the game, not shortcuts

## 🏗️ Tech Stack

- **Mobile**: Capacitor 6.1, Ionic Vue 8.7
- **Game**: Phaser 3.87 (rendering), BitECS 0.3.40 (logic)
- **State**: Zustand 5.0 (UI sync)
- **Dev**: pnpm, TypeScript 5.7, Vitest 2.1
- **CI/CD**: GitHub Actions, Renovate Bot

## 📊 Stats

- **APK Size**: 4MB (very lean!)
- **Tests**: 57/57 passing
- **Target**: 60 FPS on mid-range Android
- **Systems**: 11 total (8 core + 3 supporting)
- **Components**: 14 ECS components

## 🎯 Design Pillars

1. **Intimate Scale** - One world that evolves WITH you
2. **Tidal Rhythm** - Growth and decay are both beautiful
3. **Touch as Poetry** - Gestures feel like conducting symphony
4. **Evolutionary Memory** - Your legacy outlives you
5. **Mobile-First Forever** - Touch-first from day one

## 📱 Mobile Optimization

- Portrait orientation (one-handed play)
- Touch gestures (7 types)
- Haptic feedback (20+ patterns)
- 60 FPS target
- Battery-conscious rendering
- Lean APK (currently 4MB)

## 🧪 Testing

\`\`\`bash
pnpm test              # Run all 57 tests
pnpm test:watch        # Watch mode
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report
\`\`\`

**Test Suites**:
- Components (4 tests)
- Movement (3 tests)  
- Crafting (3 tests)
- Haiku Scorer (8 tests)
- Snapping (6 tests)
- Pollution & Behavior (15 tests)
- Pack System (18 tests)

## 🚢 Building

**Web**:
\`\`\`bash
pnpm build
pnpm preview
\`\`\`

**Android**:
\`\`\`bash
./build-android.sh
# or
pnpm build && npx cap sync android && npx cap open android
\`\`\`

## 📖 Learn More

- [Vision & Philosophy](docs/VISION.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Progress Assessment](memory-bank/PROGRESS_ASSESSMENT.md)

## 📜 License

See [LICENSE](LICENSE) file.

---

**Built with ❤️ for mobile-first gaming**

🌸 Explore • 🎨 Evolve • 🌍 Remember 🌸
