import { SDFPrimitive } from '../../types';

export interface SceneSDF {
  sdfFunction: string;
  primitiveData: Array<{ type: string; params: number[] }>;
  materialIds: number[];
}

export function generateSceneSDF(
  primitives: SDFPrimitive[],
  materialIndexMap: Map<string, number>,
  maxDistance: number
): SceneSDF {
  if (primitives.length === 0) {
    return {
      sdfFunction: 'vec3 sceneSDF(vec3 p) { return vec3(1000.0, 0.0, 0.0); }',
      primitiveData: [],
      materialIds: []
    };
  }
  
  let sdfCode = `vec3 sceneSDF(vec3 p) {\n  float result = ${maxDistance}.0;\n  float current;\n  int materialIndex = 0;\n  int primitiveIndex = 0;\n  vec3 pTransformed;\n`;
  const primitiveData: Array<{ type: string; params: number[] }> = [];
  const materialIds: number[] = [];

  primitives.forEach((primitive, index) => {
    const pos = `vec3(${primitive.position.join(', ')})`;
    const matIndex = materialIndexMap.get(primitive.materialId) || 0;
    materialIds.push(matIndex);
    primitiveData.push({ type: primitive.type, params: primitive.params });
    
    const rotation = primitive.rotation || [0, 0, 0];
    const scale = primitive.scale || [1, 1, 1];
    const hasRotation = rotation.some(r => r !== 0);
    const hasScale = scale.some(s => s !== 1);
    const hasTransform = hasRotation || hasScale;
    
    if (hasTransform) {
      sdfCode += `  pTransformed = applyInverseTransform(p - ${pos}, vec3(${rotation.join(', ')}), vec3(${scale.join(', ')}));\n`;
    } else {
      sdfCode += `  pTransformed = p - ${pos};\n`;
    }
    
    switch (primitive.type) {
      case 'sphere':
        sdfCode += `  current = sdSphere(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'box':
        sdfCode += `  current = sdBox(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}));\n`;
        break;
      case 'cylinder':
        sdfCode += `  current = sdCylinder(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
        break;
      case 'pyramid':
        sdfCode += `  current = sdPyramid(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'torus':
        sdfCode += `  current = sdTorus(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
        break;
      case 'cone':
        sdfCode += `  current = sdCone(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}), ${primitive.params[2]});\n`;
        break;
      case 'octahedron':
        sdfCode += `  current = sdOctahedron(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'capsule':
        const endPos = `vec3(${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]})`;
        sdfCode += `  current = sdCapsule(p, ${pos}, ${endPos}, ${primitive.params[3]});\n`;
        break;
      case 'porbital':
        sdfCode += `  current = sdPOrbital(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'dorbital':
        sdfCode += `  current = sdDOrbital(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'hexprism':
        sdfCode += `  current = sdHexPrism(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
        break;
      case 'triPrism':
        sdfCode += `  current = sdTriPrism(pTransformed, vec2(${primitive.params[0]}, ${primitive.params[1]}));\n`;
        break;
      case 'ellipsoid':
        sdfCode += `  current = sdEllipsoid(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}));\n`;
        break;
      case 'roundedBox':
        sdfCode += `  current = sdRoundedBox(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}), ${primitive.params[3]});\n`;
        break;
      case 'cappedCylinder':
        sdfCode += `  current = sdCappedCylinder(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
        break;
      case 'plane':
        sdfCode += `  current = sdPlane(pTransformed, vec3(${primitive.params.slice(0, 3).join(', ')}), ${primitive.params[3]});\n`;
        break;
      case 'roundCone':
        sdfCode += `  current = sdRoundCone(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
        break;
      case 'mengerSponge':
        sdfCode += `  current = sdMengerSponge(pTransformed, ${primitive.params[0]});\n`;
        break;
      case 'gyroid':
        sdfCode += `  current = sdGyroid(pTransformed, ${primitive.params[0]}, ${primitive.params[1]});\n`;
        break;
      case 'superellipsoid':
        sdfCode += `  current = sdSuperellipsoid(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
        break;
      case 'torusKnot':
        sdfCode += `  current = sdTorusKnot(pTransformed, ${primitive.params[0]}, ${primitive.params[1]}, ${primitive.params[2]});\n`;
        break;
    }
    
    if (hasScale) {
      sdfCode += `  current = compensateSDFDistance(current, vec3(${scale.join(', ')}));\n`;
    }

    if (index === 0) {
      sdfCode += `  result = current;\n`;
      sdfCode += `  materialIndex = ${matIndex};\n`;
      sdfCode += `  primitiveIndex = ${index};\n`;
    } else {
      const op = primitive.operation || 'union';
      const strength = primitive.operationStrength || 0.1;
      
      switch (op) {
        case 'smooth-union':
          sdfCode += `  if (current < result) { result = opSmoothUnion(result, current, ${strength}); materialIndex = ${matIndex}; primitiveIndex = ${index}; }\n`;
          break;
        case 'subtract':
          sdfCode += `  result = opSubtraction(current, result);\n`;
          break;
        case 'intersect':
          sdfCode += `  result = opIntersection(result, current);\n`;
          break;
        default:
          sdfCode += `  if (current < result) { result = current; materialIndex = ${matIndex}; primitiveIndex = ${index}; }\n`;
      }
    }
  });

  sdfCode += `  return vec3(result, float(materialIndex), float(primitiveIndex));\n}`;
  return { sdfFunction: sdfCode, primitiveData, materialIds };
}

export function generatePrimitiveUVFunction(primitives: SDFPrimitive[]): string {
  return primitives.map((prim, idx) => `
    ${idx > 0 ? 'else ' : ''}if (primitiveIndex == ${idx}) {
      ${generateUVForPrimitive(prim)}
    }`).join('');
}

function generateUVForPrimitive(prim: SDFPrimitive): string {
  switch (prim.type) {
    case 'sphere':
      return `return uvSphere(p, ${prim.params[0]});`;
    case 'box':
      return `return uvBox(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
    case 'cylinder':
      return `return uvCylinder(p, ${prim.params[0]}, ${prim.params[1]});`;
    case 'torus':
      return `return uvTorus(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
    case 'pyramid':
      return `return uvPyramid(p, ${prim.params[0]});`;
    case 'cone':
      return `return uvCone(p, ${prim.params[2]});`;
    case 'octahedron':
      return `return uvOctahedron(p, ${prim.params[0]});`;
    case 'hexprism':
      return `return uvHexPrism(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
    case 'capsule':
      return `return uvCapsule(p, vec3(${prim.position.join(', ')}), vec3(${prim.params.slice(0, 3).join(', ')}), ${prim.params[3]});`;
    case 'triPrism':
      return `return uvTriPrism(p, vec2(${prim.params[0]}, ${prim.params[1]}));`;
    case 'ellipsoid':
      return `return uvEllipsoid(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
    case 'roundedBox':
      return `return uvRoundedBox(p, vec3(${prim.params.slice(0, 3).join(', ')}), ${prim.params[3]});`;
    case 'cappedCylinder':
      return `return uvCappedCylinder(p, ${prim.params[0]}, ${prim.params[1]});`;
    case 'plane':
      return `return uvPlane(p, vec3(${prim.params.slice(0, 3).join(', ')}));`;
    case 'roundCone':
      return `return uvRoundCone(p, ${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]});`;
    case 'mengerSponge':
      return `return uvMengerSponge(p, ${prim.params[0]});`;
    case 'gyroid':
      return `return uvGyroid(p, ${prim.params[0]});`;
    case 'superellipsoid':
      return `return uvSuperellipsoid(p, vec3(${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]}));`;
    case 'torusKnot':
      return `return uvTorusKnot(p, ${prim.params[0]}, ${prim.params[1]}, ${prim.params[2]});`;
    case 'porbital':
      return `return uvPOrbital(p, ${prim.params[0]});`;
    case 'dorbital':
      return `return uvDOrbital(p, ${prim.params[0]});`;
    default:
      return `return vec2(0.0);`;
  }
}
