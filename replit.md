# Ebb & Bloom - Replit Configuration

**Last Updated:** November 11, 2025

## Project Overview

Ebb & Bloom is a **law-based universe simulation engine** that generates deterministic, scientifically-grounded procedural worlds from three-word seeds. Instead of using AI or hardcoded data, the engine implements **57 mathematical laws** from physics, biology, ecology, and social sciences.

### Core Principles
1. **Law-Based Generation** - Everything emerges from scientific laws (physics, stellar, biology, ecology, social, taxonomy)
2. **Deterministic** - Same seed → Same universe. Always.
3. **Multi-Scale** - Simulates from quantum (Planck scale) to cosmic (universe-wide)
4. **Governor-Driven** - 17 Yuka-native autonomous governors make all decisions
5. **Daggerfall-Inspired** - Proven 1996 architecture adapted for modern web

### Key Features
- **57 Law Files** (8,500+ lines) - Physics, stellar, biology, ecology, social laws
- **17 Governors** - Yuka-native autonomous decision makers
  - Physics (4): Gravity, Orbit, Temperature, Stellar
  - Biology (5): Metabolism, Lifecycle, Reproduction, Genetics, Cognitive
  - Ecology (5): Flocking, PredatorPrey, Territory, Foraging, Migration
  - Social (3): Hierarchy, Warfare, Cooperation
- **Complete World Generation** - 7x7 chunk streaming (Daggerfall pattern)
- **11 Biome Types** - Temperature/moisture based (Whittaker diagram)
- **Deterministic RNG** - EnhancedRNG for reproducible worlds
- **Procedural Synthesis** - Chemistry creates visuals (no prefabs)
- **Full Timeline** - Big Bang → Heat Death simulation
- **Performance** - 120 FPS, instanced rendering, efficient chunk recycling

## Technology Stack

- **Frontend:** React 18.3, React Three Fiber
- **3D Engine:** Three.js 0.169
- **AI Framework:** Yuka (steering, goals, FSM, fuzzy logic)
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.7
- **State Management:** Zustand
- **Testing:** Vitest + Playwright

## Project Structure

```
ebb-and-bloom/
├── engine/                 # Core simulation engine (~10,000 lines)
│   ├── governors/         # 17 Yuka-native governors (2,271 lines)
│   │   ├── physics/      # Gravity, Orbit, Temperature, Stellar
│   │   ├── biological/   # Metabolism, Lifecycle, Reproduction, Genetics, Cognitive
│   │   ├── ecological/   # Flocking, PredatorPrey, Territory, Foraging, Migration
│   │   └── social/       # Hierarchy, Warfare, Cooperation
│   ├── procedural/        # Synthesis systems (chemistry → visuals)
│   ├── core/              # WorldManager, TerrainSystem, PlayerController, etc.
│   ├── systems/           # Tools, structures, trade, workshops
│   └── tables/            # Universal constants (6 tables)
├── generation/            # World spawners (Daggerfall-inspired)
│   └── spawners/
│       ├── ChunkManager.ts       # 7x7 terrain streaming
│       ├── SimplexNoise.ts       # O(n²) noise (better than Perlin)
│       ├── BiomeSystem.ts        # 11 biome types
│       ├── VegetationSpawner.ts  # Trees (instanced rendering)
│       ├── SettlementPlacer.ts   # Law-based city placement
│       ├── NPCSpawner.ts         # NPCs with daily schedules
│       ├── CreatureSpawner.ts    # Procedural creatures
│       └── WaterSystem.ts        # Animated water shaders
├── game/                  # Game implementation (React Three Fiber)
│   ├── ui/               # HUD, screens, theme (Material-UI)
│   ├── Game.tsx          # Main game component
│   └── main.tsx          # Entry point
├── docs/                  # Complete documentation
│   ├── ARCHITECTURE.md   # Engine architecture
│   ├── ENGINE.md         # Complete API reference
│   ├── DESIGN.md         # UI/UX design system
│   ├── LAW_SYSTEM.md     # 57 law catalog
│   └── architecture/     # Detailed system docs
├── memory-bank/           # Project memory & development history
│   ├── NEXT_AGENT_HANDOFF.md  # Complete implementation guide
│   ├── current-status.md       # Current project state
│   ├── sessions/               # Development session summaries
│   └── architecture/           # Architecture decisions
├── tests/                 # Comprehensive test suite
│   ├── unit/             # Governor, synthesis, spawner tests
│   └── integration/      # World, determinism, performance tests
└── vite.config.ts         # Vite configuration (port 5000)
```

