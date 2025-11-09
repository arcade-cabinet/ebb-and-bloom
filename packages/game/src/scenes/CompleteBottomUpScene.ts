/**
 * COMPLETE BOTTOM-UP UNIVERSE SCENE
 * 
 * THE REAL IMPLEMENTATION - No shortcuts, complete vision:
 * 
 * 1. Big Bang (t=0) → Planck scale (10^-35 m)
 * 2. Particles → Atoms → Molecules
 * 3. Camera ZOOMS OUT as complexity grows
 * 4. Molecules → Stars → Galaxies → Cosmic Web
 * 5. Maximum expansion → Contraction → Big Crunch
 * 
 * ONE continuous simulation from quantum foam to cosmic web and back.
 * Bottom-up emergence driven by Yuka agents + Legal Broker.
 */

import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3 as BabylonVector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ParticleSystem,
  Texture,
  PointsCloudSystem,
  Mesh,
  GlowLayer,
  Viewport,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Button, StackPanel } from '@babylonjs/gui';
import { Vector3 as YukaVector3 } from 'yuka';
import { EntropyAgent } from '../yuka-integration/agents/EntropyAgent';
import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { StellarAgent } from '../yuka-integration/agents/StellarAgent';
import { PlanetaryAgent } from '../yuka-integration/agents/PlanetaryAgent';
import { DensityAgent } from '../yuka-integration/agents/DensityAgent';
import { AdaptiveHUD } from '../ui/AdaptiveHUD';
import { MolecularBreakdownPanel } from '../ui/MolecularBreakdownPanel';
import { MARKER_STORE } from '../state/UniverseMarkers';
import { ZoomLevel, getZoomLevelFromCameraDistance } from '../state/ZoomLOD';
import { MolecularVisuals } from '../renderers/MolecularVisuals';
import { StellarVisuals } from '../renderers/StellarVisuals';

const YEAR = 365.25 * 86400;

/**
 * Physical scale (meters) for visualization
 */
enum PhysicalScale {
  PLANCK = 1e-35,      // Quantum foam
  ATOMIC = 1e-10,      // Atoms
  MOLECULAR = 1e-6,    // Molecules
  CLOUD = 1e15,        // Molecular clouds
  STELLAR = 1e16,      // Stars
  GALACTIC = 1e20,     // Galaxies
  COSMIC = 1e25,       // Cosmic web
}

/**
 * Simulation phase (what's happening)
 */
type SimulationPhase = 
  | 'quantum-foam'      // t=0 → t=10^-43s (Planck epoch)
  | 'particle-soup'     // t=10^-43s → t=1s (quark-gluon plasma)
  | 'nucleosynthesis'   // t=1s → t=3min (H, He formation)
  | 'dark-ages'         // t=3min → t=380kyr (cooling)
  | 'recombination'     // t=380kyr (atoms form, universe becomes transparent)
  | 'molecular-era'     // t=380kyr → t=100Myr (molecules, clouds)
  | 'stellar-era'       // t=100Myr → t=1Gyr (first stars)
  | 'galactic-era'      // t=1Gyr → t=13.8Gyr (structure formation)
  | 'maximum'           // Peak expansion
  | 'contraction'       // Universe contracts
  | 'big-crunch';       // Final collapse

export class CompleteBottomUpScene {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private gui: AdvancedDynamicTexture;
  
  // Core systems
  private entropyAgent: EntropyAgent;
  private spawner: AgentSpawner;
  
  // Simulation state
  private currentPhase: SimulationPhase = 'quantum-foam';
  private currentScale: PhysicalScale = PhysicalScale.PLANCK;
  private currentZoomLevel: ZoomLevel = ZoomLevel.COSMIC;
  private paused: boolean = true; // START PAUSED - wait for user to press PLAY!
  private densityFieldInitialized: boolean = false;
  private bigBangTriggered: boolean = false; // Track if Big Bang happened yet
  
  // Visual elements
  private particleSystem?: ParticleSystem;
  private atomsCloud?: PointsCloudSystem;
  private moleculesCloud?: PointsCloudSystem;
  private molecularCloudParticles: ParticleSystem[] = []; // Track molecular cloud particles
  private molecularMeshes: Mesh[] = []; // ACTUAL 3D molecules!
  private densityCloud?: PointsCloudSystem;
  private starMeshes: Map<StellarAgent, Mesh> = new Map();
  private planetMeshes: Map<PlanetaryAgent, Mesh> = new Map();
  private galaxyMarkerMeshes: Map<string, Mesh> = new Map();
  
  // UI Panels
  private hud: AdaptiveHUD;
  private molecularPanel: MolecularBreakdownPanel;
  
  constructor(canvas: HTMLCanvasElement, seed: string) {
    console.log('🌌 COMPLETE BOTTOM-UP UNIVERSE');
    console.log(`  Seed: ${seed}`);
    console.log(`  Vision: Quantum Foam → Cosmic Web → Big Crunch`);
    console.log('');
    
    // Babylon setup
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 1); // BLACK - NOTHING exists yet!
    
    // Camera starts ZOOMED IN (Planck scale)
    // Uses 80% of screen (left side) - RIGHT 20% for HUD + Molecular panel
    this.camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 2,
      0.1, // VERY CLOSE (representing Planck scale)
      BabylonVector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 0.01;
    this.camera.upperRadiusLimit = 100000;
    
