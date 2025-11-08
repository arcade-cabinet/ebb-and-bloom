# Game Layer Package Architecture

**Package**: `packages/game/` (future)  
**Purpose**: Player interaction layer on top of pure simulation  
**Architecture**: Player agency system that influences but doesn't control the simulation

## Core Philosophy

From WORLD.md: **The player is not a creature. They are the evolutionary force itself.**

The game layer provides player agency without breaking the mathematical purity of the simulation. Players guide evolution through **Evo Points** and **influence systems**, while the Yuka-driven simulation maintains its autonomous decision-making.

## Player Role Architecture

### The Player as Evolutionary Force

The player exists **outside** the simulation as a meta-entity that can:

1. **Spend Evo Points**: Nudge creature traits in desired directions
2. **Guide Tool Emergence**: Prioritize certain tool types over others
3. **Shape Tribal Behavior**: Encourage diplomacy vs conquest
4. **Influence Environmental Pressure**: Create selective advantages
5. **Observe and Analyze**: Watch emergent complexity unfold

### What Players CANNOT Do

- **Direct Control**: Cannot command individual creatures or entities
- **Resource Management**: Cannot directly allocate materials or tools
- **Building Placement**: Cannot choose where structures are built
- **Combat Commands**: Cannot control battle outcomes
- **Technology Trees**: Cannot force specific technological paths

All game outcomes emerge from **Yuka AI decisions** influenced by player choices.

## Evo Point System

### Evo Point Generation

Players earn Evo Points through:

```typescript
interface EvoPointSources {
  discovery: number;        // New materials, creatures, tools discovered
  milestone: number;        // Generation transitions, first buildings, etc.
  diversity: number;        // Multiple creature types, varied ecosystems
  cooperation: number;      // Alliance formation, peaceful coexistence
  innovation: number;       // Novel tool combinations, unexpected solutions
  efficiency: number;       // Resource optimization, waste reduction
  transcendence: number;    // Religious systems, philosophical frameworks
}
```

### Evo Point Spending

Players spend Evo Points on **influence systems**:

```typescript
enum EvoPointSpending {
  // Creature Evolution Influence
  TRAIT_NUDGE = 'trait_nudge',           // Encourage specific trait development
  ARCHETYPE_BIAS = 'archetype_bias',     // Favor certain creature types
  MUTATION_RATE = 'mutation_rate',       // Increase evolutionary speed
  
  // Tool Development Influence  
  TOOL_PRIORITY = 'tool_priority',       // Prioritize tool types (EXTRACTOR vs WEAPON)
  INNOVATION_BOOST = 'innovation_boost', // Increase tool emergence probability
  KNOWLEDGE_TRANSFER = 'knowledge_transfer', // Spread tool knowledge between packs
  
  // Social Structure Influence
  COOPERATION_BIAS = 'cooperation_bias', // Encourage alliance formation
  COMPETITION_BIAS = 'competition_bias', // Encourage territorial expansion
  CULTURAL_EXCHANGE = 'cultural_exchange', // Promote inter-tribal communication
  
  // Environmental Pressure
  RESOURCE_SCARCITY = 'resource_scarcity', // Create selective pressure
  CLIMATE_SHIFT = 'climate_shift',         // Gradual environmental changes
  MIGRATION_PRESSURE = 'migration_pressure', // Encourage territorial movement
}
```

### Influence Implementation

