/**
 * WARP/WEFT AGENT SYSTEM - PROPERLY USING VERCEL AI
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { promises as fs } from 'fs';
import { getGenerationPrompt } from '../prompts/generation-prompts.js';
import { GenerationScaleSchema } from '../schemas/visual-blueprint-schema.js';
// Note: Tools not yet supported with generateObject - using prompt instructions instead
// import { textureQueryTool } from '../tools/structured-texture-tool.js';

export class WarpWeftAgent {
  private generation: string;
  private inheritedKnowledge: any[] = [];

  constructor(generation: string, inheritedKnowledge: any[] = []) {
    this.generation = generation;
    this.inheritedKnowledge = inheritedKnowledge;
  }

  async generateScale(
    scale: 'macro' | 'meso' | 'micro',
    currentGenerationScales?: { macro?: any; meso?: any },
    retryCount: number = 0
  ): Promise<any> {
    console.log(`   🎯 Generating ${this.generation}/${scale} with AI...${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);

    const prompts = getGenerationPrompt(this.generation, scale);
    const contextPrompt = this.buildContextPrompt(currentGenerationScales);

    try {
      const result = await generateObject({
      model: openai('gpt-4o'),
      schema: GenerationScaleSchema,
      system: prompts.systemPrompt,
      prompt: `${contextPrompt}

${prompts.userPrompt}

CRITICAL OUTPUT FORMAT - NESTED JSON, NOT TOML STRINGS:
You MUST generate exactly 5 archetypes in this exact JSON structure with PROPER NESTED OBJECTS:
{
  "archetypes": [
    {
      "id": "unique_id_1",
      "name": "Archetype Name",
      "description": "Narrative description of the archetype and its visual appearance",
      "parameters": {
        "stellarMass": 1.2,
        "metallicity": 0.7,
        "age": 5.0,
        "orbitalDistance": 1.2
      },
      "visualProperties": {
        "primaryTextures": ["Metal049A", "Rock025"],
        "colorPalette": ["#293542", "#5EC8D2", "#8FD4F7"],
        "pbrProperties": {
          "baseColor": "#293542",
          "roughness": 0.9,
          "metallic": 0.1,
          "emissive": "#5EC8D2",
          "normalStrength": 1.5,
          "aoStrength": 0.8,
          "heightScale": 0.05
        },
        "proceduralRules": "Detailed description of how surface features vary procedurally"
      },
      "textureReferences": ["Metal049A", "Rock025"]
    },
    ... (4 more archetypes)
  ]
}

CRITICAL: visualProperties MUST be a nested JSON object, NOT a TOML-like string in the description field!

MANDATORY TEXTURE REQUIREMENT:
- You MUST use texture IDs (like "Wood094", "Metal049A", "Rock025", "Fabric019", "Leather011", "Grass001", "Bricks051", "Concrete023")
- These texture IDs come from the AmbientCG texture manifest - use realistic IDs that match the category
- DO NOT use file paths - the backend uses texture IDs from the addressable manifest
- DO NOT make up texture names - use realistic IDs like "Metal049A" (not "Metal123" or made-up names)
- Category matters: Understand how each category (Metal=smooth/reflective, Rock=rough/geological, Wood=organic, Fabric=soft, Leather=textured, Grass=natural, Bricks=structured, Concrete=industrial) affects wrapping and shaping of objects
- Common texture ID patterns: Metal049A, Metal050, Rock025, Rock030, Wood094, Wood051, Fabric019, Fabric023, Leather011, Leather012, Grass001, Grass002, Bricks051, Bricks060, Concrete023, Concrete025

MANDATORY STRUCTURE REQUIREMENT:
- visualProperties MUST be a nested JSON object with:
  * primaryTextures: array of texture IDs (use realistic IDs from the manifest)
  * colorPalette: array of hex color strings (5-8 colors)
  * pbrProperties: nested object with baseColor, roughness, metallic, emissive (optional), normalStrength, aoStrength, heightScale
  * proceduralRules: string describing surface variation
- parameters MUST be a nested JSON object with numerical values (not strings!)
- description is a narrative string, NOT where you put structured data
- Think: "Would this create a visually stunning planet when rendered?"
- Include atmospheric effects, surface features, geological diversity

Each archetype MUST have:
- id: A unique string identifier
- name: A descriptive name that evokes the visual appearance
- description: Narrative description (NOT structured data - that goes in visualProperties!)
- parameters: Nested JSON object with numerical values
- visualProperties: Nested JSON object with textures, colors, PBR properties, procedural rules
- textureReferences: Array of texture IDs (same as visualProperties.primaryTextures)

Generate exactly 5 archetypes. You MUST use proper nested JSON structures, NOT TOML-like strings!`,
    });

      if (!result.object) {
        throw new Error('AI did not generate any object - response was empty');
      }

      return result.object;
    } catch (error: any) {
      // Retry up to 2 times for transient failures
      if (retryCount < 2 && (error.message?.includes('did not match schema') || error.message?.includes('No object generated'))) {
        console.log(`   ⚠️  Retrying ${this.generation}/${scale} due to schema mismatch...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
        return this.generateScale(scale, currentGenerationScales, retryCount + 1);
      }
      throw error;
    }
  }

  private buildContextPrompt(currentGenerationScales?: { macro?: any; meso?: any }): string {
    let prompt = '';

    // WARP: Inherited knowledge from previous generations
    if (this.inheritedKnowledge.length === 0) {
      prompt += 'INHERITED KNOWLEDGE (WARP): None - You are the first generation (Gen 0: Planetary Formation). Create the foundation that all future generations will build upon.\n\n';
    } else {
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

      prompt += `INHERITED KNOWLEDGE (WARP - Causal Chain from Previous Generations):
${knowledgeSummary}

CRITICAL WARP INSTRUCTIONS:
- Your archetypes MUST build causally on the previous generations listed above
- Reference specific materials, capabilities, or structures from earlier generations
- Ensure your archetypes solve problems or enable capabilities that previous generations created
- Maintain consistency with the evolutionary progression
- Use the inherited context to inform your parameter values and visual blueprints

`;
    }

    // WEFT: Current generation's completed scales
    if (currentGenerationScales) {
      const weftContext: string[] = [];

      if (currentGenerationScales.macro?.archetypes) {
        const macroNames = currentGenerationScales.macro.archetypes
          .slice(0, 5)
          .map((a: any) => `"${a.name}" (${a.description?.substring(0, 80)}...)`)
          .join('\n    - ');
        weftContext.push(`MACRO scale archetypes (${currentGenerationScales.macro.archetypes.length} total):
    - ${macroNames}`);
      }

      if (currentGenerationScales.meso?.archetypes) {
        const mesoNames = currentGenerationScales.meso.archetypes
          .slice(0, 5)
          .map((a: any) => `"${a.name}" (${a.description?.substring(0, 80)}...)`)
          .join('\n    - ');
        weftContext.push(`MESO scale archetypes (${currentGenerationScales.meso.archetypes.length} total):
    - ${mesoNames}`);
      }

      if (weftContext.length > 0) {
        const scaleType = currentGenerationScales.meso ? 'MICRO' : 'MESO';
        prompt += `\nCURRENT GENERATION CONTEXT (WEFT - Building on Previous Scales):
${weftContext.join('\n\n')}

CRITICAL WEFT INSTRUCTIONS:
- You are generating ${this.generation.toUpperCase()} ${scaleType} scale archetypes
- ${currentGenerationScales.macro ? 'MACRO scale defines the foundational context - your archetypes must be compatible with and build upon macro archetypes' : ''}
- ${currentGenerationScales.meso ? 'MESO scale defines the intermediate dynamics - your archetypes must integrate macro context with meso dynamics' : ''}
- Reference specific archetypes from completed scales when generating your options
- Ensure your archetypes logically flow from the scales generated before you

`;
      }
    }

    return prompt;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that an archetype has proper nested JSON structure (not TOML strings)
 */
