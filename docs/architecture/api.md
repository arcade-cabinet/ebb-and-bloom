# REST API Package Architecture

**Package**: `packages/api/` (future extraction from `packages/backend/`)  
**Purpose**: RESTful HTTP interface to the simulation  
**Architecture**: Resource-based endpoints, stateless operations

## Core Insight

From the chat chronology analysis: **Backend "systems" are actually REST resources/endpoints, not continuous game loop systems.**

The backend exposes simulation state through HTTP operations that compute state on-demand, not through 60fps system loops.

## Resource Architecture

### Planet Resource (`/api/planet/`)
```http
GET /api/planet/info                    # Planet metadata
GET /api/planet/query?x={x}&y={y}&z={z} # Material composition at coordinates
GET /api/planet/surface?lat={lat}&lon={lon} # Surface material at lat/lon
POST /api/planet/raycast               # Cast ray from surface to core
```

**Responsibilities**:
- Query planetary composition using Gen 0 AccretionSimulation
- Provide material accessibility based on depth and available tools
- Calculate surface coordinates from 3D positions
- Return visual blueprint data for rendering

### Creature Resource (`/api/creatures/`)
```http
GET /api/creatures                     # All active creatures
GET /api/creatures/{id}               # Specific creature
GET /api/creatures/at?lat={lat}&lon={lon} # Creatures at location
POST /api/creatures/advance           # Advance creature AI decisions
```

**Responsibilities**:
- Expose creature states from Gen 1 CreatureSystem
- Execute Yuka Goal evaluation on-demand
- Return creature visual blueprints and current actions
- Handle creature lifecycle (spawn, evolve, death)

### Pack Resource (`/api/packs/`)
```http
GET /api/packs                        # All active packs
GET /api/packs/{id}                  # Specific pack
GET /api/packs/{id}/territory        # Pack territorial boundaries
POST /api/packs/update-formation     # Update pack formations
```

**Responsibilities**:
- Expose pack states from Gen 2 PackSystem
- Execute Yuka FuzzyModule pack formation logic
- Return flocking behavior states and territory data
- Handle pack merging/splitting events

### Tool Resource (`/api/tools/`)
```http
GET /api/tools                        # All available tools
GET /api/tools/available?creature={id} # Tools available to creature
POST /api/tools/emerge               # Evaluate tool emergence
POST /api/tools/{id}/use             # Use specific tool
```

**Responsibilities**:
- Expose tool states from Gen 3 ToolSystem
- Execute Yuka FuzzyModule tool emergence evaluation
- Handle tool durability and effectiveness
- Return material accessibility unlocked by tools

### Tribe Resource (`/api/tribes/`)
```http
GET /api/tribes                       # All active tribes
GET /api/tribes/{id}/governance      # Tribal governance structure
GET /api/tribes/{id}/territory       # Tribal territory
POST /api/tribes/cooperation         # Evaluate cooperation events
```

**Responsibilities**:
- Expose tribe states from Gen 4 TribeSystem
- Handle multi-pack coordination
- Execute cooperation benefit calculations
- Return governance and social structure data

### Building Resource (`/api/buildings/`)
```http
GET /api/buildings                    # All constructed buildings
GET /api/buildings/by-location?lat={lat}&lon={lon} # Buildings at location
POST /api/buildings/construct        # Evaluate construction need
POST /api/buildings/{id}/use         # Use building functionality
```

**Responsibilities**:
- Expose building states from Gen 5 BuildingSystem
- Execute construction requirement evaluation
- Handle building functionality (shelter, workshop, storage)
- Return building visual blueprints and capacity data

### Abstract Systems Resource (`/api/abstract-systems/`)
```http
GET /api/abstract-systems             # All active abstract organizational systems
GET /api/abstract-systems/{id}       # Specific abstract system details
GET /api/abstract-systems/by-type?type={type} # Systems by type (religious, political, etc.)
POST /api/abstract-systems/evaluate  # Evaluate emergence conditions
```

