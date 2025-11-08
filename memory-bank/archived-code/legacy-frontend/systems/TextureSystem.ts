/**
 * Texture System with ECS Integration
 * Provides React bindings for AmbientCG textures and ECS resource data
 */

import { World, Entity } from 'miniplex';
import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import { log, measurePerformance } from '../utils/Logger';
import type { WorldSchema } from '../world/ECSWorld';

// Texture resource data for ECS queries
export interface TextureResource {
  id: string;
  category: 'wood' | 'metal' | 'stone' | 'fabric' | 'organic' | 'ground';
  variant: string;
  resolution: '1K' | '2K' | '4K';
  mapTypes: Array<'color' | 'roughness' | 'normal' | 'metalness' | 'ao'>;
  filePath: string;
  loaded: boolean;
  material?: THREE.Material;
}

export interface MaterialQuery {
  category: TextureResource['category'];
  variant?: string;
  properties?: {
    metalness?: number;
    roughness?: number;
    emissive?: boolean;
  };
}

class TextureSystem {
  private world: World<WorldSchema>;
  private textureEntities = new Map<string, Entity<WorldSchema>>();
  private materialCache = new Map<string, THREE.Material>();
  private loader = new THREE.TextureLoader();
  private manifestPath = '/textures/manifest.json';
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    log.info('TextureSystem initializing...');
  }
  
  async initialize(): Promise<void> {
    const perf = measurePerformance('Texture System Initialization');
    
    log.info('Initializing texture system - PRODUCTION MODE: All textures required');
    
    // PRODUCTION GATE: Manifest must exist
    const manifest = await this.loadTextureManifest();
    
    if (!manifest || manifest.length === 0) {
      const error = new Error(
        'PRODUCTION REQUIREMENT: Texture manifest is empty or missing.\n' +
        'Run: pnpm setup:textures\n' +
        'This downloads AmbientCG textures required for the game to run.'
      );
      log.error('Texture system initialization BLOCKED', error);
      throw error;
    }
    
    // PRODUCTION GATE: Verify texture files exist before creating entities
    const verifiedTextures: TextureResource[] = [];
    for (const textureData of manifest) {
      // Verify texture file exists (synchronous check via fetch head)
      const textureExists = await this.verifyTextureExists(textureData.filePath);
      if (!textureExists) {
        log.warn('Texture file missing, skipping', { 
          id: textureData.id, 
          path: textureData.filePath 
        });
        continue; // Skip missing textures
      }
      
      verifiedTextures.push(textureData);
    }
    
    if (verifiedTextures.length === 0) {
      const error = new Error(
        'PRODUCTION REQUIREMENT: No valid texture files found.\n' +
        'All texture files are missing. Run: pnpm setup:textures\n' +
        'Expected location: /public/textures/'
      );
      log.error('Texture system initialization BLOCKED - no valid textures', error);
      throw error;
    }
    
    // Create ECS entities ONLY for verified textures
    for (const textureData of verifiedTextures) {
      const entity = this.world.add({
        resource: {
          materialType: textureData.category as any,
          quantity: 1,
          purity: 1.0,
          magneticRadius: 0,
          harvestable: false
        }
      });
      
      // Store texture data on entity for lookup
      (entity as any).textureId = textureData.id;
      (entity as any).textureData = textureData;
      
      this.textureEntities.set(textureData.id, entity);
      log.debug('Texture resource entity created', { id: textureData.id, category: textureData.category });
    }
    
    perf.end();
    log.info('Texture system initialized - PRODUCTION MODE', {
      textureCount: verifiedTextures.length,
      categories: [...new Set(verifiedTextures.map(t => t.category))],
      skipped: manifest.length - verifiedTextures.length
    });
  }
  
  private async verifyTextureExists(filePath: string): Promise<boolean> {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  private async loadTextureManifest(): Promise<TextureResource[]> {
    // PRODUCTION GATE: Manifest file must exist
    const response = await fetch(this.manifestPath);
    
    if (!response.ok) {
      throw new Error(
        `PRODUCTION REQUIREMENT: Texture manifest not found at ${this.manifestPath}\n` +
        `Status: ${response.status} ${response.statusText}\n` +
        `Run: pnpm setup:textures\n` +
        `This creates the required manifest.json file.`
      );
    }
    
    const manifestData = await response.json();
    
    // Handle both old format (array) and new format (object with assets array)
    let assets: any[] = [];
    if (Array.isArray(manifestData)) {
      assets = manifestData;
    } else if (manifestData.assets && Array.isArray(manifestData.assets)) {
      assets = manifestData.assets;
    } else {
      throw new Error(
        `PRODUCTION REQUIREMENT: Invalid manifest format at ${this.manifestPath}\n` +
        `Expected: Array or object with 'assets' array\n` +
        `Got: ${typeof manifestData}`
      );
    }
    
    if (assets.length === 0) {
      throw new Error(
        `PRODUCTION REQUIREMENT: Texture manifest is empty at ${this.manifestPath}\n` +
        `Run: pnpm setup:textures\n` +
        `This downloads and registers texture assets.`
      );
    }
    
    // Convert manifest entries to TextureResource format
    const textures: TextureResource[] = assets.map((asset: any) => {
      // Map AmbientCG categories to our categories
      const categoryMap: Record<string, TextureResource['category']> = {
        'wood': 'wood',
        'metal': 'metal',
        'stone': 'stone',
        'rock': 'stone',
        'concrete': 'stone',
        'bricks': 'stone',
        'fabric': 'fabric',
        'leather': 'fabric',
        'grass': 'ground',
        'organic': 'organic'
      };
      
      const category = categoryMap[asset.category?.toLowerCase()] || 'ground';
      
      // PRODUCTION: File path must be valid
      const filePath = asset.filePath || asset.localPath;
      if (!filePath) {
        throw new Error(
          `PRODUCTION REQUIREMENT: Texture asset missing filePath\n` +
          `Asset ID: ${asset.assetId || asset.id}\n` +
          `Manifest entry must include filePath or localPath`
        );
      }
      
      return {
        id: asset.assetId || asset.id,
        category,
        variant: asset.name || 'default',
        resolution: asset.resolution || '2K',
        mapTypes: ['color', 'normal', 'roughness'].filter(type => 
          filePath.includes(type) || asset.mapType === type
        ),
        filePath: filePath.startsWith('/') ? filePath : `/${filePath}`,
        loaded: false
      };
    });
    
    log.info('Texture manifest loaded - PRODUCTION MODE', {
      textureCount: textures.length,
      categories: [...new Set(textures.map(t => t.category))]
    });
    
    return textures;
  }
  
  // Query materials by ECS-style criteria
  async queryMaterial(query: MaterialQuery): Promise<THREE.Material> {
    const perf = measurePerformance(`Material Query: ${query.category}`);
    
    try {
      const cacheKey = `${query.category}_${query.variant || 'default'}`;
      
      if (this.materialCache.has(cacheKey)) {
        perf.end();
        return this.materialCache.get(cacheKey)!.clone();
      }
      
      // Create material from texture resource (async)
      const material = await this.createMaterialFromResource(query);
      this.materialCache.set(cacheKey, material);
      
      perf.end();
      return material.clone();
      
    } catch (error) {
      log.error('Material query failed', error, query);
      perf.end();
      throw error; // NO FALLBACKS - fail properly
    }
  }
  
  private async createMaterialFromResource(query: MaterialQuery): Promise<THREE.Material> {
    // Find matching texture resource - REQUIRED, no fallbacks
    const resourceEntities = this.world.with('resource')
      .where(e => e.resource?.materialType === query.category);
    
    if (resourceEntities.entities.length === 0) {
      throw new Error(`No texture resource found for category: ${query.category}. Ensure textures are loaded.`);
    }
    
    // Get texture resource data
    const textureEntity = resourceEntities.entities[0];
    const textureId = (textureEntity as any).textureId;
    
    if (!textureId) {
      throw new Error(`Texture entity missing textureId for category: ${query.category}`);
    }
    
    // Find texture resource
    const textureResource = Array.from(this.textureEntities.values())
      .find(e => (e as any).textureId === textureId);
    
    if (!textureResource) {
      throw new Error(`Texture resource not found: ${textureId} for category: ${query.category}`);
    }
    
    const textureData = (textureResource as any).textureData as TextureResource;
    
    if (!textureData) {
      throw new Error(`Texture data missing for resource: ${textureId}`);
    }
    
    // Load texture maps - REQUIRED (loadTexture throws on failure)
    const colorTexture = await this.loadTexture(textureData.filePath);
    
    const normalTexture = textureData.mapTypes.includes('normal')
      ? await this.loadTexture(textureData.filePath.replace('_color_', '_normal_').replace('color_2K', 'normal_2K'))
      : null;
    
    const roughnessTexture = textureData.mapTypes.includes('roughness')
      ? await this.loadTexture(textureData.filePath.replace('_color_', '_roughness_').replace('color_2K', 'roughness_2K'))
      : null;
    
    // Create PBR material with loaded textures
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture || undefined,
      roughnessMap: roughnessTexture || undefined,
      metalness: query.category === 'metal' ? 0.8 : 0.1,
      roughness: query.category === 'metal' ? 0.2 : 0.8
    });
    
    // Apply custom properties
    if (query.properties?.metalness !== undefined) {
      material.metalness = query.properties.metalness;
    }
    if (query.properties?.roughness !== undefined) {
      material.roughness = query.properties.roughness;
    }
    if (query.properties?.emissive) {
      material.emissive = new THREE.Color(0x000000);
      material.emissiveIntensity = 0.1;
    }
    
    return material;
  }
  
  private async loadTexture(path: string): Promise<THREE.Texture> {
    try {
      const texture = await this.loader.loadAsync(path);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      return texture;
    } catch (error) {
      log.error('Failed to load texture', error, { path });
      throw new Error(`Texture loading failed: ${path}. Ensure texture file exists.`);
    }
  }
}

