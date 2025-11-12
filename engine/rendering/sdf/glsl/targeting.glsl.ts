export const SDF_COORDINATE_TARGETING_GLSL = `
// Coordinate targeting functions for precise material application

float isSurface(vec3 p, float sdf, float threshold) {
  return 1.0 - smoothstep(0.0, threshold, abs(sdf));
}

float isVolume(vec3 p, float sdf) {
  return step(sdf, 0.0);
}

float isEdge(vec3 p, float sdf, float edgeWidth) {
  float eps = edgeWidth * 0.1;
  vec3 grad = vec3(
    sdf - abs(length(p + vec3(eps, 0, 0)) - length(p)),
    sdf - abs(length(p + vec3(0, eps, 0)) - length(p)),
    sdf - abs(length(p + vec3(0, 0, eps)) - length(p))
  ) / eps;
  return smoothstep(0.5, 2.0, length(grad));
}

float isVertex(vec3 p, float sdf, float vertexRadius) {
  float eps = vertexRadius * 0.1;
  float dx = abs(length(p + vec3(eps, 0, 0)) - length(p));
  float dy = abs(length(p + vec3(0, eps, 0)) - length(p));
  float dz = abs(length(p + vec3(0, 0, eps)) - length(p));
  float mean = (dx + dy + dz) / 3.0;
  float variance = (pow(dx - mean, 2.0) + pow(dy - mean, 2.0) + pow(dz - mean, 2.0)) / 3.0;
  return smoothstep(0.0, vertexRadius, variance * 10.0);
}

float directionalMask(float coord, float blendRadius, bool positive) {
  float sign = positive ? 1.0 : -1.0;
  return blendRadius > 0.0 ? smoothstep(-blendRadius, blendRadius, coord * sign) : step(0.0, coord * sign);
}

float isTop(vec3 p, float blendRadius) { return directionalMask(p.y, blendRadius, true); }
float isBottom(vec3 p, float blendRadius) { return directionalMask(p.y, blendRadius, false); }
float isFront(vec3 p, float blendRadius) { return directionalMask(p.z, blendRadius, true); }
float isBack(vec3 p, float blendRadius) { return directionalMask(p.z, blendRadius, false); }
float isLeft(vec3 p, float blendRadius) { return directionalMask(p.x, blendRadius, false); }
float isRight(vec3 p, float blendRadius) { return directionalMask(p.x, blendRadius, true); }

float isSides(vec3 p, float blendRadius) {
  float yNorm = abs(p.y) / (length(p.xz) + 0.0001);
  return blendRadius > 0.0 ? 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, yNorm) : 1.0 - smoothstep(0.3, 0.5, yNorm);
}

float getMask(vec3 p, float sdf, int targetType, int regionType, float blendRadius, float param) {
  float targetMask = 1.0;
  if (targetType == 0) targetMask = isSurface(p, sdf, param);
  else if (targetType == 1) targetMask = isVolume(p, sdf);
  else if (targetType == 2) targetMask = isEdge(p, sdf, param);
  else if (targetType == 3) targetMask = isVertex(p, sdf, param);
  
  float regionMask = 1.0;
  if (regionType == 1) regionMask = isTop(p, blendRadius);
  else if (regionType == 2) regionMask = isBottom(p, blendRadius);
  else if (regionType == 3) regionMask = isSides(p, blendRadius);
  else if (regionType == 4) regionMask = isFront(p, blendRadius);
  else if (regionType == 5) regionMask = isBack(p, blendRadius);
  else if (regionType == 6) regionMask = isLeft(p, blendRadius);
  else if (regionType == 7) regionMask = isRight(p, blendRadius);
  
  return targetMask * regionMask;
}

bool classifySurface(vec3 p, float sdf, float threshold) {
  return abs(sdf) < threshold;
}

float classifyRegion(vec3 p, int regionType) {
  if (regionType == 0) return 1.0;
  if (regionType == 1) return step(0.0, p.y);
  if (regionType == 2) return step(0.0, -p.y);
  if (regionType == 3) {
    float yNorm = abs(p.y) / (abs(p.x) + abs(p.y) + abs(p.z) + 0.0001);
    return 1.0 - smoothstep(0.3, 0.5, yNorm);
  }
  if (regionType == 4) return step(0.0, p.z);
  if (regionType == 5) return step(0.0, -p.z);
  if (regionType == 6) return step(0.0, -p.x);
  if (regionType == 7) return step(0.0, p.x);
  return 0.0;
}

float classifyRegionSmooth(vec3 p, int regionType, float blendRadius) {
  if (regionType == 0) return 1.0;
  if (regionType == 1) return smoothstep(-blendRadius, blendRadius, p.y);
  if (regionType == 2) return smoothstep(-blendRadius, blendRadius, -p.y);
  if (regionType == 3) {
    float yNorm = abs(p.y) / (length(p.xz) + 0.0001);
    return 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, yNorm);
  }
  if (regionType == 4) return smoothstep(-blendRadius, blendRadius, p.z);
  if (regionType == 5) return smoothstep(-blendRadius, blendRadius, -p.z);
  if (regionType == 6) return smoothstep(-blendRadius, blendRadius, -p.x);
  if (regionType == 7) return smoothstep(-blendRadius, blendRadius, p.x);
  return 0.0;
}

float classifyBoxRegion(vec3 p, vec3 boxSize, int regionType, float blendRadius) {
  vec3 d = abs(p) - boxSize;
  float maxD = max(d.x, max(d.y, d.z));
  
  if (regionType == 0) return 1.0;
  
  float faceMask, dirMask;
  if (regionType == 1 || regionType == 2) {
    faceMask = smoothstep(blendRadius, -blendRadius, abs(d.y - maxD));
    dirMask = step(0.0, regionType == 1 ? p.y : -p.y);
    return faceMask * dirMask;
  }
  if (regionType == 3) return 1.0 - smoothstep(-blendRadius, blendRadius, abs(d.y - maxD));
  if (regionType == 4 || regionType == 5) {
    faceMask = smoothstep(blendRadius, -blendRadius, abs(d.z - maxD));
    dirMask = step(0.0, regionType == 4 ? p.z : -p.z);
    return faceMask * dirMask;
  }
  if (regionType == 6 || regionType == 7) {
    faceMask = smoothstep(blendRadius, -blendRadius, abs(d.x - maxD));
    dirMask = step(0.0, regionType == 7 ? p.x : -p.x);
    return faceMask * dirMask;
  }
  
  return 0.0;
}

float classifySphereRegion(vec3 p, float radius, int regionType, float blendRadius) {
  vec3 pNorm = normalize(p);
  
  if (regionType == 0) return 1.0;
  if (regionType == 1) return smoothstep(-blendRadius, blendRadius, pNorm.y);
  if (regionType == 2) return smoothstep(-blendRadius, blendRadius, -pNorm.y);
  if (regionType == 3) return 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, abs(pNorm.y));
  if (regionType == 4) return smoothstep(-blendRadius, blendRadius, pNorm.z);
  if (regionType == 5) return smoothstep(-blendRadius, blendRadius, -pNorm.z);
  if (regionType == 6) return smoothstep(-blendRadius, blendRadius, -pNorm.x);
  if (regionType == 7) return smoothstep(-blendRadius, blendRadius, pNorm.x);
  return 0.0;
}

float blendRegions(float value1, float value2, float blendFactor) {
  return mix(value1, value2, blendFactor);
}

vec3 blendRegionsVec3(vec3 value1, vec3 value2, float blendFactor) {
  return mix(value1, value2, blendFactor);
}
`;
