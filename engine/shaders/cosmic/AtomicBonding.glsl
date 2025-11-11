// Atomic Bonding Shader
// Electron clouds and nuclear structure

uniform float time;
uniform vec3 elementColor;
uniform float bondStrength;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vElectronDensity;

#ifdef VERTEX_SHADER
attribute float electronShell;  // 1, 2, 3 for different shells

void main() {
  vPosition = position;
  vNormal = normal;
  
  // Electron probability cloud (quantum orbital)
  float r = length(position);
  float shell = electronShell;
  
  // Radial wave function (simplified Hydrogen-like)
  float radialProb = exp(-r / shell) * pow(r, shell - 1.0);
  
  // Angular oscillation (electron motion)
  float angularMotion = sin(time * (3.0 + shell) + r * 10.0) * 0.1;
  
  vElectronDensity = radialProb;
  
  // Slight orbital motion
  vec3 displaced = position + normal * angularMotion * 0.05;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  gl_PointSize = 4.0 + vElectronDensity * 3.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Electron cloud visualization
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Soft, fuzzy electron cloud
  float cloudDensity = exp(-dist * 3.0) * vElectronDensity;
  
  // Element-specific colors (H=white, He=cyan, Li=pink, etc.)
  vec3 color = elementColor;
  
  // Brighter core, fading edges
  color *= (1.0 + cloudDensity * 2.0);
  
  float alpha = cloudDensity * (0.3 + bondStrength * 0.7);
  
  gl_FragColor = vec4(color, alpha);
}
#endif
