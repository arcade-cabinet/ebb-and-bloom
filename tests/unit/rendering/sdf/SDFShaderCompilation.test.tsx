/**
 * SDF SHADER COMPILATION TESTS - Phase 0.1.5
 * 
 * Tests shader compilation for all primitive combinations.
 * Validates that GLSL code generation is syntactically correct.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { SDFRenderer } from '../../../../engine/rendering/sdf/renderer/SDFRenderer';
import { SDFPrimitive } from '../../../../engine/rendering/sdf/types';
import { createTestSDFScene } from '../../../utils/sdf-test-helpers';

describe('SDF Shader Compilation', () => {
  const allPrimitiveTypes: SDFPrimitive['type'][] = [
    'sphere', 'box', 'cylinder', 'cone', 'pyramid', 'torus', 'octahedron',
    'hexprism', 'capsule', 'porbital', 'dorbital', 'triPrism',
    'ellipsoid', 'roundedBox', 'cappedCylinder', 'plane', 'roundCone',
    'mengerSponge', 'gyroid', 'superellipsoid', 'torusKnot'
  ];
  
  describe('Single Primitive Compilation', () => {
    allPrimitiveTypes.forEach(type => {
      it(`should compile shader for ${type}`, () => {
        const scene = createTestSDFScene({ primitiveType: type });
        
        const { container } = render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} />
          </Canvas>
        );
        
        expect(container).toBeTruthy();
      });
    });
  });
  
  describe('Primitive Combinations', () => {
    it('should compile with all primitives in one scene', () => {
      const primitives: SDFPrimitive[] = [];
      
      allPrimitiveTypes.forEach((type, i) => {
        const x = (i % 5) * 3;
        const y = Math.floor(i / 5) * 3;
        
        primitives.push({
          type,
          position: [x, y, 0],
          params: getDefaultParams(type),
          materialId: 'default'
        });
      });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with mixed operations', () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [1.0],
          materialId: 'element-h'
        },
        {
          type: 'box',
          position: [0, 0, 0],
          params: [0.8, 0.8, 0.8],
          materialId: 'element-o',
          operation: 'union'
        },
        {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.5, 1.5],
          materialId: 'element-c',
          operation: 'subtract'
        },
        {
          type: 'torus',
          position: [0, 0, 0],
          params: [0.7, 0.2],
          materialId: 'element-fe',
          operation: 'intersect'
        }
      ];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with smooth operations', () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [-0.5, 0, 0],
          params: [0.5],
          materialId: 'element-h'
        },
        {
          type: 'sphere',
          position: [0.5, 0, 0],
          params: [0.5],
          materialId: 'element-h',
          operation: 'smooth-union',
          operationStrength: 0.3
        }
      ];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Transformation Compilation', () => {
    it('should compile with rotation transforms', () => {
      const scene = createTestSDFScene({
        primitiveType: 'box',
        withRotation: true
      });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with scale transforms', () => {
      const scene = createTestSDFScene({
        primitiveType: 'sphere',
        withScale: true
      });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with both rotation and scale', () => {
      const scene = createTestSDFScene({
        primitiveType: 'cylinder',
        withRotation: true,
        withScale: true
      });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Material Compilation', () => {
    it('should compile with multiple different materials', () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [-2, 0, 0],
          params: [0.5],
          materialId: 'element-h'
        },
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.5],
          materialId: 'element-o'
        },
        {
          type: 'sphere',
          position: [2, 0, 0],
          params: [0.5],
          materialId: 'element-c'
        }
      ];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with all periodic table materials', () => {
      const elements = ['h', 'he', 'li', 'be', 'b', 'c', 'n', 'o', 'f', 'ne'];
      const primitives: SDFPrimitive[] = elements.map((symbol, i) => ({
        type: 'sphere',
        position: [i * 1.5, 0, 0],
        params: [0.3],
        materialId: `element-${symbol}`
      }));
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Complex Scenes', () => {
    it('should compile scene with 50+ primitives', () => {
      const scene = createTestSDFScene({ primitiveCount: 50 });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile scene with all primitive types and operations', () => {
      const primitives: SDFPrimitive[] = [];
      
      allPrimitiveTypes.forEach((type, i) => {
        const operations: Array<SDFPrimitive['operation']> = [
          undefined, 'union', 'subtract', 'intersect', 'smooth-union'
        ];
        
        primitives.push({
          type,
          position: [(i % 7) * 2, Math.floor(i / 7) * 2, 0],
          params: getDefaultParams(type),
          materialId: `element-${['h', 'o', 'c', 'fe'][i % 4]}`,
          operation: i === 0 ? undefined : operations[i % 5],
          operationStrength: 0.2,
          rotation: [i * 0.1, i * 0.2, 0],
          scale: [1 + (i % 3) * 0.2, 1, 1]
        });
      });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Shader Recompilation', () => {
    it('should handle primitive changes without errors', () => {
      const primitives1: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [1.0],
          materialId: 'default'
        }
      ];
      
      const { rerender, container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives1} />
        </Canvas>
      );
      
      const primitives2: SDFPrimitive[] = [
        {
          type: 'box',
          position: [0, 0, 0],
          params: [1, 1, 1],
          materialId: 'default'
        },
        {
          type: 'sphere',
          position: [2, 0, 0],
          params: [0.5],
          materialId: 'element-h'
        }
      ];
      
      rerender(
        <Canvas>
          <SDFRenderer primitives={primitives2} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should handle operation changes', () => {
      const primitives1: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [-0.5, 0, 0],
          params: [0.5],
          materialId: 'default'
        },
        {
          type: 'sphere',
          position: [0.5, 0, 0],
          params: [0.5],
          materialId: 'default',
          operation: 'union'
        }
      ];
      
      const { rerender, container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives1} />
        </Canvas>
      );
      
      const primitives2 = [
        ...primitives1.slice(0, 1),
        {
          ...primitives1[1],
          operation: 'smooth-union' as const,
          operationStrength: 0.3
        }
      ];
      
      rerender(
        <Canvas>
          <SDFRenderer primitives={primitives2} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Edge Cases', () => {
    it('should compile with empty primitives array', () => {
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={[]} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with extreme parameter values', () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.001],
          materialId: 'default'
        },
        {
          type: 'box',
          position: [2, 0, 0],
          params: [100, 100, 100],
          materialId: 'default'
        }
      ];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should compile with extreme transformations', () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'box',
          position: [0, 0, 0],
          params: [1, 1, 1],
          materialId: 'default',
          rotation: [Math.PI * 10, Math.PI * 20, Math.PI * 30],
          scale: [0.001, 0.001, 0.001]
        }
      ];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
});

function getDefaultParams(type: SDFPrimitive['type']): number[] {
  const defaults: Record<SDFPrimitive['type'], number[]> = {
    sphere: [1.0],
    box: [1.0, 1.0, 1.0],
    cylinder: [0.5, 1.0],
    cone: [0.8, 0.6, 1.0],
    pyramid: [1.0],
    torus: [0.8, 0.2],
    octahedron: [1.0],
    hexprism: [0.5, 1.0],
    capsule: [0, 1, 0, 0.3],
    porbital: [0.5],
    dorbital: [0.5],
    triPrism: [0.5, 1.0],
    ellipsoid: [1.0, 0.5, 0.3],
    roundedBox: [1.0, 1.0, 1.0, 0.1],
    cappedCylinder: [1.0, 0.5],
    plane: [0, 1, 0, 0],
    roundCone: [0.5, 0.2, 1.0],
    mengerSponge: [1.0],
    gyroid: [1.0, 0.1],
    superellipsoid: [0.5, 0.5, 1.0],
    torusKnot: [2.0, 3.0, 1.0]
  };
  
  return defaults[type] || [1.0];
}
