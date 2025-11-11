# Ebb & Bloom - Design Documentation

**Critical: Read these docs FIRST before making architectural decisions.**

This directory contains the **authoritative design documentation** for Ebb & Bloom. These documents capture fundamental design principles that must be preserved across development sessions.

---

## 📋 Document Index

### 🤖 [AI_HIERARCHY.md](./AI_HIERARCHY.md) - **READ FIRST**
**The CRITICAL distinction between Creature AI and Rival AI.**

**Why this matters:**
- Confusing these two systems breaks the entire game design
- Creature AI = Individual behavior (squirrels, foxes, your protozoa)
- Rival AI = Strategic competition (other governors playing against you)
- Tools/structures are NOT separate AI - they're creature synthesis

**When to read:**
- Before implementing ANY AI system
- Before adding autonomous behaviors
- When designing evolution mechanics
- When confused about "who controls what"

---

### 🌌 [COSMIC_PROVENANCE.md](./COSMIC_PROVENANCE.md)
**Complete material lineage from Big Bang to surface.**

**Core concept:** "Everything is a squirrel" - total scientific rigor with complete material provenance.

**Covers:**
- LINES concept (universal coordinates → planetary layers → material locations)
- FMV dual purpose (visual narrative + deterministic genesis establishment)
- Planetary accretion system (why is copper HERE and not THERE?)
- Dead World Bias difficulty setting (genesis favorability)
- Why AI never gets stuck (deterministic queryable map)

**When to read:**
- Before implementing resource spawning
- When designing material synthesis
- Before creating technology progression
- When implementing FMV sequence
- When AI needs to query resource locations

---

### ⚖️ [INTENT_API_PHILOSOPHY.md](./INTENT_API_PHILOSOPHY.md)
**Why traditional AI cheating breaks games, and how we prevent it.**

**Core principle:** Player and AI use the SAME interface, governed by the SAME laws. No cheating possible.

**Covers:**
- Why direct AI manipulation feels unfair (and what we do instead)
- Intent API architecture (both paths go through GovernorActionExecutor)
- 7 governor actions with equal constraints
- Conservation law enforcement
- Indirect influence examples (you suggest, laws decide)

**When to read:**
- Before implementing ANY governor action
- When balancing player vs AI
- Before creating difficulty settings
- When debugging "AI feels unfair" issues
- When implementing competitive mechanics

---

## 🏗️ Current Architecture (Phase 3 Complete)

### System Layers (Bottom to Top)

```
┌─────────────────────────────────────────────────────────┐
│ COSMIC PROVENANCE (Deterministic from 3-word seed)      │
│ - GenesisConstants: Universal coordinates, physics      │
│ - CosmicProvenanceTimeline: Galaxy age, metallicity     │
│ - PlanetaryAccretion: Core → Crust → Surface materials │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ ECS WORLD (Entity-Component-System)                     │
│ - Engine/ecs/World: Entity storage, spatial queries     │
│ - CoreComponents: Physics, Chemistry, Biology, Ecology  │
│ - LawOrchestrator: 11 scientific systems run every tick │
│ - ConservationLedger: Mass, charge, energy tracking     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ GOVERNOR INTENT API (Player & AI equality)              │
│ - GovernorActionPort: Unified interface for actions     │
│ - GovernorActionExecutor: Applies intents to ECS+Scene  │
│ - PlayerGovernorController: Implements with budget      │
│ - [Future] RivalAIGovernorController: Same interface    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ GAME STATE (Zustand store)                              │
│ - Unified initialization: seed → RNG → Genesis → ECS    │
│ - executeGovernorIntent(): Single entry point           │
│ - Three.js scene/camera refs for rendering              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ UI LAYER (React + React Three Fiber)                    │
│ - SceneManager: Menu → Intro → Gameplay → Pause         │
│ - CosmicExpansionFMV: Teaches provenance visually       │
│ - GameplayScene: Governor view + 3D world rendering     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Design Principles

### 1. **Determinism is Sacred**
Same 3-word seed ALWAYS produces identical:
- Universal coordinates
- Galaxy age and metallicity
- Planetary structure
- Material locations
- Life emergence probability

**Implementation:** All randomness flows through `RNGRegistry` with scoped namespaces.

---

### 2. **Conservation Laws are Enforced**
You cannot cheat physics. Neither can AI.

```typescript
// When entity is created:
conservationLedger.addMass(entity.mass);

// When entity is destroyed:
conservationLedger.removeMass(entity.mass);

// Total mass never changes (except external inputs)
```

**Implementation:** `ConservationLedger` tracks all mass, charge, energy globally.

---

### 3. **Intent-Based Actions (Not Direct Manipulation)**
Player and AI submit INTENTS. Laws determine OUTCOMES.

```typescript
// Player wants to kill predator
const intent = { action: 'smite_predator', target: wolfId };
await gameState.executeGovernorIntent(intent);

// Rival AI wants to kill player's creature (SAME PATH)
const rivalIntent = { action: 'smite_predator', target: playerCreatureId };
await gameState.executeGovernorIntent(rivalIntent);  // Same function!
```

**Implementation:** `GovernorActionExecutor` applies intents uniformly.

---

### 4. **Everything Traces to Cosmic Origin**
Kill a fox → Get fox parts with cosmic lineage.

```typescript
const foxCorpse = {
  mass: fox.mass,  // Conserved
  elementCounts: fox.elementCounts,  // Same atoms
  cosmicLineage: fox.cosmicLineage,  // Galaxy metallicity, supernova cycle
};

