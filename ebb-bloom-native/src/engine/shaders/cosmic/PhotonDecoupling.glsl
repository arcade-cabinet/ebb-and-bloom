// Photon Decoupling Shader
// Light rays emerging as universe becomes transparent

uniform float time;
uniform float opacity;
uniform vec3 cmbColor;

varying vec3 vPosition;
varying float vIntensity;
varying vec3 vRayDirection;

// Hash function
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

#ifdef VERTEX_SHADER
attribute vec3 rayDirection;

void main() {
  vPosition = position;
  vRayDirection = rayDirection;
  
  // Photons traveling outward from recombination surface
  float travelDistance = time * 299792458.0 * 0.0001;  // Speed of light (scaled)
  vec3 traveledPos = position + rayDirection * travelDistance;
  
  // Intensity fades with distance (inverse square)
  float dist = length(traveledPos);
  vIntensity = 1.0 / (1.0 + dist * dist * 0.001);
  
  // CMB temperature fluctuations (very small)
  float fluctuation = hash(dot(position, vec3(12.9898, 78.233, 45.164)));
  vIntensity *= (1.0 + (fluctuation - 0.5) * 0.00001);  // ΔT/T ~ 10^-5
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(traveledPos, 1.0);
  gl_PointSize = 3.0 + vIntensity * 2.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // CMB orange glow (2.7K blackbody peak ~ 1mm wavelength, but visible representation)
  vec3 color = cmbColor * vIntensity;
  
  // Ray streak effect
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Directional streak along ray direction
  vec2 rayDir2D = normalize(vRayDirection.xy);
  float streak = abs(dot(center, rayDir2D));
  float alpha = (1.0 - smoothstep(0.1, 0.5, dist)) * (1.0 + streak);
  
  // Transparency increases as universe becomes transparent
  alpha *= opacity * vIntensity;
  
  gl_FragColor = vec4(color, alpha);
}
#endif
