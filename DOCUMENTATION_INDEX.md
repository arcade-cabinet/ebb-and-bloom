# Law-Based Universe: Complete Documentation Index

**Last Updated**: 2025-11-08

---

## 🎯 Start Here

**New to the project?**  
→ Read `README_LAW_SYSTEM.md` (5 min overview)  
→ Read `docs/LAW_BASED_ARCHITECTURE.md` (30 min deep dive)

**Want implementation details?**  
→ Read `docs/LAW_IMPLEMENTATION_SUMMARY.md`

**Want to contribute?**  
→ Read this index, then dive into the code

---

## 📚 Documentation Structure

### High-Level Overview
1. **`README_LAW_SYSTEM.md`** ⭐ START HERE
   - Quick introduction
   - Core concepts
   - Example universe generation
   - 5-minute read

2. **`docs/LAW_BASED_ARCHITECTURE.md`** 📖 MAIN GUIDE
   - Complete architectural overview
   - All laws explained
   - File structure
   - Vision and roadmap
   - 30-minute read

3. **`docs/LAW_IMPLEMENTATION_SUMMARY.md`** 🔧 TECHNICAL
   - Implementation details
   - Files created/deleted
   - Code examples
   - Migration path
   - 20-minute read

### Memory Bank (Project Status)
4. **`memory-bank/activeContext.md`**
   - Current work
   - Recent changes
   - Collaboration status
   - What's next

5. **`memory-bank/progress.md`**
   - Historical progress
   - Gen0-5 completion
   - Law system implementation
   - Metrics and statistics

### Specific Systems (Previous Work)
6. **`docs/GEN5_COMMUNICATION_CULTURE.md`**
   - Gen5 systems (symbolic communication, cultural expression)
   - Will be refactored to use social/cognitive laws

7. **`docs/GEN4_ADVANCED_CIVILIZATION.md`**
   - Gen4 systems (trade, specialization, workshops)
   - Will be refactored to use social/economic laws

8. **`docs/GEN3_TOOLS_STRUCTURES.md`**
   - Gen3 systems (tools, structures, collaborative building)
   - Will be refactored to use material/social laws

---

## 💻 Code Documentation

### The Laws (Core System)
**Location**: `packages/game/src/laws/`

Each file is self-documenting with:
- Mathematical formulas
- Physical units
- Scientific references
- Usage examples

**Read in this order:**
1. `laws/physics.ts` - Simplest laws (gravity, motion)
2. `laws/stellar.ts` - Star and planet formation
3. `laws/biology.ts` - Life scaling laws
4. `laws/ecology.ts` - Population dynamics
5. `laws/taxonomy.ts` - Classification and naming
6. `laws/social.ts` - Governance and hierarchy

### The Tables (Reference Data)
**Location**: `packages/game/src/tables/`

1. `tables/physics-constants.ts` - G, c, k_B, all fundamental constants
2. `tables/periodic-table.ts` - Complete element data (92 elements)
3. `tables/linguistic-roots.ts` - Latin/Greek naming roots

### The Generator (Main Engine)
**Location**: `packages/game/src/generation/`

1. `generation/UniverseGenerator.ts` - Applies laws to generate universes

---

## 🗺️ Navigation Guide

### "I want to understand the big picture"
1. Read `README_LAW_SYSTEM.md`
2. Read `docs/LAW_BASED_ARCHITECTURE.md` (sections 1-3)
3. Look at `memory-bank/progress.md` for status

### "I want to see the code"
1. Look at `packages/game/src/laws/physics.ts` (simplest)
2. Look at `packages/game/src/generation/UniverseGenerator.ts` (how it works)
3. Try generating a universe!

### "I want to add new laws"
1. Read `docs/LAW_BASED_ARCHITECTURE.md` (sections on adding laws)
2. Look at existing law files for patterns
3. Create new file in `src/laws/`
4. Export from `src/laws/index.ts`

### "I want to understand the periodic table"
1. Read `tables/periodic-table.ts` comments
2. See how it's used in `UniverseGenerator.ts` (composition)
3. See how it determines life chemistry

### "I want to understand taxonomy"
1. Read `laws/taxonomy.ts`
2. Look at `tables/linguistic-roots.ts` for naming
3. See examples in `docs/LAW_BASED_ARCHITECTURE.md`

### "I want to mod the game"
1. Edit `tables/physics-constants.ts` (change G, c, etc.)
2. Edit `laws/*.ts` (change relationships)
3. Result: Different universe!

---

## 🔍 Quick Reference

### Key Equations

**Physics:**
- Gravity: F = Gm₁m₂/r²
- Escape velocity: v = √(2GM/r)
- Orbital period: T = 2π√(a³/GM)

**Stellar:**
- Luminosity: L ∝ M^3.5
- Lifetime: t ∝ M^-2.5
- Habitable zone: √(L/1.1) to √(L/0.53) AU

**Biology:**
- Metabolism: BMR = 70 × M^0.75 W
- Heart rate: HR ∝ M^-0.25
- Lifespan: L ∝ M^0.25

**Ecology:**
- Carrying capacity: K = (Productivity × Efficiency) / Metabolism
- Trophic efficiency: 10%

