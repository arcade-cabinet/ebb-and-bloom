/**
 * Unified Game Scene - BabylonJS implementation
 * 
 * ONE scene that renders the current game state:
 * - Gen0: Planetary sphere (always rendered as base)
 * - Gen1+: Creatures, tools, buildings (rendered on top of planet)
 * 
 * The scene adapts to whatever generation the game is currently at.
 * This is NOT separate scenes per generation - it's ONE unified scene.
 */

import {
  Scene,
  Engine,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  MeshBuilder,
  Mesh,
} from '@babylonjs/core';
import { PBRMaterial } from '@babylonjs/materials';
import { loadTexture } from '../utils/textureLoader';
import type { VisualRepresentation, PBRProperties } from '@ebb/gen/schemas';
import { GameEngine } from '../engine/GameEngine';

// Render data from game engine (supports all generations)
interface GameRenderData {
  generation: number;
  planet?: {
    id: string;
    seed: string;
    radius: number;
    rotationPeriod: number;
    mass: number;
    layers?: any[];
  };
  visualBlueprint?: {
    textureReferences?: string[];
    visualProperties?: VisualRepresentation | any;
    representations?: VisualRepresentation | any;
  };
  moons?: Array<{
    id: string;
    distance: number;
    orbitalPeriod: number;
    radius: number;
    position?: { x: number; y: number; z: number };
  }>;
  stellarContext?: string;
  creatures?: any[]; // Gen1+ creatures
  tools?: any[]; // Gen2+ tools
  buildings?: any[]; // Gen3+ buildings
}

export class GameScene {
  private scene: Scene;
  private engine: Engine;
  private gameId: string | null;
  private planetMesh: Mesh | null = null;
  private moonMeshes: Mesh[] = [];
  private renderData: GameRenderData | null = null;
  private time: number = 0;
  private infoContent: HTMLElement | null = null;

  constructor(scene: Scene, engine: Engine, gameId: string | null) {
    this.scene = scene;
    this.engine = engine;
    this.gameId = gameId;
    this.infoContent = document.getElementById('infoContent');
    this.setupScene();
    this.loadGameData();
    this.startAnimation();
    
    // Expose scene to window for E2E testing
    if (typeof window !== 'undefined') {
      (window as any).scene = scene;
      // BABYLON is already available globally when imported
      (window as any).BABYLON = {
        Scene,
        Engine,
        ArcRotateCamera,
        HemisphericLight,
        DirectionalLight,
        Vector3,
        Color3,
        MeshBuilder,
        Mesh,
        PBRMaterial,
      };
    }
  }

  private setupScene(): void {
    // Camera - orbit around center
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      20,
      Vector3.Zero(),
      this.scene
    );
    camera.attachToCanvas(this.engine.getRenderingCanvas()!, true);
    camera.setTarget(Vector3.Zero());
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;
    camera.wheelDeltaPercentage = 0.01;

    // Lights - simulate star light
    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.3; // Ambient space light
    hemiLight.diffuse = new Color3(0.8, 0.8, 0.9); // Slight blue tint

    // Main directional light (star)
    const dirLight = new DirectionalLight('dirLight', new Vector3(-1, -1, -1), this.scene);
    dirLight.intensity = 1.2;
    dirLight.diffuse = new Color3(1, 0.95, 0.9); // Warm star light
    dirLight.specular = new Color3(1, 1, 1);

