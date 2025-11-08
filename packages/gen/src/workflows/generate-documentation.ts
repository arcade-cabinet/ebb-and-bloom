/**
 * Generate comprehensive markdown documentation for all generations
 * Shows WARP/WEFT flow, all scales, and texture references with images
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GEN_DATA_PATH = join(__dirname, '../../../backend/data/archetypes');
const TEXTURE_MANIFEST_PATH = join(__dirname, '../../../game/public/textures/manifest.json');
// Output to root docs/ directory
const OUTPUT_PATH = join(__dirname, '../../../../docs/GENERATION_REVIEW.md');

interface Archetype {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, number>;
  visualProperties?: {
    primaryTextures: string[];
    colorPalette: string[];
    pbrProperties?: Record<string, any>;
    proceduralRules?: string;
  };
  textureReferences?: string[];
}

interface GenerationScale {
  archetypes: Archetype[];
}

interface GenerationData {
  macro: GenerationScale;
  meso: GenerationScale;
  micro: GenerationScale;
}

interface TextureAsset {
  assetId: string;
  name: string;
  category: string;
  filePath: string;
  localPath: string;
}

interface TextureManifest {
  assets: TextureAsset[];
  categories: string[];
}

const GENERATION_NAMES: Record<string, string> = {
  gen0: 'Gen 0: Planetary Genesis',
  gen1: 'Gen 1: ECS Archetypes',
  gen2: 'Gen 2: Pack Dynamics',
  gen3: 'Gen 3: Tool Systems',
  gen4: 'Gen 4: Tribe Formation',
  gen5: 'Gen 5: Building Systems',
  gen6: 'Gen 6: Religion & Democracy',
};

const SCALE_DESCRIPTIONS: Record<string, string> = {
  macro: 'MACRO: System-level context and foundational patterns',
  meso: 'MESO: Intermediate dynamics and structural relationships',
  micro: 'MICRO: Fine-grained details and specific implementations',
};

/**
 * Load all generation data
 */
async function loadAllGenerations(): Promise<Map<string, GenerationData>> {
  const generations = new Map<string, GenerationData>();
  const genDirs = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];

  for (const gen of genDirs) {
    try {
      const genPath = join(GEN_DATA_PATH, gen);
      const [macro, meso, micro] = await Promise.all([
        fs.readFile(join(genPath, 'macro.json'), 'utf8').then(JSON.parse) as Promise<GenerationScale>,
        fs.readFile(join(genPath, 'meso.json'), 'utf8').then(JSON.parse) as Promise<GenerationScale>,
        fs.readFile(join(genPath, 'micro.json'), 'utf8').then(JSON.parse) as Promise<GenerationScale>,
      ]);

      generations.set(gen, { macro, meso, micro });
    } catch (error: any) {
      console.warn(`⚠️  Could not load ${gen}: ${error.message}`);
    }
  }

  return generations;
}

/**
 * Load texture manifest
 */
async function loadTextureManifest(): Promise<TextureManifest> {
  const manifestContent = await fs.readFile(TEXTURE_MANIFEST_PATH, 'utf8');
  return JSON.parse(manifestContent);
}

/**
 * Get texture info by ID
 */
function getTextureInfo(textureId: string, manifest: TextureManifest): TextureAsset | null {
  return manifest.assets.find(asset => asset.assetId === textureId) || null;
}

/**
 * Generate image markdown with scaled size
 */
function generateTextureImageMarkdown(textureId: string, textureInfo: TextureAsset | null): string {
  if (!textureInfo) {
    return `\`${textureId}\` (not found in manifest)`;
  }

  // Normalize path - manifest paths might be relative to package root
  // Convert paths like "src/textures/textures/wood/..." or "public/textures/wood/..." 
  // to relative path from docs/ folder
  let imagePath = textureInfo.localPath || textureInfo.filePath;
  
  // If path starts with "src/" or "public/", use it as-is relative to packages/game
  // Otherwise assume it's already relative
  if (imagePath.startsWith('src/') || imagePath.startsWith('public/')) {
    imagePath = `../../packages/game/${imagePath}`;
  } else if (!imagePath.startsWith('../')) {
    imagePath = `../../packages/game/public/textures/${imagePath}`;
  }
  
  // Scale down images for review (width=200px)
  return `<img src="${imagePath}" alt="${textureInfo.name}" width="200" />`;
}

