# UNIVERSAL DECOMPOSITION: EVERY SYSTEM CAN DIE

## The Universal Principle

**EVERYTHING is a temporary organization.**

**EVERYTHING can decompose.**

Physical entities:
- Creatures → Organic matter → Elements
- Tools → Components → Raw materials
- Buildings → Rubble → Materials

Abstract entities:
- Packs → Individual creatures
- Tribes → Packs or individuals
- Governments → Tribes or anarchy
- Religions → Individual beliefs or forgotten
- Mythologies → Oral fragments or lost

**Archetypes define decomposition rules:**
- What does it decompose INTO?
- WHO or WHAT decomposes it?
- HOW LONG before it decomposes?

**9/10 times: Aggressive creatures or local weather.**

**1/10 times: Social pressure, revolution, heresy, forgetting.**

---

## Decomposition Rules by Archetype

### Physical Entities

#### Creature Decomposition

```typescript
const CREATURE_DECOMPOSITION = {
  archetype: 'creature',
  
  decomposesInto: 'organic_matter',
  
  decomposers: [
    { type: 'predator', priority: 1, weight: 0.5 },        // 50% eaten by predators
    { type: 'scavenger', priority: 2, weight: 0.3 },       // 30% scavenged
    { type: 'environmental', priority: 3, weight: 0.2 }    // 20% natural decomposition
  ],
  
  stuckThreshold: 100,  // 100 cycles stuck → decompose
  
  decompositionYield: {
    carbon: 1.0,      // 100% returned
    calcium: 1.0,     // 100% returned (bones persist)
    iron: 1.0,        // 100% returned
    water: 0.5,       // 50% evaporates
    nitrogen: 0.8     // 80% returned
  },
  
  visualFeedback: 'corpse_animation'
};
```

#### Tool Decomposition

```typescript
const TOOL_DECOMPOSITION = {
  archetype: 'tool',
  
  decomposesInto: 'components_or_materials',
  
  decomposers: [
    { type: 'owner', priority: 1, weight: 0.7 },           // 70% owner decomposes
    { type: 'tribe_member', priority: 2, weight: 0.2 },    // 20% tribe salvages
    { type: 'environmental', priority: 3, weight: 0.1 }    // 10% rusts/rots
  ],
  
  stuckThreshold: 10,  // 10 cycles stuck → decompose
  
  decompositionStrategy: 'try_separate_first',
  // nail_hammer → [nail, hammer] if possible
  // otherwise → [wood, iron, iron_nail]
  
  decompositionYield: {
    wood: 0.9,        // 90% recovered (some lost to splintering)
    stone: 1.0,       // 100% recovered
    iron: 0.95,       // 95% recovered (some rust)
    bone: 0.8         // 80% recovered (brittle)
  },
  
  visualFeedback: 'tool_breaking_animation'
};
```

#### Building Decomposition

```typescript
const BUILDING_DECOMPOSITION = {
  archetype: 'building',
  
  decomposesInto: 'rubble_and_materials',
  
  decomposers: [
    { type: 'tribe', priority: 1, weight: 0.6 },           // 60% tribe deconstructs
    { type: 'weather', priority: 2, weight: 0.3 },         // 30% storm/earthquake
    { type: 'time', priority: 3, weight: 0.1 }             // 10% natural decay
  ],
  
  stuckThreshold: 50,  // 50 cycles stuck → decompose
  
  decompositionYield: {
    wood: 0.7,        // 70% salvageable (rest rotten)
    stone: 0.9,       // 90% salvageable (some cracked)
    clay: 0.5,        // 50% salvageable (rest crumbled)
    metal: 0.95       // 95% salvageable (durable)
  },
  
  visualFeedback: 'building_collapse_animation'
};
```

---

### Abstract Entities

#### Pack Decomposition

```typescript
const PACK_DECOMPOSITION = {
  archetype: 'pack',
  
  decomposesInto: 'individual_creatures',
  
  decomposers: [
    { type: 'internal_conflict', priority: 1, weight: 0.4 },    // 40% infighting
    { type: 'resource_scarcity', priority: 2, weight: 0.3 },    // 30% starvation
    { type: 'predator_attack', priority: 3, weight: 0.2 },      // 20% external threat
    { type: 'natural_drift', priority: 4, weight: 0.1 }         // 10% just wander off
  ],
  
  stuckThreshold: 200,  // 200 cycles stuck → decompose
  
  decompositionReason: 'cohesion_failure',
  
  decompositionYield: {
    creatures: 1.0,   // 100% of members survive as individuals
    territory: 0.0,   // Territory disperses (no one owns it)
    resources: 0.5    // 50% of shared resources lost (spoilage)
  },
  
  visualFeedback: 'pack_scattering_animation'
};
```

