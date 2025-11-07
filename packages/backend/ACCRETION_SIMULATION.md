# THE MISSING QUESTIONS: PLANETARY ACCRETION

## What I Missed From WORLD.md

### The Celestial Context Questions

1. **Where is this world in its stellar system?**
   - Orbital radius from star(s)
   - Orbital period
   - Eccentricity
   - Position relative to habitable zone

2. **What is the energy source?**
   - Single sun or binary/multiple stars?
   - Star type (G-type like Sun? Red dwarf? Blue giant?)
   - Solar radiation intensity
   - Distance from star(s)

3. **What are the gravitational influences?**
   - Number of moons (tidal forces)
   - Moon masses and orbital periods
   - Tidal locking?
   - Gas giant neighbors (gravitational perturbations)

4. **How did this world form?**
   - Primordial debris composition
   - Accretion history
   - Impact events
   - Core formation process
   - Water delivery (comets)
   - Mineral deposition (asteroids)

---

## Gen 0: Planetary Accretion API

Instead of "AI generates planet," we **simulate 4.5 billion years of planetary formation**.

### The Accretion Simulation

```
POST /accretion/initialize
→ Create stellar system
→ Define debris field
→ Returns: System ID

POST /accretion/:id/simulate
→ Run gravitational attraction
→ Objects collide and stick
→ Core forms from fusion
→ Returns: Planetary data model

GET /accretion/:id/state
→ Query current accretion state
→ Returns: Object positions, masses, velocities
```

---

## Step 1: Stellar System Definition

### API: Initialize System

```
POST /accretion/initialize

Request:
{
  "seed": "ancient-depths-42",
  "systemType": "single-star" | "binary-star" | "trinary-star",
  "starType": "g-type" | "red-dwarf" | "blue-giant",
  "orbitalZone": "inner" | "habitable" | "outer",
}

Response:
{
  "systemId": "sys-abc123",
  "star": {
    "mass": 1.989e30,  // kg (Sun = 1.0)
    "radius": 696340,  // km
    "luminosity": 3.828e26, // watts
    "type": "g-type",
    "temperature": 5778  // Kelvin
  },
  "orbitalRadius": 1.496e8, // km (1 AU)
  "orbitalPeriod": 31557600, // seconds (1 year)
  "eccentricity": 0.0167,
  "solarRadiation": 1361,  // W/m² at this distance
  "tidalForce": 5.05e-7   // N/kg from star
}
```

**Physics:**
```typescript
// Solar radiation at distance
const solarRadiation = star.luminosity / (4 * Math.PI * orbitalRadius^2);

// Gravitational force from star
const tidalForce = G * star.mass / (orbitalRadius^2);

// Orbital period (Kepler's third law)
const orbitalPeriod = 2 * Math.PI * Math.sqrt(orbitalRadius^3 / (G * star.mass));
```

---

## Step 2: Debris Field Initialization

### API: Generate Debris

```
POST /accretion/:systemId/debris

Request:
{
  "debrisCount": 10000,  // Number of objects
  "massRange": [1e20, 1e24],  // kg (asteroid to small planet)
  "compositions": [
    { "type": "iron", "abundance": 0.3 },
    { "type": "silicate", "abundance": 0.5 },
    { "type": "ice", "abundance": 0.2 }
  ],
  "radialDistribution": {
    "min": 1.3e8,  // km (inner bound)
    "max": 1.7e8,  // km (outer bound)
  }
}

Response:
{
  "debrisField": [
    {
      "id": "obj-1",
      "mass": 5.972e23,  // kg
      "radius": 6371,    // km
      "composition": { "iron": 0.4, "silicate": 0.6 },
      "position": { "x": 1.5e8, "y": 0, "z": 0 },  // km
      "velocity": { "x": 0, "y": 30, "z": 0 }      // km/s
    },
    // ... 9999 more objects
  ]
}
```

