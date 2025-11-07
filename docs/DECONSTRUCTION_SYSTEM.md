# Deconstruction System - Reverse Synthesis

**Version**: 1.0  
**Status**: DESIGN - Revolutionary Mechanic  
**Principle**: **"Everything is Squirrels"** applies to death/destruction too

---

## Core Principle: Deconstruction = Reverse Synthesis

**NO LOOT TABLES. NO HARDCODED DROPS.**

When you kill/destroy an evolved form, you get its **constituent parts** based on its **generational assembly**.

**Why this is revolutionary**:
- Armadillo doesn't drop "Elixir of the Magi" (arbitrary RPG bullshit)
- Armadillo drops **the parts that formed the armadillo**
- Those parts have **properties** that determine **emergent uses**
- No need to hardcode "shell = helmet" - properties drive it

---

## Generational Breakdown

### Generation Levels (Archetypal Hierarchy)

**Gen 1: Base Archetypes** (from RawMaterialsSystem)
- `MaterialCategory`: Wood, Metal, Stone, Organic, Water, etc.
- `AffinityType`: HEAT, FLOW, BIND, POWER, LIFE, METAL, VOID, WILD
- **Examples**: "Oak Wood", "Copper Ore", "River Stone"

**Gen 2: Assemblages** (combined materials + traits)
- Body parts, structural components, refined materials
- **Examples**: "Hardened Shell", "Flexible Limb", "Reinforced Bone"

**Gen 3: Evolved Forms** (creatures, buildings from archetypes)
- Living creatures with trait combinations
- Buildings with material assemblies
- **Examples**: "Six-legged Armadillo", "Longhouse Workshop"

---

## Deconstruction Process

### When Creature Dies

**Gen 3 → Gen 2 Breakdown**:
```
Six-legged Armadillo (Gen 3)
  ↓ DECONSTRUCT
  → Leg of Six-legged Armadillo (x6)
  → Shell of Six-legged Armadillo (x1)
  → Head of Six-legged Armadillo (x1)
  → Meat of Six-legged Armadillo (bulk)
```

**Gen 2 → Gen 1 Breakdown** (further processing):
```
Shell of Six-legged Armadillo (Gen 2)
  ↓ DECONSTRUCT (cooking pot)
  → Armadillo Keratin (Gen 1 Material)
  → Calcified Bone Fragments (Gen 1 Material)
  
Meat of Six-legged Armadillo (Gen 2)
  ↓ DECONSTRUCT (cooking)
  → Armadillo Meat Stew (Gen 1 Food)
  → Bone Broth (Gen 1 Food)
```

---

## Taxonomic Auto-Naming

**Pattern**: `[Part Type] of [Creature Name]`

**In Life** (ECS entity):
- Name: "Six-legged Armadillo"
- Archetype: "Cursorial Forager" (Gen 2)
- Base: "medium_forager" (Gen 1)

**In Death** (deconstructed parts):
- "Leg of Six-legged Armadillo"
- "Shell of Six-legged Armadillo"
- "Head of Six-legged Armadillo"
- "Meat of Six-legged Armadillo"

**Auto-generation rules**:
1. Read creature's `name` from ECS
2. For each body part in morphology:
   - Generate: `{part_type} of {creature_name}`
   - Inherit properties from creature traits
3. Store in inventory with full lineage metadata

---

## Property-Based Usage (NO HARDCODING)

**Properties Define Use, Not Hardcoded Logic**

### Example: Armadillo Shell

**Properties** (from ECS traits + material):
```typescript
{
  HARDNESS: 7.5,          // scale 0-10
  ROUGHNESS: 4.2,         // scale 0-10
  WATER_CARRYING: true,
  VOLUME: { 
    capacity: 2.5,        // liters
    dimensions: [25, 18, 12] // cm
  },
  CURVATURE: "concave",
  WEIGHT: 0.8,            // kg
  THERMAL_INSULATION: 6.2,
  MATERIAL_CATEGORY: "Organic_Keratin"
}
```

**Emergent Uses** (from properties):

**As Helmet**:
- `VOLUME.dimensions` fit head? ✓
- `HARDNESS > 5`? ✓ (armor value)
- `WEIGHT < 2kg`? ✓ (wearable)
- → **Can equip as helmet** (no hardcoding)

**As Water Container**:
- `WATER_CARRYING === true`? ✓
- `VOLUME.capacity > 0`? ✓
- → **Can use as container** (no hardcoding)

**As Cooking Vessel**:
- `THERMAL_INSULATION > 5`? ✓
- `VOLUME.capacity > 1`? ✓
- `WATER_CARRYING === true`? ✓
- → **Can use for cooking** (no hardcoding)

---

## Building Deconstruction

**Same principle - reverse the assembly**:

### Longhouse Workshop Deconstruction

**Gen 3 → Gen 2**:
```
Longhouse Workshop (Gen 3 building)
  ↓ DECONSTRUCT (hack apart)
  → Timber Frame Beam x12 (from assembly manifest)
  → Thatch Roof Bundle x24
  → Daub Wall Panel x8
  → Stone Hearth Blocks x50
```

