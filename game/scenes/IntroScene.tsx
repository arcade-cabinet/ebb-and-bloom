import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { CosmicExpansionFMV } from '../components/CosmicExpansionFMV';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { useGameState } from '../state/GameState';

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
  const [showSkip, setShowSkip] = useState(true);
  
  const handleComplete = (_constants: GenesisConstants) => {
    console.log('Cosmic expansion complete, transitioning to gameplay');
    manager.changeScene('gameplay');
  };
  
  const handleSkip = () => {
    manager.changeScene('gameplay');
  };
  
  return (
    <Box sx={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000',
      position: 'relative' 
    }}>
      <CosmicExpansionFMV 
        seed={currentSeed}
        onComplete={handleComplete}
        autoPlay={true}
      />
      
      {showSkip && (
        <Button
          variant="outlined"
          onClick={handleSkip}
          onMouseEnter={() => setShowSkip(true)}
          sx={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Skip Intro
        </Button>
      )}
    </Box>
  );
}
