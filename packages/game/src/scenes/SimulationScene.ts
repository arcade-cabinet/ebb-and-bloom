/**
 * SIMULATION VIEW - Pure Report Mode
 * 
 * No 3D rendering of planets/creatures - just text reports and population graphs.
 * Cycles through world advancement/decline.
 * Uses Babylon GUI for display.
 */

import { Engine, Scene, Color4, FreeCamera, Vector3 } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, TextBlock, Button, StackPanel, Control, Line } from '@babylonjs/gui';
import { generateGameData } from '../gen-systems/loadGenData.js';
import { StochasticPopulationDynamics } from '../ecology/StochasticPopulation.js';
import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { LAWS } from '../laws/index.js';

interface WorldState {
  cycle: number;
  year: number;
  populations: Map<string, number>;
  extinctions: string[];
  socialStage: string;
  totalPopulation: number;
  carryingCapacity: number;
  productivity: number;
  temperature: number;
  events: string[];
}

export class SimulationScene {
  private engine: Engine;
  private scene: Scene;
  private gui: AdvancedDynamicTexture;
  private seed: string;
  private gameData: any;
  private state: WorldState;
  private populationDynamics: StochasticPopulationDynamics;
  private rng: EnhancedRNG;
  
  // UI Elements
  private headerText: TextBlock;
  private reportPanel: StackPanel;
  private statusText: TextBlock;
  private graphCanvas: Rectangle;
  private populationHistory: Array<{ cycle: number; populations: Map<string, number> }>;
  
  constructor(canvas: HTMLCanvasElement, seed: string) {
    this.seed = seed;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.05, 0.05, 0.1, 1);
    
    // Camera (not used for rendering, just required)
    const camera = new FreeCamera('camera', new Vector3(0, 0, -10), this.scene);
    
    // GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
    
    this.populationHistory = [];
    this.rng = new EnhancedRNG(seed + '-simulation');
    this.populationDynamics = new StochasticPopulationDynamics(seed + '-population');
    
    this.state = {
      cycle: 0,
      year: 0,
      populations: new Map(),
      extinctions: [],
      socialStage: 'Pre-sapient',
      totalPopulation: 0,
      carryingCapacity: 0,
      productivity: 0,
      temperature: 0,
      events: [],
    };
    
    this.createUI();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  
  /**
   * Create UI layout
   */
  private createUI() {
    // Main container
    const mainPanel = new StackPanel();
    mainPanel.width = '100%';
    mainPanel.height = '100%';
    mainPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.gui.addControl(mainPanel);
    
    // Header
    this.headerText = new TextBlock();
    this.headerText.text = 'WORLD SIMULATOR - INITIALIZING...';
    this.headerText.color = '#00ff88';
    this.headerText.fontSize = 28;
    this.headerText.height = '60px';
    this.headerText.fontFamily = 'monospace';
    mainPanel.addControl(this.headerText);
    
    // Status bar
    this.statusText = new TextBlock();
    this.statusText.text = 'Loading...';
    this.statusText.color = '#88ccff';
    this.statusText.fontSize = 16;
    this.statusText.height = '40px';
    this.statusText.fontFamily = 'monospace';
    mainPanel.addControl(this.statusText);
    
    // Report panel (scrollable)
    const reportContainer = new Rectangle();
    reportContainer.height = '500px';
    reportContainer.background = '#0a0a15';
    reportContainer.thickness = 2;
    reportContainer.color = '#333366';
    mainPanel.addControl(reportContainer);
    
    this.reportPanel = new StackPanel();
    this.reportPanel.width = '95%';
    this.reportPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    reportContainer.addControl(this.reportPanel);
    
    // Population graph
    this.graphCanvas = new Rectangle();
    this.graphCanvas.height = '200px';
    this.graphCanvas.background = '#0a0a15';
    this.graphCanvas.thickness = 2;
    this.graphCanvas.color = '#333366';
    mainPanel.addControl(this.graphCanvas);
    
    // Control buttons
    const buttonPanel = new StackPanel();
    buttonPanel.isVertical = false;
    buttonPanel.height = '80px';
    mainPanel.addControl(buttonPanel);
    
    const advanceBtn = Button.CreateSimpleButton('advance', 'ADVANCE 10 CYCLES');
    advanceBtn.width = '200px';
    advanceBtn.height = '60px';
    advanceBtn.color = 'white';
    advanceBtn.background = '#00cc66';
    advanceBtn.fontFamily = 'monospace';
    advanceBtn.fontSize = 18;
    advanceBtn.onPointerClickObservable.add(() => {
      this.advanceCycles(10);
    });
    buttonPanel.addControl(advanceBtn);
    
    const advance100Btn = Button.CreateSimpleButton('advance100', 'ADVANCE 100 CYCLES');
    advance100Btn.width = '200px';
    advance100Btn.height = '60px';
    advance100Btn.color = 'white';
    advance100Btn.background = '#0088cc';
    advance100Btn.fontFamily = 'monospace';
    advance100Btn.fontSize = 18;
    advance100Btn.onPointerClickObservable.add(() => {
      this.advanceCycles(100);
    });
    buttonPanel.addControl(advance100Btn);
    
    const resetBtn = Button.CreateSimpleButton('reset', 'NEW WORLD');
    resetBtn.width = '150px';
    resetBtn.height = '60px';
    resetBtn.color = 'white';
    resetBtn.background = '#cc6600';
    resetBtn.fontFamily = 'monospace';
    resetBtn.fontSize = 18;
    resetBtn.onPointerClickObservable.add(() => {
      const newSeed = prompt('Enter seed (or leave empty for random):');
      const seed = newSeed || `world-${Date.now()}`;
      window.location.hash = seed;
      window.location.reload();
    });
    buttonPanel.addControl(resetBtn);
  }
  
