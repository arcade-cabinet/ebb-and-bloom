/**
 * Gen0 Moon Renderer - Meso Level
 * 
 * Handles orbital mechanics and visual interpretation:
 * - WARP: Moon formation → orbital stabilization
 * - WEFT: Captured asteroids + volcanic moons + ice moons
 * - Parameterization: Orbital paths, sizes, compositions
 */

import { Scene, MeshBuilder, Mesh, PBRMaterial, Color3 } from '@babylonjs/core';

export interface MoonData {
  id: string;
  radius: number;
  distance: number;
  orbitalPeriod: number;
  composition?: 'rocky' | 'icy' | 'mixed';
}

export class MoonRenderer {
  private scene: Scene;
  private meshes: Map<string, Mesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Render moons with orbital mechanics
   */
  render(moons: MoonData[]): void {
    // Clear existing
    this.meshes.forEach(m => m.dispose());
    this.meshes.clear();

    for (const moon of moons) {
      const mesh = this.createMoon(moon);
      this.meshes.set(moon.id, mesh);
    }
  }

  private createMoon(data: MoonData): Mesh {
    const mesh = MeshBuilder.CreateSphere(`moon_${data.id}`, {
      segments: 32,
      diameter: (data.radius / 1000) * 2,
    }, this.scene);

    // Position at orbital distance
    const orbitalDistance = (data.distance / 1000) * 2;
    mesh.position.x = orbitalDistance;

    // Create material based on composition (WEFT archetype)
    const material = new PBRMaterial(`moonMat_${data.id}`, this.scene);
    
    switch (data.composition as string) {
      case 'icy':
        material.albedoColor = Color3.FromHexString('#C0D6DF');
        material.roughness = 0.3;
        material.metallic = 0;
        break;
      case 'volcanic':
        material.albedoColor = Color3.FromHexString('#8B4513');
        material.emissiveColor = Color3.FromHexString('#FF4500');
        material.emissiveIntensity = 0.1;
        material.roughness = 0.9;
        material.metallic = 0.1;
        break;
      default: // rocky
        material.albedoColor = Color3.FromHexString('#696969');
        material.roughness = 0.8;
        material.metallic = 0.05;
    }

    mesh.material = material;
    return mesh;
  }

  /**
   * Update orbital positions based on time (WARP evolution)
   */
  updateOrbitalPositions(time: number): void {
    this.meshes.forEach((mesh, _id) => {
      const moonData = this.getMoonDataFromMesh(mesh);
      if (!moonData) return;

      const angle = (time / moonData.orbitalPeriod) * Math.PI * 2;
      const orbitalDistance = (moonData.distance / 1000) * 2;
      
      mesh.position.x = Math.cos(angle) * orbitalDistance;
      mesh.position.z = Math.sin(angle) * orbitalDistance;
    });
  }

  private getMoonDataFromMesh(_mesh: Mesh): MoonData | null {
    // Extract from mesh name/metadata
    // Simplified - in real implementation, store in mesh.metadata
    return null;
  }

  dispose(): void {
    this.meshes.forEach(m => m.dispose());
    this.meshes.clear();
  }
}
