export const SDF_LIGHTING_GLSL = `
// Lighting system for SDF raymarching

#define PI 3.14159265359
#define MAX_LIGHTS 8

vec3 calculateNormal(vec3 p) {
  const float eps = 0.001;
  const vec2 h = vec2(eps, 0.0);
  
  return normalize(vec3(
    sceneSDF(p + h.xyy).x - sceneSDF(p - h.xyy).x,
    sceneSDF(p + h.yxy).x - sceneSDF(p - h.yxy).x,
    sceneSDF(p + h.yyx).x - sceneSDF(p - h.yyx).x
  ));
}

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

float fresnelSchlick(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 fresnelSchlickVec3(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

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
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * material.diffuse * lightColor;
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), material.shininess);
  vec3 specular = spec * material.specular * lightColor;
  
  return diffuse + specular;
}

struct PBRMaterial {
  vec3 albedo;
  float roughness;
  float metallic;
  vec3 emissive;
};

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

vec3 pbrShading(
  vec3 normal,
  vec3 viewDir,
  vec3 lightDir,
  vec3 lightColor,
  float lightIntensity,
  PBRMaterial material
) {
  // Cook-Torrance BRDF implementation
  vec3 N = normalize(normal);
  vec3 V = normalize(viewDir);
  vec3 L = normalize(lightDir);
  vec3 H = normalize(V + L);
  
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, material.albedo, material.metallic);
  
  float NDF = distributionGGX(N, H, material.roughness);
  float G = geometrySmith(N, V, L, material.roughness);
  vec3 F = fresnelSchlickVec3(max(dot(H, V), 0.0), F0);
  
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular = numerator / max(denominator, 0.001);
  
  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - material.metallic;
  
  float NdotL = max(dot(N, L), 0.0);
  vec3 diffuse = kD * material.albedo / PI;
  
  return (diffuse + specular) * lightColor * lightIntensity * NdotL;
}

float softShadow(vec3 rayOrigin, vec3 rayDirection, float minT, float maxT, float k) {
  float res = 1.0;
  float t = minT;
  
  for (int i = 0; i < 64; i++) {
    if (t >= maxT) break;
    
    vec3 p = rayOrigin + t * rayDirection;
    float h = sceneSDF(p).x;
    
    if (h < 0.001) {
      return 0.0;
    }
    
    res = min(res, k * h / t);
    t += clamp(h, 0.01, 0.2);
  }
  
  return clamp(res, 0.0, 1.0);
}

float hardShadow(vec3 rayOrigin, vec3 rayDirection, float minT, float maxT) {
  float t = minT;
  
  for (int i = 0; i < 32; i++) {
    if (t >= maxT) break;
    
    vec3 p = rayOrigin + t * rayDirection;
    float h = sceneSDF(p).x;
    
    if (h < 0.001) {
      return 0.0;
    }
    
    t += h;
  }
  
  return 1.0;
}

float ambientOcclusion(vec3 p, vec3 n, float stepSize, int steps) {
  float ao = 0.0;
  float weight = 1.0;
  
  for (int i = 1; i <= steps; i++) {
    float dist = float(i) * stepSize;
    vec3 samplePos = p + n * dist;
    float sdf = sceneSDF(samplePos).x;
    
    ao += weight * (dist - sdf);
    weight *= 0.5;
  }
  
  return 1.0 - clamp(ao, 0.0, 1.0);
}

float ambientOcclusionFast(vec3 p, vec3 n) {
  return ambientOcclusion(p, n, 0.1, 5);
}

float ambientOcclusionHQ(vec3 p, vec3 n) {
  return ambientOcclusion(p, n, 0.05, 8);
}
`;