#### Tribe Decomposition

```typescript
const TRIBE_DECOMPOSITION = {
  archetype: 'tribe',
  
  decomposesInto: 'packs_or_individuals',
  
  decomposers: [
    { type: 'civil_war', priority: 1, weight: 0.3 },           // 30% internal conflict
    { type: 'famine', priority: 2, weight: 0.25 },             // 25% resource collapse
    { type: 'plague', priority: 3, weight: 0.2 },              // 20% disease (environmental)
    { type: 'invasion', priority: 4, weight: 0.15 },           // 15% other tribe
    { type: 'apathy', priority: 5, weight: 0.1 }               // 10% cultural decay
  ],
  
  stuckThreshold: 500,  // 500 cycles stuck → decompose
  
  decompositionStrategy: 'split_into_packs',
  // Large tribe → multiple packs
  // Small tribe → individuals
  
  decompositionYield: {
    creatures: 0.6,   // 60% survive (40% die in chaos)
    buildings: 0.3,   // 30% salvageable (rest burned/destroyed)
    tools: 0.5,       // 50% kept by survivors
    territory: 0.0,   // Territory abandoned
    resources: 0.2    // 20% of stored resources salvaged
  },
  
  visualFeedback: 'tribe_collapse_animation'
};
```

#### Government Decomposition

```typescript
const GOVERNMENT_DECOMPOSITION = {
  archetype: 'government',
  
  decomposesInto: 'tribal_anarchy',
  
  decomposers: [
    { type: 'revolution', priority: 1, weight: 0.4 },          // 40% uprising
    { type: 'corruption', priority: 2, weight: 0.3 },          // 30% internal rot
    { type: 'external_conquest', priority: 3, weight: 0.2 },   // 20% invasion
    { type: 'irrelevance', priority: 4, weight: 0.1 }          // 10% ignored into nonexistence
  ],
  
  stuckThreshold: 1000,  // 1000 cycles stuck → decompose
  
  decompositionReason: 'legitimacy_failure',
  
  decompositionYield: {
    tribes: 1.0,      // Tribes survive independently
    laws: 0.0,        // Laws null and void
    institutions: 0.1,// 10% of institutions persist informally
    infrastructure: 0.4 // 40% of shared buildings survive
  },
  
  visualFeedback: 'government_collapse_animation'
};
```

#### Religion Decomposition

```typescript
const RELIGION_DECOMPOSITION = {
  archetype: 'religion',
  
  decomposesInto: 'individual_beliefs_or_heresy',
  
  decomposers: [
    { type: 'heresy', priority: 1, weight: 0.35 },             // 35% competing doctrine
    { type: 'unanswered_prayers', priority: 2, weight: 0.3 },  // 30% disillusionment
    { type: 'scientific_explanation', priority: 3, weight: 0.2 }, // 20% understanding replaces faith
    { type: 'forgotten', priority: 4, weight: 0.15 }           // 15% just stops being practiced
  ],
  
  stuckThreshold: 2000,  // 2000 cycles stuck → decompose
  
  decompositionReason: 'faith_erosion',
  
  decompositionYield: {
    believers: 0.3,   // 30% still believe individually (no organized religion)
    rituals: 0.1,     // 10% of rituals continue as cultural traditions
    myths: 0.5,       // 50% of myths persist as oral stories
    temples: 0.2      // 20% of temples repurposed (rest abandoned)
  },
  
  visualFeedback: 'religion_fragmentation_animation'
};
```

#### Mythology Decomposition

```typescript
const MYTHOLOGY_DECOMPOSITION = {
  archetype: 'mythology',
  
  decomposesInto: 'oral_fragments_or_forgotten',
  
  decomposers: [
    { type: 'forgotten', priority: 1, weight: 0.5 },           // 50% just forgotten
    { type: 'reinterpreted', priority: 2, weight: 0.3 },       // 30% morphed into new myths
    { type: 'rationalized', priority: 3, weight: 0.15 },       // 15% explained as history
    { type: 'suppressed', priority: 4, weight: 0.05 }          // 5% actively destroyed
  ],
  
  stuckThreshold: 3000,  // 3000 cycles stuck → decompose
  
  decompositionReason: 'cultural_memory_loss',
  
  decompositionYield: {
    stories: 0.2,     // 20% persist as garbled tales
    characters: 0.1,  // 10% of names/figures remembered
    lessons: 0.3,     // 30% of moral lessons persist
    artifacts: 0.05   // 5% of religious artifacts survive
  },
  
  visualFeedback: 'myth_fading_animation'
};
```