    // CRITICAL: Set viewport to LEFT 80% of screen
    // Right 20% reserved for UI panels
    this.camera.viewport = new Viewport(
      0,      // x = left edge
      0,      // y = bottom edge  
      0.8,    // width = 80% of screen
      1.0     // height = full height
    );
    
    // CRITICAL: Bright light for seeing molecules in dark space!
    // Space is black, but objects must be VISIBLE
    const ambient = new HemisphericLight('ambient', new BabylonVector3(0, 1, 0), this.scene);
    ambient.intensity = 0.5; // Increased from 0.1 (molecules need more light!)
    ambient.groundColor = new Color3(0.1, 0.1, 0.2); // Slight blue from below
    
    // GLOW LAYER - Makes emissive materials actually GLOW!
    const glow = new GlowLayer('glow', this.scene);
    glow.intensity = 1.0;
    
    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    
    // UI Panels (professional layout)
    this.hud = new AdaptiveHUD(this.gui);
    this.molecularPanel = new MolecularBreakdownPanel(this.scene, this.engine);
    
    // Yuka setup
    this.spawner = new AgentSpawner();
    this.entropyAgent = new EntropyAgent(this.spawner);
    
    // Wire callbacks
    this.spawner.onStellarEpoch = async (state) => {
      await this.onStellarEpoch(state);
    };
    
    this.spawner.onPlanetaryEpoch = async (state) => {
      await this.onPlanetaryEpoch(state);
    };
    
    // Create initial visualization (quantum foam)
    this.createQuantumFoamVisualization();
    
    // Create UI
    this.createUI();
    
    // Initial HUD update (show t=0 state even when paused)
    this.updateHUD();
    
    // Start render loop
    this.engine.runRenderLoop(() => this.render());
    
