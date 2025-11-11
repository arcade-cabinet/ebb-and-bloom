# Ebb & Bloom - Replit Configuration

## Overview

Ebb & Bloom is a **competitive evolution game** where you guide ONE species from protozoa to transcendence while competing against YUKA-controlled autonomous species for resources.

**Core Gameplay:**
- **You:** Play as a GOVERNOR guiding ONE SPECIES (all individuals in lineage, not single creature)
- **YUKA:** Other governors guide competing species using SAME law-constrained tools
- **Control:** INDIRECT environmental influence (smite predators, nurture food, shape terrain) - creatures respond autonomously
- **Constraints:** Energy budget, 57 scientific laws apply equally to you AND YUKA
- **Start:** Primordial world (protozoa → civilization → transcendence)
- **Goal:** First species to transcend wins (but they decide autonomously, not you)

**Technical Foundation:**
- **Law-Based Generation:** 57 scientific laws drive all emergence
- **Deterministic:** Same seed always produces same universe
- **Governor-Driven:** 17 YUKA autonomous governors make all NPC decisions
- **Multi-Scale:** Quantum to cosmic simulation support
- **Daggerfall Bridge:** Uses DFU spawner LOGIC with law-computed data (not hardcoded medieval content)

## User Preferences

**Gameplay Philosophy:**
- **Competitive Evolution:** Player vs YUKA species, not exploration sandbox
- **Governor View (Spore-style):** Strategic overhead perspective - see the ECOSYSTEM, not single creature. Like Spore's Creature/Tribal/Civilization stages - guide your species from above
- **Mobile Diorama:** Tilt device to pan strategic view, hold the living world in your hands
- **Primordial Start:** Begin at abiogenesis, NOT medieval Britain
- **Archetype Discovery:** Synthesis systems generate possibilities from materials, not pre-made content
- **Strategic Depth:** Every evolutionary decision has trade-offs and YUKA responses
- **Temporal Pacing:** Systems must be observable - SEE creatures thinking, reasoning, building (not instant)

**Technical Philosophy:**
- **MOBILE-FIRST:** Android via Capacitor is primary platform, dev server for testing only
- **Sensory Immersion:** Leverage ALL mobile sensors (gyroscope, accelerometer, haptics) - hold the universe in your hands
- **Gyroscope Camera:** Device orientation controls perspective through cosmic stages
- Use YUKA AI framework for ALL autonomous species behaviors
- Maintain deterministic generation (same seed = same world)
- Focus on bottom-up emergence over hardcoded systems
- DFU spawner LOGIC is good, DFU medieval CONTENT is irrelevant
- No prefabs - everything generated from laws and chemistry
- **Modernization:** Import directly from libraries, create abstractions only when preventing real duplication
- **Visualization:** Time dilation controls, decision transparency, smooth interpolation - avoid instant simulation

**Cosmic Genesis Foundation:**
- **Complete Provenance Chain:** Big Bang → Dark Matter Web → Pop III Stars → Supernova Enrichment → Galaxy Position → Molecular Cloud → Stellar Furnace → Planetary Accretion → Differentiation → Surface
- **Radial Expansion:** Distance from cosmic center determines galaxy age, supernova cycles, metallicity, available elements
- **Material Traceability:** Everything traces back to cosmic origin (kill fox = fox parts with cosmic lineage, destroy shelter = materials with planetary lineage)
- **Geology from Accretion:** Where is tin/copper/diamonds? Determined by galaxy metallicity + planetary accretion + impact delivery
- **Natural Progression:** Spears → gunpowder → atomic bomb follows element availability from cosmic position
- **Intro FMV:** Cosmic expansion visualization teaches provenance, solves rendering/zoom/audio, production-ready content

## System Architecture

The project is structured into three main areas: `engine/`, `agents/`, `generation/`, and `game/`. This organization ensures a clear separation of concerns, aligning with Daggerfall Unity (DFU) patterns for robustness and scalability.

**Core Principles:**
- **Bottom-up Emergence:** Everything arises from autonomous agents following scientific laws, with outcomes emerging naturally rather than being forced or hardcoded.
- **Governor System:** 17 Yuka-native governors (Physics, Biology, Ecology, Social) drive all agent behaviors using Yuka primitives like SteeringBehaviors, Goals+Evaluators, StateMachines, and FuzzyLogic.
- **Law System:** 57 scientific formulas (Physics, Stellar, Biology, Ecology, Social, Taxonomy) dictate all generation and simulation processes.

**Architecture Bridge (DFU Adaptation):**
We use DFU's spawner CODE (ChunkManager streaming, EntityManager ownership) but feed it law-computed data instead of hardcoded medieval content. For example:
```
DFU: population = MAPS.BSA.lookup(regionID)  // Hardcoded
Ebb: population = EcologyGovernor.calculateCarryingCapacity(biome, resources)
```
This keeps proven architectural patterns while enabling competitive evolution gameplay.

**World Generation:**
- **ChunkManager:** Implements a 7x7 streaming grid, mirroring the DFU pattern.
- **SimplexNoise:** Utilized for efficient and high-quality noise generation.
- **BiomeSystem:** Generates 11 distinct biome types based on the Whittaker diagram.
- **Procedural Spawners:** Vegetation, settlements, NPCs, and creatures are spawned procedurally, adhering to physical and biological laws.

