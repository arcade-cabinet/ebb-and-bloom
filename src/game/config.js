/**
 * Phaser Game Configuration
 * Optimized for 60FPS mobile performance
 */

import Phaser from 'phaser';
import { GameScene } from './GameScene.js';

export const gameConfig = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
  fps: {
    target: 60,
    forceSetTimeOut: false
  },
  scene: [GameScene]
};

export default gameConfig;
