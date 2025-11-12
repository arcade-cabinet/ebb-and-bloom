export type FMVStage = 'bigbang' | 'splash' | 'accretion' | 'complete';

export interface StageTransition {
  from: FMVStage;
  to: FMVStage;
  duration: number;
}

export class StageDirector {
  private currentStage: FMVStage = 'bigbang';
  private stageStartTime: number = 0;
  private listeners: Array<(stage: FMVStage) => void> = [];
  
  private readonly stageDurations: Record<FMVStage, number> = {
    bigbang: 8000,
    splash: 5000,
    accretion: 12000,
    complete: 0,
  };
  
  private readonly stageOrder: FMVStage[] = ['bigbang', 'splash', 'accretion', 'complete'];

  constructor() {
    this.stageStartTime = Date.now();
  }

  getCurrentStage(): FMVStage {
    return this.currentStage;
  }

  getStageProgress(): number {
    const elapsed = Date.now() - this.stageStartTime;
    const duration = this.stageDurations[this.currentStage];
    
    if (duration === 0) return 1;
    
    return Math.min(elapsed / duration, 1);
  }

  getStageDuration(stage: FMVStage): number {
    return this.stageDurations[stage];
  }

  nextStage(): void {
    const currentIndex = this.stageOrder.indexOf(this.currentStage);
    
    if (currentIndex < this.stageOrder.length - 1) {
      const nextStage = this.stageOrder[currentIndex + 1];
      this.transitionTo(nextStage);
    }
  }

  transitionTo(stage: FMVStage): void {
    if (this.currentStage === stage) return;
    
    this.currentStage = stage;
    this.stageStartTime = Date.now();
    
    this.notifyListeners(stage);
  }

  onStageChange(callback: (stage: FMVStage) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(stage: FMVStage): void {
    for (const listener of this.listeners) {
      listener(stage);
    }
  }

  reset(): void {
    this.currentStage = 'bigbang';
    this.stageStartTime = Date.now();
    this.notifyListeners(this.currentStage);
  }

  isComplete(): boolean {
    return this.currentStage === 'complete';
  }

  getTotalDuration(): number {
    return this.stageDurations.bigbang + 
           this.stageDurations.splash + 
           this.stageDurations.accretion;
  }

  getOverallProgress(): number {
    const totalDuration = this.getTotalDuration();
    let elapsedTotal = 0;
    
    for (let i = 0; i < this.stageOrder.length; i++) {
      const stage = this.stageOrder[i];
      
      if (stage === this.currentStage) {
        elapsedTotal += Date.now() - this.stageStartTime;
        break;
      } else if (i < this.stageOrder.indexOf(this.currentStage)) {
        elapsedTotal += this.stageDurations[stage];
      }
    }
    
    return Math.min(elapsedTotal / totalDuration, 1);
  }
}
