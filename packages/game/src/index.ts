/**
 * Ebb & Bloom - Unified Game Package
 * 
 * Single entry point combining frontend (BabylonJS) + backend (simulation)
 * Direct function calls - no HTTP REST API overhead
 */

import { Engine, Scene } from '@babylonjs/core';
import { SplashScreenScene } from './scenes/SplashScreenScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';

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

// Determine initial scene based on URL
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');

let currentScene: SplashScreenScene | MainMenuScene | GameScene | null = null;

if (gameId) {
  // Direct to game scene if gameId provided
  currentScene = new GameScene(scene, engine, gameId);
} else {
  // Start with splash screen, then main menu
  const showMainMenu = () => {
    if (currentScene instanceof SplashScreenScene) {
      currentScene.dispose();
    }
    currentScene = new MainMenuScene(scene, engine);
  };
  
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

