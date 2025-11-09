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
  MeshBuilder,
  Mesh,
  PBRMaterial,
} from '@babylonjs/core';
import { GameEngine } from '../engine/GameEngine';
import { EvolutionHUD } from '../ui/EvolutionHUD';
import { NarrativeDisplay } from '../ui/NarrativeDisplay';
import { PlanetRenderer, MoonRenderer } from '../renderers/gen0';
import { CreatureRenderer, ResourceNodeRenderer } from '../renderers/gen1';
import { PackFormationRenderer, InteractionVisualizer } from '../renderers/gen2';
import { ToolRenderer, StructureRenderer } from '../renderers/gen3';
import { CivilizationRenderer } from '../renderers/gen4';
import { CommunicationRenderer, CultureRenderer } from '../renderers/gen5';
import {
  CreatureBehaviorSystem,
  type CreatureBehaviorState,
  type ResourceNode,
} from '../systems/CreatureBehaviorSystem';
import { PackFormationSystem, type PackFormation } from '../systems/PackFormationSystem';
import { CreatureInteractionSystem, type Interaction } from '../systems/CreatureInteractionSystem';
import { ToolSystem, type Tool, type ToolKnowledge } from '../systems/ToolSystem';
import {
  StructureBuildingSystem,
  type Structure,
  type BuildingProject,
} from '../systems/StructureBuildingSystem';
import { TradeSystem, type TradeOffer } from '../systems/TradeSystem';
import { SpecializationSystem, type Specialization } from '../systems/SpecializationSystem';
import { WorkshopSystem, type Workshop } from '../systems/WorkshopSystem';
import {
  SymbolicCommunicationSystem,
  type Symbol as CommSymbol,
  type SymbolKnowledge,
} from '../systems/SymbolicCommunicationSystem';
import {
  CulturalExpressionSystem,
  type CulturalExpression,
  type CreatureCulture,
  type CulturalSite,
} from '../systems/CulturalExpressionSystem';

