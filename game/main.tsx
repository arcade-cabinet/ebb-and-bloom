/**
 * EBB & BLOOM - GAME
 * 
 * Uses ONLY the engine API (WorldManager).
 * Clean separation from engine internals.
 * 
 * Based on Daggerfall Unity architecture but using governors + synthesis.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { gameTheme } from './ui/theme';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={gameTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