// Becomes harvestable materials
world.add(createMaterial('fox_meat', foxCorpse.elementCounts));
```

**Implementation:** All entities have `elementCounts` traced to `genesis.getMetallicity()`.

---

### 5. **Creature AI vs Rival AI (NEVER CONFUSE)**

**Creature AI (YUKA primitives):**
- Applies to EVERY organism (player's and AI's)
- Individual goals, tool use, social interaction
- Autonomous behavior (player cannot force)

**Rival AI (Governor intents):**
- Strategic competition at player level
- Uses GovernorActionPort interface
- Energy budget constraints
- Same 7 actions as player

**Implementation:** See [AI_HIERARCHY.md](./AI_HIERARCHY.md).

---

## 📁 Code Organization

### Critical Files

**Entry Points:**
- `game/Game.tsx` - Root component
- `game/state/GameState.ts` - Unified world state (Zustand store)

**Core Systems:**
- `engine/ecs/World.ts` - ECS world with spatial queries
- `engine/ecs/core/LawOrchestrator.ts` - Runs 11 scientific systems
- `engine/genesis/GenesisConstants.ts` - Cosmic properties
- `engine/genesis/CosmicProvenanceTimeline.ts` - Galaxy history

**Intent API:**
- `agents/controllers/GovernorActionPort.ts` - Interface definition
- `engine/ecs/core/GovernorActionExecutor.ts` - Intent → ECS application
- `game/controllers/PlayerGovernorController.ts` - Player implementation

**Scenes:**
- `game/scenes/MenuScene.tsx` - Seed selection
- `game/scenes/IntroScene.tsx` - Cosmic expansion FMV
- `game/scenes/GameplayScene.tsx` - Main gameplay loop

---

## 🚀 Development Workflow

### When Adding New Features:

1. **Check if it needs AI:**
   - Individual behavior? → Creature AI (YUKA)
   - Strategic competition? → Rival AI (GovernorActionPort)
   - Pure algorithmic? → Law system (no AI needed)

2. **Check if it needs provenance:**
   - Does it involve materials? → Trace to genesis
   - Does it spawn entities? → Include `elementCounts` from metallicity
   - Does it consume resources? → Update ConservationLedger

3. **Check if it affects player AND AI:**
   - If yes → Must go through GovernorActionPort
   - Same energy cost for both
   - Same law constraints for both

4. **Update documentation:**
   - Architectural decision? → Update relevant `docs/*.md`
   - System integration? → Update `replit.md`
   - Design pattern? → Add example to docs

---

## 🔧 Testing Strategy

### Determinism Tests
Every system MUST be deterministic:

```typescript
const seed = 'v1-test-world-alpha';
const result1 = generateWorld(seed);
const result2 = generateWorld(seed);
expect(result1).toEqual(result2);  // MUST PASS
```

### Conservation Tests
Mass/charge/energy must be conserved:

```typescript
const before = ledger.getTotalMass();
world.add(entity);  // +100kg
world.remove(entity);  // -100kg
const after = ledger.getTotalMass();
expect(after).toEqual(before);  // MUST PASS
```

### Fairness Tests
Player and AI must have same outcomes:

```typescript
const playerResult = await executeIntent(playerIntent);
const aiResult = await executeIntent(aiIntent);
expect(playerResult.constraints).toEqual(aiResult.constraints);  // Same laws
```

---

## 📊 Architecture Decisions Log

### Why Miniplex ECS?
- **Performance:** Archetype-based storage, efficient queries
- **Type Safety:** TypeScript-native, full autocomplete
- **Simplicity:** No boilerplate, just `world.add(entity)`

### Why GovernorActionPort?
- **Fairness:** Same interface = same constraints
- **Testability:** Can swap player/AI implementations
- **Extensibility:** Add new actions without breaking existing

### Why Not Separate Tool AI?
- Tools don't "act" - creatures use tools
- Tool competency is creature property
- Reduces AI complexity (fewer competing systems)

---

## 🎓 Reading Order for New Developers

1. **Start here:** `docs/README.md` (you are here!)
2. **Critical:** `docs/AI_HIERARCHY.md` (prevents confusion)
3. **Foundation:** `docs/COSMIC_PROVENANCE.md` (understand LINES)
4. **Fairness:** `docs/INTENT_API_PHILOSOPHY.md` (why it works)
5. **Project state:** `replit.md` (current progress)
6. **Code dive:** Start from `game/Game.tsx` and follow imports

---

## ⚠️ Common Pitfalls

### ❌ DON'T: Add separate tool/structure AI systems
Tools are creature synthesis. Creatures learn to use them through Creature AI.

### ❌ DON'T: Give AI different energy costs
Both must pay same costs. Difficulty = genesis biases, not AI advantages.

### ❌ DON'T: Hardcode material locations
Use planetary accretion + genesis metallicity. Deterministic from seed.

### ❌ DON'T: Let player directly control evolution
Player suggests through intents. Laws + genetics determine outcomes.

### ❌ DON'T: Create non-deterministic systems
Same seed = same world. Always. Test it.

---

## 📞 Questions?

If documentation is unclear or missing:
1. Add your question to the relevant `docs/*.md` file
2. Document the answer once discovered
3. Update `replit.md` if architecture changed

**This documentation is living.** Update it as the project evolves.
