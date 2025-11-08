# Simulation Package Architecture

**Package**: `packages/backend/` (current) → `packages/simulation/` (future)  
**Purpose**: Pure mathematical simulation with Yuka AI decision-making  
**Architecture**: Deterministic algorithms, AI-sourced content, visual blueprint generation

## Core Philosophy

From WORLD.md and chat chronology: **The simulation is a living, breathing world where every entity has desires, makes decisions, and communicates with others.**

Yuka isn't just AI for creatures—it's the **nervous system of the entire world**.

## Fundamental Principles

### Everything is a Yuka Entity
- **Planet**: Wants stability (CohesionBehavior for accretion)
- **Materials**: Want cohesion (CohesionBehavior for bonding)  
- **Creatures**: Want survival (Goal hierarchies, FSM states)
- **Tools**: Want utility (FuzzyModule emergence evaluation)
- **Buildings**: Want purpose (Construction goals, spatial triggers)
- **Tribes**: Want dominance (Cooperation evaluation, territory)
- **Myths**: Want immortality (Memory systems, cultural transmission)

### AI-Sourced Content (No Magic Numbers)
Every parameter derives from:
1. **Physical Reality**: Laws of physics, chemistry, biology
2. **AI Generation**: OpenAI workflows create parameter pools
3. **Deterministic Selection**: Seed components pick from AI options
4. **Causal Chains**: Each generation influences the next

### WARP & WEFT Architecture
- **WARP (Vertical)**: Gen N → Gen N+1 causal influence
- **WEFT (Horizontal)**: Macro/Meso/Micro scales at each generation
- **AI-Sourced**: OpenAI generates realistic parameter pools
- **Deterministic**: Seed ensures reproducible results

## Simulation Architecture

### Mathematical Foundation

The simulation operates on **pure mathematical algorithms**:

```typescript
// Planetary composition is a mathematical function
function queryPoint(x: number, y: number, z: number): MaterialComposition {
  // Uses deterministic accretion history, not lookup tables
  return accretionSimulation.getCompositionAt(x, y, z);
}

// Creature behavior is mathematical decision evaluation  
function evaluateGoals(creature: Creature, environment: Environment): Action {
  // Uses Yuka GoalEvaluator, not hardcoded behavior trees
  return goalEvaluator.calculateBestAction(creature.goals, environment);
}
```

### Yuka Integration Architecture

**Complete utilization of all Yuka systems**:

#### Decision Making
- **GoalEvaluator**: Hierarchical decision scoring (creatures, tools, buildings)
- **CompositeGoal**: Goal trees (survive → forage → seek berries)
- **FuzzyModule**: Fuzzy logic decisions (pack formation, tool emergence)
- **StateMachine**: State-based AI (creature states, governance transitions)

#### Spatial Behavior  
- **CohesionBehavior**: Gravitational attraction (planetary accretion, pack formation)
- **SeparationBehavior**: Maintain spacing, prevent collisions
- **AlignmentBehavior**: Coordinate movement (flocking, tribal coordination)
- **ObstacleAvoidance**: Navigate terrain and obstacles

#### Perception & Memory
- **Vision**: Line-of-sight, field of view (detect food, predators, resources)
- **MemorySystem**: Short-term memory (remember locations, events)
- **Perception**: Multi-modal sensing (vision, hearing, chemical)

#### Communication & Coordination
- **MessageDispatcher**: Entity-to-entity messaging
- **Telegram**: Message protocol ("Help! Predator!", "Alliance proposal")
- **TaskQueue**: Sequential task execution ("Gather wood, then build")

#### Navigation & Movement
- **Vehicle**: Physical presence in 3D space
- **Path**: Define routes (migration, trade)
- **FollowPathBehavior**: Follow established routes
- **Spatial Triggers**: Location-based event triggers

### Content Generation Pipeline

#### OpenAI Workflow Integration