// Render data from game engine (supports all generations)
interface GameRenderData {
  generation: number;
  planet?: {
    status: 'forming' | 'formed' | 'stable';
    id: string;
    seed: string;
    radius: number;
    rotationPeriod: number;
    mass: number;
    coreType: string;
    primordialWells: any[];
    compositionHistory: any[];
    layers?: any[];
  };
  visualBlueprint?: {
    textureReferences?: string[];
    visualProperties?: any;
    representations?: any;
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
  private resourceRenderer: ResourceNodeRenderer | null = null;
  private packRenderer: PackFormationRenderer | null = null;
  private interactionVisualizer: InteractionVisualizer | null = null;
  private toolRenderer: ToolRenderer | null = null;
  private structureRenderer: StructureRenderer | null = null;
  private civilizationRenderer: CivilizationRenderer | null = null;
  private communicationRenderer: CommunicationRenderer | null = null;
  private cultureRenderer: CultureRenderer | null = null;

  // Systems
  private behaviorSystem: CreatureBehaviorSystem | null = null;
  private packSystem: PackFormationSystem | null = null;
  private interactionSystem: CreatureInteractionSystem | null = null;
  private toolSystem: ToolSystem | null = null;
  private structureSystem: StructureBuildingSystem | null = null;
  private tradeSystem: TradeSystem | null = null;
  private specializationSystem: SpecializationSystem | null = null;
  private workshopSystem: WorkshopSystem | null = null;
  private communicationSystem: SymbolicCommunicationSystem | null = null;
  private cultureSystem: CulturalExpressionSystem | null = null;

  // System data
  private creatureBehaviors: Map<string, CreatureBehaviorState> = new Map();
  private resources: ResourceNode[] = [];
  private packs: PackFormation[] = [];
  private interactions: Interaction[] = [];
  private tools: Tool[] = [];
  private structures: Structure[] = [];
  private projects: BuildingProject[] = [];
  private tradeOffers: TradeOffer[] = [];
  private specializations: Map<string, Specialization> = new Map();
  private workshops: Map<string, Workshop> = new Map();
  private symbols: CommSymbol[] = [];
  private symbolKnowledge: Map<string, SymbolKnowledge> = new Map();
  private culturalExpressions: CulturalExpression[] = [];
  private creatureCultures: Map<string, CreatureCulture> = new Map();
  private culturalSites: CulturalSite[] = [];

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
    // Camera - orbit around center with extended range for celestial view
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
    // Close: See individual creatures on surface (~5 units)
    camera.lowerRadiusLimit = 5;
    // Far: Celestial view showing full planet + moons (~500 units)
    camera.upperRadiusLimit = 500;
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
    // Create Evolution HUD with generation advancement callback
    this.hud = new EvolutionHUD(this.scene, async () => {
      await this.advanceGeneration();
    });

    // Create Narrative Display
    this.narrative = new NarrativeDisplay(this.scene);

    // Initialize renderers
    this.planetRenderer = new PlanetRenderer(this.scene);
    this.moonRenderer = new MoonRenderer(this.scene);
    this.creatureRenderer = new CreatureRenderer(this.scene);
    this.resourceRenderer = new ResourceNodeRenderer(this.scene);
    this.packRenderer = new PackFormationRenderer(this.scene);
    this.interactionVisualizer = new InteractionVisualizer(this.scene);
    this.toolRenderer = new ToolRenderer(this.scene);
    this.structureRenderer = new StructureRenderer(this.scene);
    this.civilizationRenderer = new CivilizationRenderer(this.scene, 5);
    this.communicationRenderer = new CommunicationRenderer(this.scene, 5);
    this.cultureRenderer = new CultureRenderer(this.scene, 5);

    // Initialize systems
    this.behaviorSystem = new CreatureBehaviorSystem(5); // Planet radius = 5
    this.packSystem = new PackFormationSystem();
    this.interactionSystem = new CreatureInteractionSystem();
    this.toolSystem = new ToolSystem();
    this.structureSystem = new StructureBuildingSystem();
    this.tradeSystem = new TradeSystem();
    this.specializationSystem = new SpecializationSystem();
    this.workshopSystem = new WorkshopSystem();
    this.communicationSystem = new SymbolicCommunicationSystem();
    this.cultureSystem = new CulturalExpressionSystem();

    // Spawn some initial resources for testing
    this.spawnTestResources();
  }

