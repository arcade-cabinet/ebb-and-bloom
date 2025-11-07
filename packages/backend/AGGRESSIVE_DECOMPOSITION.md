# AGGRESSIVE DECOMPOSITION: SYSTEMS ATTACKING SYSTEMS

## The Late-Stage Shift

**Early stages (Gen 1-3): Physical competition**
- Creatures compete for food
- Tools enable access to materials
- Buildings provide shelter

**Late stages (Gen 4-6): ABSTRACT WARFARE**
- Tribes actively decompose rival tribes
- Religions actively decompose competing faiths
- Governments actively decompose rival powers
- Mythologies actively suppress competing narratives

**This is not a bug. This is INTENTIONAL GAMEPLAY.**

**No permanence. Everything is a target for decomposition.**

---

## Why This Is Critical

### Without Aggressive Decomposition

```
Cycle 5000: Tribe A forms
Cycle 6000: Tribe B forms
Cycle 7000: Tribe C forms
...
Cycle 10000: 50 tribes exist

Problem: CROWDING
- Planet is full of tribes
- No room for new tribes
- No conflict or dynamics
- Stagnant, boring

Result: Player sees static world of permanent tribes
```

### With Aggressive Decomposition

```
Cycle 5000: Tribe A forms
Cycle 6000: Tribe B forms
Cycle 7000: Tribe A ATTACKS Tribe B
  → Tribe B decomposed
  → Survivors scattered
  → Territory absorbed
Cycle 8000: Tribe C forms
Cycle 9000: Tribe A and C form alliance
Cycle 10000: Alliance ATTACKS Tribe D
  → Tribe D decomposed
  → Resources seized

Result: Dynamic, ever-changing political landscape
```

**Aggressive decomposition creates CHURN.**

**Churn creates DYNAMICS.**

**Dynamics create INTERESTING GAMEPLAY.**

---

## Tribal Warfare: Decomposing Rival Tribes

### Yuka Evaluates: Should I Attack?

