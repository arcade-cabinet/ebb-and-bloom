/**
 * Core game module
 * Handles world generation with Perlin noise, raycasting, and chunk management
 */

import PerlinNoise from './perlin';

interface Tile {
  type: string;
  value: number;
  worldX: number;
  worldY: number;
}

interface Chunk {
  x: number;
  y: number;
  tiles: Tile[][];
  entities: any[];
}

interface BiomeThresholds {
  water: number;
  grass: number;
  flower: number;
  ore: number;
}

interface RaycastResult {
  x: number;
  y: number;
  tile: Tile;
  distance: number;
}

export class WorldCore {
  seed: number;
  perlin: PerlinNoise;
  CHUNK_SIZE: number;
  CHUNKS_X: number;
  CHUNKS_Y: number;
  TILE_SIZE: number;
  BIOME_THRESHOLDS: BiomeThresholds;
  chunks: Map<string, Chunk>;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
    this.perlin = new PerlinNoise(seed);
    
    // World configuration
    this.CHUNK_SIZE = 100; // 100x100 macros per chunk
    this.CHUNKS_X = 5;
    this.CHUNKS_Y = 5;
    this.TILE_SIZE = 8; // 8x8 sprite tiles
    
    // Biome thresholds for meadow generation
    // Noise values range from -1 to 1, normalized to 0-1
    this.BIOME_THRESHOLDS = {
      water: 0.3,  // < 0.3 = water
      grass: 0.5,  // 0.3-0.5 = grass
      flower: 0.7, // 0.5-0.7 = flowers
      ore: 0.85    // > 0.85 = ore deposits
    };
    
    // Chunks storage
    this.chunks = new Map();
    this.generateWorld();
  }

  generateWorld(): void {
    // Generate 5x5 chunks
    for (let cy = 0; cy < this.CHUNKS_Y; cy++) {
      for (let cx = 0; cx < this.CHUNKS_X; cx++) {
        this.generateChunk(cx, cy);
      }
    }
  }

  generateChunk(cx: number, cy: number): Chunk {
    const chunkKey = `${cx},${cy}`;
    const chunk: Chunk = {
      x: cx,
      y: cy,
      tiles: [],
      entities: []
    };
    
    // Generate 100x100 tiles per chunk with Perlin noise
    for (let ty = 0; ty < this.CHUNK_SIZE; ty++) {
      chunk.tiles[ty] = [];
      for (let tx = 0; tx < this.CHUNK_SIZE; tx++) {
        // World coordinates
        const worldX = cx * this.CHUNK_SIZE + tx;
        const worldY = cy * this.CHUNK_SIZE + ty;
        
        // Generate noise value (0.0 to 1.0)
        const noiseValue = (this.perlin.octaveNoise(
          worldX * 0.05,
          worldY * 0.05,
          4,
          0.5
        ) + 1) / 2;
        
        // Determine tile type based on noise (0-1 range)
        // Lower values = water, higher = ore
        let type = 'grass'; // default
        
        if (noiseValue < this.BIOME_THRESHOLDS.water) {
          type = 'water';
        } else if (noiseValue < this.BIOME_THRESHOLDS.grass) {
          type = 'grass';
        } else if (noiseValue < this.BIOME_THRESHOLDS.flower) {
          type = 'flower';
        } else if (noiseValue >= this.BIOME_THRESHOLDS.ore) {
          type = 'ore';
        } else {
          // Values between 0.7 and 0.85 - default to grass
          type = 'grass';
        }
        
        chunk.tiles[ty][tx] = {
          type,
          value: noiseValue,
          worldX,
          worldY
        };
      }
    }
    
    this.chunks.set(chunkKey, chunk);
    return chunk;
  }

  getTile(worldX: number, worldY: number): Tile | null {
    const cx = Math.floor(worldX / this.CHUNK_SIZE);
    const cy = Math.floor(worldY / this.CHUNK_SIZE);
    // Fix negative coordinate modulo - JS modulo returns negative for negative inputs
    const tx = ((worldX % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
    const ty = ((worldY % this.CHUNK_SIZE) + this.CHUNK_SIZE) % this.CHUNK_SIZE;
    
    const chunk = this.chunks.get(`${cx},${cy}`);
    if (!chunk || !chunk.tiles[ty]) return null;
    return chunk.tiles[ty][tx];
  }

  raycast(startX: number, startY: number, dirX: number, dirY: number, maxDistance: number = 100): RaycastResult[] {
    // Simple DDA raycast for stride view
    const results: RaycastResult[] = [];
    let distance = 0;
    const stepSize = 0.5;
    
    while (distance < maxDistance) {
      const x = Math.floor(startX + dirX * distance);
      const y = Math.floor(startY + dirY * distance);
      
      const tile = this.getTile(x, y);
      if (tile) {
        results.push({
          x,
          y,
          tile,
          distance
        });
      }
      
      distance += stepSize;
    }
    
    return results;
  }

  getVisibleTiles(centerX: number, centerY: number, viewRadius: number = 50): Tile[] {
    // Get tiles within view radius for stride view rendering
    const tiles: Tile[] = [];
    const startX = Math.max(0, Math.floor(centerX - viewRadius));
    const startY = Math.max(0, Math.floor(centerY - viewRadius));
    const endX = Math.min(this.CHUNKS_X * this.CHUNK_SIZE, Math.ceil(centerX + viewRadius));
    const endY = Math.min(this.CHUNKS_Y * this.CHUNK_SIZE, Math.ceil(centerY + viewRadius));
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = this.getTile(x, y);
        if (tile) {
          tiles.push(tile);
        }
      }
    }
    
    return tiles;
  }

  getWorldBounds(): { width: number; height: number } {
    return {
      width: this.CHUNKS_X * this.CHUNK_SIZE * this.TILE_SIZE,
      height: this.CHUNKS_Y * this.CHUNK_SIZE * this.TILE_SIZE
    };
  }
}

export default WorldCore;