// React Context for texture system
export const TextureContext = createContext<TextureSystem | null>(null);

// React hook for material queries
export const useMaterial = (query: MaterialQuery) => {
  const textureSystem = useContext(TextureContext);
  const [material, setMaterial] = useState<THREE.Material | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!textureSystem) {
      log.error('TextureSystem not found in context');
      setLoading(false); // Set loading to false when context is missing
      return;
    }
    
    setLoading(true);
    
    textureSystem.queryMaterial(query)
      .then((mat) => {
        setMaterial(mat);
        setLoading(false);
        log.debug('Material loaded via React hook', query);
      })
      .catch((error) => {
        log.error('Material loading failed in React hook', error, query);
        setLoading(false);
      });
  }, [textureSystem, JSON.stringify(query)]);
  
  return { material, loading };
};

// Convenience hooks for common materials
export const useWoodMaterial = (variant?: string) => 
  useMaterial({ category: 'wood', variant });

export const useStoneMaterial = (variant?: string) => 
  useMaterial({ category: 'stone', variant });

export const useFabricMaterial = (variant?: string) => 
  useMaterial({ category: 'fabric', variant });

export const useMetalMaterial = (variant?: string, properties?: MaterialQuery['properties']) => 
  useMaterial({ category: 'metal', variant, properties });

export const useGroundMaterial = (type: 'grass' | 'dirt' | 'mud' = 'grass') => 
  useMaterial({ category: 'ground', variant: type });

export default TextureSystem;