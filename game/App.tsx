/**
 * APP COMPONENT
 * 
 * Main application with React Router.
 * Routes:
 * - / -> redirects to /demos
 * - /demos -> DemoIndex
 * - /demos/:demoId -> Individual demos
 * - /game -> Original game (with warning banner)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Game } from './Game';
import DemoIndex from './demos/DemoIndex';
import { Box, Alert, AlertTitle } from '@mui/material';

function GameWithWarning() {
  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Alert 
        severity="info" 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderRadius: 0
        }}
      >
        <AlertTitle>Note</AlertTitle>
        Demos are the recommended entry point. <a href="/demos" style={{ color: 'inherit', textDecoration: 'underline' }}>View Demos</a>
      </Alert>
      <Box sx={{ position: 'absolute', top: '64px', left: 0, right: 0, bottom: 0 }}>
        <Game />
      </Box>
    </Box>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/demos" replace />} />
        <Route path="/demos" element={<DemoIndex />} />
        <Route path="/game" element={<GameWithWarning />} />
      </Routes>
    </BrowserRouter>
  );
}
