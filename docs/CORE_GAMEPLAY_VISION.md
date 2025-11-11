# Ebb & Bloom - Core Gameplay Vision

**Version:** 1.0.0  
**Date:** November 11, 2025  
**Status:** **THIS IS THE ACTUAL GAME**

---

## THE FUNDAMENTAL DIFFERENCE

**This is NOT Daggerfall:**
- ❌ No medieval Britain
- ❌ No 150,000 pre-made dungeons/settlements/NPCs
- ❌ No exploring existing content
- ❌ Player is NOT a wandering adventurer

**This IS Ebb & Bloom:**
- ✅ **Start:** Primordial world (post-planetary formation, early Earth conditions)
- ✅ **You:** Play as EVOLUTION guiding ONE species
- ✅ **YUKA:** Autonomous governors guide ALL OTHER species
- ✅ **Goal:** Competitive resource race to transcendence
- ✅ **Gameplay:** Strategic evolution decisions vs autonomous life

---

## THE ACTUAL GAME LOOP

### Your Role: Evolution Director

**You guide ONE species through:**
1. **Origin** - Start as protozoa in primordial soup
2. **Survival** - Compete for resources with YUKA-controlled species
3. **Discovery** - Unlock archetypes from available materials
4. **Evolution** - Make strategic decisions at evolutionary pressure points
5. **Transcendence** - Guide your species from matter to consciousness

### YUKA's Role: Autonomous Life

**YUKA governors control EVERYTHING ELSE:**
- All other species (competitors, prey, predators)
- Environmental pressures
- Ecological dynamics
- Social dynamics
- **They evolve autonomously based on laws**

---

## COMPETITIVE EVOLUTION

### The Three Strategies

**1. Mutualism (Cooperation)**
```
Your species + Other species = Both benefit
Example: Pollination, symbiosis, alliance
Risk: Dependency, exploitation
```

**2. Parasitism (Exploitation)**
```
Your species benefits, Other species harmed
Example: Resource theft, predation, disease
Risk: Retaliation, extinction of host
```

**3. Competitive Exclusion**
```
Your species dominates niche, Other species excluded
Example: Outcompete for food, territory, mates
Risk: YUKA species adapt, environmental collapse
```

### Resource Race

**You compete for:**
- **Materials:** SiO2, wood, metals (limited by geology)
- **Energy:** Food, sunlight, chemical gradients
- **Space:** Territory, niches, habitats
- **Time:** Evolutionary advantage, technology first

**YUKA species compete too:**
- They evolve speed when you evolve size
- They form packs when you become solitary
- They migrate when you dominate their niche
- **They adapt to YOUR decisions**

---

## SYNTHESIS SYSTEMS = ARCHETYPE GENERATORS

### NOT Exploration, DISCOVERY

**Traditional games:**
```
Developer creates 150,000 dungeons
↓
Player explores pre-made content
```

**Ebb & Bloom:**
```
Player's environment contains SiO2
↓
MolecularSynthesis reveals: FLINT is POSSIBLE
↓
Player decides: Evolve tool use? (costs resources)
↓
StructureSynthesis generates: STONE AXE archetype
↓
Stone axe unlocks: Woodcutting capability
```

### Archetype Discovery Flow

**1. MolecularSynthesis** - "What CAN exist here?"
```typescript
environment.materials = ["SiO2", "CaCO3", "Fe2O3"]
↓
MolecularSynthesis.discover(materials)
↓
Available archetypes: [FLINT, LIMESTONE, IRON_ORE]
```

**2. StructureSynthesis** - "What can we BUILD?"
```typescript
unlocked_materials = [FLINT, WOOD]
↓
StructureSynthesis.combine(materials)
↓
Possible tools: [STONE_AXE, FLINT_KNIFE, SPEAR]
```

**3. BiologyGovernor** - "How should we ADAPT?"
```typescript
environmental_pressure = PREDATOR_THREAT
↓
BiologyGovernor.offerPaths(pressure)
↓
Evolution options:
  - Increase SPEED (escape predators)
  - Increase SIZE (intimidate predators)
  - Evolve CLAWS (fight predators)
  - Form PACKS (cooperate for defense)
```

**4. SocialGovernor** - "What EMERGES from population?"
```typescript
population = 150  // Exceeds Dunbar's number threshold
carrying_capacity = EXCEEDED
↓
SocialGovernor.forcedEmergence()
↓
SETTLEMENT archetype MUST form (not optional)
```

---

## STARTING POINT: PRIMORDIAL WORLD

### Gen0: Planetary Formation (You Watch)
```
Big Bang → Star formation → Planet accretion
↓
Result: Young Earth-like planet
  - Molten surface cooling
  - Atmosphere forming
  - Oceans condensing
  - Chemistry stabilizing
```

### Gen1: Abiogenesis (You Begin)
```
Primordial soup conditions
↓
Player spawns as: PROTOZOA
  - Metabolism: Chemosynthesis
  - Size: Microscopic
  - Complexity: Single cell
  - Goal: Survive, reproduce, evolve
↓
YUKA spawns: Other primordial life
  - Competing for same chemical gradients
  - Some become predators
  - Some become symbiotes
  - ALL evolving autonomously
```

**THIS IS TURN 1. Not medieval Britain.**

---

## GENERATIONAL PROGRESSION

### Gen1-2: Cellular Evolution
- **Your Decisions:** Metabolism type, reproduction strategy, defenses
- **YUKA Response:** Other cells adapt, specialize, compete
- **Discoveries:** Photosynthesis, predation, multicellularity
- **Goal:** Survive long enough to evolve complexity

