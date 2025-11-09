/**
 * UNIVERSE TIMELINE SCENE
 * 
 * THE REAL INTEGRATION:
 * - GenesisSynthesisEngine (provides timeline + events)
 * - Yuka agents (make decisions at each epoch)
 * - Visual rendering (show what exists at current t)
 * - Legal brokers (validate agent actions)
 * 
 * Start at t=0, watch universe EMERGE.
 */

import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ParticleSystem,
  Texture,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Button, StackPanel } from '@babylonjs/gui';
import { EntityManager } from 'yuka';
import { GenesisSynthesisEngine } from '../synthesis/GenesisSynthesisEngine';
import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { StellarAgent } from '../yuka-integration/agents/StellarAgent';
import { PlanetaryAgent } from '../yuka-integration/agents/PlanetaryAgent';

const YEAR = 365.25 * 86400;

export class UniverseTimelineScene {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private gui: AdvancedDynamicTexture;
  
  // Timeline
  private seed: string;
  private genesis: GenesisSynthesisEngine;
  private currentTime: number = 0; // Seconds since Big Bang
  private timeScale: number = 1e6; // Years per frame
  private isPaused: boolean = true;
  
  // Yuka integration
  private entityManager: EntityManager;
  private spawner: AgentSpawner;
  private stellarAgents: StellarAgent[] = [];
  private planetaryAgents: PlanetaryAgent[] = [];
  
  // Visual elements
  private starMeshes: Map<StellarAgent, any> = new Map();
  private planetMeshes: Map<PlanetaryAgent, any> = new Map();
  
  // UI
  private timeDisplay!: TextBlock;
  private eventLog!: TextBlock;
  
  constructor(canvas: HTMLCanvasElement, seed: string) {
    this.seed = seed;
    
    // BabylonJS setup
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 1); // Black (void)
    
    // Camera
    this.camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      500,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    
    // Minimal lighting (most light comes from stars themselves)
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.1;
    
    // Genesis synthesis engine
    this.genesis = new GenesisSynthesisEngine(seed);
    
    // Yuka setup
    this.entityManager = new EntityManager();
    this.spawner = new AgentSpawner();
    
    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI');
    this.createUI();
    
    // Start render loop
    this.engine.runRenderLoop(() => this.render());
    
