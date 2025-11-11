import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameShell } from './GameShell';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<GameShell />} />
      </Routes>
    </BrowserRouter>
  );
}
