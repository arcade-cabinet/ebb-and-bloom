# Stage 02: Snapping Permutations & Complexity

**Lines**: 500-1200 (Elaboration requests → Deep system architecture)  
**Key Evolution**: Core mechanics → Infinite scalability & affinity system

---

## What Changed

USER asked: **"Expand snapping permutations details"**

This stage transforms magnetic snapping from a "clever trick" into the procedural heartbeat of the game. Introduction of:
- **32-bit affinity masks** for infinite resource combinations
- **Demand response system** tied to player traits
- **Chain depth mechanics** (2→5→10 deep combos)
- **Scaling with player behavior profiles**

---

## Affinity System (Core Addition)

### 8 Base Affinities (32-bit mask)
```
Bit 0 (1):   Heat     - ores, lava
Bit 1 (2):   Flow     - water, rivers  
Bit 2 (4):   Bind     - wood, soil (glues)
Bit 3 (8):   Power    - wind/geothermal (motion)
Bit 4 (16):  Life     - plants, critter drops (growth)
Bit 5 (32):  Metal    - refined ores (tools)
Bit 6 (64):  Void     - pollution/corruption (anti-snaps)
Bit 7 (128): Wild     - noise-seeded wildcards (random buffs)
```

### Fusion Rules
- **Snap when**: Adjacent tiles + affinity overlap ≥2 bits
- **Output**: `newMask = (aff1 | aff2) XOR noise-hash`
- **Procedural twist**: 10% chance "exotic" variant (+wild)
- **Demand bias**: If player `oreDemand >5`, boost metal affinity

---

## Example Chains (Emergent Complexity)

### Basic (MVP Entry)
```
Wood (bind=4) + Water (flow=2) 
  → Mud (6) 
  → +10% tile stability

Ore (heat=1) + Wood (bind=4) 
  → Charcoal Tool (5) 
  → Basic chop (chainsaw trait ×1.5)
```

### Mid-Chain (Harmony Path)
```
River (flow=2) + Plant (life=16) 
  → Hydro-Wood (18) 
  → Self-regrows every cycle
  → If frolick high: +wild(128) = "Whimsy Vine" (cosmetic trails)
```

### Deep Conquest (Demand-Driven)
```
Ore (1) + Water (2) 
  → Alloy (3|32=35)

Alloy (35) + Power (8) 
  → Circuit (43) 
  → Automates 2× harvest radius

Circuit (43) + Wood (4) + Heat (1) 
  → Drill (46) 
  → Mines deep ores, +3 pollution/dig

IF oreDemand >10:
  Drill (46) + Geothermal (9) 
    → Piston Pump (55) 
    → Infinite flow, risks "boil shock" (lava biome)
```

### Hybrid Wildcard
```
Critter Drop (life=16 + wild=128=144) + Alloy (35) 
  → Symbiote Tool (179)
  → Harmony: Critters help boost yields
  → Conquest: Tames golems (new entity type)
```

---

## Scaling & Reactivity

### Player Growth Integration
- **Evo Points unlock affinity slots**: Start 2 traits = 2 bit preferences, max 5
- **Trait auras**: Chainsaw adds heat=1 to harvest, biasing toward metal chains
- **Mid-game trait swapping**: Flipper feet → drill arm after mining ore

### Yuka Behavior Profiling (50-action window)
- **Harmony >0.6**: Prioritize life/flow loops (regrow > extract)
- **Conquest >0.6**: Amp metal/power, but void(64) creeps in
  - Corrupt snaps: 20% fail rate, spawn thorns
- **Frolick >0.6**: Wild-heavy, short whimsy chains
  - No pollution, low utility, unlock "artisan" traits

### Shock Integration
- **At 70% pollution**: "Perma-Shift"
  - Snaps gain void affinity globally
  - Alloy (3) becomes Tainted Alloy (3|64=67) - brittle but +speed
- **Post-shock**: Scars persist (hybrid affs like lava-river = steam)
- **World expansion**: Borders seed with demand profile (conquest = ore frontiers)

---

## Infinite Ceiling Design

### Caps & Meta-Mechanics
- **10-deep chains** (performance guard)
- **Meta-snaps via critters**: Evolved beaver (life+bind) carries wood remotely
- **Success rates**: 
  - 70% snaps succeed (affinity overlap)
  - 20% mutate (noise variants)
  - 10% fizzle (incompatible, +tiny pollution)

### Visualization (Phaser Integration)
- **Particle bursts**: Blue wisps (flow), red sparks (heat)
- **Glow lines** on adjacent potentials
- **Tooltips**: "Alloy (3→35): Craves power—yield +50%?"
- **Pollution tints**: Tiles darken, critters gain oily hues

---

## Technical Implementation

### New ECS Components
```ts
Resource.affinity: 'u32'  // 32-bit mask
```

### Core Functions (permutations.js)
```ts
generateAffinity(type): number
combineResources(aff1, aff2, demands): number  
bitCount(n): number  // Popcount for overlap check
hashToType(affinity): string  // Map to sprite/effect
```

### Demand Tracking
```ts
playerDemands = {
  ore: Trait.chainsaw[player] * 2,
  power: Trait.drill[player] || 0
}
```

### Async Chain Spawning
```ts
// In snapCheck()
setTimeout(() => snapCheck(), 100); // Recurse shallow (depth<3)
```

---

## Key Design Decisions

1. **Procedural > Hardcoded**: No fixed recipes, all combos valid if bits align
2. **Noise-weighted sensible**: Heat loves flow, hates life (80% natural)
3. **Demand-responsive world**: Game anticipates player needs, spawns resources
4. **Consequences not punishment**: Void corruption is risky but empowering
5. **Visual clarity**: Every snap has particle/glow feedback

---

## What's Still Open

- Exact synergy math for 20+ traits
- Balancing chain depth vs. pollution accumulation
- Mobile UI for visualizing complex affinity overlaps
- Audio cues for snap types (heat = crackle, flow = ripple)
- Community seed sharing of "perfect snap worlds"

---

**Next Stage**: Mobile UX refinement and platform integration (Pages vs Capacitor decision)