---

## Archetype-Driven Decomposition System

### Universal Decomposer

```typescript
class UniversalDecomposer {
  decompose(entity: Entity, planet: Planet) {
    // Get decomposition rules from archetype
    const rules = DECOMPOSITION_RULES[entity.archetype];
    
    if (!rules) {
      console.error(`[DECOMPOSE] No decomposition rules for archetype ${entity.archetype}`);
      return this.forceDelete(entity);
    }
    
    console.log(`[DECOMPOSE] Entity ${entity.id} (${entity.archetype}) decomposing...`);
    
    // Select decomposer based on weighted priority
    const decomposer = this.selectDecomposer(rules.decomposers, entity, planet);
    
    console.log(`[DECOMPOSE] Selected decomposer: ${decomposer.type}`);
    
    // Execute decomposition
    this.executeDecomposition(entity, decomposer, rules, planet);
  }
  
  selectDecomposer(decomposers: Decomposer[], entity: Entity, planet: Planet): Decomposer {
    // Sort by priority
    decomposers.sort((a, b) => a.priority - b.priority);
    
    // Try each decomposer in order
    for (const decomposer of decomposers) {
      if (this.canDecompose(decomposer, entity, planet)) {
        // Use weighted randomness
        if (Math.random() < decomposer.weight) {
          return decomposer;
        }
      }
    }
    
    // Fallback to last decomposer (usually environmental/time)
    return decomposers[decomposers.length - 1];
  }
  
  canDecompose(decomposer: Decomposer, entity: Entity, planet: Planet): boolean {
    switch (decomposer.type) {
      case 'predator':
        // Can a predator reach this creature?
        const predator = planet.findNearestPredator(entity.position);
        return predator !== null;
      
      case 'weather':
        // Is weather available?
        return planet.weatherSystem.canCreateEvent(entity.position);
      
      case 'tribe':
        // Does entity have an owner tribe?
        return entity.tribe !== null;
      
      case 'revolution':
        // Is there internal dissent?
        return entity.dissentLevel > 0.7;
      
      case 'heresy':
        // Is there a competing belief system?
        return planet.religions.length > 1;
      
      // ... etc
      
      default:
        return true;  // Environmental/time always available
    }
  }
  
  executeDecomposition(entity: Entity, decomposer: Decomposer, rules: DecompositionRules, planet: Planet) {
    // Visual feedback
    if (rules.visualFeedback) {
      planet.addVisualEffect({
        type: rules.visualFeedback,
        position: entity.position,
        duration: 5
      });
    }
    
    // Execute decomposition based on type
    switch (decomposer.type) {
      case 'predator':
        this.predatorDecomposition(entity, rules, planet);
        break;
      
      case 'weather':
        this.weatherDecomposition(entity, rules, planet);
        break;
      
      case 'tribe':
        this.tribeDecomposition(entity, rules, planet);
        break;
      
      case 'revolution':
        this.revolutionDecomposition(entity, rules, planet);
        break;
      
      case 'heresy':
        this.heresyDecomposition(entity, rules, planet);
        break;
      
      case 'forgotten':
        this.forgottenDecomposition(entity, rules, planet);
        break;
      
      default:
        this.environmentalDecomposition(entity, rules, planet);
    }
  }
}
```

---

## Specific Decomposition Examples

### Building Decomposition By Storm

```typescript
weatherDecomposition(building: Building, rules: DecompositionRules, planet: Planet) {
  console.log(`[DECOMPOSE] 🌪️ STORM decomposing building ${building.id}`);
  
  // Create storm event
  const storm = {
    type: 'destructive_storm',
    location: building.location,
    cycle: planet.currentCycle,
    target: building.id,
    windSpeed: 150,  // km/h
    duration: 20     // cycles
  };
  
  planet.weatherEvents.push(storm);
  
  // Visual effects
  planet.addVisualEffect({
    type: 'building_collapse_by_storm',
    position: building.location,
    duration: 20
  });
  
  // Return materials based on yield
  for (const [material, amount] of Object.entries(building.composition)) {
    const recovered = amount * rules.decompositionYield[material];
    
    // Storm scatters materials
    for (let i = 0; i < 5; i++) {
      const scatterPosition = {
        lat: building.location.lat + (Math.random() - 0.5) * 0.01,
        lon: building.location.lon + (Math.random() - 0.5) * 0.01
      };
      
      planet.addMaterial(scatterPosition, material, recovered / 5);
    }
  }
  
  // Remove building
  planet.removeBuilding(building);
  
  console.log(`[DECOMPOSE] Building destroyed by storm, materials scattered`);
}
```

