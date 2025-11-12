import { EnhancedRNG } from '../../utils/EnhancedRNG';
import { CosmicProvenanceTimeline } from '../timeline/CosmicProvenanceTimeline';

export class GenesisSeedContext {
  private readonly baseSeed: string;
  private readonly timeline: CosmicProvenanceTimeline;
  private readonly scopedRNGs: Map<string, EnhancedRNG>;

  constructor(_masterRNG: EnhancedRNG, baseSeed: string = 'genesis') {
    this.baseSeed = baseSeed;
    this.scopedRNGs = new Map();
    this.timeline = new CosmicProvenanceTimeline(this.getScopedRNG('cosmic-timeline'));
  }

  getScopedRNG(domain: string): EnhancedRNG {
    if (!this.scopedRNGs.has(domain)) {
      const seed = `${this.baseSeed}_${domain}`;
      this.scopedRNGs.set(domain, new EnhancedRNG(seed));
    }
    return this.scopedRNGs.get(domain)!;
  }

  getTimeline(): CosmicProvenanceTimeline {
    return this.timeline;
  }

  getTimelineConstants(): Record<string, number> {
    return this.timeline.getAllConstants();
  }
}
