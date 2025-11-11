// Molten Surface Shader
// Lava flows and impact flashes

uniform float time;
uniform float heatLevel;
uniform vec3 impactPositions[10];
uniform float impactTimes[10];

varying vec3 vPosition;
varying vec3 vNormal;
varying float vHeat;

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
  
  // Lava flow pattern (slow churning)
  vec3 flowPos = position * 2.0 + vec3(time * 0.1, 0.0, time * 0.05);
  float flow = noise(flowPos);
  flow += 0.5 * noise(flowPos * 2.0 - time * 0.2);
  flow += 0.25 * noise(flowPos * 4.0 + time * 0.3);
  
  vHeat = heatLevel * flow;
  
  // Impact heating
  for (int i = 0; i < 10; i++) {
    float timeSinceImpact = time - impactTimes[i];
    if (timeSinceImpact > 0.0 && timeSinceImpact < 5.0) {
      float distToImpact = length(position - impactPositions[i]);
      float impactHeat = exp(-distToImpact * 0.5) * exp(-timeSinceImpact * 0.5);
      vHeat += impactHeat * 2.0;
    }
  }
  
  // Surface bubbling
  vec3 displaced = position + normal * flow * 0.01;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Molten surface colors
  vec3 darkLava = vec3(0.2, 0.0, 0.0);     // Dark red (cooled)
  vec3 glowingLava = vec3(1.0, 0.3, 0.0);  // Orange (hot)
  vec3 whiteLava = vec3(1.0, 1.0, 0.5);    // Yellow-white (impact)
  
  float t = clamp(vHeat, 0.0, 1.0);
  vec3 color;
  
  if (t < 0.5) {
    color = mix(darkLava, glowingLava, t * 2.0);
  } else {
    color = mix(glowingLava, whiteLava, (t - 0.5) * 2.0);
  }
  
  // Emission glow
  float emission = vHeat * 2.0;
  color += vec3(emission * 0.5, emission * 0.2, 0.0);
  
  // Surface normal lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  color *= (0.5 + diffuse * 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}
#endif
