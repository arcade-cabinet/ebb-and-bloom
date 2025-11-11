# AI System Hierarchy - Ebb & Bloom

**CRITICAL DISTINCTION:** This game has TWO fundamentally different AI systems that must NOT be confused.

## The Hierarchy

```
UNIVERSAL COORDINATES (Big Bang → Galaxy → System → Planet)
    ↓
PLANETARY LAYERS (Core → Mantle → Crust → Surface)
    ↓
CREATURE AI (Individual organism behavior - EVERY creature)
    ↓
RIVAL AI (Strategic governor-level - player competitors)
```

---

## 1. CREATURE AI (Individual Behavior)

**Applies to:** EVERY spawned creature in the game, including player's creatures

**Purpose:** Autonomous individual organism behavior

**Framework:** YUKA AI primitives (Goals, Evaluators, StateMachines, FuzzyLogic, SteeringBehaviors)

### Creature AI Questions:
- What is my environment?
- What is the day/night cycle?
- What is my level of cognition?
- What is my competency with tools?
- What are my survival needs?
- What are my social relationships?

### Creature AI Responsibilities:
- **Goal-driven behavior:** Hunger, safety, reproduction, exploration
- **Ranked interactions:** Weighing options (flee predator vs eat berry vs build shelter)
- **Tool use:** Learning, refinement, skill progression
- **Social behavior:** Communication, cooperation, conflict
- **Scheduling:** When to eat, sleep, migrate
- **State persistence:** Save exact state on despawn, "fast forward" on return

### Critical Rule:
**Player does NOT directly control evolution.** Player's creatures have the same autonomous AI as rival creatures. Player can only SUGGEST/STEER through indirect influence.

---

## 2. RIVAL AI (Strategic Competition)

**Applies to:** AI opponents competing at the PLAYER'S level

**Purpose:** Strategic species management (equivalent to human player)

**Framework:** YUKA governors using GovernorActionPort interface

### Rival AI Questions:
- What is the carrying capacity of my territory?
- Which predators threaten my species?
- Where should I nurture food sources?
- Should I form alliances or compete?
- When should I trigger migration?

### Rival AI Responsibilities:
- **Energy budget management:** Same constraints as player
- **Intent submission:** Uses GovernorActionPort (smitePredator, nurtureFood, etc.)
- **Law-constrained:** Cannot cheat - governed by same 57 scientific laws
- **Strategic competition:** Competes for resources, territory, evolutionary advantages

### Critical Rule:
**Rival AI uses SAME INTERFACE as player.** No cheating, no direct manipulation. Intents → Laws → Outcomes.

---

## 3. Tools & Structures (NOT separate AI)

**Tools and structures are FUNCTIONS of Creature AI synthesis, not independent systems.**

### Why Not Separate:
- Tools are higher-order synthesis BY creatures
- Structures emerge from creature learning and refinement
- Tool competency is a creature property, not tool property
- Tools don't "act" - creatures use tools through learned behavior

### Examples:
- **Spear:** Created by creature with synthesis capability → Used through creature's tool competency → Refined through creature's learning
- **Shelter:** Built by creature social cooperation → Maintained through creature behavior → Improved through cultural transmission

---

## 4. Static Organics (Vegetation AI)

**Applies to:** Trees, plants, fungi, etc.

**Purpose:** Growth, propagation, ecological interaction

### Vegetation AI Responsibilities:
- **Growth patterns:** Law-driven expansion based on nutrients, water, sunlight
- **Seed propagation:** Wind, animal dispersal, seasonal cycles
- **Resource competition:** Root systems, canopy competition
- **Ecological role:** Oxygen production, soil stabilization, food source

### Critical Distinction:
Vegetation has "movement" through propagation and growth, but NOT locomotion. Simpler AI than creatures, but still autonomous within ecological laws.

---

## Player Role: INDIRECT Influence

**Philosophy:** Player is a GOVERNOR, not a puppeteer

### What Player CAN Do:
- Submit intents through GovernorActionPort
- Spend energy budget on indirect influence
- Suggest evolutionary pressures
- Shape environment to encourage behaviors

### What Player CANNOT Do:
- Force evolutionary outcomes
- Directly control creature actions
- Break conservation laws
- Bypass energy costs
- Guarantee specific adaptations

### Example Scenarios:

**Scenario 1: Developing Fins**
- Player wants aquatic adaptation
- Player repeatedly nurtures food near water
- Player smites land predators
- **Possible Outcome A:** Creatures develop fins over generations
- **Possible Outcome B:** Creatures develop pathological fear of water
- **Laws determine which happens**

**Scenario 2: Tool Use**
- Player shapes terrain to expose flint deposits
- Player nurtures prey near sharp rocks
- **Possible Outcome A:** Creatures learn spear-making
- **Possible Outcome B:** Creatures ignore flint, use clubs instead
- **Creature AI + Learning laws determine outcome**

---

## State Management

### Creature AI State (Per Individual):
```typescript
{
  entityId: string,
  yukaBehaviorTree: YukaGoals[],
  knowledgeState: ToolCompetency[],
  socialBonds: CreatureRelationship[],
  scheduledActions: ActionQueue[],
  position: Vector3,
  physicalState: BiologicalState
}
```

### Rival AI State (Per Opponent):
```typescript
{
  governorId: string,
  species: SpeciesLineage,
  territory: SpatialBounds,
  energyBudget: number,
  strategicGoals: GovernorGoal[],
  actionHistory: GovernorIntent[]
}
```

### Despawn/Respawn:
When map area despawns, save ALL creature AI states. On return:
1. Load saved states
2. Run "fast forward" probability simulation
3. Generate HUD messages: "While you were away, Grok learned spear-throwing"
4. Restore creatures to current state

---

## Design Questions Framework

When designing ANY system, ask:

1. **Is this creature-level or governor-level?**
2. **Does this need autonomous AI, or is it law-driven?**
3. **Can this be a function of creature synthesis?**
4. **Does this respect the intent API philosophy?**
5. **Is this deterministic from seed phrase?**

If answers conflict with this hierarchy, redesign the system.