```typescript
class DecomposeRivalTribeGoal extends Goal {
  calculateDesirability(myTribe: Tribe, rivalTribe: Tribe, planet: Planet): number {
    // Fuzzy logic evaluation
    const fuzzy = new FuzzyModule();
    
    // Input: My tribe's strength
    fuzzy.addFLV('my_strength', 0, 1)
      .addTriangle('weak', 0, 0, 0.3)
      .addTriangle('moderate', 0.2, 0.5, 0.8)
      .addTriangle('strong', 0.7, 1, 1);
    
    // Input: Rival's weakness
    fuzzy.addFLV('rival_weakness', 0, 1)
      .addTriangle('strong', 0, 0, 0.3)
      .addTriangle('moderate', 0.2, 0.5, 0.8)
      .addTriangle('weak', 0.7, 1, 1);
    
    // Input: Resource gain
    fuzzy.addFLV('resource_gain', 0, 1)
      .addTriangle('low', 0, 0, 0.4)
      .addTriangle('moderate', 0.3, 0.5, 0.7)
      .addTriangle('high', 0.6, 1, 1);
    
    // Output: Attack desirability
    fuzzy.addFLV('attack_desirability', 0, 1);
    
    // Rules
    fuzzy.addRule('IF my_strength IS strong AND rival_weakness IS weak THEN attack_desirability IS high');
    fuzzy.addRule('IF my_strength IS strong AND resource_gain IS high THEN attack_desirability IS high');
    fuzzy.addRule('IF my_strength IS weak THEN attack_desirability IS low');
    fuzzy.addRule('IF rival_weakness IS strong THEN attack_desirability IS low');
    
    // Calculate inputs
    const myStrength = myTribe.calculateStrength();  // Based on members, tools, buildings
    const rivalWeakness = 1 - rivalTribe.calculateStrength();
    const resourceGain = this.estimateResourceGain(rivalTribe);
    
    // Evaluate
    fuzzy.setValue('my_strength', myStrength);
    fuzzy.setValue('rival_weakness', rivalWeakness);
    fuzzy.setValue('resource_gain', resourceGain);
    fuzzy.defuzzify('attack_desirability');
    
    const desirability = fuzzy.getValue('attack_desirability');
    
    console.log(`[TRIBAL_WARFARE] Tribe ${myTribe.id} evaluating attack on Tribe ${rivalTribe.id}:`, {
      myStrength,
      rivalWeakness,
      resourceGain,
      desirability
    });
    
    return desirability;
  }
  
  execute(myTribe: Tribe, rivalTribe: Tribe, planet: Planet, deltaTime: number) {
    console.log(`[TRIBAL_WARFARE] 🗡️ Tribe ${myTribe.id} ATTACKING Tribe ${rivalTribe.id}`);
    
    // Phase 1: Mobilize warriors
    const warriors = myTribe.members.filter(m => m.traits.aggression > 0.5);
    
    for (const warrior of warriors) {
      const goal = new AttackRivalTribeGoal(rivalTribe);
      warrior.brain.addSubgoal(goal);
    }
    
    // Phase 2: Battle simulation
    const outcome = this.simulateBattle(myTribe, rivalTribe, planet);
    
    if (outcome.victor === myTribe.id) {
      // WE WON: Decompose rival tribe
      this.decomposeRivalTribe(rivalTribe, myTribe, planet, outcome);
    } else {
      // WE LOST: Retreat or get decomposed ourselves
      this.retreatOrDie(myTribe, rivalTribe, planet, outcome);
    }
    
    this.status = Goal.STATUS_COMPLETED;
  }
  
  decomposeRivalTribe(rivalTribe: Tribe, victorTribe: Tribe, planet: Planet, outcome: BattleOutcome) {
    console.log(`[TRIBAL_WARFARE] 💀 Tribe ${rivalTribe.id} DECOMPOSED by Tribe ${victorTribe.id}`);
    
    // Create historical event
    planet.historicalEvents.push({
      type: 'tribal_conquest',
      cycle: planet.currentCycle,
      victor: victorTribe.id,
      defeated: rivalTribe.id,
      casualties: outcome.casualties
    });
    
    // Visual effect
    planet.addVisualEffect({
      type: 'tribal_conquest',
      position: rivalTribe.territory.center,
      duration: 50
    });
    
    // Decomposition results:
    
    // 1. Kill many members (combat casualties)
    const casualties = Math.floor(rivalTribe.members.length * 0.4);  // 40% die
    for (let i = 0; i < casualties; i++) {
      const victim = rivalTribe.members[i];
      
      // Decompose creature (standard decomposition)
      this.decompose(victim, planet);
    }
    
    // 2. Scatter survivors (become individuals or flee)
    const survivors = rivalTribe.members.slice(casualties);
    
    for (const survivor of survivors) {
      if (Math.random() < 0.3) {
        // 30% absorbed into victor tribe (subjugated)
        survivor.tribe = victorTribe;
        survivor.status = 'subjugated';
        victorTribe.members.push(survivor);
      } else {
        // 70% flee (become individuals)
        survivor.tribe = null;
        survivor.status = 'refugee';
        survivor.morale = 0.1;  // Broken
        
        // Flee to random direction
        const fleeDirection = this.randomDirection();
        const fleeGoal = new FleeGoal(fleeDirection);
        survivor.brain.clearSubgoals();
        survivor.brain.addSubgoal(fleeGoal);
      }
    }
    
    // 3. Seize territory
    victorTribe.territory.nodes.push(...rivalTribe.territory.nodes);
    
    // 4. Loot resources
    for (const [resource, amount] of Object.entries(rivalTribe.resources)) {
      victorTribe.resources[resource] += amount * 0.6;  // 60% looted, 40% destroyed
    }
    
    // 5. Destroy or claim buildings
    for (const building of rivalTribe.buildings) {
      if (Math.random() < 0.5) {
        // 50% claimed by victors
        building.owner = victorTribe;
        victorTribe.buildings.push(building);
      } else {
        // 50% burned/destroyed
        this.weatherDecomposition(building, BUILDING_DECOMPOSITION, planet);
      }
    }
    
    // 6. Remove rival tribe
    planet.removeTribal(rivalTribe);
    
    console.log(`[TRIBAL_WARFARE] Conquest complete:`, {
      casualties,
      survivors: survivors.length,
      absorbed: survivors.filter(s => s.tribe === victorTribe).length,
      refugees: survivors.filter(s => s.tribe === null).length,
      territoryGained: rivalTribe.territory.nodes.length,
      resourcesLooted: rivalTribe.resources
    });
  }
}
```

