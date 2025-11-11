import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { gameTheme } from './ui/theme';
import { SceneOrchestrator } from './core/SceneOrchestrator';
import { RenderLayer } from './core/RenderLayer';
import { UIOverlay } from './ui/UIOverlay';

export function GameShell() {
  return (
    <ThemeProvider theme={gameTheme}>
      <CssBaseline />
      <SceneOrchestrator>
        <RenderLayer />
        <UIOverlay />
      </SceneOrchestrator>
    </ThemeProvider>
  );
}