## Development

### Running the Project
```bash
npm install        # Install dependencies
npm run dev        # Start development server (port 5000)
```

The game will be available at `http://localhost:5000/`

### Testing
```bash
npm test                    # Run unit tests
npm run test:browser        # Run Playwright tests
npm run test:coverage       # Coverage report
npm run type-check          # TypeScript checks
```

### Scripts
- `npm run dev` - Development server on port 5000
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Replit Configuration

### Port Configuration
- **Development:** Port 5000 (configured in vite.config.ts)
- **Host:** 0.0.0.0 (allows Replit proxy)
- **HMR:** Configured for port 5000

### Workflow
- **Name:** dev
- **Command:** npm run dev
- **Output:** webview (shows website preview)
- **Port:** 5000

### Important Notes
1. The Vite config explicitly allows all hosts to work with Replit's iframe proxy
2. Hot Module Replacement (HMR) is configured for port 5000
3. The game runs in React StrictMode for better development experience

## Architecture Principles

### Philosophy
**Bottom-up emergence** - Everything emerges from autonomous agents following scientific laws. No forcing outcomes, no hardcoded data. Yuka decides everything.

### Governor System (17 Yuka-Native Governors)
All agent behaviors implemented as Yuka primitives:
- **SteeringBehaviors** - Physics, ecology (continuous forces)
- **Goals + Evaluators** - Biology, social (decision-making)
- **StateMachines** - Lifecycle, social states
- **FuzzyLogic** - Environmental responses

