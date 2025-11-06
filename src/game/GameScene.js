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
    
    // Sprite pooling for better performance
    this.tileSprites = new Map(); // Store sprites by tile key
    this.spritePool = {
      water: [],
      grass: [],
      flower: [],
      ore: []
    };
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
    
    // Resource collection timer
    this.resourceCollectionTimer = 0;
    this.resourceCollectionDelay = 500; // 500ms = 0.5 seconds
    
    // UI elements
    this.createUI();
    
    // Performance monitoring
    this.lastTime = Date.now();
    this.frameCount = 0;
    this.fps = 60;
  }

  renderWorld() {
    // Get visible tiles around player (optimized viewport culling with sprite pooling)
    const playerTilePos = this.player.getTilePosition(8);
    const viewRadius = 60; // Tiles to render around player
    
    const visibleTiles = this.worldCore.getVisibleTiles(
      playerTilePos.x,
      playerTilePos.y,
      viewRadius
    );
    
    // Mark all current sprites as inactive
    const activeKeys = new Set();
    
    // Update or create sprites for visible tiles
    visibleTiles.forEach(tile => {
      const key = `${tile.worldX},${tile.worldY}`;
      activeKeys.add(key);
      
      let sprite = this.tileSprites.get(key);
      if (!sprite) {
        // Try to reuse from pool or create new
        if (this.spritePool[tile.type].length > 0) {
          sprite = this.spritePool[tile.type].pop();
          sprite.setActive(true);
          sprite.setVisible(true);
        } else {
          sprite = this.add.sprite(0, 0, tile.type);
          sprite.setOrigin(0.5, 0.5);
        }
        this.tileSprites.set(key, sprite);
      }
      
      // Update position (sprite might be reused from different location)
      sprite.setPosition(tile.worldX * 8 + 4, tile.worldY * 8 + 4);
    });
    
    // Return unused sprites to pool
    for (const [key, sprite] of this.tileSprites.entries()) {
      if (!activeKeys.has(key)) {
        sprite.setActive(false);
        sprite.setVisible(false);
        const type = sprite.texture.key;
        this.spritePool[type].push(sprite);
        this.tileSprites.delete(key);
      }
    }
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
    
    // Re-render world when player moves significantly (optimization)
    // Only re-render when moved 25+ tiles to reduce draw calls
    if (!this.lastRenderPos) {
      this.lastRenderPos = { x: this.player.x, y: this.player.y };
    }
    const dx = Math.abs(this.player.x - this.lastRenderPos.x);
    const dy = Math.abs(this.player.y - this.lastRenderPos.y);
    const renderThreshold = 25 * 8; // 25 tiles * 8 pixels
    
    if (dx > renderThreshold || dy > renderThreshold) {
      this.renderWorld();
      this.lastRenderPos = { x: this.player.x, y: this.player.y };
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
      // Timer-based collection for predictable, responsive gameplay
      // Collect after standing on tile for 500ms
      this.resourceCollectionTimer += this.game.loop.delta;
      
      if (this.resourceCollectionTimer >= this.resourceCollectionDelay) {
        this.player.collectResource(tile.type);
        this.resourceCollectionTimer = 0; // Reset timer after collection
      }
    } else {
      // Reset timer when not on resource tile
      this.resourceCollectionTimer = 0;
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
