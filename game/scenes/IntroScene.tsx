import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { CosmicExpansionFMV } from '../components/CosmicExpansionFMV';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { useGameState } from '../state/GameState';
import { TransitionWrapper } from '../ui/TransitionWrapper';

export class IntroScene extends BaseScene {
  private manager: SceneManager;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
  }
  
  async enter(): Promise<void> {
    console.log('IntroScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('IntroScene: Exiting');
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
  const { currentSeed } = useGameState();
  
  const handleComplete = (_constants: GenesisConstants) => {
    console.log('Cosmic expansion complete, transitioning to gameplay');
    manager.changeScene('gameplay');
  };
  
  const handleSkip = () => {
    console.log('Skipping intro, transitioning to gameplay');
    manager.changeScene('gameplay');
  };
  
  return (
    <TransitionWrapper fadeIn duration={800} delay={0}>
      <CosmicExpansionFMV 
        seed={currentSeed}
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
