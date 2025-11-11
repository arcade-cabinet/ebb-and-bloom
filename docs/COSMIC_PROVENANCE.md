# Cosmic Provenance System - Complete Material Lineage

**Core Philosophy:** "Everything is a squirrel" - total scientific rigor with complete material provenance from cosmic origins.

## The LINES Concept

Every material in the game traces back through deterministic LINES to the Big Bang.

```
Big Bang → Universal Coordinates → Galaxy Age → Stellar Fusion → 
Supernova Enrichment → Molecular Cloud → Planetary Accretion → 
Surface Position → Material Availability
```

**Critical:** Same 3-word seed phrase ALWAYS produces identical universe through law application.

---

## FMV Sequence: Not Just Visual

**The Cosmic Expansion FMV is DUAL-PURPOSE:**

### 1. Visual Narrative (Establishes Scale)
- Big Bang expansion
- Dark matter web formation
- First galaxies igniting
- Supernova cycles
- Zooms to our galaxy, system, planet

### 2. Deterministic Genesis Establishment (State Creation)

**The FMV MUST establish and record:**

#### Phase 1: Universal Coordinates
```typescript
// Seed → Quantum fluctuations at Big Bang
const universalCoordinates = {
  distanceFromCosmicCenter: number,  // Determines galaxy age
  galacticCluster: ClusterID,
  darkMatterDensity: number,
  initialExpansionVector: Vector3
}
```

#### Phase 2: Galaxy Properties
```typescript
const galaxyGenesis = {
  age: number,  // OLD galaxy = more supernova cycles = more heavy metals
  metallicity: number,  // Fe, Ni, Cu, Sn abundance
  populationIIIStarGenerations: number,
  supernovaCount: number,
  stellarEnrichmentHistory: Element[]
}
```

#### Phase 3: Stellar System
```typescript
const stellarSystem = {
  stars: Star[],  // Single, binary, trinary?
  gasGiants: Planet[],
  solidPlanets: Planet[],
  moons: Moon[],
  asteroidBelt: AsteroidField,
  kuiperBelt: CometField
}
```

#### Phase 4: Planetary Accretion (CRITICAL)

**This is where EVERYTHING on the surface gets determined.**

```typescript
const planetaryLayers = {
  core: {
    type: 'solid_iron' | 'liquid_iron' | 'rocky',  // Law-determined
    composition: ElementCounts,
    temperature: number,
    pressure: number,
    magneticField: number  // Protects from solar radiation
  },
  
  mantle: {
    composition: ElementCounts,
    convectionCells: ConvectionPattern[],
    volcanicActivity: number,
    heatFlow: number
  },
  
  crust: {
    thickness: number,
    composition: ElementCounts,
    tectonicPlates: PlateSystem,
    faultLines: Fault[],
    mineralDeposits: DepositMap  // WHERE IS COPPER? TIN? DIAMONDS?
  },
  
  hydrosphere: {
    waterCoverage: number,  // Water planet? Cork planet? Dry?
    oceanDepth: number,
    lakePositions: Lake[],
    riverSystems: River[],
    waterTable: WaterTableMap,
    salinity: number
  },
  
  atmosphere: {
    composition: ElementCounts,
    pressure: number,
    oxygenPermeability: number,
    weatherPatterns: WeatherSystem
  },
  
  pedosphere: {
    soilDepth: number,  // Soil is PRODUCED by weathering/life
    soilComposition: ElementCounts,
    nutrientRichPatches: NutrientMap,
    erosionPatterns: ErosionMap
  },
  
  lithosphere: {
    caveSystem: Cave[],
    aquiferDepth: number,
    mineralVeins: VeinMap,  // Copper veins, tin deposits, diamond pipes
    geothermalVents: Vent[]
  }
}
```

---

## Every Surface Coordinate = Line to Core

**Critical Design Principle:**

Every point on the surface (x, z) has a complete vertical history:

```typescript
interface SurfaceCoordinate {
  surface: Vector3,
  
  // Line down to core
  verticalProfile: {
    depth: number,
    layer: 'soil' | 'rock' | 'mantle' | 'core',
    composition: ElementCounts,
    temperature: number,
    pressure: number,
    atomicHistory: ProvenanceChain  // Every atom's cosmic origin
  }[],
  
  // Available materials at this location
  minableResources: {
    element: Element,
    depth: number,
    concentration: number,
    extractionDifficulty: number
  }[],
  
  // Life probability
  lifeProbability: {
    waterAccess: number,
    nutrientRichness: number,
    solarExposure: number,
    temperatureStability: number,
    protectionFromPredators: number
  }
}
```

---

## Why This Matters for AI

**Rival AI never gets stuck.** When evaluating actions:

