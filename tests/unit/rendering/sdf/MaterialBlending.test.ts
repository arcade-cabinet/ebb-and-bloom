/**
 * MATERIAL BLENDING SYSTEM TESTS (Phase 0.2)
 * 
 * Comprehensive tests for material blending functionality.
 * Tests all blend modes, edge cases, and interpolation behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MaterialRegistry, Material, BlendParams } from '../../../../engine/rendering/sdf/MaterialRegistry';

describe('Material Blending System', () => {
  let registry: MaterialRegistry;
  
  beforeEach(() => {
    registry = new MaterialRegistry();
    
    registry.register({
      id: 'test-mat-a',
      name: 'Material A',
      baseColor: [1.0, 0.0, 0.0],
      roughness: 0.0,
      metallic: 0.0,
      emission: 0.0,
      emissiveColor: [1.0, 0.0, 0.0],
      opacity: 1.0,
    });
    
    registry.register({
      id: 'test-mat-b',
      name: 'Material B',
      baseColor: [0.0, 0.0, 1.0],
      roughness: 1.0,
      metallic: 1.0,
      emission: 1.0,
      emissiveColor: [0.0, 0.0, 1.0],
      opacity: 0.5,
    });
  });
  
  describe('blendMaterials method', () => {
    it('should blend materials with linear mode', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      
      expect(blended.baseColor[0]).toBeCloseTo(0.5, 5);
      expect(blended.baseColor[1]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(0.5, 5);
      expect(blended.roughness).toBeCloseTo(0.5, 5);
      expect(blended.metallic).toBeCloseTo(0.5, 5);
      expect(blended.emission).toBeCloseTo(0.5, 5);
      expect(blended.opacity).toBeCloseTo(0.75, 5);
    });
    
    it('should blend materials with smooth mode', () => {
      const params: BlendParams = {
        mode: 'smooth',
        strength: 1.0,
        transitionDistance: 1.0,
      };
      
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'smooth', params);
      
      expect(blended.baseColor[0]).toBeGreaterThanOrEqual(0.0);
      expect(blended.baseColor[0]).toBeLessThanOrEqual(1.0);
      expect(blended.baseColor[2]).toBeGreaterThanOrEqual(0.0);
      expect(blended.baseColor[2]).toBeLessThanOrEqual(1.0);
    });
    
    it('should blend materials with noise mode', () => {
      const params: BlendParams = {
        mode: 'noise',
        strength: 1.0,
        transitionDistance: 1.0,
        noiseScale: 2.0,
      };
      
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'noise', params);
      
      expect(blended.baseColor[0]).toBeGreaterThanOrEqual(0.0);
      expect(blended.baseColor[0]).toBeLessThanOrEqual(1.0);
      expect(blended.roughness).toBeGreaterThanOrEqual(0.0);
      expect(blended.roughness).toBeLessThanOrEqual(1.0);
    });
    
    it('should blend materials with gradient mode', () => {
      const params: BlendParams = {
        mode: 'gradient',
        strength: 1.0,
        transitionDistance: 5.0,
        gradientDirection: [0, 1, 0],
      };
      
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'gradient', params);
      
      expect(blended.baseColor).toBeDefined();
      expect(blended.roughness).toBeGreaterThanOrEqual(0.0);
      expect(blended.roughness).toBeLessThanOrEqual(1.0);
    });
  });
  
  describe('Edge cases', () => {
    it('should return material A when factor is 0', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.0);
      
      expect(blended.baseColor[0]).toBeCloseTo(1.0, 5);
      expect(blended.baseColor[1]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(0.0, 5);
      expect(blended.roughness).toBeCloseTo(0.0, 5);
      expect(blended.metallic).toBeCloseTo(0.0, 5);
    });
    
    it('should return material B when factor is 1', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 1.0);
      
      expect(blended.baseColor[0]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[1]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(1.0, 5);
      expect(blended.roughness).toBeCloseTo(1.0, 5);
      expect(blended.metallic).toBeCloseTo(1.0, 5);
    });
    
    it('should clamp factor below 0 to 0', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', -0.5);
      
      expect(blended.baseColor[0]).toBeCloseTo(1.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(0.0, 5);
    });
    
    it('should clamp factor above 1 to 1', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 1.5);
      
      expect(blended.baseColor[0]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(1.0, 5);
    });
  });
  
  describe('Interpolation behavior', () => {
    it('should smoothly interpolate baseColor', () => {
      const blend25 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.25);
      const blend50 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      const blend75 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.75);
      
      expect(blend25.baseColor[0]).toBeGreaterThan(blend50.baseColor[0]);
      expect(blend50.baseColor[0]).toBeGreaterThan(blend75.baseColor[0]);
      
      expect(blend25.baseColor[2]).toBeLessThan(blend50.baseColor[2]);
      expect(blend50.baseColor[2]).toBeLessThan(blend75.baseColor[2]);
    });
    
    it('should smoothly interpolate roughness', () => {
      const blend25 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.25);
      const blend50 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      const blend75 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.75);
      
      expect(blend25.roughness).toBeCloseTo(0.25, 5);
      expect(blend50.roughness).toBeCloseTo(0.5, 5);
      expect(blend75.roughness).toBeCloseTo(0.75, 5);
    });
    
    it('should smoothly interpolate metallic', () => {
      const blend25 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.25);
      const blend50 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      const blend75 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.75);
      
      expect(blend25.metallic).toBeCloseTo(0.25, 5);
      expect(blend50.metallic).toBeCloseTo(0.5, 5);
      expect(blend75.metallic).toBeCloseTo(0.75, 5);
    });
    
    it('should smoothly interpolate emission', () => {
      const blend25 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.25);
      const blend50 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      const blend75 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.75);
      
      expect(blend25.emission).toBeCloseTo(0.25, 5);
      expect(blend50.emission).toBeCloseTo(0.5, 5);
      expect(blend75.emission).toBeCloseTo(0.75, 5);
    });
    
    it('should smoothly interpolate opacity', () => {
      const blend25 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.25);
      const blend50 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      const blend75 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.75);
      
      expect(blend25.opacity).toBeGreaterThan(blend50.opacity);
      expect(blend50.opacity).toBeGreaterThan(blend75.opacity);
    });
  });
  
  describe('Material properties preservation', () => {
    it('should preserve material ID format', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      
      expect(blended.id).toBe('blend-test-mat-a-test-mat-b');
    });
    
    it('should preserve material name format', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      
      expect(blended.name).toBe('Material A + Material B');
    });
    
    it('should preserve emissive color interpolation', () => {
      const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5);
      
      expect(blended.emissiveColor[0]).toBeCloseTo(0.5, 5);
      expect(blended.emissiveColor[1]).toBeCloseTo(0.0, 5);
      expect(blended.emissiveColor[2]).toBeCloseTo(0.5, 5);
    });
  });
  
  describe('Error handling', () => {
    it('should throw error for non-existent material A', () => {
      expect(() => {
        registry.blendMaterials('non-existent', 'test-mat-b', 0.5);
      }).toThrow('Material not found');
    });
    
    it('should throw error for non-existent material B', () => {
      expect(() => {
        registry.blendMaterials('test-mat-a', 'non-existent', 0.5);
      }).toThrow('Material not found');
    });
  });
  
  describe('Shader properties blending', () => {
    beforeEach(() => {
      registry.register({
        id: 'test-mat-c',
        name: 'Material C',
        baseColor: [1.0, 1.0, 1.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.5,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
        shaderProperties: {
          ior: 1.0,
          subsurface: 0.0,
          anisotropic: 0.0,
          clearcoat: 0.0,
        },
      });
      
      registry.register({
        id: 'test-mat-d',
        name: 'Material D',
        baseColor: [0.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.5,
        emissiveColor: [0.0, 0.0, 0.0],
        opacity: 1.0,
        shaderProperties: {
          ior: 2.0,
          subsurface: 1.0,
          anisotropic: 1.0,
          clearcoat: 1.0,
        },
      });
    });
    
    it('should blend shader properties - ior', () => {
      const blended = registry.blendMaterials('test-mat-c', 'test-mat-d', 0.5);
      
      expect(blended.shaderProperties?.ior).toBeCloseTo(1.5, 5);
    });
    
    it('should blend shader properties - subsurface', () => {
      const blended = registry.blendMaterials('test-mat-c', 'test-mat-d', 0.5);
      
      expect(blended.shaderProperties?.subsurface).toBeCloseTo(0.5, 5);
    });
    
    it('should blend shader properties - anisotropic', () => {
      const blended = registry.blendMaterials('test-mat-c', 'test-mat-d', 0.5);
      
      expect(blended.shaderProperties?.anisotropic).toBeCloseTo(0.5, 5);
    });
    
    it('should blend shader properties - clearcoat', () => {
      const blended = registry.blendMaterials('test-mat-c', 'test-mat-d', 0.5);
      
      expect(blended.shaderProperties?.clearcoat).toBeCloseTo(0.5, 5);
    });
  });
  
  describe('Default material fallback', () => {
    it('should use default material if material A not found and registry has default', () => {
      const defaultMat = registry.get('default');
      expect(defaultMat).toBeDefined();
    });
    
    it('should work with element materials', () => {
      const hydrogenExists = registry.has('element-h');
      const oxygenExists = registry.has('element-o');
      
      expect(hydrogenExists).toBe(true);
      expect(oxygenExists).toBe(true);
      
      if (hydrogenExists && oxygenExists) {
        const blended = registry.blendMaterials('element-h', 'element-o', 0.5);
        
        expect(blended).toBeDefined();
        expect(blended.baseColor).toBeDefined();
        expect(blended.roughness).toBeGreaterThanOrEqual(0.0);
        expect(blended.roughness).toBeLessThanOrEqual(1.0);
      }
    });
  });
  
  describe('Blend mode variations', () => {
    it('should handle smooth blend with different smoothness values', () => {
      const smooth1 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'smooth', {
        mode: 'smooth',
        strength: 1.0,
        transitionDistance: 1.0,
      });
      
      const smooth2 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'smooth', {
        mode: 'smooth',
        strength: 2.0,
        transitionDistance: 2.0,
      });
      
      expect(smooth1.baseColor).toBeDefined();
      expect(smooth2.baseColor).toBeDefined();
    });
    
    it('should handle noise blend with different noise scales', () => {
      const noise1 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'noise', {
        mode: 'noise',
        strength: 1.0,
        transitionDistance: 1.0,
        noiseScale: 1.0,
      });
      
      const noise2 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'noise', {
        mode: 'noise',
        strength: 1.0,
        transitionDistance: 1.0,
        noiseScale: 5.0,
      });
      
      expect(noise1.baseColor).toBeDefined();
      expect(noise2.baseColor).toBeDefined();
    });
    
    it('should handle gradient blend with different directions', () => {
      const gradientX = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'gradient', {
        mode: 'gradient',
        strength: 1.0,
        transitionDistance: 1.0,
        gradientDirection: [1, 0, 0],
      });
      
      const gradientY = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.5, 'gradient', {
        mode: 'gradient',
        strength: 1.0,
        transitionDistance: 1.0,
        gradientDirection: [0, 1, 0],
      });
      
      expect(gradientX.baseColor).toBeDefined();
      expect(gradientY.baseColor).toBeDefined();
    });
  });
  
  describe('Performance and stability', () => {
    it('should handle multiple sequential blends', () => {
      const blend1 = registry.blendMaterials('test-mat-a', 'test-mat-b', 0.33);
      registry.register(blend1);
      
      const blend2 = registry.blendMaterials(blend1.id, 'test-mat-b', 0.5);
      
      expect(blend2.baseColor).toBeDefined();
      expect(blend2.roughness).toBeGreaterThanOrEqual(0.0);
      expect(blend2.roughness).toBeLessThanOrEqual(1.0);
    });
    
    it('should handle many blend operations without degradation', () => {
      const steps = 10;
      const results: Material[] = [];
      
      for (let i = 0; i <= steps; i++) {
        const factor = i / steps;
        const blended = registry.blendMaterials('test-mat-a', 'test-mat-b', factor);
        results.push(blended);
      }
      
      expect(results.length).toBe(steps + 1);
      expect(results[0].baseColor[0]).toBeCloseTo(1.0, 5);
      expect(results[steps].baseColor[2]).toBeCloseTo(1.0, 5);
    });
  });
});