```typescript
class EvolutionaryInfluence {
  applyTraitNudge(creatures: Creature[], trait: TraitType, strength: number): void {
    for (const creature of creatures) {
      // Subtle bias in trait evolution, not direct modification
      const currentValue = creature.traits[trait];
      const nudgeMultiplier = 1 + (strength * 0.1); // Max 10% influence per point
      
      // Influence manifests in next generation reproduction
      creature.reproductionBias[trait] = Math.min(
        creature.reproductionBias[trait] * nudgeMultiplier,
        1.0
      );
    }
  }
  
  applyToolPriority(packs: Pack[], toolType: ToolType, priority: number): void {
    for (const pack of packs) {
      // Increase fuzzy logic desirability for specific tool types
      const toolSystem = pack.getToolSystem();
      toolSystem.adjustEmergenceBias(toolType, priority * 0.05);
    }
  }
  
  applyCooperationBias(tribes: Tribe[], bias: number): void {
    for (const tribe of tribes) {
      // Adjust cooperation evaluation thresholds
      const cooperationThreshold = tribe.getCooperationThreshold();
      tribe.setCooperationThreshold(cooperationThreshold * (1 - bias * 0.02));
    }
  }
}
```

## Victory Conditions & Endings

### Emergent Endings Based on Playstyle

The game tracks **hidden metrics** to determine ending type:

```typescript
interface WorldMetrics {
  speed: number;           // Generations to unlock all materials
  violence: number;        // Combat events, extinctions
  harmony: number;         // Alliances, coexistence  
  exploitation: number;    // Resource depletion, pollution
  innovation: number;      // Tools, buildings, discoveries
  transcendence: number;   // Religious/philosophical complexity
}
```

### Four Ending Types

#### 1. Mutualism (Coexistence)
**Conditions**:
- Multiple tribes coexist peacefully (harmony > 0.8)
- Resource sharing via trade (exploitation < 0.3)
- High biodiversity maintained (diversity > 0.7)
- Religious/philosophical alignment (transcendence > 0.6)

**Narrative**: *"Your world achieved balance. Life flourishes in diversity."*

#### 2. Parasitism (Subjugation)
**Conditions**:
- Dominant tribe exploits others (violence > 0.7, harmony < 0.3)
- Unsustainable resource extraction (exploitation > 0.8)
- High pollution, ecosystem degradation
- Religious/ideological conflicts

**Narrative**: *"Your world consumed itself. The strong devoured the weak."*

#### 3. Domination (Supremacy)  
**Conditions**:
- Single tribe eliminates/absorbs all others (competition > 0.9)
- Rapid technological advancement (innovation > 0.8, speed < 0.4)
- Ecosystem completely transformed
- Ideology replaces diverse belief systems

**Narrative**: *"Your world bends to a singular will. One force remains."*

#### 4. Transcendence (Mythological Ascension)
**Conditions**:
- Religious/philosophical complexity reaches threshold (transcendence > 0.9)
- Multiple abstract social systems coexist
- Ecosystem transcends purely physical constraints
- Player unlocks "divine" level influence

**Narrative**: *"Your world became legend. Stories outlive stone."*

## Player Interface Architecture

### Information Dashboard

Players receive information through:

```typescript
interface PlayerInterface {
  // Current State
  generationStatus: GenerationStatus;
  activeCreatures: CreatureSummary[];
  materialAccessibility: MaterialStatus[];
  tribalRelations: RelationshipMap;
  worldMetrics: WorldMetrics;
  
  // Event Feed
  recentEvents: SimulationEvent[];
  milestones: Milestone[];
  discoveries: Discovery[];
  
  // Influence Options
  availableInfluences: InfluenceOption[];
  currentEvoPoints: number;
  spentInfluences: AppliedInfluence[];
  
  // Analysis Tools
  trendAnalysis: TrendData[];
  emergencePatterns: EmergencePattern[];
  predictiveModels: Prediction[];
}
```

### Event Messaging System

**Critical system from WORLD.md**: Player needs feedback via event messages.

