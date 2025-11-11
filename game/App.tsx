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
import Demo01_MolecularSynthesis from './demos/Demo01_MolecularSynthesis';
import Demo02_CompositeBuilder from './demos/Demo02_CompositeBuilder';
import Demo03_EvolutionChain from './demos/Demo03_EvolutionChain';
import Demo04_SettlementProgression from './demos/Demo04_SettlementProgression';
import Demo05_GovernorDecisions from './demos/Demo05_GovernorDecisions';
import Demo06_YukaFeedbackLoop from './demos/Demo06_YukaFeedbackLoop';
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
        <Route path="/demos/01" element={<Demo01_MolecularSynthesis />} />
        <Route path="/demos/02" element={<Demo02_CompositeBuilder />} />
        <Route path="/demos/03" element={<Demo03_EvolutionChain />} />
        <Route path="/demos/04" element={<Demo04_SettlementProgression />} />
        <Route path="/demos/05" element={<Demo05_GovernorDecisions />} />
        <Route path="/demos/06" element={<Demo06_YukaFeedbackLoop />} />
        <Route path="/game" element={<GameWithWarning />} />
      </Routes>
    </BrowserRouter>
  );
}