  /**
   * Advance to next generation
   * Calls GameEngine to run Gen1+ systems
   */
  private async advanceGeneration(): Promise<void> {
    if (!this.gameEngine) {
      console.error('Cannot advance: GameEngine not initialized');
      return;
    }

    try {
      console.log(
        `🔄 Advancing from Gen${this.renderData?.generation} to Gen${(this.renderData?.generation || 0) + 1}...`
      );

      // Call backend to advance generation
      const newState = await this.gameEngine.advanceGeneration();

      // Update render data
      const currentGen = newState.generation || 0;
      const renderData = await this.gameEngine.getGen0RenderData(this.time);

      if (renderData) {
        this.renderData = {
          generation: currentGen,
          planet: renderData.planet,
          visualBlueprint: renderData.visualBlueprint as any,
          moons: renderData.moons,
          stellarContext: newState.gen0Data?.stellarContext,
          creatures: newState.gen1Data?.creatures || [],
          tools: newState.gen2Data?.tools || [],
          buildings: newState.gen3Data?.buildings || [],
        };
      }

      // Update HUD
      if (this.hud) {
        this.hud.updateGeneration(currentGen);
        this.hud.addEvent(`✨ Advanced to Generation ${currentGen}`);
      }

      // Add narrative event
      if (this.narrative && currentGen === 1) {
        this.narrative.addHaiku('First creatures emerge', [
          'Life stirs in the deep',
          'Consciousness takes fragile form',
          'The planet awakens',
        ]);
      }

      // Re-render with new generation data
      await this.renderWithRenderers();
      this.updateInfo();

      console.log(`✅ Now at Generation ${currentGen}`);
    } catch (error) {
      console.error('Failed to advance generation:', error);
      if (this.hud) {
        this.hud.addEvent(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
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
      await this.planetRenderer.render({ planet: planet as any, visualBlueprint });
      console.log('✅ Planet rendered via PlanetRenderer');
    }

    // Gen0: Render moons (meso level)
    if (moons && moons.length > 0 && this.moonRenderer) {
      this.moonRenderer.render(
        moons.map((m) => ({
          id: m.id,
          radius: m.radius,
          distance: m.distance,
          orbitalPeriod: m.orbitalPeriod,
          composition: 'rocky' as const, // TODO: Get from archetype
        }))
      );
      console.log(`✅ ${moons.length} moons rendered via MoonRenderer`);
    }

    // Gen1+: Render creatures (micro level)
    // LOD handled in animation loop based on camera distance
    if (generation >= 1 && creatures && creatures.length > 0) {
      console.log(
        `✅ ${creatures.length} creatures ready (will render as lights/meshes based on zoom)`
      );

      // Initialize behavior system for creatures
      this.initializeCreatureBehaviors();
    }

    // TODO: Gen2+ renderers
    // if (generation >= 2 && tools) { /* render tools */ }
    // if (generation >= 3 && buildings) { /* render buildings */ }
  }

  private startAnimation(): void {
    let lastTime = Date.now();

    // Update time for orbital mechanics and LOD
    this.scene.registerBeforeRender(() => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;

      this.time += deltaTime;

      // Update moon positions based on time
      if (this.moonRenderer) {
        this.moonRenderer.updateOrbitalPositions(this.time);
      }

      // Update creature behaviors
      if (this.behaviorSystem && this.renderData?.creatures) {
        this.updateCreatureBehaviors(deltaTime);

        // Update pack formations
        if (this.packSystem) {
          this.updatePackFormations();
        }

        // Update creature interactions
        if (this.interactionSystem) {
          this.updateCreatureInteractions();
        }

        // Update tools (Gen3)
        if (this.toolSystem) {
          this.updateTools(deltaTime);
        }

        // Update structures (Gen3)
        if (this.structureSystem && this.toolSystem) {
          this.updateStructures(deltaTime);
        }

        // Update trade (Gen4)
        if (this.tradeSystem) {
          this.updateTrade(deltaTime);
        }

        // Update specializations (Gen4)
        if (this.specializationSystem) {
          this.updateSpecializations();
        }

        // Update workshops (Gen4)
        if (this.workshopSystem && this.structureSystem) {
          this.updateWorkshops(deltaTime);
        }

        // Update communication (Gen5)
        if (this.communicationSystem) {
          this.updateCommunication(deltaTime);
        }

        // Update culture (Gen5)
        if (this.cultureSystem && this.structureSystem) {
          this.updateCulture(deltaTime);
        }
      }

      // Update creature LOD based on camera distance
      if (this.creatureRenderer && this.renderData?.creatures) {
        const camera = this.scene.activeCamera;
        if (camera) {
          const cameraDistance = Vector3.Distance(camera.position, Vector3.Zero());

          // Convert behavior states to creature data for rendering
          const creaturesForRender = this.renderData.creatures.map((c) => {
            const behavior = this.creatureBehaviors.get(c.id);
            if (behavior) {
              // Use updated position from behavior system
              return {
                ...c,
                position: behavior.position,
              };
            }
            return c;
          });

          this.creatureRenderer.render(creaturesForRender, cameraDistance);
        }
      }

      // Update resource rendering
      if (this.resourceRenderer && this.resources.length > 0) {
        this.resourceRenderer.render(this.resources);
      }

      // Update pack formation rendering
      if (this.packRenderer && this.packs.length > 0) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        this.packRenderer.render(this.packs, creaturePositions);
      }

      // Update interaction rendering
      if (this.interactionVisualizer && this.interactions.length > 0) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        this.interactionVisualizer.render(this.interactions, creaturePositions);
      }

      // Update tool rendering (Gen3)
      if (this.toolRenderer && this.toolSystem && this.tools.length > 0) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        const knowledge = new Map<string, ToolKnowledge>();
        for (const creatureId of this.toolSystem.getKnowledgeableCreatures()) {
          const k = this.toolSystem.getKnowledge(creatureId);
          if (k) knowledge.set(creatureId, k);
        }
        this.toolRenderer.render(this.tools, knowledge, creaturePositions);
      }

      // Update structure rendering (Gen3)
      if (this.structureRenderer && (this.structures.length > 0 || this.projects.length > 0)) {
        this.structureRenderer.render(this.structures, this.projects);
      }

      // Update civilization rendering (Gen4)
      if (this.civilizationRenderer) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        this.civilizationRenderer.render(
          this.tradeOffers,
          Array.from(this.specializations.values()),
          Array.from(this.workshops.values()),
          creaturePositions
        );
      }

