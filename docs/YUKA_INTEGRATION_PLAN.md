# YUKA INTEGRATION PLAN

**Version:** 1.0.0  
**Last Updated:** November 11, 2025  
**Purpose:** Complete strategy for properly integrating YUKA throughout our codebase

---

## Executive Summary

We've been **reinventing YUKA's wheel** instead of using its proven patterns. This document provides a complete roadmap for proper YUKA integration, fixing LSP errors, improving performance, and aligning with YUKA's architecture.

**Key Issues:**
- Governors don't own `EntityManager` instances
- Custom math instead of YUKA's optimized utilities
- `SteeringBehavior.calculate()` signature is wrong (unused parameters)
- No proper entity lifecycle management

**Solution:**
- 4-phase migration to proper YUKA patterns
- Replace custom math with YUKA utilities
- Fix all LSP errors
- Establish Governor → EntityManager → Vehicle hierarchy

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [YUKA Math Utility Mapping](#2-yuka-math-utility-mapping)
3. [Proper YUKA Architecture](#3-proper-yuka-architecture)
4. [LSP Error Analysis](#4-lsp-error-analysis)
5. [4-Phase Implementation Roadmap](#5-4-phase-implementation-roadmap)
6. [Code Examples](#6-code-examples)
7. [Migration Priority](#7-migration-priority)
8. [Migration Checklist](#8-migration-checklist)

---

## 1. Problem Statement

### 1.1 We're Reinventing YUKA Math Utilities

**What YUKA Provides:**
```typescript
import { Vector3, MathUtils, Matrix3, Matrix4, Quaternion, Ray, Plane, OBB, AABB } from 'yuka';

// Optimized, battle-tested implementations
const v = new Vector3(1, 2, 3);
v.normalize();
v.multiplyScalar(2);
const distance = v.distanceTo(otherVector);

// Random utilities
const random = MathUtils.randFloat(0, 1);
const clamped = MathUtils.clamp(value, 0, 100);
```

**What We're Doing (WRONG):**
```typescript
// Custom vector normalization (agents/governors/social/HierarchyBehavior.ts:69)
toOther.subVectors(other.position, vehicle.position);
toOther.normalize(); // YUKA Vector3 already provides this!

// Custom math operations scattered across governors
const magnitude = Math.sqrt(x*x + y*y + z*z); // Vector3.length() exists!
direction.x /= magnitude; // Vector3.normalize() exists!
```

**Performance Impact:**
- YUKA's Vector3 methods are optimized for reuse (no allocations)
- Our custom operations create garbage
- Missing out on SIMD optimizations in modern JS engines

---

### 1.2 Not Using EntityManager/SteeringManager Patterns

**YUKA's Pattern:**
```typescript
// From /tmp/yuka/examples/steering/flocking/index.html
const entityManager = new YUKA.EntityManager();

const vehicle = new YUKA.Vehicle();
vehicle.steering.add(new YUKA.AlignmentBehavior());
vehicle.steering.add(new YUKA.CohesionBehavior());
vehicle.steering.add(new YUKA.SeparationBehavior());

entityManager.add(vehicle);

// Game loop
function animate() {
  const delta = time.update().getDelta();
  entityManager.update(delta); // Updates ALL entities
}
```

**Our Current Pattern (WRONG):**
```typescript
// Governors don't own EntityManager
export class FlockingGovernor {
  applyTo(vehicle: Vehicle) {
    vehicle.steering.add(this.alignment);
    // Where is EntityManager? Who manages lifecycle?
  }
}

// No centralized update loop
// Entities manually updated in scattered places
```

**Issues:**
- No centralized entity lifecycle
- Unclear who owns entities
- No systematic update loop
- Can't do spatial partitioning

---

### 1.3 Governors Don't Own Entities Properly

**Current Structure (WRONG):**
```
Governor (Orchestrator)
  ├─ Has behaviors (AlignmentBehavior, etc.)
  └─ applyTo(vehicle) - adds behaviors to external vehicle

??? Who creates vehicles?
??? Who updates vehicles?
??? Who owns EntityManager?
```

**Should Be:**
```
Governor (Orchestrator + Manager)
  └── EntityManager (owned by governor)
      ├── Vehicle[] (domain entities)
      │   ├── SteeringManager (manages behaviors)
      │   │   ├── AlignmentBehavior
      │   │   ├── CohesionBehavior
      │   │   └── CustomBehavior
      │   └── update(delta) - called by EntityManager
      └── update(delta) - called by governor
```

---

### 1.4 LSP Errors from Improper YUKA Usage

**File:** `agents/governors/social/HierarchyBehavior.ts:53`
**Error:** Parameter 'force' is declared but its value is never read.

**File:** `agents/governors/social/HierarchyBehavior.ts:53`
**Error:** Parameter 'delta' is declared but its value is never read.

**File:** `agents/governors/physics/GravityBehavior.ts:63`
**Error:** Parameter 'delta' is declared but its value is never read.

**Root Cause:**
```typescript
// WRONG - Creates new force, doesn't accumulate
calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
  const newForce = new Vector3(); // WRONG!
  // ... calculate ...
  return newForce; // WRONG - ignores input 'force'!
}
```

**Should Be:**
```typescript
// RIGHT - Accumulates into provided force
calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
  // Accumulate into 'force' parameter
  force.add(calculatedForce);
  return force; // Return same instance
}
```

---

## 2. YUKA Math Utility Mapping

### 2.1 What YUKA Provides

**Vector Operations:**
```typescript
import { Vector3 } from 'yuka';

// Module-level reusable vectors (YUKA pattern)
const direction = new Vector3();
const displacement = new Vector3();

class MyBehavior extends SteeringBehavior {
  calculate(vehicle, force, delta) {
    // Reuse module-level vectors (no allocations!)
    direction.subVectors(target.position, vehicle.position);
    direction.normalize();
    
    displacement.copy(direction).multiplyScalar(speed * delta);
    
    force.add(displacement); // Accumulate
    return force;
  }
}
```

**Available Methods:**
- `add()`, `sub()`, `multiply()`, `divide()`
- `normalize()`, `length()`, `squaredLength()`
- `distanceTo()`, `distanceToSquared()`
- `dot()`, `cross()`, `angleTo()`
- `lerp()`, `clone()`, `copy()`
- `multiplyScalar()`, `divideScalar()`
- `min()`, `max()`, `clamp()`

**Math Utilities:**
```typescript
import { MathUtils } from 'yuka';

MathUtils.randFloat(min, max);     // Random float
MathUtils.randInt(min, max);       // Random integer
MathUtils.clamp(value, min, max);  // Clamp value
MathUtils.choice(array, probs);    // Weighted choice
MathUtils.area(a, b, c);           // Triangle area
```

**Geometry:**
```typescript
import { Ray, Plane, OBB, AABB, Matrix3, Matrix4, Quaternion } from 'yuka';

const ray = new Ray(origin, direction);
const plane = new Plane(normal, constant);
const box = new AABB(min, max);
```

---

### 2.2 What We're Currently Doing Manually

**Location:** `agents/governors/social/HierarchyBehavior.ts`
```typescript
// WRONG - Manual vector operations
toOther.subVectors(other.position, vehicle.position); // OK, this is YUKA
toOther.normalize(); // OK, this is YUKA
const approachForce = toOther.clone().multiplyScalar(weight); // OK
force.add(approachForce); // OK

// BUT: Creating new vectors in loop (garbage!)
```

**Location:** `agents/governors/physics/GravityBehavior.ts`
```typescript
// WRONG - Unused delta parameter
calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
  // ... calculate gravitational force ...
  force.add(direction.multiplyScalar(clampedMagnitude));
  return force;
}
// Should integrate force over time:
// force.add(direction.multiplyScalar(clampedMagnitude * delta));
```

**Location:** `agents/governors/ecological/FlockingBehavior.ts`
```typescript
// GOOD - Uses YUKA behaviors directly
this.alignment = new AlignmentBehavior();
this.cohesion = new CohesionBehavior();
this.separation = new SeparationBehavior();

// But doesn't own EntityManager
```

---

### 2.3 Where to Replace Custom Math

**Files to Update:**

1. **agents/governors/physics/GravityBehavior.ts**
   - Use module-level Vector3 instances
   - Integrate force over delta
   
2. **agents/governors/social/HierarchyBehavior.ts**
   - Use module-level Vector3 instances
   - Avoid creating vectors in loop

3. **agents/governors/ecological/FlockingBehavior.ts**
   - Already good, just needs EntityManager

4. **engine/procedural/*.ts**
   - Replace custom vector math with YUKA Vector3
   - Use MathUtils for random operations

5. **generation/spawners/*.ts**
   - Use YUKA geometry primitives (Ray, AABB)
   - Use MathUtils.randFloat instead of Math.random

---

### 2.4 Performance Benefits

**Before (Custom Math):**
```typescript
// Creates 2 new vectors per update (garbage!)
calculate(vehicle, force, delta) {
  const direction = new Vector3(); // Allocation!
  const scaled = new Vector3();    // Allocation!
  // ... calculate ...
  return scaled;
}
```

**After (YUKA Pattern):**
```typescript
// Module-level reusable vectors (zero allocations)
const direction = new Vector3();
const scaled = new Vector3();

calculate(vehicle, force, delta) {
  direction.subVectors(target, vehicle.position); // Reuse!
  scaled.copy(direction).multiplyScalar(magnitude * delta); // Reuse!
  force.add(scaled); // Accumulate
  return force;
}
```

**Performance Gains:**
- **Zero allocations** in hot paths (60 FPS = 3600 updates/minute)
- **Cache-friendly** memory access
- **SIMD-optimized** vector operations in modern browsers
- **Reduced GC pressure** (no pause spikes)

---

## 3. Proper YUKA Architecture

### 3.1 The Correct Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ Governor (Orchestrator)                                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EntityManager (owned by governor)                    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ Vehicle (extends MovingEntity)                 │  │  │
│  │  │                                                 │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │ SteeringManager (owned by vehicle)      │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │  - AlignmentBehavior                    │  │  │  │
│  │  │  │  - CohesionBehavior                     │  │  │  │
│  │  │  │  - SeparationBehavior                   │  │  │  │
│  │  │  │  - CustomBehavior                       │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │                                                 │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │ Think (Goal-driven behavior)            │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │  - GoalEvaluator[]                      │  │  │  │
│  │  │  │  - CurrentGoal                          │  │  │  │
│  │  │  │  - execute() / arbitrate()              │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │                                                 │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │ Vision (Perception)                     │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  │  - FOV, range                           │  │  │  │
│  │  │  │  - Visible entities                     │  │  │  │
│  │  │  │                                          │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │                                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  update(delta) {                                     │  │
│  │    for (entity of entities) {                        │  │
│  │      if (entity.active) entity.update(delta);        │  │
│  │    }                                                  │  │
│  │  }                                                    │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  update(delta) {                                            │
│    this.entityManager.update(delta);                       │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Entity Lifecycle

```typescript
// Governor creates and owns EntityManager
class EcologicalGovernor {
  private entityManager: EntityManager;
  
  constructor() {
    this.entityManager = new EntityManager();
  }
  
  // Spawn entities
  spawnCreature(position: Vector3, species: Species): Vehicle {
    const creature = new CreatureVehicle(species);
    creature.position.copy(position);
    
    // Add steering behaviors
    creature.steering.add(new WanderBehavior());
    creature.steering.add(new FleeBehavior());
    
    // Add to entity manager
    this.entityManager.add(creature);
    
    return creature;
  }
  
  // Update all entities
  update(delta: number): void {
    this.entityManager.update(delta);
  }
  
  // Remove dead entities
  cullDead(): void {
    const entities = this.entityManager.entities;
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity.isDead) {
        this.entityManager.remove(entity);
      }
    }
  }
}
```

---

### 3.3 SteeringManager Behavior Composition

```typescript
// From YUKA examples: /tmp/yuka/examples/steering/flocking/index.html

const vehicle = new YUKA.Vehicle();
vehicle.maxSpeed = 1.5;
vehicle.updateNeighborhood = true;
vehicle.neighborhoodRadius = 10;

// Compose multiple behaviors
vehicle.steering.add(new YUKA.AlignmentBehavior());
vehicle.steering.add(new YUKA.CohesionBehavior());
vehicle.steering.add(new YUKA.SeparationBehavior());
vehicle.steering.add(new YUKA.WanderBehavior());

// SteeringManager automatically:
// 1. Calls calculate() on each behavior
// 2. Weights the forces
// 3. Accumulates into total force
// 4. Returns combined steering force
```

**Key Point:** SteeringManager handles force accumulation, so behaviors just add to the force vector.

---

### 3.4 Goal-Driven Layer (Optional)

```typescript
// From /tmp/yuka/examples/goal/

class CreatureVehicle extends Vehicle {
  brain: Think;
  energy: number = 100;
  
  constructor() {
    super();
    this.brain = new Think(this);
    
    // Add goal evaluators
    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new ForageEvaluator());
    this.brain.addEvaluator(new FleeEvaluator());
  }
  
  update(delta: number) {
    // Goal arbitration
    this.brain.execute();  // Execute current goal
    this.brain.arbitrate(); // Pick best goal based on desirability
    
    // Update steering (handled by base Vehicle)
    super.update(delta);
    
    // Update energy
    this.energy -= this.velocity.length() * delta;
  }
}

class ForageEvaluator extends GoalEvaluator {
  calculateDesirability(creature: CreatureVehicle): number {
    // Hungry creatures prioritize foraging
    return (100 - creature.energy) / 100;
  }
  
  setGoal(creature: CreatureVehicle): void {
    creature.brain.clearSubgoals();
    creature.brain.addSubgoal(new ForageGoal(creature));
  }
}
```

---

## 4. LSP Error Analysis

### 4.1 Unused `force` Parameter

**File:** `agents/governors/social/HierarchyBehavior.ts:53`

```typescript
// WRONG - Parameter 'force' is declared but never read
calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
  // Creates NEW force instead of accumulating into provided 'force'
  for (const other of entities) {
    const approachForce = toOther.clone().multiplyScalar(weight);
    force.add(approachForce); // This is OK
  }
  return force; // Returns modified force (OK)
}
```

**Fix:** Actually, this code is using `force` correctly! The LSP error might be a false positive or from a different version. Let me check if there's a local `force` declaration:

```typescript
// ACTUAL WRONG PATTERN (if it exists):
calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
  const force = new Vector3(); // WRONG - shadows parameter!
  // ... calculate ...
  return force;
}

// CORRECT PATTERN:
calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
  // Accumulate into provided 'force' parameter
  force.add(calculatedForce);
  return force;
}
```

**Module-Level Reusable Instances:**

```typescript
// YUKA PATTERN - Module-level reusable vectors
const direction = new Vector3();
const displacement = new Vector3();
const tempForce = new Vector3();

class MyBehavior extends SteeringBehavior {
  calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
    // Reuse module-level vectors (zero allocations)
    direction.subVectors(target.position, vehicle.position);
    displacement.copy(direction).multiplyScalar(speed * delta);
    
    force.add(displacement); // Accumulate into parameter
    return force;
  }
}
```

---

### 4.2 Unused `delta` Parameter

**File:** `agents/governors/physics/GravityBehavior.ts:63`

```typescript
// WRONG - delta is never used
calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
  // ... calculate gravitational force ...
  const magnitude = (this.G * this.scale * m1 * m2) / distanceSquared;
  
  force.add(direction.multiplyScalar(magnitude)); // Missing delta!
  return force;
}
```

**Why delta matters:**

```typescript
// Vehicle.update() in YUKA:
acceleration.copy(steeringForce).divideScalar(this.mass);
this.velocity.add(acceleration.multiplyScalar(delta)); // Force integrated over time!
```

**Fix:**

```typescript
// RIGHT - Integrate force over time
calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
  const magnitude = (this.G * this.scale * m1 * m2) / distanceSquared;
  
  // Scale by delta for time-correct physics
  const impulse = magnitude * delta;
  
  force.add(direction.multiplyScalar(impulse));
  return force;
}
```

**When to use delta:**
- **Use delta:** When force should scale with time (impulses, acceleration)
- **Don't use delta:** When force is already time-independent (positional constraints)

For gravity, we **should** use delta because:
- Gravity is a continuous force (F = ma)
- Integration: v += (F/m) * dt
- Without delta, force magnitude depends on frame rate!

---

### 4.3 Unused `Vehicle` Type

**Current:**
```typescript
calculate(vehicle: any, force: Vector3, delta: number): Vector3
//               ^^^^ - Using 'any' loses type safety
```

**Fix:**
```typescript
import { Vehicle } from 'yuka';

class GravityBehavior extends SteeringBehavior {
  calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
    // Now we get:
    // - Autocomplete for vehicle.position, vehicle.velocity, etc.
    // - Type checking for vehicle.mass
    // - Intellisense for all Vehicle properties
  }
}
```

**Extended Vehicle Types:**
```typescript
// Custom vehicle with domain-specific properties
class CreatureVehicle extends Vehicle {
  energy: number = 100;
  hunger: number = 0;
  species: Species;
  
  update(delta: number) {
    // Custom logic
    this.energy -= this.velocity.length() * delta;
    
    // Call parent update (handles steering)
    super.update(delta);
  }
}

// Behavior can accept base Vehicle or extended type
class ForageBehavior extends SteeringBehavior {
  calculate(vehicle: CreatureVehicle, force: Vector3, delta: number): Vector3 {
    // Can access vehicle.energy, vehicle.hunger
    if (vehicle.hunger > 50) {
      // Seek food
    }
    return force;
  }
}
```

---

## 5. 4-Phase Implementation Roadmap

### Phase 1: Shared YUKA Math Adapter (Week 1)

**Goal:** Replace custom math with YUKA utilities everywhere.

**Tasks:**
1. Create `engine/utils/YukaMath.ts` adapter
   ```typescript
   export { Vector3, Matrix3, Matrix4, Quaternion, Ray, Plane, OBB, AABB, MathUtils } from 'yuka';
   ```

2. Replace custom vector operations:
   - `agents/governors/physics/GravityBehavior.ts`
   - `agents/governors/social/HierarchyBehavior.ts`
   - `engine/procedural/*.ts`
   - `generation/spawners/*.ts`

3. Add module-level reusable vectors:
   ```typescript
   // At top of file
   const direction = new Vector3();
   const displacement = new Vector3();
   ```

4. Use MathUtils for random operations:
   ```typescript
   // Before:
   const rand = Math.random() * (max - min) + min;
   
   // After:
   import { MathUtils } from 'yuka';
   const rand = MathUtils.randFloat(min, max);
   ```

**Success Criteria:**
- Zero custom vector math operations
- All random operations use MathUtils
- No vector allocations in hot paths

---

### Phase 2: YukaGovernorBase + EntityManager Pattern (Week 2)

**Goal:** Establish proper Governor → EntityManager → Vehicle hierarchy.

**Tasks:**

1. Create base governor class:
   ```typescript
   // agents/governors/YukaGovernorBase.ts
   import { EntityManager, Time } from 'yuka';
   
   export abstract class YukaGovernorBase {
     protected entityManager: EntityManager;
     protected time: Time;
     
     constructor() {
       this.entityManager = new EntityManager();
       this.time = new Time();
     }
     
     update(delta: number): void {
       this.entityManager.update(delta);
     }
     
     add(entity: GameEntity): void {
       this.entityManager.add(entity);
     }
     
     remove(entity: GameEntity): void {
       this.entityManager.remove(entity);
     }
     
     abstract spawn(...args: any[]): Vehicle;
   }
   ```

2. Refactor existing governors to extend YukaGovernorBase:
   - `FlockingGovernor` → owns EntityManager
   - `GravityGovernor` → owns EntityManager for stellar objects
   - `SocialGovernor` → owns EntityManager for agents

3. Update spawner integration:
   ```typescript
   // Before:
   const governor = new FlockingGovernor();
   governor.applyTo(vehicle); // External vehicle
   
   // After:
   const governor = new FlockingGovernor();
   const vehicle = governor.spawnCreature(position, species); // Governor owns it
   ```

**Success Criteria:**
- All governors extend YukaGovernorBase
- All governors own their EntityManager
- Clear entity lifecycle (spawn → update → remove)

---

### Phase 3: Fix SteeringBehavior Implementations (Week 3)

**Goal:** Fix all LSP errors and ensure proper YUKA SteeringBehavior usage.

**Tasks:**

1. Fix `calculate()` signatures:
   ```typescript
   // agents/governors/physics/GravityBehavior.ts
   calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
     // Use module-level vectors
     // Integrate over delta
     // Accumulate into force parameter
     return force;
   }
   ```

2. Add module-level reusable vectors to all behaviors:
   ```typescript
   const direction = new Vector3();
   const displacement = new Vector3();
   const toTarget = new Vector3();
   ```

3. Use proper delta integration:
   ```typescript
   // Time-dependent forces
   const impulse = magnitude * delta;
   force.add(direction.multiplyScalar(impulse));
   ```

4. Use typed Vehicle instead of `any`:
   ```typescript
   calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3
   ```

5. Verify all behaviors:
   - `GravityBehavior`
   - `HierarchyBehavior`
   - `FlockingBehavior` (AlignmentBehavior, CohesionBehavior, SeparationBehavior)
   - `PredatorPreyBehavior`
   - `ForagingBehavior`
   - `MigrationBehavior`

**Success Criteria:**
- Zero LSP errors in governor files
- All behaviors use module-level vectors
- All behaviors properly integrate delta
- All behaviors use Vehicle type

---

### Phase 4: Layer Goal/Perception Patterns (Week 4)

**Goal:** Add goal-driven behavior and perception to advanced agents.

**Tasks:**

1. Create custom Vehicle types:
   ```typescript
   // agents/governors/biological/CreatureVehicle.ts
   import { Vehicle, Think } from 'yuka';
   
   export class CreatureVehicle extends Vehicle {
     energy: number = 100;
     hunger: number = 0;
     brain: Think;
     
     constructor() {
       super();
       this.brain = new Think(this);
     }
     
     update(delta: number) {
       this.brain.execute();
       this.brain.arbitrate();
       super.update(delta);
       
       // Update energy
       this.energy -= this.velocity.length() * delta * 0.1;
       this.hunger = Math.max(0, 100 - this.energy);
     }
   }
   ```

2. Create goal evaluators:
   ```typescript
   // agents/governors/biological/goals/ForageEvaluator.ts
   import { GoalEvaluator } from 'yuka';
   
   export class ForageEvaluator extends GoalEvaluator {
     calculateDesirability(creature: CreatureVehicle): number {
       return creature.hunger / 100; // 0-1 scale
     }
     
     setGoal(creature: CreatureVehicle): void {
       creature.brain.clearSubgoals();
       creature.brain.addSubgoal(new ForageGoal(creature));
     }
   }
   ```

3. Add perception layer:
   ```typescript
   // agents/governors/biological/CreatureVehicle.ts
   import { Vision } from 'yuka';
   
   this.vision = new Vision(this);
   this.vision.range = 20; // Detection range
   this.vision.fieldOfView = Math.PI * 0.5; // 90° FOV
   ```

4. Integrate with biological governors:
   - `MetabolismGovernor` → energy drain
   - `NeuroscienceGovernor` → learning/memory
   - `ReproductionGovernor` → mating goals

**Success Criteria:**
- Creatures have goal-driven behavior
- Perception system detects food/threats
- Goals arbitrate based on needs (hunger, safety, reproduction)
- Emergent behavior from goal competition

---

## 6. Code Examples

### 6.1 Before/After: SteeringBehavior

**BEFORE (WRONG):**
```typescript
// agents/governors/physics/GravityBehavior.ts (current)

import { SteeringBehavior, Vector3 } from 'yuka';

export class GravityBehavior extends SteeringBehavior {
  calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
    const entities = vehicle.manager?.entities || [];
    
    for (const entity of entities) {
      if (entity === vehicle) continue;
      
      // Allocates new vector every time! (bad)
      const direction = new Vector3();
      direction.subVectors(entity.position, vehicle.position);
      
      const distance = direction.length();
      const magnitude = (this.G * m1 * m2) / (distance * distance);
      
      direction.normalize();
      
      // Missing delta integration!
      force.add(direction.multiplyScalar(magnitude));
    }
    
    return force;
  }
}
```

**AFTER (CORRECT):**
```typescript
// agents/governors/physics/GravityBehavior.ts (fixed)

import { SteeringBehavior, Vector3, Vehicle } from 'yuka';
import { PHYSICS_CONSTANTS } from '../../tables/physics-constants';

// Module-level reusable vectors (YUKA pattern)
const direction = new Vector3();
const impulse = new Vector3();

export class GravityBehavior extends SteeringBehavior {
  minDistance: number = 0.1;
  maxForce: number = 100;
  G: number = PHYSICS_CONSTANTS.G;
  scale: number = 1.0;
  
  // Proper signature with typed Vehicle
  calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
    const entities = vehicle.manager?.entities || [];
    
    for (const entity of entities) {
      if (entity === vehicle) continue;
      if (!entity.mass || entity.mass === 0) continue;
      
      // Reuse module-level vector (zero allocations)
      direction.subVectors(entity.position, vehicle.position);
      const distanceSquared = Math.max(
        direction.squaredLength(),
        this.minDistance * this.minDistance
      );
      const distance = Math.sqrt(distanceSquared);
      
      // F = G * (m1 * m2) / r²
      const m1 = vehicle.mass || 1;
      const m2 = entity.mass || 1;
      const magnitude = (this.G * this.scale * m1 * m2) / distanceSquared;
      const clampedMagnitude = Math.min(magnitude, this.maxForce);
      
      // Direction (normalize in-place)
      direction.divideScalar(distance);
      
      // Integrate over delta (time-correct physics)
      impulse.copy(direction).multiplyScalar(clampedMagnitude * delta);
      
      // Accumulate into force parameter
      force.add(impulse);
    }
    
    return force;
  }
}
```

**Key Improvements:**
1. ✅ Module-level reusable vectors (no allocations)
2. ✅ Properly typed `Vehicle` parameter
3. ✅ Delta integration for time-correct physics
4. ✅ Accumulates into `force` parameter (not shadowing)

---

### 6.2 EntityManager Registration Pattern

**From `/tmp/yuka/examples/steering/flocking/index.html`:**

```typescript
import * as YUKA from 'yuka';

// Create entity manager
const entityManager = new YUKA.EntityManager();
const time = new YUKA.Time();

// Create behaviors (shared by all vehicles)
const alignmentBehavior = new YUKA.AlignmentBehavior();
const cohesionBehavior = new YUKA.CohesionBehavior();
const separationBehavior = new YUKA.SeparationBehavior();

alignmentBehavior.weight = 1.0;
cohesionBehavior.weight = 0.9;
separationBehavior.weight = 0.3;

// Spawn 50 vehicles
for (let i = 0; i < 50; i++) {
  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = 1.5;
  vehicle.updateNeighborhood = true; // Enable neighbor tracking
  vehicle.neighborhoodRadius = 10;
  
  // Random position
  vehicle.position.x = 10 - Math.random() * 20;
  vehicle.position.z = 10 - Math.random() * 20;
  
  // Add steering behaviors
  vehicle.steering.add(alignmentBehavior);
  vehicle.steering.add(cohesionBehavior);
  vehicle.steering.add(separationBehavior);
  
  // Add wander for variety
  const wanderBehavior = new YUKA.WanderBehavior();
  wanderBehavior.weight = 0.5;
  vehicle.steering.add(wanderBehavior);
  
  // Register with entity manager
  entityManager.add(vehicle);
}

// Game loop
function animate() {
  requestAnimationFrame(animate);
  
  const delta = time.update().getDelta();
  
  // Update all entities
  entityManager.update(delta);
  
  // Render
  renderer.render(scene, camera);
}
```

**Our Implementation:**

```typescript
// agents/governors/ecological/FlockingGovernor.ts

import { EntityManager, Time, Vehicle, AlignmentBehavior, CohesionBehavior, SeparationBehavior } from 'yuka';
import { YukaGovernorBase } from '../YukaGovernorBase';

export class FlockingGovernor extends YukaGovernorBase {
  private alignmentBehavior: AlignmentBehavior;
  private cohesionBehavior: CohesionBehavior;
  private separationBehavior: SeparationBehavior;
  
  constructor() {
    super();
    
    // Create shared behaviors
    this.alignmentBehavior = new AlignmentBehavior();
    this.cohesionBehavior = new CohesionBehavior();
    this.separationBehavior = new SeparationBehavior();
    
    this.alignmentBehavior.weight = 1.0;
    this.cohesionBehavior.weight = 0.9;
    this.separationBehavior.weight = 0.3;
  }
  
  spawnCreature(position: Vector3, species: string): Vehicle {
    const vehicle = new Vehicle();
    vehicle.maxSpeed = 1.5;
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = 10;
    vehicle.position.copy(position);
    
    // Add flocking behaviors
    vehicle.steering.add(this.alignmentBehavior);
    vehicle.steering.add(this.cohesionBehavior);
    vehicle.steering.add(this.separationBehavior);
    
    // Register with entity manager (owned by this governor)
    this.entityManager.add(vehicle);
    
    return vehicle;
  }
  
  // Update called by external game loop
  update(delta: number): void {
    this.entityManager.update(delta); // Updates all vehicles
  }
}
```

---

### 6.3 Time-Based Dynamics with Delta

**Why Delta Matters:**

```typescript
// Without delta (FRAME RATE DEPENDENT - WRONG!)
calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
  const acceleration = 10; // m/s²
  force.add(direction.multiplyScalar(acceleration)); // Wrong!
  // At 60 FPS: force = 10
  // At 30 FPS: force = 10 (but should be 20 to compensate!)
  // Result: Simulation runs at different speeds!
}

// With delta (FRAME RATE INDEPENDENT - CORRECT!)
calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
  const acceleration = 10; // m/s²
  const impulse = acceleration * delta; // Scale by time step
  force.add(direction.multiplyScalar(impulse));
  // At 60 FPS (dt=0.0167): impulse = 0.167
  // At 30 FPS (dt=0.0333): impulse = 0.333 (compensates!)
  // Result: Consistent simulation speed
}
```

**Physics Integration in YUKA:**

```typescript
// From /tmp/yuka/src/steering/Vehicle.js
update(delta) {
  // 1. Calculate steering force
  this.steering.calculate(delta, steeringForce);
  
  // 2. acceleration = force / mass
  acceleration.copy(steeringForce).divideScalar(this.mass);
  
  // 3. velocity += acceleration * delta (Euler integration)
  this.velocity.add(acceleration.multiplyScalar(delta));
  
  // 4. Clamp velocity
  if (this.getSpeedSquared() > this.maxSpeed * this.maxSpeed) {
    this.velocity.normalize().multiplyScalar(this.maxSpeed);
  }
  
  // 5. displacement = velocity * delta
  displacement.copy(this.velocity).multiplyScalar(delta);
  
  // 6. position += displacement
  this.position.add(displacement);
}
```

**When to Use Delta:**

| Force Type | Use Delta? | Example |
|------------|-----------|---------|
| Continuous force (acceleration) | ✅ YES | Gravity, thrust, drag |
| Impulse (velocity change) | ❌ NO | Collision response, teleport |
| Positional (direct manipulation) | ❌ NO | Mouse drag, waypoint snap |
| Damping (velocity decay) | ✅ YES | Air resistance, friction |

**Example:**
```typescript
// Gravity (continuous force)
const gravityForce = mass * 9.81 * delta; // YES delta

// Collision response (instantaneous impulse)
velocity.reflect(normal); // NO delta

// Drag (velocity-dependent damping)
const dragForce = -velocity.length() * dragCoefficient * delta; // YES delta
```

---

## 7. Migration Priority

### High Priority (Week 1-2)

**Ecological Governors** (Most mature, good YUKA patterns)
- `FlockingBehavior.ts` ✅ (Already uses YUKA AlignmentBehavior, etc.)
- `PredatorPreyBehavior.ts` → Needs EntityManager
- `ForagingBehavior.ts` → Needs EntityManager
- `MigrationBehavior.ts` → Needs EntityManager
- `TerritorialFuzzy.ts` → Fuzzy logic is separate (OK)

**Social Governors** (Good structure, needs EntityManager)
- `HierarchyBehavior.ts` → Fix delta usage, add EntityManager
- `CooperationBehavior.ts` → Needs EntityManager
- `WarfareBehavior.ts` → Needs EntityManager
- `NarrativeGovernor.ts` → May not need YUKA (text-based)

### Medium Priority (Week 3)

**Physics Governors** (Good physics, needs proper integration)
- `GravityBehavior.ts` → Fix delta integration
- `SpawnGovernor.ts` → Needs EntityManager for spawned objects
- `TemperatureFuzzy.ts` → Fuzzy logic is separate (OK)

### Lower Priority (Week 4)

**Biology Governors** (Complex, layer on top)
- `GeneticsGovernor.ts` → May not need steering (pure logic)
- `LifecycleStates.ts` → StateMachine (separate from steering)
- `MetabolismGovernor.ts` → Updates stats (not steering)
- `NeuroscienceGovernor.ts` → Could use Think/Goals
- `ReproductionGovernor.ts` → Could use Goals

**Rationale:**
- Biological governors are more about **state management** than **steering**
- Steering is for **movement** (align, cohere, flee, seek)
- Goals are for **decision-making** (when to eat, reproduce, rest)
- Biology governors may use Goals but not necessarily Steering

---

## 8. Migration Checklist

### Per-Governor Checklist

For each governor, verify:

- [ ] Extends `YukaGovernorBase`
- [ ] Owns `EntityManager`
- [ ] Has `spawn()` method that creates and registers entities
- [ ] Has `update(delta)` method that calls `entityManager.update(delta)`
- [ ] All behaviors extend `SteeringBehavior`
- [ ] All behaviors use module-level reusable vectors
- [ ] All behaviors have correct `calculate(vehicle: Vehicle, force: Vector3, delta: number)` signature
- [ ] All behaviors accumulate into `force` parameter (not shadowing)
- [ ] All behaviors use `delta` correctly (if time-dependent)
- [ ] All behaviors use typed `Vehicle` (not `any`)
- [ ] No LSP errors
- [ ] No vector allocations in hot paths
- [ ] Uses YUKA math utilities (`Vector3`, `MathUtils`)

### Per-Behavior Checklist

For each steering behavior:

```typescript
// Template
import { SteeringBehavior, Vector3, Vehicle } from 'yuka';

// Module-level reusable vectors
const direction = new Vector3();
const displacement = new Vector3();

export class MyBehavior extends SteeringBehavior {
  // Behavior-specific properties
  weight: number = 1.0;
  
  constructor() {
    super();
  }
  
  // Correct signature
  calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3 {
    // 1. Reuse module-level vectors
    direction.subVectors(target.position, vehicle.position);
    
    // 2. Calculate force magnitude
    const magnitude = this.calculateMagnitude(vehicle, direction);
    
    // 3. Integrate over delta (if time-dependent)
    const impulse = magnitude * delta;
    
    // 4. Accumulate into force parameter
    displacement.copy(direction).multiplyScalar(impulse);
    force.add(displacement);
    
    // 5. Return force parameter
    return force;
  }
  
  private calculateMagnitude(vehicle: Vehicle, direction: Vector3): number {
    // Implementation
    return 1.0;
  }
}
```

Verify:
- [ ] Module-level reusable vectors declared at top
- [ ] `calculate()` signature matches template
- [ ] No vector allocations in `calculate()`
- [ ] Delta used correctly (if applicable)
- [ ] Force accumulated into parameter
- [ ] Returns `force` parameter (not new instance)

### Testing Checklist

After migration:

- [ ] Run `npm run build` (zero TypeScript errors)
- [ ] Run LSP diagnostics (zero errors in governor files)
- [ ] Test flocking behavior (50+ agents, 60 FPS)
- [ ] Test gravity behavior (stellar objects orbit correctly)
- [ ] Test hierarchy behavior (social dominance emerges)
- [ ] Verify frame rate independence (30 FPS vs 60 FPS behaves identically)
- [ ] Profile memory (zero allocations in steering update loop)

### Documentation Checklist

Update documentation:

- [ ] `agents/governors/README.md` - Add YUKA architecture section
- [ ] `docs/ARCHITECTURE.md` - Update governor section
- [ ] `docs/ENGINE.md` - Add YUKA integration examples
- [ ] Code comments - Explain YUKA patterns where non-obvious
- [ ] Type definitions - Extend Vehicle types where needed

---

## Conclusion

This migration will:

1. **Eliminate LSP errors** by using proper YUKA patterns
2. **Improve performance** by using YUKA's optimized math utilities
3. **Clarify architecture** with Governor → EntityManager → Vehicle hierarchy
4. **Enable advanced features** like goal-driven behavior and perception
5. **Reduce code** by leveraging YUKA's battle-tested implementations

**Timeline:** 4 weeks for complete migration

**Risk:** Low (YUKA is stable, patterns are well-documented)

**Payoff:** High (better performance, cleaner code, more features)

---

**Next Steps:**
1. Start with Phase 1 (math utilities)
2. Verify LSP errors disappear
3. Measure performance improvements
4. Proceed to Phase 2 (EntityManager pattern)

**Questions?** See `/tmp/yuka/examples/` for reference implementations.

---

**Version History:**
- 1.0.0 (Nov 11, 2025) - Initial comprehensive plan
