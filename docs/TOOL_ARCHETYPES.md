# Tool Archetypes - Collaborative AI Evolution

**Version**: 1.0  
**Status**: DESIGN - Micro Creative Sphere  
**Principle**: **Tools guide creature evolution, creatures guide tool evolution**

---

## Core Principle: Archetypal Tool Categories

**At the fundamental level, ALL tools are one of these archetypes**:

### 1. **ASSEMBLERS** (Joiners, Binders)
Tools that **combine** things together.

**Base Forms**:
- Binding cord/rope (joins with wrapping)
- Stone hammer (joins with percussion)
- Bone needle (joins with threading)
- Mud/clay (joins with adhesion)

**Evolution Path**:
- Pressure: Construction needs, complex building assembly
- Response: Better grip, precision binding, stronger materials
- Gen 2: Nails, pegs, mortise tools
- Gen 3: Specialized joiners (dovetail saws, clamps)

**Properties**:
- `BINDING_STRENGTH`: How well it holds things together
- `PRECISION`: Fine vs rough joining
- `MATERIAL_AFFINITY`: What materials it can join

---

### 2. **DISASSEMBLERS** (Breakers, Separators)
Tools that **take apart** or **break down** things.

**Base Forms**:
- Sharp stone (cuts/separates)
- Heavy rock (breaks/crushes)
- Hardened stick (pries apart)
- Antler tine (punctures/separates)

**Evolution Path**:
- Pressure: Deconstruction needs, material harvesting
- Response: Sharper edges, leverage, targeted force
- Gen 2: Axes, knives, wedges, chisels
- Gen 3: Specialized saws, precision scalpels

**Properties**:
- `CUTTING_FORCE`: How easily it separates
- `EDGE_RETENTION`: Stays sharp vs dulls
- `LEVERAGE`: Mechanical advantage

---

### 3. **TRANSFORMERS** (Shapers, Processors)
Tools that **change form** without assembly/disassembly.

**Base Forms**:
- Flat stone (grinds/shapes)
- Fire (transforms via heat)
- Hardened clay pot (contains transformation)
- Water basin (transforms via soaking)

**Evolution Path**:
- Pressure: Material refinement, cooking, crafting
- Response: Heat control, precision shaping, containment
- Gen 2: Grinding stones, kilns, forges
- Gen 3: Anvils, crucibles, molds

**Properties**:
- `HEAT_CAPACITY`: Can it transform via temperature
- `ABRASION`: Shapes through grinding
- `CONTAINMENT`: Holds during transformation

---

### 4. **EXTRACTORS** (Harvesters, Gatherers)
Tools that **obtain** materials from source.

**Base Forms**:
- Digging stick (extracts from ground)
- Sharp stone (extracts from carcass)
- Basket (extracts via collection)
- Hooked stick (extracts via pulling)

**Evolution Path**:
- Pressure: Resource depth, quantity needs
- Response: Reach, capacity, efficiency
- Gen 2: Spades, picks, nets, buckets
- Gen 3: Specialized mining tools, large containers

**Properties**:
- `REACH`: Access depth/distance
- `CAPACITY`: How much extracted per use
- `EFFICIENCY`: Effort vs yield

---

### 5. **CARRIERS** (Movers, Transporters)
Tools that **move** things from place to place.

**Base Forms**:
- Bundled hide (wraps and carries)
- Woven basket (contains and carries)
- Dragged branch (moves heavy loads)
- Shoulder pole (distributes weight)

**Evolution Path**:
- Pressure: Distance, weight, quantity
- Response: Ergonomics, capacity, durability
- Gen 2: Backpacks, sleds, travois
- Gen 3: Carts, specialized containers

**Properties**:
- `LOAD_CAPACITY`: Max weight
- `ERGONOMICS`: Comfort of use
- `DURABILITY`: Wear resistance

---

### 6. **MEASURERS** (Assessors, Comparers)
Tools that **determine** properties without changing.

**Base Forms**:
- Marked stick (measures length)
- Balanced stone (measures weight)
- Shadow stick (measures time)
- Water level (measures horizontal)

**Evolution Path**:
- Pressure: Precision needs, comparison, consistency
- Response: Calibration, standardization, accuracy
- Gen 2: Rulers, scales, plumb lines
- Gen 3: Precision gauges, standardized units

**Properties**:
- `PRECISION`: Accuracy of measurement
- `REPEATABILITY`: Consistent results
- `CALIBRATION`: Reference standard

---

### 7. **PROTECTORS** (Shields, Armor, Barriers)
Tools that **defend** against harm.

