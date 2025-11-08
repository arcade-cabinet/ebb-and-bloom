/**
 * Ebb & Bloom - Unified Game Package
 * 
 * Single entry point combining frontend (BabylonJS) + backend (simulation)
 * Direct function calls - no HTTP REST API overhead
 */

import { Engine, Scene } from '@babylonjs/core';
import { SplashScreenScene } from './scenes/SplashScreenScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { OnboardingScene } from './scenes/OnboardingScene';
import { GameScene } from './scenes/GameScene';
import { getParam, getRouteParams } from './utils/router';
import { getItem, setItem } from './utils/storage';

// Get canvas element
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Create BabylonJS engine
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

// Create scene
const scene = new Scene(engine);

// Track current scene
let currentScene: SplashScreenScene | MainMenuScene | OnboardingScene | GameScene | null = null;

// Determine initial scene based on URL (hash-based routing for Capacitor)
let gameId = getParam('gameId');

// Listen for hash changes (route changes)
window.addEventListener('hashchange', () => {
  const params = getRouteParams();
  const newGameId = params.get('gameId');
  
  if (newGameId && newGameId !== gameId) {
    // Navigate to game scene
    gameId = newGameId;
    disposeCurrentScene();
    currentScene = new GameScene(scene, engine, gameId);
  }
});

// Helper to dispose current scene
function disposeCurrentScene() {
  if (currentScene && 'dispose' in currentScene) {
    (currentScene as any).dispose();
  }
  currentScene = null;
}

// Show onboarding or main menu
async function showMainMenu() {
  disposeCurrentScene();
  
  // Check if user has seen onboarding
  const hasSeenOnboarding = await getItem('hasSeenOnboarding');
  
  if (!hasSeenOnboarding) {
    // First time user - show onboarding
    currentScene = new OnboardingScene(scene, engine, async () => {
      await setItem('hasSeenOnboarding', 'true');
      showMainMenuDirect();
    });
  } else {
    // Returning user - go straight to main menu
    showMainMenuDirect();
  }
}

function showMainMenuDirect() {
  disposeCurrentScene();
  currentScene = new MainMenuScene(scene, engine);
}

// Initialize app
if (gameId) {
  // Direct to game scene if gameId provided
  currentScene = new GameScene(scene, engine, gameId);
} else {
  // Start with splash screen
  currentScene = new SplashScreenScene(scene, engine, showMainMenu);
}

// Handle window resize
window.addEventListener('resize', () => {
  engine.resize();
});

// Start render loop
engine.runRenderLoop(() => {
  scene.render();
});

