# Gen0 Physics Implementation Assessment

## CRITICAL ISSUE: We're Making Assumptions Instead of Simulating Physics

### What the Docs Say Gen0 Should Do:

1. **Duration**: "4.5 billion simulated years in seconds of computation"
2. **Process**: 
   - Run CohesionBehavior (gravity) on 1000+ debris particles
   - Use SeparationBehavior to prevent overlap
   - Handle collisions/accretion continuously
   - **Apply gravitational differentiation DURING simulation** as materials accumulate
   - Form planet from accreted material AFTER simulation completes
3. **Output**: 
   - Stratified planet with layers derived from physics
   - Material distribution from actual accretion history
   - Rotation period from angular momentum conservation

### What We're Actually Doing:

1. **Duration**: Only 100 cycles (not billions of years)
2. **Process**:
   - ✅ Uses CohesionBehavior for gravity
   - ❌ NO SeparationBehavior (overlap prevention)
   - ⚠️ Checks collisions only every 10 cycles (not continuous)
   - ❌ NO gravitational differentiation during simulation
   - ❌ Hardcodes layer boundaries (1200, 3500, 6000, 6371 km)
   - ❌ Sorts materials AFTER simulation instead of during
3. **Output**:
   - ⚠️ Layers have hardcoded radii instead of physics-derived
   - ⚠️ Rotation period uses simplified formula, not angular momentum conservation
   - ✅ Material composition from accretion (but not stratified during simulation)

## Key Problems:

### Problem 1: No Gravitational Differentiation During Simulation
**Docs say**: `this.applyGravitationalDifferentiation(debrisField);` should run during each cycle.

**Reality**: We only sort materials by density AFTER the simulation completes. This means:
- Dense materials don't sink to core during accretion
- Layers don't form naturally from physics
- We're just assigning materials to pre-defined layer boundaries

### Problem 2: Hardcoded Layer Boundaries
**Docs say**: Layers should form from physics (density stratification).

**Reality**: 
```typescript
const layers: PlanetaryLayer[] = [
  { name: 'inner_core', minRadius: 0, maxRadius: 1200, ... },
  { name: 'outer_core', minRadius: 1200, maxRadius: 3500, ... },
  // etc - all hardcoded!
];
```

**Should be**: Layer boundaries derived from where materials actually accumulated based on density.

### Problem 3: No SeparationBehavior
**Docs say**: Use SeparationBehavior to prevent particle overlap.

**Reality**: We don't use it at all. Particles can overlap freely.

### Problem 4: Rotation Period Not Physics-Derived
**Current**: `Math.max(20000, 100000 / Math.max(1, angularMomentum / 1e30))`

**Should be**: Conservation of angular momentum: `L = I * ω` where:
- `L` = total angular momentum (sum of all particles)
- `I` = moment of inertia of final planet
- `ω` = angular velocity
- `rotationPeriod = 2π / ω`

### Problem 5: Only 100 Cycles
**Docs say**: "4.5 billion simulated years"

**Reality**: 100 cycles is way too short. We need:
- More cycles to simulate billions of years
- Or better time compression (each cycle = millions of years)
- Or adaptive time stepping (fast early, slower as planet forms)

## What Needs to Be Fixed:

1. ✅ Add SeparationBehavior to prevent overlap
2. ✅ Implement `applyGravitationalDifferentiation()` that runs DURING simulation
3. ✅ Derive layer boundaries from actual material accumulation (not hardcoded)
4. ✅ Calculate rotation period from angular momentum conservation
5. ✅ Increase simulation cycles or implement time compression
6. ✅ Make collision detection continuous (not every 10 cycles)

## Physics Principles We Should Follow:

1. **Angular Momentum Conservation**: `L_initial = L_final`
2. **Density Stratification**: Denser materials sink to core during accretion
3. **Gravitational Differentiation**: As planet grows, materials sort by density
4. **Collision Physics**: Inelastic collisions merge particles, conserve momentum
5. **Time Compression**: Each cycle represents millions/billions of years

