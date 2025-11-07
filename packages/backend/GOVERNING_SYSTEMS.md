# WHAT GOVERNS THE RAYCAST?

## The Question

When you "drive a line down to the core", what **systems** (mathematical/logical rules) determine:
1. What material you encounter at each depth?
2. Whether that material is accessible?
3. What happens when you try to extract it?

---

## System 1: PLANETARY STRATIFICATION

**Governs:** What material exists at any point (x, y, z)

### Input
- Position (x, y, z)
- Planet seed
- Generation number (can affect material distribution over time)

### Logic
```typescript
function getMaterialAt(x: number, y: number, z: number, state: GameState): Material {
  // 1. Calculate depth from surface
  const surfaceHeight = state.planet.terrainNoise.get(x, z, state.seed);
  const depth = surfaceHeight - y;
  
  // 2. Find which layer this depth falls into
  const layer = state.planet.stratification.find(layer => 
    depth >= layer.minDepth && depth <= layer.maxDepth
  );
  
  if (!layer) return null; // Below all layers (mantle/core)
  
  // 3. Select material within layer using noise
  const materialNoise = state.planet.materialNoise.get(x, y, z, state.seed);
  const material = layer.selectMaterial(materialNoise); // Weighted selection
  
  return material;
}
```

### Output
```typescript
{
  type: 'limestone',
  category: 'stone',
  hardness: 3.2,
  density: 2.7,
  minDepth: 0,
  maxDepth: 50,
}
```

---

## System 2: CREATURE CAPABILITY

**Governs:** What a creature can physically reach/break

### Input
- Creature traits (excavation, manipulation, strength)
- Available tools

### Logic
```typescript
function getCreatureCapability(creature: Creature, state: GameState): Capability {
  // Base capability from traits
  let maxDepth = creature.traits.excavation * 50; // 0-50 meters
  let maxHardness = creature.traits.strength * 5; // 0-5 Mohs scale
  
  // Tool multipliers
  const bestDigger = state.tools
    .filter(t => t.type === 'digger')
    .filter(t => creature.traits.manipulation >= t.requiredManipulation)
    .sort((a, b) => b.reach - a.reach)[0];
  
  if (bestDigger) {
    maxDepth *= bestDigger.reachMultiplier; // e.g., 2x
    maxHardness += bestDigger.hardnessBonus; // e.g., +2
  }
  
  return { maxDepth, maxHardness };
}
```

### Output
```typescript
{
  maxDepth: 25, // meters
  maxHardness: 4.5, // Mohs
}
```

---

## System 3: MATERIAL ACCESSIBILITY

**Governs:** Which materials are "reachable" given current creature capabilities

### Input
- All materials in planet stratification
- Current creature capabilities
- Current tool availability

### Logic
```typescript
function classifyMaterials(state: GameState): MaterialAccessibility {
  const creatures = Array.from(state.creatures.values());
  
  // Calculate max capability across all creatures
  const maxCapability = creatures.reduce((max, creature) => {
    const cap = getCreatureCapability(creature, state);
    return {
      maxDepth: Math.max(max.maxDepth, cap.maxDepth),
      maxHardness: Math.max(max.maxHardness, cap.maxHardness),
    };
  }, { maxDepth: 0, maxHardness: 0 });
  
  // Classify each material
  const accessible = [];
  const borderline = [];
  const inaccessible = [];
  
  for (const material of state.planet.materials) {
    const depthOK = material.minDepth <= maxCapability.maxDepth;
    const hardnessOK = material.hardness <= maxCapability.maxHardness;
    
    if (depthOK && hardnessOK) {
      accessible.push(material);
    } else if (depthOK || hardnessOK) {
      borderline.push(material);
    } else {
      inaccessible.push(material);
    }
  }
  
  return { accessible, borderline, inaccessible };
}
```

