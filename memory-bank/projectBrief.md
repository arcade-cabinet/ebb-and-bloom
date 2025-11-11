# Ebb & Bloom - Project Brief

**Created:** November 11, 2025  
**Version:** 1.0 - Phase 3 Complete

---

## Project Vision

Build a **competitive evolution game** where you guide ONE species from Big Bang to transcendence while competing against YUKA-controlled autonomous species for resources.

**Three-Word Philosophy:** "Everything is a squirrel"  
Complete scientific rigor with total material provenance from cosmic origins.

---

## Core Requirements

### Gameplay Requirements

1. **Competitive Evolution (Not Sandbox)**
   - Player vs YUKA rival species
   - First species to transcend wins
   - Real strategic competition, not exploration

2. **Indirect Influence (Not Direct Control)**
   - Player is a GOVERNOR, not puppeteer
   - Actions: smite predators, nurture food, shape terrain
   - Creatures respond autonomously (player cannot force evolution)

3. **Scientific Rigor (Not Fantasy)**
   - 57 scientific laws govern ALL systems
   - Conservation laws enforced (mass, charge, energy)
   - Deterministic generation (same seed = same universe)

4. **Fair Competition (No AI Cheating)**
   - Player and AI use SAME interface (GovernorActionPort)
   - Same energy budgets, same constraints
   - Laws determine outcomes (not intent source)

---

### Technical Requirements

1. **Mobile-First Platform**
   - Primary: Android via Capacitor
   - Dev server for testing only
   - Leverage all sensors (gyroscope, accelerometer, haptics)

2. **Deterministic Generation**
   - 3-word seed phrase → Entire universe
   - Same seed ALWAYS produces identical:
     - Universal coordinates
     - Galaxy age and metallicity
     - Planetary structure
     - Material locations
     - Life emergence probability

3. **Complete Provenance Chain**
   - Big Bang → Dark Matter Web → Pop III Stars → Supernova → Galaxy → Molecular Cloud → Stellar Furnace → Planetary Accretion → Surface
   - Every material traces back to cosmic origin
   - Kill fox = fox parts with cosmic lineage

4. **Multi-Scale Simulation**
   - Quantum → Atomic → Molecular → Material → Structural → Organismal → Population → Cosmic
   - ECS architecture supports all scales

---

## Technical Constraints

### Must Use
- **ECS:** Miniplex (archetype-based, TypeScript-native)
- **AI Framework:** YUKA (Goals, StateMachines, SteeringBehaviors, FuzzyLogic)
- **3D Engine:** Three.js + React Three Fiber
- **State:** Zustand (lightweight, no boilerplate)
- **Build:** Vite (fast, modern)
- **Language:** TypeScript 5.7 targeting ES2023
- **Mobile:** Capacitor 7.x

### Must Not Use
- No prefabs (everything generated from laws + chemistry)
- No hardcoded medieval content (DFU logic only, not content)
- No virtual environments (Replit uses Nix, no Docker)
- No separate AI for tools/structures (they're creature synthesis)

---

## Success Criteria

### Gameplay Success
- [ ] Player can guide species from protozoa to transcendence
- [ ] YUKA rivals provide genuine strategic challenge
- [ ] Evolutionary outcomes feel emergent (not forced)
- [ ] Mobile controls feel natural (tilt, tap, hold)

### Technical Success
- [ ] Same seed produces identical universe across sessions
- [ ] Conservation laws never violated
- [ ] Player and AI have provably equal constraints
- [ ] Zero LSP errors, zero runtime errors
- [ ] Runs smoothly on Android (60fps minimum)

### Documentation Success
- [ ] Memory Bank enables perfect AI handoffs
- [ ] READMEs are standalone (no memory-bank references)
- [ ] docs/ preserve critical design decisions
- [ ] New developers can onboard from docs alone

---

## Non-Goals

**This is NOT:**
- Minecraft (creative sandbox) - It's competitive strategy
- Spore clone (direct creature control) - It's indirect governor influence
- Daggerfall Unity port - We use DFU patterns, not DFU content
- Pure simulation - It's a GAME with win/loss conditions
- Desktop-first - Mobile is primary platform

---

## Scope Boundaries

### In Scope
- Competitive evolution from abiogenesis to transcendence
- YUKA rival governors using same tools as player
- Complete cosmic provenance (Big Bang → materials)
- Mobile sensors (gyroscope, accelerometer, haptics)
- Deterministic generation from 3-word seed

### Out of Scope
- Multiplayer (AI rivals only)
- Modding/scripting (game is complete as-is)
- VR/AR (mobile touchscreen + sensors)
- Procedural music (use libraries)
- Procedural audio (use libraries)

---

## Project Timeline

### Completed Phases
- ✅ **Phase 1:** Unified GameState (RNG → Genesis → Timeline → ECS)
- ✅ **Phase 2:** 11 Law Systems integrated
- ✅ **Phase 3:** Intent API (Player & AI equality)

### Remaining Phases
- ⏳ **Phase 4:** Delete obsolete generators, implement Creature AI
- ⏳ **Phase 5:** Rival AI governors, competitive gameplay
- ⏳ **Phase 6:** Planetary accretion system, FMV integration
- ⏳ **Phase 7:** Material synthesis, technology progression
- ⏳ **Phase 8:** Mobile polish, sensor integration
- ⏳ **Phase 9:** Performance optimization, Android testing
- ⏳ **Phase 10:** Production deployment, App Store release

---

## Critical Principles

### "Everything is a Squirrel"
When you kill a fox, you get:
- Fox meat (with element composition from cosmic metallicity)
- Fox bones (calcium from supernova nucleosynthesis)
- Fox fur (carbon chains from stellar fusion)

**Not:** Generic "meat" item. ACTUAL atoms with full cosmic lineage.

### Intent-Based Competition
Player wants to kill predator:
```typescript
const intent = { action: 'smite_predator', target: wolfId };
await gameState.executeGovernorIntent(intent);
// Laws determine if wolf dies, player doesn't control outcome
```

Rival AI wants to kill player's creature:
```typescript
const rivalIntent = { action: 'smite_predator', target: playerCreatureId };
await gameState.executeGovernorIntent(rivalIntent);
// SAME FUNCTION, SAME LAWS, SAME CONSTRAINTS
```

### Deterministic Emergence
```
Seed: "v1-bright-island-melt"
  → Universal coordinates: (42.7, -18.3, 91.2)
  → Galaxy age: 8.2 billion years
  → Metallicity: 0.82 (high)
  → Available elements: Full periodic table
  → Tech ceiling: Atomic weapons possible
  
Seed: "v1-dark-void-death"
  → Universal coordinates: (2.1, 0.4, 1.8)
  → Galaxy age: 1.1 billion years
  → Metallicity: 0.03 (low - early universe)
  → Available elements: H, He, C, O, N only
  → Tech ceiling: Stone/wood tools only
```

**Same seed = same universe. Always. Test it.**

---

## Key References

- **Design Docs:** See `docs/AI_HIERARCHY.md`, `COSMIC_PROVENANCE.md`, `INTENT_API_PHILOSOPHY.md`
- **Architecture:** See `memory-bank/systemPatterns.md`
- **Tech Stack:** See `memory-bank/techContext.md`
- **Current Work:** See `memory-bank/activeContext.md`
- **Progress:** See `memory-bank/progress.md`

---

**Last Updated:** November 11, 2025 - Phase 3 Complete