**Base Forms**:
- Thick hide (worn protection)
- Wooden board (held shield)
- Woven barrier (perimeter defense)
- Hardened shell (natural armor)

**Evolution Path**:
- Pressure: Combat, environmental hazards
- Response: Coverage, strength, mobility
- Gen 2: Fitted armor, reinforced shields
- Gen 3: Articulated plate, layered protection

**Properties**:
- `PROTECTION`: Damage absorption
- `COVERAGE`: Area protected
- `MOBILITY`: Movement restriction

---

## Yuka Collaborative AI: Micro Creative Sphere

### How Tool Archetypes Guide Evolution

**Tool System → Creature System**:
```
IF tools evolve toward ASSEMBLERS
  → Creatures need: Dexterity, precision grip, coordination
  → Yuka evolves: Opposable digits, fine motor traits
  
IF tools evolve toward DISASSEMBLERS
  → Creatures need: Strength, leverage, edge control
  → Yuka evolves: Muscular limbs, stabilizing mass

IF tools evolve toward EXTRACTORS
  → Creatures need: Endurance, reach, perception
  → Yuka evolves: Longer limbs, better sensing
```

**Creature System → Tool System**:
```
IF creatures evolve: High dexterity
  → Tools can become: More precise (ASSEMBLERS, MEASURERS)
  → Yuka allows: Complex binding, fine measurement

IF creatures evolve: High strength
  → Tools can become: Heavier/more forceful (DISASSEMBLERS, EXTRACTORS)
  → Yuka allows: Large axes, deep mining picks

IF creatures evolve: Pack coordination
  → Tools can become: Multi-operator (CARRIERS, PROTECTORS)
  → Yuka allows: Travois, team-carried shields
```

### Inter-System Pressure Network

**Yuka Decision Trees for Each Archetype**:

```typescript
interface ToolEvolutionPressure {
  archetype: ToolArchetype;
  pressure: {
    construction: number;      // Need to build
    deconstruction: number;    // Need to break down
    refinement: number;        // Need to process
    gathering: number;         // Need to extract
    transport: number;         // Need to move
    assessment: number;        // Need to measure
    protection: number;        // Need to defend
  };
  creatureCapability: {
    dexterity: number;
    strength: number;
    coordination: number;
    perception: number;
  };
}
```

**Yuka Steering Logic**:
1. **Tool Pressure** accumulates from player actions
2. **Creature Capability** provides constraints/enablers
3. **Yuka evaluates**: "Can current creatures use next-gen tools?"
4. **If NO**: Evolve creatures first (dexterity, strength, etc.)
5. **If YES**: Evolve tools to next generation
6. **Feedback loop**: Better tools → new pressures → new creature needs

---

## Example: Assembly Pressure Evolution

**Generation 1 - Early Assembly**:
- **Pressure**: Building basic shelters (Windbreak)
- **Tools**: Binding cord, stone hammer
- **Creatures**: Basic grip, moderate dexterity
- **Yuka Decision**: Tools adequate, no evolution needed

**Generation 5 - Complex Assembly**:
- **Pressure**: Building Longhouse Workshop (many joints)
- **Tools**: Still just cord and hammer (insufficient)
- **Creatures**: Dexterity increased from other pressures
- **Yuka Decision**: Creatures CAN handle better tools → Evolve ASSEMBLERS
  - Gen 2 tools: Wooden pegs, mortise markers
  - Properties: Higher PRECISION, better BINDING_STRENGTH

**Generation 10 - Master Assembly**:
- **Pressure**: Complex multi-building settlements
- **Tools**: Gen 2 ASSEMBLERS (adequate but could be better)
- **Creatures**: Very high dexterity, pack coordination
- **Yuka Decision**: Coordination enables new category → Evolve team tools
  - Gen 3 tools: Two-person clamps, alignment jigs
  - Properties: Requires 2+ operators, very high PRECISION

---

## Integration with Deconstruction System

**Tools determine WHAT can be deconstructed**:

```
Player has: Sharp Stone (Gen 1 DISASSEMBLER)
  → Can deconstruct: Soft materials, small creatures
  → Cannot deconstruct: Hardened shells, large bones

Player evolves to: Bronze Axe (Gen 2 DISASSEMBLER)
  → Can NOW deconstruct: Trees, larger creatures, building beams
  → Still cannot: Very hard minerals, reinforced structures

Player evolves to: Steel Saw (Gen 3 DISASSEMBLER)
  → Can deconstruct: Almost anything
  → Precision breakdown (clean cuts vs shattering)
```

**Deconstruction Quality** based on tool archetype:
- **DISASSEMBLER** used: Clean parts, high quality Gen 2 components
- **Wrong tool** used: Damaged parts, some degraded to Gen 1
- **No tool** used: Only Gen 1 materials, most destroyed

