# Active Context - SDF Rendering Foundation

**Date:** January 2025  
**Status:** 🔴 **CRITICAL FOUNDATION PHASE** - SDF Rendering Foundation must be completed  
**Focus:** Build complete, robust, tested SDF raymarching API before any domain-specific rendering

---

## Current Session Summary

### Critical Assessment Complete

**SDF Rendering Foundation Assessment:**
- ✅ Complete specification created (`memory-bank/SDF_RENDERING_FOUNDATION.md`)
- ✅ Phases rebalanced (Phase 0 = Foundation, blocks all rendering work)
- ✅ Current state: ~15% complete (basic primitives exist, missing critical API)
- ✅ Required state: 100% complete with full API, tests, documentation
- ✅ Estimated effort: 4 weeks (160 hours)

**Key Discovery:**
The SDF rendering layer is the **foundational API** for all rendering in the project (chemistry, biology, physics, ecology). It must be built completely before any domain-specific rendering can proceed.

### What We Just Discovered

**Replit Analysis Results:**
- ✅ **Core systems work**: Intent API, ECS integration, Genesis constants
- ✅ **Major architectural insights**: Fair competition philosophy, cosmic provenance  
- ✅ **Performance fixes**: 12GB memory leak eliminated
- ❌ **False completion claims**: "Deleted orphaned files" but they're still there
- ❌ **Broken imports**: AtomicSystems imports non-existent AtomicWorld
- ❌ **Incomplete multi-scale**: Started atomic/unified architecture but never finished

**Repository Restoration:**
- ✅ Reverted to commit c11de3e (good state before React Native disaster)
- ✅ Preserved pino logging system (only useful addition from migration attempts)
- ✅ Removed Expo/React Native migration artifacts
- ✅ Back to Vite + Capacitor (proper web-first approach)

---

## Replit's Actual Accomplishments

### 🎯 **Phase 1: Game State Unification** (20c95ad)
- ✅ Unified GameState.ts with proper initialization flow
- ✅ Scene management working (Menu → Intro → Gameplay)
- ✅ Seed-driven world creation

### 🎯 **Phase 2: ECS Integration** (e735f06)  
- ✅ Miniplex ECS integrated into GameState
- ✅ CoreComponents with Physics/Chemistry/Biology
- ✅ GameplayScene spawning 3x3 terrain + entities
- ✅ 11 law systems running every tick

### 🎯 **Phase 3: Intent API** (74d997b)
- ✅ GovernorActionExecutor (175 lines, complete implementation)
- ✅ PlayerGovernorController with energy budgets
- ✅ 7 governor actions (smite, nurture, shape, pressure, etc.)
- ✅ Conservation law integration

### 🎯 **Phase 4: Revolutionary Documentation** (85341e5)
- ✅ AI_HIERARCHY.md (189 lines) - Creature AI vs Rival AI distinction
- ✅ COSMIC_PROVENANCE.md (319 lines) - Material lineage from Big Bang
- ✅ INTENT_API_PHILOSOPHY.md (374 lines) - Fair competition philosophy

### 🎯 **Phase 5: Performance Optimization** (7c79fe5)
- ✅ Fixed React infinite render loop (subscription pattern)
- ✅ Memory leak eliminated (was consuming 12GB RAM)
- ✅ SceneManager event system added

---

## Current Architecture State

### Stack (Bottom to Top)
```
VITE + CAPACITOR (Web-first, mobile-capable)
    ↓
REACT + REACT THREE FIBER (3D rendering)
    ↓
ZUSTAND GAME STATE (unified state management)
    ↓
INTENT API (player/AI equality through laws)
    ↓
MINIPLEX ECS WORLD (entity-component-system)
    ↓
11 LAW SYSTEMS (physics, biology, ecology, etc.)
    ↓
COSMIC GENESIS (deterministic Big Bang → planet)
```

### What's Working Right Now
- ✅ Menu screen (seed selection)
- ✅ Intro FMV (cosmic expansion visualization)
- ✅ Gameplay screen (3D world with terrain + entities)
- ✅ Intent API (player can submit governor actions)
- ✅ ECS with conservation laws
- ✅ Structured logging (pino throughout)

### What's Broken/Incomplete
- ❌ **FMV system riddled with browser errors** (CRITICAL - genesis depends on this)
- ❌ **FMV visuals broken** (shapes appearing as squares instead of cosmic objects)
- ❌ Multi-scale architecture (AtomicWorld, UnifiedWorld missing)
- ❌ Planetary accretion system incomplete (material locations)
- ❌ agents/ and generation/ still outside engine/ecs/ (need consolidation)
- ❌ Some governors have TypeScript errors

---

## Major Architectural Insights (From Replit Docs)