```typescript
enum EventType {
  DISCOVERY = 'discovery',     // "Your creatures discovered COPPER!"
  EVOLUTION = 'evolution',     // "Pack Alpha evolved EXCAVATION!"
  SOCIAL = 'social',          // "New tribe formed: The Red Fang!"
  CONFLICT = 'conflict',      // "Pack Blue attacks Pack Green!"
  ALLIANCE = 'alliance',      // "Alliance formed between Red and Yellow!"
  MILESTONE = 'milestone',    // "First tool created: STONE AXE!"
  CONSTRUCTION = 'construction', // "First building: SHELTER completed!"
  TRANSCENDENCE = 'transcendence' // "First myth recorded: The Great Fire!"
}

class EventMessagingSystem {
  dispatchToPlayer(event: SimulationEvent): void {
    // MessageDispatcher sends events to Event Log (UI component)
    this.messageDispatcher.dispatchMessage(
      0, // immediate
      event.source,
      this.eventLogEntity,
      event.type,
      {
        message: event.description,
        location: event.coordinates,
        generation: this.currentGeneration,
        significance: event.significance,
        visualData: event.visualBlueprint
      }
    );
  }
}
```

## Game Progression Architecture

### Phase-Based Gameplay

#### Phase 1: Genesis (Gen 0-1)
- **Focus**: Planet formation and first life
- **Player Role**: Observe accretion, influence initial creature traits
- **Key Decisions**: Guide basic creature archetypes
- **Victory Metrics**: Diversity of life forms

#### Phase 2: Organization (Gen 1-3)  
- **Focus**: Packs, tools, early technology
- **Player Role**: Balance cooperation vs competition
- **Key Decisions**: Tool development priorities, pack formation
- **Victory Metrics**: Innovation rate, social complexity

#### Phase 3: Civilization (Gen 4-5)
- **Focus**: Tribes, buildings, settlements
- **Player Role**: Guide social organization patterns
- **Key Decisions**: Governance systems, territorial expansion
- **Victory Metrics**: Settlement patterns, resource management

#### Phase 4: Transcendence (Gen 6)
- **Focus**: Abstract social systems, meaning-making
- **Player Role**: Influence belief system emergence
- **Key Decisions**: Religious vs political vs cultural emphasis
- **Victory Metrics**: Ideological complexity, cultural achievements

### Difficulty Scaling

```typescript
enum DifficultyLevel {
  OBSERVER = 'observer',       // Minimal influence, pure observation
  GUIDE = 'guide',            // Standard influence system
  SHAPER = 'shaper',          // Increased influence points and options
  ARCHITECT = 'architect',     // Maximum influence, complex tools
  DIVINE = 'divine'           // Unlock transcendence influence options
}
```

## Integration with Other Packages

### Simulation Package Integration

The game layer **wraps** the simulation package:

```typescript
class GameEngine {
  private simulation: SimulationEngine;
  private playerState: PlayerState;
  private influenceSystem: InfluenceSystem;
  
  constructor() {
    this.simulation = new SimulationEngine();
    this.playerState = new PlayerState();
    this.influenceSystem = new InfluenceSystem();
  }
  
  async advanceGeneration(): Promise<GenerationResult> {
    // Apply player influences to simulation
    await this.influenceSystem.applyInfluences(
      this.playerState.scheduledInfluences,
      this.simulation
    );
    
    // Run simulation advancement
    const result = await this.simulation.advanceGeneration();
    
    // Process results for player feedback
    const events = this.extractPlayerRelevantEvents(result);
    const evoPoints = this.calculateEvoPointReward(result);
    
    // Update player state
    this.playerState.addEvoPoints(evoPoints);
    this.playerState.addEvents(events);
    
    // Check for ending conditions
    const endingStatus = this.checkEndingConditions(result);
    
    return {
      simulationResult: result,
      playerEvents: events,
      evoPointsEarned: evoPoints,
      endingStatus: endingStatus
    };
  }
}
```

### API Package Integration

The game adds **game-specific endpoints** to the base API:

```http
# Player State
GET /api/player/status              # Current player state
GET /api/player/evo-points         # Available influence points
GET /api/player/history            # Player action history

# Influence System  
GET /api/influence/available       # Available influence options
POST /api/influence/apply          # Apply evolutionary influence
GET /api/influence/effects         # Current active influences

# Game Progression
GET /api/game/phase               # Current game phase
GET /api/game/victory-conditions  # Progress toward endings
GET /api/game/metrics            # World metrics for ending calculation

# Events & Feedback
GET /api/events/player-relevant  # Events formatted for player consumption
GET /api/events/milestones      # Major achievements and discoveries
GET /api/events/feed            # Real-time event stream
```