**Tribe actively decomposes rival tribe.**

**Yuka evaluates: "Should I attack?" → YES (they're weak, I'm strong).**

**Battle → Victor decomposes loser.**

**Casualties, refugees, territory seized, resources looted.**

**NO SCRIPTING. Pure Yuka evaluation.**

---

## Religious Warfare: Decomposing Competing Faiths

### Active Heresy Spreading

```typescript
class DecomposeRivalReligionGoal extends Goal {
  calculateDesirability(myReligion: Religion, rivalReligion: Religion, planet: Planet): number {
    const fuzzy = new FuzzyModule();
    
    // Input: Doctrinal conflict
    fuzzy.addFLV('doctrinal_conflict', 0, 1)
      .addTriangle('minor', 0, 0, 0.3)
      .addTriangle('moderate', 0.2, 0.5, 0.8)
      .addTriangle('extreme', 0.7, 1, 1);
    
    // Input: Rival's influence
    fuzzy.addFLV('rival_influence', 0, 1)
      .addTriangle('weak', 0, 0, 0.3)
      .addTriangle('moderate', 0.2, 0.5, 0.8)
      .addTriangle('strong', 0.7, 1, 1);
    
    // Input: My fervor
    fuzzy.addFLV('my_fervor', 0, 1)
      .addTriangle('low', 0, 0, 0.3)
      .addTriangle('moderate', 0.2, 0.5, 0.8)
      .addTriangle('high', 0.7, 1, 1);
    
    // Output: Crusade desirability
    fuzzy.addFLV('crusade_desirability', 0, 1);
    
    // Rules
    fuzzy.addRule('IF doctrinal_conflict IS extreme AND my_fervor IS high THEN crusade_desirability IS high');
    fuzzy.addRule('IF rival_influence IS strong AND my_fervor IS high THEN crusade_desirability IS high');
    fuzzy.addRule('IF my_fervor IS low THEN crusade_desirability IS low');
    
    // Calculate
    const doctrinalConflict = this.calculateDoctrinalConflict(myReligion, rivalReligion);
    const rivalInfluence = rivalReligion.followers.length / planet.tribes.length;
    const myFervor = myReligion.averageFervor();
    
    fuzzy.setValue('doctrinal_conflict', doctrinalConflict);
    fuzzy.setValue('rival_influence', rivalInfluence);
    fuzzy.setValue('my_fervor', myFervor);
    fuzzy.defuzzify('crusade_desirability');
    
    return fuzzy.getValue('crusade_desirability');
  }
  
  execute(myReligion: Religion, rivalReligion: Religion, planet: Planet, deltaTime: number) {
    console.log(`[RELIGIOUS_WARFARE] ⛪ Religion ${myReligion.id} launching CRUSADE against ${rivalReligion.id}`);
    
    // Create crusade event
    const crusade = {
      type: 'religious_crusade',
      attacker: myReligion.id,
      defender: rivalReligion.id,
      cycle: planet.currentCycle
    };
    
    planet.historicalEvents.push(crusade);
    
    // Phase 1: Missionary work (convert tribes)
    for (const tribe of rivalReligion.followers) {
      // Attempt conversion
      const conversionChance = this.calculateConversionChance(myReligion, rivalReligion, tribe);
      
      if (Math.random() < conversionChance) {
        console.log(`[RELIGIOUS_WARFARE] Tribe ${tribe.id} CONVERTED from ${rivalReligion.id} to ${myReligion.id}`);
        
        // DECOMPOSE their faith, rebuild ours
        tribe.religion = myReligion;
        myReligion.followers.push(tribe);
        rivalReligion.followers = rivalReligion.followers.filter(t => t.id !== tribe.id);
        
        // Convert temples
        for (const temple of tribe.buildings.filter(b => b.type === 'temple')) {
          temple.religion = myReligion;
          
          // Visual: Temple conversion
          planet.addVisualEffect({
            type: 'temple_conversion',
            position: temple.location,
            duration: 10
          });
        }
      }
    }
    
    // Phase 2: Suppress rival practices
    for (const ritual of rivalReligion.rituals) {
      if (Math.random() < 0.3) {
        // 30% of rituals suppressed
        ritual.status = 'forbidden';
        ritual.practitioners = 0;
        
        console.log(`[RELIGIOUS_WARFARE] Ritual ${ritual.name} SUPPRESSED`);
      }
    }
    
    // Phase 3: Rewrite myths
    for (const myth of rivalReligion.myths) {
      if (Math.random() < 0.2) {
        // 20% of myths reinterpreted
        myth.interpretation = 'heretical';
        myth.believers = 0;
        
        // Create counter-myth
        const counterMyth = {
          name: `The Truth About ${myth.name}`,
          content: `Contrary to heretical teachings, ${myth.name} actually proves ${myReligion.name} is correct...`,
          religion: myReligion.id
        };
        
        myReligion.myths.push(counterMyth);
        
        console.log(`[RELIGIOUS_WARFARE] Myth ${myth.name} REINTERPRETED as heretical`);
      }
    }
    
    // Check if rival religion is decomposed
    if (rivalReligion.followers.length === 0) {
      console.log(`[RELIGIOUS_WARFARE] 💀 Religion ${rivalReligion.id} DECOMPOSED (no followers left)`);
      
      // Complete decomposition
      this.heresyDecomposition(rivalReligion, RELIGION_DECOMPOSITION, planet);
    } else {
      console.log(`[RELIGIOUS_WARFARE] Religion ${rivalReligion.id} weakened but survives`);
    }
    
    this.status = Goal.STATUS_COMPLETED;
  }
}
```

