/**
 * Structure Renderer (Gen3)
 *
 * Visualizes creature-built structures:
 * - Burrows: Underground entrance (circular opening with mound)
 * - Platforms: Elevated tree nest (flat platform)
 * - Stiltworks: Water structures (platform on stilts)
 * - Windbreaks: Ground shelter (angled wall)
 *
 * Shows construction progress and structural state
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  PBRMaterial,
  Color3,
  Vector3,
  Mesh,
  TransformNode,
} from '@babylonjs/core';
import type { Structure, BuildingProject } from '../../systems/StructureBuildingSystem.js';

export class StructureRenderer {
  private scene: Scene;
  private structureMeshes: Map<string, TransformNode> = new Map();
  private projectMeshes: Map<string, Mesh> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all structures and projects
   */
  render(structures: Structure[], projects: BuildingProject[]): void {
    // Remove old structures
    for (const [id, node] of this.structureMeshes) {
      if (!structures.find((s) => s.id === id)) {
        node.dispose();
        this.structureMeshes.delete(id);
      }
    }

    // Render complete structures
    for (const structure of structures) {
      this.renderStructure(structure);
    }

    // Remove old projects
    for (const [id, mesh] of this.projectMeshes) {
      if (!projects.find((p) => `project-${p.structureId}` === id)) {
        mesh.dispose();
        this.projectMeshes.delete(id);
      }
    }

    // Render building projects
    for (const project of projects) {
      this.renderProject(project);
    }
  }

  /**
   * Render a complete structure
   */
  private renderStructure(structure: Structure): void {
    let node = this.structureMeshes.get(structure.id);

    if (!node) {
      // Create structure based on type
      switch (structure.type) {
        case 'burrow':
          node = this.createBurrow(structure.id);
          break;
        case 'platform':
          node = this.createPlatform(structure.id);
          break;
        case 'stiltwork':
          node = this.createStiltwork(structure.id);
          break;
        case 'windbreak':
          node = this.createWindbreak(structure.id);
          break;
      }

      this.structureMeshes.set(structure.id, node);
    }

    // Update position
    const pos = this.latLonToVector3(structure.position.lat, structure.position.lon, 0.05);
    node.position.copyFrom(pos);

    // Orient to surface
    const normal = pos.normalize();

    // Align to surface normal
    node.lookAt(normal.add(pos));

    // Scale by durability
    const scale = 0.8 + structure.durability * 0.2; // 0.8-1.0
    node.scaling.set(scale, scale, scale);

    // Show occupancy with glow
    if (structure.occupants.size > 0) {
      this.addOccupancyGlow(node, structure.occupants.size / structure.capacity);
    }
  }

  /**
   * Create burrow structure (circular entrance with mound)
   */
  private createBurrow(id: string): TransformNode {
    const root = new TransformNode(`burrow-${id}`, this.scene);

    // Entrance (dark circle)
    const entrance = MeshBuilder.CreateDisc(
      `burrow-entrance-${id}`,
      {
        radius: 0.3,
        tessellation: 16,
      },
      this.scene
    );
    entrance.parent = root;
    entrance.rotation.x = Math.PI / 2;
    entrance.position.y = -0.05;

    const entranceMat = new StandardMaterial(`mat-entrance-${id}`, this.scene);
    entranceMat.diffuseColor = new Color3(0.1, 0.08, 0.05); // Dark brown
    entranceMat.emissiveColor = new Color3(0.05, 0.04, 0.025);
    entrance.material = entranceMat;

    // Mound (raised dirt)
    const mound = MeshBuilder.CreateCylinder(
      `burrow-mound-${id}`,
      {
        diameter: 0.8,
        height: 0.2,
        tessellation: 16,
      },
      this.scene
    );
    mound.parent = root;
    mound.position.y = 0.05;

    const moundMat = new PBRMaterial(`mat-mound-${id}`, this.scene);
    moundMat.albedoColor = new Color3(0.4, 0.3, 0.2); // Brown earth
    moundMat.metallic = 0;
    moundMat.roughness = 1;
    mound.material = moundMat;

    return root;
  }

  /**
   * Create platform structure (elevated nest)
   */
  private createPlatform(id: string): TransformNode {
    const root = new TransformNode(`platform-${id}`, this.scene);

    // Platform base
    const platform = MeshBuilder.CreateDisc(
      `platform-base-${id}`,
      {
        radius: 0.5,
        tessellation: 20,
      },
      this.scene
    );
    platform.parent = root;
    platform.rotation.x = Math.PI / 2;
    platform.position.y = 0.3; // Elevated

    const platformMat = new PBRMaterial(`mat-platform-${id}`, this.scene);
    platformMat.albedoColor = new Color3(0.5, 0.4, 0.2); // Wood
    platformMat.metallic = 0;
    platformMat.roughness = 0.9;
    platform.material = platformMat;

    // Support branches (4 legs)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 0.3;
      const z = Math.sin(angle) * 0.3;

      const branch = MeshBuilder.CreateCylinder(
        `platform-leg-${id}-${i}`,
        {
          diameter: 0.05,
          height: 0.3,
          tessellation: 6,
        },
        this.scene
      );
      branch.parent = root;
      branch.position.set(x, 0.15, z);
      branch.material = platformMat;
    }

    return root;
  }

  /**
   * Create stiltwork structure (water platform)
   */
  private createStiltwork(id: string): TransformNode {
    const root = new TransformNode(`stilt-${id}`, this.scene);

    // Platform
    const platform = MeshBuilder.CreateBox(
      `stilt-platform-${id}`,
      {
        width: 0.8,
        height: 0.1,
        depth: 0.8,
      },
      this.scene
    );
    platform.parent = root;
    platform.position.y = 0.5; // Above water

    const platformMat = new PBRMaterial(`mat-stilt-${id}`, this.scene);
    platformMat.albedoColor = new Color3(0.6, 0.5, 0.3); // Reeds/wood
    platformMat.metallic = 0;
    platformMat.roughness = 0.8;
    platform.material = platformMat;

    // Stilts (6 legs)
    const positions = [
      [-0.3, -0.3],
      [0.3, -0.3], // Front
      [-0.3, 0.3],
      [0.3, 0.3], // Back
      [0, -0.3],
      [0, 0.3], // Middle
    ];

    for (let i = 0; i < positions.length; i++) {
      const [x, z] = positions[i];

      const stilt = MeshBuilder.CreateCylinder(
        `stilt-leg-${id}-${i}`,
        {
          diameter: 0.06,
          height: 0.5,
          tessellation: 8,
        },
        this.scene
      );
      stilt.parent = root;
      stilt.position.set(x, 0.25, z);
      stilt.material = platformMat;
    }

    return root;
  }

  /**
   * Create windbreak structure (angled wall)
   */
  private createWindbreak(id: string): TransformNode {
    const root = new TransformNode(`windbreak-${id}`, this.scene);

    // Wall (angled box)
    const wall = MeshBuilder.CreateBox(
      `windbreak-wall-${id}`,
      {
        width: 1.2,
        height: 0.6,
        depth: 0.1,
      },
      this.scene
    );
    wall.parent = root;
    wall.rotation.x = Math.PI / 6; // Angled
    wall.position.y = 0.3;

    const wallMat = new PBRMaterial(`mat-windbreak-${id}`, this.scene);
    wallMat.albedoColor = new Color3(0.5, 0.4, 0.2); // Wood/grass
    wallMat.metallic = 0;
    wallMat.roughness = 1;
    wall.material = wallMat;

    // Support posts (3)
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.5; // -0.5, 0, 0.5

      const post = MeshBuilder.CreateCylinder(
        `windbreak-post-${id}-${i}`,
        {
          diameter: 0.06,
          height: 0.4,
          tessellation: 6,
        },
        this.scene
      );
      post.parent = root;
      post.position.set(x, 0.2, 0);
      post.material = wallMat;
    }

    return root;
  }

  /**
   * Render building project (ghosted preview)
   */
  private renderProject(project: BuildingProject): void {
    const projectId = `project-${project.structureId}`;
    let mesh = this.projectMeshes.get(projectId);

    if (!mesh) {
      // Create ghost mesh (simple box)
      mesh = MeshBuilder.CreateBox(
        projectId,
        {
          width: 0.5,
          height: 0.5,
          depth: 0.5,
        },
        this.scene
      );

      const mat = new StandardMaterial(`mat-${projectId}`, this.scene);
      mat.diffuseColor = new Color3(1, 1, 0); // Yellow
      mat.emissiveColor = new Color3(0.5, 0.5, 0);
      mat.alpha = 0.3; // Ghosted
      mat.wireframe = true; // Wireframe preview
      mesh.material = mat;

      this.projectMeshes.set(projectId, mesh);
    }

    // Update position
    const pos = this.latLonToVector3(project.location.lat, project.location.lon, 0.25);
    mesh.position.copyFrom(pos);

    // Pulse based on progress
    const totalWork = Array.from(project.contributors.values()).reduce((sum, w) => sum + w, 0);
    const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1 * totalWork;
    mesh.scaling.set(pulse, pulse, pulse);
  }

  /**
   * Add occupancy glow to structure
   */
  private addOccupancyGlow(node: TransformNode, occupancyRatio: number): void {
    // Find or create glow mesh
    let glow = node.getChildMeshes().find((m) => m.name.includes('glow'));

    if (!glow) {
      glow = MeshBuilder.CreateSphere(
        `glow-${node.name}`,
        {
          diameter: 0.5,
          segments: 8,
        },
        this.scene
      );
      glow.parent = node;

      const mat = new StandardMaterial(`mat-glow-${node.name}`, this.scene);
      mat.emissiveColor = new Color3(1, 0.8, 0.2); // Warm glow
      mat.alpha = 0.3;
      glow.material = mat;
    }

    // Scale glow by occupancy
    const scale = 0.5 + occupancyRatio * 0.5;
    glow.scaling.set(scale, scale, scale);
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
    for (const node of this.structureMeshes.values()) {
      node.dispose();
    }
    for (const mesh of this.projectMeshes.values()) {
      mesh.dispose();
    }
    this.structureMeshes.clear();
    this.projectMeshes.clear();
  }
}
