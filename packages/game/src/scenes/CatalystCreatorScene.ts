/**
 * Catalyst Creator Scene - BabylonJS GUI implementation
 * Trait allocation for Gen1 evolution (10 points across 10 traits)
 * 
 * STUB: Core GUI structure ready, needs full implementation for Gen1
 */

import { Scene, Engine } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock, Rectangle, Control, Button } from '@babylonjs/gui';
import { COLORS, FONTS } from '../constants';

export interface TraitAllocation {
  mobility: number;
  manipulation: number;
  excavation: number;
  social: number;
  sensing: number;
  illumination: number;
  storage: number;
  filtration: number;
  defense: number;
  toxicity: number;
}

export class CatalystCreatorScene {
  private scene: Scene;
  private guiTexture: AdvancedDynamicTexture | null = null;
  private traits: TraitAllocation = {
    mobility: 0, manipulation: 0, excavation: 0, social: 0, sensing: 0,
    illumination: 0, storage: 0, filtration: 0, defense: 0, toxicity: 0
  };
  private onComplete: (traits: TraitAllocation) => void;

  constructor(scene: Scene, _engine: Engine, onComplete: (traits: TraitAllocation) => void) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.setupGUI();
  }

  private setupGUI(): void {
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

    const panel = new Rectangle('catalystPanel');
    panel.width = '80%';
    panel.height = '90%';
    panel.cornerRadius = 20;
    panel.color = COLORS.primary.ebb;
    panel.thickness = 2;
    panel.background = 'rgba(26, 32, 44, 0.95)';
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture.addControl(panel);

    // Title
    const title = new TextBlock('title', 'Create Your Catalyst');
    title.fontSize = 36;
    title.fontFamily = FONTS.title;
    title.color = COLORS.accent.seed;
    title.height = '50px';
    title.top = '-300px';
    panel.addControl(title);

    const subtitle = new TextBlock('subtitle', 'Allocate 10 Evo Points across evolutionary traits');
    subtitle.fontSize = 18;
    subtitle.fontFamily = FONTS.ui;
    subtitle.color = COLORS.text.muted;
    subtitle.height = '30px';
    subtitle.top = '-250px';
    panel.addControl(subtitle);

    // Points remaining display
    const totalPoints = 10;
    const allocated = Object.values(this.traits).reduce((sum, val) => sum + val, 0);
    const remaining = totalPoints - allocated;

    const pointsDisplay = new TextBlock('points', `⚡ ${remaining} Points Remaining`);
    pointsDisplay.fontSize = 24;
    pointsDisplay.fontFamily = FONTS.ui;
    pointsDisplay.color = remaining === 0 ? COLORS.primary.bloom : COLORS.accent.seed;
    pointsDisplay.height = '40px';
    pointsDisplay.top = '-200px';
    panel.addControl(pointsDisplay);

    // TODO: Add trait grid with +/- buttons (Gen1 implementation)
    const stub = new TextBlock('stub', '📋 Trait allocation grid - to be implemented in Gen1');
    stub.fontSize = 16;
    stub.fontFamily = FONTS.ui;
    stub.color = COLORS.text.muted;
    stub.height = '30px';
    stub.top = '0px';
    panel.addControl(stub);

    // Complete button
    const completeBtn = Button.CreateSimpleButton('complete', 'Begin Evolution');
    completeBtn.width = '300px';
    completeBtn.height = '50px';
    completeBtn.top = '250px';
    completeBtn.color = COLORS.text.primary;
    completeBtn.background = remaining === 0 ? COLORS.primary.bloom : COLORS.primary.ebb;
    completeBtn.cornerRadius = 10;
    completeBtn.fontSize = 18;
    completeBtn.fontFamily = FONTS.ui;
    completeBtn.fontWeight = 'bold';
    completeBtn.onPointerClickObservable.add(() => {
      if (remaining === 0) {
        this.onComplete(this.traits);
      }
    });
    panel.addControl(completeBtn);
  }

  public dispose(): void {
    this.guiTexture?.dispose();
  }
}
