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

Generate exactly 5 archetypes. Use queryTextures tool to get appropriate texture references.`,
    });
    
    return result.object;
  }
  
  private buildContextPrompt(): string {
    if (this.inheritedKnowledge.length === 0) {
      return 'INHERITED KNOWLEDGE: None (you are the first generation)';
    }
    
    return `INHERITED KNOWLEDGE (WARP):
${this.inheritedKnowledge.map(gen => 
  `${gen.generation}: ${gen.generationName} - ${gen.totalArchetypes || 0} archetypes`
).join('\n')}

Use this knowledge to create archetypes that build causally on previous generations.`;
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