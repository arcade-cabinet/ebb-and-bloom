/**
 * Main Game Scene
 * Integrates Phaser with WorldCore, Player, and Crafting systems
 * Renders 5x5 chunk world with 60FPS target
 */

import Phaser from 'phaser';
import { WorldCore } from './core/core.js';
import { Player, GestureController } from './player/player.js';
import { CraftingSystem } from './systems/crafting.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Generate simple sprite textures
    this.generateSprites();
  }

  generateSprites() {
    // Create 8x8 pixel sprites for different tile types
    const tileTypes = {
      water: 0x4a90e2,
      grass: 0x7ed321,
      flower: 0xf5a623,
      ore: 0x8b572a
    };
    
    for (const [type, color] of Object.entries(tileTypes)) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, 8, 8);
      graphics.generateTexture(type, 8, 8);
      graphics.destroy();
    }
    
    // Create catalyst player sprite (8x8 modular)
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0xff6b9d, 1);
    playerGraphics.fillCircle(4, 4, 3);
    playerGraphics.generateTexture('player', 8, 8);
    playerGraphics.destroy();
  }

  create() {
    // Initialize game systems
    this.worldCore = new WorldCore(Date.now());
    this.player = new Player(250 * 8, 250 * 8); // Center of 5x5 world
    this.crafting = new CraftingSystem();
    
    // Camera setup
    const bounds = this.worldCore.getWorldBounds();
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    this.cameras.main.startFollow({ x: this.player.x, y: this.player.y }, true, 0.1, 0.1);
    
    // Render world tiles
    this.tileSprites = [];
    this.renderWorld();
    
    // Create player sprite
    this.playerSprite = this.add.sprite(this.player.x, this.player.y, 'player');
    
    // Trail graphics
    this.trailGraphics = this.add.graphics();
    
    // Setup gesture controls
    this.gestureController = new GestureController(
      this.player,
      this.game.canvas
    );
    
    // UI elements
    this.createUI();
    
    // Performance monitoring
    this.lastTime = Date.now();
    this.frameCount = 0;
    this.fps = 60;
  }

  renderWorld() {
    // Get visible tiles around player
    const playerTilePos = this.player.getTilePosition(8);
    const visibleTiles = this.worldCore.getVisibleTiles(
      playerTilePos.x,
      playerTilePos.y,
      60
    );
    
    // Clear existing sprites
    this.tileSprites.forEach(sprite => sprite.destroy());
    this.tileSprites = [];
    
    // Render visible tiles
    visibleTiles.forEach(tile => {
      const sprite = this.add.sprite(
        tile.worldX * 8 + 4,
        tile.worldY * 8 + 4,
        tile.type
      );
      sprite.setOrigin(0.5, 0.5);
      this.tileSprites.push(sprite);
    });
  }

  createUI() {
    // Fixed UI elements
    const uiStyle = {
      font: '16px Arial',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };
    
    // Inventory display
    this.inventoryText = this.add.text(10, 10, '', uiStyle).setScrollFactor(0);
    
    // Pollution meter
    this.pollutionText = this.add.text(10, 40, '', uiStyle).setScrollFactor(0);
    
    // FPS counter
    this.fpsText = this.add.text(10, 70, '', uiStyle).setScrollFactor(0);
    
    // Craft button (visual indicator)
    this.craftButton = this.add.text(
      this.cameras.main.width - 120,
      this.cameras.main.height - 60,
      'CRAFT\n(Ore+Water)',
      { ...uiStyle, align: 'center' }
    ).setScrollFactor(0).setInteractive();
    
    this.craftButton.on('pointerdown', () => this.attemptCraft());
  }

  update(time, delta) {
    // Update player
    this.player.update(delta / 1000);
    
    // Update player sprite
    this.playerSprite.setPosition(this.player.x, this.player.y);
    this.playerSprite.setFlipX(this.player.flipX);
    
    // Draw trail
    this.drawTrail();
    
    // Check for resource collection
    this.checkResourceCollection();
    
    // Update UI
    this.updateUI();
    
    // Calculate FPS
    this.frameCount++;
    const currentTime = Date.now();
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    // Re-render world occasionally (optimization)
    if (Phaser.Math.Between(0, 100) === 0) {
      this.renderWorld();
    }
  }

  drawTrail() {
    this.trailGraphics.clear();
    
    if (this.player.trail.length > 1) {
      this.trailGraphics.lineStyle(2, 0xff6b9d);
      
      for (let i = 0; i < this.player.trail.length - 1; i++) {
        const point = this.player.trail[i];
        const nextPoint = this.player.trail[i + 1];
        
        this.trailGraphics.setAlpha(point.alpha);
        this.trailGraphics.lineBetween(
          point.x,
          point.y,
          nextPoint.x,
          nextPoint.y
        );
      }
      
      this.trailGraphics.setAlpha(1);
    }
  }

  checkResourceCollection() {
    const tilePos = this.player.getTilePosition(8);
    const tile = this.worldCore.getTile(tilePos.x, tilePos.y);
    
    if (tile && (tile.type === 'ore' || tile.type === 'water')) {
      // Auto-collect resources (simplified for POC)
      if (Phaser.Math.Between(0, 60) === 0) {
        this.player.collectResource(tile.type);
      }
    }
  }

  async attemptCraft() {
    const result = await this.crafting.craft('alloy', this.player.inventory);
    
    if (result.success) {
      // Visual feedback
      this.cameras.main.shake(100, 0.002);
    }
  }

  updateUI() {
    // Update inventory
    const inv = this.player.inventory;
    this.inventoryText.setText(
      `Ore: ${inv.ore} | Water: ${inv.water} | Alloy: ${inv.alloy}`
    );
    
    // Update pollution
    const pollution = this.crafting.getPollutionPercentage().toFixed(0);
    this.pollutionText.setText(`Pollution: ${pollution}%`);
    
    // Update FPS
    this.fpsText.setText(`FPS: ${this.fps}`);
  }

  shutdown() {
    // Cleanup
    if (this.gestureController) {
      this.gestureController.destroy();
    }
  }
}

export default GameScene;
