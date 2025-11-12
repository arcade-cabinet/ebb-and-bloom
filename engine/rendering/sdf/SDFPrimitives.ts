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

// NEW PRIMITIVES (Phase 0.1)

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  if (k0 < 1.0) return k0 * (k0 - 1.0) / k1;
  return length(p) - r.x;
}

float sdRoundedBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0)) - r;
}

float sdCappedCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdPlane(vec3 p, vec3 n, float h) {
  return dot(p, normalize(n)) + h;
}

float sdRoundCone(vec3 p, float r1, float r2, float h) {
  vec2 q = vec2(length(p.xz), p.y);
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  float k = dot(q, vec2(-b, a));
  if (k < 0.0) return length(q) - r1;
  if (k > a * h) return length(q - vec2(0.0, h)) - r2;
  return dot(q, vec2(a, b)) - r1;
}

float sdMengerSponge(vec3 p, float size) {
  float d = sdBox(p, vec3(size));
  float s = size;
  for (int i = 0; i < 3; i++) {
    vec3 a = mod(p * s, 2.0) - 1.0;
    s *= 3.0;
    vec3 r = abs(1.0 - 3.0 * abs(a));
    float da = max(r.x, r.y);
    float db = max(r.y, r.z);
    float dc = max(r.z, r.x);
    float c = (min(da, min(db, dc)) - 1.0) / s;
    d = max(d, c);
  }
  return d;
}

float sdGyroid(vec3 p, float scale, float thickness) {
  p *= scale;
  float gyroid = abs(dot(sin(p), cos(p.yzx))) - thickness;
  return gyroid / scale;
}

float sdSuperellipsoid(vec3 p, float e1, float e2, float size) {
  vec3 q = abs(p) / size;
  float x = pow(q.x, 2.0 / e2);
  float y = pow(q.y, 2.0 / e2);
  float z = pow(q.z, 2.0 / e2);
  return (pow(pow(x + y, e2 / e1) + pow(z, 2.0 / e1), e1 / 2.0) - 1.0) * size;
}

