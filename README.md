# Ebb & Bloom

**A universe simulation with a game interface.**

---

## What This Is

Not a game with physics.  
**A physics simulation that happens to be playable.**

### The Universe Simulator
- Big Bang → Heat Death
- Deterministic (no seeds, no randomness)
- Pure peer-reviewed physics
- 20+ law files, 5,500+ lines, 800+ formulas
- **The entire cosmos, simulated**

### The Game
- Seeds as spacetime coordinates
- Find interesting slices of the universe
- Guide evolution on ONE planet
- Make decisions that matter
- **A telescope into the simulation**

---

## The Vision

**Universe Mode (VCR):**
- Watch cosmos evolve from Big Bang
- Fast-forward billions of years
- Observe galaxies, stars, planets form
- Click any planet → Enter game mode

**Game Mode (Evolution):**
- Control creatures on ONE planet
- Make evolutionary decisions
- Compete with AI lineages  
- Win/lose based on outcomes
- Zoom out → Return to universe

**Same simulation. Two interfaces.**

---

## The Architecture

### Everything is Elements
- Planets: Fe + Si + O → Rocky surface with calculated color
- Creatures: C + H + O + N → Organic tissue with derived properties
- Tools: Fe + C → Steel with real hardness/shininess
- **No texture files. Raycast rendering from periodic table.**

### Everything is Time
- No "generations" (Gen0, Gen1...)
- Just absolute time since Big Bang
- Events emerge when laws permit
- **Continuous simulation, not discrete steps**

### Everything is Formulas
- Kleiber's Law (metabolism ∝ mass^0.75)
- Schmidt-Nielsen (locomotion energetics)
- Dunbar's Number (social group size)
- Ricardo (comparative advantage)
- Solow (economic growth)
- **800+ peer-reviewed formulas from real science**

---

## Current State

✅ **Law Library Complete** (20 files, 800+ formulas)
✅ **All Laws Validated** (determinism perfect, distributions match theory)
✅ **CLI Validation Suite** (proves math works)
✅ **Universe Simulator** (framework complete)
✅ **Elemental Renderer** (no textures needed)
✅ **Timeline Architecture** (Big Bang anchored)

🔨 **In Progress:**
- Coordinate system (seed → slice lookup)
- Full physics integration
- Multiplayer implications
- Educational mode

---

## The Breakthrough

**Seeds don't GENERATE universes.**  
**Seeds LOCATE slices OF the universe.**

`"red-moon-dance"` → Coordinates [47583, 92847, 17384] at t=13.8Gyr  

**You're not creating a world.**  
**You're DISCOVERING coordinates in the simulation.**

**Other players can visit different coordinates.**  
**Same universe. Different slices.**

---

## Technical

- TypeScript + BabylonJS
- seedrandom (coordinate hashing)
- Capacitor (cross-platform)
- Peer-reviewed scientific formulas
- Zero texture dependencies

---

## Philosophy

**"If a formula exists in a peer-reviewed journal, we implement it exactly."**

No approximations.  
No game balance tweaks.  
Pure science.

The goal: **Yuka can simulate 5,000 years forward** and answer every question at every cycle with real formulas.

---

**Build:** `just build-android`  
**Validate:** `pnpm --filter @ebb/game exec tsx src/cli/validate-laws.ts`  
**Docs:** See `/docs` folder

---

*The math is the heart. Time is the framework. Elements are the rendering.*

**Welcome to the universe.**
