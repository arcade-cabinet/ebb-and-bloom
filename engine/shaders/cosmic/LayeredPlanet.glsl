// Layered Planet Shader
// Internal structure visualization (core/mantle/crust)

uniform float coreFraction;
uniform float mantleFraction;
uniform float time;

varying vec3 vPosition;
varying float vLayer;
varying vec3 vNormal;

#ifdef VERTEX_SHADER
void main() {
  vPosition = position;
  vNormal = normal;
  
  // Determine which layer this vertex is in
  float r = length(position);
  
  if (r < coreFraction) {
    vLayer = 0.0;  // Core
  } else if (r < coreFraction + mantleFraction) {
    vLayer = 1.0;  // Mantle
  } else {
    vLayer = 2.0;  // Crust
  }
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec3 color;
  
  // Layer-specific colors and patterns
  if (vLayer < 0.5) {
    // CORE: White-hot iron/nickel
    vec3 coreColor = vec3(1.0, 1.0, 0.9);
    
    // Convection currents in outer core
    float convection = sin(vPosition.x * 10.0 + time) * 
                      sin(vPosition.y * 10.0 - time) * 
                      sin(vPosition.z * 10.0 + time * 0.5);
    color = coreColor * (1.0 + convection * 0.1);
    
  } else if (vLayer < 1.5) {
    // MANTLE: Orange-red silicate rock
    vec3 mantleColor = vec3(0.8, 0.3, 0.1);
    
    // Convection cells (larger scale)
    float convection = sin(vPosition.x * 5.0 + time * 0.1) * 
                      sin(vPosition.y * 5.0 - time * 0.1);
    
    // Partial melting zones
    float melt = smoothstep(0.0, 0.3, convection);
    vec3 moltenRock = vec3(1.0, 0.5, 0.0);
    color = mix(mantleColor, moltenRock, melt * 0.3);
    
  } else {
    // CRUST: Gray-brown solid rock
    vec3 crustColor = vec3(0.4, 0.35, 0.3);
    
    // Geological variation
    float variation = hash(vPosition.xy);
    color = crustColor * (0.9 + variation * 0.2);
  }
  
  // Layer boundaries (phase transitions)
  float r = length(vPosition);
  float coreEdge = abs(r - coreFraction);
  float mantleEdge = abs(r - (coreFraction + mantleFraction));
  
  // Highlight discontinuities
  if (coreEdge < 0.02) {
    color += vec3(0.3, 0.3, 0.0);  // Core-mantle boundary glow
  }
  if (mantleEdge < 0.02) {
    color += vec3(0.2, 0.1, 0.0);  // Moho discontinuity
  }
  
  // Simple lighting
  vec3 lightDir = normalize(vec3(1, 1, 1));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  color *= (0.6 + diffuse * 0.4);
  
  gl_FragColor = vec4(color, 1.0);
}
#endif