float sdTorusKnot(vec3 p, float p_val, float q_val, float scale) {
  float r1 = 0.5 * scale;
  float r2 = 0.15 * scale;
  
  float theta = atan(p.y, p.x);
  float phi = atan(p.z, length(p.xy) - r1);
  
  float x = (r1 + r2 * cos(q_val * phi)) * cos(p_val * theta);
  float y = (r1 + r2 * cos(q_val * phi)) * sin(p_val * theta);
  float z = r2 * sin(q_val * phi);
  
  return length(p - vec3(x, y, z)) - 0.05 * scale;
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

export const SDF_COORDINATE_TARGETING_GLSL = `
// Coordinate targeting functions for precise material application
// Phase 0.3 - Complete targeting system for bacteria-style organisms

// ============================================================================
// SURFACE/VOLUME/EDGE/VERTEX DETECTION (Phase 0.3)
// ============================================================================

// Surface detection - returns 1.0 if point is on surface, 0.0 otherwise
float isSurface(vec3 p, float sdf, float threshold) {
  return 1.0 - smoothstep(0.0, threshold, abs(sdf));
}

// Volume detection - returns 1.0 if point is inside volume, 0.0 otherwise
float isVolume(vec3 p, float sdf) {
  return step(sdf, 0.0);
}

// Edge detection - returns 1.0 near edges (surface curvature changes)
// Uses gradient magnitude of the SDF to detect edges
float isEdge(vec3 p, float sdf, float edgeWidth) {
  // Approximate gradient using central differences
  float eps = edgeWidth * 0.1;
  vec3 grad = vec3(
    sdf - abs(length(p + vec3(eps, 0, 0)) - length(p)),
    sdf - abs(length(p + vec3(0, eps, 0)) - length(p)),
    sdf - abs(length(p + vec3(0, 0, eps)) - length(p))
  ) / eps;
  
  float gradientMag = length(grad);
  // Higher gradient magnitude indicates edge/corner
  return smoothstep(0.5, 2.0, gradientMag);
}

// Vertex detection - returns 1.0 near vertices/corners
// Detects points where multiple edges meet
float isVertex(vec3 p, float sdf, float vertexRadius) {
  // Use second derivative approximation to detect high curvature
  float eps = vertexRadius * 0.1;
  
  // Sample SDF in multiple directions
  float d0 = sdf;
  float dx = abs(length(p + vec3(eps, 0, 0)) - length(p));
  float dy = abs(length(p + vec3(0, eps, 0)) - length(p));
  float dz = abs(length(p + vec3(0, 0, eps)) - length(p));
  
  // Compute variance in distances (high variance = vertex)
  float mean = (dx + dy + dz) / 3.0;
  float variance = (pow(dx - mean, 2.0) + pow(dy - mean, 2.0) + pow(dz - mean, 2.0)) / 3.0;
  
  return smoothstep(0.0, vertexRadius, variance * 10.0);
}

// ============================================================================
// INDIVIDUAL REGION FUNCTIONS (Phase 0.3)
// ============================================================================

// Top region (y > 0)
float isTop(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, p.y);
  }
  return step(0.0, p.y);
}

// Bottom region (y < 0)
float isBottom(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, -p.y);
  }
  return step(0.0, -p.y);
}

// Sides region (equatorial band)
float isSides(vec3 p, float blendRadius) {
  float yNorm = abs(p.y) / (length(p.xz) + 0.0001);
  if (blendRadius > 0.0) {
    return 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, yNorm);
  }
  return 1.0 - smoothstep(0.3, 0.5, yNorm);
}

// Front region (z > 0)
float isFront(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, p.z);
  }
  return step(0.0, p.z);
}

// Back region (z < 0)
float isBack(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, -p.z);
  }
  return step(0.0, -p.z);
}

// Left region (x < 0)
float isLeft(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, -p.x);
  }
  return step(0.0, -p.x);
}

// Right region (x > 0)
float isRight(vec3 p, float blendRadius) {
  if (blendRadius > 0.0) {
    return smoothstep(-blendRadius, blendRadius, p.x);
  }
  return step(0.0, p.x);
}

// ============================================================================
// UNIFIED MASK FUNCTION (Phase 0.3)
// ============================================================================

// Get targeting mask value (0-1) for a given point and target specification
// targetType: 0=surface, 1=volume, 2=edge, 3=vertex
// regionType: 0=all, 1=top, 2=bottom, 3=sides, 4=front, 5=back, 6=left, 7=right
float getMask(vec3 p, float sdf, int targetType, int regionType, float blendRadius, float param) {
  // First, apply target type mask
  float targetMask = 1.0;
  if (targetType == 0) {
    // Surface
    targetMask = isSurface(p, sdf, param);
  } else if (targetType == 1) {
    // Volume
    targetMask = isVolume(p, sdf);
  } else if (targetType == 2) {
    // Edge
    targetMask = isEdge(p, sdf, param);
  } else if (targetType == 3) {
    // Vertex
    targetMask = isVertex(p, sdf, param);
  }
  
  // Then, apply region mask
  float regionMask = 1.0;
  if (regionType == 1) {
    regionMask = isTop(p, blendRadius);
  } else if (regionType == 2) {
    regionMask = isBottom(p, blendRadius);
  } else if (regionType == 3) {
    regionMask = isSides(p, blendRadius);
  } else if (regionType == 4) {
    regionMask = isFront(p, blendRadius);
  } else if (regionType == 5) {
    regionMask = isBack(p, blendRadius);
  } else if (regionType == 6) {
    regionMask = isLeft(p, blendRadius);
  } else if (regionType == 7) {
    regionMask = isRight(p, blendRadius);
  }
  
  // Combine masks (AND operation)
  return targetMask * regionMask;
}

// ============================================================================
// LEGACY FUNCTIONS (Maintained for backward compatibility)
// ============================================================================

// Surface classification - determines if point is on surface
bool classifySurface(vec3 p, float sdf, float threshold) {
  return abs(sdf) < threshold;
}

// Region classification - determines which region a point belongs to
// Returns a value from 0.0 to 1.0 indicating region membership
float classifyRegion(vec3 p, int regionType) {
  // regionType encoding:
  // 0 = all (always 1.0)
  // 1 = top (p.y > 0)
  // 2 = bottom (p.y < 0)
  // 3 = sides (abs(p.y) < threshold)
  // 4 = front (p.z > 0)
  // 5 = back (p.z < 0)
  // 6 = left (p.x < 0)
  // 7 = right (p.x > 0)
  
  if (regionType == 0) {
    return 1.0;
  } else if (regionType == 1) {
    return step(0.0, p.y);
  } else if (regionType == 2) {
    return step(0.0, -p.y);
  } else if (regionType == 3) {
    float yNorm = abs(p.y) / (abs(p.x) + abs(p.y) + abs(p.z) + 0.0001);
    return 1.0 - smoothstep(0.3, 0.5, yNorm);
  } else if (regionType == 4) {
    return step(0.0, p.z);
  } else if (regionType == 5) {
    return step(0.0, -p.z);
  } else if (regionType == 6) {
    return step(0.0, -p.x);
  } else if (regionType == 7) {
    return step(0.0, p.x);
  }
  
  return 0.0;
}

// Smooth region classification with blending
float classifyRegionSmooth(vec3 p, int regionType, float blendRadius) {
  if (regionType == 0) {
    return 1.0;
  } else if (regionType == 1) {
    return smoothstep(-blendRadius, blendRadius, p.y);
  } else if (regionType == 2) {
    return smoothstep(-blendRadius, blendRadius, -p.y);
  } else if (regionType == 3) {
    float yNorm = abs(p.y) / (length(p.xz) + 0.0001);
    return 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, yNorm);
  } else if (regionType == 4) {
    return smoothstep(-blendRadius, blendRadius, p.z);
  } else if (regionType == 5) {
    return smoothstep(-blendRadius, blendRadius, -p.z);
  } else if (regionType == 6) {
    return smoothstep(-blendRadius, blendRadius, -p.x);
  } else if (regionType == 7) {
    return smoothstep(-blendRadius, blendRadius, p.x);
  }
  
  return 0.0;
}

// Box-specific region classification (for faces)
float classifyBoxRegion(vec3 p, vec3 boxSize, int regionType, float blendRadius) {
  vec3 d = abs(p) - boxSize;
  float maxD = max(d.x, max(d.y, d.z));
  
  if (regionType == 0) {
    return 1.0;
  } else if (regionType == 1) {
    float isTopFace = smoothstep(blendRadius, -blendRadius, abs(d.y - maxD));
    float isTop = step(0.0, p.y);
    return isTopFace * isTop;
  } else if (regionType == 2) {
    float isBottomFace = smoothstep(blendRadius, -blendRadius, abs(d.y - maxD));
    float isBottom = step(0.0, -p.y);
    return isBottomFace * isBottom;
  } else if (regionType == 3) {
    float isNotTopBottom = 1.0 - smoothstep(-blendRadius, blendRadius, abs(d.y - maxD));
    return isNotTopBottom;
  } else if (regionType == 4) {
    float isFrontFace = smoothstep(blendRadius, -blendRadius, abs(d.z - maxD));
    float isFront = step(0.0, p.z);
    return isFrontFace * isFront;
  } else if (regionType == 5) {
    float isBackFace = smoothstep(blendRadius, -blendRadius, abs(d.z - maxD));
    float isBack = step(0.0, -p.z);
    return isBackFace * isBack;
  } else if (regionType == 6) {
    float isLeftFace = smoothstep(blendRadius, -blendRadius, abs(d.x - maxD));
    float isLeft = step(0.0, -p.x);
    return isLeftFace * isLeft;
  } else if (regionType == 7) {
    float isRightFace = smoothstep(blendRadius, -blendRadius, abs(d.x - maxD));
    float isRight = step(0.0, p.x);
    return isRightFace * isRight;
  }
  
  return 0.0;
}

// Sphere-specific region classification (hemispheres)
float classifySphereRegion(vec3 p, float radius, int regionType, float blendRadius) {
  vec3 pNorm = normalize(p);
  
  if (regionType == 0) {
    return 1.0;
  } else if (regionType == 1) {
    return smoothstep(-blendRadius, blendRadius, pNorm.y);
  } else if (regionType == 2) {
    return smoothstep(-blendRadius, blendRadius, -pNorm.y);
  } else if (regionType == 3) {
    return 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, abs(pNorm.y));
  } else if (regionType == 4) {
    return smoothstep(-blendRadius, blendRadius, pNorm.z);
  } else if (regionType == 5) {
    return smoothstep(-blendRadius, blendRadius, -pNorm.z);
  } else if (regionType == 6) {
    return smoothstep(-blendRadius, blendRadius, -pNorm.x);
  } else if (regionType == 7) {
    return smoothstep(-blendRadius, blendRadius, pNorm.x);
  }
  
  return 0.0;
}

// Blend between two values with smooth transition
float blendRegions(float value1, float value2, float blendFactor) {
  return mix(value1, value2, blendFactor);
}

// Blend between two vec3 values
vec3 blendRegionsVec3(vec3 value1, vec3 value2, float blendFactor) {
  return mix(value1, value2, blendFactor);
}
`;

export const SDF_TRANSFORMS_GLSL = `
// 3D Transformation functions for SDF primitives
// Implements proper inverse transforms and distance field compensation

// Individual rotation matrices (right-handed coordinate system)
mat3 rotateX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, -s,
    0.0, s, c
  );
}

mat3 rotateY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateZ(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, -s, 0.0,
    s, c, 0.0,
    0.0, 0.0, 1.0
  );
}

// Euler to rotation matrix (ZYX order - intrinsic rotations)
mat3 eulerToRotation(vec3 euler) {
  // Build complete rotation matrix from Euler angles (in radians)
  // Order: Z * Y * X (matches common 3D conventions)
  return rotateZ(euler.z) * rotateY(euler.y) * rotateX(euler.x);
}

// Apply INVERSE rotation for SDF sampling
// For SDF transforms, we need to apply the inverse transform to the point
vec3 applyInverseRotation(vec3 p, vec3 eulerAngles) {
  // Inverse rotation = transpose of rotation matrix (since orthogonal)
  // OR apply rotations in reverse order with negated angles
  mat3 rot = eulerToRotation(eulerAngles);
  // Transpose the matrix for inverse (rotation matrices are orthogonal)
  mat3 invRot = mat3(
    rot[0][0], rot[1][0], rot[2][0],
    rot[0][1], rot[1][1], rot[2][1],
    rot[0][2], rot[1][2], rot[2][2]
  );
  return invRot * p;
}

// Apply INVERSE scale for SDF sampling
vec3 applyInverseScale(vec3 p, vec3 scale) {
  // Divide by scale to get inverse transform
  return p / scale;
}

// Get scale compensation factor for distance field
// When scaling, distances are scaled too, so we need to compensate
float getScaleCompensation(vec3 scale) {
  // Use minimum scale component to maintain conservative distance estimates
  return min(min(scale.x, scale.y), scale.z);
}

// Apply complete inverse transform (rotation + scale)
// Returns transformed point
vec3 applyInverseTransform(vec3 p, vec3 rotation, vec3 scale) {
  // Forward transform: local -> scale -> rotate -> world  
  // Inverse: world -> inverse_rotate -> inverse_scale -> local
  // This ensures T(T^-1(p)) = p
  vec3 pRotated = applyInverseRotation(p, rotation);
  vec3 pScaled = applyInverseScale(pRotated, scale);
  return pScaled;
}

// Transform SDF result - compensates distance for non-uniform scaling
// Call this AFTER evaluating the SDF with the transformed point
float compensateSDFDistance(float distance, vec3 scale) {
  return distance * getScaleCompensation(scale);
}
`;

export const SDF_UV_GENERATION_GLSL = `
// UV coordinate generation for SDF primitives
// Each primitive type has its own UV mapping strategy

// Spherical mapping for sphere primitives
vec2 uvSphere(vec3 p, float radius) {
  vec3 n = normalize(p);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

// Planar mapping for box primitives (auto-detect face)
vec2 uvBox(vec3 p, vec3 boxSize) {
  vec3 absP = abs(p);
  vec3 n = normalize(p);
  vec2 uv;
  
  // Determine which face we're on
  float maxComp = max(absP.x, max(absP.y, absP.z));
  
  if (abs(maxComp - absP.x) < 0.001) {
    // X face
    uv = vec2(p.z, p.y) / (boxSize.xz * 2.0) + 0.5;
  } else if (abs(maxComp - absP.y) < 0.001) {
    // Y face (top/bottom)
    uv = vec2(p.x, p.z) / (boxSize.xz * 2.0) + 0.5;
  } else {
    // Z face
    uv = vec2(p.x, p.y) / (boxSize.xy * 2.0) + 0.5;
  }
  
  return uv;
}

// Cylindrical mapping for cylinder primitives
vec2 uvCylinder(vec3 p, float height, float radius) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

// Toroidal mapping for torus primitives
vec2 uvTorus(vec3 p, vec2 torusParams) {
  float majorRadius = torusParams.x;
  float minorRadius = torusParams.y;
  
  vec2 q = vec2(length(p.xz) - majorRadius, p.y);
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = 0.5 + atan(q.y, q.x) / (2.0 * 3.14159265359);
  return vec2(u, v);
}

// Planar mapping for pyramid primitives
vec2 uvPyramid(vec3 p, float height) {
  vec3 absP = abs(p);
  float u = p.x / height + 0.5;
  float v = p.z / height + 0.5;
  return vec2(u, v);
}

// Conical mapping for cone primitives
vec2 uvCone(vec3 p, float height) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

// Octahedral mapping
vec2 uvOctahedron(vec3 p, float size) {
  vec3 n = normalize(p);
  vec2 uv;
  if (n.y >= 0.0) {
    uv = n.xz / (abs(n.x) + abs(n.y) + abs(n.z));
  } else {
    vec2 temp = abs(n.xz) - 1.0;
    uv = (1.0 - abs(temp.yx)) * (step(0.0, n.xz) * 2.0 - 1.0);
  }
  return uv * 0.5 + 0.5;
}

// Hexagonal prism mapping
vec2 uvHexPrism(vec3 p, vec2 params) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + params.y) / (2.0 * params.y);
  return vec2(u, v);
}

// Capsule mapping
vec2 uvCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  vec3 closest = a + h * ba;
  vec3 dir = normalize(p - closest);
  
  float u = 0.5 + atan(dir.z, dir.x) / (2.0 * 3.14159265359);
  float v = h;
  return vec2(u, v);
}

// Triangular prism mapping
vec2 uvTriPrism(vec3 p, vec2 params) {
  float u = (p.x / params.x + 1.0) * 0.5;
  float v = (p.z / params.x + 1.0) * 0.5;
  return vec2(u, v);
}

// Ellipsoid mapping (similar to sphere but with scaling)
vec2 uvEllipsoid(vec3 p, vec3 radii) {
  vec3 n = normalize(p / radii);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

// Rounded box mapping (same as box)
vec2 uvRoundedBox(vec3 p, vec3 boxSize, float radius) {
  return uvBox(p, boxSize);
}

// Capped cylinder mapping (same as cylinder)
vec2 uvCappedCylinder(vec3 p, float height, float radius) {
  return uvCylinder(p, height, radius);
}

// Plane mapping
vec2 uvPlane(vec3 p, vec3 normal) {
  vec3 absN = abs(normal);
  vec2 uv;
  
  if (absN.y > absN.x && absN.y > absN.z) {
    uv = p.xz;
  } else if (absN.x > absN.z) {
    uv = p.yz;
  } else {
    uv = p.xy;
  }
  
  return uv * 0.1;
}

// Round cone mapping
vec2 uvRoundCone(vec3 p, float r1, float r2, float height) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

// Menger sponge mapping (box-based)
vec2 uvMengerSponge(vec3 p, float size) {
  return uvBox(p, vec3(size));
}

// Gyroid mapping (triplanar)
vec2 uvGyroid(vec3 p, float scale) {
  return p.xy * scale * 0.1;
}

// Superellipsoid mapping (similar to ellipsoid)
vec2 uvSuperellipsoid(vec3 p, vec3 params) {
  vec3 n = normalize(p);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

// Torus knot mapping
vec2 uvTorusKnot(vec3 p, float p_val, float q_val, float scale) {
  float theta = atan(p.y, p.x);
  float u = theta / (2.0 * 3.14159265359) + 0.5;
  float v = length(p) / scale;
  return vec2(u, v);
}

// P-orbital mapping (dumbbell shape)
vec2 uvPOrbital(vec3 p, float size) {
  return uvSphere(p, size);
}

// D-orbital mapping (cloverleaf)
vec2 uvDOrbital(vec3 p, float size) {
  return uvTorus(p, vec2(size * 0.5, size * 0.1));
}

// Apply tiling and offset to UV coordinates
vec2 applyUVTransform(vec2 uv, vec2 tiling, vec2 offset) {
  return uv * tiling + offset;
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

export const SDF_BLENDING_GLSL = `
// MATERIAL BLENDING SYSTEM (Phase 0.2)
// Provides smooth material transitions for organic biological rendering

// Simple 3D noise function for organic blending
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(
      mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
      mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x),
      f.y
    ),
    mix(
      mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
      mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x),
      f.y
    ),
    f.z
  );
}