  /**
   * Initialize world
   */
  async initialize() {
    this.headerText.text = `WORLD SIMULATOR - SEED: "${this.seed}"`;
    this.statusText.text = 'Generating universe from laws...';
    
    try {
      this.gameData = await generateGameData(this.seed);
      
      // Initialize populations
      this.gameData.creatures.forEach((c: any) => {
        const K = LAWS.ecology.carryingCapacity.calculate(
          this.gameData.ecology.productivity,
          c.trophicLevel,
          c.metabolism
        );
        const initialPop = K * 0.5;
        this.state.populations.set(c.name, initialPop);
      });
      
      this.state.productivity = this.gameData.ecology.productivity;
      this.state.temperature = this.gameData.ecology.temperature - 273.15;
      
      const herbivores = this.gameData.creatures.filter((c: any) => c.trophicLevel === 1);
      if (herbivores.length > 0) {
        this.state.carryingCapacity = herbivores.reduce((sum: number, c: any) => {
          return sum + LAWS.ecology.carryingCapacity.calculate(
            this.gameData.ecology.productivity,
            c.trophicLevel,
            c.metabolism
          );
        }, 0);
      }
      
      this.updateTotalPopulation();
      this.populationHistory.push({ cycle: 0, populations: new Map(this.state.populations) });
      
      this.displayInitialReport();
      this.statusText.text = 'Ready - Click ADVANCE to simulate cycles';
      
    } catch (error) {
      this.statusText.text = `ERROR: ${error}`;
      this.statusText.color = '#ff4444';
    }
  }
  
  /**
   * Display initial world report
   */
  private displayInitialReport() {
    this.reportPanel.clearControls();
    
    this.addReportLine('═══ UNIVERSE ═══', '#00ff88', 20);
    this.addReportLine(`Star: ${this.gameData.universe.star.spectralType} (${this.gameData.universe.star.mass.toFixed(2)} M☉)`, '#88ccff');
    this.addReportLine(`Planets: ${this.gameData.universe.planets.length}`, '#88ccff');
    
    this.addReportLine('═══ PLANET ═══', '#00ff88', 20);
    this.addReportLine(`Name: ${this.gameData.planet.name}`, '#88ccff');
    this.addReportLine(`Temp: ${(this.gameData.planet.surfaceTemperature - 273).toFixed(1)}°C`, '#88ccff');
    this.addReportLine(`Gravity: ${this.gameData.planet.surfaceGravity.toFixed(2)} m/s²`, '#88ccff');
    
    this.addReportLine('═══ ECOLOGY ═══', '#00ff88', 20);
    this.addReportLine(`Productivity: ${this.gameData.ecology.productivity.toFixed(0)} kcal/m²/yr`, '#88ccff');
    this.gameData.ecology.biomes.forEach((b: any) => {
      this.addReportLine(`  ${b.type}: ${(b.coverage * 100).toFixed(0)}%`, '#66aaff');
    });
    
    this.addReportLine('═══ SPECIES ═══', '#00ff88', 20);
    this.gameData.creatures.forEach((c: any) => {
      const pop = this.state.populations.get(c.name) || 0;
      this.addReportLine(`${c.scientificName}`, '#ffcc00', 16);
      this.addReportLine(`  Pop: ${pop.toFixed(0)} | Mass: ${c.mass.toFixed(1)}kg | ${c.diet}`, '#88ccff', 14);
    });
    
    this.addReportLine('═══ STATUS ═══', '#00ff88', 20);
    this.addReportLine(`Cycle: 0 | Year: 0`, '#88ccff');
    this.addReportLine(`Total Population: ${this.state.totalPopulation.toFixed(0)}`, '#88ccff');
    this.addReportLine(`Social Stage: ${this.state.socialStage}`, '#88ccff');
  }
  
