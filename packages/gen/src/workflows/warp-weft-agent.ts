/**
 * WARP/WEFT AGENT SYSTEM - PROPERLY USING VERCEL AI
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { promises as fs } from 'fs';
import { textureQueryTool } from '../tools/structured-texture-tool.js';
import { GenerationScaleSchema } from '../schemas/visual-blueprint-schema.js';
import { getGenerationPrompt } from '../prompts/generation-prompts.js';

export class WarpWeftAgent {
  private generation: string;
  private inheritedKnowledge: any[] = [];
  
  constructor(generation: string, inheritedKnowledge: any[] = []) {
    this.generation = generation;
    this.inheritedKnowledge = inheritedKnowledge;
  }
  
  async generateScale(scale: 'macro' | 'meso' | 'micro'): Promise<any> {
    console.log(`   🎯 Generating ${this.generation}/${scale} with AI...`);
    
    const prompts = getGenerationPrompt(this.generation, scale);
    const contextPrompt = this.buildContextPrompt();
    
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: GenerationScaleSchema,
      tools: {
        queryTextures: textureQueryTool,
      },
      system: prompts.systemPrompt,
      prompt: `${contextPrompt}

${prompts.userPrompt}

CRITICAL OUTPUT FORMAT:
You MUST generate exactly 5 archetypes in this exact JSON structure:
{
  "archetypes": [
    {
      "id": "unique_id_1",
      "name": "Archetype Name",
      "description": "Detailed description including all parameters and characteristics",
      "textureReferences": ["actual/path/to/texture1.jpg", "actual/path/to/texture2.jpg"]
    },
    ... (4 more archetypes)
  ]
}

MANDATORY TEXTURE REQUIREMENT:
- You MUST call the queryTextures tool for each texture category mentioned in the prompt
- You MUST use the EXACT 'path' values returned by queryTextures in the textureReferences array
- DO NOT make up texture names - only use paths returned by queryTextures tool
- Example: If queryTextures returns path "public/textures/metal/Metal012_bundle_2K.jpg", use that EXACT string

Each archetype MUST have:
- id: A unique string identifier
- name: A descriptive name
- description: A comprehensive description that includes all the parameters, characteristics, and details mentioned in the prompt
- textureReferences: An array of ACTUAL texture file paths from queryTextures tool (not generic names!)

Generate exactly 5 archetypes. You MUST call queryTextures tool to get real texture paths - do not invent texture names.`,
    });
    
    return result.object;
  }
  
  private buildContextPrompt(): string {
    if (this.inheritedKnowledge.length === 0) {
      return 'INHERITED KNOWLEDGE (WARP): None - You are the first generation (Gen 0: Planetary Formation). Create the foundation that all future generations will build upon.';
    }
    
    const knowledgeSummary = this.inheritedKnowledge.map(gen => {
      const genNum = gen.generation;
      const scales = gen.scales || {};
      
      // Extract key information from each generation
      const macroArchetypes = scales.macro?.archetypes || [];
      const mesoArchetypes = scales.meso?.archetypes || [];
      const microArchetypes = scales.micro?.archetypes || [];
      
      let summary = `\n${genNum.toUpperCase()}:\n`;
      
      // Add macro scale summary
      if (macroArchetypes.length > 0) {
        summary += `  MACRO (${macroArchetypes.length} archetypes): `;
        summary += macroArchetypes.slice(0, 3).map((a: any) => a.name || a.id).join(', ');
        if (macroArchetypes.length > 3) summary += `...`;
        summary += '\n';
      }
      
      // Add meso scale summary
      if (mesoArchetypes.length > 0) {
        summary += `  MESO (${mesoArchetypes.length} archetypes): `;
        summary += mesoArchetypes.slice(0, 3).map((a: any) => a.name || a.id).join(', ');
        if (mesoArchetypes.length > 3) summary += `...`;
        summary += '\n';
      }
      
      // Add micro scale summary
      if (microArchetypes.length > 0) {
        summary += `  MICRO (${microArchetypes.length} archetypes): `;
        summary += microArchetypes.slice(0, 3).map((a: any) => a.name || a.id).join(', ');
        if (microArchetypes.length > 3) summary += `...`;
        summary += '\n';
      }
      
      // Add key parameters from archetypes
      const allArchetypes = [...macroArchetypes, ...mesoArchetypes, ...microArchetypes];
      if (allArchetypes.length > 0) {
        const firstArchetype = allArchetypes[0];
        if (firstArchetype.description) {
          summary += `  Key Context: ${firstArchetype.description.substring(0, 150)}...\n`;
        }
      }
      
      return summary;
    }).join('\n');
    
    return `INHERITED KNOWLEDGE (WARP - Causal Chain):
${knowledgeSummary}

CRITICAL INSTRUCTIONS:
- Your archetypes MUST build causally on the previous generations listed above
- Reference specific materials, capabilities, or structures from earlier generations
- Ensure your archetypes solve problems or enable capabilities that previous generations created
- Maintain consistency with the evolutionary progression
- Use the inherited context to inform your parameter values and visual blueprints

Generate archetypes that logically follow from this causal chain.`;
  }
}

export async function executeWarpWeftGeneration(): Promise<void> {
  console.log('🔗 Executing WARP/WEFT generation with proper AI agents...');
  
  const generations = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
  const knowledgeChain: any[] = [];
  
  for (const gen of generations) {
    console.log(`\n🎯 Processing ${gen}...`);
    
    const agent = new WarpWeftAgent(gen, knowledgeChain);
    const generationData = { generation: gen, scales: {} };
    
    for (const scale of ['macro', 'meso', 'micro'] as const) {
      try {
        const scaleData = await agent.generateScale(scale);
        generationData.scales[scale] = scaleData;
        
        // Save to file  
        await fs.writeFile(
          `data/archetypes/${gen}/${scale}.json`,
          JSON.stringify(scaleData, null, 2)
        );
        
        console.log(`   ✅ ${scale}.json generated with ${scaleData.archetypes?.length || 0} archetypes`);
        
      } catch (error) {
        console.warn(`   ❌ ${scale} generation failed:`, error.message);
      }
    }
    
    knowledgeChain.push(generationData);
  }
  
  console.log('✅ WARP/WEFT generation complete');
}