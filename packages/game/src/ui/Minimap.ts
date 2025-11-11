/**
 * MINIMAP
 * 
 * Daggerfall-style minimap showing:
 * - Player position (center dot)
 * - Buildings (colored squares)
 * - NPCs (small dots)
 * - Streets (grid lines)
 */

import * as THREE from 'three';
import { Settlement, Building, BuildingType } from '../world/SettlementPlacer';

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settlement: Settlement | null = null;
  private zoom: number = 2; // pixels per meter
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minimap';
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.canvas.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.8);
      border-radius: 4px;
    `;
    
    this.ctx = this.canvas.getContext('2d')!;
    document.body.appendChild(this.canvas);
  }
  
  /**
   * Set current settlement to display
   */
  setSettlement(settlement: Settlement | null): void {
    this.settlement = settlement;
  }
  
  /**
   * Update minimap with player position
   */
  update(playerX: number, playerZ: number, playerYaw: number): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear
    ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // If in settlement, draw it
    if (this.settlement) {
      this.drawSettlement(playerX, playerZ);
    }
    
    // Draw player (center, always)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-playerYaw); // Rotate minimap with player
    
    // Player arrow
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-5, 5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }
  
  /**
   * Draw settlement on minimap
   */
  private drawSettlement(playerX: number, playerZ: number): void {
    if (!this.settlement) return;
    
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Draw buildings
    for (const building of this.settlement.buildings) {
      // Position relative to player
      const relX = (building.position.x - playerX) * this.zoom;
      const relZ = (building.position.z - playerZ) * this.zoom;
      
      const screenX = centerX + relX;
      const screenY = centerY + relZ;
      
      // Only draw if on screen
      if (screenX < 0 || screenX > this.canvas.width || screenY < 0 || screenY > this.canvas.height) {
        continue;
      }
      
      // Color by building type
      let color: string;
      switch (building.type) {
        case BuildingType.HOUSE:
          color = '#8B4513'; // Brown
          break;
        case BuildingType.SHOP:
          color = '#FFD700'; // Gold
          break;
        case BuildingType.TAVERN:
          color = '#FF4444'; // Red
          break;
        case BuildingType.TEMPLE:
          color = '#4444FF'; // Blue
          break;
        case BuildingType.WAREHOUSE:
          color = '#888888'; // Gray
          break;
        case BuildingType.WORKSHOP:
          color = '#FF8800'; // Orange
          break;
        default:
          color = '#FFFFFF';
      }
      
      ctx.fillStyle = color;
      const size = Math.max(3, building.size.x * this.zoom * 0.3);
      ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
    }
  }
  
  dispose(): void {
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}



