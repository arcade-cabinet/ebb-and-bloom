/**
 * UI Asset Generator - Generates UI assets for Ebb & Bloom frontend
 * Uses GPT-image-1 to create brand-aligned UI elements
 */

import { experimental_generateImage as generateImage } from 'ai';
import { readFile, writeFile, stat } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_MODEL } from '../config/ai-models';

// Simple console logging
const log = {
  info: (...args: any[]) => console.log('[UI-ASSETS]', ...args),
  error: (...args: any[]) => console.error('[UI-ASSETS ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[UI-ASSETS WARN]', ...args),
};

interface UIAssetManifest {
  version: string;
  description: string;
  brandColors: Record<string, string>;
  assets: Array<{
    id: string;
    category: string;
    name: string;
    description: string;
    path: string;
    expectedSize: { width: number; height: number };
    expectedFormat: string;
    maxFileSizeKB: number;
    requiresTransparency: boolean;
    aiPrompt: string;
    canBeGenerated: boolean;
    priority: string;
  }>;
}

/**
 * Generate UI assets for the Ebb & Bloom frontend
 */
export async function generateUIAssets(): Promise<void> {
  log.info('Starting UI asset generation...');

  try {
    // Load UI assets manifest
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const manifestPath = join(__dirname, '../../data/manifests/ui-assets.json');
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest: UIAssetManifest = JSON.parse(manifestContent);

    log.info('Loaded UI assets manifest', {
      version: manifest.version,
      totalAssets: manifest.assets.length,
      categories: [...new Set(manifest.assets.map(a => a.category))]
    });

    // Sort by priority (critical first)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedAssets = manifest.assets
      .filter(asset => asset.canBeGenerated)
      .sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    log.info('Generating assets in priority order', {
      critical: sortedAssets.filter(a => a.priority === 'critical').length,
      high: sortedAssets.filter(a => a.priority === 'high').length,
      medium: sortedAssets.filter(a => a.priority === 'medium').length
    });

    // Generate each asset
    for (const asset of sortedAssets) {
      await generateUIAsset(asset, manifest.brandColors);
      log.info(`Generated ${asset.id}`);

      // Small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log.info('UI asset generation complete');

  } catch (error) {
    log.error('Failed to generate UI assets', error);
    throw error;
  }
}

/**
 * Generate a single UI asset
 */
async function generateUIAsset(
  asset: UIAssetManifest['assets'][0],
  brandColors: Record<string, string>
): Promise<void> {

  // Check if asset already exists and is compliant
  const __dirname_local = dirname(fileURLToPath(import.meta.url));
  // Use WebP for all images (better compression, supports transparency)
  const outputPath = join(__dirname_local, '../../../game/public', asset.path.replace(/\.png$/, '.webp'));
  
  if (existsSync(outputPath)) {
    const stats = await stat(outputPath);
    const sharp = (await import('sharp')).default;
    
    try {
      // Check compliance of existing image
      const metadata = await sharp(outputPath).metadata();
      const sizeKB = stats.size / 1024;
      
      // Check if image is compliant (including format - must be WebP)
      const isCompliant = 
        metadata.format === 'webp' && // Must be WebP format
        metadata.width === asset.expectedSize.width &&
        metadata.height === asset.expectedSize.height &&
        sizeKB <= asset.maxFileSizeKB &&
        (!asset.requiresTransparency || metadata.hasAlpha) &&
        stats.size > 1000; // At least 1KB (not corrupted)
      
      if (isCompliant) {
        log.info(`Skipping compliant asset: ${asset.id} (${sizeKB.toFixed(1)}KB)`);
        return;
      } else {
        // Image exists but is non-compliant - fix it
        log.warn(`Existing asset ${asset.id} is non-compliant - fixing:`, {
          format: `${metadata.format || 'unknown'} (expected webp)`,
          dimensions: `${metadata.width}x${metadata.height} (expected ${asset.expectedSize.width}x${asset.expectedSize.height})`,
          size: `${sizeKB.toFixed(1)}KB (max ${asset.maxFileSizeKB}KB)`,
          hasAlpha: metadata.hasAlpha,
          requiresTransparency: asset.requiresTransparency
        });
        // Continue to regenerate/fix it
      }
    } catch (error) {
      // Image might be corrupted - regenerate
      log.warn(`Existing asset ${asset.id} appears corrupted - regenerating`);
      // Continue to regenerate
    }
  }

  log.info(`Generating UI asset: ${asset.id} (${asset.category})`);

  // Build the AI prompt with brand colors
  const enhancedPrompt = `${asset.aiPrompt}

Brand Colors (use exactly):
- Deep Indigo: ${brandColors.ebbIndigo}
- Bloom Emerald: ${brandColors.bloomEmerald}
- Trait Gold: ${brandColors.traitGold}
- Background Deep: ${brandColors.backgroundDeep}
- Accent White: ${brandColors.accentWhite}

Technical Requirements:
- Size: ${asset.expectedSize.width}x${asset.expectedSize.height} pixels
- Format: ${asset.expectedFormat}
- ${asset.requiresTransparency ? 'Transparent background' : 'Solid background'}
- Max file size: ${asset.maxFileSizeKB}KB
- Style: Organic, flowing, meditative, contemplative, evolutionary theme`;

  try {
    // Generate image with GPT-image-1
    // Map expected size to supported sizes (GPT-image-1 only supports: 1024x1024, 1024x1536, 1536x1024, auto)
    const getSupportedSize = (width: number, height: number): string => {
      const aspectRatio = width / height;

      if (aspectRatio > 1.2) {
        // Landscape
        return '1536x1024';
      } else if (aspectRatio < 0.8) {
        // Portrait
        return '1024x1536';
      } else {
        // Square-ish
        return '1024x1024';
      }
    };

    const imageSize = getSupportedSize(asset.expectedSize.width, asset.expectedSize.height);

    const result = await generateImage({
      model: IMAGE_MODEL,
      prompt: enhancedPrompt,
      size: imageSize as any,
      quality: 'hd', // High quality generation
    });

    if (!result.image) {
      throw new Error('No image generated by AI');
    }

    // Handle different response formats
    let rawImageBuffer: Buffer;
    if (typeof result.image === 'string') {
      // URL - download it
      rawImageBuffer = await downloadImage(result.image);
    } else if (result.image instanceof Uint8Array) {
      rawImageBuffer = Buffer.from(result.image);
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
        rawImageBuffer = await downloadImage(imageObj.url || imageObj.imageUrl);
      } else {
        log.error('Could not extract image from result object', {
          keys: Object.keys(imageObj),
          result: JSON.stringify(result, null, 2).substring(0, 500)
        });
        throw new Error('No UI asset generated - unknown image format');
      }
    } else {
      log.error('Unexpected image type', { imageType: typeof result.image });
      throw new Error(`Unexpected image format: ${typeof result.image}`);
    }

    // POST-PROCESS: Resize, handle transparency, and optimize
    // PRESERVE QUALITY - minimal processing
    const sharp = (await import('sharp')).default;

    const [targetWidth, targetHeight] = [asset.expectedSize.width, asset.expectedSize.height];

    // Start with raw image - preserve original quality
    let processedImage = sharp(rawImageBuffer);

    // Handle transparency FIRST on original high-res image (better quality)
    if (asset.requiresTransparency) {
      // Remove white background from original high-res image
      const transparentBuffer = await removeWhiteBackground(rawImageBuffer);
      processedImage = sharp(transparentBuffer);
    }

    // Resize AFTER transparency processing (preserves quality better)
    // Use 'cover' to fill dimensions exactly (no letterboxing/padding)
    // Use lanczos3 for best quality resampling
    processedImage = processedImage.resize(targetWidth, targetHeight, {
      fit: 'cover', // Fill exact dimensions (no padding)
      position: 'center', // Center crop if needed
      kernel: sharp.kernel.lanczos3, // Highest quality resampling
      withoutEnlargement: false, // Allow upscaling if needed
      background: asset.requiresTransparency
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : { r: 26, g: 32, b: 44, alpha: 1 } // Use brand background color
    });

    // Use WebP for all images - better compression than PNG/JPEG, supports transparency
    // WebP provides 25-35% better compression than PNG with same quality
    const totalPixels = targetWidth * targetHeight;
    
    // Adaptive quality based on image size
    let webpQuality: number;
    if (totalPixels > 1500000) {
      // Very large images (splash) - slightly lower quality for size
      webpQuality = 80;
    } else if (totalPixels > 500000) {
      // Large images (panels) - balanced quality
      webpQuality = 85;
    } else {
      // Small images (buttons, icons) - high quality
      webpQuality = 90;
    }
    
    processedImage = processedImage.webp({
      quality: webpQuality,
      effort: 6, // Compression effort (0-6, higher = better compression, slower)
      lossless: false, // Use lossy for better compression (transparency still supported)
      nearLossless: false,
      smartSubsample: true, // Better quality for same file size
    });

    const imageBuffer = await processedImage.toBuffer();

    // Validate final image
    const metadata = await sharp(imageBuffer).metadata();

    // Check dimensions are correct
    if (metadata.width !== targetWidth || metadata.height !== targetHeight) {
      log.warn(`Final image dimensions mismatch: expected ${targetWidth}x${targetHeight}, got ${metadata.width}x${metadata.height}`);
    }

    // Check transparency if required
    if (asset.requiresTransparency && !metadata.hasAlpha) {
      log.warn(`Transparency requirement not met - no alpha channel in final image`);
    }

    // Check file size
    const sizeKB = imageBuffer.length / 1024;
    if (sizeKB > asset.maxFileSizeKB) {
      log.warn(`Image size: ${sizeKB.toFixed(1)}KB (target: ${asset.maxFileSizeKB}KB)`);
    }

    // Ensure output directory exists
    const outputDir = join(outputPath, '..');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write the processed file
    await writeFile(outputPath, imageBuffer);

    log.info(`Successfully generated ${asset.id}`, {
      path: outputPath,
      size: imageBuffer.length,
      dimensions: `${asset.expectedSize.width}x${asset.expectedSize.height}`
    });

  } catch (error) {
    log.error(`Failed to generate ${asset.id}`, error);
    throw error;
  }
}