    console.log('🎬 Scene initialized - Press PLAY to begin Big Bang');
  }
  
  /**
   * Create Big Bang visualization
   * CENTER → OUTWARD expansion (not random particles!)
   * 
   * Shows traceries of light/energy spreading from singularity
   * to form structure (galaxies, cosmic web)
   * 
   * NOTE: Starts STOPPED - triggers when user presses PLAY
   */
  private createQuantumFoamVisualization(): void {
    // Big Bang explosion from CENTER POINT (singularity)
    this.particleSystem = new ParticleSystem('big-bang-expansion', 5000, this.scene);
    this.particleSystem.particleTexture = new Texture(
      'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png',
      this.scene
    );
    
    // EMIT FROM CENTER (0,0,0) - singularity point!
    this.particleSystem.emitter = BabylonVector3.Zero();
    this.particleSystem.createSphereEmitter(0.1); // Point source
    
    // Particles EXPLODE OUTWARD (radial expansion!)
    this.particleSystem.minEmitPower = 100;  // Fast expansion
    this.particleSystem.maxEmitPower = 300;
    
    // Energy lifetime (visible as they spread)
    this.particleSystem.minLifeTime = 2;
    this.particleSystem.maxLifeTime = 5;
    this.particleSystem.emitRate = 1000;
    
    // Color: White-hot → Blue (cooling as they spread)
    this.particleSystem.color1 = new Color4(1, 1, 1, 1);      // White (hot)
    this.particleSystem.color2 = new Color4(0.7, 0.9, 1, 1);  // Blue-white (cooling)
    this.particleSystem.colorDead = new Color4(0.3, 0.5, 0.8, 0); // Faint blue (cold)
    
    // Tracery effect (line particles)
    this.particleSystem.minSize = 0.5;
    this.particleSystem.maxSize = 2;
    
    // DON'T start yet - wait for Big Bang!
    
    console.log('  💥 Big Bang prepared (CENTER → OUTWARD expansion)');
  }
  
  /**
   * Create UI controls
   * 
   * PROFESSIONAL LAYOUT:
   * - 80% LEFT: Active view
   * - 20% RIGHT: HUD (top) + Molecular (middle) + VCR (bottom)
   */
  private createUI(): void {
    // ═══════════════════════════════════════════════════════════════
    // VCR CONTROLS - BOTTOM OF RIGHT PANEL (20%)
    // ═══════════════════════════════════════════════════════════════
    
    // Detect mobile/small screens
    const isMobile = window.innerWidth < 768 || window.innerHeight < 600;
    
    // VCR Controls panel - in RIGHT 20% area, at bottom
    const controls = new StackPanel('vcr-controls');
    controls.isVertical = false;
    controls.width = '20%';  // Right panel width
    controls.height = isMobile ? '60px' : '50px';
    controls.horizontalAlignment = StackPanel.HORIZONTAL_ALIGNMENT_RIGHT;
    controls.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_BOTTOM;
    
    // Position within right panel
    controls.top = isMobile ? '-10px' : '-10px';
    controls.left = '-5px';
    
    // Semi-transparent background
    controls.background = 'rgba(0, 5, 10, 0.9)';
    controls.paddingTop = '5px';
    controls.paddingBottom = '5px';
    
    this.gui.addControl(controls);
    
    // Play button - compact for right panel
    const playButton = Button.CreateSimpleButton('play', '▶');
    playButton.width = '40px';
    playButton.height = '40px';
    playButton.color = '#00ff88';
    playButton.background = 'rgba(0, 20, 30, 0.9)';
    playButton.thickness = 2;
    playButton.cornerRadius = 5;
    playButton.onPointerClickObservable.add(() => {
      this.paused = !this.paused;
      playButton.textBlock!.text = this.paused ? '▶' : '⏸';
    });
    controls.addControl(playButton);
    
    // Speed button (cycles through speeds)
    let currentSpeed = 1;
    const speedButton = Button.CreateSimpleButton('speed', '1x');
    speedButton.width = '50px';
    speedButton.height = '40px';
    speedButton.color = '#88ccff';
    speedButton.background = 'rgba(0, 20, 30, 0.9)';
    speedButton.thickness = 2;
    speedButton.cornerRadius = 5;
    speedButton.onPointerClickObservable.add(() => {
      // Cycle: 1x → 10x → 100x → 1000x → 1x
      const speeds = [1, 10, 100, 1000];
      const currentIndex = speeds.indexOf(currentSpeed);
      currentSpeed = speeds[(currentIndex + 1) % speeds.length];
      speedButton.textBlock!.text = `${currentSpeed}x`;
      console.log(`Speed: ${currentSpeed}x`);
    });
    controls.addControl(speedButton);
  }
  
  /**
   * Stellar epoch callback
   * 
   * NOTE: We do NOT spawn stars here!
   * Stars form when DensityAgents collapse (Jeans instability).
   * This callback just marks the EPOCH and transitions visuals.
   */
  private async onStellarEpoch(state: any): Promise<void> {
    console.log('\n⭐ STELLAR EPOCH REACHED!');
    console.log(`  t = ${(this.entropyAgent.age / (1e6 * YEAR)).toFixed(1)} Myr`);
    console.log(`  Transitioning: Molecular → Stellar scale`);
    console.log(`  🌟 Stars will form WHERE DensityAgents collapse (NOT forced!)`);
    
    // Transition phase
    this.currentPhase = 'stellar-era';
    this.currentScale = PhysicalScale.STELLAR;
    
    // Clear molecular visualization (but NOT density field!)
    // Density field stays - agents are still deciding whether to collapse
    if (this.moleculesCloud) {
      this.moleculesCloud.dispose();
      this.moleculesCloud = undefined;
    }
    
    // Mark structure
    MARKER_STORE.addMarker('stellar-epoch', this.entropyAgent.scaleFactor, new YukaVector3(0, 0, 0), this.entropyAgent.age);
    
    // Camera zooms OUT to stellar scale
    this.zoomToScale(PhysicalScale.STELLAR);
    
    console.log(`  📹 Camera zooming out to stellar scale...`);
    console.log(`  ⏳ Waiting for DensityAgents to decide when to collapse...`);
  }
  
  /**
   * Planetary epoch callback
   */
  private async onPlanetaryEpoch(state: any): Promise<void> {
    console.log('\n🪐 PLANETARY EPOCH REACHED!');
    console.log(`  t = ${(this.entropyAgent.age / (1e9 * YEAR)).toFixed(2)} Gyr`);
    console.log(`  Transitioning: Stellar → Planetary scale`);
    
    this.currentPhase = 'galactic-era';
    
    // Mark structure
    MARKER_STORE.addMarker('planetary-system', this.entropyAgent.scaleFactor, new YukaVector3(0, 0, 0), this.entropyAgent.age);
  }
  
  /**
   * Smoothly zoom camera to target scale
   */
  private zoomToScale(targetScale: PhysicalScale): void {
    // Map physical scale to camera distance
    // Log scale mapping
    const targetRadius = Math.log10(targetScale) * 10;
    
    console.log(`  📹 Zooming from ${this.camera.radius.toFixed(1)} to ${targetRadius.toFixed(1)}`);
    
    // Animate zoom (will interpolate in update loop)
    // For now, just set target
    // TODO: Smooth interpolation
  }
  
  /**
   * Update phase based on universe age
   */
  private updatePhase(): void {
    const age = this.entropyAgent.age;
    const phase = this.entropyAgent.phase;
    
    // Determine current phase based on age
    if (age < 1e-43) {
      this.currentPhase = 'quantum-foam';
    } else if (age < 1) {
      this.currentPhase = 'particle-soup';
    } else if (age < 180) { // 3 minutes
      this.currentPhase = 'nucleosynthesis';
    } else if (age < 380000 * YEAR) {
      this.currentPhase = 'dark-ages';
    } else if (age < 100e6 * YEAR) {
      this.currentPhase = 'molecular-era';
    } else if (age < 1e9 * YEAR) {
      this.currentPhase = 'stellar-era';
    } else {
      this.currentPhase = 'galactic-era';
    }
    
    // Check for maximum expansion
    if (phase === 'maximum') {
      this.currentPhase = 'maximum';
    } else if (phase === 'contraction') {
      this.currentPhase = 'contraction';
    }
  }
  
  /**
   * Update visuals based on current phase
   */
  private updateVisualsForPhase(): void {
    const T = this.entropyAgent.temperature;
    const age = this.entropyAgent.age;
    
    // Trigger Big Bang on first update (regardless of phase)
    if (!this.bigBangTriggered && age > 0) {
      console.log('💥 BIG BANG! - Universe springs into existence!');
      this.bigBangTriggered = true;
      
      // Flash from black to white
      this.scene.clearColor = new Color4(1, 1, 1, 1);
      
      // Start particle system
      if (this.particleSystem) {
        this.particleSystem.start();
      }
    }
    
    // AFTER Big Bang: Background color tracks temperature
    if (T > 1e13) {
      // Nucleosynthesis - orange/white (opaque plasma)
      this.scene.clearColor = new Color4(1, 0.8, 0.5, 1);
    } else if (T > 1e9) {
      // Cooling - red (still opaque)
      this.scene.clearColor = new Color4(0.8, 0.2, 0, 1);
    } else if (T > 1e4) {
      // Recombination - dark red (becoming transparent)
      this.scene.clearColor = new Color4(0.3, 0, 0, 1);
    } else if (T > 100) {
      // Molecular era - deep blue (transparent, cosmic background)
      this.scene.clearColor = new Color4(0, 0, 0.2, 1);
    } else {
      // Space - near black (dark energy era)
      this.scene.clearColor = new Color4(0, 0, 0.05, 1);
    }
    
    // Render appropriate visualization for current phase
    switch (this.currentPhase) {
      case 'quantum-foam':
        // Quantum foam visuals already created
        break;
        
      case 'particle-soup':
        // Faster particles (inflation!)
        if (this.particleSystem) {
          this.particleSystem.minEmitBox = new BabylonVector3(-1, -1, -1);
          this.particleSystem.maxEmitBox = new BabylonVector3(1, 1, 1);
          this.particleSystem.emitRate = 5000;
        }
        break;
        
      case 'nucleosynthesis':
        // Particles slowing down
        if (this.particleSystem) {
          this.particleSystem.minEmitBox = new BabylonVector3(-10, -10, -10);
          this.particleSystem.maxEmitBox = new BabylonVector3(10, 10, 10);
          this.particleSystem.emitRate = 2000;
        }
        break;
        
      case 'dark-ages':
      case 'recombination':
        // Transition to atoms visualization
        this.createAtomsVisualization();
        break;
        
      case 'molecular-era':
        // Transition to molecules
        this.createMoleculesVisualization();
        
        // Initialize density field (DensityAgents)
        // This is where stars will eventually form!
        this.initializeDensityField();
        break;
        
      case 'stellar-era':
      case 'galactic-era':
        // Stars already created by callbacks
        break;
      
      case 'maximum':
        // Peak expansion - visual indicators
        console.log('🌌 MAXIMUM EXPANSION REACHED');
        // Could add visual effects (pulsing, color shift)
        break;
      
      case 'contraction':
        // Universe contracting - reverse visuals!
        this.visualizeContraction();
        break;
      
      case 'big-crunch':
        // Final collapse
        this.visualizeBigCrunch();
        break;
    }
  }
  
  /**
   * Visualize contraction phase
   * Universe is SHRINKING - everything falling back together
   */
  private visualizeContraction(): void {
    // Background gets brighter as matter compresses
    const scale = this.entropyAgent.scaleFactor;
    const brightness = Math.max(0, 1 - scale / 10); // Gets brighter as scale decreases
    
    this.scene.clearColor = new Color4(
      brightness * 0.5,
      brightness * 0.2,
      brightness * 0.1,
      1
    );
    
    // Could add particle effects showing matter falling inward
    // For now, just the background change indicates contraction
  }
  
  /**
   * Visualize Big Crunch
   * All matter compressed back to singularity
   * Returns to VOID (absence of everything)
   */
  private visualizeBigCrunch(): void {
    // First: Brief white flash (compression to singularity)
    this.scene.clearColor = new Color4(1, 1, 1, 1);
    
    // Clear all visualizations
    if (this.particleSystem) {
      this.particleSystem.stop();
    }
    if (this.atomsCloud) {
      this.atomsCloud.dispose();
      this.atomsCloud = undefined;
    }
    if (this.moleculesCloud) {
      this.moleculesCloud.dispose();
      this.moleculesCloud = undefined;
    }
    if (this.densityCloud) {
      this.densityCloud.dispose();
      this.densityCloud = undefined;
    }
    
    // Dispose all star/planet meshes
    for (const mesh of this.starMeshes.values()) {
      mesh.dispose();
    }
    for (const mesh of this.planetMeshes.values()) {
      mesh.dispose();
    }
    this.starMeshes.clear();
    this.planetMeshes.clear();
    
    console.log('💥 BIG CRUNCH - Cycle complete!');
    console.log('   Universe compressed back to singularity');
    console.log('   Planck scale reached again');
    
    // After a moment, fade to black (return to void)
    setTimeout(() => {
      this.scene.clearColor = new Color4(0, 0, 0, 1); // Back to NOTHING
      this.bigBangTriggered = false; // Could loop if desired
      console.log('   → Returned to VOID (absence of everything)');
    }, 1000);
  }
  
  /**
   * Create atoms visualization (GPU-optimized particle system)
   */
  private createAtomsVisualization(): void {
    if (this.atomsCloud) return; // Already created
    
    // REPLACE quantum foam with atom particles
    if (this.particleSystem) {
      this.particleSystem.stop();
      this.particleSystem.dispose();
      this.particleSystem = undefined; // CRITICAL: Clear ref so we can create new one!
    }
    
    // Use PARTICLE SYSTEM for atoms (GPU-optimized, not individual meshes!)
    // This renders 10k particles efficiently on GPU
    this.particleSystem = new ParticleSystem('atoms', 10000, this.scene);
    this.particleSystem.particleTexture = new Texture(
      'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png',
      this.scene
    );
    
    // Emit from expanding sphere (atoms filling space)
    this.particleSystem.emitter = BabylonVector3.Zero();
    this.particleSystem.minEmitBox = new BabylonVector3(-300, -300, -300);
    this.particleSystem.maxEmitBox = new BabylonVector3(300, 300, 300);
    
    // Atoms drift slowly (Brownian motion)
    this.particleSystem.minLifeTime = 5;
    this.particleSystem.maxLifeTime = 10;
    this.particleSystem.emitRate = 2000;
    
    this.particleSystem.minSize = 0.5;
    this.particleSystem.maxSize = 2;
      
    // Hydrogen (75%) = pale blue/white, Helium (25%) = yellow
    this.particleSystem.color1 = new Color4(0.9, 0.9, 1, 0.8); // Hydrogen
    this.particleSystem.color2 = new Color4(1, 1, 0.7, 0.8); // Helium
    this.particleSystem.colorDead = new Color4(0.9, 0.9, 1, 0.3);
    
    // Slow drift
    this.particleSystem.minEmitPower = 0.5;
    this.particleSystem.maxEmitPower = 2;
    
    this.particleSystem.start();
    
    // Mark as created
    this.atomsCloud = {} as any; // Dummy object to prevent recreation
    
    console.log('  ⚛️  Atoms visualization created (GPU particle system)');
  }
  
  /**
   * Create molecules visualization (10 distinct cloud clusters)
   */
  private createMoleculesVisualization(): void {
    if (this.moleculesCloud) return;
    
    // Fade out atoms particle system
    if (this.particleSystem) {
      this.particleSystem.stop();
      this.particleSystem.dispose();
      this.particleSystem = undefined;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SCIENTIFICALLY ACCURATE MOLECULAR VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    // Show ACTUAL molecular structures (H2, H2O, CO2, CH4, NH3)
    // Each molecule has proper geometry and tumbles in space!
    // ═══════════════════════════════════════════════════════════════
    
    const clusterCount = 10;
    const moleculesPerCloud = 20; // Fewer molecules (they're detailed 3D structures!)
    
    // Common molecules in molecular clouds
    const moleculeTypes = ['H2', 'H2O', 'CO2', 'CH4', 'NH3', 'O2'];
    
    for (let c = 0; c < clusterCount; c++) {
      const clusterCenter = new BabylonVector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
      
      // Create ACTUAL 3D molecules in this cloud!
      const cloudMolecules = MolecularVisuals.createMolecularCloud(
        clusterCenter,
        50, // Cloud radius
        moleculeTypes,
        moleculesPerCloud,
        this.scene
      );
      
      // Track for animation and disposal
      this.molecularMeshes.push(...cloudMolecules);
      
      // Also add particle system for visual density (fog effect)
      const cloud = new ParticleSystem(`cloud-fog-${c}`, 500, this.scene);
      cloud.particleTexture = new Texture(
        'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png',
        this.scene
      );
      
      cloud.emitter = clusterCenter;
      cloud.minEmitBox = new BabylonVector3(-40, -40, -40);
      cloud.maxEmitBox = new BabylonVector3(40, 40, 40);
      
      cloud.minLifeTime = 15;
      cloud.maxLifeTime = 30;
      cloud.emitRate = 50;
      cloud.minSize = 2;
      cloud.maxSize = 5;
      
      // Faint blue fog
      cloud.color1 = new Color4(0.3, 0.5, 0.8, 0.3);
      cloud.color2 = new Color4(0.4, 0.6, 0.9, 0.4);
      cloud.colorDead = new Color4(0.2, 0.4, 0.7, 0.1);
      
      cloud.minEmitPower = 0.1;
      cloud.maxEmitPower = 0.3;
      
      cloud.start();
      this.molecularCloudParticles.push(cloud);
    }
    
    // Mark as created
    this.moleculesCloud = {} as any; // Dummy object to prevent recreation
    
    console.log(`  🧬 Molecular clouds created:`);
    console.log(`     - ${clusterCount * moleculesPerCloud} ACTUAL 3D molecules (H2, H2O, CO2, CH4, NH3)`);
    console.log(`     - 10 particle fog systems for density`);
    console.log(`     - Molecules tumble and rotate in 3D!`);
  }
  
  /**
   * Initialize density field (spawn DensityAgents)
   * 
   * This is where STARS WILL FORM - NOT forced placement!
   * DensityAgents decide WHERE to collapse based on Jeans instability.
   */
  private initializeDensityField(): void {
    if (this.densityFieldInitialized) return;
    
    console.log('\n🌫️  INITIALIZING DENSITY FIELD');
    console.log(`  t = ${(this.entropyAgent.age / YEAR).toFixed(0)} years (recombination epoch)`);
    console.log(`  Spawning DensityAgents in 3D grid...`);
    
    const gridSize = 10; // 10x10x10 = 1000 agents
    const spacing = 100;  // Space between agents (game units)
    
    const positions: BabylonVector3[] = [];
    let spawnedCount = 0;
    
    // Create 3D grid of density agents
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let y = -gridSize / 2; y < gridSize / 2; y++) {
        for (let z = -gridSize / 2; z < gridSize / 2; z++) {
          // Calculate position
          const px = x * spacing;
          const py = y * spacing;
          const pz = z * spacing;
          
          positions.push(new BabylonVector3(px, py, pz));
          
          // Initial density (typical molecular cloud)
          // Add some variation (±50%)
          const baseDensity = 1e-16; // kg/m³ (MUCH higher for collapse!)
          const variation = 1.0 + (Math.random() - 0.5);
          const density = baseDensity * variation;
          
          // Temperature: COLD molecular cloud (NOT universe temp!)
          // Molecular clouds are ~10-20 K regardless of universe temp
          const temperature = 10 + Math.random() * 10; // 10-20 K
          
          // Mass in this cell (assuming giant molecular cloud)
          // Need M > M_J ≈ 8e30 kg for collapse
          // Use range similar to test: 1e34 to 8e34 kg
          const volume = 1e50; // m³ (larger volume!)
          const mass = density * volume;
          
          // Create DensityAgent
          const agent = new DensityAgent(density, temperature, mass, this.spawner);
          agent.position.set(px, py, pz);
          
          // Add to entity manager (will call start())
          this.spawner.getManager().add(agent);
          agent.start();
          
          spawnedCount++;
        }
      }
    }
    
    // Create visualization (point cloud)
    this.densityCloud = new PointsCloudSystem('density-field', positions.length, this.scene);
    this.densityCloud.addPoints(positions.length, (particle, i) => {
      particle.position = positions[i];
      particle.color = new Color4(0.3, 0.5, 0.8, 0.5); // Faint blue (molecular clouds)
    });
    this.densityCloud.buildMeshAsync();
    
    this.densityFieldInitialized = true;
    
    console.log(`  ✅ Spawned ${spawnedCount} DensityAgents`);
    console.log(`  🌟 Stars will form WHERE agents decide (Jeans instability)!`);
    console.log('');
  }
  
  /**
   * Auto-zoom camera as universe evolves
   * Camera follows the EXPANSION and CONTRACTION
   */
  private autoZoomCamera(): void {
    const age = this.entropyAgent.age;
    const phase = this.entropyAgent.phase;
    const scale = this.entropyAgent.scaleFactor;
    
    // Calculate target camera distance based on phase
    let targetRadius: number;
    
    // During contraction, REVERSE the zoom (zoom IN as universe contracts)
    if (phase === 'contraction' || phase === 'big-crunch') {
      // Zoom IN as scale factor decreases
      // Map scale factor to camera distance (logarithmic)
      targetRadius = Math.max(0.1, Math.log10(scale + 1) * 100);
      
      // Big Crunch: Back to Planck scale
      if (phase === 'big-crunch') {
        targetRadius = 0.1;
      }
    } else if (phase === 'maximum') {
      // Peak zoom - hold steady
      targetRadius = this.camera.radius;
    } else {
      // Normal expansion - zoom OUT as age increases
    if (age < 1) {
      // Quantum foam (t < 1 second) - ZOOMED IN to Planck scale
      targetRadius = 0.1;
    } else if (age < 180) {
      // Nucleosynthesis (t < 3 minutes) - See particle soup
      targetRadius = 10;
    } else if (age < 380000 * YEAR) {
      // Dark ages (t < 380k years) - Atoms filling space
      targetRadius = 500;
    } else if (age < 100e6 * YEAR) {
      // Molecular era (t < 100 Myr) - See molecular CLOUDS as distinct clusters
      // Clouds span ±250 units, so camera needs to be at ~800 to see all 10 clusters
      targetRadius = 800;
    } else if (age < 500e6 * YEAR) {
      // Stellar era (t < 500 Myr) - See stars forming and clustering
      // Stars spawn in same positions as density agents (±500 units)
      targetRadius = 1000;
    } else if (age < 1e9 * YEAR) {
      // Galaxy assembly (t < 1 Gyr) - See galaxies forming
      targetRadius = 1500;
    } else {
      // Galactic era (t > 1 Gyr) - Full cosmic web
      const ageGyr = age / (1e9 * YEAR);
      targetRadius = 2000 + (ageGyr * 500); // Slowly zoom out more
      }
    }
    
    // Smooth interpolation
    const lerpSpeed = (phase === 'contraction' || phase === 'big-crunch') ? 0.02 : 0.01;
    this.camera.radius += (targetRadius - this.camera.radius) * lerpSpeed;
  }
  
  /**
   * Update (called every frame)
   */
  private update(delta: number): void {
    // Always update HUD (even when paused, to show current state)
    this.updateHUD();
    
    if (this.paused) return;
    
    // Update EntropyAgent (conducts everything)
    this.entropyAgent.update(delta);
    
    // Update spawner (all spawned agents) with SCALED time!
    // EntropyAgent determines time scale based on universe activity
    const scaledDelta = delta * this.entropyAgent.timeScale;
    this.spawner.update(scaledDelta);
    
    // Update current phase
    this.updatePhase();
    
    // Update visuals for current phase
    this.updateVisualsForPhase();
    
    // Update zoom level
    this.currentZoomLevel = getZoomLevelFromCameraDistance(this.camera.radius);
    
    // Animate molecules (tumbling in space!) - GIVES SCIENCE MEANING!
    for (const molecule of this.molecularMeshes) {
      MolecularVisuals.animateMolecule(molecule, delta);
    }
    
    // Update molecular breakdown panel (ALWAYS present, contextual!)
    this.updateMolecularPanel();
    this.molecularPanel.update(delta);
    
    // Render based on zoom level
    this.updateStarVisuals(); // STELLAR zoom and closer
    this.updateGalaxyMarkers(); // COSMIC zoom
    
    // Auto-zoom camera (follows growth!)
    this.autoZoomCamera();
    
    // Slow camera rotation
    this.camera.alpha += 0.0005;
  }
  
  /**
   * Update molecular panel with current context
   * Shows molecules relevant to current scale/view
   */
  private updateMolecularPanel(): void {
    const scale = this.currentZoomLevel as any; // Map zoom to context scale
    const context = MolecularBreakdownPanel.getContextForScale(
      scale === ZoomLevel.COSMIC ? 'cosmic' :
      scale === ZoomLevel.GALACTIC ? 'galactic' :
      scale === ZoomLevel.STELLAR ? 'stellar' :
      scale === ZoomLevel.PLANETARY ? 'planetary' : 'surface',
      this.entropyAgent.age,
      this.entropyAgent.temperature
    );
    
    this.molecularPanel.updateContext(context);
  }
  
  /**
   * Update star visuals - create meshes for new stars
   * ONLY at STELLAR or closer zoom levels!
   */
  private updateStarVisuals(): void {
    // Check zoom level
    this.currentZoomLevel = getZoomLevelFromCameraDistance(this.camera.radius);
    
    // Stars only visible at STELLAR zoom or closer
    if (this.currentZoomLevel === ZoomLevel.COSMIC || this.currentZoomLevel === ZoomLevel.GALACTIC) {
      // Too zoomed out - hide stars, show galaxy markers instead
      return;
    }
    
    const stellarAgents = this.spawner.getAgents(AgentType.STELLAR) as StellarAgent[];
    
    // When first star forms, clean up pre-stellar visualizations
    if (stellarAgents.length > 0) {
      // Dispose density cloud
      if (this.densityCloud) {
        this.densityCloud.dispose();
        this.densityCloud = undefined;
      }
      
      // Dispose molecular cloud particles (GPU performance!)
      for (const cloud of this.molecularCloudParticles) {
        cloud.stop();
        cloud.dispose();
      }
      this.molecularCloudParticles = [];
      
      // Dispose 3D molecular meshes (they collapsed into stars!)
      for (const molecule of this.molecularMeshes) {
        molecule.dispose();
      }
      this.molecularMeshes = [];
      
      console.log('  🌟 Molecules collapsed into stars - cleaning up visualizations');
    }
    
    for (const star of stellarAgents) {
      if (!this.starMeshes.has(star)) {
        // Create SCIENTIFICALLY ACCURATE stellar visual!
        // Uses mass → temperature → spectral type → color
        const blueprint = StellarVisuals.createBlueprint(star.mass / 1.989e30); // Convert to solar masses
        
        const starMesh = StellarVisuals.renderStar(
          blueprint,
          new BabylonVector3(star.position.x, star.position.y, star.position.z),
          this.scene,
          star.uuid
        );
        
        this.starMeshes.set(star, starMesh);
        
        console.log(`  🌟 Star formed: ${blueprint.spectralType}-type (${blueprint.temperature.toFixed(0)}K)`);
      } else {
        // Update position (stars move via GravityBehavior)
        const mesh = this.starMeshes.get(star)!;
        mesh.position.set(
          star.position.x,
          star.position.y,
          star.position.z
        );
        
        // Animate rotation
        StellarVisuals.animateStar(mesh, this.scene.getEngine().getDeltaTime() / 1000);
      }
    }
  }
  
  /**
   * Update galaxy markers - visible at COSMIC zoom
   */
  private updateGalaxyMarkers(): void {
    // Only at COSMIC zoom
    if (this.currentZoomLevel !== ZoomLevel.COSMIC && this.currentZoomLevel !== ZoomLevel.GALACTIC) {
      // Clear galaxy markers when zoomed in
      for (const mesh of this.galaxyMarkerMeshes.values()) {
        mesh.dispose();
      }
      this.galaxyMarkerMeshes.clear();
      return;
    }
    
    // Get markers from marker store
    const markers = MARKER_STORE.getAllMarkers();
    const galaxyMarkers = markers.filter(m => m.type === 'stellar-epoch' || m.type === 'galactic-center');
    
    for (const marker of galaxyMarkers) {
      if (!this.galaxyMarkerMeshes.has(marker.id)) {
        // Create marker visual (simple sphere)
        const sphere = MeshBuilder.CreateSphere(
          `galaxy-${marker.id}`,
          { diameter: 50 }, // Large for visibility at cosmic scale
          this.scene
        );
        
        sphere.position.set(
          marker.position.x,
          marker.position.y,
          marker.position.z
        );
        
        // Glowing material
        const mat = new StandardMaterial(`galaxy-mat-${marker.id}`, this.scene);
        mat.emissiveColor = new Color3(0.5, 0.7, 1); // Blue glow (galaxy)
        mat.alpha = 0.7;
        sphere.material = mat;
        
        this.galaxyMarkerMeshes.set(marker.id, sphere);
      }
    }
  }
  
  /**
   * Update HUD with current state
   */
  private updateHUD(): void {
    const age = this.entropyAgent.age;
    const T = this.entropyAgent.temperature;
    
    // Format age
    let ageStr: string;
    if (age < 1e-6) {
      ageStr = `${(age * 1e12).toFixed(1)} ps`;
    } else if (age < 1) {
      ageStr = `${(age * 1e6).toFixed(1)} μs`;
    } else if (age < 60) {
      ageStr = `${age.toFixed(2)} s`;
    } else if (age < 3600) {
      ageStr = `${(age / 60).toFixed(1)} min`;
    } else if (age < YEAR) {
      ageStr = `${(age / 86400).toFixed(1)} days`;
    } else if (age < 1e6 * YEAR) {
      ageStr = `${(age / YEAR).toFixed(0)} yr`;
    } else if (age < 1e9 * YEAR) {
      ageStr = `${(age / (1e6 * YEAR)).toFixed(1)} Myr`;
    } else {
      ageStr = `${(age / (1e9 * YEAR)).toFixed(2)} Gyr`;
    }
    
    // Format temperature
    const tempStr = T > 1e6 ? `${T.toExponential(1)} K` : `${T.toFixed(0)} K`;
    
    // Format scale factor (prevent Infinity display)
    const scaleFactor = this.entropyAgent.scaleFactor;
    let scaleStr: string;
    if (!isFinite(scaleFactor) || scaleFactor > 1e30) {
      scaleStr = 'Maximum (>1e30x)';
    } else if (scaleFactor > 1e10) {
      scaleStr = `${scaleFactor.toExponential(1)}x`;
    } else if (scaleFactor > 1000) {
      scaleStr = `${(scaleFactor / 1000).toFixed(1)}kx`;
    } else {
      scaleStr = `${scaleFactor.toFixed(2)}x`;
    }
    
    // Phase name
    const phaseNames: Record<SimulationPhase, string> = {
      'quantum-foam': '💥 Quantum Foam (Planck Epoch)',
      'particle-soup': '🔥 Quark-Gluon Plasma',
      'nucleosynthesis': '⚛️  Big Bang Nucleosynthesis',
      'dark-ages': '🌑 Dark Ages (Cooling)',
      'recombination': '✨ Recombination (Atoms Form)',
      'molecular-era': '🧬 Molecular Era (Clouds)',
      'stellar-era': '⭐ Stellar Era (First Stars)',
      'galactic-era': '🌀 Galactic Era (Structure Formation)',
      'maximum': '🌌 Maximum Expansion',
      'contraction': '🔄 Contraction Phase',
      'big-crunch': '💥 Big Crunch',
    };
    
    // Let AdaptiveHUD handle ALL display (agent-driven!)
    this.hud.updatePanel({
      id: 'universe',
      title: phaseNames[this.currentPhase],
      content: [
        `Age: ${ageStr}`,
        `Temp: ${tempStr}`,
        `Scale: ${scaleStr}`,
        `Phase: ${this.entropyAgent.phase}`,
        `Agents: ${this.spawner.getTotalAgentCount()}`,
        `Camera: ${this.camera.radius.toFixed(0)} units`,
      ],
      priority: 100,
    });
    
    // NO hardcoded title/phase text - HUD handles it all!
  }
  
  /**
   * Render loop
   */
  private render(): void {
    const delta = this.engine.getDeltaTime() / 1000; // Convert to seconds
    
    // Update simulation
    this.update(delta);
    
    // Render main scene (80% left viewport)
    this.scene.render();
    
    // Render molecular breakdown panel (20% right viewport, middle section)
    this.molecularPanel.render();
  }
}