**Responsibilities**:
- Expose abstract social system states from Gen 6 AbstractSocialSystem
- Handle emergence evaluation for different system types (religious, political, economic, cultural, philosophical)
- Execute abstract system functions (meaning creation, power allocation, resource management, knowledge preservation, principle application)
- Return abstract system visual blueprints and symbolic representations

## Simulation Cycle Resource (`/api/simulation/`)
```http
GET /api/simulation/status           # Current simulation state
POST /api/simulation/advance         # Advance one simulation cycle
POST /api/simulation/advance-to?cycle={n} # Advance to specific cycle
GET /api/simulation/events           # Recent simulation events
```

**Responsibilities**:
- Control simulation time advancement
- Execute day/night cycle transitions
- Coordinate all Gen 0-6 system updates
- Return simulation-wide events and status

## Data Flow Architecture

### Request Processing
1. **HTTP Request** → API endpoint
2. **Parameter Validation** → Zod schema validation
3. **Simulation Query** → Appropriate Gen X system
4. **Yuka Decision Execution** → AI processing if needed
5. **Response Formatting** → Include visual blueprints
6. **HTTP Response** → JSON with complete data

### State Management
- **Stateless Operations**: Each request is independent
- **Database Persistence**: SQLite + Drizzle ORM for simulation state
- **Caching Layer**: Redis for expensive computations (optional)
- **Event Sourcing**: Track all state changes for reproducibility

### Visual Blueprint Integration

Every API response includes visual blueprint data:

```json
{
  "entity": {
    "id": "creature_123",
    "type": "cursorial_forager",
    "position": { "lat": 45.0, "lon": -122.0 },
    "visualBlueprint": {
      "description": "Swift, ground-dwelling forager",
      "representations": {
        "materials": ["organic/fur_brown.jpg", "organic/bone_white.jpg"],
        "shaders": { "roughness": 0.8, "metallic": 0.0 },
        "proceduralRules": "quadruped_swift_movement",
        "colorPalette": ["#8B4513", "#FFFFFF", "#000000"]
      },
      "canCreate": ["simple_tools", "pack_coordination"],
      "cannotCreate": ["complex_machinery", "written_language"],
      "compatibleWith": ["pack_structures", "foraging_grounds"],
      "compositionRules": "pack_animal_rendering"
    }
  }
}
```

## Error Handling

### Yuka Decision Failures
- **Stuck Entities**: Automatic failsafe systems (death/decomposition)
- **Invalid Goals**: Fallback to simpler goal hierarchies
- **Resource Conflicts**: Fuzzy logic resolution mechanisms

### API Error Responses
```json
{
  "error": {
    "type": "YukaDecisionFailure",
    "message": "Creature stuck in invalid state",
    "action": "automated_decomposition_initiated",
    "recovery": "new_creature_spawned_at_location"
  }
}
```

## Performance Considerations

### Computation Strategies
- **On-Demand Calculation**: No continuous loops, compute when requested
- **Spatial Indexing**: Efficient location-based queries
- **Yuka Optimization**: Proper use of EntityManager and Time systems
- **Caching**: Cache expensive AI computations

### Scalability
- **Horizontal Scaling**: Stateless design enables multiple API instances
- **Database Sharding**: Spatial partitioning for large simulations
- **Async Processing**: Long-running Yuka decisions via job queues

## Integration with Other Packages

### Simulation Package
- API package calls simulation functions directly
- No duplication of business logic
- Simulation package remains pure mathematics

### Frontend Package  
- Frontend makes HTTP requests to API
- No direct simulation access
- Complete data received via visual blueprints

### CLI Package
- CLI makes HTTP requests to API (same interface as frontend)
- Programmatic access for testing and debugging
- No special CLI-only endpoints

### Game Package
- Game layer adds player interaction endpoints
- Extends base API with game-specific resources
- Player agency implemented as additional REST operations

This API architecture enables multiple frontends (3D, CLI, mobile) while maintaining a single source of truth for simulation logic.