#!/usr/bin/env tsx
/**
 * Test Generation 0 Workflows
 * 
 * Standalone script to test Gen 0 AI workflows without game dependencies.
 * Run: tsx src/dev/test-gen0.ts
 * 
 * This will:
 * 1. Generate a planet from seed phrase
 * 2. Show all cores, materials, creatures
 * 3. Save manifest to disk
 * 4. Validate the output
 */

import { executeGenerationZero } from './GenerationZeroOrchestrator';
import { log } from '../utils/Logger';

async function main() {
  console.log('\n========================================');
  console.log('GENERATION 0 TEST');
  console.log('========================================\n');

  const seedPhrase = process.argv[2] || 'test-planet-alpha';
  
  console.log(`Seed Phrase: "${seedPhrase}"\n`);
  console.log('⏳ Executing Gen 0 workflows (this will take 30-60 seconds)...\n');

  try {
    const startTime = Date.now();
    const result = await executeGenerationZero(seedPhrase);
    const elapsed = Date.now() - startTime;

    console.log('\n✅ GENERATION 0 COMPLETE!\n');
    console.log(`⏱️  Time: ${(elapsed / 1000).toFixed(1)}s\n`);

    // Display results
    console.log('========================================');
    console.log('PLANETARY SUMMARY');
    console.log('========================================\n');

    console.log(`🌍 Planet Name: ${result.planetary.planetaryName}`);
    console.log(`🎨 Theme: ${result.planetary.worldTheme}`);
    console.log(`🌱 Fill Material: ${result.planetary.fillMaterial.name} (${result.planetary.fillMaterial.type})`);
    console.log(`   - Density: ${result.planetary.fillMaterial.density}/10`);
    console.log(`   - Permeability: ${result.planetary.fillMaterial.permeability}/10`);
    console.log(`   - Oxygenation: ${result.planetary.fillMaterial.oxygenation}/10\n`);

    console.log('========================================');
    console.log('PLANETARY CORES (8)');
    console.log('========================================\n');

    result.planetary.cores.forEach((core, i) => {
      console.log(`${i + 1}. ${core.name}`);
      console.log(`   Element: ${core.dominantElement}`);
      console.log(`   Temperature: ${core.temperature}/10 | Pressure: ${core.pressure}/10 | Stability: ${core.stability}/10`);
      console.log(`   Color: ${core.color}`);
      console.log(`   ${core.description}\n`);
    });

    console.log('========================================');
    console.log(`SHARED MATERIALS (${result.planetary.sharedMaterials.length})`);
    console.log('========================================\n');

    result.planetary.sharedMaterials.forEach((material, i) => {
      console.log(`${i + 1}. ${material.name} (${material.category})`);
      console.log(`   Depth: ${material.baseDepth}m | Hardness: ${material.hardness}/10 | Rarity: ${(material.rarity * 100).toFixed(0)}%`);
      console.log(`   Affinities: ${material.affinityTypes.join(', ')}`);
      console.log(`   ${material.description}\n`);
    });

    console.log('========================================');
    console.log('CORE-SPECIFIC CONTENT');
    console.log('========================================\n');

    result.coreManifests.forEach((manifest) => {
      console.log(`📦 ${manifest.coreName}`);
      console.log(`   Materials: ${manifest.materials.length} | Creatures: ${manifest.creatures.length}\n`);

      if (manifest.materials.length > 0) {
        console.log('   Materials:');
        manifest.materials.forEach(m => {
          console.log(`   - ${m.name} (${m.category}, depth: ${m.depth}m, hardness: ${m.density}/10)`);
        });
        console.log();
      }

      if (manifest.creatures.length > 0) {
        console.log('   Creatures:');
        manifest.creatures.forEach(c => {
          console.log(`   - ${c.name} (${c.category})`);
          console.log(`     Mob:${c.mobility} Man:${c.manipulation} Int:${c.intelligence} Soc:${c.socialTendency} Agg:${c.aggression}`);
        });
        console.log();
      }
    });

    console.log('========================================');
    console.log('VALIDATION');
    console.log('========================================\n');

    // Validate structure
    const validations = [
      { check: result.planetary.cores.length === 8, msg: '✅ 8 planetary cores generated' },
      { check: result.planetary.sharedMaterials.length >= 5, msg: `✅ ${result.planetary.sharedMaterials.length} shared materials` },
      { check: result.coreManifests.length === 8, msg: '✅ 8 core specialist manifests' },
      { check: result.coreManifests.every(m => m.materials.length >= 2), msg: '✅ All cores have materials' },
      { check: result.coreManifests.every(m => m.creatures.length >= 1), msg: '✅ All cores have creatures' },
    ];

    const totalMaterials = result.planetary.sharedMaterials.length + 
      result.coreManifests.reduce((sum, m) => sum + m.materials.length, 0);
    const totalCreatures = result.coreManifests.reduce((sum, m) => sum + m.creatures.length, 0);

    validations.push(
      { check: totalMaterials >= 20, msg: `✅ ${totalMaterials} total materials` },
      { check: totalCreatures >= 8, msg: `✅ ${totalCreatures} total creature archetypes` }
    );

    let passed = 0;
    let failed = 0;

    validations.forEach(v => {
      console.log(v.check ? v.msg : `❌ ${v.msg}`);
      if (v.check) passed++;
      else failed++;
    });

    console.log(`\n📊 Validation: ${passed}/${validations.length} passed\n`);

    console.log('========================================');
    console.log('MANIFEST SAVED');
    console.log('========================================\n');
    console.log(`📁 ./manifests/gen0/${seedPhrase}.json`);
    console.log('\nYou can now use this manifest in the game!\n');

    if (failed > 0) {
      console.log('⚠️  Some validations failed. Check AI responses.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ GENERATION 0 FAILED\n');
    console.error(error);
    console.error('\nCheck your OPENAI_API_KEY environment variable.');
    process.exit(1);
  }
}

main();