### Output
```typescript
{
  accessible: [
    { type: 'limestone', depth: 0-50, hardness: 3.2 },
    { type: 'sandstone', depth: 10-60, hardness: 2.8 },
  ],
  borderline: [
    { type: 'granite', depth: 20-100, hardness: 6.5 }, // Too hard
  ],
  inaccessible: [
    { type: 'diamond', depth: 500-1000, hardness: 10 }, // Too deep AND too hard
  ]
}
```

---

## System 4: TOOL EMERGENCE

**Governs:** When new tools become available (expanding capability)

### Input
- Material accessibility (pressure)
- Creature trait distribution
- Current generation

### Logic
```typescript
function evaluateToolEmergence(state: GameState): ToolEmergenceResult {
  const { accessible, inaccessible } = classifyMaterials(state);
  
  // Calculate pressure (% of materials inaccessible)
  const totalMaterials = state.planet.materials.length;
  const pressure = inaccessible.length / totalMaterials;
  
  // Calculate creature readiness
  const avgManipulation = getAverageTrait('manipulation', state.creatures);
  const avgIntelligence = getAverageTrait('intelligence', state.creatures);
  
  // Fuzzy logic evaluation
  const fuzzy = new FuzzyModule();
  
  // Define fuzzy variables
  fuzzy.addFLV('pressure', 0, 1)
    .addTriangle('low', 0, 0, 0.3)
    .addTriangle('medium', 0.2, 0.5, 0.8)
    .addTriangle('high', 0.7, 1, 1);
  
  fuzzy.addFLV('manipulation', 0, 1)
    .addTriangle('low', 0, 0, 0.4)
    .addTriangle('high', 0.6, 1, 1);
  
  fuzzy.addFLV('intelligence', 0, 1)
    .addTriangle('low', 0, 0, 0.4)
    .addTriangle('high', 0.6, 1, 1);
  
  fuzzy.addFLV('desirability', 0, 1)
    .addTriangle('low', 0, 0, 0.3)
    .addTriangle('medium', 0.3, 0.5, 0.7)
    .addTriangle('high', 0.7, 1, 1);
  
  // Define rules
  fuzzy.addRule(
    'IF pressure IS high AND manipulation IS high AND intelligence IS high ' +
    'THEN desirability IS high'
  );
  
  fuzzy.addRule(
    'IF pressure IS medium AND manipulation IS high ' +
    'THEN desirability IS medium'
  );
  
  fuzzy.addRule(
    'IF pressure IS low OR manipulation IS low ' +
    'THEN desirability IS low'
  );
  
  // Evaluate
  fuzzy.setValue('pressure', pressure);
  fuzzy.setValue('manipulation', avgManipulation);
  fuzzy.setValue('intelligence', avgIntelligence);
  
  fuzzy.defuzzify('desirability');
  const desirability = fuzzy.getValue('desirability');
  
  // Emergence threshold
  if (desirability > 0.7) {
    const tool = generateTool(state, inaccessible);
    state.tools.push(tool);
    
    return {
      emerged: true,
      tool,
      reason: `High pressure (${pressure.toFixed(2)}) + capable creatures`,
    };
  }
  
  return { emerged: false, desirability };
}

function generateTool(state: GameState, inaccessible: Material[]): Tool {
  // Determine what kind of tool is needed
  const needsDepth = inaccessible.some(m => m.minDepth > state.maxReach);
  const needsHardness = inaccessible.some(m => m.hardness > state.maxHardness);
  
  if (needsDepth && needsHardness) {
    return {
      type: 'advanced-excavator',
      reachMultiplier: 2.0,
      hardnessBonus: 2.0,
      requiredManipulation: 0.7,
      emergedGeneration: state.generation,
    };
  } else if (needsDepth) {
    return {
      type: 'deep-digger',
      reachMultiplier: 3.0,
      hardnessBonus: 0,
      requiredManipulation: 0.6,
      emergedGeneration: state.generation,
    };
  } else {
    return {
      type: 'hard-crusher',
      reachMultiplier: 1.0,
      hardnessBonus: 3.0,
      requiredManipulation: 0.7,
      emergedGeneration: state.generation,
    };
  }
}
```