    // Background - deep space with subtle gradient
    this.scene.clearColor = new Color3(0.05, 0.05, 0.1); // Deep indigo space
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.01;
    this.scene.fogColor = new Color3(0, 0, 0);
  }

  private async loadGameData(): Promise<void> {
    if (!this.gameId) {
      this.updateInfo('No game ID provided');
      return;
    }

    try {
      // Load game data via direct function call (no HTTP)
      const engine = new GameEngine(this.gameId);
      const state = engine.getState();
      const renderData = await engine.getGen0RenderData(this.time);

      if (!renderData) {
        throw new Error('Failed to load render data');
      }

      const currentGen = state.generation || 0;

      this.renderData = {
        generation: currentGen,
        planet: renderData.planet,
        visualBlueprint: renderData.visualBlueprint,
        moons: renderData.moons,
        stellarContext: state.gen0Data?.stellarContext,
        // Gen1+ entities (will be populated when those generations exist)
        creatures: state.gen1Data?.creatures || [],
        tools: state.gen2Data?.tools || [],
        buildings: state.gen3Data?.buildings || [],
      };

      // Render Gen0 planet (always rendered as base)
      await this.renderGen0();
      
      // Render moons if present
      if (this.renderData.moons && this.renderData.moons.length > 0) {
        await this.renderMoons();
      }
      
      // TODO: Render Gen1+ entities on top of planet
      // if (currentGen >= 1) await this.renderCreatures();
      // if (currentGen >= 2) await this.renderTools();
      // if (currentGen >= 3) await this.renderBuildings();

      this.updateInfo();
    } catch (error) {
      console.error('Failed to load game data:', error);
      this.updateInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async renderGen0(): Promise<void> {
    if (!this.renderData || !this.renderData.planet || !this.renderData.visualBlueprint) return;

    const { planet, visualBlueprint } = this.renderData;

    // Create planet sphere
    this.planetMesh = MeshBuilder.CreateSphere('planet', {
      segments: 64,
      diameter: (planet.radius / 1000) * 2, // Convert meters to reasonable scale
    }, this.scene);

    // Create PBR material (proper physically-based rendering)
    const material = new PBRMaterial('planetMaterial', this.scene);
    
    // Apply PBR properties from visual blueprint
    let pbr: PBRProperties | undefined;
    
    // Try visualProperties first (direct structure)
    if (visualBlueprint.visualProperties?.pbrProperties) {
      pbr = visualBlueprint.visualProperties.pbrProperties as PBRProperties;
    }
    // Try representations.shaders (nested structure from game engine)
    else if ((visualBlueprint.representations as any)?.shaders?.baseColor) {
      const shaders = (visualBlueprint.representations as any).shaders;
      pbr = {
        baseColor: shaders.baseColor || '#4A5568',
        roughness: shaders.roughness || 0.7,
        metallic: shaders.metallic || 0.1,
        emissive: shaders.emissive,
        normalStrength: shaders.normalStrength,
        aoStrength: shaders.aoStrength,
        heightScale: shaders.heightScale,
      } as PBRProperties;
    }
    // Try representations as direct PBR object
    else if ((visualBlueprint.representations as any)?.baseColor) {
      pbr = visualBlueprint.representations as PBRProperties;
    }
    
    // Apply PBR properties
    if (pbr) {
      // Base color (albedo)
      material.baseColor = Color3.FromHexString(pbr.baseColor);
      material.roughness = pbr.roughness ?? 0.7;
      material.metallic = pbr.metallic ?? 0.1;
      
      // Emissive (glow)
      if (pbr.emissive && pbr.emissive !== '#000000') {
        material.emissiveColor = Color3.FromHexString(pbr.emissive);
        material.emissiveIntensity = 0.2;
      }
      
      // Normal map strength
      if (pbr.normalStrength !== undefined) {
        material.bumpTextureLevel = pbr.normalStrength;
      }
      
      // Ambient occlusion strength
      if (pbr.aoStrength !== undefined) {
        material.ambientTextureStrength = pbr.aoStrength;
      }
      
      // Height/displacement scale
      if (pbr.heightScale !== undefined) {
        material.parallaxScaleBias = pbr.heightScale;
      }
    } else {
      // Default material if no PBR properties found
      material.baseColor = Color3.FromHexString('#4A5568'); // Ebb indigo
      material.roughness = 0.7;
      material.metallic = 0.1;
    }

    // Load textures from manifest
    let textureIds: string[] = [];
    
    if (visualBlueprint.textureReferences && visualBlueprint.textureReferences.length > 0) {
      textureIds = visualBlueprint.textureReferences;
    } else if ((visualBlueprint.representations as any)?.materials) {
      textureIds = (visualBlueprint.representations as any).materials;
    }
    
    // Load primary texture (albedo/diffuse)
    if (textureIds.length > 0) {
      const primaryTextureId = textureIds[0];
      const primaryTexture = await loadTexture(primaryTextureId, this.scene);
      if (primaryTexture) {
        material.albedoTexture = primaryTexture;
        console.log(`Loaded primary texture: ${primaryTextureId}`);
      } else {
        console.warn(`Failed to load texture: ${primaryTextureId}`);
      }
    } else {
      console.warn('No texture references found in visual blueprint');
    }
    
    // Apply color palette if available (for procedural variation)
    if (visualBlueprint.visualProperties?.colorPalette && visualBlueprint.visualProperties.colorPalette.length > 0) {
      // Use first color from palette as base if no PBR baseColor was set
      if (!pbr || !pbr.baseColor) {
        material.baseColor = Color3.FromHexString(visualBlueprint.visualProperties.colorPalette[0]);
      }
    }

    this.planetMesh.material = material;

    // Rotate planet based on rotation period
    if (planet.rotationPeriod > 0) {
      const rotationSpeed = (2 * Math.PI) / planet.rotationPeriod; // radians per second
      this.scene.registerBeforeRender(() => {
        if (this.planetMesh) {
          this.planetMesh.rotation.y += rotationSpeed * this.engine.getDeltaTime() / 1000;
        }
      });
    }
  }

  private async renderMoons(): Promise<void> {
    if (!this.renderData || !this.renderData.moons || this.renderData.moons.length === 0) return;
    if (!this.planetMesh) return; // Need planet to position moons relative to it

    // Clear existing moons
    this.moonMeshes.forEach(moon => moon.dispose());
    this.moonMeshes = [];

    const planetRadius = this.planetMesh.getBoundingInfo().boundingSphere.radius;
    
    for (const moon of this.renderData.moons) {
      // Create moon sphere
      const moonMesh = MeshBuilder.CreateSphere(`moon_${moon.id}`, {
        segments: 32,
        diameter: (moon.radius / 1000) * 2, // Scale similar to planet
      }, this.scene);

      // Position moon at orbital distance
      const orbitalDistance = (moon.distance / 1000) * 2; // Convert to scene scale
      moonMesh.position.x = orbitalDistance;
      moonMesh.position.y = 0;
      moonMesh.position.z = 0;

      // Create simple material for moon (can be enhanced with visual blueprints later)
      const moonMaterial = new PBRMaterial(`moonMaterial_${moon.id}`, this.scene);
      moonMaterial.baseColor = new Color3(0.6, 0.6, 0.6); // Gray moon
      moonMaterial.roughness = 0.9;
      moonMaterial.metallic = 0.0;
      moonMesh.material = moonMaterial;

      // Animate moon orbit
      if (moon.orbitalPeriod > 0) {
        const orbitalSpeed = (2 * Math.PI) / moon.orbitalPeriod; // radians per second
        const initialAngle = moon.position ? 
          Math.atan2(moon.position.z, moon.position.x) : 0;
        
        this.scene.registerBeforeRender(() => {
          if (moonMesh && this.planetMesh) {
            const angle = initialAngle + orbitalSpeed * this.time;
            const planetCenter = this.planetMesh.getAbsolutePosition();
            moonMesh.position.x = planetCenter.x + orbitalDistance * Math.cos(angle);
            moonMesh.position.z = planetCenter.z + orbitalDistance * Math.sin(angle);
            moonMesh.position.y = planetCenter.y;
          }
        });
      }

      this.moonMeshes.push(moonMesh);
    }
  }

  private updateInfo(message?: string): void {
    if (!this.infoContent) return;

    if (message) {
      this.infoContent.innerHTML = `<p style="color: #ff4444;">${message}</p>`;
      return;
    }

    if (!this.renderData) {
      this.infoContent.innerHTML = '<p>Loading...</p>';
      return;
    }

    const { generation, planet, visualBlueprint, moons, stellarContext, creatures, tools, buildings } = this.renderData;
    
    let html = `<p><strong>Generation:</strong> ${generation}</p>`;
    
    if (planet) {
      html += `
        <p><strong>Stellar Context:</strong> ${stellarContext || 'Unknown'}</p>
        <p><strong>Planet Radius:</strong> ${(planet.radius / 1000).toFixed(0)} km</p>
        <p><strong>Rotation Period:</strong> ${(planet.rotationPeriod / 3600).toFixed(1)} hours</p>
        <p><strong>Moons:</strong> ${moons?.length || 0}</p>
        <p><strong>Textures:</strong> ${visualBlueprint?.textureReferences?.join(', ') || 'None'}</p>
      `;
    }
    
    if (creatures && creatures.length > 0) {
      html += `<p><strong>Creatures:</strong> ${creatures.length}</p>`;
    }
    
    if (tools && tools.length > 0) {
      html += `<p><strong>Tools:</strong> ${tools.length}</p>`;
    }
    
    if (buildings && buildings.length > 0) {
      html += `<p><strong>Buildings:</strong> ${buildings.length}</p>`;
    }
    
    html += `<p><strong>Time:</strong> ${this.time.toFixed(0)}s</p>`;
    
    this.infoContent.innerHTML = html;
  }

  private startAnimation(): void {
    // Update time and info panel
    this.scene.registerBeforeRender(() => {
      this.time += this.engine.getDeltaTime() / 1000;
      if (this.time % 1 < 0.1) { // Update info every second
        this.updateInfo();
      }
    });
  }

  public getScene(): Scene {
    return this.scene;
  }
}

