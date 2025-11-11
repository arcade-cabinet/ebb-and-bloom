import { SceneOrchestrator } from './core/SceneOrchestrator';
import { RenderLayer } from './core/RenderLayer';
import { UIOverlay } from './ui/UIOverlay';

export function Game() {
  return (
    <SceneOrchestrator>
      <RenderLayer />
      <UIOverlay />
    </SceneOrchestrator>
  );
}