### 1. Fair Competition Philosophy
**Key Insight:** Player and AI must use IDENTICAL code paths
- Both submit GovernorIntent objects
- Laws determine outcomes, not intent source
- No AI cheating possible (same energy costs, same constraints)

### 2. Dual AI Hierarchy  
**Critical Distinction:**
- **Creature AI**: Individual organism behavior (hunger, safety, tool use) - YUKA primitives
- **Rival AI**: Strategic governor actions (territory, resources) - Intent API

### 3. Cosmic Provenance Chain
**Revolutionary Concept:** Every material traces back to Big Bang
- Same seed → identical universal coordinates → identical galaxy → identical planet
- Deterministic material locations (copper here, tin there, diamonds deep)
- Technology ceiling determined by galaxy age (young = stone age, old = atomic)

---

## CORRECTED PHASE PLAN (Based on Replit Chat Analysis)

### ✅ **COMPLETED PHASES:**
- **Phase 1:** GameState Unification (unified world initialization)
- **Phase 2:** ECS Core Integration (11 law systems, entity spawning)  
- **Phase 3:** Intent API (fair competition through identical code paths)

### ❌ **INCOMPLETE PHASES:**

#### **Phase 4: ECS Consolidation** (NEXT PRIORITY)
**Goal:** "Move agents/ and generation/ INTO engine/ecs/ and FINISH the plan"
- Move **agents/governors/** → **engine/ecs/governors/**
- Move **agents/tables/** → **engine/ecs/constants/**  
- Move **generation/spawners/** → **engine/ecs/systems/**
- Complete the bridge: Governors provide data to DFU spawning algorithms
- Integrate WorldManager into GameState (eliminate singleton)

#### **Phase 5: Creature AI** (MISSING PHASE)
**Your Vision:** "Every spawned sign of life HAS to have attached creature AI"
- SUB AI for EVERY creature (including player's)
- Creature questions: environment, cognition, tool competency
- Goal-driven behavior with ranked interactions
- State persistence: save on despawn, fast-forward on return
- "While you were away..." HUD messages

#### **Phase 6: Rival AI** (STRATEGIC COMPETITION)
- AI opponents at player level using Intent API
- Territory management, resource evaluation
- Strategic decision-making with same energy constraints

### **IMMEDIATE TASKS (REVISED):**
1. **PERIODIC TABLE DEMO** - Validate visual system before any other work
   - Full 118-element 3D table with realistic materials
   - Drag-and-drop bonding using chemical laws  
   - Stress test macros (explosions, complex molecules, phase changes)
   - Memory optimization testing (reaction cycles, cleanup)
2. **PLAYWRIGHT E2E SETUP** - Proper testing for chemical demo
3. **Complete Phase 4** - Only after demo proves visual foundation works

---

## Key Files (Critical)

**Entry Points:**
- `game/main.tsx` - Vite entry point
- `game/App.tsx` - React router setup

**Core Systems:**
- `game/state/GameState.ts` - Unified Zustand store
- `engine/ecs/World.ts` - Miniplex ECS world
- `engine/ecs/core/LawOrchestrator.ts` - 11 law systems
- `engine/ecs/core/GovernorActionExecutor.ts` - Intent API implementation

**Genesis:**
- `engine/genesis/GenesisConstants.ts` - Cosmic constants
- `engine/genesis/CosmicProvenanceTimeline.ts` - Big Bang timeline

**Documentation:**
- `docs/AI_HIERARCHY.md` - ⚠️ **CRITICAL** - Read before any AI work
- `docs/COSMIC_PROVENANCE.md` - Material lineage system
- `docs/INTENT_API_PHILOSOPHY.md` - Fair competition design

---

## Commands

```bash
# Development  
pnpm dev                # Vite dev server (port 5173)
pnpm type-check        # TypeScript verification
pnpm test              # Run test suite

# Quality
pnpm quality           # Type check + lint + format + test

# Mobile (Capacitor)
pnpm build:android     # Build and sync to Android Studio
pnpm build:ios         # Build and sync to Xcode
```

---

## Next Agent Instructions

1. **Read the critical docs first**: AI_HIERARCHY.md, COSMIC_PROVENANCE.md, INTENT_API_PHILOSOPHY.md
2. **Fix the broken imports** (create missing AtomicWorld, UnifiedWorld, Evolvable)
3. **Test the core functionality** works with `pnpm dev`
4. **Don't repeat Replit's mistake** - finish one system before starting another

**Foundation is SOLID** - Intent API and ECS work. Just need to complete the unfinished multi-scale architecture.

---

**Last Updated:** November 11, 2025, 21:00 UTC  
**Session:** Post-Replit cleanup and analysis