**Deterministic from seed:**
```typescript
const rng = seededRandom(seed);

for (let i = 0; i < debrisCount; i++) {
  const mass = rng() * (massRange[1] - massRange[0]) + massRange[0];
  const radius = calculateRadius(mass, composition);
  const position = randomOrbitalPosition(rng, radialDistribution);
  const velocity = orbitalVelocity(position, starMass);
  
  debris.push({ id: `obj-${i}`, mass, radius, composition, position, velocity });
}
```

---

## Step 3: YUKA Gravitational Attraction

### Use CohesionBehavior for Gravity

```typescript
// src/accretion/gravity.ts
import { Vehicle, CohesionBehavior, SteeringManager } from 'yuka';

class GravitationalBody extends Vehicle {
  public mass: number;
  public composition: { [element: string]: number };
  
  constructor(id: string, mass: number, position: Vector3, velocity: Vector3, composition: any) {
    super();
    this.mass = mass;
    this.composition = composition;
    this.position.copy(position);
    this.velocity.copy(velocity);
    
    // Steering behaviors
    this.steering = new SteeringManager(this);
    
    // Gravitational attraction = Cohesion
    const cohesion = new CohesionBehavior();
    cohesion.weight = this.mass; // Heavier objects attract more
    this.steering.add(cohesion);
  }
  
  /**
   * Calculate gravitational force from another body
   */
  public gravitationalForce(other: GravitationalBody): Vector3 {
    const G = 6.674e-11; // Gravitational constant
    const direction = other.position.clone().sub(this.position);
    const distance = direction.length();
    
    if (distance < this.radius + other.radius) {
      // Collision detected
      return new Vector3(0, 0, 0);
    }
    
    const forceMagnitude = G * this.mass * other.mass / (distance * distance);
    direction.normalize().multiplyScalar(forceMagnitude);
    
    return direction;
  }
  
  /**
   * Apply gravitational forces from all other bodies
   */
  public applyGravity(bodies: GravitationalBody[], deltaTime: number) {
    const totalForce = new Vector3(0, 0, 0);
    
    for (const other of bodies) {
      if (other === this) continue;
      totalForce.add(this.gravitationalForce(other));
    }
    
    // F = ma, so a = F/m
    const acceleration = totalForce.divideScalar(this.mass);
    
    // Update velocity
    this.velocity.add(acceleration.multiplyScalar(deltaTime));
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
  }
}
```

---

## Step 4: Collision and Accretion

### When Objects Collide

```typescript
function checkCollision(body1: GravitationalBody, body2: GravitationalBody): boolean {
  const distance = body1.position.distanceTo(body2.position);
  return distance < (body1.radius + body2.radius);
}

function accreteObjects(larger: GravitationalBody, smaller: GravitationalBody): GravitationalBody {
  // Conservation of mass
  const newMass = larger.mass + smaller.mass;
  
  // Conservation of momentum
  const newVelocity = larger.velocity
    .clone()
    .multiplyScalar(larger.mass)
    .add(smaller.velocity.clone().multiplyScalar(smaller.mass))
    .divideScalar(newMass);
  
  // New composition (weighted average)
  const newComposition: { [key: string]: number } = {};
  
  for (const element of Object.keys(larger.composition)) {
    const largerAmount = larger.composition[element] * larger.mass;
    const smallerAmount = (smaller.composition[element] || 0) * smaller.mass;
    newComposition[element] = (largerAmount + smallerAmount) / newMass;
  }
  
  // New radius (volume conservation, assuming sphere)
  const volume1 = (4/3) * Math.PI * Math.pow(larger.radius, 3);
  const volume2 = (4/3) * Math.PI * Math.pow(smaller.radius, 3);
  const newVolume = volume1 + volume2;
  const newRadius = Math.pow((3 * newVolume) / (4 * Math.PI), 1/3);
  
  return new GravitationalBody(
    `accreted-${larger.id}-${smaller.id}`,
    newMass,
    larger.position,
    newVelocity,
    newComposition
  );
}
```

---

## Step 5: Accretion Simulation Loop

### API: Run Simulation

