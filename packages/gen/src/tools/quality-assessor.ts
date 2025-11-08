/**
 * Quality Assessment Tool
 * Analyzes generated archetypes to identify "anemic" (low-quality, incomplete) entries
 * Compares archetypes across generations/scales to find outliers
 */

import { promises as fs } from 'fs';
import { stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ArchetypeQualityMetrics {
  id: string;
  name: string;
  generation: string;
  scale: string;
  score: number;
  fileSize?: number; // Size of archetype JSON in bytes
  sizeScore?: number; // Normalized size score (0-1)
  metrics: {
    descriptionLength: number;
    parameterCount: number;
    textureCount: number;
    colorCount: number;
    hasDeconstruction: boolean;
    hasFormation: boolean;
    hasSelectionBias: boolean;
    hasAdjacency: boolean;
    visualDetailScore: number;
    completenessScore: number;
  };
  issues: string[];
  suspiciousSize?: boolean; // Flag if size is suspiciously small/large
}

interface GenerationQualityReport {
  generation: string;
  scale: string;
  totalArchetypes: number;
  averageScore: number;
  medianScore: number;
  anemicThreshold: number;
  anemicArchetypes: ArchetypeQualityMetrics[];
  standoutArchetypes: ArchetypeQualityMetrics[]; // High quality
  qualityDistribution: {
    excellent: number; // > 0.8
    good: number; // 0.6-0.8
    fair: number; // 0.4-0.6
    poor: number; // 0.2-0.4
    anemic: number; // < 0.2
  };
}

/**
 * Assess quality of a single archetype
 */
function assessArchetypeQuality(
  archetype: any,
  generation: string,
  scale: string,
  archetypeSizeBytes?: number,
  averageSizeBytes?: number
): ArchetypeQualityMetrics {
  const issues: string[] = [];
  let score = 0;
  const maxScore = 10;

  // Description quality (0-2 points)
  const descriptionLength = (archetype.description || '').length;
  if (descriptionLength < 50) {
    issues.push(`Description too short (${descriptionLength} chars, minimum 50)`);
  } else if (descriptionLength < 100) {
    score += 1;
  } else {
    score += 2;
  }

  // Parameter completeness (0-1.5 points)
  const parameterCount = archetype.parameters ? Object.keys(archetype.parameters).length : 0;
  if (parameterCount === 0) {
    issues.push('No parameters defined');
  } else if (parameterCount < 3) {
    issues.push(`Few parameters (${parameterCount}, expected 3+)`);
    score += 0.5;
  } else {
    score += 1.5;
  }

  // Visual properties completeness (0-2 points)
  const textureCount = archetype.textureReferences?.length || archetype.visualProperties?.primaryTextures?.length || 0;
  const colorCount = archetype.visualProperties?.colorPalette?.length || 0;
  const hasPBR = !!archetype.visualProperties?.pbrProperties;
  const hasProcedural = !!(archetype.visualProperties?.proceduralRules);

  if (textureCount === 0) {
    issues.push('No texture references');
  } else if (textureCount < 2) {
    issues.push(`Few textures (${textureCount}, expected 2+)`);
    score += 0.5;
  } else {
    score += 1;
  }

  if (colorCount === 0) {
    issues.push('No color palette');
  } else if (colorCount < 3) {
    issues.push(`Few colors (${colorCount}, expected 3+)`);
    score += 0.3;
  } else {
    score += 0.5;
  }

  if (!hasPBR) {
    issues.push('Missing PBR properties');
  } else {
    score += 0.3;
  }

  if (!hasProcedural) {
    issues.push('Missing procedural rules');
  } else {
    score += 0.2;
  }

  // Required fields (0-2 points)
  const hasDeconstruction = !!archetype.deconstruction;
  const hasFormation = !!archetype.formation;

  if (!hasDeconstruction) {
    issues.push('Missing deconstruction field');
  } else {
    score += 1;
  }

  if (!hasFormation) {
    issues.push('Missing formation field');
  } else {
    score += 1;
  }

  // Optional but valuable fields (0-1.5 points)
  const hasSelectionBias = !!archetype.selectionBias;
  const hasAdjacency = !!archetype.adjacency;

  if (hasSelectionBias) score += 0.5;
  if (hasAdjacency) score += 1;

  // Calculate normalized score (0-1)
  const normalizedScore = score / maxScore;

  // Visual detail score (0-1)
  const visualDetailScore = (
    (textureCount > 0 ? 0.3 : 0) +
    (colorCount >= 3 ? 0.3 : 0) +
    (hasPBR ? 0.2 : 0) +
    (hasProcedural ? 0.2 : 0)
  );

  // Completeness score (0-1)
  const completenessScore = (
    (hasDeconstruction ? 0.25 : 0) +
    (hasFormation ? 0.25 : 0) +
    (hasSelectionBias ? 0.15 : 0) +
    (hasAdjacency ? 0.15 : 0) +
    (parameterCount >= 3 ? 0.2 : 0)
  );

  return {
    id: archetype.id,
    name: archetype.name,
    generation,
    scale,
    score: normalizedScore,
    metrics: {
      descriptionLength,
      parameterCount,
      textureCount,
      colorCount,
      hasDeconstruction,
      hasFormation,
      hasSelectionBias,
      hasAdjacency,
      visualDetailScore,
      completenessScore,
    },
    issues,
  };
}

/**
 * Generate quality report for a generation/scale
 */
async function generateQualityReport(
  archetypes: any[],
  generation: string,
  scale: string,
  filePath?: string
): Promise<GenerationQualityReport> {
  // Calculate file sizes if file path provided
  let archetypeSizes: number[] = [];
  let averageSize = 0;
  
  if (filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Calculate size of each archetype by serializing individually
      archetypeSizes = archetypes.map(arch => {
        const archJson = JSON.stringify(arch);
        return Buffer.byteLength(archJson, 'utf8');
      });
      
      if (archetypeSizes.length > 0) {
        averageSize = archetypeSizes.reduce((a, b) => a + b, 0) / archetypeSizes.length;
      }
    } catch (error) {
      // If we can't calculate sizes, continue without them
    }
  }
  
  const assessments = archetypes.map((a, i) => 
    assessArchetypeQuality(
      a, 
      generation, 
      scale,
      archetypeSizes[i],
      averageSize
    )
  );
  
  const scores = assessments.map(a => a.score).sort((a, b) => a - b);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const medianScore = scores[Math.floor(scores.length / 2)];

  // Anemic threshold: 1.5 standard deviations below mean
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const anemicThreshold = Math.max(0, averageScore - (1.5 * stdDev));

  const anemicArchetypes = assessments.filter(a => a.score < anemicThreshold);
  
  // Standout: significantly above average (1.5 std dev above mean)
  const standoutThreshold = averageScore + (1.5 * stdDev);
  const standoutArchetypes = assessments.filter(a => a.score > standoutThreshold);

  const qualityDistribution = {
    excellent: assessments.filter(a => a.score > 0.8).length,
    good: assessments.filter(a => a.score >= 0.6 && a.score <= 0.8).length,
    fair: assessments.filter(a => a.score >= 0.4 && a.score < 0.6).length,
    poor: assessments.filter(a => a.score >= 0.2 && a.score < 0.4).length,
    anemic: assessments.filter(a => a.score < 0.2).length,
  };

  return {
    generation,
    scale,
    totalArchetypes: archetypes.length,
    averageScore,
    medianScore,
    anemicThreshold,
    anemicArchetypes,
    standoutArchetypes,
    qualityDistribution,
  };
}

