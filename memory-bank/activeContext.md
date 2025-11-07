# Active Context

**Last Updated**: 2025-01-09

---

## VISION CLARITY: Resource Race, Not 4X

**The Game**:
- World starts → race begins
- Resources are finite (what the planet is made of)
- Evolve creatures, develop tools, expand tribe → settlement → civilization
- Compete against other tribes (Yuka-driven AI)
- Multiple ending paths based on playstyle

**Victory = Speed + Strategy**:
- How FAST you reach endgame
- Which PATH you took (conquest, harmony, mutualism)
- Internal metrics track playstyle → determine ending
- NO punishment for playstyle, just different endings

**Three Ending Types**:
1. **Mutualism** - Unity with all other tribes
2. **Parasitism** - Subjugate all tribes as workers
3. **Domination** - Eliminate all other tribes

**After ending**: Option to keep playing (no score) or end game

---

## What Makes It a Game (Not Simulation)

### Yuka Needs GOALS Per Generation

**Gen 1-3**: "Survive" → Gather resources, avoid threats  
**Gen 4-7**: "Establish" → Form tribe, claim territory  
**Gen 8-12**: "Expand" → Found settlement, develop tools  
**Gen 13-20**: "Compete** → Conquer/ally/subjugate rival tribes  
**Gen 20+**: "Dominate" → Achieve one of three endings

### Event Messaging System

**Discovery events**:
- "You have discovered [material]"
- "RECORDER tools unlocked"
- "Bronze synthesis achieved"

**Social events**:
- "[Tribe name] has formed"
- "[Leader name] elected/crowned"
- "[Settlement name] founded"

**Conflict events**:
- "[Tribe A] conquered [Tribe B]"
- "[Tribe A] allied with [Tribe B]"
- "[Leader] declared war"

**Governance events**:
- "Democracy established"
- "Despotic rule begins"
- "Religious theocracy formed"

### World Score Tracking

**Track internally** (multiple rubrics):
- Violence score (hunts, kills, conquests)
- Harmony score (alliances, mutualism, balance)
- Exploitation score (resource depletion, pollution)
- Innovation score (tool discoveries, tech advancement)
- Speed score (generations to milestones)

**At endgame**: Present dominant playstyle + score

---

## ECS/Yuka Integration Strategy

### Archetypal Actions (AI-Generated)

**For each raw material** → Generate Yuka task:
- "Collect wood", "Mine copper", "Gather water"
- Taxonomically applies to ALL synthetic mutations

**For each creature archetype** → Generate Yuka goals:
- Hunt [archetype] → Applies to all mutations (gummy bear, bone lizard, etc.)
- Decompose [archetype] → Extract parts based on synthesis

**For each tool type** → Generate Yuka capabilities:
- Use EXTRACTOR → Derived from properties
- Craft with ASSEMBLER → Derived from properties

### Division of Responsibility

**ECS Systems/Components**:
- Core mechanics (evolution, synthesis, decomposition)
- Physics simulation (gravity, movement, collisions)
- Rendering (meshes, materials, lighting)

**AI-Generated Manifests**:
- Goal trees per generation
- Task definitions per material/archetype
- Event messaging templates
- Fuzzy logic rules

**Yuka**:
- Execute goals (FuzzyModule, GoalEvaluator, CompositeGoal)
- Make tactical decisions (which task to do)
- Navigate world (steering behaviors)
- Communicate (MessageDispatcher)

---

## Current State: Completely Broken

**Critical errors preventing ANY assessment**:
- `Platform` undefined (multiple locations)
- `useEvolutionDataStore` undefined
- GestureActionMapper crashes
- Textures setup but not loading properly
- WebGL context lost
- 31 linter errors
- 8/89 tests failing

**Result**: Game never renders. Cannot assess look/feel/vision alignment.

---

## Priority

**STOP trying to fix broken code.**

**START**:
1. Define clear goal trees per generation
2. Design event messaging system
3. Design world score tracking (violence, harmony, exploitation, innovation, speed)
4. Design three endings (mutualism, parasitism, domination)
5. Map archetypal actions to Yuka tasks
6. THEN implement properly

**The vision is clear now. The implementation is garbage. Need clean foundation with Gen 0 + proper Yuka integration.**