```
POST /accretion/:systemId/simulate

Request:
{
  "timeStep": 86400,      // seconds (1 day)
  "totalTime": 1.42e17,   // seconds (4.5 billion years)
  "outputFrequency": 1e13 // Output state every ~300k years
}

Response:
{
  "stepsRun": 1.64e12,  // Number of time steps
  "finalState": {
    "bodies": [
      {
        "id": "planet-1",
        "mass": 5.972e24,  // Earth mass
        "radius": 6371,
        "composition": {
          "iron": 0.32,
          "silicate": 0.48,
          "water": 0.15,
          "other": 0.05
        },
        "rotationPeriod": 86400,  // Determined by angular momentum
        "moons": [
          {
            "id": "moon-1",
            "mass": 7.342e22,
            "orbitalRadius": 384400  // km
          }
        ]
      }
    ]
  }
}
```

### Implementation

```typescript
export async function runAccretionSimulation(
  systemId: string,
  params: SimulationParams
): Promise<PlanetaryDataModel> {
  
  // Load initial debris field
  let bodies = await getDebrisField(systemId);
  
  const timeStep = params.timeStep;
  const totalSteps = Math.floor(params.totalTime / timeStep);
  
  for (let step = 0; step < totalSteps; step++) {
    // Apply gravitational forces (Yuka handles this)
    for (const body of bodies) {
      body.applyGravity(bodies, timeStep);
    }
    
    // Check for collisions
    const collisions: [GravitationalBody, GravitationalBody][] = [];
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        if (checkCollision(bodies[i], bodies[j])) {
          collisions.push([bodies[i], bodies[j]]);
        }
      }
    }
    
    // Process collisions (accrete smaller into larger)
    for (const [body1, body2] of collisions) {
      const larger = body1.mass > body2.mass ? body1 : body2;
      const smaller = body1.mass > body2.mass ? body2 : body1;
      
      const accreted = accreteObjects(larger, smaller);
      
      // Remove old bodies, add new
      bodies = bodies.filter(b => b !== body1 && b !== body2);
      bodies.push(accreted);
    }
    
    // Output state periodically
    if (step % params.outputFrequency === 0) {
      await saveAccretionSnapshot(systemId, step * timeStep, bodies);
    }
  }
  
  // Final state = planetary data model
  return convertToDataModel(bodies[0]); // Largest body = planet
}
```

---

## Step 6: Planetary Data Model Output

### The Result

```typescript
interface PlanetaryDataModel {
  // Physical properties (from accretion)
  mass: number;
  radius: number;
  rotationPeriod: number;  // From angular momentum
  gravity: number;         // Calculated from mass/radius
  
  // Composition (from accreted objects)
  coreComposition: {
    iron: number;
    nickel: number;
    sulfur: number;
  };
  
  mantleComposition: {
    silicate: number;
    magnesium: number;
    calcium: number;
  };
  
  crustComposition: {
    basalt: number;
    granite: number;
    limestone: number;
  };
  
  waterContent: number;    // From cometary collisions
  atmosphereComposition: {
    nitrogen: number;
    oxygen: number;
    co2: number;
  };
  
  // Stratification (calculated from density)
  layers: [
    {
      name: 'inner_core',
      minRadius: 0,
      maxRadius: 1220,
      composition: coreComposition,
      density: 13.0,
      temperature: 5400,
      pressure: 3640000,
    },
    // ... calculated layers
  ];
  
  // Moons (from captured debris)
  moons: [
    {
      mass: number;
      orbitalRadius: number;
      orbitalPeriod: number;
      tidalForce: number;
    }
  ];
  
  // Stellar context
  stellarSystem: {
    starMass: number;
    orbitalRadius: number;
    orbitalPeriod: number;
    solarRadiation: number;
    habitableZone: boolean;
  };
}
```

**This data model drives ALL of Gen 1-6.**

---

## Why This Is Better

### 1. Physics-Based, Not Random

```
❌ Random: planet.radius = random(5000, 7000)

✓ Emergent: planet.radius = calculated from accreted mass
```

### 2. Composition Is Realistic

```
❌ Random: coreComposition = { iron: 0.85, nickel: 0.15 }

✓ Emergent: coreComposition = result of which asteroids collided
```

### 3. Deterministic from Seed

