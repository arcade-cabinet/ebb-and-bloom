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
  Color4,
} from '@babylonjs/core';
import { GameEngine } from '../engine/GameEngine';
import { EvolutionHUD } from '../ui/EvolutionHUD';
import { NarrativeDisplay } from '../ui/NarrativeDisplay';
import { PlanetRenderer, MoonRenderer } from '../renderers/gen0';
import { CreatureRenderer } from '../renderers/gen1';

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
  private gameEngine: GameEngine | null = null;
  private renderData: GameRenderData | null = null;
  private time: number = 0;
  private infoContent: HTMLElement | null = null;
  
  // UI
  private hud: EvolutionHUD | null = null;
  private narrative: NarrativeDisplay | null = null;
  
  // Renderers
  private planetRenderer: PlanetRenderer | null = null;
  private moonRenderer: MoonRenderer | null = null;
  private creatureRenderer: CreatureRenderer | null = null;

  constructor(scene: Scene, engine: Engine, gameId: string | null) {
    this.scene = scene;
    this.engine = engine;
    this.gameId = gameId;
    this.infoContent = document.getElementById('infoContent');
    this.setupScene();
    this.setupUI();
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
    camera.attachControl(this.engine.getRenderingCanvas()!, true);
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
    this.scene.clearColor = new Color4(0.05, 0.05, 0.1, 1); // Deep indigo space
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.01;
    this.scene.fogColor = new Color3(0, 0, 0);
  }

  private setupUI(): void {
    // Create Evolution HUD
    this.hud = new EvolutionHUD(this.scene);
    
    // Create Narrative Display  
    this.narrative = new NarrativeDisplay(this.scene);
    
    // Initialize renderers
    this.planetRenderer = new PlanetRenderer(this.scene);
    this.moonRenderer = new MoonRenderer(this.scene);
    this.creatureRenderer = new CreatureRenderer(this.scene);
  }

  private async loadGameData(): Promise<void> {
    if (!this.gameId) {
      this.updateInfo('No game ID provided');
      return;
    }

    try {
      // Load game data via direct function call (no HTTP)
      this.gameEngine = new GameEngine(this.gameId);
      const state = this.gameEngine.getState();
      const renderData = await this.gameEngine.getGen0RenderData(this.time);

      if (!renderData) {
        throw new Error('Failed to load render data');
      }

      const currentGen = state.generation || 0;

      this.renderData = {
        generation: currentGen,
        planet: renderData.planet,
        visualBlueprint: renderData.visualBlueprint as any,
        moons: renderData.moons,
        stellarContext: state.gen0Data?.stellarContext,
        // Gen1+ entities (will be populated when those generations exist)
        creatures: state.gen1Data?.creatures || [],
        tools: state.gen2Data?.tools || [],
        buildings: state.gen3Data?.buildings || [],
      };

      // Update HUD with current generation
      if (this.hud) {
        this.hud.updateGeneration(currentGen);
        this.hud.addEvent(`Game loaded: Gen${currentGen}`);
      }

      // Render using dedicated renderers
      await this.renderWithRenderers();

      this.updateInfo();
    } catch (error) {
      console.error('Failed to load game data:', error);
      this.updateInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Render using dedicated renderer packages
   * Properly separated: simulation logic in backend, visual interpretation in renderers
   */
  private async renderWithRenderers(): Promise<void> {
    if (!this.renderData) return;

    const { generation, planet, visualBlueprint, moons, creatures } = this.renderData;

    // Gen0: Always render planet (macro level)
    if (planet && visualBlueprint && this.planetRenderer) {
      await this.planetRenderer.render({ planet, visualBlueprint });
      console.log('✅ Planet rendered via PlanetRenderer');
    }

    // Gen0: Render moons (meso level)
    if (moons && moons.length > 0 && this.moonRenderer) {
      this.moonRenderer.render(moons.map(m => ({
        id: m.id,
        radius: m.radius,
        distance: m.distance,
        orbitalPeriod: m.orbitalPeriod,
        composition: 'rocky' as const // TODO: Get from archetype
      })));
      console.log(`✅ ${moons.length} moons rendered via MoonRenderer`);
    }

    // Gen1+: Render creatures (micro level)
    if (generation >= 1 && creatures && creatures.length > 0 && this.creatureRenderer) {
      // TODO: Implement creature rendering when Gen1 is active
      console.log(`⏳ ${creatures.length} creatures ready for rendering (Gen1 implementation pending)`);
    }

    // TODO: Gen2+ renderers
    // if (generation >= 2 && tools) { /* render tools */ }
    // if (generation >= 3 && buildings) { /* render buildings */ }
  }

  private startAnimation(): void {
    // Update time for orbital mechanics
    this.scene.registerBeforeRender(() => {
      this.time += this.engine.getDeltaTime() / 1000;
      
      // Update moon positions based on time
      if (this.moonRenderer) {
        this.moonRenderer.updateOrbitalPositions(this.time);
      }
    });
  }

  private updateInfo(message?: string): void {
    if (!this.infoContent) return;

    if (message) {
      this.infoContent.textContent = message;
      return;
    }

    if (!this.renderData) {
      this.infoContent.textContent = 'No game data';
      return;
    }

    const { generation, planet, moons, creatures, tools, buildings } = this.renderData;
    const lines = [
      `Generation: ${generation}`,
      planet ? `Planet: ${(planet.radius / 1000).toFixed(0)}km radius` : '',
      moons ? `Moons: ${moons.length}` : '',
      creatures ? `Creatures: ${creatures.length}` : '',
      tools ? `Tools: ${tools.length}` : '',
      buildings ? `Buildings: ${buildings.length}` : '',
    ];

    this.infoContent.textContent = lines.filter(l => l).join('\n');
  }

  public dispose(): void {
    this.planetRenderer?.dispose();
    this.moonRenderer?.dispose();
    this.creatureRenderer?.dispose();
    this.hud?.dispose();
    this.narrative?.dispose();
  }
}
