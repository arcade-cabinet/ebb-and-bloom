import { BaseScene } from './BaseScene';

type SceneConstructor = new (manager: SceneManager) => BaseScene;

export interface TransitionState {
  isTransitioning: boolean;
  fadeProgress: number;
  loadingMessage: string;
}

export class SceneManager {
  private static instance: SceneManager | null = null;
  
  private sceneStack: BaseScene[] = [];
  private registeredScenes: Map<string, SceneConstructor> = new Map();
  private isTransitioning = false;
  private transitionState: TransitionState = {
    isTransitioning: false,
    fadeProgress: 0,
    loadingMessage: '',
  };
  private transitionListeners: Set<() => void> = new Set();
  
  private constructor() {}
  
  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }
  
  onTransitionStateChange(listener: () => void): () => void {
    this.transitionListeners.add(listener);
    return () => this.transitionListeners.delete(listener);
  }
  
  getTransitionState(): TransitionState {
    return { ...this.transitionState };
  }
  
  private notifyTransitionListeners(): void {
    this.transitionListeners.forEach(listener => listener());
  }
  
  private async fadeOut(duration: number): Promise<void> {
    this.transitionState.fadeProgress = 0;
    this.notifyTransitionListeners();
    
    const startTime = Date.now();
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.transitionState.fadeProgress = progress;
        this.notifyTransitionListeners();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private async fadeIn(duration: number): Promise<void> {
    this.transitionState.fadeProgress = 1;
    this.notifyTransitionListeners();
    
    const startTime = Date.now();
    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.transitionState.fadeProgress = 1 - progress;
        this.notifyTransitionListeners();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.transitionState.fadeProgress = 0;
          this.notifyTransitionListeners();
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  
  private setLoadingMessage(message: string): void {
    this.transitionState.loadingMessage = message;
    this.transitionState.isTransitioning = message !== '';
    this.notifyTransitionListeners();
  }
  
  registerScene(name: string, sceneClass: SceneConstructor): void {
    this.registeredScenes.set(name, sceneClass);
  }
  
  async transitionTo(sceneName: string, options?: { duration?: number; loadingMessage?: string }): Promise<void> {
    const duration = options?.duration || 500;
    const loadingMessage = options?.loadingMessage || '';
    
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      await this.fadeOut(duration / 2);
      
      if (loadingMessage) {
        this.setLoadingMessage(loadingMessage);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (this.sceneStack.length > 0) {
        const currentScene = this.sceneStack[this.sceneStack.length - 1];
        await currentScene.exit();
      }
      
      this.sceneStack = [];
      
      const SceneClass = this.registeredScenes.get(sceneName);
      if (!SceneClass) {
        throw new Error(`Scene "${sceneName}" not registered`);
      }
      
      const newScene = new SceneClass(this);
      await newScene.enter();
      
      this.sceneStack.push(newScene);
      
      if (loadingMessage) {
        this.setLoadingMessage('');
      }
      
      await this.fadeIn(duration / 2);
    } finally {
      this.isTransitioning = false;
    }
  }
  
  async changeScene(sceneName: string, loadingMessage?: string): Promise<void> {
    const message = loadingMessage || this.getLoadingMessageForTransition(sceneName);
    await this.transitionTo(sceneName, { loadingMessage: message });
  }
  
  private getLoadingMessageForTransition(sceneName: string): string {
    const messages: Record<string, string> = {
      intro: 'Initializing Cosmic Timeline...',
      gameplay: 'Preparing World...',
      menu: '',
      pause: '',
    };
    return messages[sceneName] || '';
  }
  
  async pushScene(sceneName: string): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      const SceneClass = this.registeredScenes.get(sceneName);
      if (!SceneClass) {
        throw new Error(`Scene "${sceneName}" not registered`);
      }
      
      const newScene = new SceneClass(this);
      await newScene.enter();
      
      this.sceneStack.push(newScene);
    } finally {
      this.isTransitioning = false;
    }
  }
  
  async popScene(): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }
    
    if (this.sceneStack.length <= 1) {
      console.warn('Cannot pop last scene');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
      const currentScene = this.sceneStack.pop();
      if (currentScene) {
        await currentScene.exit();
      }
    } finally {
      this.isTransitioning = false;
    }
  }
  
  getCurrentScene(): BaseScene | null {
    return this.sceneStack.length > 0 
      ? this.sceneStack[this.sceneStack.length - 1]
      : null;
  }
  
  getSceneStack(): BaseScene[] {
    return [...this.sceneStack];
  }
  
  update(deltaTime: number): void {
    if (this.sceneStack.length > 0) {
      const currentScene = this.sceneStack[this.sceneStack.length - 1];
      currentScene.update(deltaTime);
    }
  }
  
  getScenes(): BaseScene[] {
    return [...this.sceneStack];
  }
}
