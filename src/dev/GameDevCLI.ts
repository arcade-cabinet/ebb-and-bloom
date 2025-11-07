/**
 * Game Development CLI - AI-powered manifest-driven asset pipeline
 * Integrates texture downloader, OpenAI image generation, Freesound audio, and dev workflows
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import axios from 'axios';
import { Command } from 'commander';
import { createHash } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { OpenAI } from 'openai';
import { AI_MODELS } from '../config/ai-models';
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
  category: 'icon' | 'background' | 'pattern' | 'gradient' | 'splash' | 'panel' | 'transparent';
  source: {
    type: 'openai_generated' | 'css_generated' | 'manual';
    prompt?: string;
    cssProperties?: Record<string, string>;
  };
  files: {
    svg?: string;
    png?: string;
    webp?: string;
    css?: string;
  };
  metadata: {
    dimensions?: [number, number];
    size: number;
    generated: string;
    transparent?: boolean;
    fullScreen?: boolean;
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
  ): Promise<ModelAsset | null> {

    // IDEMPOTENCY: Check if creature asset already exists
    const creatureId = emergentName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const expectedFileName = `creature-${creatureId}.png`;
    const expectedPath = `./public/models/${expectedFileName}`;

    if (existsSync(expectedPath)) {
      log.info('Creature asset already exists, skipping generation', { emergentName, path: expectedPath });

      const manifest = await this.loadManifest();
      const existingAsset = manifest.models?.find((m: ModelAsset) =>
        m.id === `creature-${emergentName}` || m.id.includes(creatureId)
      );

      if (existingAsset) {
        return existingAsset;
      }

      return null;
    }

    log.info('Generating creature asset with OpenAI', {
      emergentName,
      traits: traits.slice(0, 5),
      morphologyDescription
    });

    const prompt = this.buildCreaturePrompt(emergentName, traits, morphologyDescription);

    try {
      // Generate with model from constants
      const result = await generateImage({
        model: openai.image(AI_MODELS.IMAGE_GENERATION),
        prompt,
        size: "1024x1024",
        providerOptions: {
          openai: { quality: 'hd' }
        }
      });

      // Result structure: { image: { url: string } }
      const imageUrl = typeof result.image === 'string' ? result.image : result.image.url;
      if (!imageUrl) throw new Error('No image generated');

      // Download and save (IDEMPOTENT: check exists first)
      const imageBuffer = await this.downloadImage(imageUrl);
      const fileName = `creature-${emergentName}.png`;
      const filePath = `./public/models/${fileName}`;

      // IDEMPOTENCY: Only write if doesn't exist
      if (!existsSync(filePath)) {
        await writeFile(filePath, imageBuffer);
      } else {
        log.info('Creature file already exists, skipping write', { filePath });
      }

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

      // IDEMPOTENCY: Only update manifest if not present
      const manifest = await this.loadManifest();
      const existingIndex = manifest.models?.findIndex((m: ModelAsset) => m.id === asset.id);

      if (existingIndex === undefined || existingIndex === -1) {
        await this.updateManifest('models', asset);
      } else {
        log.info('Creature asset already in manifest, skipping update', { id: asset.id });
      }

      log.info('Creature asset processed successfully', {
        emergentName,
        filePath,
        size: imageBuffer.length,
        id: asset.id
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
   * Download audio from Freesound API using modern FreesoundClient
   */
  async downloadFreesoundAudio(
    query: string,
    category: AudioAsset['category'],
    count: number = 5,
    usage?: { contexts: string[]; volume?: number; loop?: boolean; fadeIn?: number; fadeOut?: number }
  ): Promise<AudioAsset[]> {

    log.info('Downloading audio from Freesound', { query, category, count });

    if (!this.freesoundApiKey) {
      log.warn('FREESOUND_API_KEY not set, skipping audio download');
      return [];
    }

    try {
      // Use modern FreesoundClient
      const { FreesoundClient } = await import('../utils/FreesoundClient.js');
      const client = new FreesoundClient({ apiKey: this.freesoundApiKey });

      // Search and get manifest entries
      const manifestEntries = await client.searchForManifest(query, category, count, usage);

      const assets: AudioAsset[] = [];

      for (const entry of manifestEntries) {
        // Get full sound details to download
        const sound = await client.getSound(entry.source.freesoundId!);
        const audioAsset = await this.downloadSingleSound(sound, category, entry);
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

  private async downloadSingleSound(
    soundData: any,
    category: AudioAsset['category'],
    manifestEntry?: { usage?: { contexts?: string[]; volume?: number; loop?: boolean; fadeIn?: number; fadeOut?: number } }
  ): Promise<AudioAsset | null> {
    try {
      // Use FreesoundClient to get preview URL
      const { FreesoundClient } = await import('../utils/FreesoundClient.js');
      const client = new FreesoundClient({ apiKey: this.freesoundApiKey });

      const audioUrl = client.getPreviewUrl(soundData, 'hq', 'ogg') ||
        client.getPreviewUrl(soundData, 'hq', 'mp3') ||
        client.getPreviewUrl(soundData, 'lq', 'ogg') ||
        client.getPreviewUrl(soundData, 'lq', 'mp3');

      if (!audioUrl) return null;

      const audioBuffer = await this.downloadAudio(audioUrl);
      const fileExtension = audioUrl.split('.').pop()?.split('?')[0] || 'ogg';
      const fileName = `${category}-${soundData.id}.${fileExtension}`;
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
          [fileExtension]: `/audio/${fileName}`
        },
        metadata: {
          duration: soundData.duration,
          size: audioBuffer.length,
          checksum: this.generateChecksum(audioBuffer),
          generated: new Date().toISOString()
        }
      };

      await this.updateManifest('audio', asset);

      // Also update audio manifest if usage context provided
      if (manifestEntry?.usage) {
        const { AudioManifestManager } = await import('../utils/FreesoundClient.js');
        const audioManifest = new AudioManifestManager('./public/assets/audio-manifest.json');
        await audioManifest.addEntry({
          ...asset,
          usage: manifestEntry.usage
        });
      }

      return asset;

    } catch (error) {
      log.error('Failed to download single sound', error, { soundId: soundData.id });
      return null;
    }
  }

  /**
   * Generate UI elements with AI assistance
   */
  private async loadManifest(): Promise<GameAssetManifest> {
    if (existsSync(this.manifestPath)) {
      const data = await readFile(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    }
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      textures: [],
      models: [],
      audio: [],
      ui: []
    };
  }

  async generateUIAsset(
    elementType: 'icon' | 'background' | 'pattern' | 'splash' | 'panel' | 'transparent',
    description: string,
    style: 'organic' | 'technical' | 'hybrid',
    options?: {
      dimensions?: [number, number];
      transparent?: boolean;
      fullScreen?: boolean;
    }
  ): Promise<UIAsset> {

    log.info('Generating UI asset', { elementType, description, style, options });

    const dimensions = options?.dimensions || (elementType === 'splash' ? [1080, 1920] : [1024, 1024]);
    const prompt = this.buildUIPrompt(elementType, description, style, options);

    // IDEMPOTENCY: Generate deterministic file name based on content
    const contentHash = this.generateChecksum(Buffer.from(`${elementType}-${description}-${style}-${dimensions.join('x')}`)).substring(0, 8);
    const fileName = `${elementType}-${contentHash}.png`;

    // Determine output directory
    let outputDir = './public/ui';
    if (elementType === 'splash') {
      outputDir = './public/splash';
    } else if (elementType === 'panel') {
      outputDir = './public/ui/panels';
    } else if (elementType === 'transparent') {
      outputDir = './public/ui/elements';
    } else if (elementType === 'background') {
      outputDir = './public/ui/backgrounds';
    }

    const filePath = `${outputDir}/${fileName}`;

    // IDEMPOTENCY: Check if file already exists
    if (existsSync(filePath)) {
      log.info('UI asset already exists, loading from manifest', { filePath });

      const manifest = await this.loadManifest();
      const existingAsset = manifest.ui?.find((u: UIAsset) =>
        u.files.png?.includes(fileName) || u.files.png?.includes(contentHash)
      );

      if (existingAsset) {
        return existingAsset;
      }

      // File exists but not in manifest - add it
      const stats = await import('fs/promises').then(fs => fs.stat(filePath));
      const asset: UIAsset = {
        id: `${elementType}-${contentHash}`,
        name: description,
        category: elementType,
        source: {
          type: 'openai_generated',
          prompt
        },
        files: {
          png: filePath.replace('./public', '')
        },
        metadata: {
          dimensions,
          size: stats.size,
          generated: stats.mtime.toISOString(),
          transparent: options?.transparent || false,
          fullScreen: options?.fullScreen || elementType === 'splash'
        }
      };

      await this.updateManifest('ui', asset);
      return asset;
    }

    try {
      // Determine image size based on dimensions
      // Note: AI_MODELS.IMAGE_GENERATION supports: 1024x1024, 1024x1536, 1536x1024
      let imageSize: "1024x1024" | "1536x1024" | "1024x1536" = "1024x1024";
      if (dimensions[0] > dimensions[1]) {
        imageSize = "1536x1024"; // Landscape
      } else if (dimensions[1] > dimensions[0]) {
        imageSize = "1024x1536"; // Portrait
      }

      // Generate with model from constants
      const result = await generateImage({
        model: openai.image(AI_MODELS.IMAGE_GENERATION),
        prompt,
        size: imageSize,
        providerOptions: {
          openai: {
            quality: 'hd'
          }
        }
      });

      // Handle different response formats from AI SDK
      let rawImageBuffer: Buffer;

      if (!result.image) {
        log.error('No image in result', { result: JSON.stringify(result, null, 2).substring(0, 500) });
        throw new Error('No UI asset generated - no image in response');
      }

      if (typeof result.image === 'string') {
        // Direct URL string
        rawImageBuffer = await this.downloadImage(result.image);
      } else if (typeof result.image === 'object') {
        // Object with various possible formats
        const imageObj = result.image as any;

        // AI SDK format: base64Data, uint8ArrayData, mediaType
        if (imageObj.base64Data) {
          rawImageBuffer = Buffer.from(imageObj.base64Data, 'base64');
        } else if (imageObj.uint8ArrayData) {
          rawImageBuffer = Buffer.from(imageObj.uint8ArrayData);
        } else if (imageObj.b64_json) {
          // OpenAI b64_json format
          rawImageBuffer = Buffer.from(imageObj.b64_json, 'base64');
        } else if (imageObj.url || imageObj.imageUrl) {
          // URL format
          rawImageBuffer = await this.downloadImage(imageObj.url || imageObj.imageUrl);
        } else {
          log.error('Could not extract image from result object', {
            keys: Object.keys(imageObj),
            result: JSON.stringify(result, null, 2).substring(0, 500)
          });
          throw new Error('No UI asset generated - unknown image format');
        }
      } else {
        log.error('Unexpected image type', { imageType: typeof result.image });
        throw new Error('No UI asset generated - unexpected image type');
      }

      // POST-PROCESS: Resize to actual target dimensions and verify transparency
      // This ensures assets match expectedSize from asset-manifest.ts
      const sharp = (await import('sharp')).default;
      let processedImage = sharp(rawImageBuffer);

      // Resize to actual target dimensions (not the 1024+ size from AI_MODELS.IMAGE_GENERATION)
      const [targetWidth, targetHeight] = dimensions;
      processedImage = processedImage.resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: options?.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 }
      });

      // Ensure PNG format with proper transparency
      processedImage = processedImage.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        force: true
      });

      const imageBuffer = await processedImage.toBuffer();

      // Verify transparency if requested
      if (options?.transparent) {
        const metadata = await sharp(imageBuffer).metadata();
        if (!metadata.hasAlpha) {
          log.warn('Transparency verification failed - no alpha channel', { filePath });
        }
      }

      // Ensure directory exists
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if (!existsSync(dirPath)) {
        await mkdirSync(dirPath, { recursive: true });
      }

      // IDEMPOTENCY: Only write if file doesn't exist
      if (!existsSync(filePath)) {
        await writeFile(filePath, imageBuffer);
      } else {
        log.info('File already exists, skipping write', { filePath });
      }

      const asset: UIAsset = {
        id: `${elementType}-${contentHash}`,
        name: description,
        category: elementType,
        source: {
          type: 'openai_generated',
          prompt
        },
        files: {
          png: filePath.replace('./public', '')
        },
        metadata: {
          dimensions,
          size: imageBuffer.length,
          generated: new Date().toISOString(),
          transparent: options?.transparent || false,
          fullScreen: options?.fullScreen || elementType === 'splash'
        }
      };

      // IDEMPOTENCY: Only update manifest if asset not already present
      const manifest = await this.loadManifest();
      const existingIndex = manifest.ui?.findIndex((u: UIAsset) => u.id === asset.id);

      if (existingIndex === undefined || existingIndex === -1) {
        await this.updateManifest('ui', asset);
      } else {
        log.info('Asset already in manifest, skipping update', { id: asset.id });
      }

      log.info('UI asset processed successfully', {
        elementType,
        filePath,
        dimensions,
        size: imageBuffer.length,
        id: asset.id
      });

      return asset;

    } catch (error) {
      log.error('Failed to generate UI asset', error, { elementType });
      throw error;
    }
  }

  /**
   * Generate splash screen images (full-screen portrait)
   */
  async generateSplashScreen(
    variant: number,
    playstyle?: 'harmony' | 'conquest' | 'frolick' | 'neutral'
  ): Promise<UIAsset | null> {
    // IDEMPOTENCY: Check if splash screen already exists
    const expectedFileName = `splash-${variant}-${playstyle || 'neutral'}.png`;
    const expectedPath = `./public/splash/${expectedFileName}`;

    if (existsSync(expectedPath)) {
      log.info('Splash screen already exists, skipping generation', { variant, playstyle, path: expectedPath });

      // Load existing asset from manifest
      const manifest = await this.loadManifest();
      const existingAsset = manifest.ui?.find((u: UIAsset) =>
        u.files.png?.includes(expectedFileName) || u.id.includes(`splash-${variant}`)
      );

      if (existingAsset) {
        return existingAsset;
      }

      // Return null if exists but not in manifest (will be added on next run)
      return null;
    }

    const descriptions = {
      harmony: 'Serene, flowing evolutionary ecosystem with blues and greens, peaceful creatures, symbiotic relationships, organic growth patterns',
      conquest: 'Dynamic, intense evolutionary ecosystem with reds and oranges, competitive creatures, territorial displays, aggressive adaptations',
      frolick: 'Playful, whimsical evolutionary ecosystem with rainbow and pastel colors, curious creatures, exploratory behaviors, joyful mutations',
      neutral: 'Balanced evolutionary ecosystem showing diverse creatures, varied environments, neutral tones with brand colors, evolutionary progression'
    };

    const description = descriptions[playstyle || 'neutral'];

    return this.generateUIAsset(
      'splash',
      `Splash screen variant ${variant}: ${description}`,
      playstyle === 'harmony' ? 'organic' : playstyle === 'conquest' ? 'technical' : 'hybrid',
      {
        dimensions: [1080, 1920], // Portrait mobile
        fullScreen: true
      }
    );
  }

  /**
   * Generate transparent PNG elements (icons, UI elements)
   */
  async generateTransparentElement(
    description: string,
    size: number = 512
  ): Promise<UIAsset | null> {
    // IDEMPOTENCY: Check if element already exists
    const elementId = description.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const expectedFileName = `element-${elementId}-${size}.png`;
    const expectedPath = `./public/ui/elements/${expectedFileName}`;

    if (existsSync(expectedPath)) {
      log.info('Transparent element already exists, skipping generation', { description, size, path: expectedPath });

      const manifest = await this.loadManifest();
      const existingAsset = manifest.ui?.find((u: UIAsset) =>
        u.files.png?.includes(elementId) || u.id.includes(elementId)
      );

      if (existingAsset) {
        return existingAsset;
      }

      return null;
    }

    return this.generateUIAsset(
      'transparent',
      `${description}. Transparent background, clean edges, suitable for overlay on any background`,
      'hybrid',
      {
        dimensions: [size, size],
        transparent: true
      }
    );
  }

  /**
   * Generate panel images (UI backgrounds, containers)
   */
  async generatePanelImage(
    description: string,
    dimensions: [number, number] = [1024, 768]
  ): Promise<UIAsset | null> {
    // IDEMPOTENCY: Check if panel already exists
    const panelId = description.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const expectedFileName = `panel-${panelId}-${dimensions[0]}x${dimensions[1]}.png`;
    const expectedPath = `./public/ui/panels/${expectedFileName}`;

    if (existsSync(expectedPath)) {
      log.info('Panel image already exists, skipping generation', { description, dimensions, path: expectedPath });

      const manifest = await this.loadManifest();
      const existingAsset = manifest.ui?.find((u: UIAsset) =>
        u.files.png?.includes(panelId) || u.id.includes(panelId)
      );

      if (existingAsset) {
        return existingAsset;
      }

      return null;
    }

    return this.generateUIAsset(
      'panel',
      `UI panel background: ${description}. Subtle texture, suitable for content overlay, mobile-friendly`,
      'hybrid',
      {
        dimensions,
        transparent: false
      }
    );
  }

  /**
   * Generate full-screen background images
   */
  async generateBackgroundImage(
    description: string,
    dimensions: [number, number] = [1920, 1080]
  ): Promise<UIAsset | null> {
    // IDEMPOTENCY: Check if background already exists
    const bgId = description.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const expectedFileName = `background-${bgId}-${dimensions[0]}x${dimensions[1]}.png`;
    const expectedPath = `./public/ui/backgrounds/${expectedFileName}`;

    if (existsSync(expectedPath)) {
      log.info('Background image already exists, skipping generation', { description, dimensions, path: expectedPath });

      const manifest = await this.loadManifest();
      const existingAsset = manifest.ui?.find((u: UIAsset) =>
        u.files.png?.includes(bgId) || u.id.includes(bgId)
      );

      if (existingAsset) {
        return existingAsset;
      }

      return null;
    }

    return this.generateUIAsset(
      'background',
      `Full-screen background: ${description}. Atmospheric, non-distracting, suitable for UI overlay`,
      'organic',
      {
        dimensions,
        fullScreen: true
      }
    );
  }

  private buildUIPrompt(
    elementType: string,
    description: string,
    style: string,
    options?: {
      dimensions?: [number, number];
      transparent?: boolean;
      fullScreen?: boolean;
    }
  ): string {
    const baseStyle = style === 'organic'
      ? 'Organic, flowing, nature-inspired design with smooth curves and natural patterns'
      : style === 'technical'
        ? 'Clean, geometric, technical design with precise lines and systematic patterns'
        : 'Hybrid of organic and technical elements, balanced and modern';

    let requirements = 'Game UI element, clean, scalable design, high contrast, mobile-friendly';

    if (elementType === 'splash') {
      requirements = 'Full-screen splash screen for mobile game, portrait orientation (1080x1920), atmospheric and immersive, suitable for loading screen, brand identity visible';
    } else if (elementType === 'transparent') {
      requirements = 'TRANSPARENT PNG element with COMPLETELY TRANSPARENT background (no white, no color, pure alpha channel), clean anti-aliased edges, suitable for overlay on any surface, high quality edges, PNG format with alpha channel';
    } else if (elementType === 'panel') {
      requirements = 'UI panel background, subtle texture, suitable for content overlay, non-distracting, mobile-optimized';
    } else if (elementType === 'background') {
      requirements = 'Full-screen background image, atmospheric and immersive, non-distracting, suitable for UI overlay, high quality';
    }

    const brandColors = 'Brand colors: Deep indigo (#4A5568), emerald green (#38A169), trait gold (#D69E2E), echo silver (#A0AEC0)';

    return `Create a ${elementType} for an evolutionary ecosystem game called "Ebb & Bloom".

Description: ${description}

Style: ${baseStyle}

${brandColors}

Requirements: ${requirements}

${options?.transparent ? 'CRITICAL REQUIREMENT: Image MUST have a COMPLETELY TRANSPARENT background with alpha channel. No white background, no colored background, no solid background of any kind. The image should be a PNG with transparency. All edges must be clean and anti-aliased for overlay use.' : ''}
${options?.fullScreen ? 'IMPORTANT: Full-screen image, optimized for mobile display, portrait orientation' : ''}`;
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
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async updateManifest(assetType: 'models' | 'audio' | 'ui' | 'textures', asset: any): Promise<void> {
    // IDEMPOTENCY: Load existing manifest
    const manifest = await this.loadManifest();

    // IDEMPOTENCY: Check if asset already exists (by ID)
    const existingIndex = manifest[assetType]?.findIndex((a: any) => a.id === asset.id);

    if (existingIndex !== undefined && existingIndex >= 0) {
      // Update existing asset instead of duplicating
      manifest[assetType][existingIndex] = asset;
      log.debug('Updated existing asset in manifest', { assetType, id: asset.id });
    } else {
      // Add new asset
      if (!manifest[assetType]) {
        manifest[assetType] = [];
      }
      manifest[assetType].push(asset);
      log.debug('Added new asset to manifest', { assetType, id: asset.id });
    }

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
      .requiredOption('-t, --type <type>', 'Element type (icon|background|pattern|splash|panel|transparent)')
      .requiredOption('-d, --description <desc>', 'Element description')
      .option('-s, --style <style>', 'Design style (organic|technical|hybrid)', 'hybrid')
      .option('--transparent', 'Generate with transparent background', false)
      .option('--fullscreen', 'Generate full-screen image', false)
      .option('--width <width>', 'Image width in pixels', '1024')
      .option('--height <height>', 'Image height in pixels', '1024')
      .action(async (options) => {
        await this.generateUIAsset(
          options.type,
          options.description,
          options.style,
          {
            dimensions: [parseInt(options.width), parseInt(options.height)],
            transparent: options.transparent,
            fullScreen: options.fullscreen
          }
        );
      });

    // Splash screen generation
    program
      .command('splash')
      .description('Generate splash screen images')
      .requiredOption('-v, --variant <number>', 'Splash variant number (1-4)')
      .option('-p, --playstyle <playstyle>', 'Playstyle theme (harmony|conquest|frolick|neutral)', 'neutral')
      .action(async (options) => {
        await this.generateSplashScreen(parseInt(options.variant), options.playstyle);
      });

    // Transparent element generation
    program
      .command('transparent')
      .description('Generate transparent PNG elements')
      .requiredOption('-d, --description <desc>', 'Element description')
      .option('-s, --size <size>', 'Image size in pixels (square)', '512')
      .action(async (options) => {
        await this.generateTransparentElement(options.description, parseInt(options.size));
      });

    // Panel image generation
    program
      .command('panel')
      .description('Generate UI panel images')
      .requiredOption('-d, --description <desc>', 'Panel description')
      .option('--width <width>', 'Panel width', '1024')
      .option('--height <height>', 'Panel height', '768')
      .action(async (options) => {
        await this.generatePanelImage(
          options.description,
          [parseInt(options.width), parseInt(options.height)]
        );
      });

    // Background image generation
    program
      .command('background')
      .description('Generate full-screen background images')
      .requiredOption('-d, --description <desc>', 'Background description')
      .option('--width <width>', 'Background width', '1920')
      .option('--height <height>', 'Background height', '1080')
      .action(async (options) => {
        await this.generateBackgroundImage(
          options.description,
          [parseInt(options.width), parseInt(options.height)]
        );
      });

    // Batch generation for all required assets
    program
      .command('generate-all')
      .description('Generate all required PNG assets (splash screens, backgrounds, panels, transparent elements)')
      .action(async () => {
        await this.generateAllRequiredAssets();
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
    log.info('Downloading base texture library...');
    // Would call texture downloader

    // 2. Generate essential UI elements
    log.info('Generating base UI elements...');
    await this.generateUIAsset('icon', 'evolution tree icon for trait display', 'organic');
    await this.generateUIAsset('background', 'subtle organic pattern for evolution UI', 'organic');
    await this.generateUIAsset('pattern', 'data visualization pattern for generation tracking', 'technical');

    // 3. Download essential audio
    log.info('Downloading base audio library...');
    await this.downloadFreesoundAudio('organic growth', 'evolution', 3);
    await this.downloadFreesoundAudio('heartbeat pulse', 'environment', 2);
    await this.downloadFreesoundAudio('water flow', 'environment', 3);

    log.info('Development environment setup complete');
  }

  /**
   * Generate all required PNG assets for the game
   * Uses asset-manifest.ts as source of truth for all asset definitions
   */
  async generateAllRequiredAssets(): Promise<void> {
    log.info('Generating all required PNG assets - IDEMPOTENT MODE (using asset-manifest.ts)');

    // Import asset manifest
    const { ASSET_MANIFEST, getGeneratableAssets } = await import('./asset-manifest');
    const generatableAssets = getGeneratableAssets();

    let generated = 0;
    let skipped = 0;

    try {
      // Generate all assets from manifest, sorted by priority
      const priorityOrder = ['critical', 'high', 'medium', 'low'];
      const sortedAssets = generatableAssets.sort((a, b) => {
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      });

      log.info('Found generatable assets in manifest', { count: sortedAssets.length });

      for (const assetDef of sortedAssets) {
        log.info('Processing asset from manifest', {
          id: assetDef.id,
          category: assetDef.category,
          priority: assetDef.priority
        });

        try {
          // Use asset manifest definition for generation
          const result = await this.generateUIAsset(
            assetDef.category === 'splash' ? 'splash' :
              assetDef.category === 'panel' ? 'panel' :
                assetDef.category === 'icon' ? 'transparent' :
                  assetDef.category === 'button' ? 'transparent' :
                    'transparent',
            assetDef.aiPrompt || assetDef.description,
            'hybrid', // Default style, can be enhanced
            {
              dimensions: [assetDef.expectedSize.width, assetDef.expectedSize.height],
              transparent: assetDef.requiresTransparency
            }
          );

          if (result) {
            generated++;
            log.info('Asset generated successfully', { id: assetDef.id });
          } else {
            skipped++;
            log.info('Asset skipped (already exists)', { id: assetDef.id });
          }

          await this.delay(2000); // Rate limiting

        } catch (error) {
          log.error('Failed to generate asset from manifest', error, { assetId: assetDef.id });
          // Continue with next asset
        }
      }

      log.info('Asset generation complete', { generated, skipped, total: sortedAssets.length });
      log.info('Complete asset generation finished - IDEMPOTENT', {
        generated,
        skipped,
        total: generated + skipped,
        manifestAssets: sortedAssets.length
      });

    } catch (error) {
      log.error('Failed to generate all assets', error);
      throw error;
    }
  }

  private async viewManifest(): Promise<void> {
    if (!existsSync(this.manifestPath)) {
      log.warn('No manifest found. Run setup first.');
      return;
    }

    const data = await readFile(this.manifestPath, 'utf-8');
    const manifest = JSON.parse(data);

    log.info('Game Asset Manifest', {
      generated: manifest.generated,
      textures: manifest.textures?.length || 0,
      models: manifest.models?.length || 0,
      audio: manifest.audio?.length || 0,
      ui: manifest.ui?.length || 0
    });
  }

  private async exportManifest(filePath: string): Promise<void> {
    if (!existsSync(this.manifestPath)) {
      log.warn('No manifest found.');
      return;
    }

    const data = await readFile(this.manifestPath, 'utf-8');
    await writeFile(filePath, data);
    log.info('Manifest exported', { filePath });
  }
}

// CLI Entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new GameDevCLI();
  const program = cli.setupCLI();
  program.parse();
}

export { GameDevCLI, type AudioAsset, type GameAssetManifest, type ModelAsset, type UIAsset };
