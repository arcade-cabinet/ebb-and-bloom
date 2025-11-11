import * as THREE from 'three';

interface ResourceMetadata {
  sceneAcquisitions: Map<string, number>;  // Per-scene acquisition counts
  lastUsed: number;
}

interface TextureMetadata extends ResourceMetadata {
  size: number;
}

export class RenderResourceManager {
  private static instance: RenderResourceManager | null = null;
  
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  
  private geometryMetadata: Map<string, ResourceMetadata> = new Map();
  private materialMetadata: Map<string, ResourceMetadata> = new Map();
  private textureMetadata: Map<string, TextureMetadata> = new Map();
  
  private readonly MAX_TEXTURES = 50;
  private readonly MAX_TEXTURE_MEMORY = 120 * 1024 * 1024;
  private currentTextureMemory = 0;
  
  private constructor() {
    console.log('[RenderResourceManager] Initialized');
  }
  
  static getInstance(): RenderResourceManager {
    if (!RenderResourceManager.instance) {
      RenderResourceManager.instance = new RenderResourceManager();
    }
    return RenderResourceManager.instance;
  }
  
  getGeometry(key: string, factory: () => THREE.BufferGeometry, sceneId?: string): THREE.BufferGeometry {
    if (!this.geometries.has(key)) {
      const geometry = factory();
      this.geometries.set(key, geometry);
      this.geometryMetadata.set(key, {
        sceneAcquisitions: new Map(),
        lastUsed: Date.now(),
      });
      console.log(`[RenderResourceManager] Created geometry: ${key}`);
    }
    
    const metadata = this.geometryMetadata.get(key)!;
    metadata.lastUsed = Date.now();
    if (sceneId) {
      const count = metadata.sceneAcquisitions.get(sceneId) || 0;
      metadata.sceneAcquisitions.set(sceneId, count + 1);
    }
    
    return this.geometries.get(key)!;
  }
  
  getMaterial(key: string, factory: () => THREE.Material, sceneId?: string): THREE.Material {
    if (!this.materials.has(key)) {
      const material = factory();
      this.materials.set(key, material);
      this.materialMetadata.set(key, {
        sceneAcquisitions: new Map(),
        lastUsed: Date.now(),
      });
      console.log(`[RenderResourceManager] Created material: ${key}`);
    }
    
    const metadata = this.materialMetadata.get(key)!;
    metadata.lastUsed = Date.now();
    if (sceneId) {
      const count = metadata.sceneAcquisitions.get(sceneId) || 0;
      metadata.sceneAcquisitions.set(sceneId, count + 1);
    }
    
    return this.materials.get(key)!;
  }
  
  getTexture(key: string, factory: () => THREE.Texture, sceneId?: string): THREE.Texture {
    if (!this.textures.has(key)) {
      this.evictLRUTexturesIfNeeded();
      
      const texture = factory();
      const estimatedSize = this.estimateTextureSize(texture);
      
      this.textures.set(key, texture);
      this.textureMetadata.set(key, {
        sceneAcquisitions: new Map(),
        lastUsed: Date.now(),
        size: estimatedSize,
      });
      this.currentTextureMemory += estimatedSize;
      
      console.log(`[RenderResourceManager] Created texture: ${key} (${(estimatedSize / 1024 / 1024).toFixed(2)} MB, total: ${(this.currentTextureMemory / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    const metadata = this.textureMetadata.get(key)!;
    metadata.lastUsed = Date.now();
    if (sceneId) {
      const count = metadata.sceneAcquisitions.get(sceneId) || 0;
      metadata.sceneAcquisitions.set(sceneId, count + 1);
    }
    
    return this.textures.get(key)!;
  }
  
  private estimateTextureSize(texture: THREE.Texture): number {
    if (!texture.image) return 0;
    
    const width = texture.image.width || 512;
    const height = texture.image.height || 512;
    const bytesPerPixel = 4;
    
    return width * height * bytesPerPixel;
  }
  
  private evictLRUTexturesIfNeeded(): void {
    while (
      (this.textures.size >= this.MAX_TEXTURES || 
       this.currentTextureMemory >= this.MAX_TEXTURE_MEMORY) &&
      this.textures.size > 0
    ) {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();
      
      for (const [key, metadata] of this.textureMetadata.entries()) {
        if (metadata.sceneAcquisitions.size === 0 && metadata.lastUsed < oldestTime) {
          oldestTime = metadata.lastUsed;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.disposeTexture(oldestKey);
      } else {
        break;
      }
    }
  }
  
  private disposeTexture(key: string): void {
    const texture = this.textures.get(key);
    const metadata = this.textureMetadata.get(key);
    
    if (texture && metadata) {
      texture.dispose();
      this.currentTextureMemory -= metadata.size;
      this.textures.delete(key);
      this.textureMetadata.delete(key);
      console.log(`[RenderResourceManager] Disposed texture: ${key}`);
    }
  }
  
  disposeScene(sceneId: string): void {
    console.log(`[RenderResourceManager] Disposing resources for scene: ${sceneId}`);
    
    const disposedResources = {
      geometries: 0,
      materials: 0,
      textures: 0,
    };
    
    for (const [key, metadata] of this.geometryMetadata.entries()) {
      if (metadata.sceneAcquisitions.has(sceneId)) {
        metadata.sceneAcquisitions.delete(sceneId);
        
        if (metadata.sceneAcquisitions.size === 0) {
          const geometry = this.geometries.get(key);
          if (geometry) {
            geometry.dispose();
            this.geometries.delete(key);
            this.geometryMetadata.delete(key);
            disposedResources.geometries++;
          }
        }
      }
    }
    
    for (const [key, metadata] of this.materialMetadata.entries()) {
      if (metadata.sceneAcquisitions.has(sceneId)) {
        metadata.sceneAcquisitions.delete(sceneId);
        
        if (metadata.sceneAcquisitions.size === 0) {
          const material = this.materials.get(key);
          if (material) {
            material.dispose();
            this.materials.delete(key);
            this.materialMetadata.delete(key);
            disposedResources.materials++;
          }
        }
      }
    }
    
    for (const [key, metadata] of this.textureMetadata.entries()) {
      if (metadata.sceneAcquisitions.has(sceneId)) {
        metadata.sceneAcquisitions.delete(sceneId);
        
        if (metadata.sceneAcquisitions.size === 0) {
          this.disposeTexture(key);
          disposedResources.textures++;
        }
      }
    }
    
    console.log(`[RenderResourceManager] Disposed ${disposedResources.geometries} geometries, ${disposedResources.materials} materials, ${disposedResources.textures} textures for scene ${sceneId}`);
    this.logMemoryStats();
  }
  
  dispose(): void {
    console.log('[RenderResourceManager] Disposing all resources');
    
    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.textures.forEach((texture) => texture.dispose());
    
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
    
    this.geometryMetadata.clear();
    this.materialMetadata.clear();
    this.textureMetadata.clear();
    
    this.currentTextureMemory = 0;
    
    console.log('[RenderResourceManager] All resources disposed');
  }
  
  logMemoryStats(): void {
    console.log('[RenderResourceManager] Memory Stats:', {
      geometries: this.geometries.size,
      materials: this.materials.size,
      textures: this.textures.size,
      textureMemoryMB: (this.currentTextureMemory / 1024 / 1024).toFixed(2),
    });
  }
  
  reset(): void {
    this.dispose();
    console.log('[RenderResourceManager] Reset complete');
  }
}
