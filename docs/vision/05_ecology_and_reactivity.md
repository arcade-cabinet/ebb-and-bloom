# Stage 05: Ecology and Reactivity

**Context from Chat Replay**: Lines ~70-90, ~400-500 (Behavior profiling, world reactions)  
**Key Evolution**: Static world → Reactive ecosystem that mirrors player playstyle

---

## Intent & Player Fantasy

The world doesn't punish—it **echoes** player actions back, amplified. Yuka's behavior profiling turns player vibes into world poetry. No "bad player" flags; just a canvas that mirrors your strokes. If you're dancing through meadows, the ecosystem blooms in kind. If you're the forge-lord, the world answers with thorns in your supply lines.

---

## Mechanics & Systems

### Player Behavior Profiling via Yuka

**How It Works**:
- Yuka's decision trees get a player-facing layer—a lightweight "Behavior Sensor" entity
- Logs actions over rolling windows (e.g., last 100 terraforms/gathers)
- Pattern-matching for intent (not Big Brother)

**Three Axes**:
- **Harmony Axis**: High scores for balanced changes (plant after chop, diversify biomes)
  - Triggers "Symbiosis Goals" in Yuka
  - Critters evolve cooperative behaviors (fish schools "gift" pearl resources)
- **Conquest Axis**: Spikes from extractive chains (e.g., 80% of actions are destructive)
  - Yuka shifts ecosystem goals toward survivalism
  - Predators bulk up, resources "hide" in fortified pockets
- **Frolick Axis**: Low-impact whimsy (wandering without net change)
  - Yuka rewards serendipity: Random "delight events"
  - Bioluminescent migrations, hidden glades spawn rare traits

**Evaluation Loop**:
- Every cycle (tied to pollution checks), Yuka runs fuzzy inference
- Weight recent actions against historical trends
- No hard gates; probabilistic
- Frolicker might accidentally tip conquest → Yuka eases back with "redemption nudges"

### World Reactions

**Tuned for Playstyle**:
- Baseline starts neutral (faint scars, enough mystery to intrigue)
- Destructive arcs accelerate pollution (forges add +10 echo/hour)
- Harmonious? Pollution dissipates faster, unlocking "eternal groves"

**Evo Ripples**:
- Your style bleeds into critters
- Conquest evolves territorial packs that "tax" your forges (steal ore unless you build walls)
- Frolick? Animals turn playful, dropping "mood resources" like joy-shards for cosmetic upgrades

**The Forge Example**:
- Carve deep? Yuka profiles it as conquest peak
- World responds: Magma veins snaking up (new lava biome), but surface rivers acidify
- Fish evolve into aerial "mist drakes" that rain corrosive dew
- Frolick through it? Maybe you just poke at the rock for fun, and it sparks a mineral garden instead

---

## Worldgen & Ecology

**No Punishment, Just Consequence**:
- Frolickers get passive buffs (faster Evo Point trickle from "serene vibes")
- Conquest players unlock "apex" evolutions (forge-compatible traits like heat-resistant hide)
- But at ecosystem cost—shocks hit sooner, with visuals like forge-smoke birthing iron-veined monsters

**Hybrid Magic**:
- Yuka detects blends—slash-and-burn *with* restoration?
- Hybrid goals emerge: "Regenerative Conquest"
- Destroyed zones regrow tougher (fire-scarred forests spawn flame-retardant mega-trees)

**Tech Tie-In**:
- BitECS stores behavior as compact component on player entity
- `{ harmony: 0.7, conquest: 0.2, frolick: 0.1 }`
- Yuka queries it for AI overrides
- If harmony > 0.6, fish ignore pollution debuffs

---

## Progression & Economy

**Behavior-Driven Progression**:
- Harmony players: Unlock symbiotic traits, faster Evo Points
- Conquest players: Unlock apex evolutions, but ecosystem costs
- Frolick players: Unlock whimsical traits, cosmetic upgrades

**Ecosystem Feedback Loops**:
- High harmony → Critters cooperate → More resources → Easier progression
- High conquest → Resources hide → Harder progression → But unlock powerful tools
- High frolick → Delight events → Rare traits → Cosmetic progression

---

## UX/Camera/Controls

**UI Hints** (Optional):
- "World Mood" vignette that colors the edges based on your arc
- Subtle visual feedback (harmony = verdant greens, conquest = rusty oranges)
- Behavior profile visible in status bar (optional, can be hidden)

---

## Technical Direction

**ECS Component**:
```ts
Behavior: {
  harmony: 'f32',
  conquest: 'f32',
  frolick: 'f32'
}
```

**Yuka Integration**:
- Query behavior component for AI overrides
- Adjust critter steering behaviors based on profile
- Spawn events based on playstyle (delight events for frolick, challenges for conquest)

---

## Scope/Constraints

**Performance**:
- Behavior tracking: Rolling window (last 100 actions)
- Evaluation loop: Every cycle (tied to pollution checks)
- Lightweight: Compact component, O(1) queries

**Balance**:
- No hard gates (probabilistic)
- Redemption nudges prevent permanent lock-in
- Hybrid playstyles supported

---

## Decision Log

- ✅ **No Punishment, Just Consequence**: Frolickers buffed, conquest players challenged
- ✅ **Yuka Behavior Profiling**: Lightweight, pattern-matching for intent
- ✅ **Three Axes**: Harmony, Conquest, Frolick (not binary good/evil)
- ✅ **Hybrid Magic**: Blended playstyles create unique outcomes
- ✅ **Tech Tie-In**: BitECS component, Yuka queries

---

## Open Questions

- Profiling depth: Super subtle (just eco shifts) or faint UI hints?
- Specific conquest gadgets (e.g., "Soul Anvil" that forges critter souls into tools)?
- Balance tuning: How aggressive should world reactions be?
- Redemption mechanics: How forgiving should the system be?

---

**Next Stage**: Materials to alloys crafting system deep dive