### Gen3-5: Multicellular Life
- **Your Decisions:** Body plan, sensory systems, locomotion
- **YUKA Response:** Predator/prey arms race, niche filling
- **Discoveries:** Eyes, limbs, nervous systems
- **Goal:** Dominate ecological niche

### Gen6-10: Tool Use
- **Your Decisions:** Which materials to use, what tools to make
- **YUKA Response:** Other species may steal tools, trade, compete
- **Discoveries:** Stone tools → Fire → Shelter → Agriculture
- **Goal:** Unlock settlement archetypes

### Gen11-20: Civilization
- **Your Decisions:** Governance type, resource allocation, expansion
- **YUKA Response:** Other tribes form, alliances/wars emerge
- **Discoveries:** Writing → Mathematics → Science
- **Goal:** Discover the laws we're using

### Gen21+: Transcendence
- **Your Decisions:** Upload consciousness, colonize space, transcend matter
- **YUKA Response:** Other civilizations reach same point, competition for stars
- **Discoveries:** FTL travel, AI, post-biological existence
- **Goal:** Transcend the material plane

---

## WHY THIS WORKS

### 1. Every Game is Unique
**Same seed = Different gameplay**
- Geology determines available materials
- Your decisions create unique evolutionary path
- YUKA species respond dynamically
- No two playthroughs identical

### 2. Genuine Emergence
**Nothing is pre-scripted:**
- Materials unlock archetypes based on chemistry
- Tools enable capabilities based on physics
- Settlements emerge from population math
- Science discovery based on cognitive capacity
- **All computed from laws, not hardcoded**

### 3. Strategic Depth
**Every decision matters:**
- Evolve speed → Can't evolve size (trade-off)
- Make stone axes → Wood becomes scarce (depletion)
- Form settlement → Predators attack (concentration)
- Discover fire → Other species scared away (consequences)

### 4. No Content Limits
**Infinite replayability:**
- Not exploring 150,000 pre-made dungeons
- Discovering infinite archetypes from laws
- Every seed creates new evolutionary challenges
- YUKA ensures every playthrough feels alive

---

## DAGGERFALL BRIDGE ARCHITECTURE

### What We Keep from DFU
**Spawner logic** - The CODE is good:
- ChunkManager streaming (7x7 grid)
- Settlement placement algorithms
- Building generation systems
- NPC behavior patterns

### What We Replace from DFU
**Hardcoded data** - MAPS.BSA, BLOCKS.BSA, etc.:
```
OLD (Daggerfall):
population = MAPS.BSA.lookup(regionID)  // Hardcoded

NEW (Ebb & Bloom):
population = EcologyGovernor.calculateCarryingCapacity(biome, resources)
settlement_type = SocialGovernor.determineGovernanceType(population)
```

**Key Insight:** DFU's spawners work great when fed COMPUTED data instead of HARDCODED data.

---

## DEMO REFRAMING

### Demo01: Archetype Discovery
**Old:** "Look at this flint"  
**New:** "Environment contains SiO2 → Flint archetype UNLOCKED"

**Shows:** Materials reveal possibilities

### Demo02: Archetype Combination
**Old:** "Here's a stone axe"  
**New:** "Flint + Wood discovered → Stone axe archetype GENERATED"

**Shows:** Composite tools from available materials

### Demo03: Evolutionary Pressure
**Old:** "Watch evolution happen"  
**New:** "Predator threatens → Evolve: Speed? Size? Claws? Cooperation?"

**Shows:** Player choices drive evolution path

### Demo04: Emergent Complexity
**Old:** "Here's a settlement"  
**New:** "Population hits 150 → Settlement MUST emerge (carrying capacity exceeded)"

**Shows:** Laws force emergence, not player choice

---

## CRITICAL DISTINCTIONS

| Daggerfall | Ebb & Bloom |
|-----------|-------------|
| Medieval Britain | Primordial Earth |
| 150,000 pre-made locations | Infinite procedural archetypes |
| Player explores existing world | Player guides evolution |
| Static NPCs with schedules | YUKA autonomous species |
| Hardcoded quests | Emergent survival pressures |
| Level up character | Evolve entire species |
| Kill enemies for XP | Compete for resources |
| End goal: Complete quests | End goal: Transcendence |

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Loop (Demos)
1. **Demo01:** Material discovery → Archetype unlock
2. **Demo02:** Tool combination → Capability unlock
3. **Demo03:** Evolutionary pressure → Decision tree
4. **Demo04:** Population threshold → Forced emergence

### Phase 2: Competitive Evolution
1. **YUKA Species:** Spawn autonomous competitors
2. **Resource System:** Limited materials, energy, space
3. **Adaptation:** YUKA responds to player decisions
4. **Strategies:** Enable mutualism/parasitism/exclusion

### Phase 3: Full Timeline
1. **Gen0:** Watch planet form
2. **Gen1:** Spawn as protozoa
3. **Gen2-20:** Strategic evolution gameplay
4. **Gen21+:** Transcendence endgame

---

**THIS IS THE GAME.**

Not Daggerfall.  
Not exploration.  
**Competitive evolution with YUKA as your opponent/partner.**

🧬 **YOU = Evolution**  
🤖 **YUKA = All Other Life**  
🌍 **World = Resource Battlefield**  
🎯 **Goal = Transcendence**
