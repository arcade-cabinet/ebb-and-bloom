/**
 * MOLECULAR BREAKDOWN PANEL
 * 
 * ALWAYS-PRESENT bottom-right view showing 3D molecules
 * active in whatever the current scale/context is.
 * 
 * THE VISION:
 * - At universe scale: Show H2, He (primordial)
 * - At galaxy scale: Show enriched elements (C, O, N from supernovae)
 * - At planet scale: Show H2O, CO2, CH4 (atmosphere)
 * - At creature scale: Show proteins, DNA, ATP (biology)
 * - At tool scale: Show Fe, C bonds (materials)
 * 
 * POINT: ALWAYS give science VISUAL MEANING at EVERY scale!
 */

import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color3,
  Mesh,
  Viewport,
  GlowLayer,
} from '@babylonjs/core';
import { MolecularVisuals } from '../renderers/MolecularVisuals';

/**
 * Context for molecular breakdown
 */
export interface MolecularContext {
  scale: 'cosmic' | 'galactic' | 'stellar' | 'planetary' | 'surface';
  molecules: string[];     // Which molecules to show (H2, H2O, CO2, etc.)
  temperature: number;     // K (affects motion speed)
  density: number;         // Affects clustering
  enrichment?: string[];   // Heavy elements present (if any)
}

/**
 * Molecular Breakdown Panel
 * 
 * Small viewport in bottom-right showing molecular-scale view
 * ALWAYS present, contextual to main view
 */
export class MolecularBreakdownPanel {
  private scene: Scene;
  private camera: ArcRotateCamera;
  private moleculeMeshes: Mesh[] = [];
  private currentContext?: MolecularContext;
  
  // Panel dimensions (fraction of screen)
  private readonly width = 0.20;  // 20% of screen width (right panel)
  private readonly height = 0.50; // 50% of screen height (middle section)
  
  constructor(mainScene: Scene, engine: any) {
    // Create separate scene for molecular view
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color3(0, 0, 0).toColor4(); // BLACK background for contrast
    
    // Camera for molecular view (close-up on molecules)
    this.camera = new ArcRotateCamera(
      'molecular-camera',
      Math.PI / 4,  // Angle for better 3D view
      Math.PI / 3,  // Elevation
      20,           // Distance from center
      Vector3.Zero(),
      this.scene
    );
    
    // MAXIMUM BRIGHT light
    const light = new HemisphericLight('mol-light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 3.0; // MAXIMUM
    light.groundColor = new Color3(1, 1, 1); // Full brightness
    
    // Set viewport (RIGHT 20%, MIDDLE 50%)
    // Position: x=0.8 (right panel starts), y=0.25 (below HUD), height=0.50 (middle section)
    this.camera.viewport = new Viewport(
      0.8,             // x = 80% from left (right panel starts)
      0.25,            // y = 25% from bottom (below HUD space at top)
      this.width,      // width = 20%
      this.height      // height = 50%
    );
    
    // Active camera for this scene
    this.scene.activeCamera = this.camera;
    
    // MAXIMUM glow
    const glow = new GlowLayer('mol-glow', this.scene);
    glow.intensity = 3.0; // MAXIMUM
    
    console.log('[MolecularBreakdownPanel] Initialized - RIGHT 20%, MIDDLE 50% viewport');
  }
  
  /**
   * Update molecular context based on main view
   */
  updateContext(context: MolecularContext): void {
    if (JSON.stringify(context) === JSON.stringify(this.currentContext)) {
      return; // No change
    }
    
    this.currentContext = context;
    
    // Clear old molecules
    for (const mesh of this.moleculeMeshes) {
      mesh.dispose();
    }
    this.moleculeMeshes = [];
    
    // Create new molecules for this context
    const moleculeCount = Math.min(15, context.molecules.length * 3); // 15 max for performance
    
    for (let i = 0; i < moleculeCount; i++) {
      const formula = context.molecules[Math.floor(Math.random() * context.molecules.length)];
      const blueprint = MolecularVisuals.createBlueprint(formula);
      
      // Random position in view sphere (closer to camera)
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10; // Closer spread (5-15 units)
      
      const pos = new Vector3(
        radius * Math.sin(angle1) * Math.cos(angle2),
        radius * Math.sin(angle1) * Math.sin(angle2),
        radius * Math.cos(angle1)
      );
      
      const molecule = MolecularVisuals.renderMolecule(blueprint, pos, this.scene, `panel-${i}`);
      this.moleculeMeshes.push(molecule);
    }
    
    console.log(`[MolecularBreakdownPanel] Updated: ${context.scale} scale, ${moleculeCount} molecules`);
    console.log(`  Showing: ${context.molecules.join(', ')}`);
  }
  
  /**
   * Update (called every frame)
   */
  update(delta: number): void {
    if (!this.currentContext) return;
    
    // Animate molecules (tumbling based on temperature)
    const speedMultiplier = Math.sqrt(this.currentContext.temperature / 1000); // Hotter = faster
    
    for (const molecule of this.moleculeMeshes) {
      MolecularVisuals.animateMolecule(molecule, delta * speedMultiplier);
    }
    
    // Slowly rotate camera for better 3D view
    this.camera.alpha += delta * 0.1;
  }
  
  /**
   * Render the molecular panel
   */
  render(): void {
    this.scene.render();
  }
  
  /**
   * Get context for current universe state
   */
  static getContextForScale(
    scale: 'cosmic' | 'galactic' | 'stellar' | 'planetary' | 'surface',
    age: number,
    temperature: number,
    enrichment?: string[]
  ): MolecularContext {
    const YEAR = 365.25 * 86400;
    
    switch (scale) {
      case 'cosmic':
      case 'galactic':
        // Early universe: H2, He only
        if (age < 100e6 * YEAR) {
          return {
            scale,
            molecules: ['H2', 'He'],
            temperature,
            density: 1e-21,
          };
        }
        
        // Post-stellar: Enriched with heavy elements
        return {
          scale,
          molecules: ['H2', 'He', 'CO2', 'H2O', 'CH4'], // Stellar enrichment
          temperature: 100,
          density: 1e-22,
          enrichment,
        };
        
      case 'stellar':
        // Around stars: Molecules forming
        return {
          scale,
          molecules: ['H2', 'H2O', 'CO2', 'CH4', 'NH3'],
          temperature: 20,
          density: 1e-20,
        };
        
      case 'planetary':
        // Planet atmosphere/surface
        return {
          scale,
          molecules: ['H2O', 'CO2', 'CH4', 'NH3', 'O2'],
          temperature: 300,
          density: 1e-3,
        };
        
      case 'surface':
        // Life molecules!
        return {
          scale,
          molecules: ['H2O', 'CO2', 'O2', 'CH4', 'NH3'],
          temperature: 300,
          density: 1,
        };
    }
  }
}