---

## Armor as Archetypal Tools

**Armor = PROTECTORS archetype**:

**Gen 1 - Natural Protection**:
- Thick hide draped over body
- Properties: Low PROTECTION, high MOBILITY

**Gen 2 - Fitted Armor**:
- Shaped leather, shell pieces
- Properties: Medium PROTECTION, medium MOBILITY
- Requires: Creature ASSEMBLER skill (lacing, fitting)

**Gen 3 - Articulated Defense**:
- Layered plates, flexible joints
- Properties: High PROTECTION, managed MOBILITY
- Requires: Advanced ASSEMBLER tools + creature dexterity

**Emergent from Properties**:
```
Armadillo Shell (from Deconstruction)
  Properties:
    HARDNESS: 7.5 (good protection)
    CURVATURE: concave (fits torso/head)
    WEIGHT: 0.8kg (light enough)
  
  → Can be used as armor WITHOUT hardcoding
  → Yuka evaluates: "This has PROTECTOR properties"
  → Creature equips as Gen 2 armor piece
```

---

## Tool-Creature Co-Evolution Loops

**Positive Feedback**:
1. Player builds → ASSEMBLER pressure
2. Yuka evolves better ASSEMBLER tools
3. Better tools → more complex building possible
4. Complex building → needs creature dexterity
5. Yuka evolves creature dexterity
6. Higher dexterity → enables Gen 3 ASSEMBLERS
7. LOOP CONTINUES

**Balanced Pressure**:
- If player focuses ONLY on assembly → creatures become hyper-dexterous
- If player focuses combat → creatures become strong, tools become DISASSEMBLERS
- If player focuses gathering → creatures become mobile, tools become EXTRACTORS/CARRIERS

**Yuka ensures coherence**: Tools match creature capability, creatures evolve toward tool needs.

---

## Implementation: Collaborative AI Systems

### ToolArchetypeSystem
```typescript
class ToolArchetypeSystem {
  archetypes = [
    ASSEMBLER, DISASSEMBLER, TRANSFORMER,
    EXTRACTOR, CARRIER, MEASURER, PROTECTOR
  ];
  
  evaluatePressure(): ToolEvolutionPressure {
    // Aggregate player actions
    // Return pressure per archetype
  }
  
  informCreatureSystem(pressure: ToolEvolutionPressure): CreatureNeeds {
    // "Tools need X, so creatures need Y"
    return {
      dexterity: pressure.construction + pressure.refinement,
      strength: pressure.deconstruction + pressure.extraction,
      coordination: pressure.transport + pressure.protection,
    };
  }
}
```

### CreatureArchetypeSystem
```typescript
class CreatureArchetypeSystem {
  receiveToolNeeds(needs: CreatureNeeds): void {
    // Adjust evolution pressure based on tool requirements
    this.evolutionPressure.dexterity += needs.dexterity;
    this.evolutionPressure.strength += needs.strength;
    this.evolutionPressure.coordination += needs.coordination;
  }
  
  informToolSystem(): CreatureCapability {
    // "Creatures can do X, so tools can be Y"
    return {
      dexterity: this.getCurrentTraitLevel('dexterity'),
      strength: this.getCurrentTraitLevel('strength'),
      coordination: this.getPackCoordination(),
    };
  }
}
```

### Yuka Coordination Layer
```typescript
class YukaEvolutionCoordinator {
  toolSystem: ToolArchetypeSystem;
  creatureSystem: CreatureArchetypeSystem;
  
  update(): void {
    // Collaborative AI decision loop
    
    // 1. Tools inform creatures
    const toolPressure = this.toolSystem.evaluatePressure();
    const creatureNeeds = this.toolSystem.informCreatureSystem(toolPressure);
    this.creatureSystem.receiveToolNeeds(creatureNeeds);
    
    // 2. Creatures inform tools
    const creatureCapability = this.creatureSystem.informToolSystem();
    this.toolSystem.receiveCreatureCapability(creatureCapability);
    
    // 3. Yuka makes coherent evolution decisions
    this.makeEvolutionDecisions();
  }
}
```

---

## Revolutionary Design Achievement

**Micro Creative Sphere - Systems as Collaborative AI**:

- Tool archetypes guide creature evolution
- Creature capabilities guide tool evolution
- Yuka ensures coherent co-evolution
- No hardcoded progression trees
- Emergent complexity from archetypal fundamentals

**Status**: 🧬 **TOOL ARCHETYPE DESIGN COMPLETE** - Ready for Yuka integration