/**
 * Assess all generations and generate comprehensive report
 */
export async function assessAllGenerations(): Promise<void> {
  const dataPath = join(__dirname, '../../data/archetypes');
  const generations = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
  const scales = ['macro', 'meso', 'micro'];

  const allReports: GenerationQualityReport[] = [];
  const allAssessments: ArchetypeQualityMetrics[] = [];

  console.log('🔍 Assessing quality of all generated archetypes...\n');

  for (const gen of generations) {
    for (const scale of scales) {
      const filePath = join(dataPath, gen, `${scale}.json`);
      
      try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const archetypes = data.archetypes || [];
        
        if (archetypes.length === 0) {
          console.log(`   ⚠️  ${gen}/${scale}: No archetypes found`);
          continue;
        }

        const report = await generateQualityReport(archetypes, gen, scale, filePath);
        allReports.push(report);
        // Add ALL assessments for overall statistics
        const archetypeSizes: number[] = [];
        let averageSize = 0;
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          archetypeSizes.push(...archetypes.map(arch => Buffer.byteLength(JSON.stringify(arch), 'utf8')));
          if (archetypeSizes.length > 0) {
            averageSize = archetypeSizes.reduce((a, b) => a + b, 0) / archetypeSizes.length;
          }
        } catch {}
        const assessments = archetypes.map((a, i) => 
          assessArchetypeQuality(a, gen, scale, archetypeSizes[i], averageSize)
        );
        allAssessments.push(...assessments);

        console.log(`   📊 ${gen}/${scale}: ${archetypes.length} archetypes`);
        console.log(`      Average score: ${(report.averageScore * 100).toFixed(1)}%`);
        console.log(`      Quality: Excellent=${report.qualityDistribution.excellent}, Good=${report.qualityDistribution.good}, Fair=${report.qualityDistribution.fair}, Poor=${report.qualityDistribution.poor}, Anemic=${report.qualityDistribution.anemic}`);
        
        if (report.anemicArchetypes.length > 0) {
          console.log(`      ⚠️  ANEMIC: ${report.anemicArchetypes.length} archetypes below threshold (${(report.anemicThreshold * 100).toFixed(1)}%)`);
          report.anemicArchetypes.forEach(a => {
            console.log(`         - ${a.name} (${(a.score * 100).toFixed(1)}%): ${a.issues.slice(0, 3).join(', ')}`);
          });
        }

        if (report.standoutArchetypes.length > 0) {
          console.log(`      ⭐ STANDOUT: ${report.standoutArchetypes.length} high-quality archetypes`);
        }

      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`   ❌ Error assessing ${gen}/${scale}: ${error.message}`);
        }
      }
    }
  }

  // Overall statistics
  console.log('\n📈 OVERALL QUALITY STATISTICS:');
  const allScores = allAssessments.map(a => a.score);
  if (allScores.length > 0) {
    const overallAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const overallAnemic = allAssessments.filter(a => a.score < 0.3).length;
    
    console.log(`   Total archetypes assessed: ${allAssessments.length}`);
    console.log(`   Overall average score: ${(overallAvg * 100).toFixed(1)}%`);
    console.log(`   Anemic archetypes (< 30%): ${overallAnemic}`);
    
    if (overallAnemic > 0) {
      console.log('\n🚨 MOST ANEMIC ARCHETYPES:');
      const sortedAnemic = allAssessments
        .filter(a => a.score < 0.3)
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);
      
      sortedAnemic.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.generation}/${a.scale}/${a.name} (${(a.score * 100).toFixed(1)}%)`);
        console.log(`      Issues: ${a.issues.slice(0, 5).join(', ')}`);
      });
    }
  }

  // Generate detailed JSON report
  const reportPath = join(__dirname, '../../data/manifests/quality-assessment.json');
  await fs.writeFile(
    reportPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      reports: allReports,
      anemicArchetypes: allAssessments.filter(a => a.score < 0.3),
    }, null, 2)
  );

  console.log(`\n✅ Quality assessment complete - report saved to ${reportPath}`);
  
  return { reports: allReports, assessments: allAssessments };
}