### Government Decomposition By Revolution

```typescript
revolutionDecomposition(government: Government, rules: DecompositionRules, planet: Planet) {
  console.log(`[DECOMPOSE] ✊ REVOLUTION decomposing government ${government.id}`);
  
  // Find dissenting tribes
  const dissenters = government.tribes.filter(t => t.loyalty < 0.3);
  
  if (dissenters.length === 0) {
    // No dissenters? Impossible, but fallback
    return this.environmentalDecomposition(government, rules, planet);
  }
  
  // Create revolution event
  const revolution = {
    type: 'revolution',
    location: government.capital,
    cycle: planet.currentCycle,
    instigators: dissenters.map(t => t.id),
    target: government.id
  };
  
  planet.historicalEvents.push(revolution);
  
  // Visual effects
  planet.addVisualEffect({
    type: 'revolution_uprising',
    position: government.capital,
    duration: 100  // Long event
  });
  
  // Tribes break away
  for (const tribe of government.tribes) {
    tribe.government = null;  // Independent now
    tribe.laws = [];          // No more government laws
    
    if (dissenters.includes(tribe)) {
      // Revolutionary tribe gets bonus morale
      tribe.morale += 0.3;
    } else {
      // Loyalist tribe suffers
      tribe.morale -= 0.2;
    }
  }
  
  // Infrastructure survives partially
  const infrastructure = government.buildings;
  
  for (const building of infrastructure) {
    if (Math.random() < rules.decompositionYield.infrastructure) {
      // Building survives, assigned to nearest tribe
      const nearestTribe = planet.findNearestTribe(building.location);
      building.owner = nearestTribe;
    } else {
      // Building destroyed in revolution
      this.weatherDecomposition(building, BUILDING_DECOMPOSITION, planet);
    }
  }
  
  // Remove government
  planet.removeGovernment(government);
  
  console.log(`[DECOMPOSE] Government overthrown, tribes independent`);
}
```

### Religion Decomposition By Heresy

```typescript
heresyDecomposition(religion: Religion, rules: DecompositionRules, planet: Planet) {
  console.log(`[DECOMPOSE] 🔥 HERESY decomposing religion ${religion.id}`);
  
  // Find competing religion or create new heresy
  let heresy = planet.religions.find(r => r.id !== religion.id);
  
  if (!heresy) {
    // Create new heretical belief
    heresy = new Religion({
      name: `Reformed ${religion.name}`,
      origin: 'heresy',
      parent: religion.id,
      beliefs: this.invertBeliefs(religion.beliefs),
      cycle: planet.currentCycle
    });
    
    planet.religions.push(heresy);
  }
  
  // Create schism event
  const schism = {
    type: 'religious_schism',
    cycle: planet.currentCycle,
    originalReligion: religion.id,
    hereticReligion: heresy.id,
    reason: 'doctrinal_dispute'
  };
  
  planet.historicalEvents.push(schism);
  
  // Visual effects
  planet.addVisualEffect({
    type: 'religious_schism',
    position: religion.holysite,
    duration: 50
  });
  
  // Split believers
  for (const tribe of religion.followers) {
    if (Math.random() < 0.5) {
      // Tribe converts to heresy
      tribe.religion = heresy;
      heresy.followers.push(tribe);
    } else if (Math.random() < rules.decompositionYield.believers) {
      // Tribe keeps old faith
      // (stays with religion)
    } else {
      // Tribe becomes secular
      tribe.religion = null;
    }
  }
  
  // Rituals evolve
  const survivingRituals = religion.rituals.filter(() => 
    Math.random() < rules.decompositionYield.rituals
  );
  
  // Some become cultural traditions (no longer religious)
  for (const ritual of survivingRituals) {
    ritual.type = 'cultural_tradition';
    ritual.religiousSignificance = false;
  }
  
  // Temples repurposed or abandoned
  for (const temple of religion.temples) {
    if (Math.random() < rules.decompositionYield.temples) {
      // Repurposed (heresy takes it over or becomes civic building)
      if (Math.random() < 0.5) {
        temple.religion = heresy;
      } else {
        temple.type = 'civic_building';
        temple.religion = null;
      }
    } else {
      // Abandoned
      this.weatherDecomposition(temple, BUILDING_DECOMPOSITION, planet);
    }
  }
  
  // Remove old religion if no followers left
  if (religion.followers.length === 0) {
    planet.removeReligion(religion);
    console.log(`[DECOMPOSE] Religion extinct, replaced by heresy`);
  } else {
    console.log(`[DECOMPOSE] Religion fragmented, competing with heresy`);
  }
}
```