/**
 * Remove white background and make it transparent
 * FIXED: Preserve 8-bit alpha channel (not 1-bit binary)
 */
async function removeWhiteBackground(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  // Get image metadata first
  const metadata = await sharp(buffer).metadata();
  
  // Process with proper alpha channel handling
  return sharp(buffer)
    .ensureAlpha() // Ensure we have alpha channel
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      // Process pixels to remove white background with smooth alpha
      const channels = info.channels || 4;
      const pixelCount = info.width * info.height;
      
      for (let i = 0; i < pixelCount; i++) {
        const pixelOffset = i * channels;
        const r = data[pixelOffset];
        const g = data[pixelOffset + 1];
        const b = data[pixelOffset + 2];
        
        // Calculate whiteness (average of RGB)
        const avg = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        // More sophisticated white detection
        // Check if pixel is white-ish (high brightness AND low saturation)
        const brightness = avg;
        const saturation = max > 0 ? (max - min) / max : 0;
        
        // If very white and low saturation, make transparent
        if (brightness > 245 && saturation < 0.1) {
          data[pixelOffset + 3] = 0; // Fully transparent
        }
        // Smooth gradient for near-white pixels (smooth edges)
        else if (brightness > 230 && saturation < 0.2) {
          // Linear gradient: 230 = 100% opaque, 245 = 0% opaque
          const alpha = Math.floor(255 * (1 - (brightness - 230) / 15));
          data[pixelOffset + 3] = Math.max(0, Math.min(255, alpha));
        }
        // Otherwise keep fully opaque
        else {
          data[pixelOffset + 3] = 255;
        }
      }

      // Return with proper 8-bit alpha channel (not 1-bit)
      return sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4, // RGBA
        }
      })
      .webp({
        quality: 90, // High quality for transparency processing
        effort: 6,
        lossless: false,
        smartSubsample: true
      })
        .toBuffer();
    });
}

/**
 * Download image from URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