function isValidArchetypeStructure(archetype: any): boolean {
  // Must have visualProperties as nested object, not string
  if (!archetype.visualProperties || typeof archetype.visualProperties !== 'object') {
    return false;
  }

  // visualProperties must have nested pbrProperties
  if (!archetype.visualProperties.pbrProperties || typeof archetype.visualProperties.pbrProperties !== 'object') {
    return false;
  }

  // Must have proper structure
  if (!archetype.id || !archetype.name || !archetype.description) {
    return false;
  }

  // parameters must be object, not string
  if (archetype.parameters && typeof archetype.parameters !== 'object') {
    return false;
  }

  return true;
}

/**
 * Load existing generation data if it exists AND is valid
 */
async function loadExistingGeneration(gen: string): Promise<any | null> {
  const macroPath = `data/archetypes/${gen}/macro.json`;
  const mesoPath = `data/archetypes/${gen}/meso.json`;
  const microPath = `data/archetypes/${gen}/micro.json`;

  const allExist = await fileExists(macroPath) &&
    await fileExists(mesoPath) &&
    await fileExists(microPath);

  if (!allExist) {
    return null;
  }

  try {
    const [macro, meso, micro] = await Promise.all([
      fs.readFile(macroPath, 'utf8').then(JSON.parse),
      fs.readFile(mesoPath, 'utf8').then(JSON.parse),
      fs.readFile(microPath, 'utf8').then(JSON.parse),
    ]);

    // VALIDATE: Check if archetypes have proper nested structure
    const macroValid = macro.archetypes?.every((a: any) => isValidArchetypeStructure(a)) ?? false;
    const mesoValid = meso.archetypes?.every((a: any) => isValidArchetypeStructure(a)) ?? false;
    const microValid = micro.archetypes?.every((a: any) => isValidArchetypeStructure(a)) ?? false;

    if (!macroValid || !mesoValid || !microValid) {
      console.log(`   ⚠️  ${gen} exists but has invalid structure (old TOML format?) - will regenerate`);
      return null;
    }

    return {
      generation: gen,
      scales: { macro, meso, micro }
    };
  } catch (error: any) {
    console.warn(`   ⚠️  Failed to load existing ${gen} data:`, error.message);
    return null;
  }
}

