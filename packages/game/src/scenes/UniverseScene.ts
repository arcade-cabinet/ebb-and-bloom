/**
 * UNIVERSE SCENE - Full 3D Rendering
 *
 * Procedural cosmos visualization:
 * - Galaxy rendering from structure formation
 * - Star field from spatial index
 * - Planet rendering from element composition
 * - VCR controls (time travel through universe)
 * - Zoom-based mode transitions
 *
 * NO TEXTURE FILES. Pure synthesis from laws.
 */

import {
  Engine,
  Scene,
  Color4,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  ParticleSystem,
  Texture,
  Color3,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Button, StackPanel, Control } from '@babylonjs/gui';
import { generateUniverse, Universe } from '../generation/SimpleUniverseGenerator';
import { BabylonPBRSystem } from '../rendering/BabylonPBRSystem';
import { PlanetaryVisuals } from '../procedural/PlanetaryVisuals';
import { ProceduralAudioEngine } from '../audio/ProceduralAudioEngine';
import { CosmicSonification } from '../audio/CosmicSonification';
import { LODSystem, ZoomLevel } from '../rendering/LODSystem';
import { MobileGUI } from '../utils/MobileGUI';
import { LAWS } from '../laws/index';

export class UniverseScene {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private gui: AdvancedDynamicTexture;

  // State
  private seed: string;
  private universe!: Universe;
  private timeSeconds: number = 0; // Current sim time
  private isPaused: boolean = true;
  private speedMultiplier: number = 1;

  // Audio
  private audioEngine?: ProceduralAudioEngine;
  private cosmicAudio?: CosmicSonification;

  // LOD System
  private lodSystem: LODSystem;

  // Mobile GUI (fallback if Babylon GUI fails)
  private mobileGUI?: MobileGUI;

  // UI
  private timeDisplay!: TextBlock;
  private infoPanel!: StackPanel;
  private lodDisplay!: TextBlock;

  constructor(canvas: HTMLCanvasElement, seed: string) {
    this.seed = seed;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.01, 0.01, 0.05, 1); // Deep space

    // Camera - Spore-style orbiting
    this.camera = new ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      50,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 1000;
    this.camera.wheelDeltaPercentage = 0.01;

    // Lighting
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.3;
    ambient.groundColor = new Color3(0.1, 0.1, 0.2);

    // LOD System
    this.lodSystem = new LODSystem();

    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

    // Create UI
    this.createUI();

    // Mobile fallback (if Babylon GUI buttons don't show)
    if (MobileGUI.isMobile()) {
      console.log('[UniverseScene] Mobile device detected - adding HTML fallback controls');
      this.createMobileFallback();
    }

