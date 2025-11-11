// Ocean Surface Shader
// Water reflections and organic chemistry

uniform float time;
uniform vec3 sunDirection;
uniform float organicActivity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Noise functions
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
    f.y
  );
}

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vUv = uv;
  
  // Ocean waves (Gerstner waves)
  vec2 wavePos = position.xz * 0.5 + time * 0.1;
  float wave1 = sin(wavePos.x * 2.0 + time) * 0.02;
  float wave2 = sin(wavePos.y * 3.0 - time * 0.7) * 0.015;
  float wave3 = sin((wavePos.x + wavePos.y) * 1.5 + time * 0.5) * 0.01;
  
  float height = wave1 + wave2 + wave3;
  
  // Normal calculation for waves
  vec3 tangent1 = vec3(1, cos(wavePos.x * 2.0 + time) * 0.04, 0);
  vec3 tangent2 = vec3(0, cos(wavePos.y * 3.0 - time * 0.7) * 0.03, 1);
  vNormal = normalize(cross(tangent1, tangent2));
  
  vec3 displaced = position + vec3(0, height, 0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Ocean color (deep blue-green)
  vec3 deepWater = vec3(0.0, 0.1, 0.3);
  vec3 shallowWater = vec3(0.0, 0.3, 0.5);
  
  // View direction for Fresnel
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
  
  // Water depth effect (fake)
  float depth = noise(vPosition.xz * 0.1);
  vec3 waterColor = mix(deepWater, shallowWater, depth);
  
  // Sun reflection (specular)
  vec3 reflectDir = reflect(-sunDirection, vNormal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 sunColor = vec3(1.0, 1.0, 0.9);
  
  // Organic chemistry sparkles (prebiotic molecules forming)
  float organicSparkle = noise(vPosition.xz * 5.0 + time * 0.5);
  organicSparkle = pow(organicSparkle, 10.0) * organicActivity;
  vec3 organicColor = vec3(0.0, 1.0, 0.5);  // Green sparkles
  
  // Combine
  vec3 color = waterColor;
  color += sunColor * spec * 0.8;
  color += organicColor * organicSparkle;
  
  // Fresnel blending with sky reflection
  vec3 skyColor = vec3(0.5, 0.7, 1.0);
  color = mix(color, skyColor, fresnel * 0.3);
  
  gl_FragColor = vec4(color, 1.0);
}
#endif