**Gen 2 → Gen 1** (break down components):
```
Timber Frame Beam (Gen 2)
  ↓ DECONSTRUCT (chop up)
  → Oak Wood Logs x3 (Gen 1)
  → Binding Cordage x0.5 (Gen 1)

Thatch Roof Bundle (Gen 2)
  ↓ DECONSTRUCT
  → Reed Thatch (Gen 1)
  → Binding Rope (Gen 1)
```

---

## Implementation Strategy

### 1. ECS Component: `DeconstructionData`

```typescript
interface DeconstructionData {
  generation: 1 | 2 | 3;           // Archetypal depth
  constituents: Part[];             // What it breaks into
  properties: PropertySet;          // For usage determination
  lineage: string[];                // Taxonomic path
}

interface Part {
  type: string;                     // "leg", "shell", "beam"
  name: string;                     // Auto-generated
  quantity: number;
  generation: number;
  properties: PropertySet;
  material: MaterialCategory;
}

interface PropertySet {
  HARDNESS?: number;
  ROUGHNESS?: number;
  WATER_CARRYING?: boolean;
  VOLUME?: { capacity: number; dimensions: [number, number, number] };
  WEIGHT?: number;
  THERMAL_INSULATION?: number;
  FLEXIBILITY?: number;
  // ... extensible
}
```

### 2. System: `DeconstructionSystem`

**Responsibilities**:
- Listen for entity death/destruction events
- Generate constituent parts based on `generation` level
- Auto-name parts using taxonomic rules
- Apply property inheritance from source
- Spawn part entities in world/inventory
- Handle recursive deconstruction (Gen 2 → Gen 1)

### 3. System: `PropertyUsageSystem`

**Responsibilities**:
- Query item properties vs usage requirements
- Determine valid uses WITHOUT hardcoded branching
- Example: "Can this be a helmet?" → Check VOLUME + HARDNESS + WEIGHT
- Example: "Can this hold water?" → Check WATER_CARRYING + VOLUME

---

## Procedural Dead Shapes (Visible Synthesis)

**When creature dies, show its constituent parts visually**:

**Visible Breakdown**:
1. Creature dies
2. Body "explodes" into constituent parts (Gen 2)
3. Each part is a separate entity with physics
4. Parts use same procedural renderer as living form
5. Player can harvest parts individually

**Example**: Six-legged Armadillo death
```
[Living Armadillo] → [Death Event]
  ↓
[6x Legs] [1x Shell] [1x Head] [Meat chunks]
  ↓ (physics scatter)
All visible on ground as separate entities
  ↓ (player harvests)
Added to inventory with full property data
```

---

## Benefits vs Traditional Loot Tables

**Traditional RPG**:
```
if (enemy.type === "armadillo") {
  dropLoot([
    { item: "armadillo_shell", chance: 60% },
    { item: "leather_scraps", chance: 80% },
    { item: "magic_potion", chance: 5% },  // WHY???
  ]);
}
```

**Ebb & Bloom (Emergent)**:
```typescript
// Creature already HAS the parts as ECS components
const parts = deconstructionSystem.breakdown(creature);
// Auto-named, property-driven, no hardcoding
// "Shell of Six-legged Armadillo" with actual properties
// Can be used as helmet/container/whatever based on properties
```

**Advantages**:
- ✅ **Zero hardcoding** for drops
- ✅ **Emergent uses** from properties
- ✅ **Taxonomic consistency** (name matches lineage)
- ✅ **Realistic** (you get what the creature is made of)
- ✅ **Scalable** (infinite creatures, zero loot tables)

---

## Integration with Existing Systems

### RawMaterialsSystem
- Already has Gen 1 materials with affinities
- Deconstruction bottoms out at these archetypes

### CreatureArchetypeSystem
- Creatures already have trait-based morphology
- Deconstruction reads traits to generate parts

### Evolution System
- Parts inherit evolutionary lineage
- "Third-generation Cursorial Forager" → parts reference this

---

## Example Flow: Full Lifecycle

**Birth → Death → Harvest → Use**:

1. **Gen 1**: Base archetype "medium_forager"
2. **Gen 2**: Assembled traits → "Armadillo-form"
3. **Gen 3**: Named individual "Six-legged Armadillo #7"
4. **Death**: Breaks into Gen 2 parts
   - "Shell of Six-legged Armadillo"
   - "Meat of Six-legged Armadillo"
5. **Harvest**: Player collects shell
6. **Use**: Properties determine usage
   - HARDNESS + VOLUME → Can be helmet
   - WATER_CARRYING → Can be container
7. **Further Breakdown**: Cook meat → Gen 1 food

**At no point was there a loot table. At no point was "shell = helmet" hardcoded.**

---

## Revolutionary Design Achievement

**This is the "Everything is Squirrels" doctrine applied to death/destruction**:

- Every form is an evolutionary assemblage
- Destruction = reverse assembly
- Properties drive usage emergently
- No arbitrary RPG bullshit (why does armadillo drop magic potion?)
- Fully procedural, infinitely scalable

**Status**: 🧬 **REVOLUTIONARY DECONSTRUCTION DESIGN** - Ready for implementation
