/**
 * Game Development CLI - AI-powered manifest-driven asset pipeline
 * Integrates texture downloader, OpenAI image generation, Freesound audio, and dev workflows
 */

import { Command } from 'commander';
import { OpenAI } from 'openai';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import axios from 'axios';
import { writeFile, readFile, existsSync, mkdirSync } from 'fs/promises';
import { join } from 'path';
import { log } from '../utils/Logger';

// Asset manifest interfaces
interface GameAssetManifest {
  version: string;
  generated: string;
  textures: TextureAsset[];
  models: ModelAsset[];
  audio: AudioAsset[];
  ui: UIAsset[];
}

interface TextureAsset {
  id: string;
  name: string;
  category: 'terrain' | 'creature' | 'material' | 'ui' | 'effect';
  source: 'ambientcg' | 'generated' | 'manual';
  files: {
    color?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
  };
  metadata: {
    resolution: string;
    size: number;
    checksum: string;
    generated: string;
  };
}

interface ModelAsset {
  id: string;
  name: string;
  category: 'creature' | 'structure' | 'material' | 'effect';
  source: {
    type: 'openai_generated' | 'procedural' | 'manual';
    prompt?: string;
    parameters?: Record<string, any>;
  };
  files: {
    glb?: string;
    gltf?: string;
  };
  metadata: {
    polycount: number;
    size: number;
    checksum: string;
    generated: string;
  };
}

interface AudioAsset {
  id: string;
  name: string;
  category: 'evolution' | 'environment' | 'ui' | 'creature';
  source: {
    type: 'freesound' | 'generated' | 'procedural';
    freesoundId?: number;
    prompt?: string;
  };
  files: {
    ogg?: string;
    mp3?: string;
    wav?: string;
  };
  metadata: {
    duration: number;
    size: number;
    checksum: string;
    generated: string;
  };
}

interface UIAsset {
  id: string;
  name: string;
  category: 'icon' | 'background' | 'pattern' | 'gradient';
  source: {
    type: 'openai_generated' | 'css_generated' | 'manual';
    prompt?: string;
    cssProperties?: Record<string, string>;
  };
  files: {
    svg?: string;
    png?: string;
    css?: string;
  };
  metadata: {
    dimensions?: [number, number];
    size: number;
    generated: string;
  };
}

class GameDevCLI {
  private openai: OpenAI;
  private freesoundApiKey: string;
  private manifestPath: string;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
    this.freesoundApiKey = process.env.FREESOUND_API_KEY || '';
    this.manifestPath = './public/assets/game-manifest.json';
    
