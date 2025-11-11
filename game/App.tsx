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

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Game } from './Game';
import DemoIndex from './demos/DemoIndex';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/demos" element={<DemoIndex />} />
      </Routes>
    </BrowserRouter>
  );
}
