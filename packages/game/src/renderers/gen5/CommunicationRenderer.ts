/**
 * Communication Renderer (Gen5)
 *
 * Visualizes symbolic communication:
 * - Symbol markers on surface (shapes + colors)
 * - Teaching indicators (beams of light)
 * - Symbol understanding (glow around creatures)
 */

import type { Scene, Mesh } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Symbol, SymbolKnowledge } from '../../systems/SymbolicCommunicationSystem.js';

export class CommunicationRenderer {
  private scene: Scene;
  private planetRadius: number;
  private symbolMeshes: Map<string, Mesh> = new Map();
  private teachingLines: Map<string, Mesh> = new Map();

  constructor(scene: Scene, planetRadius: number) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all communication elements
   */
  render(
    symbols: Symbol[],
    creatureKnowledge: Map<string, SymbolKnowledge>,
    creaturePositions: Map<string, { lat: number; lon: number }>
  ): void {
    this.renderSymbols(symbols);
    this.renderTeaching(creatureKnowledge, creaturePositions);
    this.cleanupOldMeshes(symbols);
  }

  /**
   * Render symbol markers on surface
   */
  private renderSymbols(symbols: Symbol[]): void {
    for (const symbol of symbols) {
      let mesh = this.symbolMeshes.get(symbol.id);

      if (!mesh) {
        mesh = this.createSymbolMesh(symbol);
        this.symbolMeshes.set(symbol.id, mesh);
      }

      // Update position
      const pos = this.latLonToVector3(symbol.position.lat, symbol.position.lon);
      mesh.position = pos;

      // Orient toward planet center
      mesh.lookAt(Vector3.Zero());
      mesh.rotate(Vector3.Up(), Math.PI / 2);

      // Pulse based on age
      const age = Date.now() - symbol.timestamp;
      const pulse = 1.0 + Math.sin(age / 500) * 0.1;
      mesh.scaling = new Vector3(pulse, pulse, pulse).scale(symbol.size);
    }
  }

  /**
   * Create symbol mesh based on shape and color
   */
  private createSymbolMesh(symbol: Symbol): Mesh {
    let mesh: Mesh;

    // Create shape
    const size = 0.5;
    switch (symbol.shape) {
      case 'circle':
        mesh = MeshBuilder.CreateDisc(symbol.id, { radius: size }, this.scene);
        break;
      case 'triangle':
        mesh = MeshBuilder.CreateCylinder(
          symbol.id,
          {
            diameterTop: 0,
            diameterBottom: size * 2,
            height: size * 1.5,
            tessellation: 3,
          },
          this.scene
        );
        mesh.rotation.x = Math.PI / 2;
        break;
      case 'square':
        mesh = MeshBuilder.CreateBox(symbol.id, { size: size * 1.5 }, this.scene);
        break;
      case 'line':
        mesh = MeshBuilder.CreateCylinder(
          symbol.id,
          {
            diameter: size * 0.3,
            height: size * 2,
          },
          this.scene
        );
        break;
      case 'spiral':
        mesh = MeshBuilder.CreateTorus(
          symbol.id,
          {
            diameter: size * 2,
            thickness: size * 0.3,
            tessellation: 16,
          },
          this.scene
        );
        break;
      case 'cross':
        // Create + shape with two boxes
        const box1 = MeshBuilder.CreateBox(
          `${symbol.id}-v`,
          {
            width: size * 0.4,
            height: size * 2,
            depth: size * 0.4,
          },
          this.scene
        );
        const box2 = MeshBuilder.CreateBox(
          `${symbol.id}-h`,
          {
            width: size * 2,
            height: size * 0.4,
            depth: size * 0.4,
          },
          this.scene
        );
        box2.parent = box1;
        mesh = box1;
        break;
      default:
        mesh = MeshBuilder.CreateSphere(symbol.id, { diameter: size }, this.scene);
    }

    // Apply material
    const material = new StandardMaterial(`${symbol.id}-mat`, this.scene);
    material.diffuseColor = Color3.FromHexString(symbol.color);
    material.emissiveColor = Color3.FromHexString(symbol.color).scale(0.5);
    material.alpha = 0.8;

    mesh.material = material;

    return mesh;
  }

  /**
   * Render teaching indicators
   */
  private renderTeaching(
    creatureKnowledge: Map<string, SymbolKnowledge>,
    creaturePositions: Map<string, { lat: number; lon: number }>
  ): void {
    // Clear old teaching lines
    for (const mesh of this.teachingLines.values()) {
      mesh.dispose();
    }
    this.teachingLines.clear();

    // Find creatures currently teaching
    const teachers: string[] = [];
    for (const [creatureId, knowledge] of creatureKnowledge) {
      if (knowledge.teachingSymbol) {
        teachers.push(creatureId);
      }
    }

    // Render teaching auras
    for (const teacherId of teachers) {
      const position = creaturePositions.get(teacherId);
      if (!position) continue;

      const pos3d = this.latLonToVector3(position.lat, position.lon);

      // Create glowing ring around teacher
      const ring = MeshBuilder.CreateTorus(
        `teach-${teacherId}`,
        {
          diameter: 2,
          thickness: 0.1,
          tessellation: 16,
        },
        this.scene
      );

      ring.position = pos3d;

      const material = new StandardMaterial(`teach-mat-${teacherId}`, this.scene);
      material.emissiveColor = new Color3(1, 1, 0); // Yellow
      material.alpha = 0.6;

      ring.material = material;

      this.teachingLines.set(teacherId, ring);
    }
  }

  /**
   * Clean up meshes for deleted symbols
   */
  private cleanupOldMeshes(symbols: Symbol[]): void {
    const activeIds = new Set(symbols.map((s) => s.id));

    for (const [id, mesh] of this.symbolMeshes) {
      if (!activeIds.has(id)) {
        mesh.dispose();
        this.symbolMeshes.delete(id);
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
    for (const mesh of this.symbolMeshes.values()) {
      mesh.dispose();
    }
    this.symbolMeshes.clear();

    for (const mesh of this.teachingLines.values()) {
      mesh.dispose();
    }
    this.teachingLines.clear();
  }
}
