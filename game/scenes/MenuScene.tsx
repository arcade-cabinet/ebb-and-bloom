import { useState, useEffect } from 'react';
import { Button, Typography, Stack, Paper, TextField, Box, IconButton } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { BaseScreen } from '../ui/screens/BaseScreen';
import { generateSeed, validateSeed } from '../../engine/utils/seed/seed-manager';
import { useGameState } from '../state/GameState';

export class MenuScene extends BaseScene {
  private manager: SceneManager;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
  }
  
  async enter(): Promise<void> {
    console.log('MenuScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('MenuScene: Exiting');
  }
  
  update(_deltaTime: number): void {
  }
  
  render(): React.ReactNode {
    return <MenuSceneComponent manager={this.manager} />;
  }
}

interface MenuSceneComponentProps {
  manager: SceneManager;
}

function MenuSceneComponent({ manager }: MenuSceneComponentProps) {
  const { setCurrentSeed } = useGameState();
  const [seed, setSeed] = useState<string>('');
  const [seedValid, setSeedValid] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeed(generateSeed());
  }, []);

  useEffect(() => {
    if (seed) {
      const validation = validateSeed(seed);
      setSeedValid(validation.valid);
    }
  }, [seed]);

  const handleShuffle = () => {
    setSeed(generateSeed());
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(seed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy seed:', err);
    }
  };

  const handleNewGame = () => {
    if (seedValid) {
      setCurrentSeed(seed);
      manager.changeScene('intro');
    }
  };

  return (
    <BaseScreen className="menu-scene">
      <Paper
        elevation={8}
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: 'background.paper',
          minWidth: { xs: '90%', sm: 500 },
          maxWidth: 600,
        }}
      >
        <Typography 
          variant="h1" 
          sx={{ 
            mb: 2,
            fontFamily: '"Playfair Display", serif',
            background: 'linear-gradient(135deg, #38A169 0%, #D69E2E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Ebb & Bloom
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 4,
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          Shape Worlds. Traits Echo. Legacy Endures.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5,
              color: 'text.secondary',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            World Seed
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="v1-word-word-word"
              error={!seedValid}
              helperText={seedValid ? 'Three-word seed determines your world' : 'Invalid seed format'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '14px',
                },
              }}
            />
            <IconButton
              onClick={handleShuffle}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(56, 161, 105, 0.1)',
                },
              }}
              title="Shuffle seed"
            >
              <ShuffleIcon />
            </IconButton>
            <IconButton
              onClick={handleCopy}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(160, 174, 192, 0.1)',
                },
              }}
              title="Copy seed"
            >
              {copied ? <CheckIcon sx={{ color: 'success.main' }} /> : <ContentCopyIcon />}
            </IconButton>
          </Stack>
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1,
              color: 'text.secondary',
              display: 'block',
            }}
          >
            Same seed = same world. Share seeds with friends!
          </Typography>
        </Box>

        <Stack spacing={2.5} alignItems="stretch">
          <Button
            variant="contained"
            size="large"
            onClick={handleNewGame}
            disabled={!seedValid}
            sx={{
              minHeight: 44,
              py: 1.5,
            }}
          >
            New Game
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
    </BaseScreen>
  );
}
