// Stellar Surface Shader
// Convection cells and stellar activity

uniform float time;
uniform float temperature;
uniform vec3 starColor;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vConvection;

// 3D noise
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

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vNormal = normal;
  
  // Convection cells (granulation pattern)
  vec3 noisePos = position * 10.0 + vec3(0.0, time * 0.5, 0.0);
  float n = noise(noisePos);
  n += 0.5 * noise(noisePos * 2.0 - time * 0.3);
  n += 0.25 * noise(noisePos * 4.0 + time * 0.7);
  
  vConvection = n;
  
  // Surface bubbling from convection
  vec3 displaced = position + normal * n * 0.02;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Stellar color based on temperature (Pop III stars are very hot and blue)
  vec3 coolSpot = starColor * 0.8;  // Cooler convection cells
  vec3 hotSpot = starColor * 1.2;   // Hotter rising plasma
  
  vec3 color = mix(coolSpot, hotSpot, vConvection);
  
  // Limb darkening (stars are brighter in center)
  float viewAngle = abs(dot(vNormal, vec3(0, 0, 1)));
  float limbDarkening = 0.6 + 0.4 * viewAngle;
  color *= limbDarkening;
  
  // Intense bloom for massive stars
  float bloom = pow(temperature / 100000.0, 0.5);
  color *= (1.0 + bloom);
  
  gl_FragColor = vec4(color, 1.0);
}
#endif
