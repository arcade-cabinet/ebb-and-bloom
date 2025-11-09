/**
 * Narrative Display - Haiku journal for evolution events
 * Gen3+ feature for poetic storytelling
 * 
 * STUB: Ready for Gen3 implementation
 */

import { AdvancedDynamicTexture, TextBlock, Rectangle, Control, Button } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';
import { COLORS, FONTS } from '../constants';

interface Haiku {
  lines: [string, string, string];
  timestamp: number;
  event: string;
}

export class NarrativeDisplay {
  private guiTexture: AdvancedDynamicTexture;
  private haikus: Haiku[] = [];
  private isVisible: boolean = false;

  constructor(scene: Scene) {
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('Narrative', true, scene);
    this.setupToggleButton();
  }

  private setupToggleButton(): void {
    const toggleBtn = Button.CreateSimpleButton('journalToggle', '📖 Journal');
    toggleBtn.width = '120px';
    toggleBtn.height = '50px';
    toggleBtn.cornerRadius = 10;
    toggleBtn.color = COLORS.text.primary;
    toggleBtn.background = COLORS.primary.ebb;
    toggleBtn.fontSize = 16;
    toggleBtn.fontFamily = FONTS.ui;
    toggleBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    toggleBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleBtn.left = '20px';
    toggleBtn.top = '-20px'; // Negative top for bottom positioning
    toggleBtn.onPointerClickObservable.add(() => this.toggle());
    this.guiTexture.addControl(toggleBtn);
  }

  private toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.showJournal();
    } else {
      this.hideJournal();
    }
  }

  private showJournal(): void {
    const panel = new Rectangle('journalPanel');
    panel.name = 'journalPanel';
    panel.width = '500px';
    panel.height = '600px';
    panel.cornerRadius = 20;
    panel.color = COLORS.primary.ebb;
    panel.thickness = 2;
    panel.background = 'rgba(26, 32, 44, 0.95)';
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.left = '20px';
    this.guiTexture.addControl(panel);

    const title = new TextBlock('title', '📖 Evolution Journal');
    title.fontSize = 24;
    title.fontFamily = FONTS.title;
    title.color = COLORS.accent.seed;
    title.height = '40px';
    title.top = '-250px';
    panel.addControl(title);

    const stub = new TextBlock('stub', 'Haiku journal\n(Gen3 implementation)\n\n"Life flows like water\nThrough forms that rise and settle\nAwareness observes"');
    stub.fontSize = 16;
    stub.fontFamily = FONTS.body;
    stub.color = COLORS.text.muted;
    stub.textWrapping = true;
    stub.lineSpacing = '8px';
    panel.addControl(stub);

    const closeBtn = Button.CreateSimpleButton('close', '✕');
    closeBtn.width = '40px';
    closeBtn.height = '40px';
    closeBtn.cornerRadius = 20;
    closeBtn.color = COLORS.text.primary;
    closeBtn.background = COLORS.primary.ebb;
    closeBtn.fontSize = 20;
    closeBtn.top = '-250px';
    closeBtn.left = '210px';
    closeBtn.onPointerClickObservable.add(() => this.toggle());
    panel.addControl(closeBtn);
  }

  private hideJournal(): void {
    const panel = this.guiTexture.getControlByName('journalPanel');
    if (panel) {
      this.guiTexture.removeControl(panel);
    }
  }

  public addHaiku(event: string, lines: [string, string, string]): void {
    this.haikus.push({ lines, timestamp: Date.now(), event });
    console.log('New haiku:', lines.join(' / '));
  }

  public dispose(): void {
    this.guiTexture.dispose();
  }
}
