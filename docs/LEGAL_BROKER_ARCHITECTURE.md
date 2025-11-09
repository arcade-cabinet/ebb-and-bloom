# LEGAL BROKER ARCHITECTURE

**The hierarchical law regulation system - mirrors real-world legal systems**

---

## 🏛️ The Problem We Solved

**Before:**
```typescript
// Yuka talked directly to laws (BAD)
const metabolism = LAWS.biology.allometry.basalMetabolicRate(mass);
```

**Problems:**
- No coordination between domains
- No conflict resolution
- No precedence rules
- No emergence thresholds
- Direct coupling (brittle)

---

## ✅ The Solution: Legal Broker System

**Architecture:**

```
Yuka (makes decisions)
  ↓
LegalBroker (routes requests)
  ↓
Domain Regulators (each domain has its own regulator)
  ├── PhysicsRegulator (physics.ts, stellar.ts)
  ├── BiologyRegulator (biology.ts, biomechanics.ts, growth.ts)
  ├── EcologyRegulator (ecology.ts, behavioral-ecology.ts)
  ├── SocialRegulator (social.ts, economics.ts, game-theory.ts)
  ├── TechnologyRegulator (agriculture.ts, metallurgy.ts, etc.)
  └── PlanetaryRegulator (climate.ts, geology.ts, hydrology.ts)
  ↓
Individual Law Files (physics.ts, biology.ts, etc.)
  ↓
UniversalLawCoordinator (resolves conflicts)
```

---

## 🎯 How It Works

### 1. Yuka Asks a Question

```typescript
import { LEGAL_BROKER } from './laws/core/LegalBroker';

const response = await LEGAL_BROKER.ask({
  domain: 'biology',
  action: 'calculate-metabolism',
  params: { mass: 50 },
  state: currentUniverseState,
});

console.log(response.value);        // 3500 kcal/day
console.log(response.authority);    // 'biology'
console.log(response.confidence);   // 1.0
console.log(response.precedents);   // ['biology.allometry.basalMetabolicRate (Kleiber 1932)']
```

### 2. LegalBroker Routes to Regulators

```typescript
// LegalBroker finds which regulator(s) can handle it
const capableRegulators = this.findCapableRegulators(request);

// BiologyRegulator says "I can handle this!"
if (request.action.includes('metabolism')) {
  return true;
}
```

### 3. Regulator Processes Request

```typescript
// BiologyRegulator routes to appropriate law
switch (request.action) {
  case 'calculate-metabolism':
    value = LAWS.biology.allometry.basalMetabolicRate(request.params.mass);
    precedent = 'biology.allometry.basalMetabolicRate (Kleiber 1932)';
    break;
}

// Returns with metadata
return {
  value: 3500,
  authority: 'biology',
  confidence: 1.0,
  precedents: [precedent],
};
```

### 4. If Multiple Regulators Respond → Conflict Resolution

```typescript
// Example: Both biology and ecology have opinions on population
const responses = [
  { value: 100, authority: 'biology', confidence: 1.0 },
  { value: 95, authority: 'ecology', confidence: 0.9 },
];

// UniversalLawCoordinator resolves
const winner = UniversalLawCoordinator.resolveLawConflict(
  'biology', 100,
  'ecology', 95,
  state
);

// Biology wins (higher precedence for individual-level)
```

---

## 🏛️ Real-World Parallel

This mirrors how real legal systems work:

| Our System | Real World |
|------------|-----------|
| **Yuka** | Citizen asking legal question |
| **LegalBroker** | Lawyer/Legal counsel |
| **Domain Regulators** | Government agencies (FDA, EPA, etc.) |
| **Individual Laws** | Actual legislation |
| **UniversalLawCoordinator** | Supreme Court (resolves conflicts) |

**Example:**
- **Question:** "Can I build a factory here?"
- **Routes to:** EPA (environment), OSHA (safety), Local Gov (zoning)
- **Each gives answer** based on their domain
- **If conflicts:** Court resolves

**Same in our system:**
- **Question:** "Can this creature survive?"
- **Routes to:** BiologyRegulator, EcologyRegulator, PhysicsRegulator
- **Each gives answer** based on their laws
- **If conflicts:** UniversalLawCoordinator resolves

---

## 📊 Domain Regulators

### PhysicsRegulator
**Precedence:** HIGHEST (fundamental laws)

