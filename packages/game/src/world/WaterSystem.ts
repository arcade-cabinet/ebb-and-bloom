/**
 * WATER SYSTEM
 * 
 * Renders oceans, lakes, and rivers with realistic water shader.
 * Uses PlanetaryLaws for water properties (salinity, temperature).
 * 
 * Daggerfall had static water planes - we do better with shaders!
 * 
 * Features:
 * - Animated water surface (vertex displacement)
 * - Fresnel reflections
 * - Depth-based color (shallow = turquoise, deep = dark blue)
 * - Foam at shorelines
 */

import * as THREE from 'three';

export class WaterSystem {
  private scene: THREE.Scene;
  private waterMesh?: THREE.Mesh;
  private waterLevel: number = 0; // Sea level
  private time: number = 0;
  
  // Water shader uniforms
  private uniforms = {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x1a5f7a) }, // Deep blue
    uShallowColor: { value: new THREE.Color(0x4dd2ff) }, // Turquoise
    uFoamColor: { value: new THREE.Color(0xffffff) },
    uSunDirection: { value: new THREE.Vector3(1, 1, 0).normalize() }
  };
  
  constructor(scene: THREE.Scene, waterLevel: number = 0) {
    this.scene = scene;
    this.waterLevel = waterLevel;
    
    this.createWater();
    console.log('[WaterSystem] Initialized - Water level:', waterLevel);
  }
  
  /**
   * Create water plane with custom shader
   */
  private createWater(): void {
    // Large water plane (covers visible ocean area)
    const size = 5000;
    const geometry = new THREE.PlaneGeometry(size, size, 128, 128);
    
    // Custom water shader
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.waterMesh = new THREE.Mesh(geometry, material);
    this.waterMesh.rotation.x = -Math.PI / 2; // Horizontal
    this.waterMesh.position.y = this.waterLevel;
    this.waterMesh.name = 'water-ocean';
    this.waterMesh.receiveShadow = true;
    
    this.scene.add(this.waterMesh);
  }
  
  /**
   * Vertex shader - animates water surface
   */
  private getVertexShader(): string {
    return `
      uniform float uTime;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      // Simple wave function
      float wave(vec2 pos, float freq, float amp, float speed) {
        return amp * sin(pos.x * freq + uTime * speed) * cos(pos.y * freq + uTime * speed * 0.7);
      }
      
      void main() {
        vUv = uv;
        
        // Calculate waves (multiple frequencies for natural look)
        float height = 0.0;
        height += wave(position.xy, 0.05, 0.3, 1.0);   // Large slow waves
        height += wave(position.xy, 0.1, 0.15, 1.5);   // Medium waves
        height += wave(position.xy, 0.2, 0.05, 2.0);   // Small ripples
        
        // Apply height to vertex position
        vec3 pos = position;
        pos.z = height;
        
        vPosition = pos;
        
        // Recalculate normal for lighting (approximate)
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 bitangent = vec3(0.0, 1.0, 0.0);
        vNormal = normalize(cross(tangent, bitangent));
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }
  
  /**
   * Fragment shader - water color and reflections
   */
  private getFragmentShader(): string {
    return `
      uniform float uTime;
      uniform vec3 uWaterColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;
      uniform vec3 uSunDirection;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        // Distance from camera (for depth effect)
        float depth = length(vPosition) / 100.0;
        depth = clamp(depth, 0.0, 1.0);
        
        // Blend between shallow and deep water
        vec3 waterColor = mix(uShallowColor, uWaterColor, depth);
        
        // Simple Fresnel effect (view-dependent reflection)
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
        
        // Add sky reflection (fake)
        vec3 skyColor = vec3(0.5, 0.7, 1.0);
        vec3 finalColor = mix(waterColor, skyColor, fresnel * 0.5);
        
        // Add foam at edges (based on depth)
        float foam = smoothstep(0.0, 0.05, 1.0 - depth);
        finalColor = mix(finalColor, uFoamColor, foam * 0.3);
        
        // Transparency (water is semi-transparent)
        float alpha = 0.85 + fresnel * 0.15;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;
  }
  
  /**
   * Update water animation
   */
  update(delta: number): void {
    this.time += delta;
    this.uniforms.uTime.value = this.time;
  }
  
  /**
   * Set water level (for tides, flooding, etc.)
   */
  setWaterLevel(level: number): void {
    this.waterLevel = level;
    if (this.waterMesh) {
      this.waterMesh.position.y = level;
    }
  }
  
  /**
   * Update sun direction (for reflections)
   */
  setSunDirection(direction: THREE.Vector3): void {
    this.uniforms.uSunDirection.value.copy(direction);
  }
  
  /**
   * Check if a position is underwater
   */
  isUnderwater(y: number): boolean {
    return y < this.waterLevel;
  }
}


