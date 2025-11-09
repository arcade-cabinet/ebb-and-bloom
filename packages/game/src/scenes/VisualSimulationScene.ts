/**
 * VISUAL SIMULATION SCENE
 *
 * Full 3D rendering of universe + creatures + evolution
 * Uses procedural generation for ALL visuals - NO TEXTURES
 *
 * This is the PROOF that law-based rendering works.
 */

import {
  Engine,
  Scene,
  Color4,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  InstancedMesh,
  TransformNode,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Button, StackPanel, Control } from '@babylonjs/gui';
import { generateGameData } from '../gen-systems/loadGenData';
import { generateUniverse } from '../generation/SimpleUniverseGenerator';
import { BabylonPBRSystem } from '../rendering/BabylonPBRSystem';
import { PlanetaryVisuals } from '../procedural/PlanetaryVisuals';
import { CreatureVisuals } from '../procedural/CreatureVisuals';
import { ToolVisuals } from '../procedural/ToolVisuals';
import { StructureVisuals } from '../procedural/StructureVisuals';
import { ProceduralAudioEngine } from '../audio/ProceduralAudioEngine';
import { MobileGUI } from '../utils/MobileGUI';
import { LAWS } from '../laws/index';

export class VisualSimulationScene {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private gui: AdvancedDynamicTexture;

  // State
  private seed: string;
  private gameData: any;
  private cycle: number = 0;
  private isPaused: boolean = true;

  // Rendering
  private planetMesh?: Mesh;
  private creatureMeshes: Map<string, Mesh> = new Map();
  private creatureInstances: Map<string, InstancedMesh[]> = new Map();
  private toolMeshes: Mesh[] = [];
  private structureMeshes: Mesh[] = [];

  // Audio
  private audioEngine?: ProceduralAudioEngine;

  // Mobile GUI
  private mobileGUI?: MobileGUI;

  // UI
  private cycleText!: TextBlock;
  private infoPanel!: StackPanel;

  constructor(canvas: HTMLCanvasElement, seed: string) {
    this.seed = seed;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.02, 0.02, 0.08, 1);

    // Camera
    this.camera = new ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      100,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 10;
    this.camera.upperRadiusLimit = 500;

    // Lighting
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.6;

    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
    this.createUI();

    // Mobile fallback
    if (MobileGUI.isMobile()) {
      console.log('[VisualSimulationScene] Mobile detected - adding HTML fallback');
      this.createMobileFallback();
    }

