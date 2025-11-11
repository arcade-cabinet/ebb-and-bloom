// Gravitational Lensing Shader
// Spacetime distortion around dark matter filaments

uniform float time;
uniform float mass;
uniform vec3 lensCenter;

varying vec3 vPosition;
varying float vDistortion;

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  
  // Einstein radius: θ_E = sqrt(4GM/c² * D_LS/(D_L * D_S))
  vec3 toCenter = position - lensCenter;
  float r = length(toCenter);
  
  // Simplified lensing (light bending angle)
  float bendingAngle = mass / max(r * r, 0.01);
  
  // Deflect position perpendicular to radius
  vec3 radialDir = normalize(toCenter);
  vec3 tangentDir = normalize(cross(radialDir, vec3(0, 1, 0)));
  
  vDistortion = bendingAngle;
  
  vec3 lensed = position + tangentDir * bendingAngle * 10.0;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(lensed, 1.0);
  gl_PointSize = 2.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Dark matter visualization: dark purple/black with subtle glow
  vec3 darkMatterColor = vec3(0.1, 0.0, 0.3);
  vec3 lensGlow = vec3(0.3, 0.0, 0.5);
  
  // Stronger glow where lensing is stronger
  vec3 color = mix(darkMatterColor, lensGlow, vDistortion * 100.0);
  
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * 0.6;
  
  // Add lensing caustic patterns
  float caustic = abs(sin(vDistortion * 100.0 + time * 2.0)) * 0.3;
  color += caustic;
  
  gl_FragColor = vec4(color, alpha);
}
#endif
