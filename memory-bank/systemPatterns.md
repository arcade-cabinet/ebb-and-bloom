# System Patterns

**Last Updated:** November 11, 2025  
**Architecture:** Phase 3 Complete - Intent API + ECS + Law Systems

---

## Core Architectural Patterns

### 1. WARP/WEFT Flow (Causal + Scale Dimensions)

**Critical Insight:** Every entity exists in TWO dimensions simultaneously.

**WARP (Vertical/Temporal)**: Causal flow through cosmic time
```
Big Bang
  → Dark Matter Web
  → Population III Stars
  → Supernovae (metallicity enrichment)
  → Galaxy Formation
  → Stellar System (Pop I/II stars)
  → Planetary Accretion
  → Differentiation (core → mantle → crust)
  → Surface Chemistry
  → Abiogenesis
  → Creatures
  → Tools & Civilization
  → Transcendence
```

**WEFT (Horizontal/Spatial)**: Scale flow at any time slice
```
Universal (cosmological constants)
  → Galactic (metallicity, age, position)
  → Stellar (star type, luminosity, habitable zone)
  → Planetary (mass, composition, tectonics)
  → Surface (biomes, geology, hydrology)
  → Organismal (creatures, populations)
  → Cellular (metabolism, genetics)
  → Molecular (chemistry, bonds)
  → Atomic (elements, isotopes)
  → Quantum (fundamental forces)
```

**Implementation in Current System:**

```typescript
// WARP: Cosmic provenance chain
const genesis = new GenesisConstants(rng);
const timeline = new CosmicProvenanceTimeline(rng);
// Future: PlanetaryAccretion, SurfaceChemistry, etc.

// WEFT: Multi-scale entity
world.add({
  entityId: uuidv4(),
  scale: 'organismal',           // WEFT position
  
  // Properties from WARP chain
  cosmicLineage: {
    galaxyAge: genesis.getGalaxyAge(),
    metallicity: genesis.getMetallicity(),
    supernovaCycles: Math.floor(galaxyAge / 1e9),
  },
  
  // Properties from WEFT scales
  mass: 10,                      // Organismal scale
  elementCounts: { 'C': 10 },    // Atomic scale
  genome: 'DNA_SEQUENCE',        // Molecular scale
  metabolism: { ... },           // Cellular scale
  position: { x, y, z },         // Surface scale
});
```

**Why This Matters:**
- **WARP ensures scientific rigor**: Can't have iron in young galaxy
- **WEFT enables emergence**: Organismal behavior from molecular properties
- **Both enforce determinism**: Same seed → same WARP chain → same WEFT properties

**Example: Spawning a Tree**

```typescript
// WARP: Why does this tree exist?
// Big Bang → Galaxy (metallicity 0.7) → Star (Pop I) 
// → Planet (metal-rich) → Soil (nutrient-dense) → Seeds → Evolution

// WEFT: What are tree's properties at each scale?
const tree = {
  // Universal scale (inherited from genesis)
  physicsConstants: genesis.getPhysicsConstants(),
  
  // Galactic scale
  metallicity: genesis.getMetallicity(),  // 0.7 (metal-rich)
  
  // Planetary scale  
  gravity: planet.surfaceGravity,
  
  // Surface scale
  position: { x: 100, y: 0, z: 200 },
  biome: 'temperate_forest',
  
  // Organismal scale
  mass: 500,  // kg
  height: 20, // meters
  
  // Cellular scale
  metabolism: {
    photosynthesisRate: 0.8,
    respirationRate: 0.2,
  },
  
  // Molecular scale
  genome: 'TREE_DNA_SEQUENCE',
  
  // Atomic scale
  elementCounts: {
    'C': 250,   // Carbon from stellar fusion
    'O': 100,   // Oxygen from supernovae
    'N': 20,    // Nitrogen from stellar nucleosynthesis
    'Fe': 5,    // Iron (only in metal-rich galaxy!)
  },
};
```

**Anti-pattern:** Creating entities without WARP provenance or WEFT scale context.

---

### 2. Three-Tier Documentation System