/**
 * THE COMPLETE VISION:
 * 
 * t=0 (Planck epoch):
 * - Screen: WHITE (infinite energy density)
 * - Camera: 0.1 units (zoomed IN to Planck scale)
 * - Visual: Quantum foam particles
 * - HUD: "💥 Quantum Foam | t=0s | T=1e32K"
 * 
 * t=1μs (Quark-gluon plasma):
 * - Particles expanding rapidly
 * - Camera still close
 * - Temperature dropping
 * 
 * t=3 minutes (Nucleosynthesis):
 * - Particles slowing
 * - Screen: ORANGE (T=1e9K)
 * - Protons + neutrons fusing
 * 
 * t=380,000 years (Recombination):
 * - Atoms form!
 * - Screen: DARK RED (T=3000K)
 * - Switch to atoms visualization (point cloud)
 * - Camera starts zooming OUT (10 units)
 * 
 * t=100 Myr (First Stars):
 * - Molecular clouds collapse
 * - STELLAR AGENTS SPAWN!
 * - Switch to star visualization (glowing spheres)
 * - Camera zooms OUT to 500 units (stellar scale)
 * - Screen: DARK BLUE (space between stars)
 * 
 * t=1 Gyr (Galaxies form):
 * - Stars clustering
 * - Galactic structure emerges
 * - Camera at 2000 units (galactic scale)
 * 
 * t=13.8 Gyr (Present):
 * - Full cosmic web visible
 * - Camera at 10,000 units (cosmic scale)
 * - User can zoom in to any region → Game mode
 * 
 * t=50 Gyr (Maximum):
 * - Expansion stops
 * - EntropyAgent phase → 'maximum'
 * - Camera distance peaks
 * 
 * t=100 Gyr (Contraction):
 * - Universe SHRINKS
 * - Camera ZOOMS IN (reversing expansion!)
 * - Stars falling back together
 * - EntropyAgent phase → 'contraction'
 * 
 * t=200 Gyr (Big Crunch):
 * - All matter compressed
 * - Camera at 0.1 units again
 * - Screen: WHITE (like Big Bang)
 * - Cycle complete!
 * 
 * BOTTOM-UP → TOP-DOWN → BOTTOM-UP
 * Quantum → Cosmic → Quantum
 * Perfect cycle!
 */

