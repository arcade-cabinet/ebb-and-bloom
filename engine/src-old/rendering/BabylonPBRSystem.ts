/**
 * BabylonJS PBR Rendering System
 *
 * Uses BabylonJS's physically-based rendering to create
 * realistic visuals from element properties.
 *
 * NO TEXTURE FILES. Pure PBR from calculated properties.
 */

import {
  PBRMaterial,
  Color3,
  Color4,
  Scene,
  ProceduralTexture,
  ParticleSystem,
  Mesh,
  PointLight,
} from '@babylonjs/core';

export class BabylonPBRSystem {
  /**
   * Create PBR material from element properties
   */
  static createMaterialFromElements(
    name: string,
    composition: Record<string, number>,
    temperature_K: number,
    scene: Scene
  ): PBRMaterial {
    const mat = new PBRMaterial(name, scene);

    // Albedo (base color) from composition
    mat.albedoColor = this.calculateAlbedoFromElements(composition);

    // Metallic from metal content
    mat.metallic = this.calculateMetallic(composition);

    // Roughness from crystal structure
    mat.roughness = this.calculateRoughness(composition, temperature_K);

    // Emissive if hot or radioactive
    const emissive = this.calculateEmissive(composition, temperature_K);
    if (emissive) {
      mat.emissiveColor = emissive.color;
      mat.emissiveIntensity = emissive.intensity;
    }

    // Environment reflections
    mat.environmentIntensity = 0.5;

    // Subsurface scattering for organics
    if (composition.C && composition.C > 0.1) {
      mat.subSurface.isTranslucencyEnabled = true;
      mat.subSurface.tintColor = new Color3(0.9, 0.7, 0.6);
    }

    return mat;
  }

  /**
   * Albedo from elemental composition
   */
  private static calculateAlbedoFromElements(comp: Record<string, number>): Color3 {
    // Element colors (observed spectral properties)
    const elementColors: Record<string, Color3> = {
      // Metals
      Fe: new Color3(0.7, 0.7, 0.7), // Iron gray
      Cu: new Color3(0.95, 0.6, 0.4), // Copper
      Au: new Color3(1, 0.84, 0), // Gold
      Al: new Color3(0.9, 0.9, 0.9), // Aluminum

      // Non-metals
      C: new Color3(0.1, 0.1, 0.1), // Carbon (graphite)
      Si: new Color3(0.6, 0.6, 0.55), // Silicon
      O: new Color3(0.95, 0.95, 0.95), // Oxygen (ice)
      S: new Color3(1, 1, 0.3), // Sulfur

      // Organic
      H: new Color3(0.95, 0.95, 0.95), // Hydrogen
      N: new Color3(0.8, 0.85, 0.9), // Nitrogen
    };

    // Weighted average
    let r = 0,
      g = 0,
      b = 0,
      total = 0;
    for (const [elem, fraction] of Object.entries(comp)) {
      const color = elementColors[elem] || new Color3(0.5, 0.5, 0.5);
      r += color.r * fraction;
      g += color.g * fraction;
      b += color.b * fraction;
      total += fraction;
    }

    return total > 0 ? new Color3(r / total, g / total, b / total) : new Color3(0.5, 0.5, 0.5);
  }

  /**
   * Metallic from metal fraction
   */
  private static calculateMetallic(comp: Record<string, number>): number {
    const metals = ['Fe', 'Cu', 'Au', 'Ag', 'Al', 'Ni', 'Zn'];
    return metals.reduce((sum, metal) => sum + (comp[metal] || 0), 0);
  }

  /**
   * Roughness from temperature and structure
   */
  private static calculateRoughness(comp: Record<string, number>, temp_K: number): number {
    // Hot objects are smoother (molten/polished)
    if (temp_K > 1000) return 0.1;

    // Metals are smooth when pure
    const metallic = this.calculateMetallic(comp);
    if (metallic > 0.8) return 0.2;

    // Rock is rough
    const silicate = (comp.Si || 0) + (comp.O || 0);
    if (silicate > 0.5) return 0.8;

    return 0.5; // Default
  }