**Pattern:** Separate ephemeral AI context from permanent human docs

```
memory-bank/          # AI session continuity (ephemeral)
  ├─ activeContext.md
  ├─ progress.md
  ├─ systemPatterns.md (this file)
  ├─ techContext.md
  └─ productContext.md

README.md            # Standalone human docs (permanent)
  └─ Never references memory-bank/

docs/                # Deep technical guides (permanent)
  ├─ AI_HIERARCHY.md
  ├─ COSMIC_PROVENANCE.md
  └─ INTENT_API_PHILOSOPHY.md
```

**Rule:** NEVER reference memory-bank in READMEs or docs/

---

### 3. Unified State Management (GameState Pattern)

**Pattern:** Single source of truth for world state

```typescript
// game/state/GameState.ts
export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      // Atomic initialization (WARP + WEFT setup)
      initializeWorld: async (seed, scene, camera) => {
        rngRegistry.setSeed(seed);
        
        // WARP: Cosmic provenance
        const genesis = new GenesisConstants(rng);
        const timeline = new CosmicProvenanceTimeline(rng);
        
        // WEFT: Multi-scale world
        const world = new World();
        await world.initialize();
        
        const executor = new GovernorActionExecutor(world, genesis, scene);
        
        set({ seed, genesis, timeline, world, executor, ... });
      },
      
      // Unified intent execution
      executeGovernorIntent: async (intent) => {
        const { executor } = get();
        await executor.execute(intent);
      }
    }),
    { name: 'ebb-and-bloom-game-state' }
  )
);
```

**Why:**
- Atomic initialization (WARP + WEFT in one operation)
- Single API for all world operations
- Clean disposal

**Anti-pattern:** Multiple managers with duplicate state

---

### 4. Intent-Based Actions (No Direct Manipulation)

**Pattern:** Both player and AI submit intents, laws determine outcomes

```typescript
// Unified interface
interface GovernorActionPort {
  requestAction(action, target): Promise<GovernorIntent>;
}

// Player implementation
class PlayerGovernorController implements GovernorActionPort {
  async requestAction(action, target) {
    if (this.energy < action.cost) throw new Error('Insufficient energy');
    this.energy -= action.cost;
    return { action, target, magnitude: 1.0 };
  }
}

// AI implementation (future)
class RivalAIGovernorController implements GovernorActionPort {
  async requestAction(action, target) {
    if (this.energy < action.cost) throw new Error('Insufficient energy');
    this.energy -= action.cost; // SAME COST
    return { action, target, magnitude: 1.0 }; // SAME MAGNITUDE
  }
}

// Execution (same for both)
await gameState.executeGovernorIntent(intent);
```

**Why:**
- Provable fairness (same code path)
- Testability (swap implementations)
- Extensibility (add new actions)

**Reference:** `docs/INTENT_API_PHILOSOPHY.md`

---

### 5. ECS Architecture (Miniplex)

**Pattern:** Archetype-based entity-component system with WEFT scale component

```typescript
// Define entity schema
export const EntitySchema = z.object({
  entityId: z.string().uuid(),
  scale: z.enum([
    'quantum',
    'atomic', 
    'molecular',
    'cellular',
    'organismal',
    'population',
    'surface',
    'planetary',
    'stellar',
    'galactic',
    'universal'
  ]),
  
  // Physics (all scales)
  mass: z.number().optional(),
  position: z.object({ x, y, z }).optional(),
  
  // Chemistry (atomic/molecular scales)
  elementCounts: z.record(z.string(), z.number()).optional(),
  
  // Biology (cellular/organismal scales)
  genome: z.string().optional(),
  metabolism: z.object({ ... }).optional(),
  
  // Provenance (WARP tracking)
  cosmicLineage: z.object({
    galaxyAge: z.number(),
    metallicity: z.number(),
    supernovaCycles: z.number(),
  }).optional(),
});

// Query by scale (WEFT)
const organisms = world.with('scale').where(e => e.scale === 'organismal');
const molecules = world.with('scale').where(e => e.scale === 'molecular');
```

