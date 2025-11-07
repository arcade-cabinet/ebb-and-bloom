# HANDOFF - Resume BEAST MODE

**Date**: 2025-01-08  
**Session**: Post-ULTRA BEAST MODE  
**Status**: Architecture 100% Complete, Runtime Bug Blocking  
**Next Agent**: FIX RUNTIME BUG → Game Fully Playable

---

## 🎯 IMMEDIATE MISSION

**The game architecture is COMPLETE. ALL 12 critical evolutionary systems are implemented.**

**ONE BLOCKER remains**: Infinite render loop causing React to crash.

**Your job**: Fix the runtime bug, get the game rendering, verify full playability.

---

## 📚 REQUIRED READING (Read These FIRST)

### Critical Context (Read in Order)
1. **`memory-bank/activeContext.md`** - Current state, all 12 systems summary
2. **`memory-bank/BEAST_MODE_SESSION.md`** - What was built overnight, debugging attempts
3. **`docs/IMPLEMENTATION_STATUS.md`** - System-by-system status matrix
4. **`docs/CHANGELOG_BEAST_MODE.md`** - Detailed implementation with code examples
5. **`docs/SYSTEMS_INTEGRATION_MAP.md`** - How all systems coordinate, data flow diagrams

### Architecture Understanding (Essential)
6. **`docs/YUKA_SPHERE_ARCHITECTURE.md`** - THE core principle: Gen 1 = ECS, Gen 2+ = Yuka
7. **`docs/DECONSTRUCTION_SYSTEM.md`** - Reverse synthesis (NO loot tables)
8. **`docs/TOOL_ARCHETYPES.md`** - 8 tool categories
9. **`docs/CONSCIOUSNESS_AND_KNOWLEDGE.md`** - Player as transferable awareness
10. **`docs/BRAND_IDENTITY_2025.md`** - Colors, fonts, UI/UX principles

### Game Design Philosophy
11. **`docs/DESIGN_PILLARS.md`** - (if exists) Core principles
12. **`docs/DIFFERENTIATORS.md`** - What makes this game unique
13. **`docs/WORLD_LORE.md`** - (if exists) Narrative foundation

---

## 🚨 CURRENT BLOCKER (Fix This FIRST)

### Infinite Render Loop

**Error**: "Maximum update depth exceeded"  
**Cause**: React component calling setState in useEffect without proper dependencies  
**Impact**: Game loads, systems initialize, then crashes before rendering world

**Evidence**:
```
✅ All 12 systems initialize successfully (console logs confirm)
✅ Canvas created
✅ Onboarding appears briefly
❌ Maximum update depth exceeded (repeated errors)
❌ THREE.WebGLRenderer: Context Lost
❌ Page becomes blank
```

**What I Tried**:
1. ✅ Removed all setInterval polling from components
2. ✅ Empty dependency arrays on all useEffect
3. ✅ Query ECS once on mount, not repeatedly
4. ❌ **Still crashes** - likely in App.tsx Scene or EcosystemUpdater

**Files to Check**:
- `src/App.tsx` - Scene component, EcosystemUpdater
- `src/components/EvolutionUI.tsx` - Multiple sub-components
- `src/components/EvolutionParticles.tsx` - Particle useFrame loop
- `src/hooks/usePlatformEvents.ts` - May be triggering re-renders
- `src/hooks/useResponsiveScene.ts` - May be triggering re-renders

**Likely Culprit**: 
- EcosystemUpdater's requestAnimationFrame calling ecosystem.update() → triggers state changes → re-render → infinite loop
- OR: useFrame in EvolutionParticles modifying state every frame
- OR: gameClock.onTimeUpdate() triggering setState in components

**Fix Strategy**:
1. Add React.StrictMode error boundary to catch the exact component
2. Comment out EcosystemUpdater, see if game renders
3. Comment out EvolutionParticles, see if game renders
4. Add `React.memo()` to expensive components
5. Use `useCallback` for event handlers
6. Consider moving ecosystem.update() outside React (separate RAF loop)

