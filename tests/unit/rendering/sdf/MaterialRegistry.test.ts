/**
 * MATERIAL REGISTRY TESTS - Phase 0.1.2
 * 
 * Comprehensive test suite for MaterialRegistry system.
 * Tests registration, retrieval, blending, serialization, and default materials.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  MaterialRegistry, 
  Material, 
  materialRegistry,
  SerializedMaterial,
  BlendParams
} from '../../../../engine/rendering/sdf/MaterialRegistry';
import { PERIODIC_TABLE } from '../../../../agents/tables/periodic-table';

describe('MaterialRegistry', () => {
  let registry: MaterialRegistry;

  beforeEach(() => {
    registry = new MaterialRegistry();
  });

  describe('Material Registration', () => {
    it('should register a new material', () => {
      const material: Material = {
        id: 'test-material',
        name: 'Test Material',
        baseColor: [1.0, 0.5, 0.0],
        roughness: 0.5,
        metallic: 0.3,
        emission: 0.1,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };

      registry.register(material);
      expect(registry.has('test-material')).toBe(true);
      expect(registry.get('test-material')).toEqual(material);
    });

    it('should throw error when registering duplicate material ID', () => {
      const material: Material = {
        id: 'duplicate',
        name: 'Duplicate',
        baseColor: [1.0, 1.0, 1.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };

      registry.register(material);
      expect(() => registry.register(material)).toThrow(
        "Material with ID 'duplicate' already exists"
      );
    });

    it('should register materials with optional shader properties', () => {
      const material: Material = {
        id: 'glass',
        name: 'Glass',
        baseColor: [0.9, 0.9, 1.0],
        roughness: 0.1,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 0.3,
        shaderProperties: {
          ior: 1.5,
          subsurface: 0.2,
          clearcoat: 0.8,
        },
      };

      registry.register(material);
      const retrieved = registry.get('glass');
      expect(retrieved?.shaderProperties?.ior).toBe(1.5);
      expect(retrieved?.shaderProperties?.subsurface).toBe(0.2);
      expect(retrieved?.shaderProperties?.clearcoat).toBe(0.8);
    });
  });

  describe('Material Retrieval', () => {
    beforeEach(() => {
      registry.register({
        id: 'test-1',
        name: 'Test 1',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
    });

    it('should retrieve existing material', () => {
      const material = registry.get('test-1');
      expect(material).toBeDefined();
      expect(material?.id).toBe('test-1');
      expect(material?.baseColor).toEqual([1.0, 0.0, 0.0]);
    });

    it('should return undefined for non-existent material', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });

    it('should check material existence', () => {
      expect(registry.has('test-1')).toBe(true);
      expect(registry.has('non-existent')).toBe(false);
    });

    it('should list all material IDs', () => {
      registry.register({
        id: 'test-2',
        name: 'Test 2',
        baseColor: [0.0, 1.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });

      const ids = registry.list();
      expect(ids).toContain('test-1');
      expect(ids).toContain('test-2');
    });

    it('should get all materials', () => {
      const materials = registry.getAll();
      expect(materials.length).toBeGreaterThan(0);
      expect(materials.some(m => m.id === 'test-1')).toBe(true);
    });
  });

  describe('Material Updates', () => {
    beforeEach(() => {
      registry.register({
        id: 'updateable',
        name: 'Updateable',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
    });

    it('should update existing material', () => {
      registry.update('updateable', {
        baseColor: [0.0, 1.0, 0.0],
        roughness: 0.8,
      });

      const material = registry.get('updateable');
      expect(material?.baseColor).toEqual([0.0, 1.0, 0.0]);
      expect(material?.roughness).toBe(0.8);
      expect(material?.metallic).toBe(0.0);
    });

    it('should throw error when updating non-existent material', () => {
      expect(() => registry.update('non-existent', { roughness: 0.5 })).toThrow(
        "Material with ID 'non-existent' not found"
      );
    });
  });

  describe('Material Removal', () => {
    beforeEach(() => {
      registry.register({
        id: 'removable',
        name: 'Removable',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
    });

    it('should remove existing material', () => {
      expect(registry.has('removable')).toBe(true);
      const removed = registry.remove('removable');
      expect(removed).toBe(true);
      expect(registry.has('removable')).toBe(false);
    });

    it('should return false when removing non-existent material', () => {
      expect(registry.remove('non-existent')).toBe(false);
    });

    it('should clear all materials', () => {
      registry.clear();
      expect(registry.list().length).toBe(0);
    });
  });

  describe('Material Blending', () => {
    let redMaterial: Material;
    let blueMaterial: Material;

    beforeEach(() => {
      redMaterial = {
        id: 'red',
        name: 'Red',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.2,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 0.0, 0.0],
        opacity: 1.0,
      };

      blueMaterial = {
        id: 'blue',
        name: 'Blue',
        baseColor: [0.0, 0.0, 1.0],
        roughness: 0.8,
        metallic: 1.0,
        emission: 0.5,
        emissiveColor: [0.0, 0.0, 1.0],
        opacity: 0.5,
      };

      registry.register(redMaterial);
      registry.register(blueMaterial);
    });

    it('should blend materials linearly at 50%', () => {
      const blended = registry.blend('red', 'blue', 0.5);

      expect(blended.baseColor[0]).toBeCloseTo(0.5, 5);
      expect(blended.baseColor[1]).toBeCloseTo(0.0, 5);
      expect(blended.baseColor[2]).toBeCloseTo(0.5, 5);
      expect(blended.roughness).toBeCloseTo(0.5, 5);
      expect(blended.metallic).toBeCloseTo(0.5, 5);
    });

    it('should blend at 0% (all material A)', () => {
      const blended = registry.blend('red', 'blue', 0.0);

      expect(blended.baseColor).toEqual([1.0, 0.0, 0.0]);
      expect(blended.roughness).toBe(0.2);
      expect(blended.metallic).toBe(0.0);
    });

    it('should blend at 100% (all material B)', () => {
      const blended = registry.blend('red', 'blue', 1.0);

      expect(blended.baseColor).toEqual([0.0, 0.0, 1.0]);
      expect(blended.roughness).toBe(0.8);
      expect(blended.metallic).toBe(1.0);
    });

    it('should clamp blend factor to [0, 1]', () => {
      const blendedNegative = registry.blend('red', 'blue', -0.5);
      const blendedOver = registry.blend('red', 'blue', 1.5);

      expect(blendedNegative.baseColor).toEqual([1.0, 0.0, 0.0]);
      expect(blendedOver.baseColor).toEqual([0.0, 0.0, 1.0]);
    });

    it('should blend with smooth mode', () => {
      const params: BlendParams = {
        mode: 'smooth',
        strength: 1.0,
        transitionDistance: 1.0,
      };

      const blended = registry.blend('red', 'blue', 0.5, params);
      expect(blended.id).toContain('blend-red-blue');
      expect(blended.name).toBe('Red + Blue');
    });

    it('should blend with noise mode', () => {
      const params: BlendParams = {
        mode: 'noise',
        strength: 1.0,
        transitionDistance: 1.0,
        noiseScale: 2.0,
      };

      const blended = registry.blend('red', 'blue', 0.5, params);
      expect(blended).toBeDefined();
    });

    it('should blend with gradient mode', () => {
      const params: BlendParams = {
        mode: 'gradient',
        strength: 1.0,
        transitionDistance: 1.0,
        gradientDirection: [1.0, 0.0, 0.0],
      };

      const blended = registry.blend('red', 'blue', 0.5, params);
      expect(blended).toBeDefined();
    });

    it('should throw error when blending non-existent materials', () => {
      expect(() => registry.blend('red', 'non-existent', 0.5)).toThrow(
        'Material not found: non-existent'
      );
      expect(() => registry.blend('non-existent', 'blue', 0.5)).toThrow(
        'Material not found: non-existent'
      );
    });

    it('should blend shader properties', () => {
      const matA: Material = {
        id: 'a',
        name: 'A',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
        shaderProperties: { ior: 1.0, subsurface: 0.0 },
      };

      const matB: Material = {
        id: 'b',
        name: 'B',
        baseColor: [0.0, 0.0, 1.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
        shaderProperties: { ior: 2.0, subsurface: 1.0 },
      };

      registry.register(matA);
      registry.register(matB);

      const blended = registry.blend('a', 'b', 0.5);
      expect(blended.shaderProperties?.ior).toBeCloseTo(1.5, 5);
      expect(blended.shaderProperties?.subsurface).toBeCloseTo(0.5, 5);
    });
  });

  describe('Serialization', () => {
    it('should serialize registry to JSON', () => {
      const serialized = registry.serialize();
      expect(Array.isArray(serialized)).toBe(true);
      expect(serialized.length).toBeGreaterThan(0);
    });

    it('should include all material properties in serialization', () => {
      const serialized = registry.serialize();
      const material = serialized[0];

      expect(material).toHaveProperty('id');
      expect(material).toHaveProperty('name');
      expect(material).toHaveProperty('baseColor');
      expect(material).toHaveProperty('roughness');
      expect(material).toHaveProperty('metallic');
      expect(material).toHaveProperty('emission');
      expect(material).toHaveProperty('emissiveColor');
      expect(material).toHaveProperty('opacity');
    });

    it('should deserialize materials from JSON', () => {
      const testData: SerializedMaterial[] = [
        {
          id: 'test-deserialize',
          name: 'Test Deserialize',
          baseColor: [0.5, 0.5, 0.5],
          roughness: 0.6,
          metallic: 0.4,
          emission: 0.2,
          emissiveColor: [1.0, 0.5, 0.0],
          opacity: 0.8,
        },
      ];

      registry.deserialize(testData, false);

      const material = registry.get('test-deserialize');
      expect(material).toBeDefined();
      expect(material?.baseColor).toEqual([0.5, 0.5, 0.5]);
      expect(material?.roughness).toBe(0.6);
    });

    it('should support roundtrip serialization', () => {
      const original = registry.serialize();
      const newRegistry = new MaterialRegistry();
      newRegistry.deserialize(original, false);

      const roundtrip = newRegistry.serialize();
      expect(roundtrip).toEqual(original);
    });

    it('should merge materials when deserializing with merge=true', () => {
      const customMaterial: SerializedMaterial = {
        id: 'custom',
        name: 'Custom',
        baseColor: [1.0, 1.0, 0.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };

      const existingCount = registry.list().length;
      registry.deserialize([customMaterial], true);

      expect(registry.list().length).toBe(existingCount + 1);
      expect(registry.has('custom')).toBe(true);
    });

    it('should replace materials when deserializing with merge=false', () => {
      const customMaterial: SerializedMaterial = {
        id: 'only',
        name: 'Only',
        baseColor: [1.0, 0.0, 1.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };

      registry.deserialize([customMaterial], false);

      expect(registry.list().length).toBe(1);
      expect(registry.has('only')).toBe(true);
    });
  });

  describe('Default Element Materials', () => {
    it('should register default materials for all periodic table elements', () => {
      for (const [symbol] of Object.entries(PERIODIC_TABLE)) {
        const materialId = `element-${symbol.toLowerCase()}`;
        expect(registry.has(materialId)).toBe(true);
      }
    });

    it('should have valid properties for hydrogen', () => {
      const hydrogen = registry.get('element-h');
      expect(hydrogen).toBeDefined();
      expect(hydrogen?.name).toBe('Hydrogen');
      expect(hydrogen?.baseColor).toBeDefined();
      expect(hydrogen?.baseColor.length).toBe(3);
      expect(hydrogen?.roughness).toBeGreaterThanOrEqual(0);
      expect(hydrogen?.roughness).toBeLessThanOrEqual(1);
      expect(hydrogen?.metallic).toBeGreaterThanOrEqual(0);
      expect(hydrogen?.metallic).toBeLessThanOrEqual(1);
    });

    it('should have valid properties for oxygen', () => {
      const oxygen = registry.get('element-o');
      expect(oxygen).toBeDefined();
      expect(oxygen?.name).toBe('Oxygen');
      expect(oxygen?.metallic).toBe(0.0);
      expect(oxygen?.opacity).toBeGreaterThanOrEqual(0);
      expect(oxygen?.opacity).toBeLessThanOrEqual(1);
    });

    it('should have valid properties for carbon', () => {
      const carbon = registry.get('element-c');
      expect(carbon).toBeDefined();
      expect(carbon?.name).toBe('Carbon');
      expect(carbon?.opacity).toBe(1.0);
    });

    it('should have metallic properties for iron', () => {
      const iron = registry.get('element-fe');
      expect(iron).toBeDefined();
      expect(iron?.name).toBe('Iron');
      expect(iron?.metallic).toBe(1.0);
      expect(iron?.roughness).toBeLessThan(0.5);
    });

    it('should have metallic properties for copper', () => {
      const copper = registry.get('element-cu');
      expect(copper).toBeDefined();
      expect(copper?.name).toBe('Copper');
      expect(copper?.metallic).toBe(1.0);
    });

    it('should have metallic properties for gold', () => {
      const gold = registry.get('element-au');
      expect(gold).toBeDefined();
      expect(gold?.name).toBe('Gold');
      expect(gold?.metallic).toBe(1.0);
      expect(gold?.roughness).toBeLessThan(0.3);
    });

    it('should have metallic properties for silver', () => {
      const silver = registry.get('element-ag');
      expect(silver).toBeDefined();
      expect(silver?.name).toBe('Silver');
      expect(silver?.metallic).toBe(1.0);
      expect(silver?.roughness).toBeLessThan(0.2);
    });

    it('should have RGB values in valid range [0, 1]', () => {
      const materials = registry.getAll();
      for (const material of materials) {
        expect(material.baseColor[0]).toBeGreaterThanOrEqual(0);
        expect(material.baseColor[0]).toBeLessThanOrEqual(1);
        expect(material.baseColor[1]).toBeGreaterThanOrEqual(0);
        expect(material.baseColor[1]).toBeLessThanOrEqual(1);
        expect(material.baseColor[2]).toBeGreaterThanOrEqual(0);
        expect(material.baseColor[2]).toBeLessThanOrEqual(1);

        expect(material.emissiveColor[0]).toBeGreaterThanOrEqual(0);
        expect(material.emissiveColor[0]).toBeLessThanOrEqual(1);
        expect(material.emissiveColor[1]).toBeGreaterThanOrEqual(0);
        expect(material.emissiveColor[1]).toBeLessThanOrEqual(1);
        expect(material.emissiveColor[2]).toBeGreaterThanOrEqual(0);
        expect(material.emissiveColor[2]).toBeLessThanOrEqual(1);
      }
    });

    it('should have all material properties in valid ranges', () => {
      const materials = registry.getAll();
      for (const material of materials) {
        expect(material.roughness).toBeGreaterThanOrEqual(0);
        expect(material.roughness).toBeLessThanOrEqual(1);
        expect(material.metallic).toBeGreaterThanOrEqual(0);
        expect(material.metallic).toBeLessThanOrEqual(1);
        expect(material.emission).toBeGreaterThanOrEqual(0);
        expect(material.emission).toBeLessThanOrEqual(1);
        expect(material.opacity).toBeGreaterThanOrEqual(0);
        expect(material.opacity).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Special Materials', () => {
    it('should have a bond material', () => {
      const bond = registry.get('bond');
      expect(bond).toBeDefined();
      expect(bond?.name).toBe('Chemical Bond');
      expect(bond?.emission).toBeGreaterThan(0);
    });

    it('should have a default material', () => {
      const defaultMat = registry.get('default');
      expect(defaultMat).toBeDefined();
      expect(defaultMat?.name).toBe('Default Material');
      expect(defaultMat?.baseColor).toEqual([0.5, 0.5, 0.5]);
    });
  });

  describe('Global Singleton', () => {
    it('should export a global materialRegistry instance', () => {
      expect(materialRegistry).toBeInstanceOf(MaterialRegistry);
      expect(materialRegistry.has('element-h')).toBe(true);
    });

    it('should have all default materials in global instance', () => {
      expect(materialRegistry.list().length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty registry gracefully', () => {
      registry.clear();
      expect(registry.list()).toEqual([]);
      expect(registry.getAll()).toEqual([]);
      expect(registry.get('anything')).toBeUndefined();
    });

    it('should handle blending with very small factors', () => {
      const mat1: Material = {
        id: 'mat1',
        name: 'Mat1',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };
      const mat2: Material = {
        id: 'mat2',
        name: 'Mat2',
        baseColor: [0.0, 0.0, 1.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      };

      registry.register(mat1);
      registry.register(mat2);

      const blended = registry.blend('mat1', 'mat2', 0.0001);
      expect(blended.baseColor[0]).toBeGreaterThan(0.99);
    });

    it('should handle materials with extreme property values', () => {
      const extremeMat: Material = {
        id: 'extreme',
        name: 'Extreme',
        baseColor: [0.0, 0.0, 0.0],
        roughness: 1.0,
        metallic: 1.0,
        emission: 1.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 0.0,
      };

      registry.register(extremeMat);
      const retrieved = registry.get('extreme');
      expect(retrieved).toEqual(extremeMat);
    });
  });

  describe('API Compatibility', () => {
    it('should provide getMaterialByID alias', () => {
      const material = registry.getMaterialByID('element-h');
      expect(material).toBeDefined();
      expect(material?.name).toBe('Hydrogen');
    });

    it('should return undefined for non-existent material via getMaterialByID', () => {
      expect(registry.getMaterialByID('non-existent')).toBeUndefined();
    });

    it('should return same result as get() method', () => {
      const mat1 = registry.get('element-o');
      const mat2 = registry.getMaterialByID('element-o');
      expect(mat1).toEqual(mat2);
    });
  });

  describe('GLSL Shader Generation', () => {
    beforeEach(() => {
      registry.clear();
      registry.register({
        id: 'test-red',
        name: 'Red',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 0.0, 0.0],
        opacity: 1.0,
        shaderProperties: { ior: 1.5 },
      });
      registry.register({
        id: 'test-blue',
        name: 'Blue',
        baseColor: [0.0, 0.0, 1.0],
        roughness: 0.8,
        metallic: 1.0,
        emission: 0.5,
        emissiveColor: [0.0, 0.0, 1.0],
        opacity: 0.5,
        shaderProperties: { ior: 2.0 },
      });
    });

    it('should generate valid GLSL shader code', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toBeDefined();
      expect(typeof glsl).toBe('string');
      expect(glsl.length).toBeGreaterThan(0);
    });

    it('should include Material struct definition', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('struct Material');
      expect(glsl).toContain('vec3 baseColor');
      expect(glsl).toContain('float roughness');
      expect(glsl).toContain('float metallic');
      expect(glsl).toContain('float emission');
      expect(glsl).toContain('vec3 emissiveColor');
      expect(glsl).toContain('float opacity');
      expect(glsl).toContain('float ior');
    });

    it('should include material ID constants', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('const int MAT_TEST_RED');
      expect(glsl).toContain('const int MAT_TEST_BLUE');
    });

    it('should include uniform declarations', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('uniform vec3 u_materialBaseColor');
      expect(glsl).toContain('uniform float u_materialRoughness');
      expect(glsl).toContain('uniform float u_materialMetallic');
      expect(glsl).toContain('uniform float u_materialEmission');
      expect(glsl).toContain('uniform vec3 u_materialEmissiveColor');
      expect(glsl).toContain('uniform float u_materialOpacity');
      expect(glsl).toContain('uniform float u_materialIOR');
    });

    it('should include NUM_MATERIALS constant', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('const int NUM_MATERIALS = 2');
    });

    it('should include getMaterial function', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('Material getMaterial(int materialIndex)');
    });

    it('should handle empty registry with default material', () => {
      registry.clear();
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('struct Material');
      expect(glsl).toContain('Material getMaterial(int materialIndex)');
      expect(glsl).toContain('vec3(0.5)');
    });

    it('should generate array sizes matching material count', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('[2]');
    });

    it('should include bounds checking in getMaterial', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('materialIndex < 0');
      expect(glsl).toContain('materialIndex >= NUM_MATERIALS');
    });

    it('should convert material IDs with hyphens to underscores', () => {
      registry.clear();
      registry.register({
        id: 'my-custom-material',
        name: 'Custom',
        baseColor: [1.0, 1.0, 1.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('MAT_MY_CUSTOM_MATERIAL');
    });

    it('should generate valid GLSL for many materials', () => {
      registry.clear();
      for (let i = 0; i < 50; i++) {
        registry.register({
          id: `material-${i}`,
          name: `Material ${i}`,
          baseColor: [i / 50, 0.5, 0.5],
          roughness: 0.5,
          metallic: 0.5,
          emission: 0.0,
          emissiveColor: [1.0, 1.0, 1.0],
          opacity: 1.0,
        });
      }
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('const int NUM_MATERIALS = 50');
      expect(glsl).toContain('[50]');
    });
  });

  describe('Material Uniforms', () => {
    beforeEach(() => {
      registry.clear();
      registry.register({
        id: 'test-material',
        name: 'Test',
        baseColor: [1.0, 0.5, 0.25],
        roughness: 0.7,
        metallic: 0.3,
        emission: 0.1,
        emissiveColor: [0.8, 0.9, 1.0],
        opacity: 0.9,
        shaderProperties: { ior: 1.8 },
      });
    });

    it('should return material uniforms data', () => {
      const uniforms = registry.getMaterialUniforms();
      expect(uniforms).toBeDefined();
      expect(uniforms.baseColor).toBeDefined();
      expect(uniforms.roughness).toBeDefined();
      expect(uniforms.metallic).toBeDefined();
      expect(uniforms.emission).toBeDefined();
      expect(uniforms.emissiveColor).toBeDefined();
      expect(uniforms.opacity).toBeDefined();
      expect(uniforms.ior).toBeDefined();
    });

    it('should have correct uniform values', () => {
      const uniforms = registry.getMaterialUniforms();
      expect(uniforms.baseColor[0]).toEqual([1.0, 0.5, 0.25]);
      expect(uniforms.roughness[0]).toBe(0.7);
      expect(uniforms.metallic[0]).toBe(0.3);
      expect(uniforms.emission[0]).toBe(0.1);
      expect(uniforms.emissiveColor[0]).toEqual([0.8, 0.9, 1.0]);
      expect(uniforms.opacity[0]).toBe(0.9);
      expect(uniforms.ior[0]).toBe(1.8);
    });

    it('should use default IOR when not specified', () => {
      registry.clear();
      registry.register({
        id: 'no-ior',
        name: 'No IOR',
        baseColor: [1.0, 1.0, 1.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
      const uniforms = registry.getMaterialUniforms();
      expect(uniforms.ior[0]).toBe(1.5);
    });

    it('should return arrays of correct length', () => {
      registry.register({
        id: 'second',
        name: 'Second',
        baseColor: [0.0, 1.0, 0.0],
        roughness: 0.5,
        metallic: 0.5,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
      const uniforms = registry.getMaterialUniforms();
      expect(uniforms.baseColor.length).toBe(2);
      expect(uniforms.roughness.length).toBe(2);
      expect(uniforms.metallic.length).toBe(2);
    });
  });

  describe('Material Index Lookup', () => {
    beforeEach(() => {
      registry.clear();
      registry.register({
        id: 'first',
        name: 'First',
        baseColor: [1.0, 0.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
      registry.register({
        id: 'second',
        name: 'Second',
        baseColor: [0.0, 1.0, 0.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
      registry.register({
        id: 'third',
        name: 'Third',
        baseColor: [0.0, 0.0, 1.0],
        roughness: 0.5,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0,
      });
    });

    it('should return correct material index', () => {
      expect(registry.getMaterialIndex('first')).toBe(0);
      expect(registry.getMaterialIndex('second')).toBe(1);
      expect(registry.getMaterialIndex('third')).toBe(2);
    });

    it('should return -1 for non-existent material', () => {
      expect(registry.getMaterialIndex('non-existent')).toBe(-1);
    });

    it('should return consistent indices', () => {
      const index1 = registry.getMaterialIndex('second');
      const index2 = registry.getMaterialIndex('second');
      expect(index1).toBe(index2);
    });
  });

  describe('Integration with Default Materials', () => {
    it('should generate GLSL for all element materials', () => {
      const glsl = registry.convertMaterialsToGLSL();
      expect(glsl).toContain('MAT_ELEMENT_H');
      expect(glsl).toContain('MAT_ELEMENT_O');
      expect(glsl).toContain('MAT_ELEMENT_C');
      expect(glsl).toContain('MAT_ELEMENT_FE');
    });

    it('should include all element materials in uniforms', () => {
      const uniforms = registry.getMaterialUniforms();
      const hydrogenIndex = registry.getMaterialIndex('element-h');
      const oxygenIndex = registry.getMaterialIndex('element-o');
      
      expect(hydrogenIndex).toBeGreaterThanOrEqual(0);
      expect(oxygenIndex).toBeGreaterThanOrEqual(0);
      expect(uniforms.baseColor[hydrogenIndex]).toBeDefined();
      expect(uniforms.baseColor[oxygenIndex]).toBeDefined();
    });

    it('should correctly map element materials to indices', () => {
      const hydrogenIndex = registry.getMaterialIndex('element-h');
      const hydrogen = registry.get('element-h');
      const uniforms = registry.getMaterialUniforms();
      
      expect(uniforms.baseColor[hydrogenIndex]).toEqual(
        Array.from(hydrogen!.baseColor)
      );
    });
  });
});
