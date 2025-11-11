import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { CosmicExpansionFMV } from '../components/CosmicExpansionFMV';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/CosmicProvenanceTimeline';
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
  const { seed, genesisConstants, cosmicTimeline } = useGameState();
  
  // Genesis should already exist from GameplayScene initialization
  // If it doesn't exist yet, IntroScene will receive it from FMV completion
  
  const handleComplete = (constants: GenesisConstants) => {
    console.log('✅ Cosmic expansion visualization complete');
    
    // Store genesis/timeline if not already present
    // Note: FMV currently only provides genesis, timeline will be added in Phase 3
    if (!genesisConstants) {
      console.log('📝 Storing genesis constants from FMV');
      useGameState.setState({ genesisConstants: constants });
    }
    
    manager.changeScene('gameplay');
  };
  
  const handleSkip = () => {
    console.log('⏭️ Skipping intro visualization');
    manager.changeScene('gameplay');
  };
  
  return (
    <TransitionWrapper fadeIn duration={800} delay={0}>
      <CosmicExpansionFMV 
        seed={seed}
        onComplete={handleComplete}
        onSkip={handleSkip}
        autoPlay={true}
        enableAudio={true}
        enableHaptics={true}
        enableGyroscope={false}
      />
    </TransitionWrapper>
  );
}
