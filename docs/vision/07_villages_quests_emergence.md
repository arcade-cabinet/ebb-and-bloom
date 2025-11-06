# Stage 07: Villages, Quests, and Emergence

**Context from Chat Replay**: Lines ~2600-2700 (Combat introduction, pack quests)  
**Key Evolution**: Static world → Emergent villages and quests from simulation rules

---

## Intent & Player Fantasy

Villages, quests, wildlife, and biomes emerge from simulation rules—not scripts. The world generates content dynamically based on player actions, pollution levels, and behavior profiles. No hand-authored quest chains; instead, procedural emergence creates unique experiences.

---

## Mechanics & Systems

### Village Emergence

**How Villages Form**:
- High harmony playstyle → Symbiotic settlements emerge
- High conquest playstyle → Fortified outposts spawn
- High frolick playstyle → Whimsical camps appear
- Pollution thresholds → Mutated settlements (void-touched villages)

**Village Types** (Procedural):
- **Harmony Villages**: Cooperative, gift resources, offer peaceful quests
- **Conquest Villages**: Fortified, trade for ore, offer raid quests
- **Frolick Villages**: Whimsical, cosmetic rewards, exploration quests
- **Void Villages**: Corrupted, dangerous, offer high-risk/high-reward quests

**Emergence Rules**:
- Density of player actions in area
- Resource availability (ore-rich areas → mining villages)
- Pollution levels (high pollution → void villages)
- Behavior profile (harmony → peaceful, conquest → aggressive)

### Quest System

**Pack Quest System** (Mobile-native feature):
- Maturity + loyalty mechanics
- Dispatch packs on missions
- Success/failure with consequences
- Redemption arcs for failed quests

**Quest Types** (Emergent):
- **Resource Quests**: Gather X resources (scales with demand)
- **Exploration Quests**: Discover new biomes (procedural generation)
- **Combat Quests**: Defeat grudge-born wraiths (combat system)
- **Trade Quests**: Exchange resources with villages

**Quest Generation**:
- Based on village type
- Scales with player progression
- Adapts to behavior profile
- No fixed quest chains—all procedural

---

## Worldgen & Ecology

**Village Placement**:
- Procedural generation based on:
  - Biome type (forests → wood villages, rivers → fishing villages)
  - Resource density (ore-rich → mining villages)
  - Player activity (frequent terraforming → settlement spawns)
  - Pollution levels (high pollution → void villages)

**Village Evolution**:
- Villages grow/shrink based on player interaction
- High trade → Village expands
- Neglect → Village decays
- Pollution → Village mutates (void-touched)

**NPC Behavior**:
- Yuka-driven AI for villagers
- Behavior mirrors player playstyle
- Harmony players → Cooperative NPCs
- Conquest players → Aggressive NPCs

---

## Progression & Economy

**Village Economy**:
- Trade resources with villages
- Complete quests for rewards
- Build reputation (affects quest availability)
- Unlock new village types through progression

**Quest Rewards**:
- Resources (scaled to quest difficulty)
- Trait unlocks (rare traits from high-tier quests)
- Cosmetic items (frolick playstyle)
- World knowledge (reveal new biomes, resources)

**Reputation System**:
- Track player actions with each village type
- High reputation → Better quests, better prices
- Low reputation → Hostile villages, harder quests

---

## UX/Camera/Controls

**Village Interaction**:
- Touch to enter village
- Swipe to navigate village (if 3D raycast)
- Tap to talk to NPCs
- Long-press to view quest board

**Quest UI**:
- Modal with quest list
- Tap to accept quest
- Progress tracking (visual indicators)
- Completion rewards (toast notifications)

**Pack Dispatch**:
- Long-press pack → Dispatch menu
- Select quest → Pack departs
- Timer-based completion (2-3 minutes)
- Return notification (success/failure)

---

## Technical Direction

**Village Generation**:
```ts
interface Village {
  type: 'harmony' | 'conquest' | 'frolick' | 'void';
  position: { x: number; y: number };
  population: number;
  reputation: number;
  quests: Quest[];
}

function generateVillage(
  biome: BiomeType,
  pollution: number,
  behavior: BehaviorProfile
): Village {
  // Procedural generation based on context
  const type = determineVillageType(biome, pollution, behavior);
  const quests = generateQuests(type, behavior);
  return { type, position, population, reputation: 0, quests };
}
```

**Quest System**:
```ts
interface Quest {
  id: string;
  type: 'resource' | 'exploration' | 'combat' | 'trade';
  objective: QuestObjective;
  reward: QuestReward;
  difficulty: number;
}

function generateQuests(
  villageType: VillageType,
  behavior: BehaviorProfile
): Quest[] {
  // Procedural quest generation
  // Scales with player progression
  // Adapts to behavior profile
}
```

---

## Scope/Constraints

**Performance**:
- Limit active villages (e.g., 5-10 per world)
- Lazy-load village data (only when player approaches)
- Cache quest generation (don't regenerate every frame)

**Content**:
- Procedural generation (no hand-authored quests)
- Scale with player progression
- Adapt to behavior profile
- Infinite variety (no repetition)

---

## Decision Log

- ✅ **Emergent > Scripted**: Villages and quests emerge from simulation rules
- ✅ **Behavior-Driven**: Village types adapt to player playstyle
- ✅ **Procedural Generation**: No hand-authored content, infinite variety
- ✅ **Pack Quest System**: Mobile-native feature (dispatch packs on missions)
- ✅ **Reputation System**: Track player actions, affect quest availability
- ⚠️ **Deferred**: Full implementation pending combat system

---

## Open Questions

- How do villages spawn initially? (Seed-based vs. player-triggered)
- Quest difficulty scaling (how aggressive should it be?)
- Village persistence (do villages persist across sessions?)
- Multi-village interactions (trade routes, conflicts?)
- NPC dialogue system (procedural vs. templates?)

---

**Next Stage**: World hopping and continuity systems

