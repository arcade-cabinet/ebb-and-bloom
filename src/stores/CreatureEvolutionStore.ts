/**
 * Creature Evolution Store
 * 
 * Pure state machine for creature evolution.
 * NO GRAPHICS. Just trait tracking, tool use, and taxonomical assignment.
 * 
 * Creatures are just data:
 * - Traits (10 values, 0-1)
 * - Tool usage capability
 * - Species classification
 * - Generation number
 * 
 * Evolution happens when:
 * - Environmental pressure increases
 * - New materials discovered
 * - Tools emerge
 * - Social structures form
 */

import { create } from 'zustand';
import seedrandom from 'seedrandom';

/**
 * Creature traits (0-1 normalized)
 */
interface CreatureTraits {
  mobility: number;        // 0: Movement capability
  manipulation: number;    // 1: Tool use dexterity
  excavation: number;      // 2: Digging ability
  social: number;          // 3: Pack formation tendency
  intelligence: number;    // 4: Problem solving
  aggression: number;      // 5: Combat propensity
  size: number;           // 6: Physical size
  metabolism: number;      // 7: Energy efficiency
  perception: number;      // 8: Sensory awareness
  adaptability: number;    // 9: Mutation rate
}

/**
 * Taxonomical classification (emergent from traits)
 */
interface TaxonomicalClass {
  kingdom: 'animalia';
  phylum: string;      // Derived from morphology
  class: string;       // Derived from traits
  order: string;       // Derived from behavior
  family: string;      // Derived from social structure
  genus: string;       // Specific to planet
  species: string;     // Unique identifier
}

/**
 * Creature entity (pure data)
 */
interface Creature {
  id: string;
  generation: number;
  traits: CreatureTraits;
  taxonomy: TaxonomicalClass;
  
  // Tool usage
  canUseTool: boolean;
  toolHardness: number;     // Max hardness they can use
  toolTypes: string[];      // ['digger', 'cutter', etc.]
  
  // Resource access
  accessibleMaterials: string[];
  discoveredMaterials: string[];
  
  // Evolution tracking
  parentId: string | null;
  mutations: number;
  evolutionEvents: string[];
}

/**
 * Tool archetype (emerges from need)
 */
interface Tool {
  type: 'digger' | 'cutter' | 'crusher' | 'extractor';
  hardness: number;
  requiredTraits: Partial<CreatureTraits>; // Min traits needed to use
  unlocksDepth: number;    // How deep it allows digging
  emergedGeneration: number;
}

/**
 * Creature evolution state
 */
interface CreatureEvolutionState {
  // Creatures
  creatures: Map<string, Creature>;
  currentGeneration: number;
  
  // Tools
  availableTools: Tool[];
  toolEvolutionThreshold: number;
  
  // Environmental pressure (drives evolution)
  materialAccessibilityPressure: number;  // 0-1 (how hard to reach needed materials)
  populationPressure: number;             // 0-1 (resource scarcity)
  predationPressure: number;              // 0-1 (threat level)
  
  // Actions
  initializeCreatures: (seedPhrase: string, count: number) => void;
  evolveCreature: (creatureId: string) => void;
  evaluateToolNeed: () => void;
  checkToolUsage: (creatureId: string, toolType: string) => boolean;
  advanceGeneration: () => void;
  getCreaturesByTrait: (trait: keyof CreatureTraits, minValue: number) => Creature[];
}

/**
 * Creature Evolution Store
 */
