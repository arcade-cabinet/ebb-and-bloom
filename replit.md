# Ebb & Bloom - Replit Configuration

## Overview

Ebb & Bloom is a **law-based universe simulation engine** that generates deterministic, scientifically-grounded procedural worlds from three-word seeds. It operates by implementing 57 mathematical laws from physics, biology, ecology, and social sciences, rather than relying on AI or hardcoded data. The project aims to create multi-scale simulations from quantum to cosmic levels, driven by 17 Yuka-native autonomous governors making all decisions, inspired by the architecture of Daggerfall.

Key capabilities include:
- **Law-Based Generation:** Everything emerges from scientific laws.
- **Deterministic:** Same seed always produces the same universe.
- **Multi-Scale Simulation:** From Planck scale to universe-wide.
- **Governor-Driven:** Autonomous agents make all decisions.
- **Daggerfall-Inspired Architecture:** Adapts a proven 1996 architecture for modern web.
- **Complete World Generation:** 7x7 chunk streaming with 11 biome types.
- **Procedural Synthesis:** Chemistry-driven visuals, no prefabs.
- **Full Timeline Simulation:** From Big Bang to Heat Death.

## User Preferences

- Follow DFU (Daggerfall Unity) patterns for architecture
- Use Yuka AI framework for agent behaviors
- Maintain deterministic generation (same seed = same world)
- Focus on bottom-up emergence over hardcoded systems
- Prioritize engine architecture over game features
- No prefabs - everything generated from laws and chemistry

## System Architecture

The project is structured into three main areas: `engine/`, `agents/`, `generation/`, and `game/`. This organization ensures a clear separation of concerns, aligning with Daggerfall Unity (DFU) patterns for robustness and scalability.

**Core Principles:**
- **Bottom-up Emergence:** Everything arises from autonomous agents following scientific laws, with outcomes emerging naturally rather than being forced or hardcoded.
- **Governor System:** 17 Yuka-native governors (Physics, Biology, Ecology, Social) drive all agent behaviors using Yuka primitives like SteeringBehaviors, Goals+Evaluators, StateMachines, and FuzzyLogic.
- **Law System:** 57 scientific formulas (Physics, Stellar, Biology, Ecology, Social, Taxonomy) dictate all generation and simulation processes.

**Architecture Bridge (DFU Adaptation):**
The architecture leverages proven DFU spawner logic but replaces its hardcoded data sources (e.g., `MAPS.BSA`) with data intelligently calculated by governors based on scientific laws. This means DFU spawners (e.g., BuildingSpawner, SettlementPlacer, CreatureSpawner) receive dynamic, law-governed data instead of static lookups.

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
- **Frontend:** React 18.3, React Three Fiber
- **3D Engine:** Three.js 0.169
- **AI Framework:** Yuka
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.7
- **State Management:** Zustand
- **Testing:** Vitest + Playwright

**Project Structure Overview:**
- `engine/`: Pure engine systems (WorldManager, TerrainSystem, procedural synthesis).
- `agents/`: Governors, law tables, and Yuka agent classes.
- `generation/`: DFU-compatible world spawners (ChunkManager, BiomeSystem).
- `game/`: React UI and game-specific components (HUD, Game.tsx).

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