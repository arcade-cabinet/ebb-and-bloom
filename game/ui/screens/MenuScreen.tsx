/**
 * MENU SCREEN
 * 
 * Main menu with THREE-WORD SEED system (Daggerfall Unity style).
 * Player can shuffle or enter seed BEFORE starting new game.
 * Uses Material UI components aligned with DESIGN.md.
 */

import { useState, useEffect } from 'react';
import { Button, Typography, Stack, Paper, TextField, Box, IconButton } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { BaseScreen } from './BaseScreen';
import { useUIManager, ScreenType } from '../UIManager';
import { generateSeed, validateSeed } from '../../../engine/utils/seed/seed-manager';

export function MenuScreen() {
  const { setScreen } = useUIManager();
  const [seed, setSeed] = useState<string>('');
  const [seedValid, setSeedValid] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate random seed on mount
  useEffect(() => {
    setSeed(generateSeed());
  }, []);

  // Validate seed format
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
      // Store seed in sessionStorage for Game.tsx to use
      sessionStorage.setItem('worldSeed', seed);
      setScreen(ScreenType.GAME);
    }
  };

  return (
    <BaseScreen className="menu-screen">
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

        {/* Seed Input Section */}
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
              minHeight: 44, // Touch target: 44px minimum
              py: 1.5,
            }}
          >
            New Game
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setScreen(ScreenType.SETTINGS)}
            sx={{
              minHeight: 44, // Touch target: 44px minimum
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
