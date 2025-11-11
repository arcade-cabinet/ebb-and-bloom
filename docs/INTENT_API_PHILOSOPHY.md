# Intent API Philosophy - Fair Competition Through Laws

**Core Principle:** What breaks most games is DIRECTLY influencing the changes AI opponents make. That's what causes complaints about AI cheating. **This isn't that game.**

## The Problem with Traditional AI

### Unfair Games (What We're NOT):
```typescript
// Player action
player.smitePredator(wolf) → wolf.health = 0  // Direct manipulation

// AI action (with cheats)
ai.smitePredator(playerCreature) → {
  if (difficulty === 'easy') {
    playerCreature.health -= 50;  // Reduced damage
  } else {
    playerCreature.health = 0;  // Instant kill
  }
}
```

**Problem:** Player and AI play by different rules. AI can cheat. No real competition.

---

## Ebb & Bloom Solution: Intent API

### Both Player and AI Submit Intents

```typescript
// PLAYER submits intent
const playerIntent: GovernorIntent = {
  action: 'smite_predator',
  target: wolfEntityId,
  magnitude: 1.0,
  energyCost: 1000
};

await gameState.executeGovernorIntent(playerIntent);

// RIVAL AI submits SAME intent
const rivalIntent: GovernorIntent = {
  action: 'smite_predator',
  target: playerCreatureEntityId,
  magnitude: 1.0,
  energyCost: 1000
};

await gameState.executeGovernorIntent(rivalIntent);
```

**SAME FUNCTION CALL. SAME PATH. SAME LAWS.**

---

## How Intent API Works

### 1. Intent Submission (Equal Interface)

```typescript
interface GovernorActionPort {
  // Player implements this
  requestAction(action: GovernorAction, target: Target): Promise<GovernorIntent>;
}

// Player controller
class PlayerGovernorController implements GovernorActionPort {
  async requestAction(action: GovernorAction, target: Target): Promise<GovernorIntent> {
    if (this.energyBudget < action.cost) {
      throw new Error('Insufficient energy');
    }
    this.energyBudget -= action.cost;
    return { action, target, magnitude: 1.0 };
  }
}

// Rival AI controller (FUTURE)
class RivalAIGovernorController implements GovernorActionPort {
  async requestAction(action: GovernorAction, target: Target): Promise<GovernorIntent> {
    if (this.energyBudget < action.cost) {
      throw new Error('Insufficient energy');  // SAME CONSTRAINT
    }
    this.energyBudget -= action.cost;  // SAME COST
    return { action, target, magnitude: 1.0 };  // SAME INTENT
  }
}
```

**Same interface. Same constraints. Same costs.**

---

### 2. Intent Execution (Same Laws Apply)

```typescript
class GovernorActionExecutor {
  async execute(intent: GovernorIntent): Promise<void> {
    switch (intent.action) {
      case 'smite_predator':
        await this.smitePredator(intent);
        break;
      // ... other actions
    }
  }
  
  private async smitePredator(intent: GovernorIntent): Promise<void> {
    const targetId = intent.target as string;
    const target = this.world.getEntity(targetId);
    
    if (!target) return;  // Already dead / doesn't exist
    
    // LAWS determine outcome, not intent source
    const damage = this.genesis.getGravity() * intent.magnitude * 100;
    
    if (target.energyStores !== undefined) {
      target.energyStores -= damage;
      
      if (target.energyStores <= 0) {
        // Conservation law: Entity → Materials
        const corpse = this.createCorpseFromEntity(target);
        this.world.add(corpse);
        this.world.remove(targetId);
        this.scene.remove(target.mesh);
      }
    }
  }
}
```

**Laws determine outcome. Doesn't matter if player or AI submitted intent.**

---

### 3. Law Systems Constrain Both Equally

Both player and AI intents pass through 11 scientific law systems:

```typescript
class LawOrchestrator {
  async tick(deltaTime: number): Promise<void> {
    // These systems apply to ALL entities, regardless of who created them
    await this.thermodynamicsSystem.update(this.world, deltaTime);
    await this.metabolismSystem.update(this.world, deltaTime);
    await this.ecologySystem.update(this.world, deltaTime);
    // ... 8 more systems
  }
}
```

**Conservation laws tracked universally:**

```typescript
class ConservationLedger {
  private totalMass: number = 0;
  private totalCharge: number = 0;
  private totalEnergy: number = 0;
  
  addEntity(entity: Entity): void {
    if (entity.mass) this.totalMass += entity.mass;
    if (entity.charge) this.totalCharge += entity.charge;
    // ... Energy calculation
  }
  
  removeEntity(entity: Entity): void {
    if (entity.mass) this.totalMass -= entity.mass;
    // Cannot cheat conservation - ledger enforces physics
  }
}
```

**You can't cheat thermodynamics. Neither can AI.**

---

## Available Intents (Equal Power)

### 7 Governor Actions (Player and AI):

1. **smitePredator** - Damage/kill threatening entity
   - Cost: 1000 energy
   - Laws: Damage based on gravity, conservation creates corpse

2. **nurtureFood** - Spawn vegetation
   - Cost: 500 energy
   - Laws: Temperature from genesis, elements from metallicity

