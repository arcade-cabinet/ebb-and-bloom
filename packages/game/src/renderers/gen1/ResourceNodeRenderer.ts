/**
 * Resource Node Renderer
 * 
 * Renders food sources, water, and other resources on planet surface
 */

import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, Animation } from '@babylonjs/core';

export interface ResourceNode {
  id: string;
  type: 'food' | 'water' | 'shelter';
  position: { lat: number; lon: number };
  amount: number; // 0-1
}

export class ResourceNodeRenderer {
  private scene: Scene;
  private nodes: Map<string, Mesh> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all resource nodes
   */
  render(resources: ResourceNode[]): void {
    // Remove nodes no longer present
    for (const [id, mesh] of this.nodes) {
      if (!resources.find(r => r.id === id)) {
        mesh.dispose();
        this.nodes.delete(id);
      }
    }

    // Add/update nodes
    for (const resource of resources) {
      let mesh = this.nodes.get(resource.id);
      const position = this.latLonToVector3(resource.position.lat, resource.position.lon, 0.1);

      if (!mesh) {
        mesh = this.createResourceMesh(resource);
        this.nodes.set(resource.id, mesh);
      }

      // Update position
      mesh.position.copyFrom(position);

      // Update scale based on amount
      const scale = 0.5 + resource.amount * 0.5; // 0.5 to 1.0
      mesh.scaling.set(scale, scale, scale);

      // Pulse animation for visibility
      if (!mesh.animations || mesh.animations.length === 0) {
        this.addPulseAnimation(mesh);
      }
    }
  }

  /**
   * Create resource mesh based on type
   */
  private createResourceMesh(resource: ResourceNode): Mesh {
    let mesh: Mesh;
    let color: Color3;

    switch (resource.type) {
      case 'food':
        // Berry bush / vegetation
        mesh = MeshBuilder.CreateIcoSphere(`resource-${resource.id}`, {
          radius: 0.3,
          subdivisions: 2
        }, this.scene);
        color = new Color3(0.8, 0.9, 0.2); // Yellow-green
        break;

      case 'water':
        // Water puddle / source
        mesh = MeshBuilder.CreateCylinder(`resource-${resource.id}`, {
          diameter: 0.4,
          height: 0.1,
          tessellation: 16
        }, this.scene);
        color = new Color3(0.2, 0.6, 0.9); // Blue
        break;

      case 'shelter':
        // Rock outcrop / cave
        mesh = MeshBuilder.CreateBox(`resource-${resource.id}`, {
          width: 0.5,
          height: 0.4,
          depth: 0.4
        }, this.scene);
        color = new Color3(0.5, 0.5, 0.5); // Gray
        break;

      default:
        mesh = MeshBuilder.CreateSphere(`resource-${resource.id}`, {
          diameter: 0.3
        }, this.scene);
        color = new Color3(0.7, 0.7, 0.7);
    }

    // Material
    const mat = new StandardMaterial(`mat-${resource.id}`, this.scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.3); // Slight glow
    mat.specularColor = new Color3(0.2, 0.2, 0.2);
    mesh.material = mat;

    return mesh;
  }

  /**
   * Add pulse animation to resource
   */
  private addPulseAnimation(mesh: Mesh): void {
    const frameRate = 30;
    const anim = new Animation(
      `${mesh.name}-pulse`,
      'scaling.y',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const baseScale = mesh.scaling.y;
    const keys = [
      { frame: 0, value: baseScale },
      { frame: frameRate, value: baseScale * 1.1 },
      { frame: frameRate * 2, value: baseScale }
    ];

    anim.setKeys(keys);
    mesh.animations = [anim];

    this.scene.beginAnimation(mesh, 0, frameRate * 2, true);
  }

  /**
   * Convert lat/lon to 3D position
   */
  private latLonToVector3(lat: number, lon: number, alt: number = 0): Vector3 {
    const radius = this.planetRadius + alt;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  dispose(): void {
    for (const mesh of this.nodes.values()) {
      mesh.dispose();
    }
    this.nodes.clear();
  }
}
