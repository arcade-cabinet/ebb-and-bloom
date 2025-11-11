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
- ✅ **You:** Play as a GOVERNOR guiding ONE SPECIES (not one creature)
- ✅ **YUKA:** Autonomous governors guide ALL OTHER SPECIES
- ✅ **Goal:** Competitive resource race to transcendence
- ✅ **Gameplay:** Indirect environmental influence - creatures respond autonomously

**Why not control one creature?**
- First mating → You'd have 2+ creatures (which one do you control?)
- First tribe → You'd have 50+ creatures (control becomes meaningless)
- Civilization → Thousands of individuals (impossible to control)
- **You're guiding a LINEAGE through time, not controlling individuals**

---

## THE ACTUAL GAME LOOP

### Your Role: The Player-Governor

**You ARE a governor** - Using the SAME tools YUKA has, but guiding ONE SPECIES (all individuals in that lineage):

**NOT direct control:**
- ❌ You can't click on one creature and say "go mate"
- ❌ You can't tell individuals what to do
- ❌ You can't control them like RTS units
- ❌ You can't instantly make them powerful

**WHY species, not creature:**
- Gen1: You have 10 cells → Which one would you control?
- Gen5: You have 100 creatures → Controlling one is meaningless
- Gen10: You have 1000+ tribe members → Individual control impossible
- **You guide the WHOLE LINEAGE through environmental pressures**

**INDIRECT influence** - Primordial creator powers (all law-constrained):
- ⚡ **Smite:** Lightning strikes to clear predators (costs energy, follows physics)
- 🌱 **Nurture:** Increase food abundance (limited by carrying capacity law)
- 🔥 **Pressure:** Introduce environmental stress (triggers adaptation responses)
- 🌊 **Shape:** Alter terrain, water, climate (within thermodynamic constraints)

**You use GOVERNOR TOOLS (law-bounded):**
- Same decision space as YUKA governors
- **SAME 57 laws apply to you** - Can't violate physics, biology, ecology
- Environmental manipulation, NOT direct creature commands
- Actions cost resources (energy budget per generation)
- Your creatures respond autonomously to the pressures YOU create
- **You can't just "win instantly" - laws prevent that**

### YUKA's Role: Autonomous Life

**YUKA governors control EVERYTHING ELSE:**
- All other species (competitors, prey, predators)
- Their environmental responses
- Ecological dynamics
- Social dynamics
- **They have the SAME tools you do**

---

## COMPETITIVE EVOLUTION

### The Three Strategies

**1. Mutualism (Cooperation)**
```
You create conditions → Your species + Others cooperate
Example: Increase flowering plants → Pollination emerges
Your action: Shape environment to favor symbiosis
Law constraint: Carrying capacity must support both species
```

**2. Parasitism (Exploitation)**
```
You create pressure → Your species parasitizes others
Example: Reduce prey defenses → Predation emerges
Your action: Weaken competitors, strengthen yours
Law constraint: Host species can't go extinct (ecological collapse)
```

**3. Competitive Exclusion**
```
You dominate niche → Other species excluded
Example: Increase resource abundance in your territory
Your action: Environmental advantages for your species
Law constraint: YUKA governors adapt their species in response
```

### Resource Race (All Law-Constrained)

**You compete for (finite resources):**
- **Materials:** SiO2, wood, metals (GeologyLaw: limited by planetary composition)
- **Energy:** Food, sunlight (ThermodynamicsLaw: energy conservation)
- **Space:** Territory, niches (CarryingCapacityLaw: population limits)
- **Time:** Evolutionary advantage (EvolutionLaw: mutation rates fixed)

**Your governor powers cost energy:**
- Lightning strike: 1000 energy units
- Increase food: 500 energy/generation
- Shape terrain: 2000 energy
- **Energy budget regenerates slowly (law-based)**

