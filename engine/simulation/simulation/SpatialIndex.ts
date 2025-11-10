/**
 * Spatial Indexing for Universe
 * Efficiently lookup what exists at coordinates.
 */

export class SpatialIndex {
  private grid: Map<string, any> = new Map();
  private cellSize: number;

  constructor(cellSize_ly: number = 1000) {
    this.cellSize = cellSize_ly;
  }

  private getKey(x: number, y: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx},${cy},${cz}`;
  }

  insert(x: number, y: number, z: number, object: any): void {
    const key = this.getKey(x, y, z);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(object);
  }

  query(x: number, y: number, z: number, radius_ly: number): any[] {
    const results: any[] = [];
    const cellRadius = Math.ceil(radius_ly / this.cellSize);

    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = this.grid.get(key);
          if (cell) results.push(...cell);
        }
      }
    }

    return results.filter((obj) => {
      const dist = Math.sqrt(
        Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2) + Math.pow(obj.z - z, 2)
      );
      return dist <= radius_ly;
    });
  }
}