**Religion actively decomposes rival religion.**

**Convert followers, suppress rituals, rewrite myths.**

**If followers reach 0 → Religion extinct.**

**NO SCRIPTING. Yuka evaluates doctrinal conflict.**

---

## Political Warfare: Decomposing Rival Governments

### Subversion & Conquest

```typescript
class DecomposeRivalGovernmentGoal extends Goal {
  calculateDesirability(myGov: Government, rivalGov: Government, planet: Planet): number {
    const fuzzy = new FuzzyModule();
    
    // Input: Rival's stability
    fuzzy.addFLV('rival_stability', 0, 1);
    // Input: My power
    fuzzy.addFLV('my_power', 0, 1);
    // Input: Expansion desire
    fuzzy.addFLV('expansion_desire', 0, 1);
    // Output: Conquest desirability
    fuzzy.addFLV('conquest_desirability', 0, 1);
    
    // Rules
    fuzzy.addRule('IF rival_stability IS low AND my_power IS high THEN conquest_desirability IS high');
    fuzzy.addRule('IF expansion_desire IS high AND my_power IS high THEN conquest_desirability IS high');
    
    // Evaluate
    const rivalStability = rivalGov.calculateStability();
    const myPower = myGov.calculatePower();
    const expansionDesire = myGov.expansionPolicy;
    
    fuzzy.setValue('rival_stability', rivalStability);
    fuzzy.setValue('my_power', myPower);
    fuzzy.setValue('expansion_desire', expansionDesire);
    fuzzy.defuzzify('conquest_desirability');
    
    return fuzzy.getValue('conquest_desirability');
  }
  
  execute(myGov: Government, rivalGov: Government, planet: Planet, deltaTime: number) {
    console.log(`[POLITICAL_WARFARE] 🏛️ Government ${myGov.id} ATTACKING Government ${rivalGov.id}`);
    
    // Strategy 1: Subversion (turn tribes against their government)
    for (const tribe of rivalGov.tribes) {
      const subversionChance = this.calculateSubversionChance(myGov, rivalGov, tribe);
      
      if (Math.random() < subversionChance) {
        console.log(`[POLITICAL_WARFARE] Tribe ${tribe.id} SUBVERTED, now loyal to ${myGov.id}`);
        
        // Tribe switches allegiance
        tribe.government = myGov;
        myGov.tribes.push(tribe);
        rivalGov.tribes = rivalGov.tribes.filter(t => t.id !== tribe.id);
      }
    }
    
    // Strategy 2: Military conquest (if subversion insufficient)
    if (rivalGov.tribes.length > 0) {
      // Full-scale war
      const war = this.simulateWar(myGov, rivalGov, planet);
      
      if (war.victor === myGov.id) {
        // Annex remaining tribes
        for (const tribe of rivalGov.tribes) {
          tribe.government = myGov;
          myGov.tribes.push(tribe);
        }
        
        rivalGov.tribes = [];
      }
    }
    
    // Check if rival government decomposed
    if (rivalGov.tribes.length === 0) {
      console.log(`[POLITICAL_WARFARE] 💀 Government ${rivalGov.id} DECOMPOSED (no constituent tribes)`);
      
      // Decompose government
      this.revolutionDecomposition(rivalGov, GOVERNMENT_DECOMPOSITION, planet);
    }
    
    this.status = Goal.STATUS_COMPLETED;
  }
}
```

