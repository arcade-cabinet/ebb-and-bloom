/**
 * Gen1 Creature Renderer - Micro Level
 *
 * Handles visual interpretation of Gen1 creature archetypes:
 * - WARP (through-line): Creature evolution from simple → complex
 * - WEFT (horizontal): Archetype synthesis (burrow + cursorial variants)
 * - Parameterization: Body plans, traits, behaviors from WARP/WEFT
 *
 * LOD System:
 * - Distance > 100: Point lights (celestial view)
 * - Distance < 100: Full 3D meshes (surface view)
 */

import {
  Scene,
  PointLight,
  Vector3,
  Color3,
  MeshBuilder,
  StandardMaterial,
  Animation,
  TransformNode,
} from '@babylonjs/core';

interface CreatureData {
  id: string;
  position: { lat: number; lon: number; alt?: number } | { x: number; y: number; z: number };
  lineageColor?: string; // e.g., '#00ff00' for player lineage
  vitality?: number; // 0-1, affects light intensity
  traits?: {
    locomotion?: 'cursorial' | 'burrowing' | 'arboreal' | 'littoral';
    social?: 'solitary' | 'pack';
    speed?: number; // 0-1
    strength?: number; // 0-1
    intelligence?: number; // 0-1
  };
}

export class CreatureRenderer {
  private scene: Scene;
  private lights: Map<string, PointLight> = new Map();
  private meshes: Map<string, TransformNode> = new Map();
  private currentLOD: 'lights' | 'meshes' = 'lights';
  private planetRadius: number = 5; // Match planet renderer

  constructor(scene: Scene, planetRadius: number = 5) {
    this.scene = scene;
    this.planetRadius = planetRadius;
  }

  /**
   * Render creatures with LOD based on camera distance
   */
  render(creatures: CreatureData[], cameraDistance: number): void {
    const threshold = 100;
    const useLights = cameraDistance > threshold;

    if (useLights && this.currentLOD !== 'lights') {
      this.transitionToLights();
    } else if (!useLights && this.currentLOD !== 'meshes') {
      this.transitionToMeshes();
    }

    if (useLights) {
      this.renderAsLights(creatures);
    } else {
      this.renderAsMeshes(creatures);
    }
  }

  /**
   * Convert lat/lon to 3D position on planet surface
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
   * Get position from creature data (handles both formats)
   */
  private getPosition(creature: CreatureData): Vector3 {
    if ('x' in creature.position) {
      return new Vector3(creature.position.x, creature.position.y, creature.position.z);
    } else {
      return this.latLonToVector3(
        creature.position.lat,
        creature.position.lon,
        creature.position.alt || 0.2
      );
    }
  }

  /**
   * Render creatures as point lights (distant view)
   */
  private renderAsLights(creatures: CreatureData[]): void {
    // Remove creatures no longer present
    for (const [id, light] of this.lights) {
      if (!creatures.find((c) => c.id === id)) {
        light.dispose();
        this.lights.delete(id);
      }
    }

    // Add/update creatures
    for (const creature of creatures) {
      let light = this.lights.get(creature.id);
      const position = this.getPosition(creature);

      if (!light) {
        light = new PointLight(`creature-light-${creature.id}`, position, this.scene);

        // Color based on lineage
        const color = creature.lineageColor
          ? Color3.FromHexString(creature.lineageColor)
          : Color3.White();
        light.diffuse = color;
        light.specular = color;

        // Small range - just a point of light
        light.range = 2;

        this.lights.set(creature.id, light);
      } else {
        // Update position
        light.position.copyFrom(position);
      }

      // Update intensity based on vitality
      light.intensity = (creature.vitality ?? 1.0) * 0.5;
    }
  }

  /**
   * Render creatures as 3D meshes (close view)
   */
  private renderAsMeshes(creatures: CreatureData[]): void {
    // Remove creatures no longer present
    for (const [id, root] of this.meshes) {
      if (!creatures.find((c) => c.id === id)) {
        root.dispose();
        this.meshes.delete(id);
      }
    }

    // Add/update creatures
    for (const creature of creatures) {
      let root = this.meshes.get(creature.id);
      const position = this.getPosition(creature);

      if (!root) {
        // Create creature mesh based on archetype
        root = this.createCreatureMesh(creature);
        this.meshes.set(creature.id, root);

        // Add walk animation
        const locomotion = creature.traits?.locomotion || 'cursorial';
        this.addWalkAnimation(root, locomotion);
      }

      // Update position and orientation
      root.position.copyFrom(position);

      // Orient to face away from planet center (stand on surface)
      const up = position.normalize();
      const forward = Vector3.Cross(up, Vector3.Right()).normalize();
      root.lookAt(root.position.add(forward));
      root.rotate(Vector3.Right(), Math.PI / 2); // Stand upright
    }
  }