```typescript
// AI wants to nurture food for aquatic species
const intent = await rivalAI.evaluateNurtureFoodIntent();

// AI can query deterministic map:
const waterSources = planetaryMap.queryWaterAccess(territory);
const nutrientRichSoil = planetaryMap.queryNutrients(territory);
const optimalLocation = planetaryMap.intersect(waterSources, nutrientRichSoil);

// AI submits intent with confidence
return {
  action: 'nurture_food',
  target: optimalLocation,
  magnitude: 0.8
}
```

**No hesitation. No randomness. Information is THERE, deterministic, queryable.**

---

## Material Technology Progression

Because materials are cosmically determined:

### Young Galaxy (Low Metallicity)
- Mostly H, He, C, O, N
- **Tech ceiling:** Wood tools, rope, fire
- **No path to:** Bronze, iron, gunpowder

### Middle-Age Galaxy (Medium Metallicity)
- Fe, Cu, Sn deposits from early supernovae
- **Tech ceiling:** Bronze → Iron → Steel
- **Possible:** Swords, armor, simple machines

### Old Galaxy (High Metallicity)
- Full periodic table from multiple supernova generations
- **Tech ceiling:** Gunpowder → Chemistry → Atomic
- **Possible:** Firearms, explosives, nuclear weapons

**The 3-word seed determines galaxy age → Determines tech ceiling**

---

## Dead World Bias (Difficulty Setting)

**Main Menu Option:** Adjust genesis biases toward favorable/unfavorable conditions

### Easy Mode (Life-Favoring Biases):
```typescript
genesisAdjustments = {
  waterCoverage: +20%,  // More oceans
  oxygenAtmosphere: +15%,  // Breathable air
  mineralRichness: +30%,  // Easy resource access
  solarStability: +10%,  // Less radiation
  tectonicActivity: -20%  // Fewer volcanoes/earthquakes
}
```

### Hard Mode (Dead World Biases):
```typescript
genesisAdjustments = {
  waterCoverage: -40%,  // Desert planet
  oxygenAtmosphere: -30%,  // Toxic atmosphere
  mineralRichness: -50%,  // Buried deep, hard to access
  solarStability: -20%,  // High radiation
  tectonicActivity: +40%  // Constant volcanic activity
}
```

**Still deterministic:** Same seed + same bias = same world, just harder/easier

---

## FMV Pivot Point

**CRITICAL SEQUENCE:**

1. **Zoom OUT:** Surface → Planet → System → Galaxy → Universe
2. **Establish universal coordinates and galaxy age**
3. **Zoom IN:** Universe → Galaxy → System
4. **PIVOT TO RAPIER PHYSICS:** Show actual planetary accretion
5. **Accretion builds layers:** Core forms → Mantle convection → Crust solidifies → Water delivery via impacts → Atmosphere outgassing
6. **Deterministic outcome:** Same seed = same planetary structure
7. **Zoom to surface:** First life emerges at most probable location
8. **Switch to gameplay:** Flat map view of starting area

**Question:** Should planetary accretion use YUKA or pure law-based algorithms?
- **Answer:** Pure law-based. YUKA introduces variation. We need repeatability.

---

## Implementation Checklist

- [ ] GenesisConstants records universal coordinates
- [ ] CosmicProvenanceTimeline records galaxy age and supernova cycles
- [ ] PlanetaryAccretionSystem builds deterministic layers
- [ ] SurfaceCoordinateMap stores vertical profiles for every (x,z)
- [ ] MineralDepositSystem places resources based on galaxy metallicity
- [ ] WaterSystemGenerator creates oceans/lakes/rivers from hydrosphere data
- [ ] LifeProbabilityMap calculates emergence likelihood per coordinate
- [ ] DeadWorldBias adjustable in main menu settings
- [ ] FMV sequence writes ALL genesis data to GameState
- [ ] Rival AI can query planetary map for resource locations

---

## When Creature Dies

**"Everything is a squirrel" applies to death too:**

```typescript
// Fox dies
const foxCorpse = {
  mass: fox.mass,  // Conservation law
  elementCounts: fox.elementCounts,  // Same atoms
  cosmicLineage: fox.cosmicLineage,  // Traces back to Big Bang
  position: fox.position,
  
  // Decomposition becomes available materials
  decayProducts: {
    meat: { C: 20, O: 10, H: 15, N: 5 },
    bone: { Ca: 10, P: 5, O: 8 },
    fur: { C: 15, H: 10, N: 3 }
  }
}

// These become harvestable by other creatures
world.add(createMaterial('fox_meat', foxCorpse.decayProducts.meat));
world.add(createMaterial('fox_bone', foxCorpse.decayProducts.bone));
world.add(createMaterial('fox_fur', foxCorpse.decayProducts.fur));
```

**Shelter destroyed?** Same logic - materials return to world with full cosmic provenance.

---

## Summary

**Everything traces back. Nothing is random. Laws determine all.**

Seed → Universal coordinates → Galaxy age → Stellar fusion → Planetary accretion → Surface materials → Life emergence → Tool creation → Technology ceiling

**This is the foundation of fair competition between player and rival AI.**