**Government actively decomposes rival government.**

**Subvert tribes, wage war, annex territories.**

**If tribes reach 0 → Government extinct.**

---

## Cultural Warfare: Decomposing Rival Mythologies

### Memory Erasure

```typescript
class DecomposeRivalMythologyGoal extends Goal {
  calculateDesirability(myMythology: Mythology, rivalMythology: Mythology, planet: Planet): number {
    const fuzzy = new FuzzyModule();
    
    // Input: Cultural competition
    fuzzy.addFLV('cultural_competition', 0, 1);
    // Input: Rival's influence
    fuzzy.addFLV('rival_influence', 0, 1);
    // Output: Suppression desirability
    fuzzy.addFLV('suppression_desirability', 0, 1);
    
    fuzzy.addRule('IF cultural_competition IS high AND rival_influence IS strong THEN suppression_desirability IS high');
    
    const culturalCompetition = this.calculateCulturalConflict(myMythology, rivalMythology);
    const rivalInfluence = rivalMythology.believers / planet.totalPopulation;
    
    fuzzy.setValue('cultural_competition', culturalCompetition);
    fuzzy.setValue('rival_influence', rivalInfluence);
    fuzzy.defuzzify('suppression_desirability');
    
    return fuzzy.getValue('suppression_desirability');
  }
  
  execute(myMythology: Mythology, rivalMythology: Mythology, planet: Planet, deltaTime: number) {
    console.log(`[CULTURAL_WARFARE] 📚 Mythology ${myMythology.id} SUPPRESSING Mythology ${rivalMythology.id}`);
    
    // Strategy 1: Rewrite rival stories
    for (const story of rivalMythology.stories) {
      if (Math.random() < 0.3) {
        // Create counter-narrative
        const counterStory = {
          name: `The Real ${story.name}`,
          content: `The so-called "${story.name}" is actually a corrupted version of our sacred tale...`,
          mythology: myMythology.id,
          purpose: 'suppress_rival'
        };
        
        myMythology.stories.push(counterStory);
        
        // Reduce rival story's believers
        story.believers = Math.floor(story.believers * 0.5);
      }
    }
    
    // Strategy 2: Vilify rival heroes
    for (const character of rivalMythology.characters) {
      if (Math.random() < 0.4) {
        // Recast as villain in our mythology
        const villainStory = {
          name: `The Evil of ${character.name}`,
          content: `${character.name}, whom heretics praise, was actually a demon who...`,
          mythology: myMythology.id
        };
        
        myMythology.stories.push(villainStory);
      }
    }
    
    // Strategy 3: Destroy artifacts
    for (const artifact of rivalMythology.artifacts) {
      if (Math.random() < 0.1) {
        // 10% physically destroyed
        console.log(`[CULTURAL_WARFARE] Artifact ${artifact.name} DESTROYED`);
        
        planet.removeArtifact(artifact);
        
        // Visual: Artifact destruction
        planet.addVisualEffect({
          type: 'artifact_destruction',
          position: artifact.location,
          duration: 5
        });
      }
    }
    
    // Check if rival mythology decomposed (no believers left)
    const totalBelievers = rivalMythology.stories.reduce((sum, s) => sum + s.believers, 0);
    
    if (totalBelievers === 0) {
      console.log(`[CULTURAL_WARFARE] 💀 Mythology ${rivalMythology.id} DECOMPOSED (forgotten)`);
      
      this.forgottenDecomposition(rivalMythology, MYTHOLOGY_DECOMPOSITION, planet);
    }
    
    this.status = Goal.STATUS_COMPLETED;
  }
}
```

