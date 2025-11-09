/**
 * ADAPTIVE HUD
 * 
 * Agent-driven, zoom-aware information display.
 * 
 * KEY PRINCIPLES:
 * - Agents PUSH updates (not hardcoded displays)
 * - Scale determines what's shown (cosmic vs surface)
 * - Priority determines visibility (top 5 panels shown)
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle } from '@babylonjs/gui';

/**
 * Info scale (mirrors visual LOD)
 */
export enum InfoScale {
  COSMIC = 'cosmic',       // Universe-level (EntropyAgent only)
  GALACTIC = 'galactic',   // Galaxy composition
  STELLAR = 'stellar',     // Individual stars
  PLANETARY = 'planetary', // Planet details
  SURFACE = 'surface',     // Creatures, tools
}

/**
 * HUD panel data
 */
export interface HUDPanel {
  id: string;              // Unique identifier
  title: string;           // Panel title (e.g., "⭐ Alpha Centauri")
  content: string[];       // Array of info lines
  priority: number;        // Higher = more important (0-100)
  scale?: InfoScale;       // Which scale this applies to (undefined = all scales)
}

/**
 * Adaptive HUD System
 * 
 * Agents tell the HUD what to show.
 * HUD filters by zoom level and priority.
 */
export class AdaptiveHUD {
  private gui: AdvancedDynamicTexture;
  private panels: Map<string, HUDPanel> = new Map();
  private currentScale: InfoScale = InfoScale.COSMIC;
  private visualElements: Map<string, Rectangle> = new Map();
  
  // Layout (responsive)
  private readonly MAX_VISIBLE_PANELS = 5;
  private readonly isMobile: boolean;
  private readonly PANEL_WIDTH: number;
  private readonly PANEL_MARGIN: number;
  
  constructor(gui: AdvancedDynamicTexture) {
    this.gui = gui;
    
    // Responsive sizing
    this.isMobile = window.innerWidth < 768 || window.innerHeight < 600;
    this.PANEL_WIDTH = this.isMobile ? 250 : 300; // Narrower on mobile
    this.PANEL_MARGIN = this.isMobile ? 5 : 10;
    
    console.log(`[AdaptiveHUD] Initialized (${this.isMobile ? 'mobile' : 'desktop'} mode)`);
  }
  
  /**
   * Update or create a panel
   * 
   * Agents call this to push info to HUD
   */
  updatePanel(panel: HUDPanel): void {
    this.panels.set(panel.id, panel);
    this.refresh();
  }
  
  /**
   * Remove a panel
   */
  removePanel(id: string): void {
    this.panels.delete(id);
    
    // Dispose visual element if exists
    const visual = this.visualElements.get(id);
    if (visual) {
      this.gui.removeControl(visual);
      visual.dispose();
      this.visualElements.delete(id);
    }
    
    this.refresh();
  }
  
  /**
   * Set current zoom scale
   * 
   * Changes what panels are visible
   */
  setScale(scale: InfoScale): void {
    if (this.currentScale !== scale) {
      this.currentScale = scale;
      console.log(`[AdaptiveHUD] Scale changed: ${scale}`);
      this.refresh();
    }
  }
  
  /**
   * Get current scale
   */
  getScale(): InfoScale {
    return this.currentScale;
  }
  
  /**
   * Refresh HUD display
   * 
   * Called when panels change or scale changes
   */
  private refresh(): void {
    // Filter panels by scale
    const relevantPanels = Array.from(this.panels.values()).filter(p => 
      !p.scale || p.scale === this.currentScale
    );
    
    // Sort by priority (highest first)
    relevantPanels.sort((a, b) => b.priority - a.priority);
    
    // Take top N panels
    const visiblePanels = relevantPanels.slice(0, this.MAX_VISIBLE_PANELS);
    
    // Remove panels no longer visible
    for (const [id, visual] of this.visualElements) {
      if (!visiblePanels.find(p => p.id === id)) {
        this.gui.removeControl(visual);
        visual.dispose();
        this.visualElements.delete(id);
      }
    }
    
    // Create/update visible panels
    visiblePanels.forEach((panel, index) => {
      this.createOrUpdatePanelVisual(panel, index);
    });
  }
  
