/**
 * Main Menu Scene - BabylonJS GUI implementation
 * Uses GameEngine for direct function calls (no HTTP)
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
  InputText,
} from '@babylonjs/gui';
import { GameEngine } from '../engine/GameEngine';
import { getItem, setItem, removeItem } from '../utils/storage';
import { navigateTo } from '../utils/router';
import { COLORS } from '../constants';

export class MainMenuScene {
  private scene: Scene;
  private engine: Engine;
  private guiTexture: AdvancedDynamicTexture | null = null;
  private seedInput: InputText | null = null;
  private currentSeed: string = '';
  private seedModal: Rectangle | null = null;
  private settingsModal: Rectangle | null = null;
  private creditsModal: Rectangle | null = null;

  constructor(scene: Scene, engine: Engine) {
    this.scene = scene;
    this.engine = engine;
    this.setupScene();
    this.setupGUI();
  }

  private setupScene(): void {
    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.engine.getRenderingCanvas()!, true);

    // Light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    // Background color - use design constants
    const bgColor = COLORS.background.deep;
    const rgb = this.hexToRgb(bgColor);
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
    // Create fullscreen GUI
    this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

    // Main container panel
    const panel = new Rectangle('mainPanel');
    panel.width = 0.6;
    panel.height = 0.8;
    panel.cornerRadius = 20;
    panel.color = '#4A5568'; // Ebb indigo
    panel.thickness = 2;
    panel.background = 'rgba(26, 32, 44, 0.9)'; // Deep background with transparency
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture.addControl(panel);

    // Title - using Playfair Display
    const title = new TextBlock('title', 'Ebb & Bloom');
    title.fontSize = 48;
    title.fontFamily = 'Playfair Display, serif';
    title.color = '#F7FAFC'; // Accent white
    title.height = '80px';
    title.top = '-300px';
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.addControl(title);

    // Subtitle - using Work Sans
    const subtitle = new TextBlock('subtitle', 'Shape Worlds. Traits Echo. Legacy Endures.');
    subtitle.fontSize = 18;
    subtitle.fontFamily = 'Work Sans, sans-serif';
    subtitle.color = '#38A169'; // Bloom emerald
    subtitle.height = '40px';
    subtitle.top = '-200px';
    subtitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.addControl(subtitle);

    // Start New button (primary action)
    const startNewButton = Button.CreateSimpleButton('startNewButton', 'Start New');
    startNewButton.width = '240px';
    startNewButton.height = '60px';
    startNewButton.color = '#F7FAFC';
    startNewButton.fontSize = 18;
    startNewButton.fontFamily = 'Work Sans, sans-serif';
    startNewButton.background = '#38A169'; // Bloom emerald
    startNewButton.cornerRadius = 10;
    startNewButton.top = '-50px';
    startNewButton.onPointerClickObservable.add(async () => {
      await this.showSeedInputModal();
    });
    panel.addControl(startNewButton);

    // Continue button (load saved game)
    const continueButton = Button.CreateSimpleButton('continueButton', 'Continue');
    continueButton.width = '240px';
    continueButton.height = '60px';
    continueButton.color = '#F7FAFC';
    continueButton.fontSize = 18;
    continueButton.fontFamily = 'Work Sans, sans-serif';
    continueButton.background = '#4A5568'; // Ebb indigo
    continueButton.cornerRadius = 10;
    continueButton.top = '30px';
    continueButton.onPointerClickObservable.add(() => {
      this.handleContinue();
    });
    panel.addControl(continueButton);

    // Settings button
    const settingsButton = Button.CreateSimpleButton('settingsButton', 'Settings');
    settingsButton.width = '240px';
    settingsButton.height = '60px';
    settingsButton.color = '#F7FAFC';
    settingsButton.fontSize = 18;
    settingsButton.fontFamily = 'Work Sans, sans-serif';
    settingsButton.background = '#4A5568'; // Ebb indigo
    settingsButton.cornerRadius = 10;
    settingsButton.top = '110px';
    settingsButton.onPointerClickObservable.add(() => {
      this.handleSettings();
    });
    panel.addControl(settingsButton);

    // Credits button
    const creditsButton = Button.CreateSimpleButton('creditsButton', 'Credits');
    creditsButton.width = '240px';
    creditsButton.height = '60px';
    creditsButton.color = '#F7FAFC';
    creditsButton.fontSize = 18;
    creditsButton.fontFamily = 'Work Sans, sans-serif';
    creditsButton.background = '#4A5568'; // Ebb indigo
    creditsButton.cornerRadius = 10;
    creditsButton.top = '190px';
    creditsButton.onPointerClickObservable.add(() => {
      this.handleCredits();
    });
    panel.addControl(creditsButton);
  }

  private async showSeedInputModal(): Promise<void> {
    if (this.seedModal) {
      this.seedModal.isVisible = true;
      if (this.seedInput) {
        // Load saved seed from Capacitor Preferences
        const savedSeed = await this.loadSeedCookie();
        if (savedSeed) {
          this.seedInput.text = savedSeed;
          this.currentSeed = savedSeed;
        }
        this.seedInput.focus();
      }
      return;
    }

    // Create modal overlay
    this.seedModal = new Rectangle('seedModal');
    this.seedModal.width = 0.7;
    this.seedModal.height = 0.4;
    this.seedModal.cornerRadius = 15;
    this.seedModal.color = '#4A5568';
    this.seedModal.thickness = 2;
    this.seedModal.background = 'rgba(26, 32, 44, 0.95)';
    this.seedModal.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.seedModal.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture!.addControl(this.seedModal);

    // Modal title
    const modalTitle = new TextBlock('modalTitle', 'Create New World');
    modalTitle.fontSize = 24;
    modalTitle.fontFamily = 'Playfair Display, serif';
    modalTitle.color = '#F7FAFC';
    modalTitle.top = '-80px';
    modalTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.seedModal.addControl(modalTitle);

    // Seed input label
    const seedLabel = new TextBlock('seedLabel', 'Seed (3 words):');
    seedLabel.fontSize = 16;
    seedLabel.fontFamily = 'Work Sans, sans-serif';
    seedLabel.color = '#F7FAFC';
    seedLabel.top = '-80px';
    seedLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.seedModal.addControl(seedLabel);

    // Create BabylonJS GUI InputText (cross-platform compatible)
    this.seedInput = new InputText('seedInput');
    this.seedInput.width = '400px';
    this.seedInput.height = '44px';
    this.seedInput.fontSize = 14;
    this.seedInput.fontFamily = 'JetBrains Mono, monospace';
    this.seedInput.color = '#D69E2E'; // Seed gold
    this.seedInput.background = 'rgba(74, 85, 104, 0.9)'; // Ebb indigo
    this.seedInput.focusedBackground = 'rgba(74, 85, 104, 1)';
    this.seedInput.thickness = 2;
    this.seedInput.placeholderText = 'v1-word-word-word';
    this.seedInput.placeholderColor = '#A0AEC0';
    this.seedInput.text = 'v1-word-word-word';
    this.seedInput.top = '-20px';
    this.seedInput.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.seedInput.onTextChangedObservable.add((inputText) => {
      this.currentSeed = inputText.text;
    });
    this.seedModal.addControl(this.seedInput);

    // Initialize seed
    this.currentSeed = this.seedInput.text;

    // Create button
    const createButton = Button.CreateSimpleButton('createButton', 'Create World');
    createButton.width = '200px';
    createButton.height = '50px';
    createButton.color = '#F7FAFC';
    createButton.fontSize = 16;
    createButton.fontFamily = 'Work Sans, sans-serif';
    createButton.background = '#38A169';
    createButton.cornerRadius = 8;
    createButton.top = '50px';
    createButton.onPointerClickObservable.add(() => {
      this.handleStartNew();
    });
    this.seedModal.addControl(createButton);

    // Cancel button
    const cancelButton = Button.CreateSimpleButton('cancelButton', 'Cancel');
    cancelButton.width = '200px';
    cancelButton.height = '50px';
    cancelButton.color = '#F7FAFC';
    cancelButton.fontSize = 16;
    cancelButton.fontFamily = 'Work Sans, sans-serif';
    cancelButton.background = '#4A5568';
    cancelButton.cornerRadius = 8;
    cancelButton.top = '110px';
    cancelButton.onPointerClickObservable.add(() => {
      this.hideSeedInputModal();
    });
    this.seedModal.addControl(cancelButton);
  }

  private hideSeedInputModal(): void {
    if (this.seedModal) {
      this.seedModal.isVisible = false;
    }
    // BabylonJS GUI control visibility is handled by modal visibility
  }

  private async handleStartNew(): Promise<void> {
    const seed = this.seedInput?.text || this.currentSeed || 'v1-test-world-seed';
    
    if (!seed || seed.trim().length === 0) {
      alert('Please enter a seed (3 words)');
      return;
    }

    this.hideSeedInputModal();
    
    try {
      // Create game via direct function call (no HTTP)
      const gameId = `game-${Date.now()}`;
      const engine = new GameEngine(gameId);
      await engine.initialize(seed);

      // Save gameId and seed using Capacitor Preferences (cross-platform)
      await setItem('ebb-bloom-gameId', gameId);
      await this.saveSeedCookie(seed);

      // Navigate to game scene with gameId (hash-based for Capacitor)
      navigateTo({ gameId });
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  }

  private async handleContinue(): Promise<void> {
    const gameId = await getItem('ebb-bloom-gameId');
    
    if (!gameId) {
      alert('No saved game found. Please start a new game.');
      return;
    }

    try {
      // Verify game exists via direct function call
      const engine = new GameEngine(gameId);
      const state = engine.getState();
      
      if (!state || (state.generation === 0 && !state.planet)) {
        throw new Error('Saved game not found or invalid');
      }

      // Navigate to game scene (hash-based for Capacitor)
      navigateTo({ gameId });
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load saved game. Please start a new game.');
      await removeItem('ebb-bloom-gameId');
    }
  }

  private handleSettings(): void {
    this.showSettingsModal();
  }

  private handleCredits(): void {
    this.showCreditsModal();
  }

  private showSettingsModal(): void {
    if (this.settingsModal) {
      this.settingsModal.isVisible = true;
      return;
    }

    // Create settings modal
    this.settingsModal = new Rectangle('settingsModal');
    this.settingsModal.width = 0.75;
    this.settingsModal.height = 0.7;
    this.settingsModal.cornerRadius = 15;
    this.settingsModal.color = '#4A5568';
    this.settingsModal.thickness = 2;
    this.settingsModal.background = 'rgba(26, 32, 44, 0.95)';
    this.settingsModal.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.settingsModal.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture!.addControl(this.settingsModal);

    // Modal title
    const title = new TextBlock('settingsTitle', 'Settings');
    title.fontSize = 32;
    title.fontFamily = 'Playfair Display, serif';
    title.color = '#F7FAFC';
    title.top = '-150px';
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.settingsModal.addControl(title);

    // Placeholder content
    const placeholder = new TextBlock('settingsPlaceholder', 'Settings coming soon...');
    placeholder.fontSize = 18;
    placeholder.fontFamily = 'Work Sans, sans-serif';
    placeholder.color = '#A0AEC0';
    placeholder.top = '0px';
    placeholder.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.settingsModal.addControl(placeholder);

    // Close button
    const closeButton = Button.CreateSimpleButton('settingsClose', 'Close');
    closeButton.width = '200px';
    closeButton.height = '50px';
    closeButton.color = '#F7FAFC';
    closeButton.fontSize = 16;
    closeButton.fontFamily = 'Work Sans, sans-serif';
    closeButton.background = '#4A5568';
    closeButton.cornerRadius = 8;
    closeButton.top = '150px';
    closeButton.onPointerClickObservable.add(() => {
      this.hideSettingsModal();
    });
    this.settingsModal.addControl(closeButton);
  }

  private hideSettingsModal(): void {
    if (this.settingsModal) {
      this.settingsModal.isVisible = false;
    }
  }

  private showCreditsModal(): void {
    if (this.creditsModal) {
      this.creditsModal.isVisible = true;
      return;
    }

    // Create credits modal
    this.creditsModal = new Rectangle('creditsModal');
    this.creditsModal.width = 0.75;
    this.creditsModal.height = 0.8;
    this.creditsModal.cornerRadius = 15;
    this.creditsModal.color = '#4A5568';
    this.creditsModal.thickness = 2;
    this.creditsModal.background = 'rgba(26, 32, 44, 0.95)';
    this.creditsModal.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.creditsModal.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.guiTexture!.addControl(this.creditsModal);

    // Modal title
    const title = new TextBlock('creditsTitle', 'Credits');
    title.fontSize = 32;
    title.fontFamily = 'Playfair Display, serif';
    title.color = '#F7FAFC';
    title.top = '-180px';
    title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(title);

    // Game info
    const gameInfo = new TextBlock('gameInfo', 'Ebb & Bloom');
    gameInfo.fontSize = 24;
    gameInfo.fontFamily = 'Playfair Display, serif';
    gameInfo.color = '#38A169';
    gameInfo.top = '-130px';
    gameInfo.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(gameInfo);

    const tagline = new TextBlock('tagline', 'Shape Worlds. Traits Echo. Legacy Endures.');
    tagline.fontSize = 14;
    tagline.fontFamily = 'Work Sans, sans-serif';
    tagline.color = '#A0AEC0';
    tagline.top = '-100px';
    tagline.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(tagline);

    // Tech stack
    const techLabel = new TextBlock('techLabel', 'Built With');
    techLabel.fontSize = 18;
    techLabel.fontFamily = 'Work Sans, sans-serif';
    techLabel.color = '#38A169';
    techLabel.top = '-60px';
    techLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(techLabel);

    const techStack = new TextBlock('techStack', 'BabylonJS • TypeScript • Capacitor\nVercel AI SDK • Zod • Yuka AI');
    techStack.fontSize = 14;
    techStack.fontFamily = 'JetBrains Mono, monospace';
    techStack.color = '#A0AEC0';
    techStack.top = '-30px';
    techStack.textWrapping = true;
    techStack.resizeToFit = true;
    techStack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(techStack);

    // Acknowledgments
    const ackLabel = new TextBlock('ackLabel', 'Acknowledgments');
    ackLabel.fontSize = 18;
    ackLabel.fontFamily = 'Work Sans, sans-serif';
    ackLabel.color = '#38A169';
    ackLabel.top = '40px';
    ackLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(ackLabel);

    const ackText = new TextBlock('ackText', 'AmbientCG Textures\nGoogle Fonts\nOpenAI GPT Models');
    ackText.fontSize = 14;
    ackText.fontFamily = 'Work Sans, sans-serif';
    ackText.color = '#A0AEC0';
    ackText.top = '70px';
    ackText.textWrapping = true;
    ackText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.creditsModal.addControl(ackText);

    // Close button
    const closeButton = Button.CreateSimpleButton('creditsClose', 'Close');
    closeButton.width = '200px';
    closeButton.height = '50px';
    closeButton.color = '#F7FAFC';
    closeButton.fontSize = 16;
    closeButton.fontFamily = 'Work Sans, sans-serif';
    closeButton.background = '#4A5568';
    closeButton.cornerRadius = 8;
    closeButton.top = '150px';
    closeButton.onPointerClickObservable.add(() => {
      this.hideCreditsModal();
    });
    this.creditsModal.addControl(closeButton);
  }

  private hideCreditsModal(): void {
    if (this.creditsModal) {
      this.creditsModal.isVisible = false;
    }
  }

  private async saveSeedCookie(seed: string): Promise<void> {
    await setItem('ebb-bloom-seed', seed);
  }

  public async loadSeedCookie(): Promise<string | null> {
    return await getItem('ebb-bloom-seed');
  }
}
