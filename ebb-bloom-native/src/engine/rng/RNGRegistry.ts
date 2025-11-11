import { EnhancedRNG } from '../utils/EnhancedRNG';

class RNGRegistry {
  private instances: Map<string, EnhancedRNG> = new Map();
  private currentSeed: string = '';
  
  setSeed(seed: string): void {
    if (seed !== this.currentSeed) {
      this.currentSeed = seed;
      this.instances.clear();
    }
  }
  
  getScopedRNG(namespace: string): EnhancedRNG {
    const key = `${this.currentSeed}::${namespace}`;
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new EnhancedRNG(`${this.currentSeed}-${namespace}`));
    }
    
    return this.instances.get(key)!;
  }
  
  reset(): void {
    this.instances.clear();
    this.currentSeed = '';
  }
}

export const rngRegistry = new RNGRegistry();