**Handles:**
- Gravity, thermodynamics, stellar evolution
- ALWAYS applies (cannot be violated)

**Example:**
```typescript
{ domain: 'physics', action: 'calculate-gravity' }
→ Uses physics.gravity.surfaceGravity()
→ Confidence: 1.0 (physics is certain)
```

### BiologyRegulator
**Precedence:** EMERGENT (requires life)

**Handles:**
- Metabolism, lifespan, allometry
- Only applies if life exists

**Example:**
```typescript
{ domain: 'biology', action: 'calculate-lifespan' }
→ Checks: state.hasLife === true?
→ Uses biology.allometry.maxLifespan()
→ Confidence: 1.0
```

### EcologyRegulator
**Precedence:** STATISTICAL (population-level)

**Handles:**
- Carrying capacity, predator-prey, competition
- Only applies to populations

**Example:**
```typescript
{ domain: 'ecology', action: 'population-growth' }
→ Uses ecology.carryingCapacity.logisticGrowth()
→ Confidence: 0.9 (statistical, not deterministic)
```

### SocialRegulator
**Precedence:** SOCIAL (emergent from groups)

**Handles:**
- Group size, cooperation, governance
- Only applies if society exists

**Example:**
```typescript
{ domain: 'social', action: 'max-group-size' }
→ Checks: state.hasSociety === true?
→ Uses social.dunbar.cognitiveGroupSize()
→ Confidence: 0.8 (emergent, variable)
```

---

## 🎛️ UniversalLawCoordinator

**The meta-system that governs WHEN and HOW laws apply**

### 1. Complexity Thresholds

```typescript
enum ComplexityLevel {
  VOID = 0,           // Nothing
  ENERGY = 1,         // Pure energy
  PARTICLES = 2,      // Quarks, leptons
  ATOMS = 3,          // Hydrogen, helium
  MOLECULES = 4,      // H2O, CO2
  LIFE = 5,           // Self-replicating
  MULTICELLULAR = 6,  // Complex organisms
  COGNITIVE = 7,      // Nervous systems
  SOCIAL = 8,         // Groups
  TECHNOLOGICAL = 9,  // Tools
  CIVILIZATION = 10,  // Cities, writing
}
```

**Laws only apply AFTER complexity threshold reached:**
- Biology laws → require LIFE
- Cognitive laws → require COGNITIVE
- Social laws → require SOCIAL
- Technology laws → require TECHNOLOGICAL

### 2. Thermodynamics - The Ultimate Arbiter

```typescript
// EVERY process must pass thermodynamics check
const allowed = UniversalLawCoordinator.thermodynamicsAllows(
  deltaEntropy,
  deltaEnergy,
  temperature
);

if (!allowed) {
  return null; // Process CANNOT occur
}
```

**Second Law:** ΔS_universe ≥ 0 (entropy always increases)

This prevents:
- Life forming in extremely hot environments (proteins denature)
- Perpetual motion machines
- Violations of conservation laws

### 3. Law Precedence

```typescript
enum LawPrecedence {
  FUNDAMENTAL = 0,    // Physics (ALWAYS applies)
  EMERGENT = 1,       // Biology, cognition
  STATISTICAL = 2,    // Ecology, populations
  SOCIAL = 3,         // Society, economics
}
```

**When laws conflict:**
- Fundamental > Emergent > Statistical > Social
- Lower number = higher priority

**Example:**
- Physics says "max mass = 10,000kg" (gravity limit)
- Biology says "this species should be 50,000kg" (allometry)
- **Winner:** Physics (more fundamental)

---

## 💡 Usage Examples

### Example 1: Simple Request

```typescript
const response = await LEGAL_BROKER.ask({
  domain: 'biology',
  action: 'calculate-metabolism',
  params: { mass: 50 },
  state: currentState,
});

// Output:
{
  value: 3500,              // kcal/day
  authority: 'biology',
  confidence: 1.0,
  precedents: ['biology.allometry.basalMetabolicRate (Kleiber 1932)']
}
```

### Example 2: Multiple Regulators (Conflict)

