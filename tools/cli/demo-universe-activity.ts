#!/usr/bin/env tsx
/**
 * UNIVERSE ACTIVITY MAP DEMO
 * 
 * Sample a small cosmic grid and show activity distribution
 */

import { UniverseActivityMap } from '../simulation/UniverseActivityMap';

async function demo() {
  console.log('🌌 UNIVERSE ACTIVITY MAP DEMO\n');
  console.log('Sampling cosmic grid (this will take a minute)...\n');
  
  // Small grid for demo (3³ = 27 regions)
  const map = new UniverseActivityMap(3, 100);
  
  // Synthesize all regions
  await map.synthesizeAll();
  
  // Analysis
  const all = map.getAllRegions();
  const active = map.getActiveRegions();
  const civilized = map.getCivilizedRegions();
  const brightest = map.getBrightestRegions(5);
  
  console.log('\n═══════════════════════════════════════');
  console.log('COSMIC ACTIVITY ANALYSIS');
  console.log('═══════════════════════════════════════\n');
  
  console.log(`Total regions sampled: ${all.length}`);
  console.log(`Active regions (activity > 0): ${active.length} (${((active.length/all.length)*100).toFixed(1)}%)`);
  console.log(`Civilized regions: ${civilized.length} (${((civilized.length/all.length)*100).toFixed(1)}%)`);
  
  console.log('\n📍 TOP 5 BRIGHTEST REGIONS:\n');
  brightest.forEach((region, i) => {
    console.log(`${i + 1}. Position: (${region.x}, ${region.y}, ${region.z}) Mpc`);
    console.log(`   Seed: ${region.seed}`);
    console.log(`   Activity: ${region.activity.toFixed(2)}/10 ⭐`);
    console.log(`   Complexity: ${region.state?.complexity || 'N/A'}`);
    if (region.kardashev !== undefined) {
      console.log(`   Kardashev: Type ${region.kardashev}`);
    }
    console.log(`   Stars: ${region.state?.stars?.length || 0}`);
    console.log(`   Planets: ${region.state?.planets?.length || 0}`);
    console.log(`   Species: ${region.state?.species?.length || 0}`);
    console.log(`   Social groups: ${region.state?.groups?.length || 0}`);
    console.log(`   Technologies: ${region.state?.tools?.length || 0}\n`);
  });
  
  // Activity histogram
  console.log('ACTIVITY DISTRIBUTION:\n');
  const histogram: Record<number, number> = {};
  for (let i = 0; i <= 10; i++) {
    histogram[i] = 0;
  }
  
  all.forEach(r => {
    const bucket = Math.floor(r.activity);
    histogram[bucket]++;
  });
  
  for (let i = 0; i <= 10; i++) {
    const count = histogram[i];
    const pct = ((count / all.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(count / 2));
    console.log(`  ${i.toString().padStart(2)}: ${pct.padStart(5)}% ${bar}`);
  }
  
  console.log('\n✅ This data would render as a point cloud with brightness = activity');
  console.log('✅ Click bright spots to zoom in and explore');
  console.log('✅ Dark regions = sterile (H/He only)');
  console.log('✅ Bright regions = civilizations!\n');
}

demo().catch(console.error);
