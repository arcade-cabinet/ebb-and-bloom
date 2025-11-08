#!/usr/bin/env node
/**
 * GEN PACKAGE CLI
 * Generate universal archetype pools from docs/architecture breakdown
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';

const program = new Command();

program
  .name('@ebb/gen')
  .description('Generate universal archetype pools for seedrandom selection')
  .version('0.2.0');

program
  .command('archetypes')
  .description('Generate universal archetype pools for all generations using docs/architecture breakdown')
  .action(async () => {
    const { RealArchetypeGenerator } = await import('./workflows/real-archetype-generator.js');
    const generator = new RealArchetypeGenerator();
    await generator.generateAllArchetypePools();
  });

program
  .command('textures')
  .description('Download textures AND generate proper Zod-validated manifest')
  .action(async () => {
    console.log('🎨 Step 1: Downloading textures...');
    const ambientcg = await import('./downloaders/ambientcg.js');
    await ambientcg.main();
    
    console.log('📄 Step 2: Generating validated manifest...');
    const { RealManifestGenerator } = await import('./textures/real-manifest-generator.js');
    const generator = new RealManifestGenerator();
    await generator.generateValidatedManifest();
  });

program
  .command('status')
  .description('Show what archetypes and assets are available')
  .action(async () => {
    console.log('📊 Generation Package Status');
    console.log('============================');
    
    // Check archetype pools
    try {
      await fs.access('./data/archetypes/');
      const files = await fs.readdir('./data/archetypes/');
      console.log(`✅ Archetype pools: ${files.length} generation files`);
    } catch (error) {
      console.log('❌ Archetype pools: Need generation (run: pnpm archetypes)');
    }
    
    // Check texture catalog with validation
    try {
      const { TextureManifestSchema } = await import('./schemas/texture-manifest-schema.js');
      const data = await fs.readFile('./src/textures/textures/manifest.json', 'utf8');
      const manifest = TextureManifestSchema.parse(JSON.parse(data));
      console.log(`✅ Texture catalog: ${manifest.totalTextures} textures across ${Object.keys(manifest.categories).length} categories`);
    } catch (error) {
      console.log('❌ Texture catalog: Invalid or missing (run: pnpm textures)');
    }
    
    console.log(`✅ OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing API key'}`);
  });

program.parse();