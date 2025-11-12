import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameShell } from './GameShell';
import { Suspense, lazy } from 'react';

const DemosIndex = lazy(() => import('./demos/DemosIndex'));
const BaseSDFProof = lazy(() => import('./demos/BaseSDFProof'));
const PrimitivesShowcase = lazy(() => import('./demos/PrimitivesShowcase'));
const MaterialsShowcase = lazy(() => import('./demos/MaterialsShowcase'));
const CoordinateTargetingDemo = lazy(() => import('./demos/CoordinateTargetingDemo'));
const ForeignBodyDemo = lazy(() => import('./demos/ForeignBodyDemo'));
const LightingDemo = lazy(() => import('./demos/LightingDemo'));
const UnifiedRenderingDemo = lazy(() => import('./demos/UnifiedRenderingDemo'));
const ECSIntegrationShowcase = lazy(() => import('./demos/ECSIntegrationShowcase'));

export function App() {
  const isDev = import.meta.env.MODE === 'development';
  
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {isDev && (
            <>
              <Route path="/demos" element={<DemosIndex />} />
              <Route path="/demos/base-sdf-proof" element={<BaseSDFProof />} />
              <Route path="/demos/primitives-showcase" element={<PrimitivesShowcase />} />
              <Route path="/demos/materials-showcase" element={<MaterialsShowcase />} />
              <Route path="/demos/coordinate-targeting" element={<CoordinateTargetingDemo />} />
              <Route path="/demos/foreign-body" element={<ForeignBodyDemo />} />
              <Route path="/demos/lighting" element={<LightingDemo />} />
              <Route path="/demos/unified-rendering" element={<UnifiedRenderingDemo />} />
              <Route path="/demos/ecs-integration" element={<ECSIntegrationShowcase />} />
            </>
          )}
          {!isDev && <Route path="/demos/*" element={<Navigate to="/" replace />} />}
          <Route path="*" element={<GameShell />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