    // Render loop
    this.engine.runRenderLoop(() => {
      if (!this.isPaused) {
        const dt = this.engine.getDeltaTime() / 1000; // seconds
        this.timeSeconds += dt * this.speedMultiplier;
        this.updateTimeDisplay();
      }

      // Update LOD based on camera distance
      this.updateLOD();

      this.scene.render();
    });
  }

  /**
   * Initialize - Generate universe and render
   */
  async initialize() {
    console.log(`🌌 Generating universe from seed: "${this.seed}"`);

    // Generate universe using laws
    this.universe = generateUniverse(this.seed);

    console.log(
      `⭐ Star: ${this.universe.star.spectralType} (${this.universe.star.mass.toFixed(2)} M☉)`
    );
    console.log(`🌍 Planets: ${this.universe.planets.length}`);

    // Render star
    this.renderStar();

    // Render planets
    this.universe.planets.forEach((planet, i) => {
      this.renderPlanet(planet, i);
    });

    // Create star field background
    this.createStarField();

    // Initialize audio
    try {
      this.audioEngine = new ProceduralAudioEngine();
      this.cosmicAudio = new CosmicSonification();

      // Cosmic drone from star
      this.cosmicAudio.sonicateStellarFusion(this.universe.star.mass, this.universe.star.age);

      console.log('🎵 Audio initialized');
    } catch (e) {
      console.warn('Audio initialization failed (may need user interaction):', e);
    }

    // Update info panel
    this.updateInfoPanel();

    console.log('✅ Universe rendering complete');
  }

  /**
   * Render star as glowing sphere
   */
  private renderStar() {
    const star = this.universe.star;

    // Star mesh
    const starMesh = MeshBuilder.CreateSphere(
      'star',
      {
        diameter: star.radius * 2,
        segments: 32,
      },
      this.scene
    );

    starMesh.position = Vector3.Zero();

    // Star material (emissive)
    const starMat = BabylonPBRSystem.createMaterialFromElements(
      'star-material',
      { H: 0.73, He: 0.25, O: 0.01, C: 0.003, N: 0.001 }, // Stellar composition
      star.temperature,
      this.scene
    );

    // Force full emissive
    starMat.emissiveColor = this.spectralTypeToColor(star.spectralType);
    starMat.emissiveIntensity = 2;
    starMat.disableLighting = true;

    starMesh.material = starMat;

    // Point light at star position
    const starLight = new PointLight('star-light', Vector3.Zero(), this.scene);
    starLight.diffuse = this.spectralTypeToColor(star.spectralType);
    starLight.intensity = star.luminosity * 10;
    starLight.range = 500;

    console.log(`  ⭐ Star rendered: ${star.spectralType}, ${star.temperature}K`);
  }

  /**
   * Render planet from element composition
   */
  private renderPlanet(planet: any, index: number) {
    // Orbital position (simplified circular orbit)
    const angle = (index / this.universe.planets.length) * Math.PI * 2;
    const distance = planet.orbitalRadius * 10; // Scale for visibility
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    // Planet mesh
    const planetMesh = MeshBuilder.CreateSphere(
      `planet-${index}`,
      {
        diameter: planet.radius / 1e6, // km scale
        segments: 32,
      },
      this.scene
    );

    planetMesh.position = new Vector3(x, 0, z);

    // Generate visuals FROM COMPOSITION
    const crust = planet.composition.crust || {
      O: 0.46,
      Si: 0.28,
      Al: 0.08,
      Fe: 0.05,
      Ca: 0.04,
      Na: 0.03,
      K: 0.03,
      Mg: 0.02,
    };

    const visuals = PlanetaryVisuals.generateFromCrust(
      crust,
      planet.surfaceTemp,
      planet.atmosphere !== null
    );

    console.log(`  🌍 Planet ${index}: ${planet.name}`);
    console.log(
      `     Composition: ${Object.entries(crust)
        .slice(0, 3)
        .map(([e, fraction]) => `${e}:${((fraction as number) * 100).toFixed(0)}%`)
        .join(', ')}`
    );
    console.log(`     Temperature: ${planet.surfaceTemp.toFixed(1)}K`);
    console.log(
      `     Color: RGB(${visuals.baseColor.r.toFixed(2)}, ${visuals.baseColor.g.toFixed(2)}, ${visuals.baseColor.b.toFixed(2)})`
    );

    // Create material FROM ELEMENTS
    const material = BabylonPBRSystem.createMaterialFromElements(
      `planet-${index}-material`,
      crust,
      planet.surfaceTemp,
      this.scene
    );

    planetMesh.material = material;

    // Atmosphere particles if present
    if (planet.atmosphere) {
      const particles = BabylonPBRSystem.createAtmosphereParticles(
        planetMesh,
        planet.atmosphere.composition,
        this.scene
      );
      particles.start();

      console.log(`     💨 Atmosphere: ${Object.keys(planet.atmosphere.composition).join(', ')}`);
    }

    // Emissive glow if hot or radioactive
    if (visuals.emissive) {
      const glow = BabylonPBRSystem.createEmissiveGlow(
        planetMesh,
        visuals.emissive,
        visuals.radiationDose_mSv / 100,
        this.scene
      );

      if (visuals.isRadioactive) {
        console.log(`     ☢️ Radioactive! Dose: ${visuals.radiationDose_mSv.toFixed(1)} mSv/yr`);
      }
    }

    // Store metadata
    planetMesh.metadata = {
      planet,
      visuals,
      index,
    };
  }

  /**
   * Create star field background (procedural)
   */
  private createStarField() {
    const starCount = 2000;
    const particles = new ParticleSystem('starfield', starCount, this.scene);

    // No emitter - stars are static points
    particles.minSize = 0.5;
    particles.maxSize = 2.0;
    particles.emitRate = starCount;
    particles.minLifeTime = 999999;
    particles.maxLifeTime = 999999;

    particles.color1 = new Color4(1, 1, 1, 1);
    particles.color2 = new Color4(0.8, 0.8, 1, 1);

    // Random positions in sphere
    particles.startPositionFunction = (worldMatrix, positionToUpdate) => {
      const r = 200 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positionToUpdate.x = r * Math.sin(phi) * Math.cos(theta);
      positionToUpdate.y = r * Math.sin(phi) * Math.sin(theta);
      positionToUpdate.z = r * Math.cos(phi);
    };

    particles.start();

    console.log(`  ⭐ Star field: ${starCount} background stars`);
  }

  /**
   * Spectral type → color
   */
  private spectralTypeToColor(spectralType: string): Color3 {
    const type = spectralType.charAt(0);

    switch (type) {
      case 'O':
        return new Color3(0.6, 0.7, 1); // Blue
      case 'B':
        return new Color3(0.7, 0.8, 1); // Blue-white
      case 'A':
        return new Color3(0.9, 0.9, 1); // White
      case 'F':
        return new Color3(1, 1, 0.9); // Yellow-white
      case 'G':
        return new Color3(1, 1, 0.8); // Yellow (Sun)
      case 'K':
        return new Color3(1, 0.8, 0.6); // Orange
      case 'M':
        return new Color3(1, 0.5, 0.3); // Red
      default:
        return new Color3(1, 1, 1);
    }
  }

  /**
   * Create UI
   */
  private createUI() {
    // Top bar - time display
    const topBar = new StackPanel();
    topBar.width = '100%';
    topBar.height = '80px';
    topBar.isVertical = false;
    topBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topBar.paddingTop = '20px';
    this.gui.addControl(topBar);

    this.timeDisplay = new TextBlock();
    this.timeDisplay.text = 'T + 0.000 Gyr';
    this.timeDisplay.color = '#00ff88';
    this.timeDisplay.fontSize = 32;
    this.timeDisplay.fontFamily = 'monospace';
    this.timeDisplay.fontWeight = 'bold';
    topBar.addControl(this.timeDisplay);

    // LOD display
    this.lodDisplay = new TextBlock();
    this.lodDisplay.text = 'LOD: GALACTIC';
    this.lodDisplay.color = '#88ccff';
    this.lodDisplay.fontSize = 18;
    this.lodDisplay.fontFamily = 'monospace';
    this.lodDisplay.paddingLeft = '40px';
    topBar.addControl(this.lodDisplay);

    // VCR controls
    const controlBar = new StackPanel();
    controlBar.width = '600px';
    controlBar.height = '80px';
    controlBar.isVertical = false;
    controlBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    controlBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    controlBar.paddingBottom = '20px';
    this.gui.addControl(controlBar);

    // Play/Pause
    const playBtn = Button.CreateSimpleButton('play', this.isPaused ? '▶ PLAY' : '⏸ PAUSE');
    playBtn.width = '120px';
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

    // Speed controls
    const speeds = [0.1, 1, 10, 100, 1000];
    speeds.forEach((speed) => {
      const btn = Button.CreateSimpleButton(`speed-${speed}`, `${speed}x`);
      btn.width = '80px';
      btn.height = '60px';
      btn.color = 'white';
      btn.background = this.speedMultiplier === speed ? '#0088cc' : '#444466';
      btn.fontFamily = 'monospace';
      btn.fontSize = 16;
      btn.onPointerClickObservable.add(() => {
        this.speedMultiplier = speed;
        // Update all speed button colors
        controlBar.children.forEach((child) => {
          if (child.name?.startsWith('speed-')) {
            const childBtn = child as Button;
            const childSpeed = parseFloat(childBtn.name?.replace('speed-', '') || '1');
            childBtn.background = childSpeed === speed ? '#0088cc' : '#444466';
          }
        });
      });
      controlBar.addControl(btn);
    });

    // Info panel (right side)
    this.infoPanel = new StackPanel();
    this.infoPanel.width = '400px';
    this.infoPanel.height = '500px';
    this.infoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.infoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.infoPanel.paddingRight = '20px';
    this.gui.addControl(this.infoPanel);
  }

  /**
   * Update time display
   */
  private updateTimeDisplay() {
    const gyr = this.timeSeconds / (1e9 * 365.25 * 86400); // Billions of years
    this.timeDisplay.text = `T + ${gyr.toFixed(3)} Gyr`;
  }

  /**
   * Update LOD system based on camera
   */
  private updateLOD() {
    const distance = this.camera.radius;
    const level = this.lodSystem.getLevelFromDistance(distance);

    // Update LOD display
    this.lodDisplay.text = `LOD: ${ZoomLevel[level]} (${distance.toFixed(0)}m)`;

    // Adjust rendering based on LOD
    // Planets visibility controlled by LOD level

    this.universe.planets.forEach((planet, i) => {
      const mesh = this.scene.getMeshByName(`planet-${i}`);
      if (mesh) {
        mesh.setEnabled(this.lodSystem.shouldRender('planet', level));
      }
    });
  }

  /**
   * Update info panel with universe data
   */
  private updateInfoPanel() {
    this.infoPanel.clearControls();

    const addLine = (text: string, color: string = '#88ccff', size: number = 16) => {
      const line = new TextBlock();
      line.text = text;
      line.color = color;
      line.fontSize = size;
      line.height = `${size + 6}px`;
      line.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      line.fontFamily = 'monospace';
      this.infoPanel.addControl(line);
    };

    addLine('═══ UNIVERSE ═══', '#00ff88', 20);
    addLine(`Seed: ${this.seed}`, '#ffcc00', 14);
    addLine('', '#000000', 8);

    addLine('═══ STAR ═══', '#00ff88', 18);
    addLine(`Type: ${this.universe.star.spectralType}`, '#cccccc');
    addLine(`Mass: ${this.universe.star.mass.toFixed(2)} M☉`, '#cccccc');
    addLine(`Luminosity: ${this.universe.star.luminosity.toFixed(2)} L☉`, '#cccccc');
    addLine(`Temp: ${this.universe.star.temperature.toFixed(0)}K`, '#cccccc');
    addLine(`Age: ${this.universe.star.age.toFixed(2)} Gyr`, '#cccccc');
    addLine('', '#000000', 8);

    addLine('═══ PLANETS ═══', '#00ff88', 18);
    this.universe.planets.forEach((p, i) => {
      const habitable = p === this.universe.habitablePlanet ? ' 🌍' : '';
      addLine(`${i + 1}. ${p.name}${habitable}`, '#ffcc00', 16);
      addLine(
        `   ${p.orbitalRadius.toFixed(2)} AU, ${(p.surfaceTemp - 273).toFixed(0)}°C`,
        '#88ccff',
        14
      );
      if (p.atmosphere) {
        addLine(
          `   Atmosphere: ${Object.keys(p.atmosphere.composition).join(', ')}`,
          '#66aaff',
          14
        );
      }
    });
  }

  /**
   * Resize handler with responsive GUI scaling
   */
  resize() {
    this.engine.resize();

    // Responsive scaling for GUI elements
    const width = this.engine.getRenderWidth();
    const height = this.engine.getRenderHeight();

    // Adjust font sizes based on screen size
    const baseFontSize = Math.min(width, height) / 40; // Responsive base
    this.timeDisplay.fontSize = Math.max(24, Math.min(48, baseFontSize * 1.2));
    this.lodDisplay.fontSize = Math.max(14, Math.min(24, baseFontSize * 0.6));

    // Adjust info panel width for mobile
    if (width < 800) {
      this.infoPanel.width = '90%';
      this.infoPanel.paddingRight = '5%';
    } else {
      this.infoPanel.width = '350px';
      this.infoPanel.paddingRight = '20px';
    }

    console.log(`[UniverseScene] Resized: ${width}x${height}`);
  }

  /**
   * Create mobile fallback controls (HTML buttons)
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

    // Speed controls
    [0.1, 1, 10, 100, 1000].forEach((speed) => {
      this.mobileGUI!.addButton({
        id: `mobile-speed-${speed}`,
        label: `${speed}x`,
        color: this.speedMultiplier === speed ? '#0088cc' : '#444466',
        onClick: () => {
          this.speedMultiplier = speed;
          // Update button colors
          [0.1, 1, 10, 100, 1000].forEach((s) => {
            const btn = document.getElementById(`mobile-speed-${s}`) as HTMLButtonElement;
            if (btn) {
              btn.style.background = s === speed ? '#0088cc' : '#444466';
            }
          });
        },
      });
    });

    // Info panel
    const infoPanel = this.mobileGUI.addInfoPanel('top-right');
    infoPanel.innerHTML = '<strong>Loading...</strong>';

    // Update info periodically
    setInterval(() => {
      if (this.universe) {
        infoPanel.innerHTML = `
          <div style="color: #00ff88; font-size: 16px; margin-bottom: 8px;">UNIVERSE</div>
          <div>Seed: ${this.seed.slice(0, 20)}...</div>
          <div style="margin-top: 8px; color: #88ccff;">STAR</div>
          <div>Type: ${this.universe.star.spectralType}</div>
          <div>Mass: ${this.universe.star.mass.toFixed(2)} M☉</div>
          <div style="margin-top: 8px; color: #88ccff;">PLANETS</div>
          <div>Count: ${this.universe.planets.length}</div>
        `;
      }
    }, 1000);
  }

  /**
   * Dispose
   */
  dispose() {
    this.mobileGUI?.dispose();
    // this.audioEngine?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
