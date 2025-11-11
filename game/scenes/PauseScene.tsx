import { useState, useEffect } from 'react';
import { Button, Typography, Stack, Paper, Box } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';

export class PauseScene extends BaseScene {
  private manager: SceneManager;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
  }
  
  async enter(): Promise<void> {
    console.log('PauseScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('PauseScene: Exiting');
  }
  
  async dispose(): Promise<void> {
    console.log('PauseScene: Disposing (no Three.js resources)');
  }
  
  update(_deltaTime: number): void {
  }
  
  render(): React.ReactNode {
    return <PauseSceneComponent manager={this.manager} />;
  }
}

interface PauseSceneComponentProps {
  manager: SceneManager;
}

function PauseSceneComponent({ manager }: PauseSceneComponentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeStyle = useSpring({
    opacity: isVisible ? 1 : 0,
    backdropFilter: isVisible ? 'blur(8px)' : 'blur(0px)',
    config: { duration: 300 },
  });

  const slideStyle = useSpring({
    transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(-50px) scale(0.9)',
    opacity: isVisible ? 1 : 0,
    config: { tension: 200, friction: 20 },
  });

  const handleResume = async () => {
    setIsVisible(false);
    setTimeout(() => {
      manager.popScene();
    }, 300);
  };

  const handleRestart = () => {
    manager.changeScene('menu');
  };

  return (
    <animated.div style={fadeStyle}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <animated.div style={slideStyle}>
          <Paper
            elevation={8}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              minWidth: { xs: '90%', sm: 400 },
              maxWidth: 500,
            }}
          >
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 4,
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Paused
        </Typography>

        <Stack spacing={2.5} alignItems="stretch">
          <Button
            variant="contained"
            size="large"
            onClick={handleResume}
            sx={{
              minHeight: 44,
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            Resume
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleRestart}
            sx={{
              minHeight: 44,
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            Restart
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              minHeight: 44,
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            Settings
          </Button>
        </Stack>
          </Paper>
        </animated.div>
      </Box>
    </animated.div>
  );
}
