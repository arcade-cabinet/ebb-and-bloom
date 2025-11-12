# Ebb & Bloom - Replit Configuration

## Overview

Ebb & Bloom is a competitive evolution game where players guide a single species from protozoa to transcendence, competing against YUKA-controlled autonomous species for resources. The core gameplay involves indirect environmental influence, constrained by an energy budget and 57 scientific laws that apply equally to all species. The game starts in a primordial world, aiming for the player's species to be the first to transcend, with their species' decisions being autonomous.

The technical foundation relies on law-based generation, ensuring deterministic outcomes for any given seed. The game supports multi-scale simulation from quantum to cosmic levels and adapts Daggerfall Unity's spawner logic, but with law-computed data instead of hardcoded content.

## Documentation Structure

**CRITICAL:** This project uses a three-tier documentation system:

1. **Memory Bank (`memory-bank/`)** - AI agent context (ephemeral, session-to-session)
2. **READMEs (`README.md`)** - Standalone human documentation (permanent)
3. **Documentation (`docs/`)** - Comprehensive technical guides (permanent)

**For AI agents:** Read `.clinerules` for complete memory bank structure and workflows.

**Key Rule:** NEVER reference memory-bank files in READMEs or permanent docs. Memory Bank is internal to AI operations only.

---

## Recent Changes

**November 12, 2024 - Unified Rendering Architecture + Iconic FMV Intro:**
- **Three Complementary Rendering Systems:**
  - **SDFRenderer** - Raymarched complex shapes (21 primitives, material blending, coordinate targeting)
  - **MarchingCubesRenderer** - Smooth mesh extraction from SDF fields via @react-three/drei
  - **InstancedRenderer** - High-performance particles with MaterialRegistry integration
- **Molecular Physics:** RapierBonds component for stable physics joints (fixed/spherical/revolute/prismatic)
- **ChemicalBlobBuilder:** Generate molecular blobs from formulas (H2, O2, H2O, CO2, CH4)
- **FMV Intro:** Hybrid rendering - instanced meshes for YUKA swarms (550 particles) + SDF heroes (≤6 primitives)
- **Mobile-First:** Gyroscope camera, haptic feedback, loading screen, FPS counter, spatial grid optimization
- **GameState Integration:** All calculations pre-computed from seed, visualization is pure
- **Modular:** All files <200 LOC, clean separation of concerns
- **Proven Systems:** YUKA steering, SDF, MaterialRegistry, audio sonification, haptics
- **Known Limitation:** Joint limits not yet supported (Rapier API limitation, documented in code)
- Ready for mobile testing on OnePlus foldable at 60fps target

---

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

The project is structured into `engine/`, `agents/`, `generation/`, and `game/` for clear separation of concerns.

**Core Principles:**
- **Bottom-up Emergence:** Outcomes arise naturally from autonomous agents following scientific laws.
- **Governor System:** 17 Yuka-native governors (Physics, Biology, Ecology, Social) manage agent behaviors using Yuka primitives.
- **Law System:** 57 scientific formulas dictate all generation and simulation processes.

**Architecture Bridge (DFU Adaptation):**
The system reuses Daggerfall Unity's spawner code (ChunkManager, EntityManager) but feeds it dynamically computed data based on scientific laws, rather than hardcoded values.

**World Generation:**
- **ChunkManager:** Implements a 7x7 streaming grid.
- **SimplexNoise:** Used for noise generation.
- **BiomeSystem:** Generates 11 biome types based on the Whittaker diagram.
- **Procedural Spawners:** Vegetation, settlements, NPCs, and creatures are spawned procedurally according to physical and biological laws.

**Synthesis Systems:**
Visuals and structures are created through chemical synthesis, eliminating the need for prefabs:
- **MolecularSynthesis:** Determines geometry from molecular composition.
- **PigmentationSynthesis:** Generates coloring based on diet and environment.
- **StructureSynthesis:** Creates tools and structures from materials.
- **BuildingArchitect:** Designs architecture based on governance.

**Technology Stack:**
- **Runtime:** Node.js 24.4.0
- **Frontend:** React 19.2, React Three Fiber
- **3D Engine:** Three.js 0.169
- **AI Framework:** Yuka
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.7 (targeting ES2023)
- **State Management:** Zustand
- **Testing:** Vitest (happy-dom) + Playwright
- **Mobile:** Capacitor 7.x (Android/iOS)

**Project Structure Overview:**
- `engine/`: Core engine systems (ECS, law systems, procedural synthesis, genesis).
- `agents/`: Governors, law tables, GovernorActionPort interface.
- `generation/`: DFU-compatible world spawners.
- `game/`: React UI, scenes, GameState, player controllers.
- `docs/`: Critical design documentation (AI hierarchy, provenance, intent API).

## External Dependencies

- **React:** UI library.
- **React Three Fiber:** Three.js integration for React.
- **Three.js:** 3D graphics library.
- **Yuka:** AI engine.
- **Vite:** Build tool.
- **TypeScript:** Programming language.
- **Zustand:** State management.
- **Vitest:** Unit testing framework.
- **Playwright:** E2E testing and automation.
- **Material-UI:** React component library.