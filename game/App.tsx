import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameShell } from './GameShell';
import React, { Suspense, lazy } from 'react';

const BaseSDFProof = lazy(() => import('./demos/BaseSDFProof'));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/demos/proof" element={<BaseSDFProof />} />
          <Route path="*" element={<GameShell />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
