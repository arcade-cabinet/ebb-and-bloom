# Stage 06: Materials to Alloys Crafting

**Context from Chat Replay**: Lines ~98-120 (Resource snapping expansion)  
**Key Evolution**: Basic snapping → Infinite scaling resource web

---

## Intent & Player Fantasy

Turn gathering into a fractal puzzle. Basic ores snap to waters for alloys, but layer in power and wood for exponential chains. It scales *with you*, not against: As your creature evolves, the world Yuka-profiles your demands and "offers" permutations. Infinite complexity emerges from finite rules.

---

## Mechanics & Systems

### Resource Snapping Mechanics

**The Snap Grid**:
- Resources as ECS components on tiles/entities
- "Affinity Tags" (e.g., Ore: {heat: 2, flow: -1}, Water: {flow: 3, bind: 1})
- Snapping happens via proximity queries in BitECS
- Place an ore tile next to water? Auto-snap into "Mud Alloy"
- No manual crafting UI—it's magnetic, like your tile rules

**Permutation Engine**:
- Simple procedural combinator (noise-seeded) generates "recipes" on-the-fly
- Base Layer: 5-7 primitives (Ore, Wood, Water, Power)
- Combinatorial Explosion: Each snap adds a "Demand Multiplier"
- Infinite Scaling: As you demand more, the system "responds" by evolving supply

### Player-Driven Growth Loop

**Need → Response**:
- Track "Demand Vectors" in creature's ECS (e.g., {oreNeed: 5, powerDrain: 2})
- Exceed thresholds? World auto-expands snaps
- Carve deep? Underground aquifers "bleed" water veins toward your ops

**Trait Synergies**:
- Evo Points unlock snap bonuses
- Flipper Feet: +flow affinity, easing water chains
- Drill Arms: Reveals hidden permutations via mini-map pings

**Ecosystem Feedback**:
- Critters "participate"
- Evolved beavers dam wood for your flows (harmony boost)
- Burrow ore thieves if conquest-heavy (adding defensive snaps like trap alloys)

---

## Worldgen & Ecology

**Yuka Evaluation**:
- If conquest: Biases toward high-yield chains (wood → charcoal → power loops)
- If harmony: Snaps favor sustainable loops (water + plants → hydro-wood that self-regrows)

**Scaling with Player Growth**:
- Basic tool: 1 ore + 1 wood
- Mid-game forge: 4 ore + 2 water + 1 power/hour
- Mega-forge: 10x inputs → World evolves supply (vein clusters, sub-permutations)

**Pollution Integration**:
- High demand = faster shocks
- Snaps "corrupt" (alloy turns brittle, forcing hybrid fixes)
- Wood-insulated wiring as defensive snap

---

## Progression & Economy

**Infinite Scaling**:
- Start simple (3-snap chains)
- Unlock complexity via evos
- UI: Faint glow-lines on potential snaps
- Tooltips: "This ore hungers for flow—nearby river?"

**Avoiding Overwhelm**:
- Start simple (3-snap chains)
- Unlock complexity via evos
- UI: Faint glow-lines on potential snaps
- Tooltips: "This ore hungers for flow—nearby river?"
- Keeps frolickers optional (snaps passive), scalers hooked

**The Thrill**:
- Scaling to absurdity: Planet-sized forge demanding orbital power
- Evolved solar sails from fabric snaps
- World countering with asteroid shocks that rain exotic ores
- Your growth *begets* the world's, in a beautiful arms race

---

## UX/Camera/Controls

**Visual Feedback**:
- Faint glow-lines on potential snaps
- Tooltips: "This ore hungers for flow—nearby river?"
- Particle bursts on snap (blue wisps for flow, red sparks for heat)
- Pollution tints: Tiles darken, critters gain oily hues

**Auto-Suggestions**:
- Subtle glows only (not intrusive)
- Optional "Whisper Oracle" critter that narrates perm ideas based on your style
- UI adapts to playstyle (harmony = sustainable hints, conquest = yield hints)

---

## Technical Direction

**Implementation Lite**:
- BitECS archetypes for resource types
- Query snaps in batches: `world.query(Adjacency<Ore, Water>) → spawn(Alloy)`
- Procedural perms via lookup table + noise
- Hash(demands) seeds variant outputs—guaranteed infinite without storage bloat

**Code Structure**:
```ts
// permutations.js
const AFFINITIES = {
  heat: 1, flow: 2, bind: 4, power: 8, 
  life: 16, metal: 32, void: 64, wild: 128
};

function combineResources(aff1, aff2, demands = { ore: 0, power: 0 }) {
  const overlap = aff1 & aff2;
  if (bitCount(overlap) < 2) return 0; // No snap
  let newAff = aff1 | aff2;
  // Demand bias: If high oreDemand, +metal chance
  if (demands.ore > 5 && (newAff & AFFINITIES.heat)) {
    newAff |= AFFINITIES.metal;
  }
  // Noise twist
  const hash = noise.noise2D(aff1 + aff2 + Date.now() * 0.01, behavior.conquest);
  if (hash > 0.9) newAff |= AFFINITIES.wild; // Exotic
  return newAff;
}
```

---

## Scope/Constraints

**Performance**:
- Batch queries via BitECS archetypes
- Async chain spawning: `setTimeout(() => snapCheck(), 100)` for shallow recursion
- Cap at 10-deep chains (performance guard)

**Balance**:
- 70% snaps succeed (affinity overlap)
- 20% mutate (noise variants)
- 10% fizzle (incompatible, +tiny pollution)

---

## Decision Log

- ✅ **Procedural > Hardcoded**: No fixed recipes, all combos valid if bits align
- ✅ **Noise-weighted sensible**: Heat loves flow, hates life (80% natural)
- ✅ **Demand-responsive world**: Game anticipates player needs, spawns resources
- ✅ **Consequences not punishment**: Void corruption is risky but empowering
- ✅ **Visual clarity**: Every snap has particle/glow feedback
- ✅ **Infinite scaling**: Scales with player growth, not against

---

## Open Questions

- Exact synergy math for 20+ traits
- Balancing chain depth vs. pollution accumulation
- Mobile UI for visualizing complex affinity overlaps
- Audio cues for snap types (heat = crackle, flow = ripple)
- Community seed sharing of "perfect snap worlds"
- Auto-suggestion aggressiveness (subtle glows vs. oracle critter)

---

**Next Stage**: Villages, quests, and emergent content systems