**Synthesis Systems:**
Visuals and structures are created through chemical synthesis, eliminating the need for prefabs:
- **MolecularSynthesis:** Determines geometry based on molecular composition.
- **PigmentationSynthesis:** Generates coloring based on diet and environment.
- **StructureSynthesis:** Creates tools and structures from materials.
- **BuildingArchitect:** Designs architecture based on governance.

**Technology Stack:**
- **Runtime:** Node.js 24.4.0 (latest LTS)
- **Frontend:** React 19.2, React Three Fiber
- **3D Engine:** Three.js 0.169
- **AI Framework:** Yuka
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.7 targeting ES2023
- **State Management:** Zustand
- **Testing:** Vitest (happy-dom) + Playwright
- **Mobile:** Capacitor 7.x for Android/iOS

**Project Structure Overview:**
- `engine/`: Pure engine systems (WorldManager, TerrainSystem, procedural synthesis).
- `agents/`: Governors, law tables, and Yuka agent classes.
- `generation/`: DFU-compatible world spawners (ChunkManager, BiomeSystem).
- `game/`: React UI and game-specific components (HUD, Game.tsx).
- `tests/`: Centralized test infrastructure (fixtures, factories, helpers).

**Testing Infrastructure:**
- **Fixtures** (`tests/fixtures/`): Shared test setup (RNG, audio, haptics mocks)
  - `rngFixture.ts`: Global RNG auto-reset, `withSeed()` helper for determinism
- **Factories** (`tests/factories/`): Test data generation
  - `cosmicFactories.ts`: `createTestGenesis()`, `createTestTimeline()`, `createTestStageContext()`
- **Helpers** (`tests/helpers/`): Shared test utilities
- **Conventions:**
  - Use RNGRegistry exclusively (never instantiate EnhancedRNG directly)
  - Prefer parameterized tests (`test.each`) over repetitive test functions
  - Use factories for consistent object creation
  - Leverage Playwright codegen for E2E test generation

## Recent Changes

### Current Session Progress

**CRITICAL FIXES - Game Now Playable:**
- ✅ **Routing Fixed:** App.tsx now routes "/" to Game component (was redirecting to /demos)
- ✅ **Black Screen Fixed:** MenuScene now renders visibly on startup
  - SceneManager: Skip fade transitions on initial scene load
  - TransitionWrapper: Show content immediately (no opacity delay)
  - Game.tsx: Use useRef to prevent React StrictMode double-initialization
- ✅ **Legacy Cleanup:** Removed packages/ directory (old monorepo remnant)
- ✅ **Timer Injection:** CosmicHapticFeedback now accepts timer mocks for fast tests
- ✅ **450+ Tests Passing:** All unit, integration, E2E, performance tests green
- ✅ **Zero LSP Errors:** Clean TypeScript across entire codebase

**Test Infrastructure Achievements:**
- ✅ Comprehensive test infrastructure (fixtures, factories, parameterization)
- ✅ Scene-based architecture (SceneManager + Menu/Intro/Gameplay/Pause scenes)
- ✅ Full CosmicExpansionFMV integration with audio/haptics/gyroscope support
- ✅ Playwright E2E tests with visual regression and mobile device testing
- ✅ GameState integration tests with seed propagation verification
- ✅ Performance benchmarks for all cosmic generation systems
- ✅ Determinism tests across entire cosmic pipeline (Genesis → Timeline → Stages)
- ✅ Edge case tests for extreme scenarios (zero, epsilon, infinity, max values)

**Test Coverage:**
- **Unit Tests:** 300+ tests passing across governors, laws, UI, and core systems
- **Integration Tests:** 29/29 tests passing (game state, determinism, performance, world systems)
- **E2E Tests:** Comprehensive coverage (intro FMV, seed variations, mobile gyroscope, pause/resume flows)
- **Performance Benchmarks:** All systems benchmarked with performance budgets enforced
- **Code Coverage:** >80% lines/functions/statements, >75% branches

**Documentation:**
- ✅ Complete test infrastructure documentation (`tests/README.md`)
- ✅ Fixture usage examples (RNG, audio, haptics)
- ✅ Factory usage patterns (cosmic domain objects)
- ✅ Parameterized testing guide
- ✅ E2E testing guide (Playwright codegen, visual regression, mobile testing)
- ✅ Performance benchmarking guide

**Key Technical Achievements:**
- Deterministic testing with global RNG fixture (auto-reset between tests)
- Web Audio API mocking for browser-free audio testing
- Capacitor Haptics API mocking for mobile haptic testing
- Cosmic factory pattern for consistent test data generation
- Parameterized tests for edge cases and seed variations
- Visual regression baselines for cosmic stage rendering
- Mobile device emulation (Pixel 5, iPhone 12) with gyroscope simulation

**Performance Budgets (All Passing):**
- GenesisConstants creation: < 10ms ✅
- CosmicProvenanceTimeline creation: < 100ms ✅
- Audio generation per stage: < 50ms ✅
- Haptic generation per stage: < 10ms ✅
- Full cosmic pipeline: < 150ms ✅

## External Dependencies

- **React:** JavaScript library for building user interfaces.
- **React Three Fiber:** React renderer for Three.js.
- **Three.js:** 3D graphics library.
- **Yuka:** AI engine for agent behaviors.
- **Vite:** Next-generation frontend tooling.
- **TypeScript:** Superset of JavaScript that adds static typing.
- **Zustand:** Small, fast, and scalable state-management solution.
- **Vitest:** Fast unit test framework powered by Vite.
- **Playwright:** Framework for Web Testing and Automation.
- **Material-UI:** React components for faster and easier web development.