/**
 * CHEMICAL SDF INTEGRATION TESTS - Phase 0.1.5
 * 
 * Tests the complete chemistry-to-SDF pipeline.
 * Validates ChemicalSDFBuilder and integration with ECS entities.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { ChemicalSDFBuilder } from '../../../../engine/rendering/chemistry/ChemicalSDFBuilder';
import { SDFRenderer } from '../../../../engine/rendering/sdf/renderer/SDFRenderer';
import { validateSDFScene } from '../../../utils/sdf-test-helpers';
import type { Entity } from '../../../../engine/ecs/components/CoreComponents';

describe('Chemical SDF Integration', () => {
  describe('ChemicalSDFBuilder.buildSceneFromECS', () => {
    it('should convert simple chemical entity to SDF scene', () => {
      const entities: Entity[] = [
        {
          id: 'test-h2o',
          elementCounts: {
            H: 2,
            O: 1
          },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      validateSDFScene(scene);
      expect(scene.primitives.length).toBeGreaterThan(0);
    });
    
    it('should create primitives for each element', () => {
      const entities: Entity[] = [
        {
          id: 'test-molecule',
          elementCounts: {
            H: 2,
            O: 1,
            C: 1
          },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      expect(scene.primitives.length).toBe(3);
    });
    
    it('should use correct material IDs for elements', () => {
      const entities: Entity[] = [
        {
          id: 'test-h2',
          elementCounts: {
            H: 2
          },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      const materialIds = scene.primitives.map(p => p.materialId);
      expect(materialIds.every(id => id === 'element-h')).toBe(true);
    });
    
    it('should apply smooth union for molecular bonding', () => {
      const entities: Entity[] = [
        {
          id: 'test-molecule',
          elementCounts: {
            O: 1,
            H: 1
          },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      const hasSmoothUnion = scene.primitives.some(p => p.operation === 'smooth-union');
      expect(hasSmoothUnion).toBe(true);
    });
    
    it('should handle entities without element counts', () => {
      const entities: Entity[] = [
        {
          id: 'test-empty',
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      expect(scene.primitives).toHaveLength(0);
    });
    
    it('should handle entities without position', () => {
      const entities: Entity[] = [
        {
          id: 'test-no-pos',
          elementCounts: {
            H: 1
          }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      expect(scene.primitives).toHaveLength(0);
    });
  });
  
  describe('Pre-defined Test Scenes', () => {
    it('should create hydrogen molecule test scene', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.hydrogen;
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(2);
      expect(scene.primitives.every(p => p.materialId === 'element-h')).toBe(true);
    });
    
    it('should create oxygen molecule test scene', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.oxygen;
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(2);
      expect(scene.primitives.every(p => p.materialId === 'element-o')).toBe(true);
    });
    
    it('should create water molecule test scene', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.water;
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(3);
      
      const materials = scene.primitives.map(p => p.materialId);
      expect(materials.filter(m => m === 'element-o')).toHaveLength(1);
      expect(materials.filter(m => m === 'element-h')).toHaveLength(2);
    });
    
    it('should create benzene molecule test scene', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.benzene;
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(6);
      expect(scene.primitives.every(p => p.materialId === 'element-c')).toBe(true);
    });
    
    it('should create primitives showcase scene', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.primitives;
      
      validateSDFScene(scene);
      expect(scene.primitives.length).toBeGreaterThan(5);
    });
  });
  
  describe('Rendering Chemical Scenes', () => {
    it('should render hydrogen molecule', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.hydrogen;
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render water molecule', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.water;
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
    
    it('should render benzene ring', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.benzene;
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Molecular Geometry', () => {
    it('should position atoms correctly in benzene ring', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.benzene;
      
      const positions = scene.primitives.map(p => p.position);
      
      for (let i = 0; i < 6; i++) {
        const [x, y, z] = positions[i];
        const angle = (i / 6) * Math.PI * 2;
        const expectedX = Math.cos(angle) * 0.7;
        const expectedY = Math.sin(angle) * 0.7;
        
        expect(x).toBeCloseTo(expectedX, 1);
        expect(y).toBeCloseTo(expectedY, 1);
        expect(z).toBe(0);
      }
    });
    
    it('should maintain bond angle in water molecule', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.water;
      
      const oxygenPos = scene.primitives[0].position;
      const hydrogen1Pos = scene.primitives[1].position;
      const hydrogen2Pos = scene.primitives[2].position;
      
      expect(hydrogen1Pos[0]).toBeLessThan(oxygenPos[0]);
      expect(hydrogen2Pos[0]).toBeGreaterThan(oxygenPos[0]);
      expect(hydrogen1Pos[1]).toBeGreaterThan(oxygenPos[1]);
      expect(hydrogen2Pos[1]).toBeGreaterThan(oxygenPos[1]);
    });
  });
  
  describe('Element-Specific Rendering', () => {
    it('should use appropriate primitive types for different elements', () => {
      const entities: Entity[] = [
        {
          id: 'light-element',
          elementCounts: { H: 1 },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene1 = ChemicalSDFBuilder.buildSceneFromECS(entities);
      expect(scene1.primitives[0].type).toBe('sphere');
    });
    
    it('should scale atomic radii appropriately', () => {
      const entities: Entity[] = [
        {
          id: 'hydrogen',
          elementCounts: { H: 1 },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      const radius = scene.primitives[0].params[0];
      
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(1);
    });
  });
  
  describe('Multiple Entity Handling', () => {
    it('should handle multiple separate molecules', () => {
      const entities: Entity[] = [
        {
          id: 'molecule-1',
          elementCounts: { H: 1 },
          position: { x: -2, y: 0, z: 0 }
        },
        {
          id: 'molecule-2',
          elementCounts: { O: 1 },
          position: { x: 2, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      expect(scene.primitives.length).toBe(2);
    });
    
    it('should render multiple molecules simultaneously', () => {
      const entities: Entity[] = [
        {
          id: 'h2',
          elementCounts: { H: 1 },
          position: { x: -1, y: 0, z: 0 }
        },
        {
          id: 'o2',
          elementCounts: { O: 1 },
          position: { x: 1, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      const { container } = render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      expect(container).toBeTruthy();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty entity array', () => {
      const scene = ChemicalSDFBuilder.buildSceneFromECS([]);
      
      validateSDFScene(scene);
      expect(scene.primitives).toHaveLength(0);
    });
    
    it('should handle unknown element symbols gracefully', () => {
      const entities: Entity[] = [
        {
          id: 'unknown-element',
          elementCounts: { 'Xx': 1 },
          position: { x: 0, y: 0, z: 0 }
        }
      ];
      
      const scene = ChemicalSDFBuilder.buildSceneFromECS(entities);
      
      expect(scene.primitives).toHaveLength(0);
    });
  });
  
  describe('Integration with Material Registry', () => {
    it('should use materials from periodic table', () => {
      const testScenes = ChemicalSDFBuilder.createTestScenes();
      const scene = testScenes.water;
      
      const materialIds = scene.primitives.map(p => p.materialId);
      
      expect(materialIds).toContain('element-h');
      expect(materialIds).toContain('element-o');
    });
  });
});