3. **shapeTerrain** - Modify terrain height
   - Cost: 800 energy
   - Laws: Affects structural entities, physics recalculation

4. **applyPressure** - Environmental stress
   - Cost: 600 energy
   - Laws: Temperature/energy modification, metabolism responds

5. **selectPrey** - Mark hunt targets
   - Cost: 300 energy
   - Laws: Ecology system interprets, creature AI responds

6. **formAlliance** - Create mutualism
   - Cost: 400 energy
   - Laws: Culture system mediates, social bonds form

7. **migrate** - Trigger population movement
   - Cost: 700 energy
   - Laws: Ecology system calculates carrying capacity

**Energy budgets enforced equally. Laws apply equally. No favorites.**

---

## Why This Prevents Cheating

### Traditional Game AI Cheating:
- AI gets free resources
- AI bypasses fog of war
- AI units have better stats
- AI ignores cooldowns
- Difficulty = how much AI cheats

### Ebb & Bloom Fairness:
- ✅ Same energy budget regeneration rate
- ✅ Same fog of war (spatial queries based on creature positions)
- ✅ Same entity stats (determined by genome + phenotype)
- ✅ Same action cooldowns (if implemented)
- ✅ Difficulty = genesis biases, NOT AI advantages

**Difficulty slider doesn't make AI cheat. It changes initial world conditions (Dead World Bias) that affect BOTH player and AI equally.**

---

## Indirect Influence (Shared Constraint)

**Neither player nor AI can force evolutionary outcomes.**

### Example: Player Wants Fins

```typescript
// Player attempts
for (let i = 0; i < 100; i++) {
  await gameState.executeGovernorIntent({
    action: 'nurture_food',
    target: underwaterLocation,
    magnitude: 1.0
  });
}

// Creature AI evaluates (same for player and rival creatures)
class CreatureAI {
  evaluateEnvironment(): void {
    const foodNearWater = this.queryNearbyFood(waterLocation);
    const landFood = this.queryNearbyFood(landLocation);
    
    if (foodNearWater > landFood) {
      this.goals.push({ type: 'explore_water', priority: 0.8 });
    }
    
    // Over generations, MAYBE fins develop
    // OR they develop fear of water
    // Laws + genetics determine outcome, not player intent
  }
}
```

**Player suggested. Laws decided. AI can do the exact same thing to their creatures.**

---

## Competition Scenarios

### Scenario 1: Resource Competition

```typescript
// Player nurtures food in territory A
await playerController.requestAction('nurture_food', territoryA);

// Rival AI detects via spatial queries
const playerFood = rivalAI.queryVisibleResources();
if (playerFood.density > myFood.density) {
  // Rival AI responds with SAME TOOLS
  await rivalController.requestAction('nurture_food', territoryB);
}
```

**Fair competition: Both use same action, same cost, same law outcomes.**

### Scenario 2: Predator Management

```typescript
// Rival AI's creature threatens player's creatures
const threat = playerAI.detectThreats();

// Player smites predator
await playerController.requestAction('smite_predator', threat.entityId);

// Rival AI can do the same to player's creatures
const playerThreat = rivalAI.detectThreats();
await rivalController.requestAction('smite_predator', playerThreat.entityId);
```

**Tit for tat. Same power. Same constraints.**

---

## What Makes Competition Interesting

### Not Cheating - STRATEGY:

1. **Energy Management:** Spend on offense or defense?
2. **Spatial Tactics:** Where to nurture food? Where to shape terrain?
3. **Evolutionary Bets:** Push aquatic or terrestrial adaptation?
4. **Alliance Timing:** When to cooperate vs compete?
5. **Migration Strategy:** Expand territory or consolidate?

**Winner determined by:**
- Better strategic decisions
- Better understanding of laws
- Better prediction of evolutionary outcomes
- Better resource management

**NOT determined by:**
- AI getting free actions
- AI bypassing costs
- AI having better units
- AI ignoring physics

---

## Implementation Guarantees

### Single Code Path:
```typescript
// Both player and AI go through SAME executor
class GameState {
  executeGovernorIntent(intent: GovernorIntent): Promise<void> {
    // Don't care who submitted - player or AI
    return this.governorExecutor.execute(intent);
  }
}
```

### Same Law Application:
```typescript
// Laws don't check intent source
class ThermodynamicsSystem {
  update(world: World, deltaTime: number): void {
    for (const entity of world.getAllEntities()) {
      // Apply heat transfer regardless of who created entity
      this.applyHeatTransfer(entity, deltaTime);
    }
  }
}
```

### Logged for Transparency:
```typescript
// All intents logged (future feature)
console.log(`[${intent.source}] executed ${intent.action} → outcome: ${result}`);
// Player can SEE what rival AI did and verify fairness
```

---

## Summary

**"Natural laws, social laws, etc. are what both player and AI must abide by."**

This is the INTENT API philosophy:
1. Player and AI use same interface (GovernorActionPort)
2. Same costs, same constraints
3. Laws determine outcomes, not intent source
4. No cheating possible - physics enforces fairness
5. Competition is strategic, not asymmetric

**This is why the game doesn't break.** Because we can't accidentally give AI advantages. The code path is shared. The laws are universal.