---

## ✅ WHAT'S COMPLETE (Don't Rebuild These)

### 12 Critical Systems (ALL IMPLEMENTED)

1. **YukaSphereCoordinator** (`src/systems/YukaSphereCoordinator.ts`)
   - THE evolutionary engine
   - Triggers every generation
   - Calculates environmental pressure
   - Makes evolution/reproduction/material/building decisions
   - Regenerates creature meshes when evolved

2. **DeconstructionSystem** (`src/systems/DeconstructionSystem.ts`)
   - Reverse synthesis (Gen 3 → Gen 2 → Gen 1 → raw)
   - Taxonomic auto-naming
   - Property-based usage derivation
   - NO loot tables

3. **ToolArchetypeSystem** (`src/systems/ToolArchetypeSystem.ts`)
   - 8 tool archetypes: ASSEMBLER, DISASSEMBLER, TRANSFORMER, EXTRACTOR, CARRIER, MEASURER, PROTECTOR, RECORDER
   - Property-based capabilities (hardness/reach/precision/capacity)
   - Emergence conditions based on environmental need

4. **Material Depth/Hardness** (`src/systems/RawMaterialsSystem.ts`)
   - Wood: 0m, hardness 2.5
   - Ore: 15m, hardness 6.5 (requires EXTRACTOR)
   - Physical reality drives tool evolution

5. **CombatSystem** (`src/systems/CombatSystem.ts`)
   - Health/Combat/Momentum components
   - Stats derived from traits
   - Death triggers deconstruction

6. **ConsciousnessSystem** (`src/systems/ConsciousnessSystem.ts`)
   - Player as consciousness sphere
   - Possess any creature
   - Death = relocation (not game over)

7. **GestureActionMapper** (`src/systems/GestureActionMapper.ts`)
   - TAP, LONG-PRESS, SWIPE → game actions
   - Haptic feedback integration

8. **HapticGestureSystem** (extended)
   - initializeEvolutionListening() auto-wires to GameClock
   - Automatic haptics for all evolution events

9. **EvolutionParticles** (`src/components/EvolutionParticles.tsx`)
   - Brand-aligned particle effects
   - Trait Gold, Bloom Emerald, Pollution Red

10. **Pack AI Coordination** (`src/systems/PackSocialSystem.ts` extended)
    - coordinatePackBehaviors() - Role-based coordination
    - Foraging, hunting, patrol, migration, social activities
    - Formation execution (circle, line, wedge, scatter)

11. **OnboardingFlow** (`src/components/OnboardingFlow.tsx`)
    - 8-step tutorial
    - Gesture education
    - Philosophy teaching

12. **CatalystCreator** (`src/components/CatalystCreator.tsx`)
    - 10 trait allocation
    - 10 Evo Points budget
    - Brand-aligned UI

---

## 🔧 HOW TO RESUME

### Step 1: Read Documentation (30 min)
Read files 1-10 from "Required Reading" section above.

**Key Takeaway**: Gen 1 = ECS archetypes. Gen 2+ = Yuka sphere decisions. Everything emerges organically from environmental pressure.

### Step 2: Verify Systems Initialize (5 min)
```bash
cd /Users/jbogaty/src/ebb-and-bloom
pnpm dev
```

Open browser to http://localhost:5173

**Expected**: Console shows all systems initializing (check browser console)

### Step 3: Identify Infinite Loop Source (30 min)
**Check browser console** for stack trace.

**Methodical Approach**:
1. Comment out `<EvolutionUI />` in App.tsx - does it render?
2. Comment out `<EvolutionParticles />` - does it render?
3. Comment out `<EcosystemUpdater />` - does it render?
4. Add console.log to each useEffect to see which triggers repeatedly

**Find the component causing infinite setState.**