export const useCreatureEvolution = create<CreatureEvolutionState>((set, get) => ({
  creatures: new Map(),
  currentGeneration: 0,
  availableTools: [],
  toolEvolutionThreshold: 0.6,
  materialAccessibilityPressure: 0,
  populationPressure: 0,
  predationPressure: 0,
  
  /**
   * Initialize base creatures
   */
  initializeCreatures: (seedPhrase: string, count: number) => {
    const rng = seedrandom(seedPhrase);
    const creatures = new Map<string, Creature>();
    
    for (let i = 0; i < count; i++) {
      const traits: CreatureTraits = {
        mobility: rng(),
        manipulation: rng(),
        excavation: rng(),
        social: rng(),
        intelligence: rng(),
        aggression: rng(),
        size: rng(),
        metabolism: rng(),
        perception: rng(),
        adaptability: rng(),
      };
      
      const creature: Creature = {
        id: `creature-${i}`,
        generation: 0,
        traits,
        taxonomy: classifyCreature(traits, seedPhrase),
        canUseTool: traits.manipulation > 0.5 && traits.intelligence > 0.4,
        toolHardness: 0,
        toolTypes: [],
        accessibleMaterials: [],
        discoveredMaterials: [],
        parentId: null,
        mutations: 0,
        evolutionEvents: ['genesis'],
      };
      
      creatures.set(creature.id, creature);
    }
    
    set({ creatures, currentGeneration: 0 });
    console.log(`🧬 Initialized ${count} creatures (Generation 0)`);
  },
  
  /**
   * Evolve creature based on pressure
   */
  evolveCreature: (creatureId: string) => {
    const state = get();
    const creature = state.creatures.get(creatureId);
    if (!creature) return;
    
    const rng = seedrandom(`${creatureId}-${state.currentGeneration}`);
    
    // Calculate which traits to evolve based on pressure
    const newTraits = { ...creature.traits };
    
    // Excavation evolves if material accessibility pressure high
    if (state.materialAccessibilityPressure > 0.5) {
      newTraits.excavation += (rng() - 0.3) * 0.1 * creature.traits.adaptability;
    }
    
    // Manipulation evolves if tools would help
    if (state.materialAccessibilityPressure > 0.6 && creature.traits.intelligence > 0.5) {
      newTraits.manipulation += (rng() - 0.3) * 0.1 * creature.traits.adaptability;
    }
    
    // Social evolves if population pressure high
    if (state.populationPressure > 0.5) {
      newTraits.social += (rng() - 0.3) * 0.1 * creature.traits.adaptability;
    }
    
    // Aggression evolves if predation pressure high
    if (state.predationPressure > 0.5) {
      newTraits.aggression += (rng() - 0.3) * 0.1 * creature.traits.adaptability;
    }
    
    // Clamp traits to 0-1
    Object.keys(newTraits).forEach(key => {
      newTraits[key as keyof CreatureTraits] = Math.max(0, Math.min(1, newTraits[key as keyof CreatureTraits]));
    });
    
    // Create evolved creature
    const evolved: Creature = {
      ...creature,
      id: `${creatureId}-gen${state.currentGeneration}`,
      generation: state.currentGeneration,
      traits: newTraits,
      taxonomy: classifyCreature(newTraits, creature.taxonomy.genus),
      canUseTool: newTraits.manipulation > 0.5 && newTraits.intelligence > 0.4,
      parentId: creatureId,
      mutations: creature.mutations + 1,
      evolutionEvents: [
        ...creature.evolutionEvents,
        `Gen ${state.currentGeneration}: Evolved (${getSignificantChanges(creature.traits, newTraits)})`
      ],
    };
    
    const newCreatures = new Map(state.creatures);
    newCreatures.set(evolved.id, evolved);
    
    set({ creatures: newCreatures });
    
    console.log(`🧬 ${creature.id} evolved → ${evolved.id}`);
    console.log(`   Traits changed: ${getSignificantChanges(creature.traits, newTraits)}`);
  },
  
  /**
   * Evaluate if tools should emerge
   */
  evaluateToolNeed: () => {
    const state = get();
    
    // Check if creatures need tools
    const toolCapableCreatures = Array.from(state.creatures.values()).filter(c => c.canUseTool);
    
    if (toolCapableCreatures.length === 0) {
      console.log('⚠️  No creatures capable of tool use yet');
      return;
    }
    
    // Calculate need for each tool type
    const needDigger = state.materialAccessibilityPressure > state.toolEvolutionThreshold;
    
    if (needDigger && !state.availableTools.some(t => t.type === 'digger')) {
      const newTool: Tool = {
        type: 'digger',
        hardness: 2,
        requiredTraits: { manipulation: 0.5, intelligence: 0.4 },
        unlocksDepth: 15,
        emergedGeneration: state.currentGeneration,
      };
      
      set({ availableTools: [...state.availableTools, newTool] });
      
      console.log(`🔧 TOOL EMERGED: Digger (hardness: 2, depth: 15m)`);
      console.log(`   Generation: ${state.currentGeneration}`);
      console.log(`   Accessible to ${toolCapableCreatures.length} creatures`);
      
      // Update creatures that can use it
      const newCreatures = new Map(state.creatures);
      toolCapableCreatures.forEach(creature => {
        const updated = {
          ...creature,
          toolHardness: Math.max(creature.toolHardness, newTool.hardness),
          toolTypes: [...creature.toolTypes, newTool.type],
          evolutionEvents: [
            ...creature.evolutionEvents,
            `Gen ${state.currentGeneration}: Gained tool use (${newTool.type})`
          ],
        };
        newCreatures.set(creature.id, updated);
      });
      
      set({ creatures: newCreatures });
    }
  },
  
  /**
   * Check if creature can use tool
   */
  checkToolUsage: (creatureId: string, toolType: string) => {
    const state = get();
    const creature = state.creatures.get(creatureId);
    const tool = state.availableTools.find(t => t.type === toolType);
    
    if (!creature || !tool) return false;
    
    // Check required traits
    for (const [trait, minValue] of Object.entries(tool.requiredTraits)) {
      if (creature.traits[trait as keyof CreatureTraits] < (minValue as number)) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Advance generation
   */
  advanceGeneration: () => {
    const state = get();
    const newGen = state.currentGeneration + 1;
    
    console.log(`\n⏭️  GENERATION ${newGen} BEGINS`);
    
    // Evolve all creatures
    const creatureIds = Array.from(state.creatures.keys());
    creatureIds.forEach(id => {
      state.evolveCreature(id);
    });
    
    // Check for tool emergence
    state.evaluateToolNeed();
    
    set({ currentGeneration: newGen });
  },
  
  /**
   * Get creatures by trait threshold
   */
  getCreaturesByTrait: (trait: keyof CreatureTraits, minValue: number) => {
    const state = get();
    return Array.from(state.creatures.values()).filter(c => 
      c.traits[trait] >= minValue
    );
  },
}));

/**
 * Classify creature based on traits (taxonomical assignment)
 */
function classifyCreature(traits: CreatureTraits, seed: string): TaxonomicalClass {
  // Phylum based on basic body plan
  const phylum = traits.mobility > 0.7 ? 'Chordata' : 'Arthropoda';
  
  // Class based on primary traits
  let cls = 'Unknown';
  if (traits.social > 0.7) cls = 'Mammalia';
  else if (traits.mobility > 0.8) cls = 'Aves';
  else if (traits.excavation > 0.7) cls = 'Insecta';
  else cls = 'Reptilia';
  
  // Order based on behavior
  let order = 'Unknown';
  if (traits.manipulation > 0.6) order = 'Primates';
  else if (traits.aggression > 0.7) order = 'Carnivora';
  else if (traits.social > 0.6) order = 'Artiodactyla';
  else order = 'Rodentia';
  
  // Family based on social structure
  let family = 'Unknown';
  if (traits.social > 0.7 && traits.intelligence > 0.6) family = 'Hominidae';
  else if (traits.social > 0.5) family = 'Canidae';
  else family = 'Felidae';
  
  // Genus unique to planet
  const genus = `${seed.slice(0, 4)}genus`;
  
  // Species based on trait signature
  const traitSignature = Object.values(traits)
    .map(v => Math.floor(v * 10))
    .join('');
  const species = `species${traitSignature.slice(0, 6)}`;
  
  return {
    kingdom: 'animalia',
    phylum,
    class: cls,
    order,
    family,
    genus,
    species,
  };
}

/**
 * Get significant trait changes
 */
function getSignificantChanges(oldTraits: CreatureTraits, newTraits: CreatureTraits): string {
  const changes: string[] = [];
  
  Object.keys(oldTraits).forEach(key => {
    const trait = key as keyof CreatureTraits;
    const diff = newTraits[trait] - oldTraits[trait];
    if (Math.abs(diff) > 0.05) {
      changes.push(`${trait}${diff > 0 ? '+' : ''}${(diff * 100).toFixed(0)}%`);
    }
  });
  
  return changes.length > 0 ? changes.join(', ') : 'minor';
}

/**
 * Hook to get creature stats (for UI/CLI)
 */
export function useCreatureStats() {
  return useCreatureEvolution(state => ({
    totalCreatures: state.creatures.size,
    generation: state.currentGeneration,
    toolUsers: Array.from(state.creatures.values()).filter(c => c.canUseTool).length,
    availableTools: state.availableTools.length,
  }));
}
