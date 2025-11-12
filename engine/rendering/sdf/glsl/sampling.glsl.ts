export const SDF_SURFACE_NORMALS_GLSL = `
// Surface normal calculation

vec3 normalSphere(vec3 p, float radius) {
  return normalize(p);
}

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

vec3 normalTorus(vec3 p, float majorRadius, float minorRadius) {
  float angle = atan(p.z, p.x);
  vec3 torusCenter = vec3(cos(angle) * majorRadius, 0.0, sin(angle) * majorRadius);
  return normalize(p - torusCenter);
}

vec3 normalEllipsoid(vec3 p, vec3 radii) {
  vec3 scaled = vec3(
    p.x / (radii.x * radii.x),
    p.y / (radii.y * radii.y),
    p.z / (radii.z * radii.z)
  );
  return normalize(scaled);
}

vec3 normalCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  vec3 closestPoint = a + ba * h;
  return normalize(p - closestPoint);
}

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
// Surface point sampling

vec3 sampleSphereFibonacci(int index, int numPoints, float radius) {
  float goldenRatio = 1.618033988749895;
  float theta = 2.0 * 3.14159265359 * float(index) / goldenRatio;
  float phi = acos(1.0 - 2.0 * (float(index) + 0.5) / float(numPoints));
  
  float x = radius * sin(phi) * cos(theta);
  float y = radius * sin(phi) * sin(theta);
  float z = radius * cos(phi);
  
  return vec3(x, y, z);
}

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
// Attachment orientation alignment

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

vec3 alignToSurface(vec3 attachmentPoint, vec3 surfaceNormal, vec3 foreignBodyOffset) {
  vec3 up = vec3(0.0, 1.0, 0.0);
  mat3 rotation = rotationBetweenVectors(up, surfaceNormal);
  vec3 rotatedOffset = rotation * foreignBodyOffset;
  return attachmentPoint + rotatedOffset;
}

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
