import { Button, Typography, Stack, Paper, Box } from '@mui/material';
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
  const handleResume = () => {
    manager.popScene();
  };

  const handleRestart = () => {
    manager.changeScene('menu');
  };

  return (
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
        backdropFilter: 'blur(5px)',
      }}
    >
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
            }}
          >
            Settings
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
