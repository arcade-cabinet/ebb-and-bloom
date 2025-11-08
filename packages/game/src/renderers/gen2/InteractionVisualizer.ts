/**
 * Interaction Visualizer (Gen2)
 * 
 * Renders visual indicators for creature interactions:
 * - Territorial disputes (red sparks/flashes)
 * - Social bonds (connection lines)
 * - Predation (chase indicators)
 */

import { Scene, MeshBuilder, Color3, Vector3, LinesMesh, ParticleSystem } from '@babylonjs/core';
import type { Interaction } from '../../systems/CreatureInteractionSystem.js';

export class InteractionVisualizer {
  private scene: Scene;
  private interactionMarkers: Map<string, LinesMesh> = new Map();
  private particleSystems: Map<string, ParticleSystem> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render visual indicators for interactions
   */
  render(
    interactions: Interaction[],
    creatures: Map<string, { lat: number; lon: number; alt?: number }>
  ): void {
    // Remove old markers
    for (const [id, marker] of this.interactionMarkers) {
      if (!interactions.find(i => this.getInteractionId(i) === id)) {
        marker.dispose();
        this.interactionMarkers.delete(id);
      }
    }

    // Render each interaction
    for (const interaction of interactions) {
      const id = this.getInteractionId(interaction);
      
      switch (interaction.type) {
        case 'territorial':
          this.renderTerritorialDispute(id, interaction, creatures);
          break;
        case 'social':
          this.renderSocialBond(id, interaction, creatures);
          break;
        case 'predation':
          this.renderPredation(id, interaction, creatures);
          break;
        case 'pack_coordination':
          this.renderPackCoordination(id, interaction, creatures);
          break;
      }
    }
  }

  /**
   * Territorial disputes: Red sparks between creatures
   */
  private renderTerritorialDispute(
    id: string,
    interaction: Interaction,
    creatures: Map<string, { lat: number; lon: number; alt?: number }>
  ): void {
    const actor = creatures.get(interaction.actorId);
    const target = creatures.get(interaction.targetId);
    
    if (!actor || !target) return;

    const actorPos = this.latLonToVector3(actor.lat, actor.lon, 0.2);
    const targetPos = this.latLonToVector3(target.lat, target.lon, 0.2);

    // Draw line between creatures
    let line = this.interactionMarkers.get(id);
    
    if (!line) {
      line = MeshBuilder.CreateLines(`territorial-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      
      line.color = new Color3(1, 0, 0); // Red
      line.alpha = 0.6 * interaction.strength;
      
      this.interactionMarkers.set(id, line);
    } else {
      // Update positions
      line.dispose();
      line = MeshBuilder.CreateLines(`territorial-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      line.color = new Color3(1, 0, 0);
      line.alpha = 0.6 * interaction.strength;
      this.interactionMarkers.set(id, line);
    }
  }

  /**
   * Social bonds: Green lines (subtle)
   */
  private renderSocialBond(
    id: string,
    interaction: Interaction,
    creatures: Map<string, { lat: number; lon: number; alt?: number }>
  ): void {
    const actor = creatures.get(interaction.actorId);
    const target = creatures.get(interaction.targetId);
    
    if (!actor || !target) return;

    const actorPos = this.latLonToVector3(actor.lat, actor.lon, 0.15);
    const targetPos = this.latLonToVector3(target.lat, target.lon, 0.15);

    let line = this.interactionMarkers.get(id);
    
    if (!line) {
      line = MeshBuilder.CreateLines(`social-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      
      line.color = new Color3(0, 1, 0); // Green
      line.alpha = 0.3;
      
      this.interactionMarkers.set(id, line);
    } else {
      // Update positions
      line.dispose();
      line = MeshBuilder.CreateLines(`social-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      line.color = new Color3(0, 1, 0);
      line.alpha = 0.3;
      this.interactionMarkers.set(id, line);
    }
  }

  /**
   * Predation: Orange chase indicator
   */
  private renderPredation(
    id: string,
    interaction: Interaction,
    creatures: Map<string, { lat: number; lon: number; alt?: number }>
  ): void {
    const actor = creatures.get(interaction.actorId);
    const target = creatures.get(interaction.targetId);
    
    if (!actor || !target) return;

    const actorPos = this.latLonToVector3(actor.lat, actor.lon, 0.2);
    const targetPos = this.latLonToVector3(target.lat, target.lon, 0.2);

    let line = this.interactionMarkers.get(id);
    
    if (!line) {
      line = MeshBuilder.CreateLines(`predation-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      
      line.color = new Color3(1, 0.5, 0); // Orange
      line.alpha = 0.8;
      
      this.interactionMarkers.set(id, line);
    } else {
      // Update positions
      line.dispose();
      line = MeshBuilder.CreateLines(`predation-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      line.color = new Color3(1, 0.5, 0);
      line.alpha = 0.8;
      this.interactionMarkers.set(id, line);
    }
  }

  /**
   * Pack coordination: Cyan connections
   */
  private renderPackCoordination(
    id: string,
    interaction: Interaction,
    creatures: Map<string, { lat: number; lon: number; alt?: number }>
  ): void {
    const actor = creatures.get(interaction.actorId);
    const target = creatures.get(interaction.targetId);
    
    if (!actor || !target) return;

    const actorPos = this.latLonToVector3(actor.lat, actor.lon, 0.15);
    const targetPos = this.latLonToVector3(target.lat, target.lon, 0.15);

    let line = this.interactionMarkers.get(id);
    
    if (!line) {
      line = MeshBuilder.CreateLines(`pack-${id}`, {
        points: [actorPos, targetPos],
        updatable: true
      }, this.scene);
      
      line.color = new Color3(0, 1, 1); // Cyan
      line.alpha = 0.4;
      
      this.interactionMarkers.set(id, line);
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

  /**
   * Generate unique ID for interaction
   */
  private getInteractionId(interaction: Interaction): string {
    return `${interaction.type}-${interaction.actorId}-${interaction.targetId}`;
  }

  dispose(): void {
    for (const marker of this.interactionMarkers.values()) {
      marker.dispose();
    }
    for (const ps of this.particleSystems.values()) {
      ps.dispose();
    }
    this.interactionMarkers.clear();
    this.particleSystems.clear();
  }
}