### Frontend Integration

The frontend displays **game layer data** alongside simulation visualization:

```typescript
interface GameInterface extends SimulationInterface {
  // Player HUD
  evoPointDisplay: EvoPointDisplay;
  influencePanel: InfluencePanel;
  eventLog: EventLog;
  
  // Game Progression
  phaseIndicator: PhaseIndicator;
  victoryProgress: VictoryProgressDisplay;
  worldMetrics: WorldMetricsDisplay;
  
  // Interactive Elements
  influenceTargeting: InfluenceTargeting;  // Click to apply influences
  eventDetails: EventDetailsModal;        // Click events for details
  trendAnalysis: TrendAnalysisPanel;      // Analyze patterns over time
}
```

## Replayability Architecture

### Seed-Based Determinism + Player Choice

Each playthrough combines:
- **Deterministic simulation**: Same seed = same planetary formation, creature archetypes
- **Player agency**: Different influence choices = different evolutionary outcomes
- **Emergent complexity**: Yuka AI creates unique emergent behaviors within constraints

### Multiple Playstyle Support

```typescript
enum PlayerArchetype {
  OBSERVER = 'observer',           // Minimal intervention, pure science
  GARDENER = 'gardener',          // Nurture diversity, promote balance
  CONQUEROR = 'conqueror',        // Push for dominance and efficiency  
  EXPERIMENTER = 'experimenter',   // Test extreme scenarios
  STORYTELLER = 'storyteller',     // Focus on narrative and transcendence
}
```

Each archetype has:
- **Different influence preferences**: Gardeners prioritize cooperation, Conquerors prioritize competition
- **Unique achievement paths**: Different ways to earn Evo Points
- **Specialized ending conditions**: Some endings easier for certain archetypes
- **Distinct victory narratives**: Same ending type described differently

## Testing & Balancing

### Player Agency Validation

```typescript
// Test that player influences actually matter
describe('Player Agency', () => {
  test('cooperation bias increases alliance formation', () => {
    const simulation = new GameEngine();
    simulation.applyInfluence(EvoPointSpending.COOPERATION_BIAS, 5);
    
    const result = simulation.runGenerations(10);
    
    expect(result.worldMetrics.harmony).toBeGreaterThan(baselineHarmony);
    expect(result.allianceCount).toBeGreaterThan(baselineAlliances);
  });
  
  test('different influences lead to different endings', () => {
    const cooperativePlaythrough = runPlaythrough([
      { type: EvoPointSpending.COOPERATION_BIAS, amount: 10 }
    ]);
    
    const competitivePlaythrough = runPlaythrough([
      { type: EvoPointSpending.COMPETITION_BIAS, amount: 10 }
    ]);
    
    expect(cooperativePlaythrough.ending).toBe(EndingType.MUTUALISM);
    expect(competitivePlaythrough.ending).toBe(EndingType.DOMINATION);
  });
});
```

### Emergent Complexity Validation

```typescript
// Test that the game remains emergent despite player influence
describe('Emergent Complexity', () => {
  test('same influences produce different specific outcomes', () => {
    const results = [];
    
    for (let i = 0; i < 10; i++) {
      const simulation = new GameEngine(differentSeeds[i]);
      simulation.applyInfluence(EvoPointSpending.INNOVATION_BOOST, 5);
      results.push(simulation.runToCompletion());
    }
    
    // Same ending type but different specific outcomes
    expect(results.every(r => r.ending === EndingType.DOMINATION)).toBe(true);
    expect(new Set(results.map(r => r.dominantTribeName)).size).toBeGreaterThan(5);
  });
});
```

This game architecture maintains the **pure mathematical simulation** at its core while providing **meaningful player agency** and **emergent storytelling** that makes each playthrough unique despite deterministic foundations.