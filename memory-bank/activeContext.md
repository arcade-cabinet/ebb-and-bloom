# Active Context

## 🎯 CURRENT FOCUS: Law-Based Universe Simulation

### The Vision (Nov 9, 2025)

**The game is WAY down the road.**  
**Visual rendering is trivial (10% complexity).**  
**The HARD part: Complete universe where Yuka steers EVERYTHING with formulas.**

### What We're Building

**Not a game with physics.**  
**A physics simulation that happens to be playable.**

Every cycle, every decision, every outcome → **CALCULATED FROM PEER-REVIEWED LAWS**.

### Current State

✅ **16 law files, 4,525 lines, 773 formulas**
✅ **All laws validated** (determinism perfect, distributions match theory)
✅ **seedrandom works** (Mersenne Twister was over-engineering)
✅ **CLI validation suite** (proves math works)

### What's Next

**Keep adding laws until Yuka has formulas for EVERYTHING:**
- Climate science (Milankovitch cycles, greenhouse effect)
- Soil science (nutrient cycling, erosion)
- Hydrology (water cycle, aquifers)
- Materials science (metallurgy, ceramics)
- Agriculture (crop yields, irrigation)
- Epidemiology (disease spread, R₀)
- Demographics (age pyramids, migration)
- Architecture (structural engineering)

**Goal:** 50+ law files, 10,000+ lines, 2,000+ formulas

Then Yuka can simulate **5,000 years forward** and answer:
- "Should this tribe farm?" → Climate + soil + hydrology + demographics
- "Will trade network succeed?" → Network effects + transport costs
- "Disease outbreak impact?" → SIR model + population density
- "Optimal settlement location?" → von Thünen rings + defensive position

**ABSURD DEPTH. NO SWEET SPOT. ONLY FORMULAS.**

# Active Context

**Date**: 2025-11-08  
**Branch**: `copilot/document-screenshot-flow`  
**Status**: MAJOR ARCHITECTURAL REFACTOR COMPLETE

---

## 🔥 CRITICAL CHANGE: LAW-BASED UNIVERSE

**We have completely rebuilt the game's foundation.**

### What Changed

**DELETED (not archived):**
- ✅ `packages/gen/` - Entire AI generation system
- ✅ `manifests/` - All hardcoded archetype and asset files
- ✅ OpenAI API dependencies for content generation

**CREATED:**
- ✅ `packages/game/src/laws/` - Complete mathematical law system
  - `physics.ts` - Newton, gravity, thermodynamics, orbital mechanics
  - `stellar.ts` - Star evolution, habitable zones, IMF
  - `biology.ts` - Kleiber's Law, allometric scaling, structural constraints
  - `ecology.ts` - Carrying capacity, Lotka-Volterra, trophic dynamics
  - `social.ts` - Service typology, Dunbar's number, hierarchy formation
  - `taxonomy.ts` - Linnaean classification, binomial nomenclature
  
- ✅ `packages/game/src/tables/` - Universal constants and lookup data
  - `physics-constants.ts` - G, c, k_B, all fundamental constants
  - `periodic-table.ts` - Complete element data (92 elements)
  - `linguistic-roots.ts` - Latin/Greek roots for systematic naming
  
- ✅ `packages/game/src/generation/` - Deterministic universe generation
  - `UniverseGenerator.ts` - Applies laws to generate solar systems
  
- ✅ `docs/LAW_BASED_ARCHITECTURE.md` - Comprehensive documentation (80+ pages)

### The New Architecture

**OLD SYSTEM (Deleted):**
```
AI prompt → OpenAI API → Generated JSON → Renderer
```

**NEW SYSTEM:**
```
Seed → RNG → Physical Laws → Chemical Laws → Biological Laws → 
Ecological Laws → Taxonomic Laws → Social Laws → Complete Universe
```

**Everything is deterministic. Same seed = same universe. Always.**

### Core Principle