### Output
```typescript
{
  emerged: true,
  tool: {
    type: 'deep-digger',
    reachMultiplier: 3.0,
    hardnessBonus: 0,
    requiredManipulation: 0.6,
    emergedGeneration: 42,
  },
  reason: "High pressure (0.73) + capable creatures"
}
```

---

## System 5: EVOLUTIONARY PRESSURE

**Governs:** How creature traits change in response to environment

### Input
- Current creature traits
- Material accessibility
- Resource scarcity
- Generation number

### Logic
```typescript
function calculateEvolutionaryPressure(state: GameState): EvolutionaryPressure {
  const { accessible, inaccessible } = classifyMaterials(state);
  
  // Resource pressure (fewer accessible materials = higher pressure)
  const resourcePressure = 1 - (accessible.length / state.planet.materials.length);
  
  // Depth pressure (if valuable materials are deep)
  const valuableMaterialsDeep = inaccessible.filter(m => m.value > 5).length;
  const depthPressure = valuableMaterialsDeep / state.planet.materials.length;
  
  // Hardness pressure (if valuable materials are hard)
  const valuableMaterialsHard = inaccessible.filter(m => m.value > 5).length;
  const hardnessPressure = valuableMaterialsHard / state.planet.materials.length;
  
  return {
    // Which traits should increase?
    excavation: depthPressure * 0.1, // +10% per generation if high depth pressure
    strength: hardnessPressure * 0.1,
    manipulation: (depthPressure + hardnessPressure) * 0.05, // For tool use
    intelligence: resourcePressure * 0.05, // Problem solving
    social: resourcePressure * 0.03, // Cooperation under scarcity
  };
}

function evolveCreature(creature: Creature, state: GameState): Creature {
  const pressure = calculateEvolutionaryPressure(state);
  const mutation = gaussianRandom(0, 0.05); // Random noise
  
  const newTraits = {};
  for (const [trait, value] of Object.entries(creature.traits)) {
    // Apply pressure + mutation
    const delta = (pressure[trait] || 0) + mutation;
    newTraits[trait] = clamp(value + delta, 0, 1);
  }
  
  return {
    ...creature,
    id: `${creature.id}-gen${state.generation}`,
    generation: state.generation,
    parentId: creature.id,
    traits: newTraits,
  };
}
```

### Output
```typescript
// Before evolution
{
  id: 'creature-1',
  traits: {
    excavation: 0.5,
    strength: 0.4,
    manipulation: 0.3,
  }
}

// After evolution (high depth pressure)
{
  id: 'creature-1-gen43',
  parentId: 'creature-1',
  generation: 43,
  traits: {
    excavation: 0.6,  // +0.1 from pressure
    strength: 0.42,   // +0.02 from mutation
    manipulation: 0.35, // +0.05 from pressure
  }
}
```

---

## System 6: WORLD SCORE

**Governs:** Overall "progress" metric for ending conditions

### Input
- Material accessibility
- Creature capabilities
- Tool/Building emergence
- Tribal development

### Logic
```typescript
function calculateWorldScore(state: GameState): number {
  let score = 0;
  
  // 1. Material access (0-30 points)
  const { accessible } = classifyMaterials(state);
  const accessPercent = accessible.length / state.planet.materials.length;
  score += accessPercent * 30;
  
  // 2. Creature evolution (0-20 points)
  const avgTraits = getAverageCreatureTraits(state.creatures);
  const evolutionScore = Object.values(avgTraits).reduce((a, b) => a + b, 0) / 10;
  score += evolutionScore * 20;
  
  // 3. Tool emergence (0-20 points)
  score += (state.tools.length / 10) * 20; // Assuming ~10 possible tools
  
  // 4. Social development (0-20 points)
  const packScore = (state.packs.size / 5) * 10; // Assuming ~5 packs max
  const tribeScore = (state.tribes.size / 3) * 10; // Assuming ~3 tribes max
  score += packScore + tribeScore;
  
  // 5. Building construction (0-10 points)
  score += (state.buildings.size / 20) * 10; // Assuming ~20 buildings max
  
  return Math.min(score, 100);
}
```