    console.log('[UniverseTimelineScene] Initialized');
    console.log(`  Seed: ${seed}`);
    console.log(`  t = 0 (Big Bang)`);
  }
  
  /**
   * Create UI (VCR controls + time display)
   */
  private createUI(): void {
    // Time display (top center)
    this.timeDisplay = new TextBlock('time', 't = 0s | Big Bang | Nothing exists');
    this.timeDisplay.color = '#00ff88';
    this.timeDisplay.fontSize = 20;
    this.timeDisplay.top = '20px';
    this.timeDisplay.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    this.timeDisplay.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    this.gui.addControl(this.timeDisplay);
    
    // Event log (top left)
    this.eventLog = new TextBlock('events', '');
    this.eventLog.color = '#ffcc00';
    this.eventLog.fontSize = 14;
    this.eventLog.top = '60px';
    this.eventLog.left = '20px';
    this.eventLog.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    this.eventLog.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    this.eventLog.textWrapping = true;
    this.eventLog.width = '400px';
    this.eventLog.height = '300px';
    this.gui.addControl(this.eventLog);
    
    // VCR controls (bottom center)
    const controls = new StackPanel('controls');
    controls.isVertical = false;
    controls.top = '-20px';
    controls.height = '50px';
    controls.horizontalAlignment = StackPanel.HORIZONTAL_ALIGNMENT_CENTER;
    controls.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_BOTTOM;
    this.gui.addControl(controls);
    
    // Play/Pause button
    const playButton = Button.CreateSimpleButton('play', this.isPaused ? '▶ PLAY' : '⏸ PAUSE');
    playButton.width = '100px';
    playButton.height = '40px';
    playButton.color = '#00ff88';
    playButton.background = '#001122';
    playButton.onPointerClickObservable.add(() => {
      this.isPaused = !this.isPaused;
      playButton.textBlock!.text = this.isPaused ? '▶ PLAY' : '⏸ PAUSE';
    });
    controls.addControl(playButton);
    
    // Speed controls
    for (const speed of [0.1, 1, 10, 100, 1000]) {
      const btn = Button.CreateSimpleButton(`speed-${speed}`, `${speed}x`);
      btn.width = '60px';
      btn.height = '40px';
      btn.color = '#88ccff';
      btn.background = '#001122';
      btn.onPointerClickObservable.add(() => {
        this.timeScale = speed * 1e6; // Convert to years/frame
      });
      controls.addControl(btn);
    }
  }
  
  /**
   * Update (called every frame)
   */
  private update(delta: number): void {
    if (this.isPaused) return;
    
    // Advance time
    this.currentTime += delta * this.timeScale;
    
    // Update time display
    this.updateTimeDisplay();
    
    // Check if we should spawn agents
    this.checkSpawnConditions();
    
    // Update all Yuka agents
    this.entityManager.update(delta);
    
    // Sync visuals with agents
    this.syncVisuals();
  }
  
  /**
   * Update time display
   */
  private updateTimeDisplay(): void {
    const t = this.currentTime;
    const state = this.genesis.getState();
    
    let timeStr: string;
    if (t < 1) {
      timeStr = `${(t * 1e6).toFixed(1)}μs`;
    } else if (t < 60) {
      timeStr = `${t.toFixed(1)}s`;
    } else if (t < 3600) {
      timeStr = `${(t / 60).toFixed(1)}min`;
    } else if (t < YEAR) {
      timeStr = `${(t / 86400).toFixed(1)}days`;
    } else if (t < 1e6 * YEAR) {
      timeStr = `${(t / YEAR).toFixed(0)}yr`;
    } else if (t < 1e9 * YEAR) {
      timeStr = `${(t / (1e6 * YEAR)).toFixed(1)}Myr`;
    } else {
      timeStr = `${(t / (1e9 * YEAR)).toFixed(2)}Gyr`;
    }
    
    const complexity = state.complexity || 0;
    const complexityName = ['Void', 'Particles', 'Atoms', 'Molecules', 'Life', 'Multicellular', 'Cognitive', 'Social', 'Technological'][complexity] || 'Unknown';
    
    this.timeDisplay.text = `t = ${timeStr} | ${complexityName} | Agents: ${this.entityManager.entities.length}`;
  }
  
  /**
   * Check if conditions are met to spawn agents
   */
  private async checkSpawnConditions(): Promise<void> {
    const state = this.genesis.getState();
    state.t = this.currentTime;
    
    // Spawn stellar agents at t=100 Myr
    if (this.currentTime > 100e6 * YEAR && this.stellarAgents.length === 0) {
      console.log('[Timeline] t=100Myr → Spawning stellar agents!');
      await this.spawnStellarAgents(state);
      this.addEvent('⭐ First stars formed');
    }
    
    // Spawn planetary agents at t=9.2 Gyr
    if (this.currentTime > 9.2e9 * YEAR && this.planetaryAgents.length === 0) {
      console.log('[Timeline] t=9.2Gyr → Spawning planetary agents!');
      await this.spawnPlanetaryAgents(state);
      this.addEvent('🪐 Planets accreting');
    }
  }
  
  /**
   * Spawn stellar agents (when time is right)
   */
  private async spawnStellarAgents(state: any): Promise<void> {
    // Spawn ~100 stellar agents in field of view
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      
      const result = await this.spawner.spawn({
        type: AgentType.STELLAR,
        position: new Vector3(x, y, z),
        reason: 'Star formation epoch',
        state,
        params: { mass: 0.1 + Math.random() * 2 },
      });
      
      if (result.success && result.agent) {
        const star = result.agent as unknown as StellarAgent;
        this.stellarAgents.push(star);
        
        // Create visual for star
        const mesh = MeshBuilder.CreateSphere(`star-${i}`, { diameter: 5 }, this.scene);
        mesh.position.copy(star.position);
        
        const mat = new StandardMaterial(`star-mat-${i}`, this.scene);
        mat.emissiveColor = new Color3(1, 1, 0.8);
        mesh.material = mat;
        
        this.starMeshes.set(star, mesh);
      }
    }
  }
  
  /**
   * Spawn planetary agents
   */
  private async spawnPlanetaryAgents(state: any): Promise<void> {
    // Spawn planets around some stars
    for (const star of this.stellarAgents.slice(0, 10)) {
      const x = star.position.x + (Math.random() - 0.5) * 20;
      const y = star.position.y + (Math.random() - 0.5) * 20;
      const z = star.position.z + (Math.random() - 0.5) * 20;
      
      const result = await this.spawner.spawn({
        type: AgentType.PLANETARY,
        position: new Vector3(x, y, z),
        reason: 'Planetary accretion',
        state,
        params: {
          mass: 5.972e24,
          radius: 6.371e6,
          orbitalRadius: 1.0,
        },
      });
      
      if (result.success && result.agent) {
        const planet = result.agent as unknown as PlanetaryAgent;
        this.planetaryAgents.push(planet);
        
        // Create visual for planet
        const mesh = MeshBuilder.CreateSphere(`planet`, { diameter: 2 }, this.scene);
        mesh.position.copy(planet.position);
        
        const mat = new StandardMaterial(`planet-mat`, this.scene);
        mat.emissiveColor = new Color3(0.3, 0.5, 1);
        mesh.material = mat;
        
        this.planetMeshes.set(planet, mesh);
      }
    }
  }
  
  /**
   * Sync visual meshes with agent positions
   */
  private syncVisuals(): void {
    // Update star visuals
    for (const [agent, mesh] of this.starMeshes) {
      mesh.position.copy(agent.position);
      
      // Brightness based on star state
      if (agent.hasExploded) {
        // Supernova flash!
        (mesh.material as StandardMaterial).emissiveColor = new Color3(10, 10, 10);
        
        // Remove after flash
        setTimeout(() => {
          mesh.dispose();
          this.starMeshes.delete(agent);
        }, 100);
      }
    }
    
    // Update planet visuals  
    for (const [agent, mesh] of this.planetMeshes) {
      mesh.position.copy(agent.position);
      
      // Color based on life
      if (agent.hasLife) {
        (mesh.material as StandardMaterial).emissiveColor = new Color3(0, 1, 0);
      }
    }
  }
  
  /**
   * Add event to log
   */
  private addEvent(text: string): void {
    const current = this.eventLog.text;
    const lines = current.split('\n');
    lines.unshift(text);
    if (lines.length > 10) lines.pop();
    this.eventLog.text = lines.join('\n');
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
 * USAGE:
 * 
 * const scene = new UniverseTimelineScene(canvas, 'test-seed');
 * 
 * // User sees:
 * t=0: Black screen
 * User clicks PLAY
 * t=1μs: Fog appears (particles)
 * t=100Myr: Stars spawn as Yuka agents!
 * t=9.2Gyr: Planets spawn as Yuka agents!
 * 
 * Agents make decisions:
 * - Stellar agents fuse hydrogen
 * - Massive stars go supernova
 * - Planetary agents try to develop life
 * - All validated by Legal Broker
 * 
 * User WATCHES emergence happen in real-time.
 */
