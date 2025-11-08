/**
 * Onboarding Scene - BabylonJS GUI implementation
 * 4-step tutorial for first-time users
 */

import {
  Scene,
  Engine,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color4,
} from '@babylonjs/core';
import {
  AdvancedDynamicTexture,
  Button,
  TextBlock,
  Rectangle,
  Control,
  StackPanel,
} from '@babylonjs/gui';
import { COLORS, FONTS } from '../constants';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Ebb & Bloom',
    description: 'A meditative evolutionary ecosystem where consciousness flows through living forms. You are awareness itself, witnessing emergence of complexity.',
    icon: '🌱'
  },
  {
    title: 'Camera: Spore-Style Exploration',
    description: 'Pinch to zoom • Drag to orbit • Double-tap to reset view',
    icon: '📷'
  },
  {
    title: 'Observe: Watch Life Unfold',
    description: 'Tap creatures to see their traits, pack dynamics, and evolutionary history. Your gaze influences their awareness.',
    icon: '👁️'
  },
  {
    title: 'Influence: Guide Evolution',
    description: 'Long-press to nudge evolutionary pressures. The ecosystem responds organically, never forced.',
    icon: '🧬'
  }
];

export class OnboardingScene {
  private scene: Scene;
  private engine: Engine;
  private guiTexture: AdvancedDynamicTexture | null = null;
  private currentStep: number = 0;
  private onComplete: () => void;

  constructor(scene: Scene, engine: Engine, onComplete: () => void) {
    this.scene = scene;
    this.engine = engine;
    this.onComplete = onComplete;
    this.setupScene();
    this.setupGUI();
  }

  private setupScene(): void {
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.engine.getRenderingCanvas()!, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    const rgb = this.hexToRgb(COLORS.background.deep);
    this.scene.clearColor = new Color4(rgb.r, rgb.g, rgb.b, 1);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }

  private setupGUI(): void {
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);
    this.showStep();
  }

  private showStep(): void {
    if (!this.guiTexture) return;
    this.guiTexture.dispose();
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

    const step = STEPS[this.currentStep];

    // Main panel
    const panel = new Rectangle('stepPanel');
    panel.width = '700px';
    panel.height = '500px';
    panel.cornerRadius = 20;
    panel.color = COLORS.primary.ebb;
    panel.thickness = 2;
    panel.background = 'rgba(26, 32, 44, 0.95)';
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture.addControl(panel);

    // Stack panel for content
    const stack = new StackPanel('stack');
    stack.width = '600px';
    panel.addControl(stack);

    // Progress indicator
    const progress = new TextBlock('progress', `Step ${this.currentStep + 1} of ${STEPS.length}`);
    progress.fontSize = 14;
    progress.fontFamily = FONTS.ui;
    progress.color = COLORS.text.muted;
    progress.height = '30px';
    progress.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stack.addControl(progress);

    // Icon
    const icon = new TextBlock('icon', step.icon);
    icon.fontSize = 72;
    icon.height = '100px';
    icon.paddingTop = '20px';
    icon.paddingBottom = '20px';
    stack.addControl(icon);

    // Title
    const title = new TextBlock('title', step.title);
    title.fontSize = 32;
    title.fontFamily = FONTS.title;
    title.color = COLORS.accent.seed;
    title.height = '50px';
    title.textWrapping = true;
    stack.addControl(title);

    // Description
    const desc = new TextBlock('desc', step.description);
    desc.fontSize = 18;
    desc.fontFamily = FONTS.ui;
    desc.color = COLORS.text.muted;
    desc.height = '120px';
    desc.textWrapping = true;
    desc.paddingTop = '20px';
    desc.paddingBottom = '20px';
    stack.addControl(desc);

    // Buttons
    const buttonPanel = new Rectangle('buttonPanel');
    buttonPanel.width = '600px';
    buttonPanel.height = '60px';
    buttonPanel.thickness = 0;
    buttonPanel.paddingTop = '20px';
    stack.addControl(buttonPanel);

    // Skip button
    const skipBtn = Button.CreateSimpleButton('skip', 'Skip');
    skipBtn.width = '140px';
    skipBtn.height = '50px';
    skipBtn.left = '-160px';
    skipBtn.color = COLORS.text.primary;
    skipBtn.background = COLORS.primary.ebb;
    skipBtn.cornerRadius = 10;
    skipBtn.fontSize = 16;
    skipBtn.fontFamily = FONTS.ui;
    skipBtn.onPointerClickObservable.add(() => this.onComplete());
    buttonPanel.addControl(skipBtn);

    // Next/Complete button
    const nextBtn = Button.CreateSimpleButton(
      'next',
      this.currentStep < STEPS.length - 1 ? 'Next →' : 'Begin Evolution'
    );
    nextBtn.width = '280px';
    nextBtn.height = '50px';
    nextBtn.left = '80px';
    nextBtn.color = COLORS.text.primary;
    nextBtn.background = COLORS.accent.seed;
    nextBtn.cornerRadius = 10;
    nextBtn.fontSize = 16;
    nextBtn.fontFamily = FONTS.ui;
    nextBtn.fontWeight = 'bold';
    nextBtn.onPointerClickObservable.add(() => {
      if (this.currentStep < STEPS.length - 1) {
        this.currentStep++;
        this.showStep();
      } else {
        this.onComplete();
      }
    });
    buttonPanel.addControl(nextBtn);

    // Footer quote
    const quote = new TextBlock('quote', '"Every action ripples through generations..."');
    quote.fontSize = 12;
    quote.fontFamily = FONTS.ui;
    quote.color = COLORS.text.muted;
    quote.alpha = 0.6;
    quote.height = '30px';
    quote.top = '270px';
    panel.addControl(quote);
  }

  public dispose(): void {
    this.guiTexture?.dispose();
  }
}
