# NEXT AGENT INSTRUCTIONS - HOLISTIC BEAST MODE

**Date:** Nov 9, 2025  
**Status:** Core systems working, integration needs holistic investigation

---

## BEAST MODE STANDARDS

**BEAST MODE IS NOT SESSIONS - IT'S CONTINUOUS WORK**

When working:
1. **Test at every scale** - Screenshots, console logs, algorithmic tests
2. **Think holistically** - Whole codebase, how agents interact, what's the physics
3. **Checkpoint commits** - Replace "pauses" - commit after each logical fix
4. **Memory bank updates** - Replace "status updates" - just update activeContext.md
5. **No "complete" docs** - Keep working, don't declare victory
6. **Follow physics** - Don't force values, understand WHY things work/don't work
7. **Agent perspective** - How would agents OPTIMALLY solve this? Not YOU forcing solutions
8. **Scale-aware** - Universe ≠ Galaxy ≠ System ≠ Planet (different physics each!)

**CRITICAL:** At universe scale you see GALAXIES (markers), not stars. At system scale you see ROTATION. Each scale = different physics!

---

## WHAT'S VERIFIED WORKING (Tests Passing)

### Algorithmic Test (Rendering-Free):
```bash
pnpm exec tsx src/cli/test-yuka-bang-to-crunch.ts
✅ ALL CHECKS PASSED
- DensityAgents spawn (10)
- Jeans instability checks work
- Stars form from collapse (8 stars)
- GravityBehavior enabled
```

### Browser E2E:
```bash
pnpm test:e2e simple-error-check
✅ No errors detected
✅ 1 passed
```

### Core Systems:
- ✅ DensityAgent async evaluators (pre-fetch + cache pattern)
- ✅ PhysicsRegulator Jeans instability calculation
- ✅ AgentSpawner unified EntityManager
- ✅ Legal Broker handling 60K queries/sec
- ✅ Scene starts paused at t=0
- ✅ Scene starts BLACK (void before Big Bang)
- ✅ HUD is agent-driven (no hardcoded overlays)

---

## WHAT NEEDS INVESTIGATION (Not Verified)

### Issue 1: Stars Not Forming in Browser (100 Myr, 0 stars)
**Observed:**
- Age: 100.63 Myr
- DensityAgents: 1000
- StellarAgents: 0
- No stars visible

**Questions to investigate:**
- Are DensityAgents actually checking Jeans instability? (Console logs?)
- What are cloud masses/densities in browser vs test?
- Is timeScale too fast? (Age 100 Myr but only 15 seconds elapsed)
- Are clouds using universe temp (too hot) vs cloud temp (10-20 K)?

**How to investigate:**
```javascript
// In browser console:
const agents = window.universe.spawner.getManager().entities;
const density = agents.filter(e => e.constructor.name === 'DensityAgent');
density[0].mass  // Check if sufficient
density[0].temperature  // Should be ~10-20 K, not 1e30 K
density[0].jeansCheckCache  // Should be true if can collapse
```

**Fix approach:**
- Don't force values
- Understand WHY physics says no collapse
- Maybe need higher initial masses, colder temps, or longer time

### Issue 2: Scale/Zoom Architecture (CRITICAL - From User Discussion)

**THE KEY INSIGHT:**

Each zoom level shows DIFFERENT physics:

**COSMIC SCALE (camera radius > 1000):**
- **View:** Theoretical map of entire universe
- **Render:** Galaxy formation markers (NOT individual stars!)
- **Data:** Tracers showing where structure formed
- **Physics:** Large-scale structure, cosmic web
- **Agents:** EntropyAgent only (lightweight)
- **Visual:** Blue glowing spheres at galaxy formation sites

**GALACTIC SCALE (camera radius 500-1000):**
- **View:** Individual galaxy
- **Render:** Star cluster tracers (NOT individual stars!)
- **Data:** Regions of star formation
- **Physics:** Spiral arms, rotation, density waves
- **Agents:** GalaxyAgent (if exists)
- **Visual:** Spiral pattern traced, not individual dots