**Why:**
- Type-safe (Zod validation)
- Fast queries (archetype storage)
- Multi-scale support (WEFT dimension)

---

### 6. Law Orchestrator (System Coordinator)

**Pattern:** Systems run in WEFT scale order (macro → micro)

```typescript
// engine/ecs/core/LawOrchestrator.ts
export class LawOrchestrator {
  private systems: System[] = [
    // Universal scale
    new ThermodynamicsSystem(),
    
    // Planetary/Surface scale
    new OdexEcologySystem(),
    
    // Organismal scale
    new MetabolismSystem(),
    new BiologyEvolutionSystem(),
    
    // Molecular/Atomic scale
    new ChemistrySystem(),
    
    // All scales
    new RapierPhysicsSystem(),
    new CulturalTransmissionSystem(),
  ];
  
  async tick(deltaTime: number): Promise<void> {
    // Run in WEFT order (macro → micro)
    for (const system of this.systems) {
      await system.update(this.world, deltaTime);
    }
  }
}
```

**Why:**
- WEFT ordering (larger scales influence smaller)
- Consistent execution
- Easy to add/remove systems

---

### 7. Conservation Ledger (Physics Enforcement)

**Pattern:** Track conserved quantities across all WEFT scales

```typescript
// engine/ecs/core/ConservationLedger.ts
export class ConservationLedger {
  private totalMass = 0;
  private totalCharge = 0;
  private totalEnergy = 0;
  
  addEntity(entity: Entity): void {
    // Mass conserved across scales
    if (entity.mass) this.totalMass += entity.mass;
    
    // Charge conserved (atomic scale)
    if (entity.charge) this.totalCharge += entity.charge;
    
    // Energy conserved (all scales)
    // E = mc² + kinetic + potential + thermal
  }
  
  removeEntity(entity: Entity): void {
    // Conservation check
    if (entity.mass) this.totalMass -= entity.mass;
  }
}
```

**Why:**
- Physics enforcement (thermodynamics)
- Works across WEFT scales
- Debugging (detect violations)

---

### 8. Scoped RNG (Deterministic WARP Generation)

**Pattern:** Namespace-based RNG for deterministic WARP chains

```typescript
// engine/rng/RNGRegistry.ts
class RNGRegistry {
  private seed: string = '';
  private rngCache = new Map<string, EnhancedRNG>();
  
  setSeed(seed: string): void {
    this.seed = seed;
    this.rngCache.clear();
  }
  
  getScopedRNG(namespace: string): EnhancedRNG {
    const key = `${this.seed}:${namespace}`;
    if (!this.rngCache.has(key)) {
      this.rngCache.set(key, new EnhancedRNG(key));
    }
    return this.rngCache.get(key)!;
  }
}

// Usage (WARP namespaces)
const genesisRng = rngRegistry.getScopedRNG('genesis');
const planetRng = rngRegistry.getScopedRNG('planet');
const creatureRng = rngRegistry.getScopedRNG('creature');
```

**Why:**
- Same seed → same WARP chain
- Isolated namespaces
- Testable determinism

---

### 9. Subscription Over Polling (React Pattern)

**Pattern:** Event-driven re-renders instead of polling

```typescript
// BAD: Polling
const scenes = sceneManager.getScenes(); // Called 60fps!

// GOOD: Subscription
const [scenes, setScenes] = useState(sceneManager.getScenes());
useEffect(() => {
  const unsubscribe = sceneManager.onSceneChange(() => {
    setScenes([...sceneManager.getScenes()]);
  });
  return unsubscribe;
}, []);
```

**Why:**
- Performance (only re-render when needed)
- Prevents memory leaks

---

### 10. Creature AI vs Rival AI (Distinct Systems)

**Pattern:** Two AI layers at different WEFT scales

