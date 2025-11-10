/**
 * Gen4 Civilization Renderer
 *
 * Visualizes advanced civilization features:
 * - Trade routes (lines between traders)
 * - Specialization badges (icons above creatures)
 * - Workshops (upgraded structure visuals)
 * - Advanced tools (enhanced tool models)
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  LinesMesh,
} from '@babylonjs/core';
import type { TradeOffer } from '../../systems/TradeSystem.js';
import type { Specialization } from '../../systems/SpecializationSystem.js';
import type { Workshop } from '../../systems/WorkshopSystem.js';

export class CivilizationRenderer {
  private scene: Scene;
  private tradeLines: Map<string, LinesMesh> = new Map();
  private specializationBadges: Map<string, Mesh> = new Map();
  private workshopMarkers: Map<string, Mesh> = new Map();
  private planetRadius: number;

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render all civilization features
   */
  render(
    tradeOffers: TradeOffer[],
    specializations: Specialization[],
    workshops: Workshop[],
    creatures: Map<string, { lat: number; lon: number }>
  ): void {
    this.renderTradeRoutes(tradeOffers, creatures);
    this.renderSpecializationBadges(specializations, creatures);
    this.renderWorkshops(workshops);
  }

  /**
   * Render trade routes between creatures
   */
  private renderTradeRoutes(
    offers: TradeOffer[],
    creatures: Map<string, { lat: number; lon: number }>
  ): void {
    // Remove old lines
    for (const [id, line] of this.tradeLines) {
      if (!offers.find((o) => o.id === id)) {
        line.dispose();
        this.tradeLines.delete(id);
      }
    }

    // Render active trade offers
    for (const offer of offers) {
      const offerer = creatures.get(offer.offererId);
      if (!offerer) continue;

      const offererPos = this.latLonToVector3(offerer.lat, offerer.lon, 0.2);

      // If targeted trade, draw line to target
      if (offer.targetId) {
        const target = creatures.get(offer.targetId);
        if (target) {
          const targetPos = this.latLonToVector3(target.lat, target.lon, 0.2);
          this.createTradeLine(offer.id, offererPos, targetPos, offer.offeringType);
        }
      } else {
        // Open offer: draw pulsing marker above offerer
        this.createTradeMarker(offer.id, offererPos, offer.offeringType);
      }
    }
  }

  /**
   * Create trade line between two creatures
   */
  private createTradeLine(offerId: string, start: Vector3, end: Vector3, tradeType: string): void {
    let line = this.tradeLines.get(offerId);

    if (!line) {
      line = MeshBuilder.CreateLines(
        `trade-${offerId}`,
        {
          points: [start, end],
          updatable: true,
        },
        this.scene
      );

      // Color by trade type
      const color = this.getTradeColor(tradeType);
      line.color = color;
      line.alpha = 0.5;

      this.tradeLines.set(offerId, line);
    } else {
      // Update line positions
      line.dispose();
      line = MeshBuilder.CreateLines(
        `trade-${offerId}`,
        {
          points: [start, end],
        },
        this.scene
      );
      line.color = this.getTradeColor(tradeType);
      line.alpha = 0.5;
      this.tradeLines.set(offerId, line);
    }
  }

  /**
   * Create trade marker (pulsing sphere)
   */
  private createTradeMarker(offerId: string, position: Vector3, tradeType: string): void {
    let marker = this.tradeLines.get(`marker-${offerId}`) as Mesh;

    if (!marker) {
      marker = MeshBuilder.CreateSphere(
        `trade-marker-${offerId}`,
        {
          diameter: 0.2,
          segments: 8,
        },
        this.scene
      );

      const mat = new StandardMaterial(`mat-trade-${offerId}`, this.scene);
      const color = this.getTradeColor(tradeType);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.5);
      mat.alpha = 0.6;
      marker.material = mat;

      (this.tradeLines as any).set(`marker-${offerId}`, marker);
    }

    marker.position.copyFrom(position);

    // Pulse animation
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    marker.scaling.set(pulse, pulse, pulse);
  }

  /**
   * Get color for trade type
   */
  private getTradeColor(tradeType: string): Color3 {
    switch (tradeType) {
      case 'tool':
        return new Color3(0.8, 0.8, 0.2); // Yellow
      case 'food':
        return new Color3(0.2, 0.8, 0.2); // Green
      case 'material':
        return new Color3(0.6, 0.4, 0.2); // Brown
      default:
        return new Color3(1, 1, 1); // White
    }
  }

  /**
   * Render specialization badges above creatures
   */
  private renderSpecializationBadges(
    specializations: Specialization[],
    creatures: Map<string, { lat: number; lon: number }>
  ): void {
    // Remove old badges
    for (const [id, badge] of this.specializationBadges) {
      if (!specializations.find((s) => s.creatureId === id)) {
        badge.dispose();
        this.specializationBadges.delete(id);
      }
    }

    // Render badges for specialized creatures
    for (const spec of specializations) {
      if (spec.role === 'generalist') continue; // No badge for generalists

      const creature = creatures.get(spec.creatureId);
      if (!creature) continue;

      const pos = this.latLonToVector3(creature.lat, creature.lon, 0.4);
      this.createSpecializationBadge(spec.creatureId, pos, spec.role, spec.proficiency);
    }
  }

  /**
   * Create specialization badge
   */
  private createSpecializationBadge(
    creatureId: string,
    position: Vector3,
    role: string,
    proficiency: number
  ): void {
    let badge = this.specializationBadges.get(creatureId);

    if (!badge) {
      // Create badge (simple shape based on role)
      badge = this.createRoleBadge(creatureId, role);
      this.specializationBadges.set(creatureId, badge);
    }

    badge.position.copyFrom(position);

    // Scale badge by proficiency (0.5-1.0)
    const scale = 0.5 + proficiency * 0.5;
    badge.scaling.set(scale, scale, scale);

    // Rotate to face camera
    badge.rotation.y = Date.now() * 0.001;
  }

  /**
   * Create role-specific badge shape
   */
  private createRoleBadge(creatureId: string, role: string): Mesh {
    let badge: Mesh;
    const mat = new StandardMaterial(`badge-mat-${creatureId}`, this.scene);

    switch (role) {
      case 'hunter':
        // Triangle (spear)
        badge = MeshBuilder.CreateCylinder(
          `badge-${creatureId}`,
          {
            diameterTop: 0,
            diameterBottom: 0.15,
            height: 0.2,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.8, 0.2, 0.2); // Red
        break;

      case 'builder':
        // Cube (building block)
        badge = MeshBuilder.CreateBox(
          `badge-${creatureId}`,
          {
            size: 0.15,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.6, 0.4, 0.2); // Brown
        break;

      case 'crafter':
        // Torus (tool)
        badge = MeshBuilder.CreateTorus(
          `badge-${creatureId}`,
          {
            diameter: 0.15,
            thickness: 0.03,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.8, 0.8, 0.2); // Yellow
        break;

      case 'scout':
        // Elongated sphere (fast movement)
        badge = MeshBuilder.CreateSphere(
          `badge-${creatureId}`,
          {
            diameterX: 0.1,
            diameterY: 0.15,
            diameterZ: 0.1,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.2, 0.8, 0.8); // Cyan
        break;

      case 'leader':
        // Star/crown (authority)
        badge = MeshBuilder.CreatePolyhedron(
          `badge-${creatureId}`,
          {
            type: 0,
            size: 0.1,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.8, 0.2, 0.8); // Purple
        break;

      default:
        badge = MeshBuilder.CreateSphere(
          `badge-${creatureId}`,
          {
            diameter: 0.1,
          },
          this.scene
        );
        mat.diffuseColor = new Color3(0.5, 0.5, 0.5); // Gray
    }

    mat.emissiveColor = mat.diffuseColor.scale(0.5);
    badge.material = mat;
    return badge;
  }

  /**
   * Render workshops with special markers
   */
  private renderWorkshops(workshops: Workshop[]): void {
    // Remove old markers
    for (const [id, marker] of this.workshopMarkers) {
      if (!workshops.find((w) => w.id === id)) {
        marker.dispose();
        this.workshopMarkers.delete(id);
      }
    }

    // Render workshop markers
    for (const workshop of workshops) {
      this.createWorkshopMarker(workshop);
    }
  }

  /**
   * Create workshop marker
   */
  private createWorkshopMarker(workshop: Workshop): void {
    let marker = this.workshopMarkers.get(workshop.id);

    if (!marker) {
      // Create glowing cylinder above workshop
      marker = MeshBuilder.CreateCylinder(
        `workshop-${workshop.id}`,
        {
          diameterTop: 0.3,
          diameterBottom: 0.4,
          height: 0.5,
        },
        this.scene
      );

      const mat = new StandardMaterial(`mat-workshop-${workshop.id}`, this.scene);
      const color = this.getWorkshopColor(workshop.type);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.7);
      mat.alpha = 0.7;
      marker.material = mat;

      this.workshopMarkers.set(workshop.id, marker);
    }

    const pos = this.latLonToVector3(workshop.position.lat, workshop.position.lon, 0.6);
    marker.position.copyFrom(pos);

    // Rotate slowly
    marker.rotation.y += 0.01;

    // Pulse with efficiency
    const pulse = 1 + workshop.efficiency * 0.2;
    marker.scaling.y = pulse;
  }

  /**
   * Get color for workshop type
   */
  private getWorkshopColor(type: string): Color3 {
    switch (type) {
      case 'smithy':
        return new Color3(1, 0.4, 0); // Orange (forge fire)
      case 'carpentry':
        return new Color3(0.6, 0.4, 0.2); // Wood brown
      case 'weaving':
        return new Color3(0.8, 0.8, 1); // Light blue (water/fiber)
      case 'assembly':
        return new Color3(0.8, 0.8, 0.2); // Yellow (tools)
      default:
        return new Color3(0.5, 0.5, 0.5);
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
    for (const line of this.tradeLines.values()) {
      line.dispose();
    }
    for (const badge of this.specializationBadges.values()) {
      badge.dispose();
    }
    for (const marker of this.workshopMarkers.values()) {
      marker.dispose();
    }
    this.tradeLines.clear();
    this.specializationBadges.clear();
    this.workshopMarkers.clear();
  }
}