**Governors by Domain:**
- **physics/** (4): Gravity, Orbit, Temperature, Stellar
- **biological/** (5): Metabolism, Lifecycle, Reproduction, Genetics, Cognitive
- **ecological/** (5): Flocking, PredatorPrey, Territory, Foraging, Migration
- **social/** (3): Hierarchy, Warfare, Cooperation

### Law System (57 Laws)
Scientific formulas that drive all generation:
- **Physics Laws** - Gravity, thermodynamics, orbital mechanics
- **Stellar Laws** - Star formation, evolution, habitable zones
- **Biology Laws** - Kleiber's Law, allometric scaling, metabolism
- **Ecology Laws** - Lotka-Volterra, carrying capacity, competition
- **Social Laws** - Dunbar's number, Service typology, governance
- **Taxonomy Laws** - Linnaean classification

### World Generation (Daggerfall-Inspired)
Proven 1996 architecture adapted for modern web:
- **ChunkManager** - 7x7 streaming grid (exact DFU pattern)
- **SimplexNoise** - O(n²) noise (better than Perlin's O(2^n))
- **BiomeSystem** - 11 types (Whittaker diagram)
- **VegetationSpawner** - Instanced rendering, steepness rejection
- **SettlementPlacer** - Law-based population, terrain suitability
- **NPCSpawner** - Daily schedules, Yuka AI behaviors
- **CreatureSpawner** - Kleiber's Law, procedural anatomy

### Synthesis Systems
Chemistry creates all visuals (no prefabs):
- **MolecularSynthesis** - Protein/calcium/chitin % → geometry
- **PigmentationSynthesis** - Diet + environment → coloring
- **StructureSynthesis** - Materials → tools/structures
- **BuildingArchitect** - Governance → architecture
- **InteriorGenerator** - Room layouts + furniture
- **WeaponSynthesis** - Materials → weapons

## Memory Bank

The `memory-bank/` directory contains all project context and history:
- **activeContext.md** - Current project state
- **architecture/** - Architecture documentation
- **sessions/** - Development session summaries
- **NEXT_AGENT_HANDOFF.md** - Complete handoff guide

For detailed project history and architecture decisions, review:
1. `.clinerules` - Agent rules and current status
2. `memory-bank/NEXT_AGENT_HANDOFF.md` - Complete implementation details
3. `README.md` - Public-facing documentation

## Current Status

**Game Status:** ✅ WORKING (60+ FPS)
- 7x7 chunk terrain streaming
- 11 biome types (ocean, forest, desert, etc.)
- Vegetation system (trees, instanced rendering)
- Water system (animated shaders)
- Settlement generation (villages, towns, cities)
- NPC agents with schedules (58+ NPCs)
- Creature spawning (100+ creatures with Yuka AI)
- Day/night cycle
- First-person controls (WASD + mouse)

**Test Coverage:** 87% (45/52 tests passing)

## User Preferences

- Follow DFU (Daggerfall Unity) patterns for architecture
- Use Yuka AI framework for agent behaviors
- Maintain deterministic generation (same seed = same world)
- Focus on bottom-up emergence over hardcoded systems
- Prioritize engine architecture over game features
- No prefabs - everything generated from laws and chemistry

## Architecture (Corrected)

The project is organized into three main areas aligned with the separation of concerns:

### `engine/` - Pure Engine Systems
Core systems that execute without autonomous behavior:
- **core/** - WorldManager, TerrainSystem, PlayerController, CreatureManager, CityPlanner
- **procedural/** - MolecularSynthesis, PigmentationSynthesis, StructureSynthesis, etc.
- **systems/** - CreatureBehaviorSystem, PackFormationSystem, ToolSystem, TradeSystem
- **utils/** - EnhancedRNG, seed management
- **stores/** - World state management
- **config/** - Feature flags
- **types/** - Type definitions

### `agents/` - Governors & Laws (Controls the Engine)
Autonomous systems that make decisions and control engine behavior:
- **governors/** - 17 Yuka-native governors (physics, biological, ecological, social)
- **tables/** - Universal constants and law data (physics, biology, ecology, social)
- **agents-yuka/** - Yuka agent classes (CreatureAgent, etc.)

### `generation/` - World Generation
Procedural spawners and world systems:
- **spawners/** - ChunkManager, BiomeSystem, SimplexNoise, VegetationSpawner, SettlementPlacer, NPCSpawner, CreatureSpawner, WaterSystem

### `game/` - Game Layer
React UI and game-specific code:
- **ui/** - HUD, screens, theme (Material-UI)
- **Game.tsx** - Main game component
- **main.tsx** - Entry point

## Recent Changes

**November 11, 2025 - Replit Import & Architecture Fix:**
- ✅ Configured project for Replit environment
- ✅ Updated Vite to use port 5000 with `host: '0.0.0.0'`
- ✅ Added `allowedHosts: true` to support Replit's proxy system (correct syntax per Vite docs)
- ✅ Configured development workflow (npm run dev on port 5000, webview output)
- ✅ Set up deployment configuration (autoscale with npm run build/preview)
- ✅ **Fixed architecture** - Moved tables from engine/ to agents/ (law constants belong with governors)
- ✅ **Fixed import paths** - All governor imports now correctly reference `../../tables/`
- ✅ **Governor tests passing** - 15/15 governor tests pass
- ✅ **Game running** - WorldManager initializing successfully, deterministic generation working
- ✅ Installed all dependencies (725 packages)
- ✅ Created comprehensive replit.md documentation
- ✅ Added vitest path aliases for @agents and @generation

**Import Status:** ✅ Complete and verified working

**Architecture Status:** ✅ Aligned with design intent:
- `engine/` = Pure systems (WorldManager, TerrainSystem, synthesis, etc.)
- `agents/` = Governors + law tables (autonomous decision-makers that control the engine)
- `generation/` = World spawners (ChunkManager, BiomeSystem, etc.)
- `game/` = React UI layer

## Dependencies Notes

- All dependencies installed via npm
- Using latest stable versions where possible
- Some peer dependency warnings are expected (Material-UI)
- 8 vulnerabilities noted (7 moderate, 1 critical) - review before production

## Known Issues

- Some LSP errors during initial setup (resolved after npm install)
- npm audit shows vulnerabilities (non-blocking for development)
- GPU warnings in Playwright tests (expected, from screenshot capture)

## Links

- GitHub: (imported repository)
- Documentation: `docs/` and `memory-bank/`
- Engine API: `ENGINE.md`
- Architecture: `docs/ARCHITECTURE.md`
