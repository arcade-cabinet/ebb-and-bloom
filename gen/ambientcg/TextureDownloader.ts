/**
 * AMBIENTCG TEXTURE DOWNLOADER
 * 
 * Downloads and processes AmbientCG textures for integration with SDF API.
 * Creates comprehensive material library for all rendering scales.
 */

import axios from 'axios';
import { createWriteStream, existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export interface AmbientCGAsset {
  assetId: string;
  name: string;
  category: string;
  tags: string[];
  downloads: Array<{
    type: 'Diffuse' | 'Normal' | 'Roughness' | 'Metallic' | 'AO' | 'Displacement';
    resolution: string;
    url: string;
    format: string;
  }>;
}

export interface MaterialManifest {
  id: string;
  name: string;
  category: string;
  tags: string[];
  baseColor: string;
  pbr: {
    metallic: number;
    roughness: number;
    normalStrength: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
  sdf: {
    displacement: boolean;
    tiling: number;
    blendMode: 'multiply' | 'overlay' | 'normal';
  };
  paths: {
    diffuse: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
    ao?: string;
    displacement?: string;
  };
}

export class TextureDownloader {
  private static readonly BASE_URL = 'https://ambientcg.com/api/v2';
  private static readonly DOWNLOAD_DIR = './public/textures/ambientcg';

  /**
   * Download AmbientCG asset catalog
   */
  static async downloadCatalog(): Promise<AmbientCGAsset[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/full_json`);
      return response.data.foundAssets || [];
    } catch (error) {
      console.error('Failed to download AmbientCG catalog:', error);
      return [];
    }
  }

  /**
   * Download specific texture set by asset ID
   */
  static async downloadTexture(asset: AmbientCGAsset, resolution = '1K'): Promise<MaterialManifest | null> {
    try {
      await this.ensureDir(`${this.DOWNLOAD_DIR}/${asset.assetId}`);

      const manifest: MaterialManifest = {
        id: asset.assetId,
        name: asset.name,
        category: asset.category,
        tags: asset.tags,
        baseColor: '#ffffff',
        pbr: {
          metallic: this.inferMetallic(asset),
          roughness: this.inferRoughness(asset),
          normalStrength: 1.0
        },
        sdf: {
          displacement: asset.downloads?.some(d => d.type === 'Displacement') || false,
          tiling: 1.0,
          blendMode: 'multiply'
        },
        paths: {}
      };

      // Download each texture type
      for (const download of asset.downloads || []) {
        if (download.resolution !== resolution) continue;

        const filename = `${asset.assetId}_${download.type}.${download.format}`;
        const filepath = join(this.DOWNLOAD_DIR, asset.assetId, filename);

        if (!existsSync(filepath)) {
          console.log(`Downloading ${asset.name} ${download.type}...`);
          await this.downloadFile(download.url, filepath);
        }

        // Optimize for web and get the new path
        let optimizedFilepath = filepath;
        if (download.format === 'jpg' || download.format === 'png') {
          optimizedFilepath = await this.optimizeTexture(filepath);
        }

        // Update manifest paths with the potentially optimized path
        const pathKey = download.type.toLowerCase() as keyof typeof manifest.paths;
        const finalFilename = optimizedFilepath.split('/').pop()!;
        if (finalFilename.endsWith('_optimized.jpg')) {
          manifest.paths[pathKey] = `/textures/ambientcg/${asset.assetId}/${finalFilename}`;
        } else {
          manifest.paths[pathKey] = `/textures/ambientcg/${asset.assetId}/${filename}`;
        }

        // Extract base color from diffuse texture
        if (download.type === 'Diffuse') {
          manifest.baseColor = await this.extractDominantColor(optimizedFilepath);
        }
      }

      return manifest;
    } catch (error) {
      console.error(`Failed to download texture ${asset.assetId}:`, error);
      return null;
    }
  }

  /**
   * Download curated material set for cosmic game
   */
  static async downloadCosmicMaterials(): Promise<MaterialManifest[]> {
    const catalog = await this.downloadCatalog();
    const manifests: MaterialManifest[] = [];

    // Curated list for cosmic game needs
    const cosmicMaterials = [
      // Planetary surfaces
      'Rock027', 'Rock035', 'Ground037', 'Soil026',
      // Metals (for tools, structures)  
      'Metal034', 'Metal041', 'Metal047',
      // Organics (for creatures)
      'Wood049', 'Fabric029', 'Leather024',
      // Crystalline (for minerals)
      'Crystal002', 'Ice001',
      // Atmospheric
      'Cloud003', 'Foam001'
    ];

    for (const materialId of cosmicMaterials) {
      const asset = catalog.find(a => a.assetId === materialId);
      if (asset) {
        const manifest = await this.downloadTexture(asset, '1K');
        if (manifest) {
          manifests.push(manifest);
        }
      }
    }

    // Save combined manifest
    const manifestPath = join(this.DOWNLOAD_DIR, 'cosmic-materials-manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifests, null, 2));

    console.log(`Downloaded ${manifests.length} cosmic materials to ${manifestPath}`);
    return manifests;
  }

  /**
   * Helper methods
   */
  private static async ensureDir(path: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  }

  private static async downloadFile(url: string, filepath: string): Promise<void> {
    const writer = createWriteStream(filepath);
    const response = await axios.get(url, { responseType: 'stream' });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private static async optimizeTexture(filepath: string): Promise<string> {
    const optimizedPath = filepath.replace(/\.(png|jpg|jpeg)$/i, '_optimized.jpg');
    try {
      if (existsSync(optimizedPath)) {
        return optimizedPath; // Already optimized
      }
      await sharp(filepath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);
      return optimizedPath;
    } catch (error) {
      console.error(`Texture optimization failed for ${filepath}:`, error);
      throw error; // Re-throw to fail the download process
    }
  }

  private static async extractDominantColor(filepath: string): Promise<string> {
    try {
      const { dominant } = await sharp(filepath).stats();
      const { r, g, b } = dominant;
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (error) {
      return '#ffffff';
    }
  }

  private static inferMetallic(asset: AmbientCGAsset): number {
    const name = (asset.name || asset.assetId || '').toLowerCase();
    if (name.includes('metal') || name.includes('steel') || name.includes('iron')) return 0.9;
    if (name.includes('rock') || name.includes('stone')) return 0.1;
    if (name.includes('wood') || name.includes('fabric')) return 0.0;
    return 0.2;
  }

  private static inferRoughness(asset: AmbientCGAsset): number {
    const name = (asset.name || asset.assetId || '').toLowerCase();
    if (name.includes('polished') || name.includes('smooth')) return 0.1;
    if (name.includes('rough') || name.includes('concrete')) return 0.9;
    if (name.includes('wood')) return 0.7;
    if (name.includes('metal')) return 0.3;
    return 0.5;
  }
}