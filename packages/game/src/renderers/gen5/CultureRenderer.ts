/**
 * Culture Renderer (Gen5)
 * 
 * Visualizes cultural expressions:
 * - Body art (colored auras around creatures)
 * - Dances (movement trails and particles)
 * - Sculptures (decorative 3D objects)
 * - Ceremonies (group effects at cultural sites)
 */

import type { Scene, Mesh } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3, Color3, Color4 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import type {
  CulturalExpression,
  CreatureCulture,
  CulturalSite
} from '../../systems/CulturalExpressionSystem.js';

export class CultureRenderer {
  private scene: Scene;
  private planetRadius: number;
  private bodyArtMeshes: Map<string, Mesh> = new Map();
  private danceTrails: Map<string, Mesh> = new Map();
  private sculptures: Map<string, Mesh> = new Map();
  private siteMarkers: Map<string, Mesh> = new Map();
  private particleSystems: Map<string, ParticleSystem> = new Map();

  constructor(scene: Scene, planetRadius: number) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all cultural elements
   */
  render(
    expressions: CulturalExpression[],
    creatureCultures: Map<string, CreatureCulture>,
    sites: CulturalSite[],
    creaturePositions: Map<string, { lat: number; lon: number }>
  ): void {
    this.renderBodyArt(creatureCultures, creaturePositions, expressions);
    this.renderDances(creatureCultures, creaturePositions, expressions);
    this.renderSculptures(expressions);
    this.renderCulturalSites(sites);
    this.cleanupOldMeshes(expressions, sites, creatureCultures);
  }

  /**
   * Render body art as colored auras
   */
  private renderBodyArt(
    creatureCultures: Map<string, CreatureCulture>,
    creaturePositions: Map<string, { lat: number; lon: number }>,
    expressions: CulturalExpression[]
  ): void {
    for (const [creatureId, culture] of creatureCultures) {
      // Find active body art expression
      const activeExpr = culture.activeExpression
        ? expressions.find(e => e.id === culture.activeExpression && e.type === 'body_art')
        : null;

      if (!activeExpr) {
        // Remove body art mesh if exists
        const mesh = this.bodyArtMeshes.get(creatureId);
        if (mesh) {
          mesh.dispose();
          this.bodyArtMeshes.delete(creatureId);
        }
        continue;
      }

      // Get creature position
      const position = creaturePositions.get(creatureId);
      if (!position) continue;

      const pos3d = this.latLonToVector3(position.lat, position.lon);

      // Create or update body art mesh
      let mesh = this.bodyArtMeshes.get(creatureId);
      if (!mesh) {
        mesh = MeshBuilder.CreateSphere(`bodyart-${creatureId}`, {
          diameter: 1.5
        }, this.scene);

        const material = new StandardMaterial(`bodyart-mat-${creatureId}`, this.scene);
        material.diffuseColor = Color3.FromHexString(activeExpr.pattern || '#ffffff');
        material.emissiveColor = Color3.FromHexString(activeExpr.pattern || '#ffffff').scale(0.3);
        material.alpha = 0.4;
        material.wireframe = true;

        mesh.material = material;
        this.bodyArtMeshes.set(creatureId, mesh);
      }

      mesh.position = pos3d;

      // Pulse effect
      const pulse = 1.0 + Math.sin(Date.now() / 500) * 0.1;
      mesh.scaling = new Vector3(pulse, pulse, pulse);
    }
  }

  /**
   * Render dance movements with particles
   */
  private renderDances(
    creatureCultures: Map<string, CreatureCulture>,
    creaturePositions: Map<string, { lat: number; lon: number }>,
    expressions: CulturalExpression[]
  ): void {
    for (const [creatureId, culture] of creatureCultures) {
      // Find active dance expression
      const activeExpr = culture.activeExpression
        ? expressions.find(e => e.id === culture.activeExpression && e.type === 'dance')
        : null;

      if (!activeExpr) {
        // Remove dance particles if exists
        const particles = this.particleSystems.get(creatureId);
        if (particles) {
          particles.dispose();
          this.particleSystems.delete(creatureId);
        }
        continue;
      }

      // Get creature position
      const position = creaturePositions.get(creatureId);
      if (!position) continue;

      const pos3d = this.latLonToVector3(position.lat, position.lon);

      // Create or update particle system
      let particles = this.particleSystems.get(creatureId);
      if (!particles) {
        particles = new ParticleSystem(`dance-${creatureId}`, 50, this.scene);
        particles.emitter = pos3d;
        particles.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
        particles.maxEmitBox = new Vector3(0.5, 0.5, 0.5);
        
        particles.color1 = new Color4(1, 0.8, 0, 1);
        particles.color2 = new Color4(1, 0.5, 0, 1);
        particles.colorDead = new Color4(1, 0.3, 0, 0);

        particles.minSize = 0.1;
        particles.maxSize = 0.3;

        particles.minLifeTime = 0.5;
        particles.maxLifeTime = 1.0;

        particles.emitRate = 20;

        particles.gravity = new Vector3(0, 0, 0);

        particles.direction1 = new Vector3(-1, -1, -1);
        particles.direction2 = new Vector3(1, 1, 1);

        particles.minEmitPower = 1;
        particles.maxEmitPower = 2;
        particles.updateSpeed = 0.01;

        particles.start();
        this.particleSystems.set(creatureId, particles);
      } else {
        // Update emitter position
        particles.emitter = pos3d;
      }
    }
  }