**Mythology actively suppresses rival mythology.**

**Rewrite stories, vilify heroes, destroy artifacts.**

**If believers reach 0 → Mythology extinct.**

---

## The Escalating Competition

### Early Game (Gen 1-3): Physical

```
Creatures compete for food
↓
Predators hunt prey
↓
Tools enable better hunting
↓
Buildings provide shelter
```

**Competition is LOCAL and IMMEDIATE.**

### Mid Game (Gen 4): Tribal

```
Tribes compete for territory
↓
Tribe A attacks Tribe B
↓
Tribe B decomposed → survivors scattered
↓
Tribe A expands
```

**Competition is REGIONAL and ORGANIZED.**

### Late Game (Gen 5-6): Abstract

```
Governments compete for power
↓
Government A subverts Government B's tribes
↓
Government B collapses → anarchy
↓
Government A annexes region

SIMULTANEOUSLY:

Religions compete for believers
↓
Religion X launches crusade against Religion Y
↓
Religion Y loses followers → extinct
↓
Religion X becomes dominant

SIMULTANEOUSLY:

Mythologies compete for cultural memory
↓
Mythology M suppresses Mythology N
↓
Mythology N forgotten
↓
Mythology M shapes worldview
```

**Competition is GLOBAL and IDEOLOGICAL.**

---

## Why No Permanence Is Essential

### With Permanence

```
Cycle 10000:
- 50 tribes (all permanent)
- 10 governments (all permanent)
- 5 religions (all permanent)

No conflict. No dynamics. STAGNANT.
```

### With Aggressive Decomposition

```
Cycle 10000:
- 15 tribes (30 have been decomposed, 10 newly formed)
- 3 governments (5 collapsed, 2 formed)
- 2 religions (3 extinct, 1 new heresy)

Constant turnover. Rich history. DYNAMIC.
```

**The CHURN creates the story.**

**The WARFARE creates the drama.**

**The DECOMPOSITION creates the cycle.**

---

## Summary

### Decomposition Is Not Just Failsafe

**It's ACTIVE GAMEPLAY at late stages.**

### Aggressive Systems

- Tribes attack tribes → Conquest
- Religions attack religions → Crusades
- Governments attack governments → Wars
- Mythologies attack mythologies → Cultural suppression

### Yuka Drives It All

```typescript
// Every cycle, evaluate:
const shouldAttackRivalTribe = evaluateTribalWarfare(myTribe, rivalTribe, planet);
const shouldLaunchCrusade = evaluateReligiousWarfare(myReligion, rivalReligion, planet);
const shouldConquerGovernment = evaluatePoliticalWarfare(myGov, rivalGov, planet);
const shouldSuppressMythology = evaluateCulturalWarfare(myMythology, rivalMythology, planet);

// If desirability > threshold:
// → Create decomposition goal
// → Execute attack
// → Decompose rival system
```

### No Permanence

**Everything can be decomposed.**

**Even by other AI systems.**

**Constant competition.**

**Constant churn.**

**Rich, dynamic, emergent gameplay.**

**That's late-stage mechanics.**

**That's why you DON'T want permanence.**
