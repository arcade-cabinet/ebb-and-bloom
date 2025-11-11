// Accretion Disk Shader
// Temperature gradient with frost line

uniform float time;
uniform float innerTemp;
uniform float outerTemp;
uniform float frostLineRadius;
uniform vec3 diskCenter;

varying vec3 vPosition;
varying float vRadius;
varying float vTemperature;
varying vec3 vVelocity;

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  
  // Cylindrical coordinates
  vec3 toDisk = position - diskCenter;
  vRadius = length(toDisk.xz);  // Distance from center in disk plane
  float phi = atan(toDisk.z, toDisk.x);
  
  // Temperature gradient: T(r) ∝ r^(-3/4) for passive disk
  vTemperature = innerTemp * pow(vRadius / 1.0, -0.75);
  vTemperature = clamp(vTemperature, outerTemp, innerTemp);
  
  // Keplerian rotation: v ∝ 1/sqrt(r)
  float omega = 1.0 / sqrt(vRadius + 0.1);
  float angularVel = omega * time * 0.5;
  
  // Rotate disk
  float newPhi = phi + angularVel;
  vec3 rotated = diskCenter + vec3(
    vRadius * cos(newPhi),
    toDisk.y,
    vRadius * sin(newPhi)
  );
  
  vVelocity = vec3(-sin(newPhi), 0, cos(newPhi)) * omega;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(rotated, 1.0);
  gl_PointSize = 3.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Temperature color gradient
  // Inner (hot): Orange/Yellow
  // Frost line: White (water ice)
  // Outer (cold): Blue/Dark blue
  
  vec3 hotColor = vec3(1.0, 0.5, 0.0);   // Orange (hot)
  vec3 medColor = vec3(1.0, 1.0, 1.0);   // White (frost line)
  vec3 coldColor = vec3(0.3, 0.5, 0.8);  // Pale blue (cold)
  
  // Normalize temperature to color range
  float t = (vTemperature - outerTemp) / (innerTemp - outerTemp);
  
  vec3 color;
  if (t > 0.5) {
    color = mix(medColor, hotColor, (t - 0.5) * 2.0);
  } else {
    color = mix(coldColor, medColor, t * 2.0);
  }
  
  // Highlight frost line
  float distToFrostLine = abs(vRadius - frostLineRadius);
  float frostLineGlow = exp(-distToFrostLine * 2.0);
  color += vec3(0.5, 0.8, 1.0) * frostLineGlow * 0.5;
  
  // Soft particle
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
  
  gl_FragColor = vec4(color, alpha * 0.8);
}
#endif