**YUKA governors compete identically:**
- They can smite YOUR species with lightning
- They can nurture THEIR species with food
- They use the SAME energy budget constraints
- **Fair competition - same rules, same tools**

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
Player governor assigned to: PROTOZOA SPECIES
  - Population: 10 cells initially
  - Metabolism: Chemosynthesis
  - Size: Microscopic
  - They reproduce autonomously (you don't control mating)
  - They move autonomously (you don't control movement)
  - YOU shape their environment (food, temperature, predators)
↓
YUKA governors assigned to: Other species
  - Each YUKA governor controls a competing species
  - They use same environmental tools as you
  - All creatures behave autonomously
  - Governors compete through indirect influence
```

**THIS IS TURN 1. Not medieval Britain. Not creature control. SPECIES guidance.**

---

## GENERATIONAL PROGRESSION

### Gen1-2: Cellular Evolution
- **Your Governor Actions:** Increase chemical gradients near your cells (costs energy)
- **Your Creatures' Response:** They autonomously evolve chemosynthesis, reproduce faster
- **YUKA Governor Actions:** They increase pH in their territory, their cells adapt
- **Emergent Result:** Niche separation OR competition (creatures decide, not you)
- **Goal:** Keep your lineage alive long enough to get multicellular

### Gen3-5: Multicellular Life
- **Your Governor Actions:** Strike predators with lightning (1000 energy), increase food plants
- **Your Creatures' Response:** They autonomously evolve size (less predation pressure felt)
- **YUKA Governor Actions:** They nurture THEIR predators, increase prey defenses
- **Emergent Result:** Arms race - you can't just "make them win", laws constrain both sides
- **Goal:** Achieve stable population above carrying capacity threshold

### Gen6-10: Tool Use
- **Your Governor Actions:** Create SiO2 deposits near your species (geology law: must exist naturally)
- **Your Creatures' Response:** They discover flint, MAYBE evolve tool use (not guaranteed!)
- **YUKA Governor Actions:** They create wood abundance for THEIR species
- **Emergent Result:** If your species evolves tool use first = advantage, but costs energy
- **Goal:** Get stone tools before YUKA species do

### Gen11-20: Civilization
- **Your Governor Actions:** Create fertile plains (carrying capacity boost), reduce predators
- **Your Creatures' Response:** Population grows → Settlement emerges (Dunbar's Law forces it)
- **YUKA Governor Actions:** They create river valleys, their tribes form simultaneously
- **Emergent Result:** Multiple civilizations emerge, alliances/wars autonomous
- **Goal:** Reach science before resource depletion

### Gen21+: Transcendence
- **Your Governor Actions:** You've spent all energy budget - now just observe
- **Your Creatures' Response:** They discover the 57 laws, understand they're in a simulation
- **YUKA Governor Actions:** Same - other civs reach this point independently
- **Emergent Result:** First civilization to transcend wins, but it's their choice, not yours
- **Goal:** Hope your nurturing was enough

---

## WHY THIS WORKS

### 1. Fair Competition
**Player = Governor, bound by same laws as YUKA:**
- You can't violate physics, biology, ecology - same as YUKA
- Energy budget prevents spamming powers - same as YUKA
- Indirect influence only - same as YUKA
- **It's a strategy game, not a god simulator**

### 2. Genuine Challenge
**You can't just "win instantly":**
- Lightning costs 1000 energy, budget regenerates slow
- Creatures respond autonomously, don't obey commands
- YUKA governors adapt to YOUR strategies in real-time
- Laws create hard constraints (carrying capacity, thermodynamics)
- **Your species might go extinct despite your best efforts**

### 3. Primordial Powers = Engaging Gameplay
**Indirect influence creates interesting decisions:**
- "Smite predators or nurture food?" (energy budget choice)
- "Shape terrain for defense or offense?" (territory strategy)
- "Increase food now or save energy for crisis?" (resource management)
- "Help competitors (mutualism) or sabotage (parasitism)?" (strategy choice)

### 4. Emergent Storytelling
**Every playthrough tells a unique story:**
- Your species might form symbiosis you didn't plan
- YUKA species might steal your tool innovations
- Climate changes you create might backfire
- Your nurturing might make them dependent (bad for transcendence)
- **Creatures have agency - you're just shaping pressures**

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

| Traditional RPG | Ebb & Bloom |
|-----------|-------------|
| Control one character | Guide entire species (all individuals) |
| Click to move/attack | Shape environment (indirect influence) |
| Level up stats | Species evolves autonomously |
| Medieval Britain | Primordial Earth |
| 150,000 pre-made locations | Infinite procedural archetypes |
| Static NPCs with schedules | YUKA autonomous species |
| Kill enemies for XP | Compete for resources via environment |
| End goal: Complete quests | End goal: First species to transcend |

| God Simulator | Ebb & Bloom |
|-----------|-------------|
| Omnipotent powers | Law-constrained governor powers |
| Unlimited mana/energy | Finite energy budget per generation |
| Direct commands to units | Indirect environmental influence |
| Can violate physics | Must obey 57 scientific laws |
| Always win eventually | Your species CAN go extinct |
| Control outcome | Creatures decide outcome autonomously |

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