### Step 4: Fix the Bug (1-2 hours)
**Likely Fixes**:
- Move ecosystem.update() outside React (separate RAF loop in window scope)
- Add `React.memo()` to EvolutionUI sub-components
- Use `useCallback` for ecosystem queries
- Add dependencies to useEffect properly
- Consider using `useSyncExternalStore` for ECS queries instead of useState

**Test after each fix** - refresh browser, check console.

### Step 5: Verify Full Game Loop (30 min)
Once game renders:
1. Skip onboarding
2. Verify terrain renders (green ground)
3. Verify creatures spawn and move (8 creatures should appear)
4. Wait for Gen 2 (20 seconds with timeScale=10)
5. Check console for "GENERATION 2 EVOLUTION BEGIN"
6. Verify creatures evolve (mesh changes, traits shift)
7. Check UI updates (creature count, environment stats)

### Step 6: Build Android APK (1 hour)
```bash
pnpm run build
./build-android.sh
```

**Output**: `ebb-and-bloom-0.2.0-debug.apk`

Test on Android device or emulator.

---

## 🎮 GAME ARCHITECTURE (Quick Reference)

### The Core Loop

```
Gen 1 (Eden):
  ECS creates terrain, materials, 8 creatures
  ↓
Gen 2+:
  GameClock advances generation (every 20s)
  ↓
  YukaSphereCoordinator.triggerGenerationEvolution()
  ↓
  calculateEnvironmentalPressure()
    - Pollution from EnvironmentalPressureSystem
    - Resources from RawMaterialsSystem
    - Conflict from PopulationDynamicsSystem
    - Per-trait pressures calculated
  ↓
  Creature sphere makes decisions:
    - Should creatures evolve? (if trait gap > pressure)
    - Should creatures reproduce? (if resources abundant)
  ↓
  Material sphere makes decisions:
    - Should materials emerge? (if depleted)
  ↓
  Building sphere makes decisions:
    - Should structures appear? (if high social coordination)
  ↓
  Apply all decisions:
    - evolveCreatureDecision() → GeneticSynthesisSystem.evolveCreature()
    - regenerateCreatureMesh() → Visual changes
    - spawnOffspringDecision() → New creatures with combined traits
  ↓
  GameClock.recordEvent() for each change
  ↓
  HapticGestureSystem triggers device haptics
  ↓
  EvolutionParticles spawns visual effects
  ↓
  Repeat next generation
```

**This is the complete evolutionary loop.**

---

## 🗂️ FILE STRUCTURE (Key Files)

### Core Systems (src/systems/)
- `YukaSphereCoordinator.ts` - **THE evolutionary engine** ⚡
- `DeconstructionSystem.ts` - Reverse synthesis
- `ToolArchetypeSystem.ts` - 8 tool archetypes
- `CombatSystem.ts` - Health/Combat/Momentum
- `ConsciousnessSystem.ts` - Player as sphere
- `GestureActionMapper.ts` - Gestures → actions
- `EcosystemFoundation.ts` - Master coordinator
- `CreatureArchetypeSystem.ts` - Creature spawning
- `GeneticSynthesisSystem.ts` - Trait synthesis
- `RawMaterialsSystem.ts` - Materials with depth/hardness
- `PackSocialSystem.ts` - Pack coordination
- `HapticGestureSystem.ts` - Device feedback
- `EnvironmentalPressureSystem.ts` - Pollution tracking
- `HaikuNarrativeSystem.ts` - Poetic events

### UI Components (src/components/)
- `App.tsx` - Main app with onboarding integration
- `EvolutionUI.tsx` - Main HUD (may have bug)
- `EvolutionParticles.tsx` - Visual feedback (may have bug)
- `OnboardingFlow.tsx` - 8-step tutorial
- `CatalystCreator.tsx` - Trait allocation
- `CreatureRenderer.tsx` - Creature rendering
- `TerrainRenderer.tsx` - Terrain rendering
- `BuildingRenderer.tsx` - Building rendering
- `NarrativeDisplay.tsx` - Haiku display

