/**
 * Tool Renderer (Gen3)
 * 
 * Visualizes tools on the planet surface:
 * - Digging sticks: Brown cylinder
 * - Gathering poles: Green cylinder (longer)
 * - Wading spears: Blue cylinder with point
 * - Striking stones: Gray sphere
 * 
 * Also shows tool knowledge transmission with visual indicators
 */

import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';
import type { Tool, ToolKnowledge } from '../../systems/ToolSystem.js';

export class ToolRenderer {
  private scene: Scene;
  private toolMeshes: Map<string, Mesh> = new Map();
  private knowledgeIndicators: Map<string, Mesh> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all tools
   */
  render(
    tools: Tool[],
    knowledge: Map<string, ToolKnowledge>,
    creatures: Map<string, { lat: number; lon: number }>
  ): void {
    // Remove old tool meshes
    for (const [id, mesh] of this.toolMeshes) {
      if (!tools.find(t => t.id === id)) {
        mesh.dispose();
        this.toolMeshes.delete(id);
      }
    }

    // Render each tool
    for (const tool of tools) {
      this.renderTool(tool);
    }

    // Render knowledge indicators
    this.renderKnowledgeIndicators(knowledge, creatures);
  }

  /**
   * Render a single tool
   */
  private renderTool(tool: Tool): void {
    let mesh = this.toolMeshes.get(tool.id);

    if (!mesh) {
      // Create mesh based on type
      switch (tool.type) {
        case 'digging_stick':
          mesh = this.createDiggingStick(tool.id);
          break;
        case 'gathering_pole':
          mesh = this.createGatheringPole(tool.id);
          break;
        case 'wading_spear':
          mesh = this.createWadingSpear(tool.id);
          break;
        case 'striking_stone':
          mesh = this.createStrikingStone(tool.id);
          break;
      }

      this.toolMeshes.set(tool.id, mesh);
    }

    // Update position
    const pos = this.latLonToVector3(tool.position.lat, tool.position.lon, 0.1);
    mesh.position.copyFrom(pos);

    // Orient tool to surface
    const normal = pos.normalize();
    mesh.lookAt(normal.add(pos));

    // Scale by durability (tools shrink as they wear)
    const scale = 0.3 + (tool.durability * 0.2); // 0.3-0.5
    mesh.scaling.set(scale, scale, scale);

    // Fade by durability
    if (mesh.material instanceof StandardMaterial) {
      mesh.material.alpha = 0.5 + (tool.durability * 0.5); // 0.5-1.0
    }
  }

  /**
   * Create digging stick (brown cylinder)
   */
  private createDiggingStick(id: string): Mesh {
    const stick = MeshBuilder.CreateCylinder(`tool-stick-${id}`, {
      diameter: 0.05,
      height: 0.4,
      tessellation: 8
    }, this.scene);

    const mat = new StandardMaterial(`mat-stick-${id}`, this.scene);
    mat.diffuseColor = new Color3(0.4, 0.26, 0.13); // Brown
    mat.emissiveColor = new Color3(0.2, 0.13, 0.06);
    stick.material = mat;

    return stick;
  }

  /**
   * Create gathering pole (green cylinder, longer)
   */
  private createGatheringPole(id: string): Mesh {
    const pole = MeshBuilder.CreateCylinder(`tool-pole-${id}`, {
      diameter: 0.04,
      height: 0.6,
      tessellation: 8
    }, this.scene);

    const mat = new StandardMaterial(`mat-pole-${id}`, this.scene);
    mat.diffuseColor = new Color3(0.4, 0.6, 0.2); // Green
    mat.emissiveColor = new Color3(0.2, 0.3, 0.1);
    pole.material = mat;

    return pole;
  }

  /**
   * Create wading spear (blue cylinder with point)
   */
  private createWadingSpear(id: string): Mesh {
    const spear = MeshBuilder.CreateCylinder(`tool-spear-${id}`, {
      diameter: 0.04,
      height: 0.5,
      tessellation: 8
    }, this.scene);

    const mat = new StandardMaterial(`mat-spear-${id}`, this.scene);
    mat.diffuseColor = new Color3(0.2, 0.4, 0.6); // Blue
    mat.emissiveColor = new Color3(0.1, 0.2, 0.3);
    spear.material = mat;

    // Add point (small cone)
    const point = MeshBuilder.CreateCylinder(`tool-spear-point-${id}`, {
      diameterTop: 0,
      diameterBottom: 0.06,
      height: 0.15,
      tessellation: 6
    }, this.scene);
    point.parent = spear;
    point.position.y = 0.3;
    point.material = mat;

    return spear;
  }

  /**
   * Create striking stone (gray sphere)
   */
  private createStrikingStone(id: string): Mesh {
    const stone = MeshBuilder.CreateSphere(`tool-stone-${id}`, {
      diameter: 0.15,
      segments: 8
    }, this.scene);

    const mat = new StandardMaterial(`mat-stone-${id}`, this.scene);
    mat.diffuseColor = new Color3(0.5, 0.5, 0.5); // Gray
    mat.emissiveColor = new Color3(0.2, 0.2, 0.2);
    mat.specularColor = new Color3(0.3, 0.3, 0.3); // Shiny
    stone.material = mat;

    return stone;
  }

  /**
   * Render knowledge indicators (creatures learning/teaching)
   */
  private renderKnowledgeIndicators(
    knowledge: Map<string, ToolKnowledge>,
    creatures: Map<string, { lat: number; lon: number }>
  ): void {
    // Clear old indicators
    for (const [id, mesh] of this.knowledgeIndicators) {
      mesh.dispose();
    }
    this.knowledgeIndicators.clear();

    // Show indicators for teaching creatures
    for (const [creatureId, know] of knowledge) {
      if (know.teaching) {
        const creature = creatures.get(creatureId);
        if (!creature) continue;

        // Create glowing ring above creature
        const ring = MeshBuilder.CreateTorus(`knowledge-${creatureId}`, {
          diameter: 0.3,
          thickness: 0.02,
          tessellation: 16
        }, this.scene);

        const pos = this.latLonToVector3(creature.lat, creature.lon, 0.3);
        ring.position.copyFrom(pos);

        const mat = new StandardMaterial(`mat-knowledge-${creatureId}`, this.scene);
        mat.diffuseColor = new Color3(1, 1, 0); // Yellow
        mat.emissiveColor = new Color3(0.5, 0.5, 0);
        mat.alpha = 0.6;
        ring.material = mat;

        // Rotate ring
        ring.rotation.x = Math.PI / 2;

        this.knowledgeIndicators.set(creatureId, ring);
      }
    }
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
    for (const mesh of this.toolMeshes.values()) {
      mesh.dispose();
    }
    for (const mesh of this.knowledgeIndicators.values()) {
      mesh.dispose();
    }
    this.toolMeshes.clear();
    this.knowledgeIndicators.clear();
  }
}
