/**
 * SDF PRIMITIVES - GLSL Functions
 * 
 * Collection of Signed Distance Field functions for all geometric primitives.
 * Tests full capabilities of raymarching architecture.
 */

export const SDF_PRIMITIVES_GLSL = `
// Basic primitives
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCone(vec3 p, vec2 c, float h) {
  // c is the sin/cos of the angle
  vec2 q = h * vec2(c.x / c.y, -1.0);
  vec2 w = vec2(length(p.xz), p.y);
  vec2 a = w - q * clamp(dot(w, q) / dot(q, q), 0.0, 1.0);
  vec2 b = w - q * vec2(clamp(w.x / q.x, 0.0, 1.0), 1.0);
  float k = sign(q.y);
  float d = min(dot(a, a), dot(b, b));
  float s = max(k * (w.x * q.y - w.y * q.x), k * (w.y - q.y));
  return sqrt(d) * sign(s);
}

float sdPyramid(vec3 p, float h) {
  float m2 = h * h + 0.25;
  
  // Symmetry
  p.xz = abs(p.xz);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  // Project onto edge
  vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);

  float s = max(-q.x, 0.0);
  float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);

  float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
  float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);

  float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);

  // Recover 3D and scale, and add sign
  return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  float m = p.x + p.y + p.z - s;
  
  vec3 q;
  if (3.0 * p.x < m) q = p.xyz;
  else if (3.0 * p.y < m) q = p.yzx;
  else if (3.0 * p.z < m) q = p.zxy;
  else return m * 0.57735027;
  
  float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
  return length(vec3(q.x, q.y - s + k, q.z - k));
}

float sdHexPrism(vec3 p, vec2 h) {
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
  vec2 d = vec2(
    length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x),
    p.z - h.y
  );
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// Advanced primitives for molecular shapes
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdTriPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

// Molecular orbital shapes
float sdPOrbital(vec3 p, float size) {
  // Dumbbell shape for p orbitals
  vec3 p1 = p - vec3(0, size * 0.3, 0);
  vec3 p2 = p + vec3(0, size * 0.3, 0);
  float s1 = sdSphere(p1, size * 0.4);
  float s2 = sdSphere(p2, size * 0.4);
  return min(s1, s2);
}

float sdDOrbital(vec3 p, float size) {
  // Cloverleaf shape for d orbitals
  float torus1 = sdTorus(p, vec2(size * 0.5, size * 0.1));
  vec3 pRotated = vec3(p.x, p.z, p.y); // Rotate 90°
  float torus2 = sdTorus(pRotated, vec2(size * 0.5, size * 0.1));
  return min(torus1, torus2);
}
`;

export const SDF_OPERATIONS_GLSL = `
// Boolean operations for combining shapes

// Union (OR)
float opUnion(float d1, float d2) {
  return min(d1, d2);
}

// Subtraction (NOT)  
float opSubtraction(float d1, float d2) {
  return max(-d1, d2);
}

// Intersection (AND)
float opIntersection(float d1, float d2) {
  return max(d1, d2);
}

// Smooth operations for organic blending
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSmoothSubtraction(float d1, float d2, float k) {
  float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
  return mix(d2, -d1, h) + k * h * (1.0 - h);
}

float opSmoothIntersection(float d1, float d2, float k) {
  float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) + k * h * (1.0 - h);
}

// Displacement for surface detail
float opDisplace(vec3 p, float d) {
  float displacement = sin(5.0 * p.x) * sin(5.0 * p.y) * sin(5.0 * p.z) * 0.1;
  return d + displacement;
}

// Repetition for crystals/lattices
float opRep(vec3 p, vec3 c) {
  return length(mod(p + 0.5 * c, c) - 0.5 * c);
}
`;

export const SDF_MATERIALS_GLSL = `
// Material definitions for different element types

struct Material {
  vec3 albedo;
  float metallic;
  float roughness;
  float emission;
  vec3 emissiveColor;
  float transparency;
};

Material getMaterial(int materialId) {
  if (materialId == 0) { // Hydrogen
    return Material(
      vec3(1.0, 1.0, 1.0),    // White
      0.0,                     // Non-metallic
      0.8,                     // Rough
      0.1,                     // Slight glow
      vec3(1.0, 1.0, 1.0),    // White emission
      0.3                      // Semi-transparent
    );
  }
  else if (materialId == 1) { // Oxygen
    return Material(
      vec3(1.0, 0.05, 0.05),  // Deep red
      0.2,                     // Slightly metallic
      0.6,                     // Medium rough
      0.2,                     // Noticeable glow
      vec3(1.0, 0.1, 0.1),    // Red emission
      0.0                      // Opaque
    );
  }
  else if (materialId == 2) { // Carbon
    return Material(
      vec3(0.1, 0.1, 0.1),    // Dark gray
      0.1,                     // Low metallic
      0.9,                     // Very rough
      0.0,                     // No glow
      vec3(0.0, 0.0, 0.0),    // No emission
      0.0                      // Opaque
    );
  }
  else if (materialId == 3) { // Iron (metals)
    return Material(
      vec3(0.7, 0.7, 0.8),    // Metallic gray
      0.9,                     // Highly metallic
      0.1,                     // Very smooth
      0.05,                    // Minimal glow
      vec3(0.8, 0.8, 1.0),    // Cool emission
      0.0                      // Opaque
    );
  }
  else if (materialId == 4) { // Chemical bonds
    return Material(
      vec3(1.0, 1.0, 1.0),    // White bonds
      0.1,                     // Low metallic
      0.7,                     // Medium rough
      0.4,                     // Emissive glow
      vec3(0.8, 0.9, 1.0),    // Cool white emission
      0.0                      // Opaque
    );
  }
  
  // Default material
  return Material(
    vec3(0.5, 0.5, 0.5),
    0.5, 0.5, 0.0,
    vec3(1.0, 1.0, 1.0),
    0.0
  );
}
`;

export interface SDFPrimitive {
  type: 'sphere' | 'box' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'octahedron' | 'hexprism' | 'capsule' | 'porbital' | 'dorbital';
  position: [number, number, number];
  params: number[]; // Size parameters (for capsule: [endX, endY, endZ, radius])
  materialId: number;
  operation?: 'union' | 'subtract' | 'intersect' | 'smooth-union' | 'smooth-subtract';
  operationStrength?: number;
}

export interface SDFScene {
  primitives: SDFPrimitive[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  lighting: {
    ambient: number;
    directional: {
      direction: [number, number, number];
      intensity: number;
    };
  };
}