// Cosmic Expansion Shader
// Radial motion blur with redshift gradient

uniform float time;
uniform float expansionRate;
uniform vec3 center;

varying vec3 vPosition;
varying float vDistance;
varying vec3 vColor;

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vDistance = length(position - center);
  
  // Redshift color based on distance (Hubble law)
  float redshift = vDistance * expansionRate;
  vColor = mix(
    vec3(0.0, 0.0, 1.0),  // Blue (approaching)
    vec3(1.0, 0.0, 0.0),  // Red (receding)
    clamp(redshift, 0.0, 1.0)
  );
  
  // Exponential expansion
  vec3 direction = normalize(position - center);
  float expansion = exp(time * expansionRate) - 1.0;
  vec3 expanded = center + direction * (vDistance + expansion);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(expanded, 1.0);
  gl_PointSize = 4.0 / (1.0 + vDistance * 0.01);
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Motion blur effect
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Radial blur based on expansion velocity
  float blur = vDistance * expansionRate * 0.1;
  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
  alpha *= exp(-blur);
  
  // Add doppler shift glow
  vec3 finalColor = vColor * (1.0 + blur * 0.5);
  
  gl_FragColor = vec4(finalColor, alpha);
}
#endif