**Social:**
- Dunbar's number: ~150 relationships
- Hierarchy levels: log₂(population / 50)

### Key Thresholds

**Service's Typology:**
- Band: < 50 people
- Tribe: 50-500 people
- Chiefdom: 500-5000 people
- State: > 5000 people

**Habitability:**
- Temperature: 273-373 K (liquid water)
- Atmosphere: Jeans parameter > 6 (retention)
- Magnetic field: Protects from radiation

---

## 📊 File Statistics

### Laws and Tables
- **Laws**: 6 files, ~2,100 lines
- **Tables**: 3 files, ~650 lines
- **Generation**: 1 file, ~420 lines
- **Total Foundation**: ~3,200 lines

### Documentation
- **Architecture**: ~450 lines
- **Implementation**: ~400 lines
- **READMEs**: ~200 lines
- **Total Docs**: ~1,050 lines

### Deleted (Old System)
- **packages/gen/**: ~2,000 lines
- **manifests/**: ~1,500 lines
- **Total Removed**: ~3,500 lines

**Net Change**: ~750 lines added, but completely different architecture

---

## 🎓 Learning Path

### Beginner (Understanding the System)
1. Day 1: Read `README_LAW_SYSTEM.md`
2. Day 2: Read `docs/LAW_BASED_ARCHITECTURE.md` (intro + laws)
3. Day 3: Look at `laws/physics.ts` and `laws/stellar.ts`
4. Day 4: Try `generateUniverse()` with different seeds
5. Day 5: Read `generation/UniverseGenerator.ts` to see how it works

### Intermediate (Contributing)
1. Week 1: Understand all law files
2. Week 2: Study the periodic table integration
3. Week 3: Look at how naming works (taxonomy + linguistics)
4. Week 4: Try modifying a law and see what changes
5. Week 5: Add a new law or extend existing one

### Advanced (Architecting)
1. Month 1: Design Gen6 (scientific discovery)
2. Month 2: Design Gen7-8 (space age)
3. Month 3: Design Gen9-10 (stellar engineering, interstellar)
4. Month 4: Design post-biological transcendence

---

## 🚀 Future Work

### Immediate (Next Sprint)
- [ ] Refactor Gen0 to use real accretion simulation
- [ ] Refactor Gen1 to generate creatures from niches
- [ ] Refactor Gen2-5 to use social/taxonomy laws
- [ ] Integration testing (seed → complete universe)

### Short-term (Next Month)
- [ ] Complete periodic table (all 92 elements)
- [ ] Life chemistry determination (C vs Si vs NH₃)
- [ ] Creature body plan generation from environment
- [ ] Tool typology system (Oldowan → Iron Age)

### Long-term (Next Year)
- [ ] Gen6: Scientific discovery mechanics
- [ ] Gen7: Space age (rockets, orbits)
- [ ] Gen8: Interplanetary civilization
- [ ] Gen9: Stellar engineering
- [ ] Gen10: Interstellar expansion

---

## 🤝 Contributing

### Adding New Laws
1. Create file in `src/laws/NewLaw.ts`
2. Define as pure functions: `(input) => output`
3. Document with formulas, units, references
4. Add tests for determinism
5. Export from `src/laws/index.ts`
6. Use in generation pipeline

### Extending Periodic Table
1. Add element to `tables/periodic-table.ts`
2. Include all properties (physical, chemical, cosmic)
3. Add bond energies with other elements
4. Update any laws that use element data

### Adding New Generators
1. Create file in `src/generation/`
2. Import necessary laws
3. Apply laws sequentially
4. Return typed results
5. Test with multiple seeds

---

## 📞 Support

**Stuck?**
1. Check this index for relevant docs
2. Read the specific law file
3. Look at code examples in `UniverseGenerator.ts`
4. Check `memory-bank/activeContext.md` for recent changes

**Found a bug?**
1. Check if it's a law issue (wrong formula?) or implementation issue
2. Verify with multiple seeds (determinism check)
3. Cross-reference with scientific literature
4. File issue with seed that reproduces problem

---

## 🌟 The Vision

**From one seed to an entire universe.**

- Real physics (Newton, Kepler, thermodynamics)
- Real chemistry (periodic table, bonding)
- Real biology (Kleiber, allometry)
- Real ecology (Lotka-Volterra, niches)
- Real sociology (Service, Dunbar, hierarchy)

**Educational. Infinite. Deterministic. Moddable.**

**This is not a game with content.**  
**This is a universe with laws.**

---

## 📝 Version History

**v2.0 (2025-11-08)** - Law-based architecture complete
- Deleted AI generation system
- Created complete law system (6 laws, 3 tables)
- Universe generator working (star + planets)
- Comprehensive documentation

**v1.0 (2025-11-07)** - Gen0-5 complete
- Planetary formation through cultural expression
- 20 systems implemented
- 7,000 lines of game logic

---

**Last Updated**: 2025-11-08  
**Status**: Foundation complete, refactoring Gen0-5 to use laws  
**Next**: Integration testing and Gen6 design

---

*This is the definitive guide to the law-based universe architecture.*  
*Start at the top. Work your way down. Build worlds.*
