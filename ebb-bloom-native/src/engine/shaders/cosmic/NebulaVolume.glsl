// Nebula Volume Shader
// Volumetric gas rendering with dust absorption

uniform float time;
uniform float density;
uniform vec3 nebulaColor;

varying vec3 vPosition;
varying float vDensity;
varying vec3 vNormal;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

// Fractal Brownian Motion for wispy clouds
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vNormal = normal;
  
  // Slowly swirling nebula
  vec3 swirl = vec3(
    position.x + sin(time * 0.1 + position.y * 0.1) * 0.5,
    position.y,
    position.z + cos(time * 0.1 + position.x * 0.1) * 0.5
  );
  
  // Density variation (wispy clouds)
  vDensity = fbm(swirl * 0.5) * density;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 8.0 + vDensity * 4.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Dark nebula colors (red/brown dust)
  vec3 dustColor = nebulaColor;
  vec3 emissionColor = nebulaColor * 1.5;  // Some emission from hot gas
  
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Soft, wispy edges
  float wisp = exp(-dist * 2.0);
  vec3 color = mix(dustColor, emissionColor, wisp * vDensity);
  
  // Dust absorption (darker in denser regions)
  float absorption = vDensity * 0.5;
  color *= (1.0 - absorption);
  
  float alpha = wisp * vDensity * 0.7;
  
  gl_FragColor = vec4(color, alpha);
}
#endif