```typescript
// Same seed = same stellar system = same debris field = same accretion = same planet
const planet1 = runAccretion('seed-123');
const planet2 = runAccretion('seed-123');
assert(deepEqual(planet1, planet2));
```

### 4. Queryable During Formation

```bash
# Watch planet form in real-time
$ ebb accretion watch sys-abc123

Time: 100 million years
Objects: 8,432
Largest body: 2.3e23 kg (Proto-planet forming)

Time: 1 billion years
Objects: 142
Largest body: 4.8e24 kg (Planet formed)
Moons captured: 1

Time: 4.5 billion years
Objects: 3 (Planet + 2 moons)
Planet mass: 5.972e24 kg
Composition: 32% iron, 48% silicate, 15% water, 5% other
```

### 5. Visualizable (Future)

```typescript
// 3D visualization of accretion
function renderAccretion(bodies: GravitationalBody[]) {
  for (const body of bodies) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(body.radius),
      materialFromComposition(body.composition)
    );
    sphere.position.copy(body.position);
    scene.add(sphere);
  }
}

// Watch 4.5 billion years in 60 seconds
animateAccretion(bodies, speedFactor: 1e15);
```

---

## API Architecture

```
POST /accretion/initialize
→ Create stellar system from seed
→ Returns: System definition

POST /accretion/:id/debris
→ Generate debris field
→ Returns: Initial objects

POST /accretion/:id/simulate
→ Run Yuka gravitational simulation
→ Objects collide, stick, accrete
→ Returns: Planetary data model

GET /accretion/:id/state
→ Query current state
→ Returns: Object positions/masses

GET /accretion/:id/history
→ Query formation history
→ Returns: Snapshots over time

POST /accretion/:id/visualize
→ Generate visualization data
→ Returns: Render-ready positions
```

---

## Biases and Adjacencies Instead of OpenAI

### Stellar System Biases

```typescript
// Seed determines stellar system type
const systemType = biasedChoice(seed, [
  { type: 'single-star', weight: 0.7 },
  { type: 'binary-star', weight: 0.25 },
  { type: 'trinary-star', weight: 0.05 },
]);

// Seed determines orbital zone
const orbitalZone = biasedChoice(seed + '-orbit', [
  { zone: 'inner', weight: 0.2 },      // Hot, rocky
  { zone: 'habitable', weight: 0.3 },  // Just right
  { zone: 'outer', weight: 0.5 },      // Cold, icy
]);
```

### Debris Composition Biases

```typescript
// Inner zone = more metal, less ice
if (orbitalZone === 'inner') {
  compositions = [
    { type: 'iron', abundance: 0.5 },
    { type: 'silicate', abundance: 0.4 },
    { type: 'ice', abundance: 0.1 },
  ];
}

// Outer zone = more ice, less metal
if (orbitalZone === 'outer') {
  compositions = [
    { type: 'iron', abundance: 0.1 },
    { type: 'silicate', abundance: 0.2 },
    { type: 'ice', abundance: 0.7 },
  ];
}
```

### No OpenAI Needed

**Physics + Seed + Biases = Infinite Unique Planets**

---

## Performance

**4.5 billion years simulated in seconds:**

- Time step: 1 year (3.15e7 seconds)
- Total steps: 4.5e9 steps
- But we can optimize:
  - Adaptive time stepping (larger steps when far apart)
  - Spatial hashing (only check nearby objects)
  - Early termination (stop when stable)

**Realistic simulation time: 10-60 seconds**

---

## Summary

**Gen 0 = Planetary Accretion Simulation**

1. Define stellar system (sun, orbit, energy source)
2. Generate debris field (asteroids, comets, dust)
3. Run Yuka gravitational attraction (CohesionBehavior)
4. Objects collide and accrete based on physics
5. Core forms from fusion of materials
6. Comets deliver water, asteroids deliver minerals
7. Result = Complete planetary data model

**Benefits:**
- Physics-based, not random
- Deterministic from seed
- Realistic composition
- Queryable during formation
- Visualizable
- Fast (<60 seconds)
- No OpenAI needed

**This is the TRUE Gen 0.**
