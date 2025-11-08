/**
 * Texture Loader - Loads textures from manifest.json
 */

import { TextureLoader } from 'three';

export interface TextureManifest {
  generatedAt: string;
  totalTextures: number;
  categories: string[];
  resolution: string;
  assets: Array<{
    assetId: string;
    name: string;
    category: string;
    mapType: string;
    filePath: string;
    localPath: string;
  }>;
}

let manifestCache: TextureManifest | null = null;
const textureCache = new Map<string, any>();

/**
 * Load texture manifest
 */
export async function loadTextureManifest(): Promise<TextureManifest> {
  if (manifestCache) return manifestCache;
  
  try {
    const response = await fetch('/textures/manifest.json');
    manifestCache = await response.json();
    return manifestCache!;
  } catch (error) {
    console.error('Failed to load texture manifest:', error);
    throw error;
  }
}

/**
 * Get texture path by asset ID
 */
export async function getTexturePath(assetId: string): Promise<string | null> {
  const manifest = await loadTextureManifest();
  const asset = manifest.assets.find(a => a.assetId === assetId);
  return asset ? `/textures/${asset.localPath.replace('public/textures/', '')}` : null;
}

/**
 * Load texture by asset ID
 */
export async function loadTexture(assetId: string): Promise<any> {
  if (textureCache.has(assetId)) {
    return textureCache.get(assetId);
  }
  
  const path = await getTexturePath(assetId);
  if (!path) {
    console.warn(`Texture not found: ${assetId}`);
    return null;
  }
  
  const loader = new TextureLoader();
  const texture = await new Promise((resolve, reject) => {
    loader.load(
      path,
      (texture) => {
        textureCache.set(assetId, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture ${assetId}:`, error);
        reject(error);
      }
    );
  });
  
  return texture;
}

/**
 * Load multiple textures
 */
export async function loadTextures(assetIds: string[]): Promise<Map<string, any>> {
  const textures = new Map<string, any>();
  
  await Promise.all(
    assetIds.map(async (id) => {
      const texture = await loadTexture(id);
      if (texture) {
        textures.set(id, texture);
      }
    })
  );
  
  return textures;
}