**EVERYTHING IS A LAW.**

A law is a pure function: `Input → Output`

```typescript
// Physical law
const gravity = (m1, m2, r) => G * m1 * m2 / r²;

// Biological law
const metabolism = (mass) => 70 * mass^0.75;

// Taxonomic law (yes, naming is also a law!)
const genus = (locomotion, habitat) => habitatModifier + locomotionRoot;

// Social law
const governanceType = (pop, surplus) => {
  if (pop < 50) return 'Band';
  if (pop < 500) return 'Tribe';
  if (pop < 5000) return 'Chiefdom';
  return 'State';
};
```

### Why This Changes Everything

1. **Scientific Rigor**: Real physics, chemistry, biology - not AI guesses
2. **Infinite Content**: Any seed generates a complete, consistent universe
3. **Educational Value**: Game teaches actual science (periodic table, Kepler's laws, allometric scaling)
4. **Deterministic**: Same seed always produces same result (essential for multiplayer, speedruns, testing)
5. **Lightweight**: ~100KB of laws vs. megabytes of JSON
6. **Moddable**: Change constants/laws = different physics
7. **Gen6+ Unlocked**: Civilizations can now **discover the laws** and transcend their homeworld

### The Vision Expanded

**Original**: Gen0-5 (planet formation → cultural expression)

**NEW**: Gen0-∞
- Gen0-5: Planetary evolution (existing)
- **Gen6**: Scientific Revolution (creatures discover the laws!)
- **Gen7**: Space Age (apply laws to design rockets, calculate orbits)
- **Gen8**: Interplanetary Civilization (colonize moons, terraform)
- **Gen9**: Stellar Engineering (Dyson swarms, star lifting)
- **Gen10**: Interstellar Expansion (generation ships, von Neumann probes)
- **Gen11+**: Digital Transcendence (upload consciousness, post-biological)

### Current Focus

**Immediate Next Steps:**
1. ✅ Law system complete (physics, stellar, biology, ecology, social, taxonomy)
2. ✅ Universe generator built (star + planet generation working)
3. 🚧 Refactor existing Gen0-5 code to use laws instead of AI prompts
4. 🚧 Integrate with rendering system
5. 🚧 Update memory bank and documentation

**Active Work:**
- Documenting the architectural shift
- Ensuring no context is lost
- Setting clear direction for future development

### For Next Session

**DO NOT REVERT THIS CHANGE.**

The law-based system is the foundation going forward. If you see references to:
- `packages/gen/`
- `manifests/evolutionary-archetypes.json`
- OpenAI API calls for content generation

These are **obsolete**. Use the law system instead:
- `import { LAWS } from 'src/laws'`
- `LAWS.physics.gravity.force(m1, m2, r)`
- `LAWS.taxonomy.classifier.classify(organism)`

### Documentation

**Primary**: `docs/LAW_BASED_ARCHITECTURE.md` (read this first!)  
**Secondary**: Comments in each law file  
**Reference**: `src/tables/periodic-table.ts` for complete element data

---

## Gen5 Completion Status

✅ Gen5 systems implemented:
- Symbolic communication (visual symbols, learning, teaching)
- Cultural expression (body art, dance, sculpture, ritual)
- All renderers complete
- 74 TypeScript errors fixed (100% clean compile)

✅ Documentation updated:
- `docs/GEN5_COMMUNICATION_CULTURE.md`
- Memory bank reflects Gen5 completion

---

## Collaboration Context

**Copilot** is working on test coverage for Gen4/Gen5.  
**Main branch** integration pending.  
**This branch** (`copilot/document-screenshot-flow`) now contains the law-based refactor.

---

## Testing Status

- E2E Gen0 flow: 35/46 passing (76%)
- Gen1-5 systems: Unit tests needed
- Law system: Tests needed for determinism verification

---

**Last Updated**: 2025-11-08 (Law-based architecture implementation)
