# Codebase Differentiators - Ebb & Bloom

**Version**: 1.0.0  
**Date**: 2025-01-XX  
**Purpose**: Identify codebase areas where we can stand out and make the game FUN, BALANCED, and REPLAYABLE

---

## FUN: Areas to Enhance Player Enjoyment

### 1. Snapping System (`src/ecs/systems/SnappingSystem.ts`)
**Current**: Basic affinity checking, 5 recipes  
**Enhancement Opportunities**:
- ✅ **Visual Feedback**: Particle bursts on snap (blue wisps for flow, red sparks for heat)
- ✅ **Haptic Sync**: Different haptic patterns per affinity type
- ✅ **Sound Design**: Unique audio cues per snap type (heat = crackle, flow = ripple)
- ✅ **Chain Visualization**: Show potential chains with glow lines
- ✅ **Surprise Factor**: 10% exotic variants (wild affinity mutations)
- ✅ **Demand Response**: World auto-suggests snaps based on player needs

**Code Areas**:
- `src/ecs/systems/SnappingSystem.ts` - Add visual/audio hooks
- `src/systems/HapticSystem.ts` - Add snap-specific patterns
- `src/game/GameScene.ts` - Add particle effects for snaps

### 2. Trait Inheritance (`src/ecs/systems/PackSystem.ts`)
**Current**: Basic proximity inheritance, 50% dilution  
**Enhancement Opportunities**:
- ✅ **Visual Evolution**: Show critters morphing traits over time
- ✅ **Hybrid Emergence**: Opposing traits create new forms (flow + void = tidal scar)
- ✅ **Behavioral Mirroring**: Critters mimic player playstyle (harmony → cooperative, conquest → aggressive)
- ✅ **Surprise Moments**: Unexpected trait combinations spawn rare creatures
- ✅ **Narrative Feedback**: Haikus describe trait inheritance events

**Code Areas**:
- `src/ecs/systems/PackSystem.ts` - Enhance inheritance logic
- `src/systems/HaikuScorer.ts` - Add trait inheritance haikus
- `src/game/GameScene.ts` - Add visual morphing effects

### 3. Behavior Profiling (`src/ecs/systems/BehaviorSystem.ts`)
**Current**: Rolling 100-action window, 3 axes  
**Enhancement Opportunities**:
- ✅ **Visual Feedback**: Subtle UI hints (world mood vignette)
- ✅ **Adaptive Music**: Playstyle-aware soundscapes
- ✅ **Surprise Events**: Delight events for frolick, challenges for conquest
- ✅ **Redemption Nudges**: System eases back if player accidentally tips playstyle
- ✅ **Hybrid Magic**: Blended playstyles create unique outcomes

**Code Areas**:
- `src/ecs/systems/BehaviorSystem.ts` - Add visual/audio hooks
- `src/systems/HapticSystem.ts` - Playstyle-aware patterns
- `src/views/Home.vue` - Add world mood UI

### 4. Haiku Journal (`src/systems/HaikuScorer.ts`)
**Current**: Jaro-Winkler guard, procedural generation  
**Enhancement Opportunities**:
- ✅ **Visual Polish**: Beautiful journal UI with animations
- ✅ **Sharing**: Export haikus as images, share with friends
- ✅ **Discovery**: Haikus capture unique moments
- ✅ **Persistence**: Journal captures player's story over time
- ✅ **Narrative Arc**: Haikus tell player's story over time

**Code Areas**:
- `src/systems/HaikuScorer.ts` - Enhance generation quality
- `src/views/Log.vue` - Polish journal UI
- `src/stores/gameStore.ts` - Add journal persistence

---

## BALANCED: Areas to Ensure Fair Play

### 1. Recipe Balance (`src/ecs/systems/SnappingSystem.ts`)
**Current**: 5 recipes, basic affinity checking  
**Enhancement Opportunities**:
- ✅ **Difficulty Scaling**: Early recipes easy, late recipes require multiple steps
- ✅ **Playstyle Balance**: Harmony gets sustainable loops, conquest gets high yields
- ✅ **Risk/Reward**: High-yield recipes increase pollution
- ✅ **Demand Response**: World adapts to player needs (not too easy, not too hard)
- ✅ **Frolick Support**: Whimsical recipes for cosmetic rewards

**Code Areas**:
- `src/ecs/systems/SnappingSystem.ts` - Add difficulty scaling
- `src/ecs/systems/PollutionSystem.ts` - Link pollution to recipe difficulty
- `src/ecs/systems/BehaviorSystem.ts` - Adapt recipes to playstyle

### 2. Trait Balance (`src/ecs/components/traits.ts`)
**Current**: 10 traits, basic synergies  
**Enhancement Opportunities**:
- ✅ **Cost Balance**: Trait costs reflect power level
- ✅ **Synergy Balance**: Synergies powerful but not overpowered
- ✅ **Playstyle Support**: Each playstyle has viable trait builds
- ✅ **Dilution Balance**: Inheritance weakens appropriately (50% per generation)
- ✅ **Counterplay**: Traits have weaknesses (chainsaw scares critters)

**Code Areas**:
- `src/ecs/components/traits.ts` - Review trait costs/power
- `src/ecs/systems/PackSystem.ts` - Balance dilution mechanics
- `src/test/` - Add balance tests

