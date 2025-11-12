import { describe, it, expect } from 'vitest';
import { 
  SDF_LIGHTING_GLSL 
} from '../../../../engine/rendering/sdf/glsl';

describe('SDF Lighting System', () => {
  describe('SDF_LIGHTING_GLSL', () => {
    it('should export lighting shader code', () => {
      expect(SDF_LIGHTING_GLSL).toBeDefined();
      expect(typeof SDF_LIGHTING_GLSL).toBe('string');
      expect(SDF_LIGHTING_GLSL.length).toBeGreaterThan(0);
    });

    it('should contain calculateNormal function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('vec3 calculateNormal');
      expect(SDF_LIGHTING_GLSL).toContain('const float eps = 0.001');
    });

    it('should contain PBRMaterial struct', () => {
      expect(SDF_LIGHTING_GLSL).toContain('struct PBRMaterial');
      expect(SDF_LIGHTING_GLSL).toContain('vec3 albedo');
      expect(SDF_LIGHTING_GLSL).toContain('float roughness');
      expect(SDF_LIGHTING_GLSL).toContain('float metallic');
    });

    it('should contain fresnelSchlick function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('vec3 fresnelSchlick');
      expect(SDF_LIGHTING_GLSL).toContain('F0');
    });

    it('should contain distribution function (GGX)', () => {
      expect(SDF_LIGHTING_GLSL).toContain('float distributionGGX');
      expect(SDF_LIGHTING_GLSL).toContain('NdotH');
    });

    it('should contain geometry function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('float geometrySchlickGGX');
      expect(SDF_LIGHTING_GLSL).toContain('float geometrySmith');
    });

    it('should contain phongShading function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('vec3 phongShading');
      expect(SDF_LIGHTING_GLSL).toContain('normal');
      expect(SDF_LIGHTING_GLSL).toContain('viewDir');
      expect(SDF_LIGHTING_GLSL).toContain('lightDir');
    });

    it('should contain pbrShading function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('vec3 pbrShading');
      expect(SDF_LIGHTING_GLSL).toContain('PBRMaterial');
      expect(SDF_LIGHTING_GLSL).toContain('lightColor');
      expect(SDF_LIGHTING_GLSL).toContain('lightIntensity');
    });

    it('should contain softShadow function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('float softShadow');
      expect(SDF_LIGHTING_GLSL).toContain('rayOrigin');
      expect(SDF_LIGHTING_GLSL).toContain('rayDir');
      expect(SDF_LIGHTING_GLSL).toContain('for');
    });

    it('should contain ambientOcclusion function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('float ambientOcclusion');
      expect(SDF_LIGHTING_GLSL).toContain('steps');
    });

    it('should contain fast AO function', () => {
      expect(SDF_LIGHTING_GLSL).toContain('float ambientOcclusionFast');
    });

    it('should use Cook-Torrance BRDF in PBR shading', () => {
      expect(SDF_LIGHTING_GLSL).toContain('Cook-Torrance');
    });
  });

  describe('Normal Calculation', () => {
    it('should calculate normals using gradient method', () => {
      expect(SDF_LIGHTING_GLSL).toContain('calculateNormal');
      expect(SDF_LIGHTING_GLSL).toMatch(/sceneSDF\(p \+ vec3\(eps, 0\.?0?, 0\.?0?\)\)/);
      expect(SDF_LIGHTING_GLSL).toMatch(/sceneSDF\(p - vec3\(eps, 0\.?0?, 0\.?0?\)\)/);
      expect(SDF_LIGHTING_GLSL).toContain('normalize');
    });

    it('should use small epsilon for normal calculation', () => {
      expect(SDF_LIGHTING_GLSL).toContain('eps = 0.001');
    });
  });

  describe('Lighting Models', () => {
    it('should implement Phong lighting with ambient, diffuse, and specular', () => {
      expect(SDF_LIGHTING_GLSL).toContain('phongShading');
      expect(SDF_LIGHTING_GLSL).toMatch(/dot\(.*normal.*lightDir\)/);
    });

    it('should implement PBR with proper BRDF components', () => {
      expect(SDF_LIGHTING_GLSL).toContain('pbrShading');
      expect(SDF_LIGHTING_GLSL).toContain('fresnelSchlick');
      expect(SDF_LIGHTING_GLSL).toContain('distributionGGX');
      expect(SDF_LIGHTING_GLSL).toContain('geometrySmith');
    });

    it('should handle metallic workflow correctly', () => {
      expect(SDF_LIGHTING_GLSL).toContain('metallic');
      expect(SDF_LIGHTING_GLSL).toMatch(/mix\(.*vec3\(0\.04\).*albedo.*metallic/);
    });

    it('should implement energy conservation', () => {
      expect(SDF_LIGHTING_GLSL).toContain('1.0 - F');
      expect(SDF_LIGHTING_GLSL).toContain('1.0 - metallic');
    });
  });

  describe('Shadow Rendering', () => {
    it('should implement soft shadow raymarching', () => {
      expect(SDF_LIGHTING_GLSL).toContain('softShadow');
      expect(SDF_LIGHTING_GLSL).toContain('for');
      expect(SDF_LIGHTING_GLSL).toMatch(/res = min\(res/);
    });

    it('should support shadow softness parameter', () => {
      expect(SDF_LIGHTING_GLSL).toMatch(/softShadow.*shadowSoftness/);
    });

    it('should return shadow value between 0 and 1', () => {
      expect(SDF_LIGHTING_GLSL).toMatch(/clamp\(.*0\.0.*1\.0/);
    });
  });

  describe('Ambient Occlusion', () => {
    it('should implement raymarched ambient occlusion', () => {
      expect(SDF_LIGHTING_GLSL).toContain('ambientOcclusion');
      expect(SDF_LIGHTING_GLSL).toContain('for');
    });

    it('should have fast AO approximation', () => {
      expect(SDF_LIGHTING_GLSL).toContain('ambientOcclusionFast');
    });

    it('should use surface normal for AO calculation', () => {
      const aoMatch = SDF_LIGHTING_GLSL.match(/ambientOcclusion.*\(.*normal/);
      expect(aoMatch).toBeTruthy();
    });
  });

  describe('Shader Code Quality', () => {
    it('should not have syntax errors in function signatures', () => {
      const functionPattern = /\w+\s+\w+\s*\([^)]*\)\s*\{/g;
      const functions = SDF_LIGHTING_GLSL.match(functionPattern);
      expect(functions).toBeTruthy();
      expect(functions!.length).toBeGreaterThan(5);
    });

    it('should have proper struct definitions', () => {
      expect(SDF_LIGHTING_GLSL).toMatch(/struct\s+\w+\s*\{[\s\S]*?\}/);
    });

    it('should use const for mathematical constants', () => {
      expect(SDF_LIGHTING_GLSL).toContain('const float');
    });
  });
});
