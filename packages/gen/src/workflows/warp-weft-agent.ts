/**
 * WARP/WEFT AGENT SYSTEM - PROPERLY USING VERCEL AI
 */

import { generateObject } from 'ai';
import { TEXT_MODEL } from '../config/ai-models';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getGenerationPrompt } from '../prompts/generation-prompts.js';
import { GenerationScaleSchema } from '../schemas/visual-blueprint-schema.js';
// Note: Tools not yet supported with generateObject - using prompt instructions instead
// import { textureQueryTool } from '../tools/structured-texture-tool.js';

/**
 * Load archetype counts from manifest configuration
 * Returns null for "unlimited" generation (AI determines count)
 * Defaults to reasonable minimum if not specified
 */
async function getArchetypeCount(gen: string, scale: string): Promise<number | null> {
  try {
    const manifestPath = join(dirname(fileURLToPath(import.meta.url)), '../../data/manifests/archetype-generation.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const config = manifest.archetypeGeneration?.[gen]?.[scale];

    // If generateCount is 0 or negative, allow unlimited generation
    if (config?.generateCount === 0 || config?.generateCount === -1) {
      return null; // Unlimited - AI determines count
    }

    return config?.generateCount ?? null; // Default to unlimited if not specified
  } catch {
    return null; // Fallback to unlimited if manifest not found
  }
}

export class WarpWeftAgent {
  private generation: string;
  private inheritedKnowledge: any[] = [];
  private archetypeCount: number | null;

  constructor(generation: string, inheritedKnowledge: any[] = []) {
    this.generation = generation;
    this.inheritedKnowledge = inheritedKnowledge;
    // Get archetype count for this generation/scale (will be set when generating scale)
    this.archetypeCount = null; // Default to unlimited
  }

  async generateScale(
    scale: 'macro' | 'meso' | 'micro',
    currentGenerationScales?: { macro?: any; meso?: any },
    retryCount: number = 0
  ): Promise<any> {
    // Get archetype count for this generation/scale from manifest (null = unlimited)
    this.archetypeCount = await getArchetypeCount(this.generation, scale);

    const countStr = this.archetypeCount === null ? 'unlimited (AI-determined)' : `${this.archetypeCount}`;
    console.log(`   🎯 Generating ${this.generation}/${scale} with AI... (${countStr} archetypes)${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);

    const prompts = getGenerationPrompt(this.generation, scale);
    const contextPrompt = this.buildContextPrompt(currentGenerationScales);

    try {
      const result = await generateObject({
        model: TEXT_MODEL,
        schema: GenerationScaleSchema,
        system: prompts.systemPrompt,
        prompt: `${contextPrompt}

${prompts.userPrompt}

CRITICAL OUTPUT FORMAT - NESTED JSON, NOT TOML STRINGS:
You MUST generate ${this.archetypeCount === null ? 'a comprehensive set of archetypes (as many as needed to properly cover the conceptual space - aim for 8-15 archetypes minimum, but generate more if needed to ensure complete coverage)' : `exactly ${this.archetypeCount} archetypes`} in this exact JSON structure with PROPER NESTED OBJECTS:
{
  "archetypes": [
    {
      "id": "unique_id_1",
      "name": "Archetype Name",
      "description": "Narrative description of the archetype and its visual appearance",
      "parameters": {
        "stellarMass": { "min": 0.8, "max": 1.5, "default": 1.2 },
        "metallicity": { "min": 0.3, "max": 1.0, "default": 0.7 },
        "age": { "min": 1.0, "max": 10.0, "default": 5.0 },
        "orbitalDistance": { "min": 0.5, "max": 3.0, "default": 1.2 }
      },
      "selectionBias": {
        "baseWeight": 0.2,
        "seedModifiers": { "high-metallicity": 1.5, "low-metallicity": 0.5 },
        "biasDescription": "More likely in metal-rich stellar systems"
      },
      "adjacency": {
        "compatibleWith": ["stellar_type_2", "stellar_type_4"],
        "incompatibleWith": [],
        "adjacentTo": ["stellar_type_4"],
        "requires": []
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
      "textureReferences": ["Metal049A", "Rock025"],
      "deconstruction": {
        "deconstructionProcess": "Description of how this archetype breaks down",
        "compatibleDeconstructors": ["DISASSEMBLER tools", "creatures with excavation > 0.7"],
        "decomposesInto": ["Gen1 archetypes", "raw materials", "organic matter"],
        "propertyUsage": {
          "hardness": "armor potential",
          "volume": "container potential",
          "organic": "food potential"
        }
      },
      "formation": {
        "formationProcess": "Step-by-step description of HOW this archetype forms (answers 'how did that squirrel get there?')",
        "synthesisFrom": {
          "previousGenerations": ["Gen1 creature archetypes", "Gen0 materials"],
          "requirements": ["creature manipulation > 0.5", "pack size > 3"],
          "causalChain": "How previous generations causally lead to this archetype"
        },
        "yukaGuidance": "Instructions for Yuka AI systems on how to evaluate/trigger formation"
      }
    }${this.archetypeCount === null ? '\n    // ... generate as many more archetypes as needed to comprehensively cover this scale\n    // Aim for 8-15 minimum, but generate more if the conceptual space requires it' : `\n    ... (${this.archetypeCount - 1} more archetypes)`}
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
- parameters: Nested JSON object with PARAMETER RANGES {min, max, default} NOT fixed values! Seeds interpolate within ranges.
- selectionBias: Optional object for weighted selection:
  * baseWeight: Base selection probability (0.0-1.0, default 0.2)
  * seedModifiers: How seed context modifies probability (e.g., {"high-metallicity": 1.5})
  * biasDescription: When this archetype is more/less likely
- adjacency: Optional object for compatibility:
  * compatibleWith: Array of archetype IDs/categories that can coexist
  * incompatibleWith: Array of archetype IDs/categories that cannot coexist
  * adjacentTo: Array of archetype IDs that are similar variations
  * requires: Array of prerequisites (archetype IDs or conditions)
- visualProperties: Nested JSON object with textures, colors, PBR properties, procedural rules
- textureReferences: Array of texture IDs (same as visualProperties.primaryTextures)
- deconstruction: Object describing how this archetype can be deconstructed:
  * deconstructionProcess: String describing how it breaks down
  * compatibleDeconstructors: Array of strings describing what can deconstruct it (e.g., ["DISASSEMBLER tools", "creatures with excavation > 0.7"])
  * decomposesInto: Array of strings describing what it breaks down into (e.g., ["Gen1 archetypes", "raw materials", "organic matter"])
  * propertyUsage: Optional object with hardness, volume, organic properties describing usage after deconstruction
- formation: Object describing HOW this archetype forms for Yuka AI guidance:
  * formationProcess: Detailed step-by-step description of HOW it forms (answers "how did that squirrel get there?")
  * synthesisFrom: Object describing what combines to create it:
    - previousGenerations: Array of strings describing Gen N-1 components (e.g., ["Gen1 creature archetypes", "Gen0 materials"])
    - requirements: Array of strings describing specific requirements (e.g., ["creature manipulation > 0.5", "pack size > 3"])
    - causalChain: String explaining how previous generations causally lead to this archetype
  * yukaGuidance: String with instructions for Yuka AI systems on how to evaluate/trigger formation

CRITICAL UNIVERSAL TEMPLATE REQUIREMENTS:
- Parameters MUST be RANGES {min, max, default}, not fixed values! Seeds interpolate within ranges for infinite variation.
- selectionBias defines how seeds affect selection probability (weighted selection, not random)
- adjacency defines compatibility and prerequisites (what can coexist, what's required)
- formation is ESSENTIAL - Yuka AI needs to understand HOW things form so it can make decisions. Think: "How did that squirrel get there? How did that settlement form?" - Yuka needs the step-by-step process.

${this.archetypeCount === null
            ? `Generate a COMPREHENSIVE set of archetypes. Do NOT limit yourself - generate as many archetypes as needed to properly and completely cover the conceptual space for this scale. Aim for at least 8-15 archetypes minimum, but generate MORE if needed to ensure you've explored all meaningful variations and edge cases. The goal is COMPLETE COVERAGE, not arbitrary limits.`
            : `Generate exactly ${this.archetypeCount} archetypes.`} You MUST use proper nested JSON structures, NOT TOML-like strings!`,
      });

      if (!result.object) {
        throw new Error('AI did not generate any object - response was empty');
      }

      return result.object;
    } catch (error: any) {
      // Log detailed schema errors for debugging
      if (error.cause?.issues) {
        console.error(`   🔍 Schema validation errors:`);
        error.cause.issues.slice(0, 5).forEach((issue: any, i: number) => {
          console.error(`      ${i + 1}. ${issue.path.join('.')}: ${issue.message}`);
        });
        if (error.cause.issues.length > 5) {
          console.error(`      ... and ${error.cause.issues.length - 5} more errors`);
        }
      }

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

      // THREAD PULLER: Analyze texture bias from WARP context
      const textureBias = this.analyzeTextureBias();
      const diversityCounterbalance = this.buildDiversityCounterbalance(textureBias);

      prompt += `INHERITED KNOWLEDGE (WARP - Causal Chain from Previous Generations):
${knowledgeSummary}

CRITICAL WARP INSTRUCTIONS:
- Your archetypes MUST build causally on the previous generations listed above
- Reference specific materials, capabilities, or structures from earlier generations
- Ensure your archetypes solve problems or enable capabilities that previous generations created
- Maintain consistency with the evolutionary progression
- Use the inherited context to inform your parameter values and visual blueprints

${diversityCounterbalance}

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

  /**
   * THREAD PULLER: Analyze texture bias from WARP context
   * Detects if previous generations are biased towards certain texture categories
   */
  private analyzeTextureBias(): { mineral: number; organic: number; construction: number } {
    const textureCounts = { mineral: 0, organic: 0, construction: 0 };
    let totalTextures = 0;

    // Analyze all previous generations
    for (const gen of this.inheritedKnowledge) {
      const scales = gen.scales || {};
      const allArchetypes = [
        ...(scales.macro?.archetypes || []),
        ...(scales.meso?.archetypes || []),
        ...(scales.micro?.archetypes || []),
      ];

      for (const archetype of allArchetypes) {
        const textures = archetype.textureReferences || archetype.visualProperties?.primaryTextures || [];
        for (const textureId of textures) {
          totalTextures++;
          // Categorize textures
          if (textureId.match(/^(Metal|Rock|Ice|Water|Crystal)/i)) {
            textureCounts.mineral++;
          } else if (textureId.match(/^(Wood|Grass|Fabric|Leather)/i)) {
            textureCounts.organic++;
          } else if (textureId.match(/^(Bricks|Concrete)/i)) {
            textureCounts.construction++;
          }
        }
      }
    }

    // Calculate percentages
    if (totalTextures === 0) {
      return { mineral: 0, organic: 0, construction: 0 };
    }

    return {
      mineral: textureCounts.mineral / totalTextures,
      organic: textureCounts.organic / totalTextures,
      construction: textureCounts.construction / totalTextures,
    };
  }

  /**
   * THREAD PULLER: Build diversity counterbalance instructions
   * Injects diversity examples when bias is detected
   */
  private buildDiversityCounterbalance(bias: { mineral: number; organic: number; construction: number }): string {
    // Only apply THREAD PULLER for Gen1+ (Gen0 is naturally mineral-focused)
    if (this.generation === 'gen0') {
      return '';
    }

    const biasThreshold = 0.7; // 70% threshold for bias detection
    const instructions: string[] = [];

    // Detect mineral bias (common from Gen0)
    if (bias.mineral > biasThreshold) {
      const biasPercent = Math.round(bias.mineral * 100);
      instructions.push(`\n🔧 THREAD PULLER - DIVERSITY COUNTERBALANCE:`);
      instructions.push(`⚠️  BIAS DETECTED: Based on WARP from previous generations, you are biased ~${biasPercent}% towards MINERALS (Rock/Metal textures).`);
      instructions.push(`\n✅ DIVERSITY INJECTION - You MUST equally consider these texture categories:`);

      // Determine which categories are appropriate for this generation
      const genNum = parseInt(this.generation.replace('gen', ''));
      const appropriateCategories: string[] = [];

      if (genNum >= 1) {
        appropriateCategories.push('Wood (organic materials)', 'Grass (natural surfaces)', 'Fabric (soft materials)', 'Leather (textured organic)');
      }
      if (genNum >= 3) {
        appropriateCategories.push('Bricks (structured materials)', 'Concrete (industrial materials)');
      }

      if (appropriateCategories.length > 0) {
        instructions.push(`- ${appropriateCategories.join('\n- ')}`);
        instructions.push(`\n📋 TEXTURE DIVERSITY REQUIREMENT:`);
        instructions.push(`- At least 2-3 of your 5 archetypes MUST use organic/construction materials (Wood, Grass, Fabric, Leather, Bricks, Concrete)`);
        instructions.push(`- DO NOT let WARP bias limit you to only minerals - this generation should explore ALL available material categories`);
        instructions.push(`- Example texture IDs to consider: Wood094, Wood051, Grass001, Grass002, Fabric019, Fabric023, Leather011, Leather012, Bricks051, Concrete023`);
        instructions.push(`- Think: "What materials would creatures/packs/tools/buildings ACTUALLY use?" - Not just what the planet provides, but what life creates and uses.`);
      }
    }

    return instructions.join('\n');
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
function validateScaleData(scaleData: any, scale: string, expectedCount?: number | null): boolean {
  if (!scaleData || !scaleData.archetypes || !Array.isArray(scaleData.archetypes)) {
    console.error(`   ❌ ${scale}: Missing archetypes array`);
    return false;
  }

  const count = scaleData.archetypes.length;
  if (count === 0) {
    console.error(`   ❌ ${scale}: No archetypes generated`);
    return false;
  }

  // Only validate count if explicitly specified (not unlimited/null)
  if (expectedCount !== null && expectedCount !== undefined && count !== expectedCount) {
    console.warn(`   ⚠️  ${scale}: Expected ${expectedCount} archetypes, got ${count} (validation will pass, but count differs)`);
    // Don't fail validation - allow flexibility
  }

  // Minimum sanity check: at least 3 archetypes for meaningful diversity
  if (count < 3) {
    console.warn(`   ⚠️  ${scale}: Only ${count} archetypes generated - consider generating more for better coverage`);
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
      // Double-check all scales are valid (no expected count for existing files)
      const macroValid = validateScaleData(existing.scales.macro, 'macro', null);
      const mesoValid = validateScaleData(existing.scales.meso, 'meso', null);
      const microValid = validateScaleData(existing.scales.micro, 'micro', null);

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
        // Get expected count for validation (null = unlimited)
        const expectedCount = await getArchetypeCount(gen, scale);
        if (!validateScaleData(scaleData, scale, expectedCount)) {
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

        const count = scaleData.archetypes.length;
        if (expectedCount !== null && expectedCount !== undefined && count !== expectedCount) {
          console.warn(`   ⚠️  ${scale}.json generated ${count} archetypes (expected ${expectedCount})`);
        }
        console.log(`   ✅ ${scale}.json generated and validated with ${count} archetypes`);

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

  // Run holistic quality assessment and regeneration
  console.log('\n🔍 Running holistic quality assessment and regeneration...');
  try {
    const { runQualityAssessmentAndRegeneration } = await import('../tools/quality-regenerator.js');
    const { reports, regenerations, redFlags } = await runQualityAssessmentAndRegeneration();

    if (redFlags.length > 0) {
      console.log(`\n🚨 RED FLAG: ${redFlags.length} scales still have anemic archetypes after regeneration!`);
      throw new Error(`Quality regeneration failed: ${redFlags.length} scales still anemic`);
    }

    if (regenerations.length > 0) {
      console.log(`\n✅ Quality regeneration complete: ${regenerations.length} scales regenerated`);
    }
  } catch (error: any) {
    console.error(`\n⚠️  Quality assessment/regeneration failed: ${error.message}`);
    // Don't fail the entire pipeline, but warn
  }

  // Generate comprehensive documentation
  const { generateGenerationDocumentation } = await import('./generate-documentation.js');
  await generateGenerationDocumentation();
}