```typescript
// AI generates parameter pools for each generation
async function generateGen1DataPools(planetData: Planet, seed: string): Promise<Gen1DataPools> {
  const { generateObject } = await import('ai');
  const openai = new OpenAI();
  
  const result = await generateObject({
    model: openai('gpt-4'),
    schema: gen1DataPoolSchema,
    prompt: `Based on planet: ${JSON.stringify(planetData)}...
             Generate 5 creature archetypes for MACRO scale,
             5 population patterns for MESO scale,  
             5 metabolic systems for MICRO scale.
             Include complete visual blueprints for each.`,
  });
  
  return result.object;
}

// Deterministic selection from AI-generated pools
function selectFromPool<T>(options: T[], seedComponent: number): T {
  const index = Math.floor(seedrandom(seedComponent.toString()) * options.length);
  return options[index];
}
```

#### Visual Blueprint Generation

Every entity receives complete rendering instructions:

```typescript
interface VisualBlueprint {
  description: string;
  canCreate: string[];        // "Iron-rich planet" → "can create metal tools"
  cannotCreate: string[];     // "Carbon-rich planet" → "cannot create magnetic tools"
  representations: {
    materials: string[];      // AmbientCG texture paths
    shaders: PBRProperties;   // Roughness, metallic, normal maps
    proceduralRules: string;  // How to generate/combine visually
    colorPalette: string[];   // Hex colors for variations
  };
  compatibleWith: string[];   // "Kinship packs" + "defensive buildings"
  incompatibleWith: string[]; // "Nomadic" + "permanent buildings"
  compositionRules: string;   // How to layer/blend/combine
}
```

## Generation System Architecture

### Gen 0: Planetary Formation
**Yuka Systems**: CohesionBehavior, Vehicle
```typescript
class AccretionSimulation {
  // 1000 debris particles with Yuka Vehicles
  async runCohesionSimulation(debrisField: Vehicle[], iterations: number): Promise<Planet> {
    for (let i = 0; i < iterations; i++) {
      for (const particle of debrisField) {
        // Apply CohesionBehavior to simulate gravitational attraction
        particle.steering.add(cohesionBehavior.calculate(particle));
        particle.update(deltaTime);
      }
      // Check for collisions and merge particles
      this.handleCollisions(debrisField);
    }
    return this.formPlanetFromDebris(debrisField);
  }
}
```

### Gen 1: Creatures  
**Yuka Systems**: GoalEvaluator, CompositeGoal, StateMachine, Vision, MemorySystem
```typescript
class Creature {
  goals: CompositeGoal = new CompositeGoal('Survive', [
    new ManageEnergyGoal(),
    new ManageRestGoal(), 
    new ReproduceGoal()
  ]);
  
  fsm: StateMachine = new StateMachine(this, [
    new IdleState(),
    new ForagingState(),
    new FleeingState(),
    new ReproducingState()
  ]);
  
  update(deltaTime: number): void {
    // Yuka Goal evaluation
    const desirabilities = this.goals.calculateDesirabilities();
    const nextAction = this.goalEvaluator.evaluate(desirabilities);
    
    // State machine transitions
    this.fsm.update(deltaTime);
    
    // Execute action
    this.executeAction(nextAction);
  }
}
```

### Gen 2: Packs
**Yuka Systems**: FuzzyModule, CohesionBehavior, SeparationBehavior, AlignmentBehavior
```typescript
class PackSystem {
  fuzzyModule: FuzzyModule = new FuzzyModule();
  
  initializeFuzzyLogic(): void {
    // 9 comprehensive fuzzy rules for pack formation
    const scarcityHigh = this.scarcityVar.getSet('high');
    const proximityMany = this.proximityVar.getSet('many');
    const desirabilityHigh = this.desirabilityVar.getSet('high');
    
    this.fuzzyModule.addRule(new FuzzyRule(
      new FuzzyAND(scarcityHigh, proximityMany),
      desirabilityHigh
    ));
  }
  
  evaluatePackFormation(creatures: Creature[]): Pack[] {
    const packs: Pack[] = [];
    
    for (const creature of creatures) {
      const proximity = this.calculateProximity(creature, creatures);
      const scarcity = this.calculateResourceScarcity(creature.position);
      
      // Use Yuka FuzzyModule to evaluate pack desirability
      this.fuzzyModule.fuzzify('proximity', proximity);
      this.fuzzyModule.fuzzify('scarcity', scarcity);
      const desirability = this.fuzzyModule.defuzzify('desirability');
      
      if (desirability > this.packFormationThreshold) {
        packs.push(this.formPack(creature, nearbyCreatures));
      }
    }
    
    return packs;
  }
}
```