  /**
   * Add a line to the report
   */
  private addReportLine(text: string, color: string = '#cccccc', fontSize: number = 14) {
    const line = new TextBlock();
    line.text = text;
    line.color = color;
    line.fontSize = fontSize;
    line.height = `${fontSize + 6}px`;
    line.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    line.paddingLeft = '10px';
    line.fontFamily = 'monospace';
    this.reportPanel.addControl(line);
  }
  
  /**
   * Advance simulation by N cycles
   */
  private advanceCycles(cycles: number) {
    this.statusText.text = `Simulating ${cycles} cycles...`;
    this.statusText.color = '#ffaa00';
    
    setTimeout(() => {
      for (let i = 0; i < cycles; i++) {
        this.state.cycle++;
        this.state.year += 100;
        this.state.events = [];
        
        this.simulatePopulations();
        this.checkExtinctions();
        
        if (this.state.cycle % 10 === 0) {
          this.simulateEnvironment();
        }
        
        this.updateSocialStage();
        
        // Record history
        this.populationHistory.push({ 
          cycle: this.state.cycle, 
          populations: new Map(this.state.populations) 
        });
      }
      
      this.displayCycleReport();
      this.drawPopulationGraph();
      this.statusText.text = `Cycle ${this.state.cycle} (Year ${this.state.year}) - ${this.state.populations.size} species alive`;
      this.statusText.color = '#88ccff';
    }, 50);
  }
  
  /**
   * Simulate one cycle of populations (simplified for performance)
   */
  private simulatePopulations() {
    this.state.populations.forEach((pop, species) => {
      if (pop < 1) return;
      
      const creature = this.gameData.creatures.find((c: any) => c.name === species);
      if (!creature) return;
      
      const K = LAWS.ecology.carryingCapacity.calculate(
        this.state.productivity,
        creature.trophicLevel,
        creature.metabolism
      );
      
      const r = 0.1;
      const noise = 0; // Simplified - no noise for performance
      const growth = LAWS.ecology.carryingCapacity.logisticGrowth(pop, K, r, 1);
      const newPop = Math.max(0, pop + growth + noise);
      
      this.state.populations.set(species, newPop);
    });
    
    this.updateTotalPopulation();
  }
  
  /**
   * Check for extinctions
   */
  private checkExtinctions() {
    this.state.populations.forEach((pop, species) => {
      if (pop < 1 && !this.state.extinctions.includes(species)) {
        this.state.extinctions.push(species);
        this.state.events.push(`⚠️ EXTINCTION: ${species}`);
        this.state.populations.delete(species);
      }
    });
  }
  
  /**
   * Simulate environmental changes
   */
  private simulateEnvironment() {
    const tempChange = (Math.random() - 0.5) * 1.0;
    this.state.temperature += tempChange;
    
    if (Math.abs(tempChange) > 0.5) {
      const dir = tempChange > 0 ? 'warmer' : 'cooler';
      this.state.events.push(`🌡️ Climate: ${Math.abs(tempChange).toFixed(1)}°C ${dir}`);
    }
    
    if (Math.random() < 0.01) {
      const severity = Math.random() * 0.3;
      this.state.events.push(`💥 CATASTROPHE: ${(severity * 100).toFixed(0)}% loss`);
      
      this.state.populations.forEach((pop, species) => {
        this.state.populations.set(species, Math.floor(pop * (1 - severity)));
      });
    }
  }
  
