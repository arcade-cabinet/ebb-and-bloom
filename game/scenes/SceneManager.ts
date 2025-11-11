import { BaseScene } from './BaseScene';

type SceneConstructor = new (manager: SceneManager) => BaseScene;

export class SceneManager {
  private static instance: SceneManager | null = null;
  
  private sceneStack: BaseScene[] = [];
  private registeredScenes: Map<string, SceneConstructor> = new Map();
  private isTransitioning = false;
  
  private constructor() {}
  
  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }
  
  registerScene(name: string, sceneClass: SceneConstructor): void {
    this.registeredScenes.set(name, sceneClass);
  }
  
  async changeScene(sceneName: string): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }
    
    this.isTransitioning = true;
    
    try {
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
    } finally {
      this.isTransitioning = false;
    }
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
