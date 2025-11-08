/**
 * Evolution HUD - In-game overlay for Gen1+
 * Shows generation, environmental status, event feed, pack dynamics
 * 
 * STUB: Ready for Gen1 implementation
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle, Control } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';
import { COLORS, FONTS } from '../constants';

export class EvolutionHUD {
  private guiTexture: AdvancedDynamicTexture;
  private generation: number = 0;

  constructor(scene: Scene) {
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);
    this.setupHUD();
  }

  private setupHUD(): void {
    // Top-left: Generation counter
    const genPanel = new Rectangle('genPanel');
    genPanel.width = '200px';
    genPanel.height = '60px';
    genPanel.cornerRadius = 10;
    genPanel.color = COLORS.primary.ebb;
    genPanel.thickness = 2;
    genPanel.background = 'rgba(26, 32, 44, 0.8)';
    genPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    genPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    genPanel.top = '20px';
    genPanel.left = '20px';
    this.guiTexture.addControl(genPanel);

    const genText = new TextBlock('gen', `🧬 Generation ${this.generation}`);
    genText.fontSize = 18;
    genText.fontFamily = FONTS.ui;
    genText.color = COLORS.accent.seed;
    genPanel.addControl(genText);

    // Top-right: Environment status (stub)
    const envPanel = new Rectangle('envPanel');
    envPanel.width = '300px';
    envPanel.height = '100px';
    envPanel.cornerRadius = 10;
    envPanel.color = COLORS.primary.ebb;
    envPanel.thickness = 2;
    envPanel.background = 'rgba(26, 32, 44, 0.8)';
    envPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    envPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    envPanel.top = '20px';
    envPanel.right = '20px';
    this.guiTexture.addControl(envPanel);

    const envText = new TextBlock('env', '🌍 Environment\n(Gen1 implementation)');
    envText.fontSize = 14;
    envText.fontFamily = FONTS.ui;
    envText.color = COLORS.text.muted;
    envText.textWrapping = true;
    envPanel.addControl(envText);

    // Right side: Event feed (stub)
    const feedPanel = new Rectangle('feedPanel');
    feedPanel.width = '300px';
    feedPanel.height = '400px';
    feedPanel.cornerRadius = 10;
    feedPanel.color = COLORS.primary.ebb;
    feedPanel.thickness = 2;
    feedPanel.background = 'rgba(26, 32, 44, 0.7)';
    feedPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    feedPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    feedPanel.right = '20px';
    this.guiTexture.addControl(feedPanel);

    const feedText = new TextBlock('feed', '📜 Evolution Events\n(Gen1 implementation)');
    feedText.fontSize = 14;
    feedText.fontFamily = FONTS.ui;
    feedText.color = COLORS.text.muted;
    feedPanel.addControl(feedText);
  }

  public updateGeneration(gen: number): void {
    this.generation = gen;
  }

  public addEvent(event: string): void {
    console.log('Evolution event:', event);
  }

  public dispose(): void {
    this.guiTexture.dispose();
  }
}
