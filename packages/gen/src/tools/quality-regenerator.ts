/**
 * Quality Regenerator
 * Automatically regenerates anemic archetypes and raises red flags if still anemic after second pass
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Note: We'll import dynamically to avoid circular dependencies
type GenerationQualityReport = any;
type ArchetypeQualityMetrics = any;
import { WarpWeftAgent } from '../workflows/warp-weft-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RegenerationResult {
  generation: string;
  scale: string;
  regenerated: boolean;
  anemicBefore: ArchetypeQualityMetrics[];
  anemicAfter: ArchetypeQualityMetrics[];
  stillAnemic: ArchetypeQualityMetrics[];
  redFlag: boolean;
}

/**
 * Regenerate anemic archetypes for a specific generation/scale
 */
async function regenerateAnemicArchetypes(
  generation: string,
  scale: string,
  anemicArchetypes: ArchetypeQualityMetrics[],
  knowledgeChain: any[]
): Promise<RegenerationResult> {
  console.log(`\n🔄 Regenerating ${generation}/${scale} - ${anemicArchetypes.length} anemic archetypes detected`);
  
  // Load existing data
  const filePath = join(__dirname, '../../../backend/data/archetypes', generation, `${scale}.json`);
  const existingData = JSON.parse(await fs.readFile(filePath, 'utf8'));
  const existingArchetypes = existingData.archetypes || [];
  
  // Filter out anemic archetypes
  const anemicIds = new Set(anemicArchetypes.map(a => a.id));
  const healthyArchetypes = existingArchetypes.filter((a: any) => !anemicIds.has(a.id));
  
  console.log(`   📊 Keeping ${healthyArchetypes.length} healthy archetypes, regenerating ${anemicArchetypes.length} anemic ones`);
  
  // Regenerate using WarpWeftAgent
  const agent = new WarpWeftAgent(generation, knowledgeChain);
  
  // Build context from completed scales
  const currentScales: { macro?: any; meso?: any } = {};
  if (scale === 'meso') {
    const macroPath = join(__dirname, '../../../backend/data/archetypes', generation, 'macro.json');
    if (await fs.access(macroPath).then(() => true).catch(() => false)) {
      currentScales.macro = JSON.parse(await fs.readFile(macroPath, 'utf8'));
    }
  }
  if (scale === 'micro') {
    const macroPath = join(__dirname, '../../../backend/data/archetypes', generation, 'macro.json');
    const mesoPath = join(__dirname, '../../../backend/data/archetypes', generation, 'meso.json');
    if (await fs.access(macroPath).then(() => true).catch(() => false)) {
      currentScales.macro = JSON.parse(await fs.readFile(macroPath, 'utf8'));
    }
    if (await fs.access(mesoPath).then(() => true).catch(() => false)) {
      currentScales.meso = JSON.parse(await fs.readFile(mesoPath, 'utf8'));
    }
  }
  
  // Generate new archetypes (enough to replace anemic ones + some buffer)
  const targetCount = Math.max(anemicArchetypes.length + 2, 5);
  console.log(`   🎯 Generating ${targetCount} replacement archetypes...`);
  
  try {
    const newScaleData = await agent.generateScale(scale, Object.keys(currentScales).length > 0 ? currentScales : undefined, 0);
    const newArchetypes = newScaleData.archetypes || [];
    
    // Merge: keep healthy + new (replace anemic)
    const mergedArchetypes = [...healthyArchetypes, ...newArchetypes];
    
    // Save merged data
    const mergedData = {
      archetypes: mergedArchetypes
    };
    
    await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2));
    
    console.log(`   ✅ Regenerated: ${newArchetypes.length} new archetypes, ${mergedArchetypes.length} total`);
    
    // Re-assess quality
    const { assessAllGenerations } = await import('./quality-assessor');
    // We'll assess after all regenerations
    
    return {
      generation,
      scale,
      regenerated: true,
      anemicBefore: anemicArchetypes,
      anemicAfter: [], // Will be filled after re-assessment
      stillAnemic: [],
      redFlag: false,
    };
  } catch (error: any) {
    console.error(`   ❌ Failed to regenerate ${generation}/${scale}: ${error.message}`);
    return {
      generation,
      scale,
      regenerated: false,
      anemicBefore: anemicArchetypes,
      anemicAfter: [],
      stillAnemic: anemicArchetypes, // If regeneration failed, they're still anemic
      redFlag: true,
    };
  }
}

