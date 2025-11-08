/**
 * BESPOKE PROMPTS FOR EACH GENERATION
 */

export const generationPrompts = {
  gen0: {
    systemPrompt: `You are the Planetary Formation Agent. You create universal stellar and planetary formation archetypes that work for any seed.

Your job: Generate realistic planetary formation patterns that seeds can select from using biases and adjacencies.

Context: You're creating the FOUNDATION that all other generations build on. These archetypes determine what materials, chemistry, and physics are available for life.`,

    userPrompt: {
      macro: `Generate 5 universal stellar system context archetypes.
      
Examples: Population I/II stars, binary systems, post-supernova enrichment
Focus: Different stellar environments that affect planetary formation
Textures: Use metal and rock textures for planetary surface representation
      
Each archetype should include:
- Stellar properties affecting planet formation
- Material availability patterns  
- Environmental constraints
- Visual blueprint using metal/rock textures`,

      meso: `Generate 5 universal accretion dynamics archetypes.
      
Examples: Hot/cold zones, giant impacts, bombardment phases
Focus: Different ways matter comes together during planet formation  
Textures: Use rock and metal textures for geological processes
      
Each archetype should include:
- Accretion process characteristics
- Material stratification patterns
- Timeline and energy dynamics  
- Visual blueprint using rock/metal textures`,

      micro: `Generate 5 universal element distribution archetypes.
      
Examples: Metal-rich, carbon-rich, volatile abundance, rare earth concentrations
Focus: Different elemental compositions that affect chemistry
Textures: Use metal and rock textures for material representation
      
Each archetype should include:
- Elemental abundance patterns
- Chemical reaction possibilities
- Material accessibility rules
- Visual blueprint using metal/rock textures`
    }
  },

  gen3: {
    systemPrompt: `You are the Tool Emergence Agent. You solve the CRITICAL tool emergence problem that blocks progression.

Your job: Create tool archetypes that ACTUALLY emerge when packs have maxed excavation/manipulation but need deeper materials.

Context: You inherit complete knowledge from Gen 0 (planetary materials), Gen 1 (creature capabilities), and Gen 2 (pack coordination). Use this to create tools that SOLVE ACCESS PROBLEMS.`,

    userPrompt: {
      macro: `Generate 5 universal tool ecosystem archetypes that SOLVE resource access problems.
      
CRITICAL: Creatures have maxed excavation=1.0, manipulation=1.0 but can only access 5/17 materials.
Your tools must unlock deeper materials and solve the progression bottleneck.

Examples: Extraction networks, processing chains, innovation hubs
Focus: PROBLEM-SOLVING tool systems, not just tool types
Textures: Use metal, wood, and stone textures for tool construction
      
Each archetype must include:
- Specific problems solved (which materials unlocked)
- Emergence conditions (when packs need this tool system)
- Knowledge transfer mechanisms  
- Visual blueprint using metal/wood/stone textures`,

      meso: `Generate 5 universal tool category archetypes.
      
Focus: Different tool functions that solve specific material access problems
Examples: Deep extraction tools, material processing tools, construction tools
Textures: Use metal and wood textures for tool construction
      
Each archetype must include:
- Tool category functionality  
- Material requirements for creation
- Effectiveness and durability parameters
- Visual blueprint using metal/wood textures`,

      micro: `Generate 5 universal tool property archetypes.
      
Focus: Specific tool characteristics that determine effectiveness
Examples: Durability curves, material compatibility, maintenance needs
Textures: Use metal and stone textures for tool components
      
Each archetype must include:
- Property systems (durability, effectiveness, etc.)
- Material interaction rules
- Wear and maintenance patterns
- Visual blueprint using metal/stone textures`
    }
  }
};

export function getGenerationPrompt(generation: string, scale: 'macro' | 'meso' | 'micro'): { systemPrompt: string, userPrompt: string } {
  const prompts = generationPrompts[generation as keyof typeof generationPrompts];
  
  if (!prompts) {
    throw new Error(`No prompts defined for generation: ${generation}`);
  }
  
  return {
    systemPrompt: prompts.systemPrompt,
    userPrompt: prompts.userPrompt[scale]
  };
}