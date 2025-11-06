/**
 * Perlin Noise Generator for world generation
 * Used to create organic terrain with meadow biomes
 */

class PerlinNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.permutation = this.generatePermutation(seed);
  }

  generatePermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    
    // Shuffle using seed-based random
    for (let i = 255; i > 0; i--) {
      const random = Math.abs(Math.sin(seed * (i + 1)) * 10000);
      const j = Math.floor(random % (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    // Duplicate for overflow
    return [...p, ...p];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const p = this.permutation;
    const a = p[X] + Y;
    const aa = p[a];
    const ab = p[a + 1];
    const b = p[X + 1] + Y;
    const ba = p[b];
    const bb = p[b + 1];
    
    return this.lerp(v,
      this.lerp(u, this.grad(p[aa], x, y), this.grad(p[ba], x - 1, y)),
      this.lerp(u, this.grad(p[ab], x, y - 1), this.grad(p[bb], x - 1, y - 1))
    );
  }

  octaveNoise(x, y, octaves = 4, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    return total / maxValue;
  }
}

export default PerlinNoise;