### Gen 3: Tools
**Yuka Systems**: FuzzyModule, GoalEvaluator
```typescript
class ToolSystem {
  evaluateToolEmergence(pack: Pack, materials: Material[]): Tool[] {
    const problemIntensity = this.calculateProblemIntensity(pack);
    const capability = this.calculatePackCapability(pack);
    
    // Use Yuka FuzzyModule for emergence evaluation
    this.fuzzyModule.fuzzify('problemIntensity', problemIntensity);
    this.fuzzyModule.fuzzify('capability', capability);
    const desirability = this.fuzzyModule.defuzzify('desirability');
    
    if (desirability > this.toolEmergenceThreshold) {
      return this.createTools(pack, materials);
    }
    
    return [];
  }
}
```

### Gen 4-6: Tribes, Buildings, Religion
Each uses appropriate Yuka systems for their domain:
- **Tribes**: MessageDispatcher for coordination, GoalEvaluator for cooperation
- **Buildings**: Spatial Triggers for construction needs, TaskQueue for building sequences
- **Religion**: MemorySystem for myths, MessageDispatcher for cultural transmission

## Failsafe Systems

From chat chronology insight: **Death as a failsafe when Yuka gets confused**

### Automatic Decomposition
```typescript
class EntityFailsafeSystem {
  handleStuckEntity(entity: YukaEntity): void {
    if (entity.isStuck()) {
      // Flag for decomposition
      entity.status = EntityStatus.STUCK_DECOMPOSE;
      
      // Find appropriate decomposer
      const decomposer = this.findDecomposer(entity);
      
      if (decomposer) {
        // Predator kills and consumes
        decomposer.addGoal(new AttackAndConsumeGoal(entity));
      } else {
        // Planetary system smites with weather
        this.planetarySystem.createLocalWeatherEvent(entity.position, 'lightning');
      }
    }
  }
}
```

### Multi-Level Failsafes
1. **Tool stuck** → Decompose to materials
2. **Creature stuck** → Flag as SICK, attract predators  
3. **Still stuck** → PLANETARY system creates weather event
4. **Building stuck** → Revolution/abandonment
5. **Government stuck** → Social collapse
6. **Religion stuck** → Heresy/reformation

Every system can decompose DOWN the chain, ensuring no permanent hangs.

## Integration Points

### Database Persistence
```typescript
// Drizzle ORM schemas for simulation state
export const planetsTable = sqliteTable('planets', {
  id: text('id').primaryKey(),
  seed: text('seed').notNull(),
  accretionHistory: text('accretion_history', { mode: 'json' }),
  materialComposition: text('material_composition', { mode: 'json' }),
  visualBlueprint: text('visual_blueprint', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

### Message Dispatcher Integration  
```typescript
// Inter-system communication
const dispatcher = new MessageDispatcher();

// Tool created → Material sphere updates accessibility
dispatcher.dispatchMessage(
  0, // delay
  toolSystem,
  materialSystem, 
  MessageTypes.TOOL_CREATED,
  { tool: 'EXTRACTOR', unlockedMaterials: ['Copper', 'Clay'] }
);
```

### Event Sourcing
All state changes are tracked for:
- **Reproducibility**: Replay from any point
- **Debugging**: Understand decision chains
- **Analysis**: Study emergent behaviors
- **Testing**: Verify deterministic behavior

## Performance Architecture

### Yuka Optimization
- **EntityManager**: Efficient spatial partitioning
- **Time**: Consistent delta time for all systems
- **CellSpacePartitioning**: Optimize proximity queries
- **Vehicle pooling**: Reuse objects to reduce GC

### Memory Management
- **Decomposition recycling**: Dead entities return materials to pools
- **Spatial indexing**: Efficient location-based queries
- **Lazy evaluation**: Only compute when needed
- **Caching**: Cache expensive AI decisions

### Scalability Considerations
- **Deterministic**: Same seed always produces same results
- **Stateless operations**: Each computation is independent
- **Spatial partitioning**: Large worlds can be divided
- **Parallel processing**: Independent regions can run simultaneously

This simulation architecture provides the pure mathematical foundation that the API layer exposes and the game layer builds upon, while maintaining the complete Yuka-driven ecosystem vision from WORLD.md.