// Material struct for blending operations
struct MaterialData {
  vec3 baseColor;
  float roughness;
  float metallic;
  float emission;
  vec3 emissiveColor;
  float opacity;
};

// Linear blend between two materials
// factor: 0.0 = mat1, 1.0 = mat2
MaterialData linearBlend(MaterialData mat1, MaterialData mat2, float factor) {
  float t = clamp(factor, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

// Smooth blend with smoothstep interpolation
// smoothness: higher values = smoother transition (typically 1.0-5.0)
MaterialData smoothBlend(MaterialData mat1, MaterialData mat2, float factor, float smoothness) {
  float t = clamp(factor, 0.0, 1.0);
  
  // Apply smoothstep for smoother transition
  t = smoothstep(0.0, 1.0, t);
  
  // Apply additional smoothing based on smoothness parameter
  if (smoothness > 1.0) {
    for (int i = 1; i < 5; i++) {
      if (float(i) < smoothness) {
        t = smoothstep(0.0, 1.0, t);
      }
    }
  }
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

// Noise-based blend for organic transitions
// scale: noise frequency (higher = more detail)
// p: world-space position for noise sampling
MaterialData noiseBlend(MaterialData mat1, MaterialData mat2, float factor, float scale, vec3 p) {
  float t = clamp(factor, 0.0, 1.0);
  
  // Sample 3D noise at world position
  float noiseValue = noise3D(p * scale);
  
  // Modulate blend factor with noise
  t = mix(t - 0.2, t + 0.2, noiseValue);
  t = clamp(t, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

// Gradient-based blend along a direction
// direction: normalized direction vector for gradient
// distance: distance over which to apply gradient
// p: world-space position
MaterialData gradientBlend(MaterialData mat1, MaterialData mat2, vec3 p, vec3 direction, float distance) {
  // Normalize direction if not already normalized
  vec3 dir = normalize(direction);
  
  // Calculate position along gradient direction
  float projection = dot(p, dir);
  
  // Map projection to 0-1 range based on distance
  float t = clamp(projection / distance + 0.5, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

// Distance-based blend (blend based on proximity to primitive surface)
// sdfDistance: signed distance from surface
// transitionDistance: distance over which to blend
MaterialData distanceBlend(MaterialData mat1, MaterialData mat2, float sdfDistance, float transitionDistance) {
  // Calculate blend factor based on distance from surface
  float t = clamp(abs(sdfDistance) / transitionDistance, 0.0, 1.0);
  
  return MaterialData(
    mix(mat1.baseColor, mat2.baseColor, t),
    mix(mat1.roughness, mat2.roughness, t),
    mix(mat1.metallic, mat2.metallic, t),
    mix(mat1.emission, mat2.emission, t),
    mix(mat1.emissiveColor, mat2.emissiveColor, t),
    mix(mat1.opacity, mat2.opacity, t)
  );
}

// Helper: Convert individual material properties to MaterialData struct
MaterialData makeMaterialData(vec3 baseColor, float roughness, float metallic, 
                               float emission, vec3 emissiveColor, float opacity) {
  return MaterialData(baseColor, roughness, metallic, emission, emissiveColor, opacity);
}

// Helper: Blend materials based on mode type
// mode: 0=linear, 1=smooth, 2=noise, 3=gradient, 4=distance
MaterialData blendMaterialsByMode(
  MaterialData mat1, 
  MaterialData mat2, 
  int mode,
  float factor,
  float param1,
  vec3 param2
) {
  if (mode == 0) {
    return linearBlend(mat1, mat2, factor);
  } else if (mode == 1) {
    return smoothBlend(mat1, mat2, factor, param1);
  } else if (mode == 2) {
    return noiseBlend(mat1, mat2, factor, param1, param2);
  } else if (mode == 3) {
    return gradientBlend(mat1, mat2, param2, normalize(vec3(param1, 0.5, 0.5)), 1.0);
  } else if (mode == 4) {
    return distanceBlend(mat1, mat2, factor, param1);
  }
  
  return linearBlend(mat1, mat2, factor);
}
`;

export const SDF_SURFACE_NORMALS_GLSL = `
// SURFACE NORMAL CALCULATION (Phase 0.4)
// Analytical surface normal functions for each primitive type
// Used for foreign body attachment and orientation alignment

// Sphere normal - radial direction from center
vec3 normalSphere(vec3 p, float radius) {
  return normalize(p);
}

// Box normal - perpendicular to nearest face
vec3 normalBox(vec3 p, vec3 size) {
  vec3 d = abs(p) - size;
  float maxComponent = max(d.x, max(d.y, d.z));
  
  if (abs(d.x - maxComponent) < 0.001) {
    return vec3(sign(p.x), 0.0, 0.0);
  } else if (abs(d.y - maxComponent) < 0.001) {
    return vec3(0.0, sign(p.y), 0.0);
  } else {
    return vec3(0.0, 0.0, sign(p.z));
  }
}

// Cylinder normal
vec3 normalCylinder(vec3 p, float height, float radius) {
  float radialDist = length(p.xz);
  float verticalDist = abs(p.y) - height;
  
  if (verticalDist > radialDist - radius) {
    return vec3(0.0, sign(p.y), 0.0);
  } else {
    vec3 radialNormal = normalize(vec3(p.x, 0.0, p.z));
    return radialNormal;
  }
}

// Torus normal
vec3 normalTorus(vec3 p, float majorRadius, float minorRadius) {
  float angle = atan(p.z, p.x);
  vec3 torusCenter = vec3(cos(angle) * majorRadius, 0.0, sin(angle) * majorRadius);
  return normalize(p - torusCenter);
}

// Ellipsoid normal
vec3 normalEllipsoid(vec3 p, vec3 radii) {
  vec3 scaled = vec3(
    p.x / (radii.x * radii.x),
    p.y / (radii.y * radii.y),
    p.z / (radii.z * radii.z)
  );
  return normalize(scaled);
}

// Capsule normal
vec3 normalCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  vec3 closestPoint = a + ba * h;
  return normalize(p - closestPoint);
}

// Generic numerical normal calculation for complex primitives
// Uses central differences with small epsilon
vec3 normalNumerical(vec3 p, float eps) {
  vec3 sdfResult = sceneSDF(p);
  float d = sdfResult.x;
  
  float dx = sceneSDF(p + vec3(eps, 0.0, 0.0)).x - sceneSDF(p - vec3(eps, 0.0, 0.0)).x;
  float dy = sceneSDF(p + vec3(0.0, eps, 0.0)).x - sceneSDF(p - vec3(0.0, eps, 0.0)).x;
  float dz = sceneSDF(p + vec3(0.0, 0.0, eps)).x - sceneSDF(p - vec3(0.0, 0.0, eps)).x;
  
  return normalize(vec3(dx, dy, dz));
}
`;

export const SDF_SURFACE_SAMPLING_GLSL = `
// SURFACE POINT SAMPLING (Phase 0.4)
// Functions for sampling points on primitive surfaces
// Used for foreign body attachment point generation

// Fibonacci sphere sampling - evenly distributed points on sphere
vec3 sampleSphereFibonacci(int index, int numPoints, float radius) {
  float goldenRatio = 1.618033988749895;
  float theta = 2.0 * 3.14159265359 * float(index) / goldenRatio;
  float phi = acos(1.0 - 2.0 * (float(index) + 0.5) / float(numPoints));
  
  float x = radius * sin(phi) * cos(theta);
  float y = radius * sin(phi) * sin(theta);
  float z = radius * cos(phi);
  
  return vec3(x, y, z);
}

// Sample point on box surface
vec3 sampleBoxSurface(int faceIndex, vec2 uv, vec3 size) {
  if (faceIndex == 0) {
    return vec3(uv.x * size.x * 2.0 - size.x, size.y, uv.y * size.z * 2.0 - size.z);
  } else if (faceIndex == 1) {
    return vec3(uv.x * size.x * 2.0 - size.x, -size.y, uv.y * size.z * 2.0 - size.z);
  } else if (faceIndex == 2) {
    return vec3(size.x, uv.x * size.y * 2.0 - size.y, uv.y * size.z * 2.0 - size.z);
  } else if (faceIndex == 3) {
    return vec3(-size.x, uv.x * size.y * 2.0 - size.y, uv.y * size.z * 2.0 - size.z);
  } else if (faceIndex == 4) {
    return vec3(uv.x * size.x * 2.0 - size.x, uv.y * size.y * 2.0 - size.y, size.z);
  } else {
    return vec3(uv.x * size.x * 2.0 - size.x, uv.y * size.y * 2.0 - size.y, -size.z);
  }
}

// Sample point on cylinder surface
vec3 sampleCylinderSurface(int section, vec2 uv, float height, float radius) {
  if (section == 0) {
    float theta = uv.x * 2.0 * 3.14159265359;
    float y = uv.y * height * 2.0 - height;
    return vec3(radius * cos(theta), y, radius * sin(theta));
  } else if (section == 1) {
    float r = sqrt(uv.x) * radius;
    float theta = uv.y * 2.0 * 3.14159265359;
    return vec3(r * cos(theta), height, r * sin(theta));
  } else {
    float r = sqrt(uv.x) * radius;
    float theta = uv.y * 2.0 * 3.14159265359;
    return vec3(r * cos(theta), -height, r * sin(theta));
  }
}
`;

export const SDF_ATTACHMENT_ALIGNMENT_GLSL = `
// ATTACHMENT ORIENTATION ALIGNMENT (Phase 0.4)
// Functions for aligning foreign bodies to host surface normals
// Enables proper orientation of attached primitives

// Calculate rotation matrix to align vector 'from' to vector 'to'
mat3 rotationBetweenVectors(vec3 from, vec3 to) {
  vec3 v = cross(from, to);
  float c = dot(from, to);
  float k = 1.0 / (1.0 + c);
  
  mat3 vx = mat3(
    0.0, -v.z, v.y,
    v.z, 0.0, -v.x,
    -v.y, v.x, 0.0
  );
  
  mat3 identity = mat3(1.0);
  
  return identity + vx + vx * vx * k;
}

// Align foreign body to surface normal
// Returns transformed position for foreign body
vec3 alignToSurface(vec3 attachmentPoint, vec3 surfaceNormal, vec3 foreignBodyOffset) {
  vec3 up = vec3(0.0, 1.0, 0.0);
  mat3 rotation = rotationBetweenVectors(up, surfaceNormal);
  vec3 rotatedOffset = rotation * foreignBodyOffset;
  return attachmentPoint + rotatedOffset;
}

// Calculate attachment transform (position + rotation)
// Returns: vec4(rotated offset, alignment factor)
vec4 calculateAttachmentTransform(vec3 surfacePoint, vec3 surfaceNormal, vec3 offset, bool alignWithSurface) {
  if (alignWithSurface) {
    vec3 up = vec3(0.0, 1.0, 0.0);
    mat3 rotation = rotationBetweenVectors(up, surfaceNormal);
    vec3 rotatedOffset = rotation * offset;
    return vec4(rotatedOffset, 1.0);
  } else {
    return vec4(offset, 0.0);
  }
}
`;

export const SDF_LIGHTING_GLSL = `
// ============================================================================
// LIGHTING SYSTEM FOR SDF RAYMARCHING (Phase 0.5)
// ============================================================================
// Integrates with R3F lighting to provide Phong/PBR shading and soft shadows

// Constants
#define PI 3.14159265359
#define MAX_LIGHTS 8

// ============================================================================
// NORMAL CALCULATION
// ============================================================================

// Calculate surface normal using gradient method
// More accurate than tetrahedron method for complex SDFs
vec3 calculateNormal(vec3 p) {
  const float eps = 0.001;
  const vec2 h = vec2(eps, 0.0);
  
  // Use sceneSDF to get gradients
  return normalize(vec3(
    sceneSDF(p + h.xyy).x - sceneSDF(p - h.xyy).x,
    sceneSDF(p + h.yxy).x - sceneSDF(p - h.yxy).x,
    sceneSDF(p + h.yyx).x - sceneSDF(p - h.yyx).x
  ));
}

// Alternative: Tetrahedron method (faster, slightly less accurate)
vec3 calculateNormalFast(vec3 p) {
  const float eps = 0.001;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * sceneSDF(p + k.xyy * eps).x +
    k.yyx * sceneSDF(p + k.yyx * eps).x +
    k.yxy * sceneSDF(p + k.yxy * eps).x +
    k.xxx * sceneSDF(p + k.xxx * eps).x
  );
}

// ============================================================================
// FRESNEL EFFECTS
// ============================================================================

// Schlick's approximation for Fresnel reflectance
float fresnelSchlick(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 fresnelSchlickVec3(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// ============================================================================
// PHONG LIGHTING MODEL
// ============================================================================

struct PhongMaterial {
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

vec3 phongShading(
  vec3 normal,
  vec3 viewDir,
  vec3 lightDir,
  vec3 lightColor,
  PhongMaterial material
) {
  // Ambient component (handled separately in main lighting)
  
  // Diffuse component (Lambert)
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * material.diffuse * lightColor;
  
  // Specular component (Blinn-Phong)
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), material.shininess);
  vec3 specular = spec * material.specular * lightColor;
  
  return diffuse + specular;
}

// ============================================================================
// PBR LIGHTING MODEL (Simplified)
// ============================================================================

struct PBRMaterial {
  vec3 albedo;
  float roughness;
  float metallic;
  vec3 emissive;
};

// Normal Distribution Function (GGX/Trowbridge-Reitz)
float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return nom / max(denom, 0.001);
}

// Geometry Function (Smith's Schlick-GGX)
float geometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  
  float nom = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  
  return nom / max(denom, 0.001);
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometrySchlickGGX(NdotV, roughness);
  float ggx1 = geometrySchlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

// PBR Shading (Cook-Torrance)
vec3 pbrShading(
  vec3 normal,
  vec3 viewDir,
  vec3 lightDir,
  vec3 lightColor,
  float lightIntensity,
  PBRMaterial material
) {
  vec3 N = normalize(normal);
  vec3 V = normalize(viewDir);
  vec3 L = normalize(lightDir);
  vec3 H = normalize(V + L);
  
  // Calculate F0 (base reflectivity)
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, material.albedo, material.metallic);
  
  // Cook-Torrance BRDF
  float NDF = distributionGGX(N, H, material.roughness);
  float G = geometrySmith(N, V, L, material.roughness);
  vec3 F = fresnelSchlickVec3(max(dot(H, V), 0.0), F0);
  
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular = numerator / max(denominator, 0.001);
  
  // Energy conservation
  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - material.metallic;
  
  // Lambertian diffuse
  float NdotL = max(dot(N, L), 0.0);
  vec3 diffuse = kD * material.albedo / PI;
  
  // Final radiance
  return (diffuse + specular) * lightColor * lightIntensity * NdotL;
}

// ============================================================================
// SOFT SHADOWS
// ============================================================================

// Soft shadow via raymarching
// Returns value from 0.0 (full shadow) to 1.0 (no shadow)
// k controls shadow softness (higher = softer, typical: 8-32)
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  
  for (int i = 0; i < 64; i++) {
    if (t >= maxt) break;
    
    vec3 p = ro + t * rd;
    float h = sceneSDF(p).x;
    
    if (h < 0.001) {
      return 0.0;
    }
    
    res = min(res, k * h / t);
    t += clamp(h, 0.01, 0.2);
  }
  
  return clamp(res, 0.0, 1.0);
}

// Hard shadow (faster, binary result)
float hardShadow(vec3 ro, vec3 rd, float mint, float maxt) {
  float t = mint;
  
  for (int i = 0; i < 32; i++) {
    if (t >= maxt) break;
    
    vec3 p = ro + t * rd;
    float h = sceneSDF(p).x;
    
    if (h < 0.001) {
      return 0.0;
    }
    
    t += h;
  }
  
  return 1.0;
}

// ============================================================================
// AMBIENT OCCLUSION
// ============================================================================

// Ambient Occlusion approximation
// Samples the SDF around the point to estimate occlusion
float ambientOcclusion(vec3 p, vec3 n, float stepSize, int numSamples) {
  float ao = 0.0;
  float weight = 1.0;
  
  for (int i = 1; i <= numSamples; i++) {
    float dist = float(i) * stepSize;
    vec3 samplePos = p + n * dist;
    float sdf = sceneSDF(samplePos).x;
    
    // Expected distance vs actual distance
    ao += weight * (dist - sdf);
    weight *= 0.5;
  }
  
  return 1.0 - clamp(ao, 0.0, 1.0);
}

// Fast AO (fewer samples)
float ambientOcclusionFast(vec3 p, vec3 n) {
  return ambientOcclusion(p, n, 0.1, 5);
}

// High quality AO (more samples)
float ambientOcclusionHQ(vec3 p, vec3 n) {
  return ambientOcclusion(p, n, 0.05, 8);
}
`;

export interface TextureSet {
  diffuse?: string;
  normal?: string;
  roughness?: string;
  metallic?: string;
  ao?: string;
  emission?: string;
  tiling?: [number, number];
  offset?: [number, number];
}

export interface BlendMode {
  type: 'linear' | 'smooth' | 'noise' | 'gradient';
  strength: number;
  transitionDistance: number;
  noiseScale?: number;
  gradientDirection?: [number, number, number];
}

export interface CoordinateTarget {
  type: 'surface' | 'volume' | 'edge' | 'vertex';
  region: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right' | 'custom';
  customRegion?: (p: [number, number, number]) => boolean;
  blendRadius?: number;
  edgeWidth?: number;
  vertexRadius?: number;
}

export interface SDFPrimitive {
  type: 'sphere' | 'box' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'octahedron' | 
        'hexprism' | 'capsule' | 'porbital' | 'dorbital' | 'triPrism' |
        'ellipsoid' | 'roundedBox' | 'cappedCylinder' | 'plane' | 'roundCone' | 
        'mengerSponge' | 'gyroid' | 'superellipsoid' | 'torusKnot';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  params: number[];
  materialId: string;
  textureSet?: TextureSet;
  operation?: 'union' | 'subtract' | 'intersect' | 'smooth-union' | 'smooth-subtract';
  operationStrength?: number;
  blendMode?: BlendMode;
  coordinateTarget?: CoordinateTarget;
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