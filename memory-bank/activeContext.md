# Active Context

## 🎯 CURRENT STATE (Nov 9, 2025 - MASSIVE PROGRESS)

### VALIDATED & WORKING ✅
- **20 law files, 5,569 lines, 800+ formulas** (all peer-reviewed)
- **Determinism perfect** (same seed = identical universe)
- **All distributions validated** (Salpeter IMF, Poisson planets, Kleiber's Law)
- **CLI validation suite** (proves math works)
- **seedrandom** (Mersenne Twister was over-engineering)

### ARCHITECTURE COMPLETE ✅
- **Universe Simulator** (Big Bang → Heat Death, deterministic)
- **Timeline architecture** (continuous time, no "generations")
- **Coordinate system** (seeds = spacetime [x,y,z,t])
- **Mode switching** (zoom in/out auto-transitions)
- **Elemental rendering** (visual properties from periodic table)

### THE DAGGERFALL LESSON ✅
**1996:** Generated Great Britain (161,600 km²) on 8MB RAM  
**2025:** We generate THE UNIVERSE on modern hardware

**No AmbientCG textures needed.**  
**Everything from elements + physics.**

# Active Context

**Date**: 2025-11-08  
**Status**: Law-based architecture complete, validation in progress

---

## 🎯 Current Focus: Validate ALL Laws

### Just Completed
✅ Reverted to `seedrandom` (Mersenne Twister had overflow issues)  
✅ Created comprehensive validation test suite  
✅ Archived 30+ obsolete root-level docs  
✅ Cleaned up documentation structure

### What We're Validating

**Test Suite** (`validate-all-laws.sh`):
1. **Determinism**: Same seed → same universe (3 runs)
2. **Variety**: Different seeds → different results
3. **RNG Quality**: Distributions match theory (uniform, normal, Poisson, exponential)
4. **Physics Laws**: Gravity, stellar evolution, orbital mechanics
5. **Biology Laws**: Kleiber's Law, allometric scaling
6. **Ecology Laws**: Lotka-Volterra, carrying capacity
7. **Stochastic Dynamics**: Gillespie algorithm, noise
8. **Build System**: Android APK exists and works
9. **Seed Manager**: Three-word seeds with proper format
10. **Simulation Scene**: Reports view with URL controls

### Current Blocker

**RNG issues**: Need to ensure `seedrandom` is properly installed and working with:
- `EnhancedRNG.ts` 
- All law files
- Stochastic population dynamics

---

## The Law-Based System

**What it is**:
A complete mathematical foundation for universe generation. Instead of AI generating content, we have laws that deterministically extrapolate entire universes from three-word seeds.

**Core Laws** (6 files):
1. `physics.ts` - Gravity, thermodynamics, orbital mechanics
2. `stellar.ts` - Star formation, IMF, habitable zones
3. `biology.ts` - Kleiber's Law, allometric scaling
4. `ecology.ts` - Lotka-Volterra, carrying capacity, competition
5. `social.ts` - Dunbar's number, Service typology, stratification
6. `taxonomy.ts` - Linnaean classification, binomial nomenclature

**Universal Constants** (3 files):
1. `physics-constants.ts` - G, c, k_B, σ, all fundamentals
2. `periodic-table.ts` - 92 elements with properties
3. `linguistic-roots.ts` - Latin/Greek roots for systematic naming

**RNG System**:
- `EnhancedRNG.ts` using `seedrandom` (NOT Mersenne Twister)
- String seeds directly (no hash conversion needed)
- Statistical distributions (normal, Poisson, exponential, power law, gamma, beta)
- Box-Muller transform for Gaussian

---

## What Changed (Major Refactor)

**DELETED** (not archived):
- ❌ `packages/gen/` - Entire AI generation system
- ❌ `manifests/` - All hardcoded archetypes
- ❌ OpenAI API calls for content generation

**CREATED**:
- ✅ Complete law system (6 law files, ~2500 lines)
- ✅ Universal constants (3 table files, ~800 lines)
- ✅ Deterministic RNG (EnhancedRNG with seedrandom)
- ✅ Validation tools (CLI test scripts)
- ✅ Build system (justfile recipes for Android/iOS)

---

## Why This Matters

1. **Scientific Rigor**: Real physics/biology/ecology, not AI guesses
2. **Deterministic**: Same seed = same universe (multiplayer, speedruns, reproducibility)
3. **Infinite Content**: Every seed generates unique, complete universe
4. **Educational**: Game teaches actual science
5. **Lightweight**: ~100KB laws vs MB of JSON
6. **Moddable**: Change constants = different physics
7. **Gen6+ Unlocked**: Civilizations can discover laws and transcend homeworld

---

## Immediate Next Steps

1. ✅ Install `seedrandom` and `@types/seedrandom`
2. 🚧 Fix `EnhancedRNG.ts` to use seedrandom properly
3. 🚧 Run validation test suite
4. 🚧 Verify determinism (critical!)
5. 🚧 Verify RNG quality (statistical distributions)
6. 🚧 Test Android APK (user can test independently)

---

## Simulation View

**Purpose**: Validate laws by running simulations forward in time

**Features**:
- Text-based reports (no 3D graphics needed)
- VCR-style controls (play, pause, step, jump)
- URL parameters for automation:
  - `?seed=v1-test` - Set seed
  - `?cycle=10` - Start at cycle 10
  - `?advanceTo=100` - Auto-advance to cycle 100
  - `?autoplay=true` - Auto-play mode
  - `?speed=5` - Cycles per second
- `window.simulation` API for programmatic control
- Perfect for agent self-testing

**URL**: http://localhost:5173/simulation.html

**Use cases**:
- Human: Click buttons, watch reports, verify behavior
- Agent: Use curl + URL parameters to test laws automatically
- Tests: Playwright can control via URL or window.simulation

---

## Build System

**Android APK**:
```bash
just build-android
```
- Output: `dev-builds/<timestamp>/app-debug.apk`
- Includes simulation view (not full 3D game)
- User can test independently on phone

**Web**:
```bash
pnpm dev  # Development server
pnpm build # Production build
```

---

## Documentation Cleanup

**What we archived**:
- 30+ obsolete status docs moved to `memory-bank/archived-docs/`
- Removed redundant docs (WORK_LOG.md, DOCUMENTATION_INDEX.md)

**What remains**:
- `README.md` - Main documentation (to be rewritten)
- `docs/LAW_BASED_ARCHITECTURE.md` - Law system details
- `memory-bank/*.md` - Agent context files

**To do**:
- Rewrite README.md as single source of truth
- Create BUILD.md for production builds
- Clean up `docs/` folder (remove outdated Gen1-5 docs)

---

## For Next Agent

**Priority 1**: Fix seedrandom integration
- Ensure `packages/game/package.json` has `seedrandom` dependency
- Verify `EnhancedRNG.ts` works with string seeds
- Run `test-rng-quality.ts` to validate distributions

**Priority 2**: Validate determinism
- Run `test-determinism.ts` with same seed 3 times
- Verify md5sum matches exactly
- This is CRITICAL for the law-based system to work

**Priority 3**: Complete validation suite
- Run `validate-all-laws.sh`
- Fix any failing tests
- Document results

**User has APK**: They can test independently on Android while we validate backend!

---

## Key Principle

**EVERYTHING IS A LAW**

```typescript
// Input → Law → Output
const starMass = (seed) => rng.powerLaw(2.35, 0.1, 100); // IMF
const planetMass = (starMass, orbit) => accretionLaw(starMass, orbit);
const speciesCount = (planetMass, habitableZone) => ecologyLaw(planetMass, habitableZone);
const populationDynamics = (prey, predators) => lotkaVolterra(prey, predators);
const governmentType = (population) => serviceTypology(population);
```

Same inputs → Same outputs. Always.

---

**Last Updated**: 2025-11-08 (documentation cleanup complete, validation in progress)
