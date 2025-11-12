export const ORBITAL_PRIMITIVES_GLSL = `
// Molecular orbital SDF primitives

float sdPOrbital(vec3 p, float size) {
  vec3 p1 = p - vec3(0, size * 0.3, 0);
  vec3 p2 = p + vec3(0, size * 0.3, 0);
  float s1 = sdSphere(p1, size * 0.4);
  float s2 = sdSphere(p2, size * 0.4);
  return min(s1, s2);
}

float sdDOrbital(vec3 p, float size) {
  float torus1 = sdTorus(p, vec2(size * 0.5, size * 0.1));
  vec3 pRotated = vec3(p.x, p.z, p.y);
  float torus2 = sdTorus(pRotated, vec2(size * 0.5, size * 0.1));
  return min(torus1, torus2);
}
`;
