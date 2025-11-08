/**
 * Gen0 Planet Renderer - Macro Level
 * 
 * Handles visual interpretation of Gen0 planetary data:
 * - WARP (through-line): Planetary evolution from accretion → cooling → stabilization
 * - WEFT (horizontal): Archetype synthesis (terrestrial + ice + volcanic variants)
 * - Parameterization: Visual ranges from WARP/WEFT that Yuka can vary
 * 
 * Backend provides: Protobuf data with archetype references
 * Frontend interprets: Visual blueprints + PBR properties + textures
 */

import { Scene, MeshBuilder, Mesh, PBRMaterial, Color3 } from '@babylonjs/core';
import { loadTexture } from '../../utils/textureLoader';
import type { Planet } from '../../schemas';
import type { VisualRepresentation, PBRProperties } from '@ebb/gen/schemas';

export interface Gen0RenderData {
  planet: Planet;
  visualBlueprint: {
    primaryTexture?: string;
    colorPalette?: string[];
    pbrProperties?: PBRProperties;
    textureReferences?: string[];
    visualProperties?: any;
    representations?: any;
  };
}

export class PlanetRenderer {
  private scene: Scene;
  private mesh: Mesh | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Render planet from Gen0 data + visual blueprint
   * Interprets WARP/WEFT archetypes as visual parameters
   */
  async render(data: Gen0RenderData): Promise<Mesh> {
    const { planet, visualBlueprint } = data;

    // Create planet sphere (macro level)
    this.mesh = MeshBuilder.CreateSphere('planet', {
      segments: 64,
      diameter: (planet.radius / 1000) * 2, // Scale to scene units
    }, this.scene);

    // Apply PBR material from visual blueprint
    const material = await this.createMaterial(visualBlueprint);
    this.mesh.material = material;

    // Rotate based on rotation period (animation)
    if (planet.rotationPeriod > 0) {
      const rotationSpeed = (2 * Math.PI) / planet.rotationPeriod;
      this.scene.registerBeforeRender(() => {
        if (this.mesh) {
          this.mesh.rotation.y += rotationSpeed * this.scene.getEngine().getDeltaTime() / 1000;
        }
      });
    }

    return this.mesh;
  }

  /**
   * Create PBR material from visual blueprint
   * Handles multiple archetype data formats (WARP/WEFT synthesis)
   */
  private async createMaterial(blueprint: any): Promise<PBRMaterial> {
    const material = new PBRMaterial('planetMaterial', this.scene);

    // Extract PBR properties (from archetype synthesis)
    const pbr = this.extractPBRProperties(blueprint);
    
    if (pbr) {
      material.albedoColor = Color3.FromHexString(pbr.baseColor);
      material.roughness = pbr.roughness ?? 0.7;
      material.metallic = pbr.metallic ?? 0.1;
      
      if (pbr.emissive && pbr.emissive !== '#000000') {
        material.emissiveColor = Color3.FromHexString(pbr.emissive);
        material.emissiveIntensity = 0.2;
      }
      
      if (pbr.aoStrength !== undefined) {
        material.ambientTextureStrength = pbr.aoStrength;
      }
      
      if (pbr.heightScale !== undefined) {
        material.parallaxScaleBias = pbr.heightScale;
      }
    } else {
      // Default fallback
      material.albedoColor = Color3.FromHexString('#4A5568');
      material.roughness = 0.7;
      material.metallic = 0.1;
    }

    // Load textures from archetype references
    const textureIds = this.extractTextureReferences(blueprint);
    if (textureIds.length > 0) {
      const primaryTexture = await loadTexture(textureIds[0], this.scene);
      if (primaryTexture) {
        material.albedoTexture = primaryTexture;
      }
    }

    // Apply color palette if available (procedural variation from WEFT)
    if (blueprint.visualProperties?.colorPalette?.length > 0) {
      if (!pbr || !pbr.baseColor) {
        material.albedoColor = Color3.FromHexString(blueprint.visualProperties.colorPalette[0]);
      }
    }

    return material;
  }

  /**
   * Extract PBR properties from various archetype formats
   * Handles WARP (evolution) and WEFT (synthesis) variations
   */
  private extractPBRProperties(blueprint: any): PBRProperties | null {
    // Direct structure
    if (blueprint.visualProperties?.pbrProperties) {
      return blueprint.visualProperties.pbrProperties as PBRProperties;
    }
    
    // Nested structure (from game engine)
    if (blueprint.representations?.shaders?.baseColor) {
      const shaders = blueprint.representations.shaders;
      return {
        baseColor: shaders.baseColor || '#4A5568',
        roughness: shaders.roughness || 0.7,
        metallic: shaders.metallic || 0.1,
        emissive: shaders.emissive,
        normalStrength: shaders.normalStrength,
        aoStrength: shaders.aoStrength,
        heightScale: shaders.heightScale,
      } as PBRProperties;
    }
    
    // Flat structure
    if (blueprint.representations?.baseColor) {
      return blueprint.representations as PBRProperties;
    }
    
    return null;
  }

  /**
   * Extract texture references from archetype data
   */
  private extractTextureReferences(blueprint: any): string[] {
    if (blueprint.textureReferences?.length > 0) {
      return blueprint.textureReferences;
    }
    
    if (blueprint.representations?.materials?.length > 0) {
      return blueprint.representations.materials;
    }
    
    if (blueprint.visualProperties?.primaryTextures?.length > 0) {
      return blueprint.visualProperties.primaryTextures;
    }
    
    return [];
  }

  /**
   * Update visual parameters (for WARP evolution over time)
   */
  updateEvolution(evolutionFactor: number): void {
    // Apply visual changes based on planetary evolution
    // e.g., cooling = darker emissive, more roughness
    if (this.mesh && this.mesh.material instanceof PBRMaterial) {
      const material = this.mesh.material;
      material.emissiveIntensity = Math.max(0, 0.2 - evolutionFactor * 0.15);
      material.roughness = Math.min(1, 0.7 + evolutionFactor * 0.2);
    }
  }

  dispose(): void {
    this.mesh?.dispose();
    this.mesh = null;
  }
}