    // Render loop
    this.engine.runRenderLoop(() => {
      if (!this.isPaused) {
        this.advanceCycle();
      }
      this.scene.render();
    });
  }

  /**
   * Initialize - Generate and render universe
   */
  async initialize() {
    console.log(`🎮 Visual Simulation - Seed: "${this.seed}"`);

    // Generate game data
    this.gameData = await generateGameData(this.seed, true);

    console.log('🌍 Rendering planet...');
    this.renderPlanet();

    console.log('🦎 Rendering creatures...');
    this.renderCreatures();

    console.log('🔧 Rendering tools...');
    this.renderTools();

    console.log('🏛️ Rendering structures...');
    this.renderStructures();

    console.log('🎵 Initializing audio...');
    try {
      this.audioEngine = new ProceduralAudioEngine();

      // Environmental ambience
      if (this.gameData.ecology) {
        this.audioEngine.generateEnvironmentAmbience(
          5, // wind speed
          this.gameData.ecology.rainfall || 0,
          0.5 // vegetation
        );
      }
    } catch (e) {
      console.warn('Audio init failed:', e);
    }

    this.updateInfoPanel();

    console.log('✅ Visual simulation ready');
  }

  /**
   * Render planet from element composition
   */
  private renderPlanet() {
    const planet = this.gameData.planet;

    // Planet mesh
    this.planetMesh = MeshBuilder.CreateSphere(
      'planet',
      {
        diameter: 20,
        segments: 64,
      },
      this.scene
    );

    this.planetMesh.position = Vector3.Zero();

    // Get composition
    const crust = planet.composition?.crust || {
      O: 0.46,
      Si: 0.28,
      Al: 0.08,
      Fe: 0.05,
      Ca: 0.04,
    };

    const temp = planet.surfaceTemp || planet.surfaceTemperature || 288;
    const hasAtmosphere = planet.atmosphere !== null;

    // Generate visuals FROM COMPOSITION
    const visuals = PlanetaryVisuals.generateFromCrust(crust, temp, hasAtmosphere);

    console.log(
      `  Crust: ${Object.entries(crust)
        .slice(0, 3)
        .map(([e, fraction]) => `${e}:${((fraction as number) * 100).toFixed(0)}%`)
        .join(', ')}`
    );
    console.log(
      `  Color: RGB(${visuals.baseColor.r.toFixed(2)}, ${visuals.baseColor.g.toFixed(2)}, ${visuals.baseColor.b.toFixed(2)})`
    );
    console.log(`  Temperature: ${temp.toFixed(1)}K`);

    // Create material FROM ELEMENTS
    const material = BabylonPBRSystem.createMaterialFromElements(
      'planet-material',
      crust,
      temp,
      this.scene
    );

    this.planetMesh.material = material;

    // Atmosphere particles
    if (hasAtmosphere && planet.atmosphere) {
      const particles = BabylonPBRSystem.createAtmosphereParticles(
        this.planetMesh,
        planet.atmosphere.composition,
        this.scene
      );
      particles.start();
      console.log(`  💨 Atmosphere particles active`);
    }

    // Emissive glow if radioactive/hot
    if (visuals.emissive) {
      BabylonPBRSystem.createEmissiveGlow(
        this.planetMesh,
        visuals.emissive,
        visuals.radiationDose_mSv / 100,
        this.scene
      );

      if (visuals.isRadioactive) {
        console.log(`  ☢️ Radioactive glow: ${visuals.radiationDose_mSv.toFixed(1)} mSv/yr`);
      }
    }
  }

  /**
   * Render creatures as procedural meshes
   */
  private renderCreatures() {
    if (!this.gameData.creatures || this.gameData.creatures.length === 0) {
      console.warn('  No creatures to render');
      return;
    }

    // Create creature prototype meshes
    this.gameData.creatures.forEach((creature: any, index: number) => {
      // Creature visuals from properties
      const visuals = CreatureVisuals.generate(
        creature.mass,
        creature.locomotion,
        creature.diet,
        creature.biome
      );

      // Create prototype mesh (cube for now, can be replaced with procedural mesh later)
      const prototype = MeshBuilder.CreateBox(
        `creature-${creature.name}`,
        {
          size: visuals.proportions.bodyLength || 1,
        },
        this.scene
      );

      prototype.position = new Vector3(
        (Math.random() - 0.5) * 30,
        visuals.proportions.bodyLength / 2,
        (Math.random() - 0.5) * 30
      );

      // Create material from creature visuals
      const material = BabylonPBRSystem.createMaterialFromElements(
        `creature-${creature.name}-mat`,
        { C: 0.18, O: 0.65, H: 0.1, N: 0.03, Ca: 0.02 }, // Organic composition
        310, // Body temp ~37°C
        this.scene
      );

      material.albedoColor = visuals.baseColor;
      material.roughness = visuals.roughness;

      prototype.material = material;

      this.creatureMeshes.set(creature.name, prototype);

      console.log(`  🦎 ${creature.name}: ${creature.mass.toFixed(1)}kg, ${creature.locomotion}`);

      // Create instances for population
      const population = Math.floor(Math.random() * 20) + 5; // 5-25 individuals
      const instances: InstancedMesh[] = [];

      for (let i = 0; i < population; i++) {
        const instance = prototype.createInstance(`${creature.name}-${i}`);
        instance.position = new Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
        instances.push(instance);
      }

      this.creatureInstances.set(creature.name, instances);
    });

    console.log(`  Rendered ${this.creatureMeshes.size} creature types`);
  }

  /**
   * Render tools (scattered around)
   */
  private renderTools() {
    // Generate some basic tools based on available materials
    const toolTypes = [
      { material: 'stone', purpose: 'cutting', age: 0 },
      { material: 'wood', purpose: 'digging', age: 5 },
      { material: 'bone', purpose: 'piercing', age: 10 },
    ];

    toolTypes.forEach((toolDef, i) => {
      // Tool visuals from materials
      const visuals = ToolVisuals.generate(
        toolDef.material,
        toolDef.purpose,
        toolDef.age / 100 // Weathering 0-1
      );

      // Simple cube for now (can be replaced with procedural mesh)
      const toolMesh = MeshBuilder.CreateBox(
        `tool-${i}`,
        {
          width: 0.3,
          height: 0.1,
          depth: 0.5,
        },
        this.scene
      );

      toolMesh.position = new Vector3((Math.random() - 0.5) * 50, 0.1, (Math.random() - 0.5) * 50);

      toolMesh.rotation.y = Math.random() * Math.PI * 2;

      // Material from tool visuals
      const material = BabylonPBRSystem.createMaterialFromElements(
        `tool-${i}-mat`,
        { Si: 0.6, O: 0.4 }, // Stone-like composition
        300,
        this.scene
      );

      material.albedoColor = visuals.baseColor;
      material.metallic = visuals.metallic;
      material.roughness = visuals.roughness;

      toolMesh.material = material;

      this.toolMeshes.push(toolMesh);
    });

    console.log(`  🔧 Rendered ${this.toolMeshes.length} tools`);
  }

  /**
   * Render structures (simple buildings)
   */
  private renderStructures() {
    // Generate a couple simple structures
    const structureTypes = [
      { materials: ['wood', 'stone'], construction: 'post-and-beam', age: 20 },
      { materials: ['stone'], construction: 'dry-stone', age: 50 },
    ];

    structureTypes.forEach((structDef, i) => {
      // Structure visuals from materials + construction
      const visuals = StructureVisuals.generate(
        structDef.materials,
        structDef.construction,
        structDef.age
      );

      // Simple box for now (can be replaced with procedural mesh)
      const structMesh = MeshBuilder.CreateBox(
        `structure-${i}`,
        {
          width: 4,
          height: 3,
          depth: 3,
        },
        this.scene
      );

      structMesh.position = new Vector3((i - 0.5) * 15, 1.5, 25);

      // Material from structure visuals
      const material = BabylonPBRSystem.createMaterialFromElements(
        `structure-${i}-mat`,
        { Si: 0.5, O: 0.4, Al: 0.05, Fe: 0.03 }, // Stone/wood-like
        290,
        this.scene
      );

      material.albedoColor = visuals.baseColor;
      material.roughness = visuals.roughness;

      structMesh.material = material;

      this.structureMeshes.push(structMesh);
    });

    console.log(`  🏛️ Rendered ${this.structureMeshes.length} structures`);
  }

  /**
   * Advance simulation by one cycle
   */
  private advanceCycle() {
    this.cycle++;

    // Simulate creature movement (simple random walk)
    this.creatureInstances.forEach((instances, name) => {
      instances.forEach((instance) => {
        const speed = 0.1;
        instance.position.x += (Math.random() - 0.5) * speed;
        instance.position.z += (Math.random() - 0.5) * speed;

        // Keep within bounds
        instance.position.x = Math.max(-50, Math.min(50, instance.position.x));
        instance.position.z = Math.max(-50, Math.min(50, instance.position.z));

        // Random rotation
        instance.rotation.y += (Math.random() - 0.5) * 0.05;
      });
    });

    // Update UI every 10 cycles
    if (this.cycle % 10 === 0) {
      this.updateInfoPanel();
    }
  }

  /**
   * Create UI
   */
  private createUI() {
    // Cycle counter
    const topBar = new StackPanel();
    topBar.width = '100%';
    topBar.height = '60px';
    topBar.isVertical = false;
    topBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topBar.paddingTop = '20px';
    this.gui.addControl(topBar);

    this.cycleText = new TextBlock();
    this.cycleText.text = 'CYCLE: 0';
    this.cycleText.color = '#00ff88';
    this.cycleText.fontSize = 28;
    this.cycleText.fontFamily = 'monospace';
    topBar.addControl(this.cycleText);

    // Controls
    const controlBar = new StackPanel();
    controlBar.width = '400px';
    controlBar.height = '80px';
    controlBar.isVertical = false;
    controlBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    controlBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    controlBar.paddingBottom = '20px';
    this.gui.addControl(controlBar);

    const playBtn = Button.CreateSimpleButton('play', '▶ PLAY');
    playBtn.width = '150px';
    playBtn.height = '60px';
    playBtn.color = 'white';
    playBtn.background = '#00cc66';
    playBtn.fontFamily = 'monospace';
    playBtn.fontSize = 20;
    playBtn.onPointerClickObservable.add(() => {
      this.isPaused = !this.isPaused;
      playBtn.textBlock!.text = this.isPaused ? '▶ PLAY' : '⏸ PAUSE';
    });
    controlBar.addControl(playBtn);

    const stepBtn = Button.CreateSimpleButton('step', '→ STEP');
    stepBtn.width = '120px';
    stepBtn.height = '60px';
    stepBtn.color = 'white';
    stepBtn.background = '#0088cc';
    stepBtn.fontFamily = 'monospace';
    stepBtn.fontSize = 18;
    stepBtn.onPointerClickObservable.add(() => {
      this.advanceCycle();
      this.updateInfoPanel();
    });
    controlBar.addControl(stepBtn);

    // Info panel
    this.infoPanel = new StackPanel();
    this.infoPanel.width = '350px';
    this.infoPanel.height = '400px';
    this.infoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.infoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.infoPanel.paddingRight = '20px';
    this.gui.addControl(this.infoPanel);
  }

  /**
   * Update info panel
   */
  private updateInfoPanel() {
    this.cycleText.text = `CYCLE: ${this.cycle}`;

    this.infoPanel.clearControls();

    const addLine = (text: string, color: string = '#88ccff', size: number = 14) => {
      const line = new TextBlock();
      line.text = text;
      line.color = color;
      line.fontSize = size;
      line.height = `${size + 4}px`;
      line.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      line.fontFamily = 'monospace';
      this.infoPanel.addControl(line);
    };

    addLine('═══ PLANET ═══', '#00ff88', 18);
    addLine(`${this.gameData.planet.name}`, '#ffcc00', 16);
    addLine(`${(this.gameData.planet.surfaceTemp - 273).toFixed(0)}°C`, '#cccccc');
    addLine('', '#000', 4);

    addLine('═══ CREATURES ═══', '#00ff88', 18);
    this.gameData.creatures.forEach((c: any) => {
      const count = this.creatureInstances.get(c.name)?.length || 0;
      addLine(`${c.scientificName}`, '#ffcc00', 14);
      addLine(`  Pop: ${count} | ${c.mass.toFixed(1)}kg`, '#88ccff', 12);
    });
    addLine('', '#000', 4);

    addLine('═══ ECOLOGY ═══', '#00ff88', 18);
    addLine(`Productivity: ${this.gameData.ecology.productivity.toFixed(0)} kcal/m²/yr`, '#cccccc');
    addLine(`Rainfall: ${this.gameData.ecology.rainfall.toFixed(0)} mm/yr`, '#cccccc');
  }

  /**
   * Resize with responsive GUI scaling
   */
  resize() {
    this.engine.resize();

    // Responsive scaling
    const width = this.engine.getRenderWidth();
    const height = this.engine.getRenderHeight();

    // Adjust font sizes
    const baseFontSize = Math.min(width, height) / 50;
    this.cycleText.fontSize = Math.max(20, Math.min(36, baseFontSize));

    // Adjust info panel for mobile
    if (width < 800) {
      this.infoPanel.width = '95%';
      this.infoPanel.height = '60%';
      this.infoPanel.paddingRight = '2.5%';
      this.infoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      this.infoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    } else {
      this.infoPanel.width = '350px';
      this.infoPanel.height = '400px';
      this.infoPanel.paddingRight = '20px';
      this.infoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      this.infoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    }

    console.log(`[VisualSimulationScene] Resized: ${width}x${height}`);
  }

  /**
   * Create mobile fallback controls
   */
  private createMobileFallback() {
    this.mobileGUI = new MobileGUI();

    // Play/Pause
    const playBtn = this.mobileGUI.addButton({
      id: 'mobile-play',
      label: '▶ PLAY',
      color: '#00cc66',
      onClick: () => {
        this.isPaused = !this.isPaused;
        playBtn.textContent = this.isPaused ? '▶ PLAY' : '⏸ PAUSE';
      },
    });

    // Step
    this.mobileGUI.addButton({
      id: 'mobile-step',
      label: '→ STEP',
      color: '#0088cc',
      onClick: () => {
        this.advanceCycle();
        this.updateInfoPanel();
      },
    });

    // Info panel
    const infoPanel = this.mobileGUI.addInfoPanel('top-right');
    setInterval(() => {
      if (this.gameData) {
        const totalCreatures = Array.from(this.creatureInstances.values()).reduce(
          (sum, arr) => sum + arr.length,
          0
        );

        infoPanel.innerHTML = `
          <div style="color: #00ff88; font-size: 16px; margin-bottom: 8px;">CYCLE ${this.cycle}</div>
          <div>Planet: ${this.gameData.planet.name}</div>
          <div>${(this.gameData.planet.surfaceTemp - 273).toFixed(0)}°C</div>
          <div style="margin-top: 8px; color: #88ccff;">CREATURES</div>
          <div>${totalCreatures} individuals</div>
          <div>${this.creatureMeshes.size} species</div>
        `;
      }
    }, 1000);
  }

  /**
   * Dispose
   */
  dispose() {
    this.mobileGUI?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
