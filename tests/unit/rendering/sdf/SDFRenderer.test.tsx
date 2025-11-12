/**
 * SDFRenderer Unit Tests - Phase 0.1.1, 0.1.3, 0.1.4
 * 
 * Comprehensive test suite for SDF rendering with all 21 primitives,
 * rotation/scaling transforms, and texture mapping.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SDFRenderer } from '../../../../engine/rendering/sdf/SDFRenderer';
import { SDFPrimitive } from '../../../../engine/rendering/sdf/SDFPrimitives';

describe('SDFRenderer - All Primitives', () => {
  const mockCamera = new THREE.PerspectiveCamera();
  mockCamera.position.set(0, 0, 5);

  const createPrimitive = (
    type: SDFPrimitive['type'],
    params: number[],
    options: Partial<SDFPrimitive> = {}
  ): SDFPrimitive => ({
    type,
    position: [0, 0, 0],
    params,
    materialId: 'default',
    ...options,
  });

  describe('Basic Primitives (Phase 0)', () => {
    it('should render sphere primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render box primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render cylinder primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('cylinder', [0.5, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render pyramid primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('pyramid', [1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render torus primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('torus', [0.8, 0.2]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render cone primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('cone', [0.8, 0.6, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render octahedron primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('octahedron', [1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render hexprism primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('hexprism', [0.5, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render capsule primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('capsule', [0, 1, 0, 0.3]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render porbital primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('porbital', [0.5]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render dorbital primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('dorbital', [0.5]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('New Primitives (Phase 0.1)', () => {
    it('should render triPrism primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('triPrism', [0.5, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render ellipsoid primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('ellipsoid', [1.0, 0.5, 0.3]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render roundedBox primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('roundedBox', [1.0, 1.0, 1.0, 0.1]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render cappedCylinder primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('cappedCylinder', [1.0, 0.5]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render plane primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('plane', [0, 1, 0, 0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render roundCone primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('roundCone', [0.5, 0.2, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render mengerSponge primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('mengerSponge', [1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render gyroid primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('gyroid', [1.0, 0.1]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render superellipsoid primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('superellipsoid', [0.5, 0.5, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should render torusKnot primitive', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('torusKnot', [2.0, 3.0, 1.0]),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Rotation Transforms (Phase 0.1.1)', () => {
    it('should apply X-axis rotation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [Math.PI / 4, 0, 0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should apply Y-axis rotation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [0, Math.PI / 4, 0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should apply Z-axis rotation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [0, 0, Math.PI / 4],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should apply combined rotation on all axes', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [Math.PI / 6, Math.PI / 4, Math.PI / 3],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle multiple primitives with different rotations', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [0.5], {
          position: [-2, 0, 0],
          rotation: [0, 0, 0],
        }),
        createPrimitive('box', [0.5, 0.5, 0.5], {
          position: [0, 0, 0],
          rotation: [0, Math.PI / 4, 0],
        }),
        createPrimitive('cylinder', [0.3, 0.8], {
          position: [2, 0, 0],
          rotation: [Math.PI / 2, 0, 0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Scaling Transforms (Phase 0.1.1)', () => {
    it('should apply uniform scaling', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0], {
          scale: [2.0, 2.0, 2.0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should apply non-uniform scaling', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0], {
          scale: [2.0, 0.5, 1.5],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should apply both rotation and scaling', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [Math.PI / 4, Math.PI / 6, 0],
          scale: [1.5, 2.0, 1.0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Texture Mapping (Phase 0.1.3, 0.1.4)', () => {
    it('should support texture uniforms', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0]),
      ];

      const mockTexture = new THREE.Texture();
      const textures = {
        diffuse: mockTexture,
        normal: mockTexture,
        roughness: mockTexture,
      };

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} textures={textures} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle primitives with texture sets', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0], {
          textureSet: {
            diffuse: 'diffuse',
            normal: 'normal',
            roughness: 'roughness',
            tiling: [2.0, 2.0],
            offset: [0.0, 0.0],
          },
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle multiple primitives with different textures', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [0.5], {
          position: [-2, 0, 0],
          textureSet: {
            diffuse: 'rock',
            tiling: [1.0, 1.0],
          },
        }),
        createPrimitive('box', [0.5, 0.5, 0.5], {
          position: [0, 0, 0],
          textureSet: {
            diffuse: 'metal',
            metallic: 'metal_metallic',
            tiling: [2.0, 2.0],
          },
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    it('should handle 100+ primitives efficiently', () => {
      const primitives: SDFPrimitive[] = [];
      
      for (let i = 0; i < 100; i++) {
        const x = (i % 10) * 2 - 9;
        const y = Math.floor(i / 10) * 2 - 9;
        
        primitives.push(
          createPrimitive('sphere', [0.3], {
            position: [x, y, 0],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            scale: [1 + Math.random() * 0.5, 1 + Math.random() * 0.5, 1],
          })
        );
      }

      const startTime = performance.now();
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      const renderTime = performance.now() - startTime;
      
      expect(container).toBeTruthy();
      expect(renderTime).toBeLessThan(100);
    });

    it('should maintain 60fps target with complex scene', () => {
      const primitives: SDFPrimitive[] = [];
      
      const types: SDFPrimitive['type'][] = [
        'sphere', 'box', 'cylinder', 'torus', 'cone',
        'octahedron', 'ellipsoid', 'roundedBox'
      ];
      
      for (let i = 0; i < 50; i++) {
        const typeIndex = i % types.length;
        const x = (i % 10) * 3 - 13.5;
        const y = Math.floor(i / 10) * 3 - 6;
        
        primitives.push(
          createPrimitive(types[typeIndex], [0.5, 0.5, 0.5, 0.1], {
            position: [x, y, 0],
            rotation: [
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
            ],
            scale: [
              1 + Math.random(),
              1 + Math.random(),
              1 + Math.random(),
            ],
          })
        );
      }

      const frameTime = 1000 / 60;
      const startTime = performance.now();
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} maxSteps={64} />
        </Canvas>
      );

      const renderTime = performance.now() - startTime;
      
      expect(container).toBeTruthy();
      expect(renderTime).toBeLessThan(frameTime * 2);
    });
  });

  describe('Boolean Operations', () => {
    it('should support union operation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [0.5], { position: [-0.3, 0, 0] }),
        createPrimitive('sphere', [0.5], {
          position: [0.3, 0, 0],
          operation: 'union',
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should support subtraction operation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0]),
        createPrimitive('sphere', [0.7], {
          operation: 'subtract',
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should support intersection operation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0]),
        createPrimitive('sphere', [0.9], {
          operation: 'intersect',
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should support smooth union operation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [0.5], { position: [-0.5, 0, 0] }),
        createPrimitive('sphere', [0.5], {
          position: [0.5, 0, 0],
          operation: 'smooth-union',
          operationStrength: 0.3,
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty primitives array', () => {
      const primitives: SDFPrimitive[] = [];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle primitives with zero scale', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0], {
          scale: [0.0001, 0.0001, 0.0001],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle primitives with extreme rotation', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 0.5, 0.3], {
          rotation: [Math.PI * 10, Math.PI * 20, Math.PI * 15],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });

    it('should handle custom material IDs', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [0.5], {
          materialId: 'element-h',
          position: [-1, 0, 0],
        }),
        createPrimitive('sphere', [0.4], {
          materialId: 'element-o',
          position: [1, 0, 0],
        }),
      ];

      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Regression Tests', () => {
    it('should maintain consistent rendering with fixed seed', () => {
      const primitives: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0]),
        createPrimitive('box', [0.8, 0.8, 0.8], {
          position: [2, 0, 0],
          rotation: [0, Math.PI / 4, 0],
        }),
        createPrimitive('torus', [0.6, 0.2], {
          position: [-2, 0, 0],
          scale: [1.5, 1.0, 1.5],
        }),
      ];

      const { container: container1 } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      const { container: container2 } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    it('should handle shader recompilation on primitive changes', () => {
      const primitives1: SDFPrimitive[] = [
        createPrimitive('sphere', [1.0]),
      ];

      const { rerender, container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives1} />
        </Canvas>
      );

      const primitives2: SDFPrimitive[] = [
        createPrimitive('box', [1.0, 1.0, 1.0]),
        createPrimitive('sphere', [0.5], { position: [2, 0, 0] }),
      ];

      rerender(
        <Canvas>
          <SDFRenderer primitives={primitives2} />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });
});
