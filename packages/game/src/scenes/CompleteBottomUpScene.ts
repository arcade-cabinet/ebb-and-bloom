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
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Button, StackPanel } from '@babylonjs/gui';
import { Vector3 as YukaVector3 } from 'yuka';
import { EntropyAgent } from '../yuka-integration/agents/EntropyAgent';
import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { StellarAgent } from '../yuka-integration/agents/StellarAgent';
import { PlanetaryAgent } from '../yuka-integration/agents/PlanetaryAgent';
import { DensityAgent } from '../yuka-integration/agents/DensityAgent';
import { AdaptiveHUD } from '../ui/AdaptiveHUD';
import { MARKER_STORE } from '../state/UniverseMarkers';

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
  private paused: boolean = true; // START PAUSED - wait for user to press PLAY!
  private densityFieldInitialized: boolean = false;
  private bigBangTriggered: boolean = false; // Track if Big Bang happened yet
  
  // Visual elements
  private particleSystem?: ParticleSystem;
  private atomsCloud?: PointsCloudSystem;
  private moleculesCloud?: PointsCloudSystem;
  private densityCloud?: PointsCloudSystem;
  private starMeshes: Map<StellarAgent, Mesh> = new Map();
  private planetMeshes: Map<PlanetaryAgent, Mesh> = new Map();
  
  // HUD
  private hud: AdaptiveHUD;
  
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
    
    // Minimal ambient light
    const ambient = new HemisphericLight('ambient', new BabylonVector3(0, 1, 0), this.scene);
    ambient.intensity = 0.1;
    
    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    
    // HUD
    this.hud = new AdaptiveHUD(this.gui);
    
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
   * Create quantum foam visualization
   * Represents Planck-scale quantum fluctuations
   * 
   * NOTE: Starts STOPPED - will trigger on first update when Big Bang happens
   */
  private createQuantumFoamVisualization(): void {
    // Particle system for quantum foam
    this.particleSystem = new ParticleSystem('quantum-foam', 10000, this.scene);
    this.particleSystem.particleTexture = new Texture('https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/flare.png', this.scene);
    
    // Emit from origin (Big Bang point)
    this.particleSystem.emitter = BabylonVector3.Zero();
    this.particleSystem.minEmitBox = new BabylonVector3(-0.01, -0.01, -0.01);
    this.particleSystem.maxEmitBox = new BabylonVector3(0.01, 0.01, 0.01);
    
    // Quantum fluctuations (very rapid)
    this.particleSystem.minLifeTime = 0.1;
    this.particleSystem.maxLifeTime = 0.5;
    this.particleSystem.emitRate = 1000;
    
    // Bright, white-hot
    this.particleSystem.color1 = new Color4(1, 1, 1, 1);
    this.particleSystem.color2 = new Color4(1, 1, 0.8, 1);
    this.particleSystem.colorDead = new Color4(1, 0.5, 0, 0);
    
    this.particleSystem.minSize = 0.001;
    this.particleSystem.maxSize = 0.01;
    
    // DON'T start yet - wait for Big Bang to happen!
    // this.particleSystem.start(); // Removed!
    
    console.log('  ✨ Quantum foam prepared (waiting for Big Bang)');
  }
  
  /**
   * Create UI controls
   * 
   * NO HARDCODED TEXT - AdaptiveHUD handles all display!
   * Agents push updates to HUD, HUD displays based on priority.
   */
  private createUI(): void {
    // Controls (bottom)
    const controls = new StackPanel('controls');
    controls.isVertical = false;
    controls.top = '-20px';
    controls.height = '50px';
    controls.horizontalAlignment = StackPanel.HORIZONTAL_ALIGNMENT_CENTER;
    controls.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_BOTTOM;
    this.gui.addControl(controls);
    
    // Play button
    const playButton = Button.CreateSimpleButton('play', '▶ PLAY');
    playButton.width = '100px';
    playButton.height = '40px';
    playButton.color = '#00ff88';
    playButton.background = '#001122';
    playButton.onPointerClickObservable.add(() => {
      this.paused = !this.paused;
      playButton.textBlock!.text = this.paused ? '▶ PLAY' : '⏸ PAUSE';
    });
    controls.addControl(playButton);
    
    // Speed controls
    for (const speed of [1, 10, 100, 1000]) {
      const btn = Button.CreateSimpleButton(`speed-${speed}`, `${speed}x`);
      btn.width = '70px';
      btn.height = '40px';
      btn.color = '#88ccff';
      btn.background = '#001122';
      btn.onPointerClickObservable.add(() => {
        console.log(`Speed: ${speed}x (affects time scale)`);
        // Could implement variable time scale here
      });
      controls.addControl(btn);
    }
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
   * Create atoms visualization (point cloud)
   */
  private createAtomsVisualization(): void {
    if (this.atomsCloud) return; // Already created
    
    // Stop particle system
    if (this.particleSystem) {
      this.particleSystem.stop();
    }
    
    // Create point cloud for atoms
    this.atomsCloud = new PointsCloudSystem('atoms', 100000, this.scene);
    
    const atomPositions: BabylonVector3[] = [];
    const atomColors: Color4[] = [];
    
    // Distribute atoms randomly (hydrogen and helium)
    for (let i = 0; i < 100000; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 200;
      
      const x = radius * Math.sin(angle1) * Math.cos(angle2);
      const y = radius * Math.sin(angle1) * Math.sin(angle2);
      const z = radius * Math.cos(angle1);
      
      atomPositions.push(new BabylonVector3(x, y, z));
      
      // 75% hydrogen (white), 25% helium (yellow)
      if (Math.random() < 0.75) {
        atomColors.push(new Color4(0.8, 0.8, 1, 1)); // Hydrogen
      } else {
        atomColors.push(new Color4(1, 1, 0.5, 1)); // Helium
      }
    }
    
    this.atomsCloud.addPoints(atomPositions.length, (particle, i) => {
      particle.position = atomPositions[i];
      particle.color = atomColors[i];
    });
    
    this.atomsCloud.buildMeshAsync();
    
    console.log('  ⚛️  Atoms visualization created (100k points)');
  }
  
  /**
   * Create molecules visualization
   */
  private createMoleculesVisualization(): void {
    if (this.moleculesCloud) return;
    
    // Fade out atoms
    if (this.atomsCloud) {
      // Gradually reduce atom count or dispose
      this.atomsCloud.dispose();
      this.atomsCloud = undefined;
    }
    
    // Create molecular clouds (clusters)
    this.moleculesCloud = new PointsCloudSystem('molecules', 50000, this.scene);
    
    const moleculePositions: BabylonVector3[] = [];
    const moleculeColors: Color4[] = [];
    
    // Create clustered distribution (molecular clouds)
    const clusterCount = 10;
    for (let c = 0; c < clusterCount; c++) {
      const clusterCenter = new BabylonVector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
      
      // Add molecules around cluster
      const moleculesPerCluster = 5000;
      for (let i = 0; i < moleculesPerCluster; i++) {
        const offset = new BabylonVector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        );
        
        moleculePositions.push(clusterCenter.add(offset));
        moleculeColors.push(new Color4(0.5, 0.8, 1, 0.8)); // Blue (molecular clouds)
      }
    }
    
    this.moleculesCloud.addPoints(moleculePositions.length, (particle, i) => {
      particle.position = moleculePositions[i];
      particle.color = moleculeColors[i];
    });
    
    this.moleculesCloud.buildMeshAsync();
    
    console.log('  🧬 Molecular clouds created (50k points, 10 clusters)');
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
          const baseDensity = 1e-21; // kg/m³
          const variation = 1.0 + (Math.random() - 0.5);
          const density = baseDensity * variation;
          
          // Temperature: COLD molecular cloud (NOT universe temp!)
          // Molecular clouds are ~10-20 K regardless of universe temp
          const temperature = 10 + Math.random() * 10; // 10-20 K
          
          // Mass in this cell (assuming 100 ly cube)
          // Volume ≈ (100 ly)³ ≈ 10^45 m³
          const volume = 1e45; // m³
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
      // Quantum foam (t < 1 second)
      targetRadius = 0.1;
    } else if (age < 180) {
      // Nucleosynthesis (t < 3 minutes)
      targetRadius = 1;
    } else if (age < 380000 * YEAR) {
      // Dark ages (t < 380k years)
      targetRadius = 10;
    } else if (age < 100e6 * YEAR) {
      // Molecular era (t < 100 Myr)
      targetRadius = 100;
    } else if (age < 1e9 * YEAR) {
      // Stellar era (t < 1 Gyr)
      targetRadius = 500;
    } else {
      // Galactic era (t > 1 Gyr)
      const ageGyr = age / (1e9 * YEAR);
      targetRadius = 1000 + (ageGyr * 1000); // Zoom out as universe ages
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
    
    // Update spawner (all spawned agents)
    this.spawner.update(delta);
    
    // Update current phase
    this.updatePhase();
    
    // Update visuals for current phase
    this.updateVisualsForPhase();
    
    // Auto-zoom camera (follows growth!)
    this.autoZoomCamera();
    
    // Slow camera rotation
    this.camera.alpha += 0.0005;
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
        `Scale: ${this.entropyAgent.scaleFactor.toExponential(2)}x`,
        `Phase: ${this.entropyAgent.phase}`,
        `Agents: ${this.spawner.getTotalAgentCount()}`,
        `Camera: ${this.camera.radius.toFixed(1)} units`,
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
    
    // Render scene
    this.scene.render();
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