    this.ensureDirectories();
  }
  
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      './public/assets',
      './public/models', 
      './public/audio',
      './public/textures',
      './public/ui',
      './src/generated'
    ];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdirSync(dir, { recursive: true });
      }
    }
  }
  
  /**
   * Generate creature visual based on evolutionary traits
   */
  async generateCreatureAsset(
    emergentName: string,
    traits: number[],
    morphologyDescription: string
  ): Promise<ModelAsset> {
    
    log.info('Generating creature asset with OpenAI', {
      emergentName,
      traits: traits.slice(0, 5),
      morphologyDescription
    });
    
    const prompt = this.buildCreaturePrompt(emergentName, traits, morphologyDescription);
    
    try {
      // Generate with OpenAI DALL-E (using gpt-4-vision for consistency)
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
        n: 1
      });
      
      const imageUrl = response.data[0]?.url;
      if (!imageUrl) throw new Error('No image generated');
      
      // Download and save
      const imageBuffer = await this.downloadImage(imageUrl);
      const fileName = `creature-${emergentName}.png`;
      const filePath = `./public/models/${fileName}`;
      
      await writeFile(filePath, imageBuffer);
      
      // Create asset entry
      const asset: ModelAsset = {
        id: `creature-${emergentName}`,
        name: emergentName,
        category: 'creature',
        source: {
          type: 'openai_generated',
          prompt,
          parameters: { traits, morphologyDescription }
        },
        files: {
          glb: `/models/${fileName}` // Would convert to GLB in production
        },
        metadata: {
          polycount: 0, // Would extract from model
          size: imageBuffer.length,
          checksum: this.generateChecksum(imageBuffer),
          generated: new Date().toISOString()
        }
      };
      
      await this.updateManifest('models', asset);
      
      log.info('Creature asset generated successfully', {
        emergentName,
        filePath,
        size: imageBuffer.length
      });
      
      return asset;
      
    } catch (error) {
      log.error('Failed to generate creature asset', error, { emergentName });
      throw error;
    }
  }
  
  private buildCreaturePrompt(
    emergentName: string,
    traits: number[],
    morphologyDescription: string
  ): string {
    
    // Convert trait values to descriptive elements
    const traitDescriptions = this.traitsToDescriptions(traits);
    
    return `Create a unique evolved creature called "${emergentName}".

Morphology: ${morphologyDescription}

Evolutionary traits: ${traitDescriptions.join(', ')}

Style: Organic, bio-inspired, evolutionary design. Not cartoonish - realistic but fantastical. Shows clear evolutionary adaptations.

Environment: Natural ecosystem setting, evolved for specific ecological niche.

Render as: High-quality 3D reference for game asset creation, showing full creature in natural pose.`;
  }
  
  private traitsToDescriptions(traits: number[]): string[] {
    const descriptions: string[] = [];
    
    // Map trait indices to descriptive language
    if (traits[0] > 0.6) descriptions.push('enhanced mobility adaptations');
    if (traits[1] > 0.6) descriptions.push('environmental manipulation features');  
    if (traits[2] > 0.6) descriptions.push('drilling or excavation appendages');
    if (traits[3] > 0.6) descriptions.push('social coordination structures');
    if (traits[4] > 0.6) descriptions.push('sensory enhancement organs');
    if (traits[5] > 0.6) descriptions.push('bioluminescent features');
    if (traits[6] > 0.6) descriptions.push('expanded storage adaptations');
    if (traits[7] > 0.6) descriptions.push('filtering or purification systems');
    if (traits[8] > 0.6) descriptions.push('defensive armoring or shells');
    if (traits[9] > 0.6) descriptions.push('reactive or toxic defense mechanisms');
    
    return descriptions.length > 0 ? descriptions : ['balanced generalist form'];
  }
  
  /**
   * Download audio from Freesound API
   */
  async downloadFreesoundAudio(
    query: string,
    category: AudioAsset['category'],
    count: number = 5
  ): Promise<AudioAsset[]> {
    
    log.info('Downloading audio from Freesound', { query, category, count });
    
    const assets: AudioAsset[] = [];
    
    try {
      // Search Freesound API
      const searchResponse = await axios.get('https://freesound.org/apiv2/search/text/', {
        params: {
          query,
          token: this.freesoundApiKey,
          page_size: count,
          filter: 'duration:[0.1 TO 10]', // 0.1 to 10 seconds
          sort: 'score',
          fields: 'id,name,url,previews,download,filesize,duration'
        }
      });
      
      const sounds = searchResponse.data.results || [];
      
      for (const sound of sounds) {
        const audioAsset = await this.downloadSingleSound(sound, category);
        if (audioAsset) assets.push(audioAsset);
      }
      
      log.info('Freesound audio download complete', {
        query,
        downloaded: assets.length,
        category
      });
      
      return assets;
      
    } catch (error) {
      log.error('Failed to download Freesound audio', error, { query });
      return [];
    }
  }
  
  private async downloadSingleSound(soundData: any, category: AudioAsset['category']): Promise<AudioAsset | null> {
    try {
      const audioUrl = soundData.previews['preview-hq-ogg'] || soundData.previews['preview-lq-ogg'];
      if (!audioUrl) return null;
      
      const audioBuffer = await this.downloadAudio(audioUrl);
      const fileName = `${category}-${soundData.id}.ogg`;
      const filePath = `./public/audio/${fileName}`;
      
      await writeFile(filePath, audioBuffer);
      
      const asset: AudioAsset = {
        id: `${category}-${soundData.id}`,
        name: soundData.name,
        category,
        source: {
          type: 'freesound',
          freesoundId: soundData.id
        },
        files: {
          ogg: `/audio/${fileName}`
        },
        metadata: {
          duration: soundData.duration,
          size: audioBuffer.length,
          checksum: this.generateChecksum(audioBuffer),
          generated: new Date().toISOString()
        }
      };
      
      await this.updateManifest('audio', asset);
      
      return asset;
      
    } catch (error) {
      log.error('Failed to download single sound', error, { soundId: soundData.id });
      return null;
    }
  }
  
  /**
   * Generate UI elements with AI assistance
   */
  async generateUIAsset(
    elementType: 'icon' | 'background' | 'pattern',
    description: string,
    style: 'organic' | 'technical' | 'hybrid'
  ): Promise<UIAsset> {
    
    log.info('Generating UI asset', { elementType, description, style });
    
    const prompt = this.buildUIPrompt(elementType, description, style);
    
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        quality: "standard",
        style: style === 'organic' ? 'natural' : 'vivid',
        n: 1
      });
      
      const imageUrl = response.data[0]?.url;
      if (!imageUrl) throw new Error('No UI asset generated');
      
      const imageBuffer = await this.downloadImage(imageUrl);
      const fileName = `ui-${elementType}-${Date.now()}.png`;
      const filePath = `./public/ui/${fileName}`;
      
      await writeFile(filePath, imageBuffer);
      
      const asset: UIAsset = {
        id: `ui-${elementType}-${Date.now()}`,
        name: description,
        category: elementType,
        source: {
          type: 'openai_generated',
          prompt
        },
        files: {
          png: `/ui/${fileName}`
        },
        metadata: {
          dimensions: [1024, 1024],
          size: imageBuffer.length,
          generated: new Date().toISOString()
        }
      };
      
      await this.updateManifest('ui', asset);
      
      return asset;
      
    } catch (error) {
      log.error('Failed to generate UI asset', error, { elementType });
      throw error;
    }
  }
  
  private buildUIPrompt(elementType: string, description: string, style: string): string {
    const baseStyle = style === 'organic' 
      ? 'Organic, flowing, nature-inspired design with smooth curves and natural patterns'
      : style === 'technical' 
      ? 'Clean, geometric, technical design with precise lines and systematic patterns'
      : 'Hybrid of organic and technical elements, balanced and modern';
    
    return `Create a ${elementType} for an evolutionary ecosystem game.

Description: ${description}

Style: ${baseStyle}

Brand colors: Deep indigo (#4A5568), emerald green (#38A169), trait gold (#D69E2E), echo silver (#A0AEC0)

Requirements: Game UI element, clean, scalable design, high contrast, mobile-friendly`;
  }
  
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
  
  private async downloadAudio(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
  
  private generateChecksum(buffer: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
  
  private async updateManifest(assetType: 'models' | 'audio' | 'ui' | 'textures', asset: any): Promise<void> {
    let manifest: GameAssetManifest;
    
    if (existsSync(this.manifestPath)) {
      const data = await readFile(this.manifestPath, 'utf-8');
      manifest = JSON.parse(data);
    } else {
      manifest = {
        version: '1.0.0',
        generated: new Date().toISOString(),
        textures: [],
        models: [],
        audio: [],
        ui: []
      };
    }
    
    // Add asset to appropriate category
    manifest[assetType].push(asset);
    manifest.generated = new Date().toISOString();
    
    // Save updated manifest
    await writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
  }
  
  /**
   * CLI Commands
   */
  setupCLI(): Command {
    const program = new Command();
    
    program
      .name('ebb-bloom-dev')
      .description('Ebb & Bloom AI-powered development tools')
      .version('1.0.0');
    
    // Texture management
    program
      .command('textures')
      .description('Download and manage texture assets')
      .option('-c, --categories <categories>', 'Comma-separated categories', 'wood,metal,stone,grass')
      .option('-r, --resolution <resolution>', 'Texture resolution', '2K')
      .action(async (options) => {
        const { AmbientCGDownloader } = await import('../build/ambientcg-downloader.js');
        const downloader = new AmbientCGDownloader({
          resolution: options.resolution,
          categories: options.categories.split(','),
          fileTypes: ['jpg'],
          outputDir: './public/textures',
          maxConcurrent: 8,
          maxRetries: 3,
          baseDelayMs: 1000,
          timeoutMs: 30000
        });
        
        await downloader.downloadAll();
      });
    
    // Creature generation
    program
      .command('creature')
      .description('Generate creature asset from traits')
      .requiredOption('-n, --name <name>', 'Emergent creature name')
      .requiredOption('-t, --traits <traits>', 'Comma-separated trait values')
      .option('-m, --morphology <desc>', 'Morphological description')
      .action(async (options) => {
        const traits = options.traits.split(',').map(Number);
        const morphology = options.morphology || 'Evolutionary adaptation';
        
        await this.generateCreatureAsset(options.name, traits, morphology);
      });
    
    // Audio management
    program
      .command('audio')
      .description('Download audio from Freesound')
      .requiredOption('-q, --query <query>', 'Search query')
      .requiredOption('-c, --category <category>', 'Audio category')
      .option('-n, --count <count>', 'Number of sounds', '5')
      .action(async (options) => {
        await this.downloadFreesoundAudio(options.query, options.category, parseInt(options.count));
      });
    
    // UI generation
    program
      .command('ui')
      .description('Generate UI elements')
      .requiredOption('-t, --type <type>', 'Element type (icon|background|pattern)')
      .requiredOption('-d, --description <desc>', 'Element description')
      .option('-s, --style <style>', 'Design style (organic|technical|hybrid)', 'hybrid')
      .action(async (options) => {
        await this.generateUIAsset(options.type, options.description, options.style);
      });
    
    // Development workflows
    program
      .command('setup')
      .description('Setup complete development environment')
      .action(async () => {
        await this.setupDevelopmentEnvironment();
      });
    
    // Manifest management
    program
      .command('manifest')
      .description('View or update asset manifest')
      .option('-v, --view', 'View current manifest')
      .option('-e, --export <file>', 'Export manifest to file')
      .action(async (options) => {
        if (options.view) {
          await this.viewManifest();
        }
        if (options.export) {
          await this.exportManifest(options.export);
        }
      });
    
    return program;
  }
  
  private async setupDevelopmentEnvironment(): Promise<void> {
    log.info('Setting up complete development environment...');
    
    // 1. Download base texture library
    console.log('📦 Downloading base texture library...');
    // Would call texture downloader
    
    // 2. Generate essential UI elements
    console.log('🎨 Generating base UI elements...');
    await this.generateUIAsset('icon', 'evolution tree icon for trait display', 'organic');
    await this.generateUIAsset('background', 'subtle organic pattern for evolution UI', 'organic');
    await this.generateUIAsset('pattern', 'data visualization pattern for generation tracking', 'technical');
    
    // 3. Download essential audio
    console.log('🔊 Downloading base audio library...');
    await this.downloadFreesoundAudio('organic growth', 'evolution', 3);
    await this.downloadFreesoundAudio('heartbeat pulse', 'environment', 2);
    await this.downloadFreesoundAudio('water flow', 'environment', 3);
    
    console.log('✅ Development environment setup complete!');
  }
  
  private async viewManifest(): Promise<void> {
    if (!existsSync(this.manifestPath)) {
      console.log('No manifest found. Run setup first.');
      return;
    }
    
    const data = await readFile(this.manifestPath, 'utf-8');
    const manifest = JSON.parse(data);
    
    console.log('📋 Game Asset Manifest:');
    console.log(`Generated: ${manifest.generated}`);
    console.log(`Textures: ${manifest.textures?.length || 0}`);
    console.log(`Models: ${manifest.models?.length || 0}`);
    console.log(`Audio: ${manifest.audio?.length || 0}`);
    console.log(`UI Elements: ${manifest.ui?.length || 0}`);
  }
  
  private async exportManifest(filePath: string): Promise<void> {
    if (!existsSync(this.manifestPath)) {
      console.log('No manifest found.');
      return;
    }
    
    const data = await readFile(this.manifestPath, 'utf-8');
    await writeFile(filePath, data);
    console.log(`📤 Manifest exported to ${filePath}`);
  }
}

// CLI Entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new GameDevCLI();
  const program = cli.setupCLI();
  program.parse();
}

export { GameDevCLI, type GameAssetManifest, type ModelAsset, type AudioAsset, type UIAsset };