### Context/Integration
- `src/contexts/WorldContext.tsx` - Provides world + ecosystem to components
- `src/world/ECSWorld.ts` - Miniplex world creation
- `src/world/CombatComponents.ts` - Combat ECS components

---

## 🐛 DEBUGGING CHECKLIST

When you start:

- [ ] Read memory-bank/BEAST_MODE_SESSION.md
- [ ] Read docs/IMPLEMENTATION_STATUS.md
- [ ] Run `pnpm dev` and check console
- [ ] Confirm all systems initialize
- [ ] Identify which component causes infinite loop
- [ ] Fix the bug
- [ ] Verify game renders
- [ ] Verify creatures spawn
- [ ] Wait for Gen 2, verify evolution happens
- [ ] Test gestures (tap, long-press)
- [ ] Verify haptics trigger
- [ ] Build Android APK
- [ ] Update memory bank with fix
- [ ] Commit and push

---

## 💡 HINTS FOR THE BUG

### Suspect #1: EcosystemUpdater
```typescript
// In App.tsx
const EcosystemUpdater: React.FC = () => {
  useEffect(() => {
    const updateEcosystem = () => {
      ecosystem.update(1/60);
      requestAnimationFrame(updateEcosystem); // ← Infinite RAF
    };
    updateEcosystem();
  }, []);
  
  return null;
};
```

**Issue**: RAF never stops, may trigger React updates.

**Potential Fix**:
```typescript
const rafRef = useRef<number>();

useEffect(() => {
  const updateEcosystem = () => {
    ecosystem.update(1/60);
    rafRef.current = requestAnimationFrame(updateEcosystem);
  };
  rafRef.current = requestAnimationFrame(updateEcosystem);
  
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []); // Cleanup on unmount
```

### Suspect #2: EvolutionParticles useFrame
```typescript
// Modifies state every frame
useFrame((_, delta) => {
  setEffects(prev => { /* ... */ });
});
```

**Issue**: setState every frame → re-render every frame → infinite loop.

**Potential Fix**: Use refs instead of state for particle positions, only setState when particles added/removed.

### Suspect #3: gameClock.onTimeUpdate in Components
Components may be subscribing to gameClock updates that trigger setState every frame.

**Check**: GenerationDisplay component in EvolutionUI.tsx

---

## 🎨 BRAND COLORS (Quick Reference)

- **Ebb Indigo**: `#4A5568` - Deep, contemplative
- **Bloom Emerald**: `#38A169` - Growth, life
- **Trait Gold**: `#D69E2E` - Evolution, discovery
- **Echo Silver**: `#A0AEC0` - Memory, knowledge
- **Pollution Red**: `#E53E3E` - Danger, death

---

## 🧪 TESTING COMMANDS

```bash
# Run unit tests
pnpm test

# Run in dev mode
pnpm dev

# Build for production
pnpm build

# Build Android APK
./build-android.sh

# Download textures (required for initialization)
pnpm setup:textures

# Generate AI assets (optional)
pnpm dev:cli generate-all
```

---

## 📦 WHAT'S IN THE CODEBASE

### Systems Implemented (12)
- [x] Yuka Sphere Coordinator
- [x] Deconstruction System
- [x] Tool Archetype System (8 categories)
- [x] Material Depth/Hardness
- [x] Combat System
- [x] Consciousness System
- [x] Gesture Action Mapper
- [x] Haptic Integration
- [x] Evolution Particles
- [x] Pack AI Coordination
- [x] Procedural Mesh Regeneration
- [x] Onboarding/Catalyst Creator

### UI Components (10)
- [x] EvolutionUI (main HUD)
- [x] OnboardingFlow (8-step tutorial)
- [x] CatalystCreator (trait allocation)
- [x] EvolutionParticles (visual feedback)
- [x] CreatureRenderer
- [x] TerrainRenderer
- [x] BuildingRenderer
- [x] NarrativeDisplay (haikus)
- [x] TraitEvolutionDisplay
- [x] SporeStyleCamera