  /**
   * Emissive from temperature and radioactivity
   */
  private static calculateEmissive(
    comp: Record<string, number>,
    temp_K: number
  ): {
    color: Color3;
    intensity: number;
  } | null {
    let emissiveColor: Color3 | null = null;
    let intensity = 0;

    // Thermal emission (Wien's law)
    if (temp_K > 800) {
      emissiveColor = this.blackbodyColor(temp_K);
      intensity = Math.min(1, (temp_K - 800) / 2000); // 0-1 scale
    }

    // Radioactive emission (U, Th glow)
    const U = comp.U || 0;
    const Th = comp.Th || 0;
    if (U > 0.001 || Th > 0.001) {
      const radioGlow = new Color3(0.3, 1, 0.4); // Greenish
      const radioIntensity = (U + Th) * 100;

      if (emissiveColor) {
        // Blend thermal + radioactive
        emissiveColor = Color3.Lerp(emissiveColor, radioGlow, 0.3);
        intensity = Math.max(intensity, radioIntensity);
      } else {
        emissiveColor = radioGlow;
        intensity = radioIntensity;
      }
    }

    return emissiveColor ? { color: emissiveColor, intensity } : null;
  }

  /**
   * Blackbody color from temperature
   */
  private static blackbodyColor(temp_K: number): Color3 {
    if (temp_K < 1000) return new Color3(0.5, 0, 0); // Deep red
    if (temp_K < 1500) return new Color3(1, 0.2, 0); // Red
    if (temp_K < 2500) return new Color3(1, 0.5, 0.1); // Orange
    if (temp_K < 4000) return new Color3(1, 0.8, 0.5); // Yellow
    if (temp_K < 6000) return new Color3(1, 1, 0.9); // White
    return new Color3(0.9, 0.95, 1); // Blue-white
  }

  /**
   * Create particle system for atmospheric effects
   */
  static createAtmosphereParticles(
    planetMesh: Mesh,
    atmosphereComposition: Record<string, number>,
    scene: Scene
  ): ParticleSystem {
    const particles = new ParticleSystem('atmosphere', 2000, scene);
    particles.emitter = planetMesh;

    // Color from dominant gas
    const N2 = atmosphereComposition.N2 || 0;
    const CO2 = atmosphereComposition.CO2 || 0;

    if (CO2 > 0.5) {
      particles.color1 = new Color4(0.9, 0.6, 0.4, 0.7); // Orange (CO₂)
      particles.color2 = new Color4(0.95, 0.7, 0.5, 0.8);
    } else {
      particles.color1 = new Color4(0.5, 0.7, 1, 0.7); // Blue (N₂/O₂)
      particles.color2 = new Color4(0.6, 0.8, 1, 0.8);
    }

    particles.minSize = 0.1;
    particles.maxSize = 0.3;
    particles.minLifeTime = 2;
    particles.maxLifeTime = 4;
    particles.emitRate = 100;

    particles.blendMode = ParticleSystem.BLENDMODE_STANDARD;
    particles.minEmitPower = 0.1;
    particles.maxEmitPower = 0.3;

    return particles;
  }

  /**
   * Create glow layer for radioactive/hot objects
   */
  static createEmissiveGlow(
    mesh: Mesh,
    emissiveColor: Color3,
    intensity: number,
    scene: Scene
  ): PointLight {
    const light = new PointLight(`${mesh.name}-glow`, mesh.position, scene);
    light.diffuse = emissiveColor;
    light.specular = new Color3(0, 0, 0); // No specular from glow
    light.intensity = intensity * 2; // Visible glow
    light.range = 100; // How far light reaches

    // Parent to mesh so it moves with object
    light.parent = mesh;

    return light;
  }

  /**
   * Create procedural normal map (surface detail)
   * NO TEXTURE FILE - generated in shader
   */
  static createProceduralNormals(
    name: string,
    roughnessLevel: number,
    scene: Scene
  ): ProceduralTexture {
    // BabylonJS procedural texture (runs in shader)
    const proc = new ProceduralTexture(
      name,
      512,
      `
      precision highp float;
      varying vec2 vUV;
      
      // Simple noise for surface detail
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      void main() {
        float scale = ${roughnessLevel * 20.0};
        float n = noise(vUV * scale);
        
        // Normal perturbation
        vec3 normal = vec3(n - 0.5, n - 0.5, 1.0);
        normal = normalize(normal);
        
        // Encode as RGB
        gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
      }
      `,
      scene
    );

    return proc;
  }
}
