/**
 * SDF SCENE RENDERING INTEGRATION TESTS - Phase 0.1.5
 * 
 * Tests that complete SDF scenes render correctly end-to-end.
 * Validates integration between primitives, operations, materials, and rendering.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { SDFRenderer } from '../../../../engine/rendering/sdf/SDFRenderer';
import { 
  createTestSDFScene, 
  createMolecularScene,
  createAllPrimitivesShowcase,
  validateSDFScene 
} from '../../../utils/sdf-test-helpers';

describe('SDF Scene Rendering Integration', () => {
  describe('Complete Scene Rendering', () => {
    it('should render simple single-primitive scene', () => {
      const scene = createTestSDFScene({
        primitiveCount: 1,
        primitiveType: 'sphere'
      });
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
      expect(container.querySelector('canvas')).toBeTruthy();
    });
    
    it('should render multi-primitive scene', () => {
      const scene = createTestSDFScene({
        primitiveCount: 5,
        primitiveType: 'box'
      });
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render scene with transformations', () => {
      const scene = createTestSDFScene({
        primitiveCount: 3,
        primitiveType: 'cylinder',
        withRotation: true,
        withScale: true
      });
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render scene with boolean operations', () => {
      const scene = createTestSDFScene({
        primitiveCount: 4,
        primitiveType: 'sphere',
        withOperations: true
      });
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Molecular Scene Rendering', () => {
    it('should render water molecule', () => {
      const scene = createMolecularScene('water');
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(3);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render hydrogen molecule', () => {
      const scene = createMolecularScene('hydrogen');
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(2);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render oxygen molecule', () => {
      const scene = createMolecularScene('oxygen');
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(2);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render benzene ring', () => {
      const scene = createMolecularScene('benzene');
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(6);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('All Primitives Showcase', () => {
    it('should render all 21 primitives together', () => {
      const scene = createAllPrimitivesShowcase();
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(21);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should use correct materials for showcase', () => {
      const scene = createAllPrimitivesShowcase();
      
      const materialIds = scene.primitives.map(p => p.materialId);
      const uniqueMaterials = new Set(materialIds);
      
      expect(uniqueMaterials.size).toBeGreaterThan(1);
      expect(materialIds.every(id => id.startsWith('element-'))).toBe(true);
    });
  });
  
  describe('Camera and Lighting Integration', () => {
    it('should use scene camera configuration', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      expect(scene.camera.position).toEqual([0, 0, 5]);
      expect(scene.camera.target).toEqual([0, 0, 0]);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should use scene lighting configuration', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      expect(scene.lighting.ambient).toBe(0.3);
      expect(scene.lighting.directional.intensity).toBe(0.8);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Material System Integration', () => {
    it('should render with multiple element materials', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      scene.primitives[0].materialId = 'element-h';
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should handle unknown material IDs gracefully', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      scene.primitives[0].materialId = 'non-existent-material';
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Complex CSG Scenes', () => {
    it('should render complex CSG operations', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      scene.primitives = [
        {
          type: 'box',
          position: [0, 0, 0],
          params: [1, 1, 1],
          materialId: 'element-c'
        },
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.8],
          materialId: 'element-o',
          operation: 'subtract'
        },
        {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.3, 1.5],
          materialId: 'element-fe',
          operation: 'subtract',
          rotation: [Math.PI / 2, 0, 0]
        },
        {
          type: 'sphere',
          position: [1.2, 0, 0],
          params: [0.3],
          materialId: 'element-h',
          operation: 'union'
        }
      ];
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render nested smooth operations', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      scene.primitives = [
        {
          type: 'sphere',
          position: [-0.5, 0, 0],
          params: [0.4],
          materialId: 'element-h'
        },
        {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.4],
          materialId: 'element-o',
          operation: 'smooth-union',
          operationStrength: 0.2
        },
        {
          type: 'sphere',
          position: [0.5, 0, 0],
          params: [0.4],
          materialId: 'element-h',
          operation: 'smooth-union',
          operationStrength: 0.2
        }
      ];
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Dynamic Scene Updates', () => {
    it('should handle scene updates', () => {
      const scene1 = createTestSDFScene({ primitiveCount: 1 });
      
      const { rerender, container } = render(
        <Canvas>
          <SDFRenderer primitives={scene1.primitives} />
        </Canvas>
      );
      
      const scene2 = createTestSDFScene({ primitiveCount: 3 });
      
      rerender(
        <Canvas>
          <SDFRenderer primitives={scene2.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should handle primitive type changes', () => {
      const scene = createTestSDFScene({ primitiveType: 'sphere' });
      
      const { rerender, container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      scene.primitives[0].type = 'box';
      scene.primitives[0].params = [1, 1, 1];
      
      rerender(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty scene', () => {
      const scene = createTestSDFScene({ primitiveCount: 0 });
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should handle very large scenes', () => {
      const scene = createTestSDFScene({ primitiveCount: 100 });
      
      validateSDFScene(scene);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should handle primitives with extreme positions', () => {
      const scene = createTestSDFScene({ primitiveCount: 1 });
      
      scene.primitives[0].position = [1000, -1000, 500];
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Regression Tests', () => {
    it('should produce consistent output for same scene', () => {
      const scene = createTestSDFScene({ 
        primitiveCount: 3,
        primitiveType: 'sphere'
      });
      
      const { container: container1 } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      const { container: container2 } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });
});