### Output
```typescript
{
  score: 67,
  breakdown: {
    materialAccess: 22,
    evolution: 15,
    tools: 12,
    social: 14,
    buildings: 4,
  }
}
```

---

## System 7: ENDING DETECTION

**Governs:** When/how the game concludes

### Input
- World score
- Material accessibility
- Tribal dynamics
- Building types

### Logic
```typescript
function detectEnding(state: GameState): Ending | null {
  const score = calculateWorldScore(state);
  const { accessible, inaccessible } = classifyMaterials(state);
  
  // 1. TRANSCENDENCE (100% material access, all tools)
  if (accessible.length === state.planet.materials.length && state.tools.length >= 8) {
    return {
      type: 'transcendence',
      message: 'Creatures have mastered all materials and transcended physical limitations',
      generation: state.generation,
      score: 100,
    };
  }
  
  // 2. MUTUALISM (high cooperation, balanced tribes)
  const tribes = Array.from(state.tribes.values());
  const allPeaceful = tribes.every(t => t.culture === 'peaceful');
  const hasTemples = state.buildings.some(b => b.type === 'temple');
  
  if (allPeaceful && hasTemples && tribes.length >= 2 && score > 70) {
    return {
      type: 'mutualism',
      message: 'Tribes have achieved peaceful coexistence and shared prosperity',
      generation: state.generation,
      score,
    };
  }
  
  // 3. DOMINATION (one tribe controls everything)
  const dominantTribe = tribes.find(t => 
    t.population > 0.8 * getTotalPopulation(state) &&
    t.buildingIds.length > 0.8 * state.buildings.size
  );
  
  if (dominantTribe && score > 60) {
    return {
      type: 'domination',
      message: `The ${dominantTribe.name} tribe has dominated all others`,
      generation: state.generation,
      score,
    };
  }
  
  // 4. EXTINCTION (all creatures dead)
  if (state.creatures.size === 0) {
    return {
      type: 'extinction',
      message: 'All creatures have perished',
      generation: state.generation,
      score: 0,
    };
  }
  
  // 5. STAGNATION (no progress for 100 generations)
  const recentScores = state.scoreHistory.slice(-100);
  const noProgress = recentScores.every(s => Math.abs(s - score) < 5);
  
  if (noProgress && state.generation > 200) {
    return {
      type: 'stagnation',
      message: 'Evolution has stagnated with no significant progress',
      generation: state.generation,
      score,
    };
  }
  
  return null; // Game continues
}
```

### Output
```typescript
{
  type: 'mutualism',
  message: 'Tribes have achieved peaceful coexistence and shared prosperity',
  generation: 156,
  score: 73
}
```

---

## REST API Mapping

Each system becomes a RESTful resource:

```
GET  /api/game/:id/materials/query?x=10&y=-5&z=3
→ System 1: Planetary Stratification

GET  /api/game/:id/creatures/:id/capability
→ System 2: Creature Capability

GET  /api/game/:id/materials/accessibility
→ System 3: Material Accessibility

POST /api/game/:id/tools/evaluate
→ System 4: Tool Emergence

POST /api/game/:id/generation/advance
→ System 5: Evolutionary Pressure

GET  /api/game/:id/score
→ System 6: World Score

GET  /api/game/:id/ending
→ System 7: Ending Detection
```

---

## Summary

**The Line to the Core is governed by:**

1. **Stratification** - What material exists at each depth
2. **Capability** - What creatures can reach/break
3. **Accessibility** - Which materials are reachable NOW
4. **Tool Emergence** - When capability expands
5. **Evolutionary Pressure** - How creatures adapt to constraints
6. **World Score** - Progress toward endings
7. **Ending Detection** - When/how game concludes

**Each system is:**
- A pure mathematical function
- Stateless (operates on GameState)
- Exposed as a REST endpoint
- Computable on-demand

**No loops. No continuous updates. Just queries and computations.**