      // Update communication rendering (Gen5)
      if (this.communicationRenderer && this.symbols.length > 0) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        this.communicationRenderer.render(this.symbols, this.symbolKnowledge, creaturePositions);
      }

      // Update culture rendering (Gen5)
      if (this.cultureRenderer) {
        const creaturePositions = new Map<string, { lat: number; lon: number }>();
        for (const [id, behavior] of this.creatureBehaviors) {
          creaturePositions.set(id, { lat: behavior.position.lat, lon: behavior.position.lon });
        }
        this.cultureRenderer.render(
          this.culturalExpressions,
          this.creatureCultures,
          this.culturalSites,
          creaturePositions
        );
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

    this.infoContent.textContent = lines.filter((l) => l).join('\n');
  }

  public dispose(): void {
    this.planetRenderer?.dispose();
    this.moonRenderer?.dispose();
    this.creatureRenderer?.dispose();
    this.resourceRenderer?.dispose();
    this.packRenderer?.dispose();
    this.interactionVisualizer?.dispose();
    this.toolRenderer?.dispose();
    this.structureRenderer?.dispose();
    this.civilizationRenderer?.dispose();
    this.communicationRenderer?.dispose();
    this.cultureRenderer?.dispose();
    this.hud?.dispose();
    this.narrative?.dispose();
  }

  /**
   * Initialize creature behavior states
   */
  private initializeCreatureBehaviors(): void {
    if (!this.renderData?.creatures) return;

    this.creatureBehaviors.clear();

    for (const creature of this.renderData.creatures) {
      // Convert creature data to behavior state
      const position =
        'lat' in creature.position ? creature.position : this.vector3ToLatLon(creature.position);

      const behaviorState: CreatureBehaviorState = {
        id: creature.id,
        position: {
          lat: position.lat,
          lon: position.lon,
          alt: position.alt || 0.2,
        },
        velocity: { lat: 0, lon: 0 },
        currentGoal: 'idle',
        energy: 1.0,
        hunger: 0.3,
        fear: 0.0,
      };

      this.creatureBehaviors.set(creature.id, behaviorState);
    }
  }

  /**
   * Update all creature behaviors
   */
  private updateCreatureBehaviors(deltaTime: number): void {
    if (!this.behaviorSystem) return;

    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData!.creatures!.find((c) => c.id === id);
      if (!creature) continue;

      // Update behavior
      const updated = this.behaviorSystem.update(behavior, deltaTime, creature.traits || {});

      this.creatureBehaviors.set(id, updated);

      // Update animation state based on behavior
      if (this.creatureRenderer) {
        const speed = this.behaviorSystem.getSpeed(updated);
        if (speed > 0.1) {
          this.creatureRenderer.setAnimationState(id, 'walk', speed * 2);
        } else {
          this.creatureRenderer.setAnimationState(id, 'idle');
        }
      }
    }
  }

  /**
   * Update pack formations
   */
  private updatePackFormations(): void {
    if (!this.packSystem || !this.renderData?.creatures) return;

    // Build traits map
    const traits = new Map<string, { social?: string; strength?: number; intelligence?: number }>();
    for (const creature of this.renderData.creatures) {
      traits.set(creature.id, creature.traits || {});
    }

    // Update pack system
    const packs = this.packSystem.update(this.creatureBehaviors, traits);
    this.packs = Array.from(packs.values());
  }

  /**
   * Update creature interactions
   */
  private updateCreatureInteractions(): void {
    if (!this.interactionSystem || !this.renderData?.creatures) return;

    // Build creature state map with traits
    const creatureStates = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatureStates.set(id, {
          position: behavior.position,
          traits: creature.traits,
          energy: behavior.energy,
          fear: behavior.fear,
        });
      }
    }

    // Update interaction system
    const interactions = this.interactionSystem.update(creatureStates);
    this.interactions = Array.from(interactions.values());
  }

  /**
   * Update tools (Gen3)
   */
  private updateTools(deltaTime: number): void {
    if (!this.toolSystem || !this.renderData?.creatures) return;

    // Build creature map with traits
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Update tool system
    this.toolSystem.update(creatures, deltaTime);
    this.tools = this.toolSystem.getTools();
  }

  /**
   * Update structures (Gen3)
   */
  private updateStructures(deltaTime: number): void {
    if (!this.structureSystem || !this.toolSystem || !this.renderData?.creatures) return;

    // Build creature map with traits and energy
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
          energy: behavior.energy,
        });
      }
    }

    // Build tool knowledge map
    const toolKnowledge = new Map<string, boolean>();
    for (const creatureId of this.toolSystem.getKnowledgeableCreatures()) {
      toolKnowledge.set(creatureId, true);
    }

    // Update structure system
    this.structureSystem.update(creatures, toolKnowledge, deltaTime);
    this.structures = this.structureSystem.getStructures();
    this.projects = this.structureSystem.getProjects();
  }

  /**
   * Spawn test resources for Gen1
   */
  private spawnTestResources(): void {
    // Create 10 food sources scattered around planet
    for (let i = 0; i < 10; i++) {
      const lat = (Math.random() - 0.5) * 160; // -80 to 80
      const lon = (Math.random() - 0.5) * 360; // -180 to 180

      this.resources.push({
        id: `food-${i}`,
        type: 'food',
        position: { lat, lon },
        amount: 0.8 + Math.random() * 0.2, // 0.8 to 1.0
      });
    }

    // Add resources to behavior system
    for (const resource of this.resources) {
      this.behaviorSystem?.addResource(resource);
    }
  }

  /**
   * Update trade system (Gen4)
   */
  private updateTrade(deltaTime: number): void {
    if (!this.tradeSystem || !this.renderData?.creatures || !this.toolSystem) return;

    // Build creature map
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Build pack map for trade system
    const packsMap = new Map(
      this.packs.map((p) => [
        p.id,
        {
          members: p.members,
          leaderId: p.leaderId,
        },
      ])
    );

    // Build tools map
    const toolsMap = new Map(
      this.tools.map((t) => [
        t.id,
        {
          position: t.position,
          type: t.type,
        },
      ])
    );

    // Update trade system
    this.tradeSystem.update(creatures, packsMap, toolsMap, deltaTime);
    this.tradeOffers = this.tradeSystem.getOffers();
  }

  /**
   * Update specialization system (Gen4)
   */
  private updateSpecializations(): void {
    if (!this.specializationSystem || !this.renderData?.creatures) return;

    // Build creature map
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Track actions from tools, structures, and trade
    const actions = new Map<string, string[]>();

    // Track tool creation as "craft"
    for (const tool of this.tools) {
      if (tool.createdBy) {
        if (!actions.has(tool.createdBy)) {
          actions.set(tool.createdBy, []);
        }
        actions.get(tool.createdBy)!.push('craft');
      }
    }

    // Track structure work as "build"
    for (const project of this.projects) {
      for (const [contributorId] of project.contributors) {
        if (!actions.has(contributorId)) {
          actions.set(contributorId, []);
        }
        actions.get(contributorId)!.push('build');
      }
    }

    // Update specialization system
    this.specializationSystem.update(creatures, actions);

    // Build specializations map from system
    this.specializations.clear();
    for (const [creatureId] of creatures) {
      const spec = this.specializationSystem.getSpecialization(creatureId);
      if (spec) {
        this.specializations.set(creatureId, spec);
      }
    }
  }

  /**
   * Update workshop system (Gen4)
   */
  private updateWorkshops(deltaTime: number): void {
    if (!this.workshopSystem || !this.structureSystem || !this.renderData?.creatures) return;

    // Build creature map
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Update workshop system
    const structuresMap = new Map(this.structures.map((s) => [s.id, s]));
    this.workshopSystem.update(creatures, structuresMap, this.specializations, deltaTime);

    this.workshops = new Map(this.workshopSystem.getWorkshops().map((w) => [w.id, w]));
  }

  /**
   * Update communication system (Gen5)
   */
  private updateCommunication(deltaTime: number): void {
    if (!this.communicationSystem || !this.renderData?.creatures) return;

    // Build creature map
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Build pack map
    const packs = new Map();
    for (const pack of this.packs) {
      packs.set(pack.id, {
        id: pack.id,
        members: pack.members,
      });
    }

    // Update communication system
    this.communicationSystem.update(creatures, packs, deltaTime);
    this.symbols = this.communicationSystem.getSymbols();

    // Update symbol knowledge map
    this.symbolKnowledge.clear();
    for (const [id] of this.creatureBehaviors) {
      const knowledge = this.communicationSystem.getKnowledge(id);
      if (knowledge) {
        this.symbolKnowledge.set(id, knowledge);
      }
    }
  }

  /**
   * Update cultural expression system (Gen5)
   */
  private updateCulture(deltaTime: number): void {
    if (!this.cultureSystem || !this.structureSystem || !this.renderData?.creatures) return;

    // Build creature map
    const creatures = new Map();
    for (const [id, behavior] of this.creatureBehaviors) {
      const creature = this.renderData.creatures.find((c) => c.id === id);
      if (creature) {
        creatures.set(id, {
          position: behavior.position,
          traits: creature.traits,
        });
      }
    }

    // Build pack map
    const packs = new Map();
    for (const pack of this.packs) {
      packs.set(pack.id, {
        id: pack.id,
        members: pack.members,
      });
    }

    // Build structures map
    const structures = new Map();
    for (const structure of this.structures) {
      structures.set(structure.id, {
        position: structure.position,
        type: structure.type,
      });
    }

    // Update culture system
    this.cultureSystem.update(creatures, packs, structures, deltaTime);
    this.culturalExpressions = this.cultureSystem.getExpressions();
    this.culturalSites = this.cultureSystem.getSites();

    // Update culture map
    this.creatureCultures.clear();
    for (const [id] of this.creatureBehaviors) {
      const culture = this.cultureSystem.getCulture(id);
      if (culture) {
        this.creatureCultures.set(id, culture);
      }
    }
  }

  /**
   * Convert Vector3 to lat/lon
   */
  private vector3ToLatLon(pos: { x: number; y: number; z: number }): {
    lat: number;
    lon: number;
    alt: number;
  } {
    const vec = new Vector3(pos.x, pos.y, pos.z);
    const radius = vec.length();
    const alt = radius - 5; // Planet radius = 5

    const lat = 90 - Math.acos(pos.y / radius) * (180 / Math.PI);
    const lon = Math.atan2(pos.z, pos.x) * (180 / Math.PI) - 180;

    return { lat, lon, alt };
  }
}