  /**
   * Render sculpture art objects
   */
  private renderSculptures(expressions: CulturalExpression[]): void {
    for (const expr of expressions) {
      if (expr.type !== 'sculpture' || !expr.position) continue;

      let mesh = this.sculptures.get(expr.id);

      if (!mesh) {
        mesh = this.createSculptureMesh(expr);
        this.sculptures.set(expr.id, mesh);
      }

      // Update position
      const pos = this.latLonToVector3(expr.position.lat, expr.position.lon);
      mesh.position = pos;

      // Orient toward planet center
      mesh.lookAt(Vector3.Zero());
      mesh.rotate(Vector3.Up(), Math.PI / 2);
    }
  }

  /**
   * Create sculpture mesh based on complexity
   */
  private createSculptureMesh(expr: CulturalExpression): Mesh {
    let mesh: Mesh;

    // More complex sculptures have more intricate shapes
    if (expr.complexity > 0.8) {
      // High complexity: Totem pole
      mesh = MeshBuilder.CreateCylinder(`${expr.id}`, {
        diameterTop: 0.3,
        diameterBottom: 0.5,
        height: 2,
        tessellation: 6
      }, this.scene);
    } else if (expr.complexity > 0.5) {
      // Medium complexity: Abstract shape
      mesh = MeshBuilder.CreatePolyhedron(`${expr.id}`, {
        type: 1, // Icosahedron
        size: 0.8
      }, this.scene);
    } else {
      // Low complexity: Simple cairn
      mesh = MeshBuilder.CreateBox(`${expr.id}`, {
        width: 0.6,
        height: 1.2,
        depth: 0.6
      }, this.scene);
    }

    // Apply material
    const material = new StandardMaterial(`${expr.id}-mat`, this.scene);
    material.diffuseColor = new Color3(0.6, 0.5, 0.4); // Stone-like
    material.emissiveColor = new Color3(0.2, 0.15, 0.1);
    material.specularColor = new Color3(0.1, 0.1, 0.1);

    mesh.material = material;

    return mesh;
  }

  /**
   * Render cultural site markers
   */
  private renderCulturalSites(sites: CulturalSite[]): void {
    for (const site of sites) {
      let mesh = this.siteMarkers.get(site.id);

      if (!mesh) {
        mesh = this.createSiteMarker(site);
        this.siteMarkers.set(site.id, mesh);
      }

      // Update position
      const pos = this.latLonToVector3(site.position.lat, site.position.lon);
      mesh.position = pos;

      // Pulse effect
      const pulse = 1.0 + Math.sin(Date.now() / 1000) * 0.15;
      mesh.scaling = new Vector3(pulse, pulse, pulse);
    }
  }

  /**
   * Create cultural site marker
   */
  private createSiteMarker(site: CulturalSite): Mesh {
    let mesh: Mesh;
    let color: Color3;

    switch (site.type) {
      case 'gathering_site':
        mesh = MeshBuilder.CreateTorus(`${site.id}`, {
          diameter: 3,
          thickness: 0.2,
          tessellation: 16
        }, this.scene);
        color = new Color3(0.5, 1, 0.5); // Green
        break;
      case 'art_site':
        mesh = MeshBuilder.CreateTorus(`${site.id}`, {
          diameter: 3,
          thickness: 0.2,
          tessellation: 16
        }, this.scene);
        color = new Color3(1, 0.5, 1); // Magenta
        break;
      case 'ceremonial_site':
        mesh = MeshBuilder.CreateTorus(`${site.id}`, {
          diameter: 3,
          thickness: 0.2,
          tessellation: 16
        }, this.scene);
        color = new Color3(1, 1, 0.5); // Yellow
        break;
    }

    const material = new StandardMaterial(`${site.id}-mat`, this.scene);
    material.emissiveColor = color;
    material.alpha = 0.5;

    mesh.material = material;

    return mesh;
  }

  /**
   * Clean up old meshes
   */
  private cleanupOldMeshes(
    expressions: CulturalExpression[],
    sites: CulturalSite[],
    creatureCultures: Map<string, CreatureCulture>
  ): void {
    // Cleanup sculptures
    const activeExprIds = new Set(expressions.map(e => e.id));
    for (const [id, mesh] of this.sculptures) {
      if (!activeExprIds.has(id)) {
        mesh.dispose();
        this.sculptures.delete(id);
      }
    }

    // Cleanup sites
    const activeSiteIds = new Set(sites.map(s => s.id));
    for (const [id, mesh] of this.siteMarkers) {
      if (!activeSiteIds.has(id)) {
        mesh.dispose();
        this.siteMarkers.delete(id);
      }
    }

    // Cleanup body art for creatures no longer performing
    for (const [creatureId, mesh] of this.bodyArtMeshes) {
      const culture = creatureCultures.get(creatureId);
      const isPerforming = culture?.activeExpression && culture.expressionTimer > 0;
      
      if (!isPerforming) {
        mesh.dispose();
        this.bodyArtMeshes.delete(creatureId);
      }
    }
  }

  /**
   * Convert lat/lon to 3D position
   */
  private latLonToVector3(lat: number, lon: number): Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(this.planetRadius * Math.sin(phi) * Math.cos(theta));
    const z = this.planetRadius * Math.sin(phi) * Math.sin(theta);
    const y = this.planetRadius * Math.cos(phi);

    return new Vector3(x, y, z);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    for (const mesh of this.bodyArtMeshes.values()) {
      mesh.dispose();
    }
    this.bodyArtMeshes.clear();

    for (const mesh of this.danceTrails.values()) {
      mesh.dispose();
    }
    this.danceTrails.clear();

    for (const mesh of this.sculptures.values()) {
      mesh.dispose();
    }
    this.sculptures.clear();

    for (const mesh of this.siteMarkers.values()) {
      mesh.dispose();
    }
    this.siteMarkers.clear();

    for (const particles of this.particleSystems.values()) {
      particles.dispose();
    }
    this.particleSystems.clear();
  }
}
