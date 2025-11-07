/**
 * Texture Library System - Query system for AmbientCG materials
 * Automatically assigns PBR textures to procedural objects
 */

import * as THREE from 'three';

// Texture categories from AmbientCG
export type TextureCategory = 
  | 'wood' | 'metal' | 'stone' | 'ground' | 'fabric' 
  | 'concrete' | 'tiles' | 'leather' | 'organic';

export type MapType = 
  | 'color' | 'roughness' | 'normal' | 'metalness' 
  | 'opacity' | 'ao' | 'displacement';

interface TextureSet {
  color?: THREE.Texture;
  roughness?: THREE.Texture;
  normal?: THREE.Texture;
  metalness?: THREE.Texture;
  opacity?: THREE.Texture;
  ao?: THREE.Texture;
  displacement?: THREE.Texture;
}

class TextureLibrary {
  private textureCache = new Map<string, TextureSet>();
  private loader = new THREE.TextureLoader();
  private basePath = '/textures/'; // Where AmbientCG textures are stored
  
  // Query textures by material needs
  async queryTextures(
    category: TextureCategory, 
    variant?: string,
    resolution: '1K' | '2K' | '4K' = '2K'
  ): Promise<TextureSet> {
    
    const cacheKey = `${category}_${variant || 'default'}_${resolution}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }
    
    // Find matching texture asset
    const assetId = await this.findBestAsset(category, variant);
    
    if (!assetId) {
      console.warn(`No texture found for ${category}${variant ? `_${variant}` : ''}`);
      return this.createFallbackTexture(category);
    }
    
    // Load complete PBR texture set
    const textureSet = await this.loadTextureSet(assetId, resolution);
    
    this.textureCache.set(cacheKey, textureSet);
    return textureSet;
  }
  
  private async findBestAsset(category: TextureCategory, variant?: string): Promise<string | null> {
    // In a real implementation, this would query the texture manifest
    // created by the downloader. For now, return mock asset IDs
    
    const mockAssets: Record<TextureCategory, string[]> = {
      wood: ['wood_planks_001', 'wood_oak_002', 'wood_pine_003'],
      metal: ['metal_steel_001', 'metal_rust_002', 'metal_copper_003'],
      stone: ['stone_brick_001', 'stone_cobble_002', 'stone_granite_003'],
      ground: ['ground_grass_001', 'ground_dirt_002', 'ground_mud_003'],
      fabric: ['fabric_fur_001', 'fabric_cotton_002', 'fabric_wool_003'],
      concrete: ['concrete_smooth_001', 'concrete_rough_002'],
      tiles: ['tiles_ceramic_001', 'tiles_stone_002'],
      leather: ['leather_brown_001', 'leather_black_002'],
      organic: ['organic_bark_001', 'organic_moss_002']
    };
    
    const assets = mockAssets[category];
    if (!assets || assets.length === 0) return null;
    
    // Return random variant or specific one
    if (variant) {
      const match = assets.find(asset => asset.includes(variant));
      if (match) return match;
    }
    
    return assets[Math.floor(Math.random() * assets.length)];
  }
  
  private async loadTextureSet(assetId: string, resolution: string): Promise<TextureSet> {
    const textureSet: TextureSet = {};
    
    const mapTypes: MapType[] = ['color', 'roughness', 'normal', 'metalness'];
    
    for (const mapType of mapTypes) {
      try {
        const path = `${this.basePath}${assetId}_${mapType}_${resolution}.jpg`;
        const texture = await this.loadTexture(path);
        
        // Configure texture settings
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4); // Tile 4x for variety
        
        textureSet[mapType] = texture;
        
      } catch (error) {
        console.warn(`Failed to load ${mapType} for ${assetId}`);
      }
    }
    
    return textureSet;
  }
  
  private loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        resolve,
        undefined,
        reject
      );
    });
  }
  
  private createFallbackTexture(category: TextureCategory): TextureSet {
    // Create simple colored fallback texture
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Color by category
    const colors: Record<TextureCategory, string> = {
      wood: '#8B4513',
      metal: '#C0C0C0', 
      stone: '#808080',
      ground: '#228B22',
      fabric: '#DEB887',
      concrete: '#A9A9A9',
      tiles: '#B22222',
      leather: '#8B4513',
      organic: '#556B2F'
    };
    
    ctx.fillStyle = colors[category] || '#888888';
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return { color: texture };
  }
  
  // Create Three.js material from texture set
  createMaterial(textureSet: TextureSet, materialType: 'standard' | 'lambert' = 'standard'): THREE.Material {
    if (materialType === 'lambert') {
      return new THREE.MeshLambertMaterial({
        map: textureSet.color
      });
    }
    
    return new THREE.MeshStandardMaterial({
      map: textureSet.color,
      roughnessMap: textureSet.roughness,
      normalMap: textureSet.normal,
      metalnessMap: textureSet.metalness,
      aoMap: textureSet.ao
    });
  }
}

// Singleton instance
export const textureLibrary = new TextureLibrary();

// Helper functions for common use cases
export async function getWoodMaterial(variant?: string): Promise<THREE.Material> {
  const textures = await textureLibrary.queryTextures('wood', variant);
  return textureLibrary.createMaterial(textures);
}

export async function getStoneMaterial(variant?: string): Promise<THREE.Material> {
  const textures = await textureLibrary.queryTextures('stone', variant);
  return textureLibrary.createMaterial(textures);
}

export async function getFurMaterial(color?: string): Promise<THREE.Material> {
  const textures = await textureLibrary.queryTextures('fabric', 'fur');
  return textureLibrary.createMaterial(textures);
}

export async function getGroundMaterial(type: 'grass' | 'dirt' | 'mud' = 'grass'): Promise<THREE.Material> {
  const textures = await textureLibrary.queryTextures('ground', type);
  return textureLibrary.createMaterial(textures);
}