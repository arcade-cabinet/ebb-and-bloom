/**
 * PAUSE SCREEN
 * 
 * Pause menu (DFU DaggerfallPauseOptionsWindow pattern).
 * Uses Material UI components aligned with DESIGN.md.
 */

import { Button, Typography, Paper, Stack } from '@mui/material';
import { BaseScreen } from './BaseScreen';
import { useUIManager, ScreenType } from '../UIManager';

export function PauseScreen() {
  const { setScreen } = useUIManager();

  return (
    <BaseScreen className="pause-screen">
      <Paper
        elevation={8}
        sx={{
          p: 5,
          minWidth: { xs: '90%', sm: 300 },
          maxWidth: 400,
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Paused
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={() => setScreen(ScreenType.GAME)}
            sx={{
              minHeight: 44, // Touch target: 44px minimum
              py: 1.5,
            }}
          >
            Resume
          </Button>
          <Button
            variant="outlined"
            onClick={() => setScreen(ScreenType.SETTINGS)}
            sx={{
              minHeight: 44, // Touch target: 44px minimum
              py: 1.5,
            }}
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            onClick={() => setScreen(ScreenType.MENU)}
            sx={{
              minHeight: 44, // Touch target: 44px minimum
              py: 1.5,
            }}
          >
            Main Menu
          </Button>
        </Stack>
      </Paper>
    </BaseScreen>
  );
}

