#!/usr/bin/env tsx

/**
 * GEN CLI - Asset generation and texture management
 */

import { Command } from 'commander';
import { TextureDownloader } from './ambientcg/TextureDownloader';

const program = new Command();

program
  .name('ebb-gen')
  .description('Ebb & Bloom asset generation and texture management')
  .version('1.0.0');

program
  .command('textures')
  .description('Download AmbientCG texture library for cosmic materials')
  .action(async () => {
    console.log('🌍 Downloading AmbientCG cosmic materials...');
    
    try {
      const manifests = await TextureDownloader.downloadCosmicMaterials();
      
      console.log('✅ Download complete!');
      console.log(`📦 ${manifests.length} materials downloaded`);
      console.log('🔗 Integration: Materials ready for SDF API + ECS');
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      process.exit(1);
    }
  });

program.parse();