// Supernova Shockwave Shader
// Explosion effects with metal sparkles

uniform float time;
uniform vec3 explosionCenter;
uniform float shockwaveRadius;

varying vec3 vPosition;
varying float vVelocity;
varying vec3 vColor;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

#ifdef VERTEX_SHADER
attribute vec3 ejectaVelocity;
attribute float metalType;  // 0=H, 1=He, 2=C, 3=O, 4=Fe, etc.

void main() {
  vPosition = position;
  
  // Ejecta motion
  vec3 ejected = position + ejectaVelocity * time * 100.0;
  float dist = length(ejected - explosionCenter);
  vVelocity = length(ejectaVelocity);
  
  // Metal colors based on element type
  if (metalType < 0.5) {
    vColor = vec3(1.0, 1.0, 1.0);  // H - White
  } else if (metalType < 1.5) {
    vColor = vec3(0.0, 1.0, 1.0);  // He - Cyan
  } else if (metalType < 2.5) {
    vColor = vec3(0.5, 0.5, 0.5);  // C - Gray
  } else if (metalType < 3.5) {
    vColor = vec3(0.0, 0.5, 1.0);  // O - Blue
  } else {
    vColor = vec3(1.0, 0.5, 0.0);  // Fe and metals - Orange
  }
  
  // Shockwave compression
  float shockwave = abs(dist - shockwaveRadius);
  float compression = exp(-shockwave * 0.1);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(ejected, 1.0);
  gl_PointSize = 3.0 + vVelocity * 5.0 + compression * 10.0;
}
#endif

#ifdef FRAGMENT_SHADER
void main() {
  // Bright explosion core fading to colored ejecta
  float speed = vVelocity / 1000.0;  // Normalize
  vec3 whiteHot = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(vColor, whiteHot, speed * 0.7);
  
  // Sparkle effect for metals
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  float sparkle = hash(vPosition + vec3(time * 10.0));
  color += sparkle * 0.3;
  
  // Explosive burst pattern
  float burst = exp(-dist * 4.0);
  float alpha = burst * (0.8 + speed * 0.2);
  
  gl_FragColor = vec4(color, alpha);
}
#endif
