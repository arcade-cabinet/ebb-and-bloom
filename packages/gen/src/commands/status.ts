/**
 * STATUS COMMAND - PROPER IMPLEMENTATION  
 */

import { promises as fs } from 'fs';

export async function executeStatusCommand(): Promise<void> {
  console.log('📊 Generation Package Status');
  console.log('============================');
  
  // Check archetype pools
  try {
    const gens = await fs.readdir('data/archetypes/');
    const genDirs = gens.filter(g => g.startsWith('gen'));
    console.log(`✅ Archetype pools: ${genDirs.length} generations ready`);
    
    for (const gen of genDirs.slice(0, 3)) { // Show first 3
      const files = await fs.readdir(`data/archetypes/${gen}/`);
      console.log(`   ${gen}: ${files.length} scale files`);
    }
    
  } catch (error) {
    console.log('❌ Archetype pools: Need generation');
  }
  
  // Check texture catalog  
  try {
    const manifest = JSON.parse(await fs.readFile('./public/textures/manifest.json', 'utf8'));
    console.log(`✅ Texture catalog: ${manifest.totalTextures} textures across ${Object.keys(manifest.categories).length} categories`);
  } catch (error) {
    console.log('❌ Texture catalog: Missing or invalid');
  }
  
  console.log(`✅ OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
}