### Mythology Decomposition By Forgetting

```typescript
forgottenDecomposition(mythology: Mythology, rules: DecompositionRules, planet: Planet) {
  console.log(`[DECOMPOSE] 💭 FORGETTING decomposing mythology ${mythology.id}`);
  
  // No dramatic event, just... fades away
  
  // Visual effect (very subtle)
  planet.addVisualEffect({
    type: 'memory_fading',
    position: mythology.origin,
    duration: 500,  // Slow fade
    opacity: 0.2    // Barely visible
  });
  
  // Stories fragment
  const survivingStories = mythology.stories.filter(() =>
    Math.random() < rules.decompositionYield.stories
  );
  
  for (const story of survivingStories) {
    // Degrade story (lose details)
    story.details = story.details.slice(0, Math.floor(story.details.length * 0.3));
    story.accuracy = 'garbled';
    story.status = 'oral_fragment';
  }
  
  // Characters mostly forgotten
  const rememberedCharacters = mythology.characters.filter(() =>
    Math.random() < rules.decompositionYield.characters
  );
  
  for (const character of rememberedCharacters) {
    // Only name survives, not deeds
    character.deeds = [];
    character.status = 'name_only';
  }
  
  // Lessons sometimes persist
  const survivingLessons = mythology.moralLessons.filter(() =>
    Math.random() < rules.decompositionYield.lessons
  );
  
  // Convert to cultural wisdom (detached from myth)
  for (const lesson of survivingLessons) {
    lesson.type = 'cultural_wisdom';
    lesson.mythologicalOrigin = null;  // Origin forgotten
  }
  
  // Artifacts rare
  const survivingArtifacts = mythology.artifacts.filter(() =>
    Math.random() < rules.decompositionYield.artifacts
  );
  
  for (const artifact of survivingArtifacts) {
    // Artifact persists but significance forgotten
    artifact.mythologicalSignificance = 'unknown';
    artifact.status = 'mysterious_relic';
  }
  
  // Remove mythology (or downgrade to "legend")
  mythology.status = 'forgotten_legend';
  mythology.activeFollowers = 0;
  
  console.log(`[DECOMPOSE] Mythology faded from memory, fragments persist`);
}
```

---

## Summary Table

| Archetype | Decomposes Into | Primary Decomposers (9/10) | Secondary (1/10) | Stuck Threshold |
|-----------|-----------------|----------------------------|------------------|-----------------|
| Creature | Organic matter | Predators, scavengers, weather | Disease, age | 100 cycles |
| Tool | Components/materials | Owner, tribe, weather | Rust, rot | 10 cycles |
| Building | Rubble/materials | Tribe, storm, earthquake | Time, neglect | 50 cycles |
| Pack | Individuals | Infighting, starvation, predators | Natural drift | 200 cycles |
| Tribe | Packs/individuals | Civil war, famine, plague | Apathy, migration | 500 cycles |
| Government | Tribal anarchy | Revolution, corruption, invasion | Irrelevance | 1000 cycles |
| Religion | Individual beliefs | Heresy, disillusionment, science | Forgotten | 2000 cycles |
| Mythology | Oral fragments | Forgotten, reinterpreted | Suppressed | 3000 cycles |

---

## The Philosophy

**Nothing is permanent.**

**Everything is temporary organization.**

**When organization fails (stuck) → Decomposition.**

**Archetypes define HOW things decompose.**

**Archetypes define WHO decomposes them.**

**9/10 times: Aggressive creatures or weather (physical).**

**1/10 times: Social forces (revolution, heresy, forgetting).**

**Materials/elements ALWAYS return to cycle.**

**New organizations form from decomposed materials.**

**DOWN the chain, UP the chain, forever.**

**Even the most abstract concepts (religion, mythology) are subject to the cycle.**

**Nothing escapes decomposition.**

**That's the beauty of it.**
