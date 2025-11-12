import { AudioNodeGroup } from '../types';

export class AudioRouter {
  private currentSources: AudioNodeGroup[] = [];

  public addSource(group: AudioNodeGroup): void {
    this.currentSources.push(group);
  }

  public cleanupOldSources(audioContext: AudioContext): void {
    const now = audioContext.currentTime;
    this.currentSources = this.currentSources.filter(group => group.stopTime > now);
    
    if (this.currentSources.length > 50) {
      const toRemove = this.currentSources.splice(0, this.currentSources.length - 50);
      for (const group of toRemove) {
        for (const node of group.nodes) {
          try {
            if ('stop' in node && typeof node.stop === 'function') {
              (node as any).stop(now);
            }
          } catch (error) {
          }
        }
      }
    }
  }

  public stopAll(audioContext: AudioContext): void {
    const now = audioContext.currentTime;
    
    for (const group of this.currentSources) {
      for (const node of group.nodes) {
        try {
          if ('stop' in node && typeof node.stop === 'function') {
            (node as any).stop(now + 0.1);
          }
        } catch (error) {
          console.warn('[AudioRouter] Error stopping node:', error);
        }
      }
    }
    
    this.currentSources = [];
  }

  public getSources(): AudioNodeGroup[] {
    return this.currentSources;
  }
}