/**
 * Validate that a scale's data is complete and valid
 */
function validateScaleData(scaleData: any, scale: string): boolean {
  if (!scaleData || !scaleData.archetypes || !Array.isArray(scaleData.archetypes)) {
    console.error(`   ❌ ${scale}: Missing archetypes array`);
    return false;
  }

  if (scaleData.archetypes.length !== 5) {
    console.error(`   ❌ ${scale}: Expected 5 archetypes, got ${scaleData.archetypes.length}`);
    return false;
  }

  // Validate each archetype has proper structure
  for (let i = 0; i < scaleData.archetypes.length; i++) {
    const archetype = scaleData.archetypes[i];
    if (!isValidArchetypeStructure(archetype)) {
      console.error(`   ❌ ${scale}: Archetype ${i + 1} has invalid structure`);
      return false;
    }
  }

  return true;
}

export async function executeWarpWeftGeneration(): Promise<void> {
  console.log('🔗 Executing WARP/WEFT generation with proper AI agents...');
  console.log('📋 CRITICAL: Each generation must complete MACRO → MESO → MICRO in order');
  console.log('📋 CRITICAL: All three scales must be valid before moving to next generation\n');

  const generations = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
  const knowledgeChain: any[] = [];

  for (const gen of generations) {
    console.log(`\n🎯 Processing ${gen}...`);

    // IDEMPOTENCY: Load existing data if it exists AND is valid
    const existing = await loadExistingGeneration(gen);
    if (existing) {
      // Double-check all scales are valid
      const macroValid = validateScaleData(existing.scales.macro, 'macro');
      const mesoValid = validateScaleData(existing.scales.meso, 'meso');
      const microValid = validateScaleData(existing.scales.micro, 'micro');

      if (macroValid && mesoValid && microValid) {
        console.log(`   ⏭️  ${gen} already exists and is valid - skipping regeneration`);
        knowledgeChain.push(existing);
        continue;
      } else {
        console.log(`   ⚠️  ${gen} exists but has invalid scales - will regenerate`);
      }
    }

    const agent = new WarpWeftAgent(gen, knowledgeChain);
    const generationData: { generation: string; scales: { macro?: any; meso?: any; micro?: any } } = {
      generation: gen,
      scales: {}
    };

    // CRITICAL: Generate in order MACRO → MESO → MICRO
    // Each scale builds on the previous scale's context
    const scales: Array<'macro' | 'meso' | 'micro'> = ['macro', 'meso', 'micro'];

    for (const scale of scales) {
      console.log(`   🎯 Generating ${gen}/${scale}...`);

      try {
        // Pass completed scales for WEFT flow
        const currentScales: { macro?: any; meso?: any } = {};
        if (scale === 'meso' && generationData.scales.macro) {
          currentScales.macro = generationData.scales.macro;
        }
        if (scale === 'micro') {
          if (generationData.scales.macro) {
            currentScales.macro = generationData.scales.macro;
          }
          if (generationData.scales.meso) {
            currentScales.meso = generationData.scales.meso;
          }
        }

        const scaleData = await agent.generateScale(scale, Object.keys(currentScales).length > 0 ? currentScales : undefined, 0);

        // VALIDATE immediately after generation
        if (!validateScaleData(scaleData, scale)) {
          throw new Error(`${scale} validation failed - invalid structure`);
        }

        // Save immediately after validation
        const dirPath = `data/archetypes/${gen}`;
        await fs.mkdir(dirPath, { recursive: true });

        await fs.writeFile(
          `${dirPath}/${scale}.json`,
          JSON.stringify(scaleData, null, 2)
        );

        // Add to generation data for next scale's context
        generationData.scales[scale] = scaleData;

        console.log(`   ✅ ${scale}.json generated and validated with ${scaleData.archetypes.length} archetypes`);

      } catch (error: any) {
        console.error(`   ❌ ${scale} generation/validation FAILED: ${error.message}`);
        console.error(`   🛑 STOPPING ${gen} - cannot proceed without valid ${scale}`);
        throw new Error(`Generation ${gen} failed at ${scale} scale: ${error.message}`);
      }
    }

    // All three scales validated - add to knowledge chain for next generation
    console.log(`   ✅ ${gen} COMPLETE - all scales valid, adding to WARP chain`);
    knowledgeChain.push(generationData);
  }

  console.log('\n✅ WARP/WEFT generation complete - all generations validated');

  // Generate comprehensive documentation
  const { generateGenerationDocumentation } = await import('./generate-documentation.js');
  await generateGenerationDocumentation();
}