  /**
   * Create creature mesh from archetype data
   * Interprets visual blueprints and traits to generate 3D model
   */
  private createCreatureMesh(creature: CreatureData): TransformNode {
    const root = new TransformNode(`creature-${creature.id}`, this.scene);

    // Get creature color
    const color = creature.lineageColor
      ? Color3.FromHexString(creature.lineageColor)
      : new Color3(0.6, 0.5, 0.4); // Default brownish

    // Get locomotion type
    const locomotion = creature.traits?.locomotion || 'cursorial';

    // Create body plan based on locomotion
    switch (locomotion) {
      case 'cursorial': // Fast-running quadruped
        this.createCursorialBody(root, color);
        break;
      case 'burrowing': // Robust digger
        this.createBurrowingBody(root, color);
        break;
      case 'arboreal': // Tree climber
        this.createArborealBody(root, color);
        break;
      case 'littoral': // Coastal wader
        this.createLittoralBody(root, color);
        break;
      default:
        this.createCursorialBody(root, color);
    }

    // Add idle animation
    this.addIdleAnimation(root);

    return root;
  }

  /**
   * Create cursorial (running) body plan
   * Lean quadruped optimized for speed
   */
  private createCursorialBody(root: TransformNode, color: Color3): void {
    const mat = new StandardMaterial(`mat-${root.name}`, this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new Color3(0.1, 0.1, 0.1);

    // Body (elongated)
    const body = MeshBuilder.CreateCapsule(
      `${root.name}-body`,
      {
        radius: 0.15,
        height: 0.6,
        capSubdivisions: 4,
        subdivisions: 1,
      },
      this.scene
    );
    body.rotation.z = Math.PI / 2; // Horizontal
    body.position.y = 0.3;
    body.material = mat;
    body.parent = root;

    // Head (small, alert)
    const head = MeshBuilder.CreateSphere(
      `${root.name}-head`,
      {
        diameter: 0.2,
        segments: 8,
      },
      this.scene
    );
    head.position.set(0.4, 0.35, 0);
    head.material = mat;
    head.parent = root;

    // Legs (4, thin for speed)
    const legPositions = [
      [-0.15, 0, 0.1], // Front-left
      [-0.15, 0, -0.1], // Front-right
      [0.15, 0, 0.1], // Back-left
      [0.15, 0, -0.1], // Back-right
    ];

    legPositions.forEach((pos, i) => {
      const leg = MeshBuilder.CreateCylinder(
        `${root.name}-leg-${i}`,
        {
          diameter: 0.06,
          height: 0.3,
          tessellation: 6,
        },
        this.scene
      );
      leg.position.set(pos[0], 0.15, pos[2]);
      leg.material = mat;
      leg.parent = root;
    });
  }

  /**
   * Create burrowing body plan
   * Stocky with powerful forelimbs
   */
  private createBurrowingBody(root: TransformNode, color: Color3): void {
    const mat = new StandardMaterial(`mat-${root.name}`, this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new Color3(0.1, 0.1, 0.1);

    // Body (thick, rounded)
    const body = MeshBuilder.CreateSphere(
      `${root.name}-body`,
      {
        diameter: 0.5,
        segments: 12,
      },
      this.scene
    );
    body.scaling.set(0.8, 0.6, 1); // Squat shape
    body.position.y = 0.25;
    body.material = mat;
    body.parent = root;

    // Head (low, wide)
    const head = MeshBuilder.CreateBox(
      `${root.name}-head`,
      {
        width: 0.25,
        height: 0.15,
        depth: 0.2,
      },
      this.scene
    );
    head.position.set(0.3, 0.25, 0);
    head.material = mat;
    head.parent = root;

    // Forelimbs (large, with claws)
    [-0.15, 0.15].forEach((z, i) => {
      const limb = MeshBuilder.CreateCylinder(
        `${root.name}-forelimb-${i}`,
        {
          diameterTop: 0.12,
          diameterBottom: 0.08,
          height: 0.25,
          tessellation: 6,
        },
        this.scene
      );
      limb.position.set(-0.1, 0.15, z);
      limb.rotation.x = Math.PI / 6;
      limb.material = mat;
      limb.parent = root;

      // Claws (simple triangles)
      const claw = MeshBuilder.CreateCylinder(
        `${root.name}-claw-${i}`,
        {
          diameterTop: 0,
          diameterBottom: 0.05,
          height: 0.1,
          tessellation: 4,
        },
        this.scene
      );
      claw.position.set(-0.2, 0.05, z);
      claw.rotation.x = Math.PI / 2;
      claw.material = mat;
      claw.parent = root;
    });

    // Hindlimbs (smaller)
    [-0.15, 0.15].forEach((z, i) => {
      const limb = MeshBuilder.CreateCylinder(
        `${root.name}-hindlimb-${i}`,
        {
          diameter: 0.08,
          height: 0.25,
          tessellation: 6,
        },
        this.scene
      );
      limb.position.set(0.15, 0.15, z);
      limb.material = mat;
      limb.parent = root;
    });
  }

  /**
   * Create arboreal (climbing) body plan
   * Long limbs, grasping hands
   */
  private createArborealBody(root: TransformNode, color: Color3): void {
    const mat = new StandardMaterial(`mat-${root.name}`, this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new Color3(0.2, 0.2, 0.2);

    // Body (lean, tall)
    const body = MeshBuilder.CreateCapsule(
      `${root.name}-body`,
      {
        radius: 0.12,
        height: 0.5,
        capSubdivisions: 4,
      },
      this.scene
    );
    body.position.y = 0.4;
    body.material = mat;
    body.parent = root;

    // Head (rounded, forward-facing)
    const head = MeshBuilder.CreateSphere(
      `${root.name}-head`,
      {
        diameter: 0.18,
        segments: 10,
      },
      this.scene
    );
    head.position.set(0, 0.7, 0);
    head.material = mat;
    head.parent = root;

    // Long arms
    [-0.15, 0.15].forEach((z, i) => {
      const arm = MeshBuilder.CreateCylinder(
        `${root.name}-arm-${i}`,
        {
          diameter: 0.05,
          height: 0.4,
          tessellation: 8,
        },
        this.scene
      );
      arm.position.set(-0.1, 0.5, z);
      arm.rotation.z = Math.PI / 4;
      arm.material = mat;
      arm.parent = root;

      // Hands (grasping)
      const hand = MeshBuilder.CreateSphere(
        `${root.name}-hand-${i}`,
        {
          diameter: 0.08,
          segments: 6,
        },
        this.scene
      );
      hand.position.set(-0.3, 0.35, z);
      hand.material = mat;
      hand.parent = root;
    });

    // Legs (shorter than arms)
    [-0.12, 0.12].forEach((z, i) => {
      const leg = MeshBuilder.CreateCylinder(
        `${root.name}-leg-${i}`,
        {
          diameter: 0.06,
          height: 0.3,
          tessellation: 6,
        },
        this.scene
      );
      leg.position.set(0, 0.15, z);
      leg.material = mat;
      leg.parent = root;
    });
  }

  /**
   * Create littoral (wading) body plan
   * Partially webbed feet, probe-like features
   */
  private createLittoralBody(root: TransformNode, color: Color3): void {
    const mat = new StandardMaterial(`mat-${root.name}`, this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new Color3(0.15, 0.15, 0.15);

    // Body (streamlined)
    const body = MeshBuilder.CreateCapsule(
      `${root.name}-body`,
      {
        radius: 0.15,
        height: 0.5,
        capSubdivisions: 6,
      },
      this.scene
    );
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.4;
    body.material = mat;
    body.parent = root;

    // Head (probe-like beak/snout)
    const head = MeshBuilder.CreateCylinder(
      `${root.name}-head`,
      {
        diameterTop: 0.08,
        diameterBottom: 0.15,
        height: 0.25,
        tessellation: 8,
      },
      this.scene
    );
    head.rotation.z = Math.PI / 2;
    head.position.set(0.4, 0.4, 0);
    head.material = mat;
    head.parent = root;

    // Long wading legs
    [-0.15, 0.15].forEach((z, i) => {
      // Upper leg
      const legUpper = MeshBuilder.CreateCylinder(
        `${root.name}-leg-upper-${i}`,
        {
          diameter: 0.06,
          height: 0.3,
          tessellation: 6,
        },
        this.scene
      );
      legUpper.position.set(0, 0.25, z);
      legUpper.material = mat;
      legUpper.parent = root;

      // Lower leg (thinner)
      const legLower = MeshBuilder.CreateCylinder(
        `${root.name}-leg-lower-${i}`,
        {
          diameter: 0.04,
          height: 0.25,
          tessellation: 6,
        },
        this.scene
      );
      legLower.position.set(0, 0.05, z);
      legLower.material = mat;
      legLower.parent = root;

      // Webbed foot
      const foot = MeshBuilder.CreateDisc(
        `${root.name}-foot-${i}`,
        {
          radius: 0.1,
          tessellation: 6,
        },
        this.scene
      );
      foot.rotation.x = Math.PI / 2;
      foot.position.set(0, 0, z);
      foot.material = mat;
      foot.parent = root;
    });
  }

  /**
   * Add idle animation (subtle breathing/bobbing)
   */
  private addIdleAnimation(root: TransformNode): void {
    const frameRate = 30;
    const anim = new Animation(
      `${root.name}-idle`,
      'position.y',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keys = [
      { frame: 0, value: root.position.y },
      { frame: frameRate, value: root.position.y + 0.05 },
      { frame: frameRate * 2, value: root.position.y },
    ];

    anim.setKeys(keys);
    root.animations = [anim];

    this.scene.beginAnimation(root, 0, frameRate * 2, true);
  }

  /**
   * Add walking animation (leg movement)
   */
  private addWalkAnimation(root: TransformNode, _locomotion: string): void {
    // Get all legs
    const legs = root.getChildren().filter((c) => c.name.includes('-leg'));
    if (legs.length === 0) return;

    const frameRate = 30;
    // Animation speed reserved for future use

    // Alternating leg movement
    legs.forEach((leg, i) => {
      const anim = new Animation(
        `${leg.name}-walk`,
        'rotation.x',
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      // Offset phase for each leg
      const phase = (i % 2) * Math.PI;

      const keys = [
        { frame: 0, value: Math.sin(phase) * 0.3 },
        { frame: frameRate / 2, value: Math.sin(phase + Math.PI) * 0.3 },
        { frame: frameRate, value: Math.sin(phase + Math.PI * 2) * 0.3 },
      ];

      anim.setKeys(keys);

      if (!leg.animations) leg.animations = [];
      leg.animations.push(anim);
    });
  }

  /**
   * Set creature animation state
   */
  setAnimationState(creatureId: string, state: 'idle' | 'walk' | 'run', speed: number = 1.0): void {
    const root = this.meshes.get(creatureId);
    if (!root) return;

    // Stop all animations
    this.scene.stopAnimation(root);
    root.getChildren().forEach((c) => this.scene.stopAnimation(c));

    if (state === 'idle') {
      this.scene.beginAnimation(root, 0, 60, true);
    } else {
      // Play walk animation on legs
      root
        .getChildren()
        .filter((c) => c.name.includes('-leg'))
        .forEach((leg) => {
          this.scene.beginAnimation(leg, 0, 30, true, speed);
        });
    }
  }

  /**
   * Transition from meshes to lights
   */
  private transitionToLights(): void {
    for (const mesh of this.meshes.values()) {
      mesh.dispose();
    }
    this.meshes.clear();
    this.currentLOD = 'lights';
  }

  /**
   * Transition from lights to meshes
   */
  private transitionToMeshes(): void {
    for (const light of this.lights.values()) {
      light.dispose();
    }
    this.lights.clear();
    this.currentLOD = 'meshes';
  }

  /**
   * Update creatures based on evolution (WARP)
   */
  updateEvolution(_creatures: CreatureData[]): void {
    // Update visual traits based on evolutionary changes
    // Future: Morph existing meshes to new forms
  }

  dispose(): void {
    for (const light of this.lights.values()) {
      light.dispose();
    }
    for (const mesh of this.meshes.values()) {
      mesh.dispose();
    }
    this.lights.clear();
    this.meshes.clear();
  }
}
