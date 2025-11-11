import * as THREE from 'three';

/**
 * Manages Three.js resource lifecycle to prevent memory leaks
 */
export class RenderResourceManager {
  private static geometries = new Set<THREE.BufferGeometry>();
  private static materials = new Set<THREE.Material>();
  private static textures = new Set<THREE.Texture>();

  static register(resource: THREE.BufferGeometry | THREE.Material | THREE.Texture) {
    if (resource instanceof THREE.BufferGeometry) {
      this.geometries.add(resource);
    } else if (resource instanceof THREE.Material) {
      this.materials.add(resource);
    } else if (resource instanceof THREE.Texture) {
      this.textures.add(resource);
    }
  }

  static disposeGeometry(geometry: THREE.BufferGeometry) {
    geometry.dispose();
    this.geometries.delete(geometry);
  }

  static disposeMaterial(material: THREE.Material) {
    material.dispose();
    this.materials.delete(material);
  }

  static disposeTexture(texture: THREE.Texture) {
    texture.dispose();
    this.textures.delete(texture);
  }

  static disposeAll() {
    console.log(`Disposing ${this.geometries.size} geometries, ${this.materials.size} materials, ${this.textures.size} textures`);

    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.textures.forEach(t => t.dispose());

    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();

    THREE.Cache.clear();
  }

  static getStats() {
    return {
      geometries: this.geometries.size,
      materials: this.materials.size,
      textures: this.textures.size
    };
  }
}