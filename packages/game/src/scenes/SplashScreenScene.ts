/**
 * Ebb & Bloom - Splash Screen Scene
 * Displays splash screen for 2-3 seconds before transitioning to main menu
 */

import { Scene, Engine } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, Image, Control } from '@babylonjs/gui';

export class SplashScreenScene {
  private scene: Scene;
  private guiTexture: AdvancedDynamicTexture | null = null;
  private splashImage: Image | null = null;
  private onComplete: () => void;
  private splashDuration: number = 2500; // 2.5 seconds (random between 2-3s)

  constructor(scene: Scene, _engine: Engine, onComplete: () => void) {
    this.scene = scene;
    this.onComplete = onComplete;
    
    // Random duration between 2-3 seconds
    this.splashDuration = 2000 + Math.random() * 1000;
    
    this.setupScene();
    this.setupGUI();
    this.startTransition();
  }

  private setupScene(): void {
    // Minimal scene setup - just a black background
    this.scene.clearColor.set(0, 0, 0, 1); // Black background
  }

  private setupGUI(): void {
    // Create fullscreen GUI
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('SplashUI', true, this.scene);

    // Create fullscreen container for splash image
    const container = new Rectangle('splashContainer');
    container.width = 1;
    container.height = 1;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.background = '#1A202C'; // Deep background color
    this.guiTexture.addControl(container);

    // Load splash image
    const splashVariants = [
      'splash/splash-harmony-1.webp',
    ];
    
    const randomVariant = splashVariants[Math.floor(Math.random() * splashVariants.length)];
    const splashPath = `/${randomVariant}`;

    // Create image control
    this.splashImage = new Image('splashImage', splashPath);
    this.splashImage.stretch = Image.STRETCH_UNIFORM;
    this.splashImage.width = 1;
    this.splashImage.height = 1;
    this.splashImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.splashImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    
    // Fade in animation
    this.splashImage.alpha = 0;
    this.scene.onBeforeRenderObservable.add(() => {
      if (this.splashImage && this.splashImage.alpha < 1) {
        this.splashImage.alpha = Math.min(1, this.splashImage.alpha + 0.02);
      }
    });

    container.addControl(this.splashImage);
  }

  private startTransition(): void {
    // After splash duration, fade out and transition to main menu
    setTimeout(() => {
      this.fadeOut(() => {
        this.cleanup();
        this.onComplete();
      });
    }, this.splashDuration);
  }

  private fadeOut(onComplete: () => void): void {
    if (!this.splashImage) {
      onComplete();
      return;
    }

    // Fade out animation
    const fadeInterval = setInterval(() => {
      if (this.splashImage && this.splashImage.alpha > 0) {
        this.splashImage.alpha = Math.max(0, this.splashImage.alpha - 0.05);
      } else {
        clearInterval(fadeInterval);
        onComplete();
      }
    }, 16); // ~60fps
  }

  private cleanup(): void {
    if (this.guiTexture) {
      this.guiTexture.dispose();
      this.guiTexture = null;
    }
    this.splashImage = null;
  }

  public dispose(): void {
    this.cleanup();
  }
}

