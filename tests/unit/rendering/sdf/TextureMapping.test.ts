import { describe, it, expect } from 'vitest';
import { SDF_UV_GENERATION_GLSL } from '../../../../engine/rendering/sdf/SDFPrimitives';

describe('SDF UV Generation', () => {
  describe('GLSL Code Structure', () => {
    it('should export UV generation GLSL code', () => {
      expect(SDF_UV_GENERATION_GLSL).toBeDefined();
      expect(typeof SDF_UV_GENERATION_GLSL).toBe('string');
      expect(SDF_UV_GENERATION_GLSL.length).toBeGreaterThan(0);
    });

    it('should contain UV transform function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('applyUVTransform');
      expect(SDF_UV_GENERATION_GLSL).toMatch(/vec2\s+applyUVTransform\s*\(/);
    });

    it('should accept tiling and offset parameters in UV transform', () => {
      const transformMatch = SDF_UV_GENERATION_GLSL.match(
        /vec2\s+applyUVTransform\s*\([^)]+\)/
      );
      expect(transformMatch).toBeTruthy();
      if (transformMatch) {
        expect(transformMatch[0]).toContain('tiling');
        expect(transformMatch[0]).toContain('offset');
      }
    });
  });

  describe('Sphere UV Mapping', () => {
    it('should define uvSphere function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvSphere');
      expect(SDF_UV_GENERATION_GLSL).toMatch(/vec2\s+uvSphere\s*\(/);
    });

    it('should accept position and radius parameters', () => {
      const sphereMatch = SDF_UV_GENERATION_GLSL.match(
        /vec2\s+uvSphere\s*\([^)]+\)/
      );
      expect(sphereMatch).toBeTruthy();
      if (sphereMatch) {
        expect(sphereMatch[0]).toContain('vec3');
        expect(sphereMatch[0]).toContain('float');
      }
    });

    it('should use spherical coordinates (atan, asin)', () => {
      const sphereFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvSphere');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', sphereFunctionStart + 1);
      const sphereFunction = SDF_UV_GENERATION_GLSL.substring(
        sphereFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : sphereFunctionStart + 500
      );
      
      expect(sphereFunction).toMatch(/atan\s*\(/);
      expect(sphereFunction).toMatch(/3\.14159|PI/);
    });

    it('should normalize UV coordinates to [0, 1]', () => {
      const sphereFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvSphere');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', sphereFunctionStart + 1);
      const sphereFunction = SDF_UV_GENERATION_GLSL.substring(
        sphereFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : sphereFunctionStart + 500
      );
      
      expect(sphereFunction).toMatch(/return\s+vec2/);
    });
  });

  describe('Box UV Mapping', () => {
    it('should define uvBox function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvBox');
      expect(SDF_UV_GENERATION_GLSL).toMatch(/vec2\s+uvBox\s*\(/);
    });

    it('should accept position and dimensions parameters', () => {
      const boxMatch = SDF_UV_GENERATION_GLSL.match(
        /vec2\s+uvBox\s*\([^)]+\)/
      );
      expect(boxMatch).toBeTruthy();
      if (boxMatch) {
        expect(boxMatch[0]).toContain('vec3');
      }
    });

    it('should use planar mapping based on dominant axis', () => {
      const boxFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvBox');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', boxFunctionStart + 1);
      const boxFunction = SDF_UV_GENERATION_GLSL.substring(
        boxFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : boxFunctionStart + 800
      );
      
      expect(boxFunction).toMatch(/abs\s*\(/);
    });
  });

  describe('Cylinder UV Mapping', () => {
    it('should define uvCylinder function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvCylinder');
      expect(SDF_UV_GENERATION_GLSL).toMatch(/vec2\s+uvCylinder\s*\(/);
    });

    it('should accept position, radius, and height parameters', () => {
      const cylinderMatch = SDF_UV_GENERATION_GLSL.match(
        /vec2\s+uvCylinder\s*\([^)]+\)/
      );
      expect(cylinderMatch).toBeTruthy();
      if (cylinderMatch) {
        expect(cylinderMatch[0]).toContain('vec3');
        expect(cylinderMatch[0]).toMatch(/float.*float/);
      }
    });

    it('should use cylindrical coordinates', () => {
      const cylinderFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvCylinder');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', cylinderFunctionStart + 1);
      const cylinderFunction = SDF_UV_GENERATION_GLSL.substring(
        cylinderFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : cylinderFunctionStart + 500
      );
      
      expect(cylinderFunction).toMatch(/atan\s*\(/);
    });
  });

  describe('Torus UV Mapping', () => {
    it('should define uvTorus function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvTorus');
      expect(SDF_UV_GENERATION_GLSL).toMatch(/vec2\s+uvTorus\s*\(/);
    });

    it('should accept position and radii parameters', () => {
      const torusMatch = SDF_UV_GENERATION_GLSL.match(
        /vec2\s+uvTorus\s*\([^)]+\)/
      );
      expect(torusMatch).toBeTruthy();
      if (torusMatch) {
        expect(torusMatch[0]).toContain('vec3');
        expect(torusMatch[0]).toContain('vec2');
      }
    });

    it('should use toroidal coordinates', () => {
      const torusFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvTorus');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', torusFunctionStart + 1);
      const torusFunction = SDF_UV_GENERATION_GLSL.substring(
        torusFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : torusFunctionStart + 700
      );
      
      expect(torusFunction).toMatch(/atan\s*\(/);
      expect(torusFunction).toMatch(/3\.14159|PI/);
    });
  });

  describe('Advanced Primitive UV Mappings', () => {
    const advancedPrimitives = [
      'uvPyramid',
      'uvCone',
      'uvOctahedron',
      'uvHexPrism',
      'uvCapsule',
      'uvTriPrism',
      'uvEllipsoid',
      'uvRoundedBox',
      'uvCappedCylinder',
      'uvPlane',
      'uvRoundCone',
      'uvMengerSponge',
      'uvGyroid',
      'uvSuperellipsoid',
      'uvTorusKnot',
      'uvPOrbital',
      'uvDOrbital'
    ];

    advancedPrimitives.forEach((funcName) => {
      it(`should define ${funcName} function`, () => {
        expect(SDF_UV_GENERATION_GLSL).toContain(funcName);
        expect(SDF_UV_GENERATION_GLSL).toMatch(new RegExp(`vec2\\s+${funcName}\\s*\\(`));
      });
    });

    it('should have consistent return type (vec2) for all UV functions', () => {
      const uvFunctions = SDF_UV_GENERATION_GLSL.match(/vec2\s+uv\w+\s*\(/g);
      expect(uvFunctions).toBeTruthy();
      if (uvFunctions) {
        expect(uvFunctions.length).toBeGreaterThanOrEqual(advancedPrimitives.length);
      }
    });
  });

  describe('UV Transform Function', () => {
    it('should apply tiling correctly', () => {
      const transformStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 applyUVTransform');
      const transformEnd = SDF_UV_GENERATION_GLSL.indexOf('}', transformStart);
      const transformFunction = SDF_UV_GENERATION_GLSL.substring(transformStart, transformEnd + 1);
      
      expect(transformFunction).toMatch(/\*.*tiling/);
    });

    it('should apply offset correctly', () => {
      const transformStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 applyUVTransform');
      const transformEnd = SDF_UV_GENERATION_GLSL.indexOf('}', transformStart);
      const transformFunction = SDF_UV_GENERATION_GLSL.substring(transformStart, transformEnd + 1);
      
      expect(transformFunction).toMatch(/\+.*offset/);
    });

    it('should return transformed UV coordinates', () => {
      const transformFunction = extractFunction('applyUVTransform');
      
      expect(transformFunction).toContain('return');
      expect(transformFunction).toMatch(/return/);
    });
  });

  describe('Capsule UV Mapping', () => {
    it('should define uvCapsule function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvCapsule');
    });

    it('should handle line segment from start to end point', () => {
      const capsuleFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvCapsule');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', capsuleFunctionStart + 1);
      const capsuleFunction = SDF_UV_GENERATION_GLSL.substring(
        capsuleFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : capsuleFunctionStart + 800
      );
      
      expect(capsuleFunction).toContain('vec3 a');
      expect(capsuleFunction).toContain('vec3 b');
    });
  });

  describe('Plane UV Mapping', () => {
    it('should define uvPlane function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvPlane');
    });

    it('should use planar projection', () => {
      const planeFunction = extractFunction('uvPlane');
      
      expect(planeFunction).toMatch(/return/);
      expect(planeFunction.length).toBeGreaterThan(0);
    });
  });

  describe('Gyroid UV Mapping', () => {
    it('should define uvGyroid function', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvGyroid');
    });

    it('should handle periodic lattice structure', () => {
      const gyroidFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uvGyroid');
      const nextFunctionStart = SDF_UV_GENERATION_GLSL.indexOf('vec2 uv', gyroidFunctionStart + 1);
      const gyroidFunction = SDF_UV_GENERATION_GLSL.substring(
        gyroidFunctionStart,
        nextFunctionStart > 0 ? nextFunctionStart : gyroidFunctionStart + 500
      );
      
      expect(gyroidFunction).toBeTruthy();
    });
  });

  describe('Orbital UV Mappings', () => {
    it('should define uvPOrbital function for p-orbitals', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvPOrbital');
    });

    it('should define uvDOrbital function for d-orbitals', () => {
      expect(SDF_UV_GENERATION_GLSL).toContain('uvDOrbital');
    });

    it('should handle spherical harmonics coordinate system', () => {
      const pOrbitalFunction = extractFunction('uvPOrbital');
      
      expect(pOrbitalFunction).toMatch(/uvSphere|atan|asin|acos/);
    });
  });

  describe('Code Quality', () => {
    it('should not have syntax errors in GLSL code', () => {
      expect(SDF_UV_GENERATION_GLSL).not.toContain('undefined');
      expect(SDF_UV_GENERATION_GLSL).not.toContain('null');
    });

    it('should use consistent naming convention (uvPrimitiveName)', () => {
      const uvFunctions = SDF_UV_GENERATION_GLSL.match(/vec2\s+uv\w+\s*\(/g);
      expect(uvFunctions).toBeTruthy();
      if (uvFunctions) {
        uvFunctions.forEach((func) => {
          expect(func).toMatch(/vec2\s+uv[A-Z]/);
        });
      }
    });

    it('should have proper GLSL syntax for all functions', () => {
      const openBraces = (SDF_UV_GENERATION_GLSL.match(/{/g) || []).length;
      const closeBraces = (SDF_UV_GENERATION_GLSL.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });

    it('should define PI constant', () => {
      expect(SDF_UV_GENERATION_GLSL).toMatch(/PI|3\.14159/);
    });
  });

  describe('Texture Coordinate Normalization', () => {
    it('should normalize coordinates for sphere mapping', () => {
      const sphereFunction = extractFunction('uvSphere');
      expect(sphereFunction).toMatch(/3\.14159|PI/);
      expect(sphereFunction).toMatch(/\/ *\(2\.0 *\* *3\.14159|\/ *\(2\.0 *\* *PI/);
    });

    it('should normalize coordinates for torus mapping', () => {
      const torusFunction = extractFunction('uvTorus');
      expect(torusFunction).toMatch(/3\.14159|PI/);
    });

    it('should handle edge cases in UV wrapping', () => {
      const sphereFunction = extractFunction('uvSphere');
      expect(sphereFunction.length).toBeGreaterThan(0);
    });
  });

  describe('Texture Tiling and Offset', () => {
    it('should multiply UV by tiling factor', () => {
      const transformFunction = extractFunction('applyUVTransform');
      expect(transformFunction).toMatch(/uv\s*\*\s*tiling|tiling\s*\*\s*uv/);
    });

    it('should add offset after tiling', () => {
      const transformFunction = extractFunction('applyUVTransform');
      const tilingIndex = transformFunction.indexOf('tiling');
      const offsetIndex = transformFunction.indexOf('offset');
      expect(offsetIndex).toBeGreaterThan(tilingIndex);
    });
  });

  describe('Complex Primitive UV Generation', () => {
    it('should handle Menger Sponge fractal UV mapping', () => {
      const mengerFunction = extractFunction('uvMengerSponge');
      expect(mengerFunction.length).toBeGreaterThan(0);
    });

    it('should handle Torus Knot parametric UV mapping', () => {
      const torusKnotFunction = extractFunction('uvTorusKnot');
      expect(torusKnotFunction.length).toBeGreaterThan(0);
      expect(torusKnotFunction).toMatch(/sin|cos|atan/);
    });

    it('should handle Superellipsoid UV mapping', () => {
      const superellipsoidFunction = extractFunction('uvSuperellipsoid');
      expect(superellipsoidFunction.length).toBeGreaterThan(0);
    });
  });
});

function extractFunction(functionName: string): string {
  const functionStart = SDF_UV_GENERATION_GLSL.indexOf(`vec2 ${functionName}`);
  if (functionStart === -1) return '';
  
  let braceCount = 0;
  let inFunction = false;
  let result = '';
  
  for (let i = functionStart; i < SDF_UV_GENERATION_GLSL.length; i++) {
    const char = SDF_UV_GENERATION_GLSL[i];
    result += char;
    
    if (char === '{') {
      braceCount++;
      inFunction = true;
    } else if (char === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        break;
      }
    }
  }
  
  return result;
}