**STELLAR SCALE (camera radius 100-500):**
- **View:** Multiple star systems
- **Render:** Individual stars as points/small spheres
- **Data:** Stellar agents
- **Physics:** Stars drifting, clustering via gravity
- **Agents:** StellarAgents visible
- **Visual:** Glowing spheres, moving based on GravityBehavior

**SYSTEM SCALE (camera radius 20-100):**
- **View:** Single star system
- **Render:** Star rotation, planetary orbits
- **Data:** 1 StellarAgent + PlanetaryAgents
- **Physics:** Orbital mechanics, Kepler's laws
- **Agents:** StellarAgent + PlanetaryAgents
- **Visual:** Central star, planets orbiting in ellipses

**PLANET SCALE (camera radius < 20):**
- **View:** Planet surface
- **Render:** Terrain, creatures, structures
- **Data:** PlanetaryAgent + CreatureAgents
- **Physics:** Weather, ecology, behavior
- **Agents:** All types
- **Visual:** 3D surface with life

**WRONG (What we're doing):**
- ❌ Rendering 1000 individual stars at universe scale
- ❌ Showing particles when we should show galaxies
- ❌ Same visualization at all zoom levels
- ❌ No rotation/orbital mechanics at system scale

**RIGHT (What we need):**
- ✅ Universe scale = galaxy tracers only
- ✅ Stellar scale = stars as simple spheres
- ✅ System scale = orbital paths, rotation
- ✅ Planet scale = surface detail

**How to fix:**
1. Check camera.radius every frame
2. Render ONLY what's appropriate for that zoom
3. Hide everything else (LOD culling)
4. When zoom changes, transition visuals
5. Don't spawn 1000 stars then hide them - spawn ONLY what's visible

### Issue 3: Camera Auto-Zoom Logic
**Current:** Camera zooms based on age thresholds
**Should be:** Camera zooms based on STRUCTURE formation

**Questions:**
- When do first galaxies form? (Camera should zoom to show them)
- When do stars cluster? (Camera should zoom to stellar scale)
- Should user control zoom or is it automatic?

### Issue 4: TimeScale vs ScaleFactor Sync
**Current:** Fixed with `scaledDelta = deltaTime * timeScale`
**Concern:** `Math.pow(1.1, 1e15)` = Infinity → NaN

**Questions:**
- Is exponential growth correct physics?
- Should we cap timeScale during fast-forward?
- Or use different math for huge time jumps?

---

## FILES MODIFIED (This Session)

**Core Agents:**
- `src/yuka-integration/agents/DensityAgent.ts` - Async evaluator fix
- `src/yuka-integration/agents/EntropyAgent.ts` - TimeScale sync, physics params

**Regulators:**
- `src/laws/core/regulators/PhysicsRegulator.ts` - Jeans instability

**Scene:**
- `src/scenes/CompleteBottomUpScene.ts` - Density field, star rendering, LOD, clean UI

**Tests:**
- `src/cli/test-yuka-bang-to-crunch.ts` - Updated for density-based architecture

**Memory Bank:**
- `memory-bank/activeContext.md` - Current state
- `memory-bank/progress.md` - Recent fixes

---

## INVESTIGATION WORKFLOW

For each issue:

1. **Reproduce:** Screenshot + console logs + variable inspection
2. **Understand:** What's the physics? What should agents do?
3. **Hypothesize:** Why isn't it working? Don't assume!
4. **Test:** Algorithmic test first (no rendering), then browser
5. **Fix:** One logical change at a time
6. **Commit:** `git commit` after each fix
7. **Verify:** Run tests, take screenshots, check console
8. **Continue:** Next issue

**NOT:**
- ❌ Assume tests pass without running them
- ❌ Fix symptoms without understanding root cause
- ❌ Force values (hardcode temps, masses, etc.)
- ❌ Create "complete" docs mid-work
- ❌ Treat each scale as separate problem

---

## CURRENT GIT STATE

```
14 commits ahead of origin/main
Last commit: 3c0ce56 chore: memory bank update
Clean working tree
```

**Commits this session:**
- DensityAgent async fix
- Jeans instability
- Density field spawning
- Clean UI (no hardcoded)
- Scene paused start
- Star rendering
- Galaxy markers
- LOD integration
- TimeScale fixes
- Multiple checkpoints

---

## NEXT STEPS (Holistic Investigation)

1. **Debug why stars not forming in browser**
   - Console.log density agent state every frame
   - Compare browser vs test conditions
   - Understand the physics gap

2. **Verify each zoom level renders correctly**
   - COSMIC: Galaxy markers only
   - GALACTIC: Star cluster tracers
   - STELLAR: Individual stars
   - Take screenshots at each level

3. **Ensure camera auto-zoom follows structure**
   - Zoom out as galaxies form
   - Not based on age, based on what EXISTS

4. **Test full lifecycle**
   - Big Bang → Density field → Stars → Galaxies
   - Verify at each stage with screenshots
   - Console logs should match physics

5. **Fix any math overflow issues**
   - Cap exponents properly
   - Don't let scale → Infinity → NaN

---

## HOW TO CONTINUE

```bash
cd /Users/jbogaty/src/ebb-and-bloom/packages/game

# Test algorithmic
pnpm exec tsx src/cli/test-yuka-bang-to-crunch.ts

# Test browser
pnpm dev
# Open http://localhost:5173/
# Press F12 (console)
# Unpause: window.universe.paused = false
# Watch: console.log output
# Inspect: window.universe.spawner.getManager().entities

# Run e2e
pnpm test:e2e simple-error-check
```

**When you find issues:**
1. Understand WHY (physics, agent logic, rendering)
2. Fix ONE thing
3. `git commit -m "fix: description"`
4. Test again
5. Continue

**Don't:**
- Declare victory
- Write completion docs
- Move to "next phase"
- Stop investigating

---

## REMAINING QUESTIONS (Need Investigation)

1. Why aren't density agents collapsing in browser but they do in test?
2. What's the correct initial density/mass/temp for clouds?
3. Should timeScale be capped during fast-forward?
4. What visuals belong at each zoom level?
5. How do galaxies form (markers? clustering?)
6. When should camera zoom be automatic vs manual?
7. Are we following actual cosmological physics or simplified model?

**Investigate. Don't assume. Test. Commit. Continue.**

---

## SCALE ARCHITECTURE (FROM USER - CRITICAL!)

**Universe doesn't rotate like sun.** Ebb & Bloom = seasons on PLANETS (365 day rotation).

**Each scale has ONE cycle:**
- **Universe:** Bang → Expansion → Heat death (one-way, unless Ω_m > 1)
- **Galaxy:** Formation → Evolution → Black hole merger
- **Star:** Ignition → Fusion → Death (supernova/white dwarf)
- **Planet:** Formation → Habitable → Dead
- **Creature:** Birth → Life → Death

**At SYSTEM scale:** Orbital rotation (Kepler's laws) - THAT'S where rotation matters!

**Don't impose fantasy Big Crunch cycles unless physics (omega parameters) require it.**

---

## WHAT TO RENDER AT EACH ZOOM

**User made this VERY clear:**

**COSMIC (camera > 1000):**
- Universe map (theoretical)
- Galaxy formation markers
- Tracers of large-scale structure
- NOT individual stars (wrong scale!)

**GALACTIC (500-1000):**
- Single galaxy view
- Star cluster tracers
- Spiral arm patterns
- NOT individual star dots

**STELLAR (100-500):**
- Multiple stars
- Simple spheres
- GravityBehavior clustering visible

**SYSTEM (20-100):**
- Single star system
- **ROTATION of star**
- **ORBITAL PATHS of planets**
- Kepler's laws in action

**PLANET (< 20):**
- Surface detail
- Creatures, structures
- Ebb & bloom of LIFE (seasons!)

**This is NOT optional - this is the ARCHITECTURE.**

---

**BEAST MODE: Work until it's RIGHT. Commit regularly. Think holistically. Follow physics.**
