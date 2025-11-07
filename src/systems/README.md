# Systems

**ECS game logic systems**

---

## What's Here

All game logic lives in ECS systems. React Three Fiber components ONLY render.

---

## Key Systems

- **YukaSphereCoordinator** - Coordinates all evolution (Gen 2+)
- **CreatureArchetypeSystem** - Creature spawning & archetypes
- **ToolArchetypeSystem** - Tool emergence (not integrated yet)
- **BuildingSystem** - Building construction (not integrated yet)
- **RawMaterialsSystem** - Material distribution (hardcoded, needs Gen 0)
- **PackSocialSystem** - Pack formation & dynamics
- **CombatSystem** - Combat mechanics (not triggered yet)
- **ConsciousnessSystem** - Player as transferable awareness
- **DeconstructionSystem** - Reverse synthesis on death
- **GeneticSynthesisSystem** - Trait blending & morphology
- **EnvironmentalPressureSystem** - Pollution & shock events
- **PopulationDynamicsSystem** - Population tracking
- **GameClock** - Time & generation management
- **HaikuNarrativeSystem** - Procedural storytelling
- **SporeStyleCameraSystem** - Dynamic camera
- **HapticGestureSystem** - Touch input & feedback
- **GestureActionMapper** - Gesture → game actions
- **TextureSystem** - Texture loading
- **TerrainSystem** - Procedural terrain

---

## Architecture

**Gen 0**: Planetary genesis (TO BE IMPLEMENTED)  
**Gen 1**: ECS archetypes  
**Gen 2+**: Yuka AI evolution

See `docs/ARCHITECTURE.md` for details.

---

## Critical Missing

- **PlanetaryPhysicsSystem** - Gen 0 foundation
- **Tool Sphere integration** - Tools never emerge
- **Building integration** - Buildings never construct
- **Inter-sphere communication** - Spheres don't signal each other

