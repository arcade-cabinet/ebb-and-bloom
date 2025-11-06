/**
 * Main Game Scene - ECS Architecture
 * Integrates BitECS, Zustand, Phaser rendering
 * Pure Phaser as rendering layer, ECS for game logic
 */

import Phaser from 'phaser';
import { getWorld, resetWorld } from '../ecs/world';
import { createPlayer } from '../ecs/entities';
import { Position, Velocity, Inventory, Sprite as SpriteComponent } from '../ecs/components';
import { createMovementSystem } from '../ecs/systems/MovementSystem';
import { createCraftingSystem } from '../ecs/systems/CraftingSystem';
import { WorldCore } from './core/core';
import { GestureController } from './player/player';
import { useGameStore } from '../stores/gameStore';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
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
    // Initialize ECS World
    this.world = resetWorld();
    useGameStore().setWorld(this.world);
    useGameStore().initialize();
    
    // Initialize systems
    this.movementSystem = createMovementSystem();
    this.craftingSystem = createCraftingSystem();
    
    // Initialize world generation
    this.worldCore = new WorldCore(Date.now());
    
    // Create player entity (ECS)
    this.playerEid = createPlayer(this.world, 250 * 8, 250 * 8);
    
    // Camera setup
    const bounds = this.worldCore.getWorldBounds();
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    
    // Sprite pooling for better performance
    this.tileSprites = new Map(); // Store sprites by tile key
    this.spritePool = {
      water: [],
      grass: [],
      flower: [],
      ore: []
    };
    this.renderWorld();
    
    // Create player sprite (Phaser rendering)
    this.playerSprite = this.add.sprite(
      Position.x[this.playerEid], 
      Position.y[this.playerEid], 
      'player'
    );
    
    // Follow player
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    
    // Trail graphics
    this.trailGraphics = this.add.graphics();
    this.trailPoints = [];
    this.maxTrailLength = 10;
    
    // Setup gesture controls (operates on ECS Velocity component)
    this.gestureController = new GestureController(
      {
        applyForce: (fx, fy) => {
          const maxSpeed = 200;
          Velocity.x[this.playerEid] = Math.max(-maxSpeed, Math.min(maxSpeed, Velocity.x[this.playerEid] + fx));
          Velocity.y[this.playerEid] = Math.max(-maxSpeed, Math.min(maxSpeed, Velocity.y[this.playerEid] + fy));
        },
        speed: 100,
        maxSpeed: 200
      },
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
    
    // Last render position for optimization
    this.lastRenderPos = { x: Position.x[this.playerEid], y: Position.y[this.playerEid] };
  }

  renderWorld() {
    // Get visible tiles around player (optimized viewport culling with sprite pooling)
    const playerTilePos = {
      x: Math.floor(Position.x[this.playerEid] / 8),
      y: Math.floor(Position.y[this.playerEid] / 8)
    };
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
    const deltaSeconds = delta / 1000;
    
    // Run ECS systems
    this.movementSystem(this.world, deltaSeconds);
    
    // Sync player position to Zustand store
    useGameStore().updatePlayerPosition(
      Position.x[this.playerEid],
      Position.y[this.playerEid]
    );
    
    // Update player sprite (Phaser rendering layer)
    this.playerSprite.setPosition(Position.x[this.playerEid], Position.y[this.playerEid]);
    this.playerSprite.setFlipX(Velocity.x[this.playerEid] < 0);
    
    // Draw trail
    this.updateTrail();
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
      useGameStore().setFPS(this.fps);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    // Re-render world when player moves significantly (optimization)
    const dx = Math.abs(Position.x[this.playerEid] - this.lastRenderPos.x);
    const dy = Math.abs(Position.y[this.playerEid] - this.lastRenderPos.y);
    const renderThreshold = 25 * 8; // 25 tiles * 8 pixels
    
    if (dx > renderThreshold || dy > renderThreshold) {
      this.renderWorld();
      this.lastRenderPos = { 
        x: Position.x[this.playerEid], 
        y: Position.y[this.playerEid] 
      };
    }
  }

  updateTrail() {
    // Add current position to trail
    this.trailPoints.push({ 
      x: Position.x[this.playerEid], 
      y: Position.y[this.playerEid], 
      alpha: 1.0 
    });
    
    // Remove old trail points
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }
    
    // Fade trail
    this.trailPoints.forEach((point, i) => {
      point.alpha = i / this.maxTrailLength;
    });
  }

  drawTrail() {
    this.trailGraphics.clear();
    
    if (this.trailPoints.length > 1) {
      this.trailGraphics.lineStyle(2, 0xff6b9d);
      
      for (let i = 0; i < this.trailPoints.length - 1; i++) {
        const point = this.trailPoints[i];
        const nextPoint = this.trailPoints[i + 1];
        
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
    const tilePos = {
      x: Math.floor(Position.x[this.playerEid] / 8),
      y: Math.floor(Position.y[this.playerEid] / 8)
    };
    const tile = this.worldCore.getTile(tilePos.x, tilePos.y);
    
    if (tile && (tile.type === 'ore' || tile.type === 'water')) {
      // Timer-based collection for predictable, responsive gameplay
      this.resourceCollectionTimer += this.game.loop.delta;
      
      if (this.resourceCollectionTimer >= this.resourceCollectionDelay) {
        // Update ECS Inventory component
        if (tile.type === 'ore') {
          Inventory.ore[this.playerEid]++;
        } else if (tile.type === 'water') {
          Inventory.water[this.playerEid]++;
        }
        
        // Sync to Zustand
        useGameStore().updatePlayerInventory(
          Inventory.ore[this.playerEid],
          Inventory.water[this.playerEid],
          Inventory.alloy[this.playerEid]
        );
        
        this.resourceCollectionTimer = 0;
      }
    } else {
      this.resourceCollectionTimer = 0;
    }
  }

  attemptCraft() {
    const result = this.craftingSystem.craft(this.world, 'alloy');
    
    if (result.success) {
      // Sync to Zustand
      useGameStore().updatePlayerInventory(
        Inventory.ore[this.playerEid],
        Inventory.water[this.playerEid],
        Inventory.alloy[this.playerEid]
      );
      useGameStore().addPollution(result.pollution);
      
      // Visual feedback
      this.cameras.main.shake(100, 0.002);
    }
  }

  updateUI() {
    // Update inventory (from ECS)
    this.inventoryText.setText(
      `Ore: ${Inventory.ore[this.playerEid]} | Water: ${Inventory.water[this.playerEid]} | Alloy: ${Inventory.alloy[this.playerEid]}`
    );
    
    // Update pollution (from Zustand)
    const pollution = useGameStore().pollution;
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
