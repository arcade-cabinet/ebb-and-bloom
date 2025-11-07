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
    
    try {
      log.info('Loading texture manifest from AmbientCG download...');
      
      // Load texture manifest created by downloader
      const manifest = await this.loadTextureManifest();
      
      // Create ECS entities for each texture resource
      for (const textureData of manifest) {
        const entity = this.world.add({
          resource: {
            materialType: textureData.category,
            quantity: 1, // Always available
            purity: 1.0,
            magneticRadius: 0,
            harvestable: false
          }
        });
        
        this.textureEntities.set(textureData.id, entity);
        log.debug('Texture resource entity created', { id: textureData.id, category: textureData.category });
      }
      
      perf.end();
      log.info('Texture system initialized successfully', {
        textureCount: manifest.length,
        categories: [...new Set(manifest.map(t => t.category))]
      });
      
    } catch (error) {
      log.error('Failed to initialize texture system', error);
      throw error;
    }
  }
  
  private async loadTextureManifest(): Promise<TextureResource[]> {
    try {
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      
      const manifest = await response.json();
      return manifest as TextureResource[];
      
    } catch (error) {
      log.warn('Texture manifest not found, using fallback textures');
      return this.createFallbackManifest();
    }
  }
  
  private createFallbackManifest(): TextureResource[] {
    // Create fallback entries for development
    const fallbacks: TextureResource[] = [];
    
    const categories: TextureResource['category'][] = ['wood', 'metal', 'stone', 'fabric', 'organic', 'ground'];
    
    for (const category of categories) {
      fallbacks.push({
        id: `fallback_${category}_001`,
        category,
        variant: 'basic',
        resolution: '2K',
        mapTypes: ['color'],
        filePath: `/textures/fallback/${category}.png`,
        loaded: false
      });
    }
    
    return fallbacks;
  }
  
  // Query materials by ECS-style criteria
  queryMaterial(query: MaterialQuery): Promise<THREE.Material> {
    const perf = measurePerformance(`Material Query: ${query.category}`);
    
    return new Promise((resolve) => {
      try {
        const cacheKey = `${query.category}_${query.variant || 'default'}`;
        
        if (this.materialCache.has(cacheKey)) {
          perf.end();
          return resolve(this.materialCache.get(cacheKey)!.clone());
        }
        
        // Find matching texture resource from ECS
        const resourceEntities = this.world.with('resource')
          .where(e => e.resource?.materialType === query.category);
        
        if (resourceEntities.entities.length === 0) {
          log.warn('No texture resource found, using fallback', query);
          perf.end();
          return resolve(this.createFallbackMaterial(query.category));
        }
        
        // Create material from texture resource
        const material = this.createMaterialFromResource(query);
        this.materialCache.set(cacheKey, material);
        
        perf.end();
        resolve(material.clone());
        
      } catch (error) {
        log.error('Material query failed', error, query);
        perf.end();
        resolve(this.createFallbackMaterial(query.category));
      }
    });
  }
  
  private createMaterialFromResource(query: MaterialQuery): THREE.Material {
    // For now, create based on category until textures are downloaded
    const colorMap = {
      'wood': '#8B4513',
      'metal': '#C0C0C0',
      'stone': '#696969', 
      'fabric': '#DEB887',
      'organic': '#228B22',
      'ground': '#8FBC8F'
    };
    
    const material = new THREE.MeshLambertMaterial({
      color: colorMap[query.category] || '#888888'
    });
    
    // Apply properties if specified
    if (query.properties?.emissive && 'emissive' in material) {
      (material as any).emissive = new THREE.Color(colorMap[query.category]).multiplyScalar(0.1);
    }
    
    return material;
  }
  
  private createFallbackMaterial(category: TextureResource['category']): THREE.Material {
    return this.createMaterialFromResource({ category });
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