  /**
   * Update social stage
   */
  private updateSocialStage() {
    let maxPop = 0;
    this.state.populations.forEach(pop => {
      if (pop > maxPop) maxPop = pop;
    });
    
    const oldStage = this.state.socialStage;
    
    if (maxPop < 100) this.state.socialStage = 'Pre-sapient';
    else if (maxPop < 1000) this.state.socialStage = 'Band';
    else if (maxPop < 10000) this.state.socialStage = 'Tribe';
    else if (maxPop < 100000) this.state.socialStage = 'Chiefdom';
    else this.state.socialStage = 'State';
    
    if (oldStage !== this.state.socialStage && this.state.cycle > 0) {
      this.state.events.push(`📈 Advanced to ${this.state.socialStage}`);
    }
  }
  
  /**
   * Update total population
   */
  private updateTotalPopulation() {
    this.state.totalPopulation = Array.from(this.state.populations.values()).reduce((sum, p) => sum + p, 0);
  }
  
  /**
   * Display cycle report
   */
  private displayCycleReport() {
    this.reportPanel.clearControls();
    
    this.addReportLine(`═══ CYCLE ${this.state.cycle} (YEAR ${this.state.year}) ═══`, '#00ff88', 20);
    
    if (this.state.events.length > 0) {
      this.addReportLine('EVENTS:', '#ffaa00', 16);
      this.state.events.forEach(event => {
        this.addReportLine(`  ${event}`, '#ffccaa');
      });
    }
    
    this.addReportLine('ENVIRONMENT:', '#88ccff', 16);
    this.addReportLine(`  Temperature: ${this.state.temperature.toFixed(1)}°C`, '#cccccc');
    this.addReportLine(`  Productivity: ${this.state.productivity.toFixed(0)} kcal/m²/yr`, '#cccccc');
    
    this.addReportLine('POPULATIONS:', '#88ccff', 16);
    const sortedPops = Array.from(this.state.populations.entries()).sort((a, b) => b[1] - a[1]);
    sortedPops.forEach(([species, pop]) => {
      const color = pop > 1000 ? '#00ff88' : pop > 100 ? '#88ccff' : '#ffaa00';
      this.addReportLine(`  ${species}: ${pop.toFixed(0)}`, color);
    });
    
    this.addReportLine('SUMMARY:', '#88ccff', 16);
    this.addReportLine(`  Total Population: ${this.state.totalPopulation.toFixed(0)}`, '#cccccc');
    this.addReportLine(`  Species Alive: ${this.state.populations.size}`, '#cccccc');
    this.addReportLine(`  Extinctions: ${this.state.extinctions.length}`, '#cccccc');
    this.addReportLine(`  Social Stage: ${this.state.socialStage}`, '#cccccc');
  }
  
  /**
   * Draw population graph
   */
  private drawPopulationGraph() {
    // Clear existing lines
    const children = this.graphCanvas.children.slice();
    children.forEach(child => this.graphCanvas.removeControl(child));
    
    if (this.populationHistory.length < 2) return;
    
    // Get all species that ever existed
    const allSpecies = new Set<string>();
    this.populationHistory.forEach(h => {
      h.populations.forEach((_, species) => allSpecies.add(species));
    });
    
    // Draw line for each species
    const colors = ['#00ff88', '#0088ff', '#ff8800', '#ff00ff', '#ffff00'];
    let colorIndex = 0;
    
    allSpecies.forEach(species => {
      const color = colors[colorIndex % colors.length];
      colorIndex++;
      
      for (let i = 0; i < this.populationHistory.length - 1; i++) {
        const h1 = this.populationHistory[i];
        const h2 = this.populationHistory[i + 1];
        
        const pop1 = h1.populations.get(species) || 0;
        const pop2 = h2.populations.get(species) || 0;
        
        if (pop1 < 1 && pop2 < 1) continue;
        
        const maxPop = Math.max(...Array.from(this.populationHistory.flatMap(h => 
          Array.from(h.populations.values())
        )));
        
        const x1 = (i / this.populationHistory.length) * 180 - 90;
        const x2 = ((i + 1) / this.populationHistory.length) * 180 - 90;
        const y1 = 90 - (pop1 / maxPop) * 180;
        const y2 = 90 - (pop2 / maxPop) * 180;
        
        const line = new Line();
        line.x1 = x1;
        line.y1 = y1;
        line.x2 = x2;
        line.y2 = y2;
        line.color = color;
        line.lineWidth = 2;
        
        this.graphCanvas.addControl(line);
      }
    });
  }
  
  /**
   * Resize handler
   */
  resize() {
    this.engine.resize();
  }
}