```typescript
// CREATURE AI (Organismal scale - WEFT)
class CreatureAI {
  goals: Goal[] = [
    new HungerGoal(priority: 0.8),
    new SafetyGoal(priority: 0.9),
  ];
  
  stateMachine: StateMachine = new StateMachine([
    new IdleState(),
    new HuntState(),
  ]);
  
  update(deltaTime: number): void {
    // Individual organism behavior
  }
}

// RIVAL AI (Population/Surface scale - WEFT)
class RivalAIGovernorController implements GovernorActionPort {
  async requestAction(action, target): Promise<GovernorIntent> {
    // Strategic species-level decisions
    const ecology = this.evaluateEcology(); // Surface scale
    const population = this.getPopulation();  // Population scale
    
    // Operates at HIGHER WEFT scale than individual creatures
  }
}
```

**Why:**
- Different WEFT scales = different concerns
- Creature: Organismal scale (tactical)
- Rival: Population/Surface scale (strategic)

**Reference:** `docs/AI_HIERARCHY.md`

---

## WARP/WEFT Decision Matrix

**When adding a feature, ask:**

### WARP Questions (Temporal/Causal)
1. **Where in cosmic timeline does this happen?**
   - Big Bang? Galaxy formation? Planetary surface? Life emergence?
   
2. **What caused this to exist?**
   - Trace back through WARP chain
   - Young galaxy → No iron → No steel tools
   
3. **Is this deterministic from seed?**
   - Same seed → same WARP chain → same feature

### WEFT Questions (Spatial/Scale)
1. **What scale does this operate at?**
   - Universal? Galactic? Organismal? Molecular?
   
2. **Which scales does it influence?**
   - Metabolism (cellular) affects behavior (organismal)
   - Galaxy metallicity (galactic) affects chemistry (atomic)
   
3. **Are cross-scale interactions handled?**
   - Macro → Meso → Micro data flow

### Example: Adding "Spear Crafting"

**WARP Analysis:**
- **Timeline position:** Post-life, post-tool-discovery
- **Causal chain:** 
  - Galaxy metallicity → Available elements
  - Stellar fusion → Carbon/Silicon production
  - Planetary accretion → Surface mineral deposits
  - Creature evolution → Dexterity/Intelligence
  - Tool discovery → Spear invention
- **Determinism:** Galaxy age determines max tech level

**WEFT Analysis:**
- **Primary scale:** Organismal (creature crafts)
- **Influences from:**
  - Atomic: Element availability (wood, stone, metal)
  - Molecular: Material bonds (hardness, flexibility)
  - Cellular: Creature dexterity (genes)
  - Organismal: Intelligence (learning)
- **Influences to:**
  - Organismal: Hunting success
  - Population: Prey population decline
  - Surface: Resource depletion

**Implementation:**
```typescript
// WARP: Check if spear is possible
const metallicity = genesis.getMetallicity();
const canCraftMetal = metallicity > 0.5; // Old galaxy only

// WEFT: Gather requirements from multiple scales
const availableWood = world.queryElementsAt(position, 'C'); // Atomic
const creatureDexterity = creature.genes.dexterity; // Cellular
const creatureIntelligence = creature.intelligence; // Organismal

if (availableWood > 10 && creatureDexterity > 0.7) {
  // Spear crafting possible
  const spear = {
    scale: 'organismal',
    elementCounts: { 'C': 10, 'Si': 2 }, // From WARP provenance
    durability: creatureDexterity * 100,  // From WEFT properties
  };
}
```

---

## Critical Constraints

### 1. WARP Determinism
- Same seed → Same cosmic timeline
- Test: Duplicate seed runs must be identical

### 2. WEFT Scale Separation
- Don't mix scales (e.g., don't let atomic events directly affect galactic)
- Data flows: Macro → Meso → Micro

### 3. Conservation Laws
- Enforced across ALL WEFT scales
- Cannot create/destroy mass-energy

### 4. Intent API Fairness
- Player and AI at SAME scale (Population/Surface)
- Same costs, same constraints

### 5. Documentation Tiers
- memory-bank/ = ephemeral
- README = permanent standalone
- docs/ = permanent technical

---

**For New Agent:** Read this file + `.clinerules` + `docs/COSMIC_PROVENANCE.md` before architectural changes.
