import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { IconicIntro } from '../components/fmv/IconicIntro';
import { useGameState } from '../state/GameState';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { RenderResourceManager } from '../core/RenderResourceManager';

export class IntroScene extends BaseScene {
  private manager: SceneManager;
  private sceneId: string;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
    this.sceneId = `intro-${Date.now()}`;
  }
  
  async enter(): Promise<void> {
    console.log('IntroScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('IntroScene: Exiting');
  }
  
  async dispose(): Promise<void> {
    console.log('IntroScene: Disposing Three.js resources');
    
    const resourceManager = RenderResourceManager.getInstance();
    resourceManager.disposeScene(this.sceneId);
    
    console.log('IntroScene: Disposal complete');
  }
  
  update(_deltaTime: number): void {
  }
  
  render(): React.ReactNode {
    return <IntroSceneComponent manager={this.manager} />;
  }
}

interface IntroSceneComponentProps {
  manager: SceneManager;
}

function IntroSceneComponent({ manager }: IntroSceneComponentProps) {
  const handleComplete = () => {
    console.log('✅ Iconic FMV intro complete');
    manager.changeScene('gameplay');
  };
  
  return (
    <TransitionWrapper fadeIn duration={800} delay={0}>
      <IconicIntro 
        onComplete={handleComplete}
        skipIntro={false}
      />
    </TransitionWrapper>
  );
}
