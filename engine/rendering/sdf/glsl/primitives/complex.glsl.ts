export const COMPLEX_PRIMITIVES_GLSL = `
// Complex SDF primitives

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