  /**
   * Create or update panel visual
   */
  private createOrUpdatePanelVisual(panel: HUDPanel, index: number): void {
    let container = this.visualElements.get(panel.id);
    
    // Create container if doesn't exist
    if (!container) {
      container = new Rectangle(panel.id);
      container.width = `${this.PANEL_WIDTH}px`;
      container.thickness = 2;
      container.cornerRadius = 5;
      container.color = '#00ff88';
      container.background = 'rgba(0, 17, 34, 0.8)';
      this.gui.addControl(container);
      this.visualElements.set(panel.id, container);
    }
    
    // Position in TOP-RIGHT 20% area (above molecular panel)
    // Viewport layout: 80% left main, 20% right for panels
    const panelHeight = this.isMobile ? 80 : 90;
    const panelSpacing = this.isMobile ? 90 : 100;
    const topMargin = this.isMobile ? 10 : 10;
    
    const yOffset = topMargin + index * panelSpacing;
    
    // Position within RIGHT 20% viewport area
    container.top = `${yOffset}px`;
    container.left = `-${this.PANEL_MARGIN}px`;
    container.height = `${panelHeight}px`;
    container.width = `${this.PANEL_WIDTH}px`;
    container.horizontalAlignment = Rectangle.HORIZONTAL_ALIGNMENT_RIGHT;
    container.verticalAlignment = Rectangle.VERTICAL_ALIGNMENT_TOP;
    
    // Clear existing children
    container.clearControls();
    
    // Add title (responsive font size)
    const title = new TextBlock(`${panel.id}-title`, panel.title);
    title.color = '#00ff88';
    title.fontSize = this.isMobile ? 14 : 16;
    title.fontWeight = 'bold';
    title.top = '5px';
    title.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    title.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    title.paddingLeft = this.isMobile ? '8px' : '10px';
    container.addControl(title);
    
    // Add content lines (responsive font size)
    const contentText = panel.content.join('\n');
    const content = new TextBlock(`${panel.id}-content`, contentText);
    content.color = '#88ccff';
    content.fontSize = this.isMobile ? 10 : 12;
    content.top = this.isMobile ? '22px' : '25px';
    content.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    content.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
    content.paddingLeft = this.isMobile ? '8px' : '10px';
    content.textWrapping = true;
    content.resizeToFit = true;
    container.addControl(content);
  }
  
  /**
   * Clear all panels
   */
  clear(): void {
    // Dispose all visuals
    for (const visual of this.visualElements.values()) {
      this.gui.removeControl(visual);
      visual.dispose();
    }
    
    this.panels.clear();
    this.visualElements.clear();
  }
}

/**
 * USAGE:
 * 
 * // Create HUD
 * const hud = new AdaptiveHUD(gui);
 * 
 * // Agents push updates
 * entropyAgent.updateHUD(hud);
 * stellarAgent.updateHUD(hud);
 * planetaryAgent.updateHUD(hud);
 * 
 * // EntropyAgent example:
 * hud.updatePanel({
 *   id: 'universe',
 *   title: phase === 'expansion' ? '💥 CREATION' : '🌌 UNIVERSE',
 *   content: [
 *     `Age: ${formatAge(age)}`,
 *     `Temp: ${formatTemp(temperature)}`,
 *     `Phase: ${phase}`,
 *     `Activity: ${activity.toFixed(2)}`,
 *   ],
 *   priority: 100, // Always visible
 * });
 * 
 * // StellarAgent example (only at stellar scale):
 * hud.updatePanel({
 *   id: `star-${this.id}`,
 *   title: this.name,
 *   content: [
 *     `Mass: ${mass.toFixed(2)} M☉`,
 *     `Fuel: ${fuel.toFixed(1)}%`,
 *     `Age: ${age.toFixed(1)} Myr`,
 *   ],
 *   priority: 70,
 *   scale: InfoScale.STELLAR,
 * });
 * 
 * // HUD automatically:
 * - Shows top 5 panels by priority
 * - Filters by current scale
 * - Updates when agents push new data
 */

