/**
 * Responsive Scene Hook - React Three Fiber responsive design
 * Adapts camera, viewport, and object scales based on platform and screen size
 * Based on Grok conversation recommendations
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { useEvolutionDataStore } from '../stores/EvolutionDataStore';
import { log } from '../utils/Logger';

/**
 * Hook for responsive 3D scene adaptation
 * Adjusts camera FOV, aspect ratio, and object scales based on platform/screen
 */
export function useResponsiveScene() {
  const { size, viewport, camera, scene } = useThree();
  const { screen, isMobile } = useEvolutionDataStore((state) => ({
    screen: state.platform.screen,
    isMobile: state.platform.isMobile,
  }));

  useEffect(() => {
    // Adjust camera for aspect ratio and platform
    const aspect = size.width / size.height;

    if (camera instanceof PerspectiveCamera) {
      // Wider FOV on mobile for immersion, narrower on desktop for detail
      const fov = isMobile ? 75 : 50;
      camera.fov = fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      log.debug('Camera adjusted for responsive scene', { fov, aspect, isMobile });
    }

    // Scale 3D objects to fit viewport (smaller on tiny screens)
    const scale = viewport.width < 1 ? 0.5 : 1;
    scene.children.forEach((child) => {
      if (child.userData.responsive) {
        child.scale.setScalar(scale);
      }
    });
  }, [size, viewport, camera, scene, isMobile, screen]);

  return {
    size,
    viewport,
    camera,
    isMobile,
    aspectRatio: screen.aspectRatio,
  };
}

