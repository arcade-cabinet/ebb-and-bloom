/**
 * Texture Loader for BabylonJS - Loads textures from manifest.json
 * Uses schema types from @ebb/gen/schemas (DRY - single source of truth)
 */

import { Texture } from '@babylonjs/core';
import type { TextureManifest } from '@ebb/gen/schemas';

let manifestCache: TextureManifest | null = null;
const textureCache = new Map<string, Texture>();

/**
 * Load texture manifest
 */
export async function loadTextureManifest(): Promise<TextureManifest> {
  if (manifestCache) return manifestCache;
  
  try {
    const response = await fetch('/textures/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load texture manifest: ${response.statusText}`);
    }
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
  if (!asset) {
    console.warn(`Texture not found in manifest: ${assetId}`);
    return null;
  }
  
  // Convert manifest path to web-accessible path
  let webPath = asset.localPath;
  
  // Remove "public/" prefix if present
  if (webPath.startsWith('public/')) {
    webPath = webPath.replace(/^public\//, '/');
  }
  // If it's already a relative path, make it absolute
  else if (!webPath.startsWith('/')) {
    webPath = `/textures/${webPath}`;
  }
  
  // Ensure it starts with /textures/
  if (!webPath.startsWith('/textures/')) {
    const match = webPath.match(/(?:textures\/)?([^/]+)\/([^/]+)$/);
    if (match) {
      return `/textures/${match[1]}/${match[2]}`;
    }
    return `/textures/${webPath}`;
  }
  
  return webPath;
}

/**
 * Load texture by asset ID using BabylonJS
 */
export async function loadTexture(
  assetId: string,
  scene: import('@babylonjs/core').Scene
): Promise<Texture | null> {
  // Check cache
  if (textureCache.has(assetId)) {
    return textureCache.get(assetId)!;
  }
  
  // Get texture path from manifest
  const path = await getTexturePath(assetId);
  if (!path) {
    console.warn(`Texture path not found for: ${assetId}`);
    return null;
  }
  
  try {
    // Load texture with BabylonJS
    const texture = new Texture(path, scene);
    textureCache.set(assetId, texture);
    return texture;
  } catch (error) {
    console.error(`Failed to load texture ${assetId} from ${path}:`, error);
    return null;
  }
}

/**
 * Load multiple textures
 */
export async function loadTextures(
  assetIds: string[],
  scene: import('@babylonjs/core').Scene
): Promise<Map<string, Texture>> {
  const textures = new Map<string, Texture>();
  
  for (const assetId of assetIds) {
    const texture = await loadTexture(assetId, scene);
    if (texture) {
      textures.set(assetId, texture);
    }
  }
  
  return textures;
}

