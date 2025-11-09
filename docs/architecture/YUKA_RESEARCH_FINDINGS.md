# 🔬 YUKA RESEARCH FINDINGS

**Source:** /tmp/yuka (cloned from https://github.com/Mugen87/yuka)  
**Date:** November 9, 2025

---

## 🎯 Key Systems in Yuka

### 1. EntityManager
**Core system that manages all entities**

```javascript
class EntityManager {
  entities = [];  // All game entities
  
  add(entity) {
    this.entities.push(entity);
    entity.manager = this;
  }
  
  update(delta) {
    // Updates ALL entities each frame
    for (const entity of this.entities) {
      if (entity.active) {
        entity.update(delta);
      }
    }
  }
}
```

**Usage:**
```javascript
const entityManager = new EntityManager();
const creature = new CreatureAgent();
entityManager.add(creature);

// Game loop
function animate() {
  entityManager.update(deltaTime);
}
```

### 2. Goal-Driven Behavior (Think + Goals)
**Hierarchical goal system with arbitration**

```javascript
class Girl extends Vehicle {
  constructor() {
    this.brain = new Think(this);
    
    // Add goal evaluators
    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new GatherEvaluator());
  }
  
  update(delta) {
    this.brain.execute();  // Execute current goal
    this.brain.arbitrate(); // Pick best goal
  }
}

class RestEvaluator extends GoalEvaluator {
  calculateDesirability(entity) {
    return entity.tired() ? 1 : 0;
  }
  
  setGoal(entity) {
    entity.brain.addSubgoal(new RestGoal(entity));
  }
}
```

### 3. Messaging System
**Entities communicate via messages**

```javascript
// Send message
this.owner.sendMessage(targetEntity, 'hit', { damage: 10 });

// Receive message
handleMessage(telegram) {
  switch (telegram.message) {
    case 'hit':
      this.health -= telegram.data.damage;
      return true;
  }
}
```

### 4. Spawning Patterns

**Pattern 1: Static spawn**
```javascript
// Create and add to manager
const enemy = new Enemy();
enemy.position.set(x, y, z);
entityManager.add(enemy);
```

**Pattern 2: Dynamic spawn**
```javascript
class Gun {
  shoot() {
    const bullet = new Bullet(this, this.ray);
    world.add(bullet); // Adds to EntityManager
  }
}
```

**Pattern 3: Respawn**
```javascript
class Collectible extends GameEntity {
  spawn() {
    // Randomize position
    this.position.x = Math.random() * 15 - 7.5;
    this.position.z = Math.random() * 15 - 7.5;
  }
  
  handleMessage(telegram) {
    if (telegram.message === 'PickedUp') {
      this.spawn(); // Respawn at new location
    }
  }
}
```

---

## 🏗️ What We Need to Build

### 1. Universe Entity Manager
**Top-level manager for all scales**

```typescript
class UniverseEntityManager {
  private galacticManager: EntityManager;    // Galaxies
  private stellarManager: EntityManager;     // Stars
  private planetaryManager: EntityManager;   // Planets
  private biosphereManager: EntityManager;   // Ecosystems
  private creatureManager: EntityManager;    // Individual creatures
  
  updateAll(delta: number) {
    this.galacticManager.update(delta);
    this.stellarManager.update(delta);
    this.planetaryManager.update(delta);
    this.biosphereManager.update(delta);
    this.creatureManager.update(delta);
  }
}
```

### 2. Agent Spawner (What We're Missing!)
**Determines WHAT, WHERE, HOW, WHY to spawn**

```typescript
class AgentSpawner {
  constructor(
    private legalBroker: LegalBroker,
    private entityManager: EntityManager
  ) {}
  
  /**
   * Ask legal broker: "Should I spawn an agent here?"
   */
  async shouldSpawnAgent(params: {
    scale: string;        // 'galactic', 'stellar', 'planetary', 'creature'
    position: Vector3;
    state: UniverseState;
  }): Promise<boolean> {
    
    const response = await this.legalBroker.ask({
      domain: this.getDomainForScale(params.scale),
      action: 'evaluate-spawn-conditions',
      params: {
        position: params.position,
        temperature: params.state.temperature,
        density: params.state.density,
        complexity: params.state.complexity,
      },
      state: params.state,
    });
    
    // Legal broker returns: Can spawn? (based on laws)
    return response.value === true;
  }
  
  /**
   * Spawn agent if conditions are met
   */
  async spawn(agentType: string, position: Vector3, state: UniverseState): Promise<Vehicle | null> {
    // Ask legal broker if spawn is valid
    const canSpawn = await this.shouldSpawnAgent({
      scale: this.getScaleForType(agentType),
      position,
      state,
    });
    
    if (!canSpawn) {
      return null; // Laws forbid spawning here
    }
    
    // Create agent based on type
    let agent: Vehicle;
    
    switch (agentType) {
      case 'stellar':
        agent = new StellarAgent(position);
        break;
      case 'planetary':
        agent = new PlanetaryAgent(position);
        break;
      case 'creature':
        agent = new CreatureAgent(position);
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
    
    // Give agent goals based on laws
    await this.assignGoals(agent, state);
    
    // Add to entity manager
    this.entityManager.add(agent);
    
    return agent;
  }
  
  /**
   * Ask legal broker what goals this agent should have
   */
  async assignGoals(agent: Vehicle, state: UniverseState): Promise<void> {
    const response = await this.legalBroker.ask({
      domain: agent.domain,
      action: 'get-default-goals',
      params: { agentType: agent.constructor.name },
      state,
    });
    
    // Legal broker returns list of goals
    const goals = response.value || [];
    
    for (const goalConfig of goals) {
      const goal = this.createGoal(goalConfig);
      agent.brain.addEvaluator(goal);
    }
  }
}
```

### 3. Multi-Scale Agents
**Different agent types for different scales**

```typescript
// Stellar Agent (manages star lifecycle)
class StellarAgent extends Vehicle {
  mass: number;
  fuel: number;
  
  constructor(position: Vector3) {
    super();
    this.position.copy(position);
    this.brain = new Think(this);
    
    // Goals determined by mass (from legal broker)
    // - Fuse hydrogen
    // - Go supernova (if mass > 8 M☉)
    // - Form planetary disk
  }
  
  update(delta: number) {
    // Ask legal broker what to do
    const action = await LEGAL_BROKER.ask({
      domain: 'physics',
      action: 'stellar-evolution-step',
      params: { mass: this.mass, fuel: this.fuel, age: this.age },
      state: currentUniverseState,
    });
    
    // Execute lawful action
    this.executeAction(action);
    
    super.update(delta);
  }
}

// Creature Agent (manages individual behavior)
class CreatureAgent extends Vehicle {
  energy: number;
  hunger: number;
  
  constructor(position: Vector3) {
    super();
    this.position.copy(position);
    this.brain = new Think(this);
    
    // Goals from legal broker
    // - Find food (ecology laws)
    // - Avoid predators (behavioral laws)
    // - Reproduce (biology laws)
  }
  
  update(delta: number) {
    // Ask legal broker for metabolism
    const metabolicCost = await LEGAL_BROKER.ask({
      domain: 'biology',
      action: 'calculate-metabolism',
      params: { mass: this.mass, activity: this.velocity.length() },
      state: currentUniverseState,
    });
    
    this.energy -= metabolicCost.value * delta;
    
    // Goals arbitrate based on energy
    this.brain.execute();
    this.brain.arbitrate();
    
    super.update(delta);
  }
}
```

---

## 🎯 The Architecture We Need

```
UniverseEntityManager
├─ GalacticEntityManager
│  └─ GalacticAgents[] (manage galaxy formation)
│     ├─ Goal: Form spiral structure
│     ├─ Goal: Merge with neighbors
│     └─ Ask LegalBroker: "Can I merge?" (gravity laws)
│
├─ StellarEntityManager
│  └─ StellarAgents[] (manage stars)
│     ├─ Goal: Fuse hydrogen
│     ├─ Goal: Go supernova (if massive)
│     └─ Ask LegalBroker: "Should I explode?" (stellar laws)
│
├─ PlanetaryEntityManager
│  └─ PlanetaryAgents[] (manage planets)
│     ├─ Goal: Maintain stable orbit
│     ├─ Goal: Retain atmosphere
│     └─ Ask LegalBroker: "Can I hold atmosphere?" (planetary laws)
│
└─ BiosphereEntityManager
   └─ CreatureAgents[] (manage creatures)
      ├─ Goal: Find food
      ├─ Goal: Avoid predators
      ├─ Goal: Reproduce
      └─ Ask LegalBroker: "How much energy?" (biology laws)
```

**Each scale has its own EntityManager + Agent types.**

---

## 🚀 What This Means

### We Have (Good!)
✅ **Legal Brokers** - Understand laws, route requests  
✅ **Domain Regulators** - 6 regulators (physics, biology, ecology, social, tech, planetary)  
✅ **Laws** - 57 law files with all formulas

### We Don't Have (Need!)
❌ **Entity Managers** - No manager for each scale  
❌ **Agent Spawner** - No system to spawn agents  
❌ **Multi-scale agents** - No StellarAgent, PlanetaryAgent, etc.  
❌ **Goal assignments** - No connection between laws and agent goals  
❌ **Real simulation** - Just procedural generation

---

## 🎮 Next Steps

### 1. Build Agent Spawner
```typescript
class AgentSpawner {
  async spawnStellarAgent(position, state)
  async spawnPlanetaryAgent(position, state)
  async spawnCreatureAgent(position, state)
  
  // Each asks legal broker if spawn is valid
  // Legal broker checks laws
  // If valid, create agent with appropriate goals
}
```

### 2. Create Multi-Scale Agents
```typescript
class StellarAgent extends Vehicle
class PlanetaryAgent extends Vehicle
class CreatureAgent extends Vehicle

// Each has Think brain
// Each has goals from legal broker
// Each makes decisions based on laws
```

### 3. Wire Legal Brokers to Agents
```typescript
// Agent asks broker for guidance
const response = await LEGAL_BROKER.ask({
  domain: 'stellar',
  action: 'should-go-supernova',
  params: { mass, fuel, age },
  state,
});

// Broker consults laws, returns answer
if (response.value === true) {
  this.setGoal(new SupernovaGoal());
}
```

---

## 💡 The Revelation

**We've been building a procedural generator.**

**We should be building a multi-agent simulation.**

**Legal brokers are READY.**  
**Agents are MISSING.**  
**Spawner doesn't EXIST.**

**That's what needs to be built.**

---

**Next:** Build the spawner + multi-scale agents
