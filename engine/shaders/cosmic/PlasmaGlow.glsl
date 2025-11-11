// Plasma Glow Shader
// Heat distortion and plasma wisps for quark-gluon plasma

uniform float time;
uniform float temperature;
uniform float seed;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vHeat;

// Simple hash for pseudo-random
float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

// 3D noise
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

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vNormal = normal;
  
  // Heat-driven motion
  vec3 noisePos = position * 5.0 + vec3(seed * 10.0, time * 2.0, 0.0);
  float n = noise(noisePos);
  n += 0.5 * noise(noisePos * 2.0 + time * 3.0);
  n += 0.25 * noise(noisePos * 4.0 + time * 5.0);
  
  vHeat = n * temperature;
  
  // Thermal expansion
  vec3 displaced = position * (1.0 + vHeat * 0.05);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  gl_PointSize = 5.0 + vHeat * 3.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Plasma colors: red -> orange -> yellow -> white (increasing temperature)
  vec3 coldColor = vec3(1.0, 0.2, 0.0);  // Red
  vec3 warmColor = vec3(1.0, 0.6, 0.0);  // Orange
  vec3 hotColor = vec3(1.0, 1.0, 0.0);   // Yellow
  vec3 whiteHot = vec3(1.0, 1.0, 1.0);   // White
  
  float t = clamp(vHeat, 0.0, 1.0);
  vec3 color;
  if (t < 0.33) {
    color = mix(coldColor, warmColor, t * 3.0);
  } else if (t < 0.66) {
    color = mix(warmColor, hotColor, (t - 0.33) * 3.0);
  } else {
    color = mix(hotColor, whiteHot, (t - 0.66) * 3.0);
  }
  
  // Soft glow
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float glow = exp(-dist * 5.0);
  float alpha = glow * (0.6 + vHeat * 0.4);
  
  gl_FragColor = vec4(color * (1.0 + glow * 0.5), alpha);
}
#endif
