// src/engine/rayStride.ts
import Phaser from 'phaser';
import * as SimplexNoise from 'simplex-noise'; // npm i simplex-noise

interface Chunk {
  grid: number[][];
  seed: number;
}

class RayStride {
  private noise = new SimplexNoise();
  private resolution = 100; // Rays for FOV
  private fov = 60;
  private maxDist = 20;
  private step = 0.1;

  constructor(private scene: Phaser.Scene, private camera: Phaser.Cameras.Scene2D.Camera) {}

  // Gen Perlin chunk (32x32 heightmap, 0-1; >0.5 = wall/scar)
  genChunk(seed: number = 42, width = 32, height = 32, scale = 5): Chunk {
    const grid: number[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        // Simple Perlin (seed deterministic)
        const nx = x / scale + seed * 0.01;
        const ny = y / scale + seed * 0.01;
        grid[y][x] = (this.noise2D(nx, ny) + 1) / 2; // 0-1 height
      }
    }
    return { grid, seed };
  }

  // Cast rays from player, return distances for "view slice"
  castRays(chunk: Chunk, pos: { x: number; y: number }, angle: number): number[] {
    const rays = [];
    for (let i = 0; i < this.resolution; i++) {
      const rayAngle = angle + (this.fov / this.resolution * i) - (this.fov / 2);
      const dir = { x: Math.cos(rayAngle), y: Math.sin(rayAngle) };
      let dist = 0;
      let hit = false;
      while (!hit && dist < this.maxDist) {
        const x = Math.floor(pos.x + dir.x * dist);
        const y = Math.floor(pos.y + dir.y * dist);
        if (x >= 0 && x < chunk.grid[0].length && y >= 0 && y < chunk.grid.length) {
          if (chunk.grid[y][x] > 0.5) { // Hit scar/thorn
            hit = true;
            // Fish-eye fix
            const delta = rayAngle - angle;
            dist /= Math.cos(delta) || 1;
          }
        }
        dist += this.step;
      }
      rays.push(Math.max(dist, 0)); // Clamp negatives
    }
    return rays;
  }

  // Render "view" to Phaser graphics (pseudo-3D slice)
  renderView(chunk: Chunk, pos: { x: number; y: number }, angle: number, graphics: Phaser.GameObjects.Graphics) {
    const rays = this.castRays(chunk, pos, angle);
    const avg = rays.reduce((a, b) => a + b, 0) / rays.length;
    graphics.clear();
    // Color by distance (short = indigo ebb, long = emerald bloom)
    rays.forEach((dist, i) => {
      const height = (this.maxDist - dist) * 2; // Scale "wall" height
      const color = dist < 5 ? 0x001122 : (dist > 15 ? 0x228844 : 0x112233); // Ebb to bloom
      graphics.fillStyle(color, 1 - (dist / this.maxDist)); // Fade haze
      graphics.fillRect(i * 4, this.camera.height / 2 - height / 2, 4, height); // Slice
    });
    // Aff mod: Void = darken 20%
    graphics.fillStyle(0x000011, 0.2); // Void haze overlay
    graphics.fillRect(0, 0, this.resolution * 4, this.camera.height);
  }

  // Gesture warp: Swipe mods angle, pinch scales fov
  warpAngle(delta: number) {
    // In scene update
    this.playerAngle += delta * 0.01; // Smooth turn
  }

  warpFov(delta: number) {
    this.fov += delta * 0.5; // Pinch zoom
    this.fov = Math.max(30, Math.min(90, this.fov));
  }
}

// Phaser Scene Hook (e.g., in GameScene)
export class StrideScene extends Phaser.Scene {
  private stride: RayStride;
  private chunk: Chunk;
  private player = { x: 16, y: 16, angle: 0 };
  private graphics: Phaser.GameObjects.Graphics;

  create() {
    this.chunk = new RayStride(this, this.cameras.main).genChunk(42);
    this.stride = new RayStride(this, this.cameras.main);
    this.graphics = this.add.graphics({ x: 0, y: 0 });
    this.input.on('pointerdown', (pointer) => this.onGesture(pointer));
  }

  update() {
    this.stride.renderView(this.chunk, this.player, this.player.angle, this.graphics);
  }

  onGesture(pointer: Phaser.Input.Pointer) {
    // Swipe for angle warp
    if (pointer.isDown) {
      const delta = pointer.x - this.player.x;
      this.stride.warpAngle(delta);
    }
    // Pinch for fov (use multi-touch delta)
    if (this.input.pointers.length > 1) {
      const delta = this.input.pointers[1].distance - this.input.pointers[0].distance;
      this.stride.warpFov(delta);
    }
  }
}