### 3. Pollution Balance (`src/ecs/systems/PollutionSystem.ts`)
**Current**: 3 shock thresholds (40%, 70%, 90%)  
**Enhancement Opportunities**:
- ✅ **Consequence Balance**: Shocks transform world, don't punish
- ✅ **Playstyle Balance**: Harmony reduces pollution faster, conquest accelerates it
- ✅ **Mitigation Options**: Purity Groves, symbiotic actions reduce pollution
- ✅ **Shock Variety**: Different shock types for different playstyles
- ✅ **Recovery**: World recovers post-shock (not permanent damage)

**Code Areas**:
- `src/ecs/systems/PollutionSystem.ts` - Balance shock mechanics
- `src/ecs/systems/BehaviorSystem.ts` - Link pollution to playstyle
- `src/test/pollution-behavior.test.ts` - Add balance tests

### 4. Pack Loyalty (`src/ecs/systems/PackSystem.ts`)
**Current**: 0-1 scale, schism at <0.3  
**Enhancement Opportunities**:
- ✅ **Loyalty Balance**: Easy to gain, hard to maintain
- ✅ **Playstyle Balance**: Harmony gains loyalty faster, conquest requires different approach
- ✅ **Consequence Balance**: Low loyalty splits pack (not punishment, just consequence)
- ✅ **Recovery**: Packs can reform after split (redemption arcs)
- ✅ **Variety**: Different pack types for different playstyles

**Code Areas**:
- `src/ecs/systems/PackSystem.ts` - Balance loyalty mechanics
- `src/ecs/systems/BehaviorSystem.ts` - Link loyalty to playstyle
- `src/test/pack.test.ts` - Add balance tests

---

## REPLAYABLE: Areas to Ensure Long-Term Engagement

### 1. Procedural Generation (`src/game/core/perlin.ts`)
**Current**: Perlin noise, deterministic seeds  
**Enhancement Opportunities**:
- ✅ **Seed Variety**: Different seeds create vastly different worlds
- ✅ **Evo History**: World generation adapts to player actions (scars persist)
- ✅ **Infinite Variety**: No two playthroughs identical
- ✅ **Discovery**: Hidden biomes, rare resources, secret areas
- ✅ **Shareability**: Seed sharing creates community

**Code Areas**:
- `src/game/core/perlin.ts` - Enhance generation variety
- `src/game/core/core.ts` - Add scar persistence
- `src/stores/gameStore.ts` - Add seed sharing

### 2. Behavior Adaptation (`src/ecs/systems/BehaviorSystem.ts`)
**Current**: Rolling window, 3 axes  
**Enhancement Opportunities**:
- ✅ **Adaptive World**: World reacts differently each playthrough based on playstyle
- ✅ **Redemption Arcs**: System adapts if player changes playstyle
- ✅ **Hybrid Outcomes**: Blended playstyles create unique experiences
- ✅ **Surprise Factor**: Unexpected world reactions keep players engaged
- ✅ **Narrative Variety**: Different playstyles tell different stories

**Code Areas**:
- `src/ecs/systems/BehaviorSystem.ts` - Enhance adaptation logic
- `src/ecs/systems/PollutionSystem.ts` - Link to behavior adaptation
- `src/test/pollution-behavior.test.ts` - Test adaptation variety

### 3. Content Variety (`src/ecs/systems/`, `src/game/core/`)
**Current**: 5 recipes, 10 traits, 4 biomes  
**Enhancement Opportunities**:
- ✅ **Recipe Expansion**: 10+ recipes with difficulty scaling
- ✅ **Trait Expansion**: 15+ traits with new synergies
- ✅ **Biome Expansion**: 5+ biomes with unique resources
- ✅ **Creature Variety**: More species and pack types
- ✅ **Discovery**: Hidden areas, rare resources, secret combinations

**Code Areas**:
- `src/ecs/systems/SnappingSystem.ts` - Add more recipes
- `src/ecs/components/traits.ts` - Add more traits
- `src/game/core/perlin.ts` - Add more biomes

---

## Implementation Priority

### High Priority (Stage 2)
1. **Visual Feedback**: Particle effects, haptic sync, UI polish
2. **Balance Tuning**: Recipe/trait/pollution balance
3. **Onboarding**: Tutorials, catalyst creator, first-time experience

### Medium Priority (Stage 3-4)
4. **Content Expansion**: More recipes, traits, biomes
5. **Behavior Adaptation**: Enhanced world reactions
6. **Villages & Quests**: Emergent content systems

### Low Priority (Stage 5+)
7. **Audio System**: Procedural soundscapes
8. **Visual Effects**: Shaders, particles, polish
9. **Community Features**: Seed sharing, haiku export

---

## Testing Strategy

### Fun Testing
- **Playtest Sessions**: Real player feedback on enjoyment
- **Surprise Factor**: Measure unexpected moments
- **Engagement**: Track session length, return rate

### Balance Testing
- **Playstyle Viability**: All playstyles should be viable
- **Difficulty Curve**: Early easy, late challenging
- **Risk/Reward**: High rewards come with high risks

### Replayability Testing
- **Seed Variety**: Test different seeds create different experiences
- **Behavior Adaptation**: Test world reacts differently each playthrough
- **Long-Term Engagement**: Track players returning after breaks

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Status**: Living Document - Update as implementation progresses