/**
 * Collect all unique textures used across all generations
 */
function collectAllTextures(generations: Map<string, GenerationData>): Set<string> {
  const textureSet = new Set<string>();

  for (const [gen, data] of generations) {
    for (const scale of ['macro', 'meso', 'micro'] as const) {
      const archetypes = data[scale].archetypes || [];
      for (const archetype of archetypes) {
        // Collect from textureReferences
        if (archetype.textureReferences) {
          archetype.textureReferences.forEach(id => textureSet.add(id));
        }
        // Also collect from visualProperties.primaryTextures
        if (archetype.visualProperties?.primaryTextures) {
          archetype.visualProperties.primaryTextures.forEach(id => textureSet.add(id));
        }
      }
    }
  }

  return textureSet;
}

/**
 * Generate markdown for a single archetype
 */
function generateArchetypeMarkdown(
  archetype: Archetype,
  manifest: TextureManifest,
  scale: string
): string {
  const lines: string[] = [];

  lines.push(`#### ${archetype.name} (\`${archetype.id}\`)`);
  lines.push('');
  lines.push(`**Description:** ${archetype.description}`);
  lines.push('');

  // Parameters
  if (archetype.parameters && Object.keys(archetype.parameters).length > 0) {
    lines.push('**Parameters:**');
    lines.push('```json');
    lines.push(JSON.stringify(archetype.parameters, null, 2));
    lines.push('```');
    lines.push('');
  }

  // Visual Properties
  if (archetype.visualProperties) {
    const vp = archetype.visualProperties;
    
    if (vp.colorPalette && vp.colorPalette.length > 0) {
      lines.push('**Color Palette:**');
      vp.colorPalette.forEach(color => {
        lines.push(`- <span style="background-color: ${color}; padding: 2px 8px; border-radius: 3px;">${color}</span>`);
      });
      lines.push('');
    }

    if (vp.pbrProperties) {
      lines.push('**PBR Properties:**');
      lines.push('```json');
      lines.push(JSON.stringify(vp.pbrProperties, null, 2));
      lines.push('```');
      lines.push('');
    }

    if (vp.proceduralRules) {
      lines.push('**Procedural Rules:**');
      lines.push(`> ${vp.proceduralRules}`);
      lines.push('');
    }
  }

  // Texture References
  const allTextures = [
    ...(archetype.textureReferences || []),
    ...(archetype.visualProperties?.primaryTextures || []),
  ];
  const uniqueTextures = Array.from(new Set(allTextures));

  if (uniqueTextures.length > 0) {
    lines.push('**Textures:**');
    uniqueTextures.forEach(textureId => {
      const textureInfo = getTextureInfo(textureId, manifest);
      lines.push(`- **${textureId}** (${textureInfo?.category || 'unknown'}): ${generateTextureImageMarkdown(textureId, textureInfo)}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate markdown for a single scale
 */
function generateScaleMarkdown(
  gen: string,
  scale: 'macro' | 'meso' | 'micro',
  data: GenerationScale,
  manifest: TextureManifest,
  previousScales?: { macro?: GenerationScale; meso?: GenerationScale }
): string {
  const lines: string[] = [];

  lines.push(`### ${SCALE_DESCRIPTIONS[scale]}`);
  lines.push('');

  // WEFT Flow context
  if (scale === 'meso' && previousScales?.macro) {
    lines.push('**WEFT Flow:** Building on MACRO scale archetypes:');
    const macroNames = previousScales.macro.archetypes.slice(0, 3).map(a => `"${a.name}"`).join(', ');
    lines.push(`- ${macroNames}${previousScales.macro.archetypes.length > 3 ? '...' : ''}`);
    lines.push('');
  } else if (scale === 'micro' && previousScales) {
    lines.push('**WEFT Flow:** Building on MACRO and MESO scales:');
    if (previousScales.macro) {
      const macroNames = previousScales.macro.archetypes.slice(0, 2).map(a => `"${a.name}"`).join(', ');
      lines.push(`- MACRO: ${macroNames}${previousScales.macro.archetypes.length > 2 ? '...' : ''}`);
    }
    if (previousScales.meso) {
      const mesoNames = previousScales.meso.archetypes.slice(0, 2).map(a => `"${a.name}"`).join(', ');
      lines.push(`- MESO: ${mesoNames}${previousScales.meso.archetypes.length > 2 ? '...' : ''}`);
    }
    lines.push('');
  }

  lines.push(`**Total Archetypes:** ${data.archetypes.length}`);
  lines.push('');

  // Generate markdown for each archetype
  data.archetypes.forEach(archetype => {
    lines.push(generateArchetypeMarkdown(archetype, manifest, scale));
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Generate WARP flow description
 */
function generateWarpFlow(gen: string, previousGen?: GenerationData): string {
  const lines: string[] = [];

  if (!previousGen) {
    lines.push('**WARP Flow:** This is the first generation (Gen 0). No previous generations to inherit from.');
  } else {
    lines.push('**WARP Flow:** Inheriting knowledge from previous generation:');
    
    const prevGenNum = parseInt(gen.replace('gen', ''));
    const prevGenName = GENERATION_NAMES[`gen${prevGenNum - 1}`] || `Gen ${prevGenNum - 1}`;
    
    lines.push(`- **${prevGenName}** provided:`);
    
    // Summarize previous generation's archetypes
    const allPrevArchetypes = [
      ...(previousGen.macro.archetypes || []),
      ...(previousGen.meso.archetypes || []),
      ...(previousGen.micro.archetypes || []),
    ];
    
    const sampleArchetypes = allPrevArchetypes.slice(0, 5).map(a => `"${a.name}"`).join(', ');
    lines.push(`  - ${sampleArchetypes}${allPrevArchetypes.length > 5 ? '...' : ''}`);
    lines.push(`  - Total: ${allPrevArchetypes.length} archetypes across all scales`);
  }

  return lines.join('\n');
}

/**
 * Generate complete documentation
 */
export async function generateGenerationDocumentation(): Promise<void> {
  console.log('\n📝 Generating comprehensive generation documentation...');

  const generations = await loadAllGenerations();
  const manifest = await loadTextureManifest();
  const allTextures = collectAllTextures(generations);

  const lines: string[] = [];

  // Header
  lines.push('# Generation Review: WARP & WEFT Flow');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('This document presents all generations (Gen 0-6) with their WARP (vertical causal flow) and WEFT (horizontal scale flow) relationships.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  for (const gen of ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6']) {
    if (generations.has(gen)) {
      lines.push(`- [${GENERATION_NAMES[gen]}](#${gen.replace('gen', 'generation-')})`);
    }
  }
  lines.push('- [Texture Reference Collection](#texture-reference-collection)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Generate documentation for each generation
  let previousGen: GenerationData | undefined = undefined;

  for (const gen of ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6']) {
    const data = generations.get(gen);
    if (!data) continue;

    lines.push(`## ${GENERATION_NAMES[gen]} {#${gen.replace('gen', 'generation-')}}`);
    lines.push('');

    // WARP Flow
    lines.push(generateWarpFlow(gen, previousGen));
    lines.push('');
    lines.push('---');
    lines.push('');

    // MACRO Scale
    lines.push(generateScaleMarkdown(gen, 'macro', data.macro, manifest));
    lines.push('');

    // MESO Scale
    lines.push(generateScaleMarkdown(gen, 'meso', data.meso, manifest, { macro: data.macro }));
    lines.push('');

    // MICRO Scale
    lines.push(generateScaleMarkdown(gen, 'micro', data.micro, manifest, { macro: data.macro, meso: data.meso }));
    lines.push('');

    lines.push('---');
    lines.push('');

    previousGen = data;
  }

  // Texture Reference Collection
  lines.push('## Texture Reference Collection');
  lines.push('');
  lines.push(`**Total Unique Textures Used:** ${allTextures.size}`);
  lines.push('');

  // Group textures by category
  const texturesByCategory = new Map<string, string[]>();
  for (const textureId of allTextures) {
    const textureInfo = getTextureInfo(textureId, manifest);
    const category = textureInfo?.category || 'Unknown';
    if (!texturesByCategory.has(category)) {
      texturesByCategory.set(category, []);
    }
    texturesByCategory.get(category)!.push(textureId);
  }

  // Sort categories
  const sortedCategories = Array.from(texturesByCategory.keys()).sort();

  for (const category of sortedCategories) {
    lines.push(`### ${category} Textures`);
    lines.push('');
    const textureIds = texturesByCategory.get(category)!;
    
    lines.push('<div style="display: flex; flex-wrap: wrap; gap: 10px;">');
    for (const textureId of textureIds.sort()) {
      const textureInfo = getTextureInfo(textureId, manifest);
      if (textureInfo) {
        // Normalize path same way as generateTextureImageMarkdown
        let imagePath = textureInfo.localPath || textureInfo.filePath;
        if (imagePath.startsWith('src/') || imagePath.startsWith('public/')) {
          imagePath = `../../packages/game/${imagePath}`;
        } else if (!imagePath.startsWith('../')) {
          imagePath = `../../packages/game/public/textures/${imagePath}`;
        }
        
        lines.push(`<div style="text-align: center;">`);
        lines.push(`<img src="${imagePath}" alt="${textureInfo.name}" width="150" />`);
        lines.push(`<br/><small><strong>${textureId}</strong><br/>${textureInfo.name}</small>`);
        lines.push(`</div>`);
      }
    }
    lines.push('</div>');
    lines.push('');
  }

  // Add quality assessment section
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('# Quality Assessment');
  lines.push('');
  lines.push('## Overall Quality Statistics');
  lines.push('');
  
  try {
    const qualityReportPath = join(__dirname, '../../data/manifests/quality-assessment.json');
    const qualityReport = JSON.parse(await fs.readFile(qualityReportPath, 'utf8'));
    const reports = qualityReport.reports || [];
    const anemicArchetypes = qualityReport.anemicArchetypes || [];
    
    if (reports.length > 0) {
      const allScores = reports.flatMap((r: any) => 
        r.anemicArchetypes.map((a: any) => a.score)
      );
      const avgScore = allScores.length > 0 
        ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length 
        : 0;
      
      lines.push(`- **Total Archetypes Assessed**: ${reports.reduce((sum: number, r: any) => sum + r.totalArchetypes, 0)}`);
      lines.push(`- **Overall Average Score**: ${(avgScore * 100).toFixed(1)}%`);
      lines.push(`- **Anemic Archetypes** (< 30%): ${anemicArchetypes.length}`);
      lines.push('');
      
      if (anemicArchetypes.length > 0) {
        lines.push('### ⚠️ Anemic Archetypes Requiring Attention');
        lines.push('');
        anemicArchetypes.slice(0, 10).forEach((a: any, i: number) => {
          lines.push(`${i + 1}. **${a.generation}/${a.scale}/${a.name}** (${(a.score * 100).toFixed(1)}%)`);
          lines.push(`   - Issues: ${a.issues.slice(0, 3).join(', ')}`);
          if (a.suspiciousSize) {
            lines.push(`   - ⚠️ Suspicious file size detected`);
          }
          lines.push('');
        });
      } else {
        lines.push('✅ **All archetypes meet quality standards!**');
        lines.push('');
      }
    }
  } catch (error: any) {
    lines.push('⚠️ Quality assessment data not available');
    lines.push('');
  }

  // Write to file (once, at the end)
  const output = lines.join('\n');
  await fs.writeFile(OUTPUT_PATH, output, 'utf8');

  console.log(`✅ Documentation generated: ${OUTPUT_PATH}`);
  console.log(`   - ${generations.size} generations documented`);
  console.log(`   - ${allTextures.size} unique textures referenced`);
}

