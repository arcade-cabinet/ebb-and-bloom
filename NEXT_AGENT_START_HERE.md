# 🚀 NEXT AGENT - START HERE

**Date:** November 9, 2025  
**Status:** Ready for Beast Mode execution  
**Read time:** 5 minutes

---

## 📖 COMPREHENSIVE HANDOFF

### What Was Built (This Session)

**Core Systems:**
1. **AgentSpawner** - Legal Broker validates, spawns Yuka agents
2. **AgentLODSystem** - Spawn/despawn based on zoom (like visual LOD)
3. **Multi-Scale Agents** - Entropy, Stellar, Planetary, Creature (all with goals)
4. **Legal Broker Extensions** - Spawn validation, goal assignment, analytical advancement

**All tested and working** ✅

---

### What's Wrong (Current State)

**universe.html shows:** Static 10×10×10 cube at t=13.8 Gyr

**Problems:**
- Pre-computed grid (not emergence)
- No Yuka agents running
- Not using Genesis timeline
- Forcing positions (Yuka should decide!)

---

### The Key Insights (READ THESE!)

#### 1. Bottom-Up Emergence
**NOT:** Universe → Galaxy → Star → Planet → Molecules (top-down)  
**YES:** Molecules → Stars → Galaxies → Cosmic Web (bottom-up)

**Start at t=0, Planck scale (zoomed IN)**  
**Camera zooms OUT as structures form**  
**Cosmic web is the RESULT, not the input**

#### 2. Yuka Decides Everything
**NOT:** `for (i=0; i<100; i++) spawnStar(random)` (forcing)  
**YES:** Density agents ask "Can I collapse?" → Some do, some don't (physics decides)

**Agents determine:**
- WHERE stars form (density peaks)
- WHEN stars form (temperature threshold)
- HOW MANY form (from collapse conditions)

#### 3. EntropyAgent Governs
**One top-level agent (lightweight, ~10 ops/frame)**

**Sets:** Temperature, density, expansion rate  
**Acts:** Only on cosmic events (Big Crunch, Accelerated Expansion)  
**Memory:** ~100 bytes  

**All other agents read these conditions and make local decisions**

#### 4. Timeline Not Snapshot
**NOT:** Show universe at t=13.8 Gyr  
**YES:** Show universe FORMING from t=0 → t=13.8 Gyr

**User experience:**
- Opens app → t=0 (black screen)
- Clicks PLAY → Time advances
- Watches structures emerge
- Camera zooms out automatically
- Pauses at interesting moments

---

## 🎯 YOUR MISSION

### Build These (In Order):

**1. DensityAgent** (`src/yuka-integration/agents/DensityAgent.ts`)
```typescript
class DensityAgent extends Vehicle {
  density: number;
  
  update(delta) {
    // Ask Legal Broker: "Can I collapse into star?"
    const jeansMass = await LEGAL_BROKER.ask('calculate-jeans-mass');
    
    if (this.density > jeansMass) {
      this.formStar(); // Spawn StellarAgent HERE
      this.active = false; // Remove self
    } else {
      this.drift(); // Apply Brownian motion
    }
  }
}
```

**2. GravityBehavior** (`src/yuka-integration/behaviors/GravityBehavior.ts`)
```typescript
class GravityBehavior extends SteeringBehavior {
  calculate(vehicle, force) {
    for (const neighbor of vehicle.getNeighbors()) {
      const F = LEGAL_BROKER.ask('calculate-gravity-force', {
        m1: vehicle.mass,
        m2: neighbor.mass,
        r: distance,
      });
      force.add(F); // Agents cluster naturally!
    }
  }
}
```

**3. Complete UniverseTimelineScene** (`src/scenes/UniverseTimelineScene.ts`)
- Wire EntropyAgent → spawns at t=0
- Wire Genesis timeline → provides events
- Wire AgentSpawner → spawns density/stellar/planetary agents
- Camera zoom logic → follows scale
- Rendering → show what EXISTS at current t

**4. Rebuild universe.html**
- Use UniverseTimelineScene
- VCR controls (play/pause/speed)
- Start at t=0
- Show emergence

---

## 🧪 TESTING

**After each change:**
```bash
pnpm test:e2e simple-error-check --reporter=json
```

**Must see:** `"status": "passed"`

**If see:** `"Maximum call stack"` → Add async/await + yielding

---

## 📁 FILES TO USE

**Agent Infrastructure** (src/yuka-integration/):
- AgentSpawner.ts ✅
- AgentLODSystem.ts ✅
- agents/EntropyAgent.ts ✅
- agents/StellarAgent.ts ✅
- agents/PlanetaryAgent.ts ✅
- agents/CreatureAgent.ts ✅

**Legal System** (src/laws/core/):
- LegalBroker.ts ✅
- regulators/*.ts ✅ (6 regulators)

**Timeline** (src/synthesis/):
- GenesisSynthesisEngine.ts ✅

**Tests** (test-e2e/):
- simple-error-check.spec.ts ✅ (USE THIS!)

---

## 🗑️ FILES TO DELETE

**Root directory clutter (moving to archives):**
- All BEAST_MODE_*.md files (session logs)
- All *_COMPLETE.md files (status docs)
- Duplicate handoffs

**Wrong paradigm:**
- src/simulation/LazyUniverseMap.ts (grid approach)
- src/simulation/UniverseActivityMap.ts (pre-computed)
- Current universe.html (static cube)

---

## ✅ SUCCESS CRITERIA

**You're done when:**

```bash
# 1. Test passes
pnpm test:e2e simple-error-check --reporter=json
# Shows: "passed: no error"

# 2. Browser shows emergence
pnpm dev → http://localhost:5173/universe.html
# Shows:
# - t=0: Black (Big Bang)
# - PLAY: Time advances
# - t=100Myr: Stars appear WHERE Yuka decided
# - t=1Gyr: Stars cluster via gravity (spiral!)
# - t=9.2Gyr: Planets form
# - t=13.8Gyr: Cosmic web visible (EMERGED!)

# 3. No forcing
# Verify: Different seeds = different star positions
# Verify: Same seed = same star positions
# Verify: Agent decisions, not pre-placement

# 4. All systems integrated
# Genesis provides timeline ✅
# Yuka agents make decisions ✅
# Legal Broker validates ✅
# Visuals show agents ✅
```

---

## 🔥 BEAST MODE

**Just execute. Don't ask. Build it all. Test it. Ship it.**

**Time estimate:** 4-6 hours

---

🌌 **BUILD THE REAL UNIVERSE** 🌌


