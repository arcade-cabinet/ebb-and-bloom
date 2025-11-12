export const SDF_UV_GENERATION_GLSL = `
// UV coordinate generation for SDF primitives

vec2 uvSphere(vec3 p, float radius) {
  vec3 n = normalize(p);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

vec2 uvBox(vec3 p, vec3 boxSize) {
  vec3 absP = abs(p);
  vec3 n = normalize(p);
  vec2 uv;
  
  float maxComp = max(absP.x, max(absP.y, absP.z));
  
  if (abs(maxComp - absP.x) < 0.001) {
    uv = vec2(p.z, p.y) / (boxSize.xz * 2.0) + 0.5;
  } else if (abs(maxComp - absP.y) < 0.001) {
    uv = vec2(p.x, p.z) / (boxSize.xz * 2.0) + 0.5;
  } else {
    uv = vec2(p.x, p.y) / (boxSize.xy * 2.0) + 0.5;
  }
  
  return uv;
}

vec2 uvCylinder(vec3 p, float height, float radius) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

vec2 uvTorus(vec3 p, vec2 torusParams) {
  float majorRadius = torusParams.x;
  float minorRadius = torusParams.y;
  
  vec2 q = vec2(length(p.xz) - majorRadius, p.y);
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = 0.5 + atan(q.y, q.x) / (2.0 * 3.14159265359);
  return vec2(u, v);
}

vec2 uvPyramid(vec3 p, float height) {
  vec3 absP = abs(p);
  float u = p.x / height + 0.5;
  float v = p.z / height + 0.5;
  return vec2(u, v);
}

vec2 uvCone(vec3 p, float height) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

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

vec2 uvHexPrism(vec3 p, vec2 params) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + params.y) / (2.0 * params.y);
  return vec2(u, v);
}

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

vec2 uvTriPrism(vec3 p, vec2 params) {
  float u = (p.x / params.x + 1.0) * 0.5;
  float v = (p.z / params.x + 1.0) * 0.5;
  return vec2(u, v);
}

vec2 uvEllipsoid(vec3 p, vec3 radii) {
  vec3 n = normalize(p / radii);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

vec2 uvRoundedBox(vec3 p, vec3 boxSize, float radius) {
  return uvBox(p, boxSize);
}

vec2 uvCappedCylinder(vec3 p, float height, float radius) {
  return uvCylinder(p, height, radius);
}

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

vec2 uvRoundCone(vec3 p, float r1, float r2, float height) {
  float u = 0.5 + atan(p.z, p.x) / (2.0 * 3.14159265359);
  float v = (p.y + height) / (2.0 * height);
  return vec2(u, v);
}

vec2 uvMengerSponge(vec3 p, float size) {
  return uvBox(p, vec3(size));
}

vec2 uvGyroid(vec3 p, float scale) {
  return p.xy * scale * 0.1;
}

vec2 uvSuperellipsoid(vec3 p, vec3 params) {
  vec3 n = normalize(p);
  float u = 0.5 + atan(n.z, n.x) / (2.0 * 3.14159265359);
  float v = 0.5 - asin(n.y) / 3.14159265359;
  return vec2(u, v);
}

vec2 uvTorusKnot(vec3 p, float p_val, float q_val, float scale) {
  float theta = atan(p.y, p.x);
  float u = theta / (2.0 * 3.14159265359) + 0.5;
  float v = length(p) / scale;
  return vec2(u, v);
}

vec2 uvPOrbital(vec3 p, float size) {
  return uvSphere(p, size);
}

vec2 uvDOrbital(vec3 p, float size) {
  return uvTorus(p, vec2(size * 0.5, size * 0.1));
}

vec2 applyUVTransform(vec2 uv, vec2 tiling, vec2 offset) {
  return uv * tiling + offset;
}
`;
