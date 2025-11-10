# 🚀 START HERE - NEXT AGENT

**Date:** November 9, 2025  
**Your mission:** Complete Yuka integration (full autonomous execution)

---

## 📖 READ THESE IN ORDER

1. **`memory-bank/NEXT_AGENT_HANDOFF.md`** ← MAIN BRIEF (read this!)
2. **`BOTTOM_UP_EMERGENCE_THE_KEY.md`** ← Core vision
3. **`YUKA_DECIDES_EVERYTHING.md`** ← No forcing rule
4. **`ENTROPY_AGENT_ARCHITECTURE.md`** ← Top-level design

---

## ⚡ QUICK SUMMARY

**What's ready:**
- ✅ Agent classes (Entropy, Stellar, Planetary, Creature)
- ✅ Legal Broker system (spawn validation, goal assignment)
- ✅ AgentSpawner (mediates broker → agents)
- ✅ Test infrastructure (JSON reporter, call stack detection)

**What's wrong:**
- ❌ Current universe.html = static grid (wrong!)
- ❌ Not using any of the systems we built
- ❌ Forcing positions instead of Yuka deciding

**What to build:**
1. DensityAgent (molecular collapse)
2. GravityBehavior (clustering)
3. Wire UniverseTimelineScene (bottom-up emergence)
4. Rebuild universe.html (timeline, not grid)

---

## 🎯 SUCCESS = THIS WORKING

```bash
pnpm dev
# Open http://localhost:5173/universe.html

# See:
t=0: Black screen (Big Bang)
User clicks PLAY
t=1μs: Fog appears
t=100Myr: Stars ignite WHERE Yuka decided
Camera zooms out automatically
t=1Gyr: Stars cluster into galaxy (gravity!)
t=9.2Gyr: Planets form around some stars
t=13.8Gyr: Cosmic web visible (EMERGED!)

# Test:
pnpm test:e2e simple-error-check --reporter=json
# Result: "passed: no error"
```

---

## 🔥 BEAST MODE

**When ready:** Just execute the plan in NEXT_AGENT_HANDOFF.md

**No questions. Build it. Test it. Ship it.**

🌌 **GO** 🌌


