# Active Context - ENGINE REFACTOR IN PROGRESS
**Date:** November 10, 2025  
**Session:** Engine Architecture Transformation  
**Previous:** DFU Foundation Complete (120 FPS game working)

---

## 🎯 CURRENT MISSION: Transform into Proper Engine

**User Direction:**
> "Stop focusing on making the game playable, because we haven't REALLY defined the game yet, and focus on the engine."

**What We're Doing:**
1. ✅ Consolidate all status docs into memory-bank (DONE)
2. ⏳ Git checkpoint (current working state)
3. ⏳ Add React Three Fiber + Drei
4. ⏳ Flatten monorepo structure
5. ⏳ Reorganize into engine/ architecture
6. ⏳ Build comprehensive engine documentation

---

## What Just Completed (Previous Session)

### BEAST MODE: DFU Foundation Assessment
- ✅ Fixed white background (`playerX undefined`)
- ✅ Implemented DFU steepness + settlement clearance
- ✅ Game working: 120 FPS, 286 trees, 58 NPCs, 100 creatures
- ✅ Created 2,235 lines of DFU analysis documentation

**All docs moved to:** `memory-bank/sessions/`

---

## Engine Vision

### What IS the Engine:
- **Laws** (57 files) - Physics, biology, ecology, social, etc.
- **Agents** - Yuka-based autonomous entities
- **Spawners** - World generation (chunks, vegetation, settlements, NPCs, creatures)
- **Simulation** - Timeline engine, universe state
- **RNG** - Deterministic randomness from seeds
- **Constants** - Periodic table, physics constants, linguistic roots

### What is NOT the Engine (Game Layer):
- Player controls (FirstPersonControls, VirtualJoystick)
- UI (HUD, Minimap, Dialogue)
- Game-specific systems (Inventory, Dialogue)
- HTML demos

---

## Target Structure

```
ebb-and-bloom/
├── engine/                    # NEW - Core simulation engine
│   ├── laws/                  # 57 law files
│   ├── agents/                # Agent system
│   ├── spawners/              # World generation
│   ├── simulation/            # Timeline, state
│   ├── utils/                 # RNG, seed management
│   ├── tables/                # Constants
│   └── index.ts               # Engine API
├── src/                       # Game/demo layer
│   ├── demo/                  # Demo scenes
│   │   ├── controls/          # Player controls
│   │   ├── ui/                # HUD, minimap
│   │   └── game.html          # Demo game
│   └── ...
├── docs/                      # Architecture docs
├── memory-bank/               # Status & progress
│   ├── sessions/              # All BEAST_MODE_* docs
│   ├── architecture/          # DFU analysis
│   └── ...
├── package.json               # Flattened (from packages/game)
└── README.md                  # Engine-focused
```

---

## Technology Changes

**Adding:**
- React Three Fiber (R3F)
- Drei (R3F helpers)

**Removing:**
- BabylonJS (if any remains)
- pnpm workspace (monorepo)
- Direct THREE.js in game code (use R3F instead)

**Keeping:**
- THREE.js (via R3F)
- Yuka
- Vite
- TypeScript
- All laws/spawners/agents

---

## Status: READY FOR REFACTOR

**Next Steps:**
1. Git checkpoint
2. Add R3F + Drei
3. Flatten structure
4. Reorganize into engine/
5. Document engine API

---

**Previous Context:** `memory-bank/current-status.md`  
**All Sessions:** `memory-bank/sessions/`  
**Architecture:** `memory-bank/architecture/`