```typescript
const response = await LEGAL_BROKER.ask({
  domain: 'any',
  action: 'max-creature-mass',
  params: { gravity: 9.8 },
  state: currentState,
});

// PhysicsRegulator: "10,000kg (gravity limit)"
// BiologyRegulator: "5,000kg (structural limit)"
// Conflict resolved → Physics wins (more fundamental)

// Output:
{
  value: 5000,              // Most restrictive
  authority: 'physics',
  confidence: 1.0,
  conflicts: [{
    law1: 'physics.structural',
    value1: 10000,
    law2: 'biology.structural',
    value2: 5000,
    winner: 'physics',
    reason: 'Precedence hierarchy'
  }]
}
```

### Example 3: Batch Request

```typescript
const responses = await LEGAL_BROKER.askBatch([
  { domain: 'biology', action: 'calculate-metabolism', params: { mass: 50 }, state },
  { domain: 'ecology', action: 'carrying-capacity', params: { productivity: 1000 }, state },
  { domain: 'social', action: 'max-group-size', params: { brainSize: 1200 }, state },
]);

// All processed in parallel
```

---

## 🔄 Integration with Yuka

**Yuka's decision loop:**

```typescript
// OLD WAY (direct access - BAD)
const metabolism = LAWS.biology.allometry.basalMetabolicRate(mass);

// NEW WAY (through broker - GOOD)
const response = await LEGAL_BROKER.ask({
  domain: 'biology',
  action: 'calculate-metabolism',
  params: { mass },
  state: this.currentState,
});

const metabolism = response.value;

// Bonus: You get metadata!
console.log(`Authority: ${response.authority}`);
console.log(`Confidence: ${response.confidence}`);
console.log(`Precedent: ${response.precedents[0]}`);
```

---

## 📁 File Structure

```
packages/game/src/laws/
├── core/
│   ├── UniversalLawCoordinator.ts  # Meta-system (when laws apply)
│   ├── LegalBroker.ts              # Routes requests
│   └── regulators/
│       ├── PhysicsRegulator.ts     # Physics domain
│       ├── BiologyRegulator.ts     # Biology domain
│       ├── EcologyRegulator.ts     # Ecology domain
│       ├── SocialRegulator.ts      # Social domain
│       ├── TechnologyRegulator.ts  # Technology domain
│       └── PlanetaryRegulator.ts   # Planetary sciences
├── physics.ts                      # Actual laws
├── biology.ts
├── ecology.ts
├── social.ts
└── ... (57 law files)
```

---

## ✅ Benefits

### 1. Decoupling
Yuka doesn't know about law files. Only knows about LegalBroker.

### 2. Conflict Resolution
When laws disagree, coordinator resolves based on precedence.

### 3. Emergence Handling
Laws automatically activate when complexity threshold reached.

### 4. Metadata
Every response includes authority, confidence, precedents.

### 5. Thermodynamics Enforcement
Ultimate physical constraints always enforced.

### 6. Real-World Parallel
Architecture mirrors real legal systems (easier to understand).

---

## 🚀 Next Steps

1. ✅ **Created:** Legal Broker architecture
2. ✅ **Created:** 6 domain regulators
3. ✅ **Created:** UniversalLawCoordinator
4. **TODO:** Integrate with Yuka decision system
5. **TODO:** Add more actions to each regulator
6. **TODO:** Add thermodynamics checks to all processes
7. **TODO:** Build conflict resolution test suite

---

## 📊 Example Decision Tree

```
Yuka: "Can this creature grow to 100kg?"

LegalBroker receives request
  ↓
Routes to: PhysicsRegulator, BiologyRegulator, EcologyRegulator
  ↓
PhysicsRegulator:
  - Check gravity → max mass = 10,000kg ✓
  - Confidence: 1.0
  
BiologyRegulator:
  - Check structural limits → max mass = 5,000kg ✓
  - Check allometry → typical mass = 50kg
  - Confidence: 1.0
  
EcologyRegulator:
  - Check carrying capacity → supported mass = 80kg
  - Confidence: 0.9 (statistical)
  ↓
Coordinator resolves:
  - Most restrictive: 50kg (typical allometry)
  - Winner: BiologyRegulator
  - Reason: Most specific + high confidence
  ↓
Response to Yuka:
  {
    value: 50,
    authority: 'biology',
    confidence: 1.0,
    conflicts: [...]
  }
```

---

**This is how REAL universes work. Laws don't exist in isolation - they're coordinated, hierarchical, and emergent.**

**We've built that system.** 🌌