/**
 * Run holistic quality assessment and regeneration pass
 */
export async function runQualityAssessmentAndRegeneration(): Promise<{
  reports: GenerationQualityReport[];
  regenerations: RegenerationResult[];
  redFlags: RegenerationResult[];
}> {
  console.log('\n🔍 Running holistic quality assessment...\n');
  
  // First pass: assess all generations
  const { assessAllGenerations } = await import('./quality-assessor.js');
  await assessAllGenerations();
  
  // Load quality report
  const reportPath = join(__dirname, '../../data/manifests/quality-assessment.json');
  const qualityReport = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  const reports: GenerationQualityReport[] = qualityReport.reports || [];
  
  // Collect all anemic archetypes
  const anemicByScale: Map<string, ArchetypeQualityMetrics[]> = new Map();
  
  for (const report of reports) {
    if (report.anemicArchetypes.length > 0) {
      const key = `${report.generation}/${report.scale}`;
      anemicByScale.set(key, report.anemicArchetypes);
    }
  }
  
  if (anemicByScale.size === 0) {
    console.log('✅ No anemic archetypes found - all quality checks passed!');
    return { reports, regenerations: [], redFlags: [] };
  }
  
  console.log(`\n⚠️  Found ${anemicByScale.size} scales with anemic archetypes`);
  
  // Build knowledge chain for regeneration
  const knowledgeChain: any[] = [];
  const generations = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
  
  for (const gen of generations) {
    const macroPath = join(__dirname, '../../../backend/data/archetypes', gen, 'macro.json');
    const mesoPath = join(__dirname, '../../../backend/data/archetypes', gen, 'meso.json');
    const microPath = join(__dirname, '../../../backend/data/archetypes', gen, 'micro.json');
    
    try {
      const macro = JSON.parse(await fs.readFile(macroPath, 'utf8'));
      const meso = JSON.parse(await fs.readFile(mesoPath, 'utf8'));
      const micro = JSON.parse(await fs.readFile(microPath, 'utf8'));
      
      knowledgeChain.push({
        generation: gen,
        scales: { macro, meso, micro }
      });
    } catch {
      // Skip if generation doesn't exist
    }
  }
  
  // First regeneration pass
  const regenerations: RegenerationResult[] = [];
  
  for (const [key, anemic] of anemicByScale) {
    const [gen, scale] = key.split('/');
    const result = await regenerateAnemicArchetypes(gen, scale, anemic, knowledgeChain);
    regenerations.push(result);
  }
  
  // Re-assess after first regeneration
  console.log('\n🔍 Re-assessing quality after first regeneration pass...\n');
  await assessAllGenerations();
  
  const secondReport = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  const secondReports: GenerationQualityReport[] = secondReport.reports || [];
  
  // Check for still-anemic archetypes (RED FLAG)
  const redFlags: RegenerationResult[] = [];
  
  for (const report of secondReports) {
    if (report.anemicArchetypes.length > 0) {
      const key = `${report.generation}/${report.scale}`;
      const originalAnemic = anemicByScale.get(key) || [];
      
      // Check if any original anemic archetypes are still anemic
      const stillAnemic = report.anemicArchetypes.filter(a => 
        originalAnemic.some(orig => orig.id === a.id)
      );
      
      if (stillAnemic.length > 0) {
        console.log(`\n🚨 RED FLAG: ${report.generation}/${report.scale} - ${stillAnemic.length} archetypes STILL anemic after regeneration!`);
        stillAnemic.forEach(a => {
          console.log(`   - ${a.name} (${(a.score * 100).toFixed(1)}%): ${a.issues.slice(0, 3).join(', ')}`);
        });
        
        redFlags.push({
          generation: report.generation,
          scale: report.scale,
          regenerated: true,
          anemicBefore: originalAnemic,
          anemicAfter: report.anemicArchetypes,
          stillAnemic,
          redFlag: true,
        });
      }
    }
  }
  
  if (redFlags.length > 0) {
    console.log(`\n🚨🚨🚨 RED FLAG ALARM: ${redFlags.length} scales have archetypes that are STILL anemic after regeneration!`);
    console.log('   This indicates a systemic issue with the generation prompts or schema.');
    console.log('   Manual intervention required!');
  } else {
    console.log('\n✅ All anemic archetypes successfully regenerated!');
  }
  
  return { reports: secondReports, regenerations, redFlags };
}

