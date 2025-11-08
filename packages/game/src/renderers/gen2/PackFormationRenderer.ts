/**
 * Pack Formation Visualizer (Gen2 Prep)
 * 
 * Visualizes creature social groupings with visual indicators:
 * - Pack boundaries (colored auras)
 * - Pack leader indicators
 * - Social bonds (connection lines)
 * - Formation patterns
 */

import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, LinesMesh } from '@babylonjs/core';

export interface PackData {
  id: string;
  leaderId: string;
  members: string[]; // Creature IDs
  cohesion: number; // 0-1, how tight the pack is
  color: string; // Pack identity color
  center: { lat: number; lon: number }; // Pack center point
}

export class PackFormationRenderer {
  private scene: Scene;
  private packAuras: Map<string, Mesh> = new Map();
  private bondLines: Map<string, LinesMesh> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render pack formations with visual indicators
   */
  render(packs: PackData[], creatures: Map<string, { lat: number; lon: number; alt?: number }>): void {
    // Remove old packs
    for (const [id, aura] of this.packAuras) {
      if (!packs.find(p => p.id === id)) {
        aura.dispose();
        this.packAuras.delete(id);
      }
    }

    // Render each pack
    for (const pack of packs) {
      this.renderPackAura(pack, creatures);
      this.renderPackBonds(pack, creatures);
    }
  }

  /**
   * Render pack aura (colored glow around pack members)
   */
  private renderPackAura(pack: PackData, creatures: Map<string, { lat: number; lon: number; alt?: number }>): void {
    // Calculate pack boundary (convex hull of members)
    const memberPositions: Vector3[] = [];
    
    for (const memberId of pack.members) {
      const creature = creatures.get(memberId);
      if (creature) {
        memberPositions.push(this.latLonToVector3(creature.lat, creature.lon, 0.1));
      }
    }

    if (memberPositions.length < 2) return;

    // Calculate center and radius
    const center = this.calculateCenter(memberPositions);
    const radius = this.calculateRadius(center, memberPositions) * (1 + pack.cohesion);

    // Create or update aura
    let aura = this.packAuras.get(pack.id);
    
    if (!aura) {
      aura = MeshBuilder.CreateSphere(`pack-aura-${pack.id}`, {
        diameter: radius * 2,
        segments: 16
      }, this.scene);

      const mat = new StandardMaterial(`pack-mat-${pack.id}`, this.scene);
      const color = Color3.FromHexString(pack.color);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.5);
      mat.alpha = 0.2; // Translucent
      mat.wireframe = true; // Wireframe for pack boundary
      aura.material = mat;

      this.packAuras.set(pack.id, aura);
    }

    // Update position and scale
    aura.position.copyFrom(center);
    aura.scaling.set(1, 1, 1);

    // Pulse animation based on cohesion
    const pulseSpeed = (1 - pack.cohesion) * 0.1;
    const scale = 1 + Math.sin(Date.now() * 0.001) * pulseSpeed;
    aura.scaling.set(scale, scale, scale);
  }

  /**
   * Render bonds between pack members
   */
  private renderPackBonds(pack: PackData, creatures: Map<string, { lat: number; lon: number; alt?: number }>): void {
    const bondKey = `bonds-${pack.id}`;
    
    // Remove old bonds
    const oldBonds = this.bondLines.get(bondKey);
    if (oldBonds) {
      oldBonds.dispose();
    }

    // Create new bonds
    const points: Vector3[] = [];
    const leaderPos = creatures.get(pack.leaderId);
    
    if (!leaderPos) return;

    const leaderVec = this.latLonToVector3(leaderPos.lat, leaderPos.lon, 0.15);

    // Draw lines from leader to each member
    for (const memberId of pack.members) {
      if (memberId === pack.leaderId) continue;
      
      const member = creatures.get(memberId);
      if (!member) continue;

      const memberVec = this.latLonToVector3(member.lat, member.lon, 0.15);
      
      points.push(leaderVec);
      points.push(memberVec);
    }

    if (points.length < 2) return;

    // Create lines mesh
    const bonds = MeshBuilder.CreateLines(bondKey, {
      points: points,
      updatable: true
    }, this.scene);

    const color = Color3.FromHexString(pack.color);
    bonds.color = color;
    bonds.alpha = 0.3 * pack.cohesion; // Fade with cohesion

    this.bondLines.set(bondKey, bonds);
  }

  /**
   * Calculate geometric center of positions
   */
  private calculateCenter(positions: Vector3[]): Vector3 {
    const sum = positions.reduce((acc, pos) => acc.add(pos), Vector3.Zero());
    return sum.scale(1 / positions.length);
  }

  /**
   * Calculate radius that encompasses all positions
   */
  private calculateRadius(center: Vector3, positions: Vector3[]): number {
    let maxDist = 0;
    for (const pos of positions) {
      const dist = Vector3.Distance(center, pos);
      if (dist > maxDist) maxDist = dist;
    }
    return maxDist * 1.2; // 20% padding
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
    for (const aura of this.packAuras.values()) {
      aura.dispose();
    }
    for (const bonds of this.bondLines.values()) {
      bonds.dispose();
    }
    this.packAuras.clear();
    this.bondLines.clear();
  }
}
