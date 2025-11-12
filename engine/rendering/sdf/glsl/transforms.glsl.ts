export const SDF_TRANSFORMS_GLSL = `
// 3D Transformation functions for SDF primitives

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

mat3 eulerToRotation(vec3 euler) {
  return rotateZ(euler.z) * rotateY(euler.y) * rotateX(euler.x);
}

vec3 applyInverseRotation(vec3 p, vec3 eulerAngles) {
  mat3 rot = eulerToRotation(eulerAngles);
  mat3 invRot = mat3(
    rot[0][0], rot[1][0], rot[2][0],
    rot[0][1], rot[1][1], rot[2][1],
    rot[0][2], rot[1][2], rot[2][2]
  );
  return invRot * p;
}

vec3 applyInverseScale(vec3 p, vec3 scale) {
  return p / scale;
}

float getScaleCompensation(vec3 scale) {
  return min(min(scale.x, scale.y), scale.z);
}

vec3 applyInverseTransform(vec3 p, vec3 rotation, vec3 scale) {
  vec3 pRotated = applyInverseRotation(p, rotation);
  vec3 pScaled = applyInverseScale(pRotated, scale);
  return pScaled;
}

float compensateSDFDistance(float distance, vec3 scale) {
  return distance * getScaleCompensation(scale);
}
`;
