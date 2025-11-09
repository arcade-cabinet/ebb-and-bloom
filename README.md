# 🌌 Ebb & Bloom - Universe Simulator

**Law-based multi-agent universe simulation**

---

## 🚀 Quick Start

```bash
cd packages/game
pnpm dev
```

**Open:** http://localhost:5173/

---

## 🎯 What This Is

**A real universe simulator** where Yuka agents make decisions based on peer-reviewed scientific laws.

**Not:**
- ❌ Procedural generator with pre-computed outcomes
- ❌ Game with physics as window dressing
- ❌ Static visualization

**But:**
- ✅ Multi-agent simulation at every scale
- ✅ Agents decide structure (no forcing)
- ✅ Laws constrain possibilities
- ✅ Emergence from bottom-up growth

---

## 🏗️ Architecture

### Agent Hierarchy
```
EntropyAgent (universe-level thermodynamics)
  ↓ sets T, ρ, expansion for
DensityAgents (local collapse decisions)
  ↓ form
StellarAgents (star lifecycle: fusion → supernova)
  ↓ create
PlanetaryAgents (atmosphere, climate, life emergence)
  ↓ spawn
CreatureAgents (individual survival, goals, pathfinding)
```

### Systems Integration
```
GenesisSynthesisEngine (timeline provider)
  ↓
UniverseTimelineScene (advances time, checks spawn)
  ↓
AgentSpawner (asks Legal Broker)
  ↓
Legal Broker (validates against laws)
  ↓
Agents Spawn (with goals from laws)
  ↓
EntityManager (updates all agents)
  ↓
Agents Make Decisions (goal-driven behavior)
  ↓
Visuals Sync (render agent states)
```

---

## 📚 Documentation

### For Users
- `VISION.md` - What we're building
- `BUILD_CROSS_PLATFORM.md` - How to build

### For Next Agent
**READ THIS FIRST:** `NEXT_AGENT_START_HERE.md` (this file!)  
**Then read:** `memory-bank/NEXT_AGENT_HANDOFF.md` (complete brief)

### Architecture Docs
- `docs/architecture/BOTTOM_UP_EMERGENCE_THE_KEY.md` - Core vision
- `docs/architecture/YUKA_DECIDES_EVERYTHING.md` - No forcing rule
- `docs/architecture/ENTROPY_AGENT_ARCHITECTURE.md` - Top-level governor
- `docs/architecture/THE_REAL_INTEGRATION.md` - System connections
- `docs/LAW_BASED_ARCHITECTURE.md` - Law system design
- `docs/LEGAL_BROKER_ARCHITECTURE.md` - Legal broker system

### Session Logs
- `docs/sessions/` - All Beast Mode session summaries

---

## 🧪 Testing

```bash
# Agent spawning
pnpm exec tsx src/cli/test-agent-spawning.ts

# Genesis synthesis  
pnpm exec tsx src/cli/test-genesis-synthesis.ts

# Browser (catches call stack!)
pnpm test:e2e simple-error-check --reporter=json
```

---

## 🎯 Current Status

**Working:**
- ✅ Agent infrastructure (Spawner, LOD, 5 agent classes)
- ✅ Legal Broker system (6 regulators, extended)
- ✅ Genesis timeline (11 epochs)
- ✅ Tests passing (no call stack errors)

**Needs Work:**
- ⏳ DensityAgent (molecular collapse)
- ⏳ GravityBehavior (clustering)
- ⏳ UniverseTimelineScene (wire everything)
- ⏳ universe.html (rebuild with timeline)

**Read:** `memory-bank/NEXT_AGENT_HANDOFF.md` for full implementation plan

---

## 🌌 The Vision

```
t=0: Black screen (Big Bang, zoomed at Planck scale)
  ↓ User clicks PLAY
t=1μs: Fog (particles coalesce)
  ↓ Camera zooms out
t=100Myr: Stars ignite (Yuka decided WHERE!)
  ↓ Camera zooms out more
t=1Gyr: Stars cluster (gravity steering)
  ↓ Spiral galaxy emerges
t=9.2Gyr: Planets form (some green = life!)
  ↓ User clicks green planet
Zoom in → Slow time → CreatureAgents spawn → GAME MODE
```

**Bottom-up. Law-driven. Agent-decided. Real emergence.**

---

**Next agent:** Execute the plan in `memory-bank/NEXT_AGENT_HANDOFF.md`

🚀 **BUILD THE REAL UNIVERSE** 🚀