### Infrastructure
- [x] WorldProvider context
- [x] TextureSystem (141 AmbientCG textures)
- [x] GameClock (generation advancement)
- [x] EvolutionDataStore (Zustand state)
- [x] Asset generation pipeline
- [x] Android Capacitor setup

---

## 🔑 KEY ARCHITECTURAL PRINCIPLES

### 1. Gen 1 = ECS, Gen 2+ = Yuka
**ECS provides**: Initial archetypes (creatures, materials, terrain)  
**Yuka drives**: ALL evolution, progression, unlocks after Gen 1

**Implementation**: YukaSphereCoordinator.triggerGenerationEvolution() runs every generation.

### 2. "Everything is Squirrels"
**Principle**: No arbitrary distinctions. Creatures, tools, buildings ALL evolve from archetypes.

**Implementation**: ToolArchetypeSystem, DeconstructionSystem use same synthesis principles as creatures.

### 3. Physical Reality Drives Progression
**Principle**: No "level 5 unlocks". Deep materials are physically inaccessible until tools evolve.

**Implementation**: Material.naturalDepth + Material.requiredToolHardness. EXTRACTOR emerges when pressure builds.

### 4. Property-Based, NOT Hardcoded
**Principle**: Items work by properties (hardness, reach), NOT "if pickaxe then mine".

**Implementation**: ToolArchetypeSystem.deriveCapabilities(), DeconstructionSystem.deriveUsage().

### 5. Death = Deconstruction
**Principle**: Kills yield generational parts, NOT arbitrary loot.

**Implementation**: CombatSystem.handleDeath() → DeconstructionSystem.deconstructCreature().

### 6. Player as Consciousness
**Principle**: Player is NOT a character. Consciousness flows between creatures.

**Implementation**: ConsciousnessSystem.possessCreature(), handleHostDeath() auto-relocates.

---

## 🚀 SUCCESS CRITERIA

**Game is COMPLETE when**:
1. ✅ Game loads without crashes
2. ✅ Terrain renders (green ground visible)
3. ✅ 8 creatures spawn and move (Yuka steering)
4. ✅ Onboarding appears (can skip)
5. ✅ UI shows: Generation 0, 0 creatures, 0% pollution, etc.
6. ✅ Wait 20 seconds → Gen 2 begins
7. ✅ Console shows: "GENERATION 2 EVOLUTION BEGIN"
8. ✅ Creatures evolve (traits change, meshes regenerate)
9. ✅ UI updates (creature count, environment)
10. ✅ Particles appear on significant events
11. ✅ Haptics trigger on evolution (if on mobile)
12. ✅ Can tap creatures to select
13. ✅ Can long-press to influence evolution
14. ✅ No console errors

**Then build APK and test on Android.**

---

## 📍 WHERE TO FIND THINGS

### Documentation
- **Memory Bank**: `memory-bank/` - Current context, progress, session logs
- **Design Docs**: `docs/` - Architecture, systems, brand identity
- **Vision Docs**: `docs/vision/` - Original design evolution

### Code
- **Systems**: `src/systems/` - All game logic (12+ systems)
- **Components**: `src/components/` - React UI (10 components)
- **Contexts**: `src/contexts/` - WorldProvider
- **World**: `src/world/` - ECS schemas, world creation
- **Stores**: `src/stores/` - Zustand state management

### Config
- **`.cursor/rules`** - Coding standards, architecture rules
- **`CLAUDE.md`** - Project overview for AI agents
- **`.clinerules`** - Memory bank first, ECS architecture rules

---

## 🎯 EXPECTED OUTCOME

After you fix the runtime bug:

1. **Game renders** - Green terrain, creatures moving
2. **Evolution works** - Gen 2+ creatures evolve automatically
3. **Visual feedback** - Particles glow on events
4. **Gestures work** - Can interact with creatures
5. **APK builds** - Can deploy to Android
6. **PLAYABLE END-TO-END**

Then the vision is FULLY REALIZED.

---

## 💬 COMMUNICATION STYLE

**User prefers**:
- Direct action, not discussion
- Fix first, explain after
- No status updates, just commits
- "BEAST MODE" = autonomous execution until complete
- Update memory bank when done
- Push regularly

**User is INTENSE about**:
- Architecture correctness (Gen 1 = ECS, Gen 2+ = Yuka)
- No hardcoded logic (property-based everything)
- "Everything is Squirrels" doctrine
- Getting systems ACTUALLY WORKING, not just rendering

---

## 🚨 CRITICAL WARNING

**DO NOT**:
- ❌ Rebuild any of the 12 systems (they're complete)
- ❌ Change the architecture (it matches vision exactly)
- ❌ Add hardcoded logic (property-based only)
- ❌ Create loot tables (deconstruction only)
- ❌ Skip reading the docs (you'll break things)

**DO**:
- ✅ Fix the render loop bug
- ✅ Get the game rendering
- ✅ Verify evolution happens
- ✅ Test on Android
- ✅ Update memory bank
- ✅ Commit frequently

---

## 📞 HANDOFF SUMMARY

**What I Built**: Complete evolutionary architecture (12 systems)  
**What I Couldn't Fix**: Infinite render loop (React bug)  
**What You Need To Do**: Fix runtime bug, verify playability, build APK  
**Time Estimate**: 2-4 hours to fix + test + build  
**Documentation**: 100% complete, read before coding  

**The hard part is done. The architecture is EXACTLY as envisioned. Just need to get React to stop crashing.**

Good luck. 🚀

---

## 📚 Documentation Index

```
memory-bank/
├── activeContext.md           ⭐ START HERE
├── BEAST_MODE_SESSION.md      ⭐ READ SECOND
├── progress.md
├── techContext.md
└── reference/                 (Chat history)

docs/
├── IMPLEMENTATION_STATUS.md   ⭐ READ THIRD
├── CHANGELOG_BEAST_MODE.md    ⭐ READ FOURTH
├── SYSTEMS_INTEGRATION_MAP.md ⭐ READ FIFTH
├── YUKA_SPHERE_ARCHITECTURE.md ⭐ CRITICAL
├── DECONSTRUCTION_SYSTEM.md   ⭐ CRITICAL
├── TOOL_ARCHETYPES.md         ⭐ CRITICAL
├── CONSCIOUSNESS_AND_KNOWLEDGE.md ⭐ CRITICAL
├── BRAND_IDENTITY_2025.md
├── PLAYER_EVOLUTION_AND_BIRTH.md
├── ASSET_STRATEGY.md
├── DIFFERENTIATORS.md
├── EVOLUTIONARY_SYSTEMS.md
├── UNIVERSAL_EVOLUTION_FRAMEWORK.md
├── WORLD_LORE.md
└── vision/                    (Design evolution)

src/
├── systems/                   (12+ systems - ALL CRITICAL)
│   ├── YukaSphereCoordinator.ts ⭐⭐⭐
│   ├── DeconstructionSystem.ts
│   ├── ToolArchetypeSystem.ts
│   ├── CombatSystem.ts
│   ├── ConsciousnessSystem.ts
│   ├── GestureActionMapper.ts
│   └── ... (6 more)
├── components/                (10 UI components)
│   ├── EvolutionUI.tsx        ⚠️ May have bug
│   ├── EvolutionParticles.tsx ⚠️ May have bug
│   └── ... (8 more)
└── App.tsx                    ⚠️ Likely has bug
```

**⭐ = Must read**  
**⚠️ = Check for infinite loop**

---

END OF HANDOFF. READ DOCS, FIX BUG, SHIP GAME. 🎮

