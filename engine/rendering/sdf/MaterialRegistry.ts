/**
 * MATERIAL REGISTRY - Phase 0.1.2
 * 
 * Central registry for all SDF materials with physically-based rendering (PBR) properties.
 * Provides material definitions, blending functions, and serialization for the SDF rendering system.
 * 
 * @module MaterialRegistry
 */

import { PERIODIC_TABLE, Element } from '../../../agents/tables/periodic-table';

/**
 * Texture set for PBR material textures.
 */
export interface TextureSet {
  /** Diffuse/albedo texture path or URL */
  diffuse?: string;
  
  /** Normal map texture path or URL */
  normal?: string;
  
  /** Roughness map texture path or URL */
  roughness?: string;
  
  /** Metallic map texture path or URL */
  metallic?: string;
  
  /** Ambient occlusion map texture path or URL */
  ao?: string;
  
  /** Emission/emissive map texture path or URL */
  emission?: string;
  
  /** Texture tiling [u, v] */
  tiling?: [number, number];
  
  /** Texture offset [u, v] */
  offset?: [number, number];
}

/**
 * Material definition with PBR properties for SDF rendering.
 * 
 * @interface Material
 */
export interface Material {
  /** Unique identifier for the material */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Base albedo color in RGB [0-1] */
  baseColor: [number, number, number];
  
  /** Surface roughness [0=smooth, 1=rough] */
  roughness: number;
  
  /** Metallic property [0=dielectric, 1=metal] */
  metallic: number;
  
  /** Emissive intensity [0=none, 1=full glow] */
  emission: number;
  
  /** Emissive color in RGB [0-1] */
  emissiveColor: [number, number, number];
  
  /** Opacity/transparency [0=transparent, 1=opaque] */
  opacity: number;
  
  /** Optional texture set for the material */
  textureSet?: TextureSet;
  
  /** Optional shader-specific properties */
  shaderProperties?: {
    /** Index of refraction for transparent materials */
    ior?: number;
    
    /** Subsurface scattering radius */
    subsurface?: number;
    
    /** Anisotropic reflection amount */
    anisotropic?: number;
    
    /** Clearcoat layer intensity */
    clearcoat?: number;
    
    /** Custom shader parameters */
    custom?: Record<string, number>;
  };
}

/**
 * Blending mode for smooth material transitions.
 */
export type BlendMode = 'linear' | 'smooth' | 'noise' | 'gradient';

/**
 * Parameters for material blending operations.
 */
export interface BlendParams {
  /** Blend mode type */
  mode: BlendMode;
  
  /** Blend strength [0-1] */
  strength: number;
  
  /** Transition distance for smooth blending */
  transitionDistance: number;
  
  /** Noise scale for noise-based blending */
  noiseScale?: number;
  
  /** Gradient direction for gradient blending [x, y, z] */
  gradientDirection?: [number, number, number];
}

/**
 * Serializable material data for persistence.
 */
export interface SerializedMaterial {
  id: string;
  name: string;
  baseColor: [number, number, number];
  roughness: number;
  metallic: number;
  emission: number;
  emissiveColor: [number, number, number];
  opacity: number;
  textureSet?: TextureSet;
  shaderProperties?: Material['shaderProperties'];
}

/**
 * Central registry for managing SDF materials.
 * Provides registration, retrieval, blending, and serialization of materials.
 * 
 * @class MaterialRegistry
 */
export class MaterialRegistry {
  private materials: Map<string, Material> = new Map();
  
  constructor() {
    this.registerDefaultMaterials();
  }
  
  /**
   * Register a new material in the registry.
   * 
   * @param material - Material to register
   * @throws Error if material with same ID already exists
   */
  register(material: Material): void {
    if (this.materials.has(material.id)) {
      throw new Error(`Material with ID '${material.id}' already exists`);
    }
    this.materials.set(material.id, material);
  }
  
  /**
   * Get a material by ID.
   * 
   * @param id - Material identifier
   * @returns Material instance or undefined if not found
   */
  get(id: string): Material | undefined {
    return this.materials.get(id);
  }
  
  /**
   * Check if a material exists in the registry.
   * 
   * @param id - Material identifier
   * @returns True if material exists
   */
  has(id: string): boolean {
    return this.materials.has(id);
  }
  
  /**
   * List all registered material IDs.
   * 
   * @returns Array of material IDs
   */
  list(): string[] {
    return Array.from(this.materials.keys());
  }
  
  /**
   * Get all materials as an array.
   * 
   * @returns Array of all materials
   */
  getAll(): Material[] {
    return Array.from(this.materials.values());
  }
  
  /**
   * Update an existing material.
   * 
   * @param id - Material identifier
   * @param updates - Partial material updates
   * @throws Error if material doesn't exist
   */
  update(id: string, updates: Partial<Material>): void {
    const material = this.materials.get(id);
    if (!material) {
      throw new Error(`Material with ID '${id}' not found`);
    }
    this.materials.set(id, { ...material, ...updates });
  }
  
  /**
   * Remove a material from the registry.
   * 
   * @param id - Material identifier
   * @returns True if material was removed
   */
  remove(id: string): boolean {
    return this.materials.delete(id);
  }
  
  /**
   * Clear all materials from the registry.
   */
  clear(): void {
    this.materials.clear();
  }
  
  /**
   * Blend two materials together.
   * 
   * @param materialA - First material ID
   * @param materialB - Second material ID
   * @param factor - Blend factor [0=A, 1=B]
   * @param params - Optional blending parameters
   * @returns Blended material
   */
  blend(
    materialA: string,
    materialB: string,
    factor: number,
    params?: BlendParams
  ): Material {
    const matA = this.materials.get(materialA);
    const matB = this.materials.get(materialB);
    
    if (!matA || !matB) {
      throw new Error(`Material not found: ${!matA ? materialA : materialB}`);
    }
    
    const clampedFactor = Math.max(0, Math.min(1, factor));
    const blendMode = params?.mode || 'linear';
    
    let t = clampedFactor;
    
    switch (blendMode) {
      case 'smooth':
        t = this.smoothstep(clampedFactor);
        break;
      case 'noise':
        t = this.noiseBlend(clampedFactor, params?.noiseScale || 1.0);
        break;
      case 'gradient':
        t = this.gradientBlend(clampedFactor, params?.gradientDirection);
        break;
    }
    
    return {
      id: `blend-${materialA}-${materialB}`,
      name: `${matA.name} + ${matB.name}`,
      baseColor: this.lerpColor(matA.baseColor, matB.baseColor, t),
      roughness: this.lerp(matA.roughness, matB.roughness, t),
      metallic: this.lerp(matA.metallic, matB.metallic, t),
      emission: this.lerp(matA.emission, matB.emission, t),
      emissiveColor: this.lerpColor(matA.emissiveColor, matB.emissiveColor, t),
      opacity: this.lerp(matA.opacity, matB.opacity, t),
      shaderProperties: this.blendShaderProperties(
        t,
        matA.shaderProperties,
        matB.shaderProperties
      ),
    };
  }
  
  /**
   * Blend two materials together (Phase 0.2 API).
   * 
   * This is the primary blending method for creating smooth material transitions.
   * Supports multiple blend modes for different visual effects:
   * - linear: Simple linear interpolation
   * - smooth: Smoothstep-based interpolation for organic transitions
   * - noise: Noise-modulated blending for natural variation
   * - gradient: Directional gradient-based blending
   * 
   * @param id1 - First material ID
   * @param id2 - Second material ID
   * @param factor - Blend factor [0=mat1, 1=mat2]
   * @param mode - Optional blend mode (defaults to 'linear')
   * @param params - Optional additional blend parameters
   * @returns Blended material with interpolated properties
   * 
   * @example
   * ```typescript
   * // Linear blend
   * const blended = registry.blendMaterials('element-h', 'element-o', 0.5);
   * 
   * // Smooth blend with high smoothness
   * const smooth = registry.blendMaterials('element-c', 'element-n', 0.5, 'smooth', {
   *   mode: 'smooth',
   *   strength: 1.0,
   *   transitionDistance: 2.0
   * });
   * 
   * // Noise blend for organic transitions
   * const organic = registry.blendMaterials('element-fe', 'element-cu', 0.5, 'noise', {
   *   mode: 'noise',
   *   strength: 1.0,
   *   transitionDistance: 1.0,
   *   noiseScale: 3.0
   * });
   * 
   * // Gradient blend
   * const gradient = registry.blendMaterials('element-ca', 'element-mg', 0.5, 'gradient', {
   *   mode: 'gradient',
   *   strength: 1.0,
   *   transitionDistance: 5.0,
   *   gradientDirection: [0, 1, 0] // blend along Y axis
   * });
   * ```
   */
  blendMaterials(
    id1: string,
    id2: string,
    factor: number,
    mode: BlendMode = 'linear',
    params?: BlendParams
  ): Material {
    const blendParams: BlendParams = params || {
      mode,
      strength: 1.0,
      transitionDistance: 1.0,
    };
    
    return this.blend(id1, id2, factor, blendParams);
  }
  
  /**
   * Serialize the registry to JSON.
   * 
   * @returns Serialized materials array
   */
  serialize(): SerializedMaterial[] {
    return Array.from(this.materials.values()).map(mat => ({
      id: mat.id,
      name: mat.name,
      baseColor: mat.baseColor,
      roughness: mat.roughness,
      metallic: mat.metallic,
      emission: mat.emission,
      emissiveColor: mat.emissiveColor,
      opacity: mat.opacity,
      textureSet: mat.textureSet,
      shaderProperties: mat.shaderProperties,
    }));
  }
  
  /**
   * Deserialize materials from JSON.
   * 
   * @param data - Serialized materials array
   * @param merge - If true, merge with existing materials; if false, replace all (default: false)
   */
  deserialize(data: SerializedMaterial[], merge = false): void {
    if (!merge) {
      this.materials.clear();
    }
    
    for (const mat of data) {
      this.materials.set(mat.id, mat as Material);
    }
  }
  
  /**
   * Register default materials for all periodic table elements.
   * Creates scientifically accurate materials based on element properties.
   * 
   * @private
   */
  private registerDefaultMaterials(): void {
    for (const element of Object.values(PERIODIC_TABLE)) {
      const material = this.createMaterialFromElement(element);
      this.materials.set(material.id, material);
    }
    
    this.registerSpecialMaterials();
  }
  
  /**
   * Create a material from an element's properties.
   * 
   * @private
   */
  private createMaterialFromElement(element: Element): Material {
    const baseColor = this.hexToRGB(element.color);
    
    return {
      id: `element-${element.symbol.toLowerCase()}`,
      name: element.name,
      baseColor,
      roughness: element.roughness,
      metallic: element.metallic,
      emission: element.emissive,
      emissiveColor: baseColor,
      opacity: element.opacity,
      shaderProperties: {
        ior: element.phase === 'gas' ? 1.0 : 1.5,
        subsurface: element.phase === 'gas' ? 0.2 : 0.0,
      },
    };
  }
  
  /**
   * Register special non-element materials.
   * 
   * @private
   */
  private registerSpecialMaterials(): void {
    this.materials.set('bond', {
      id: 'bond',
      name: 'Chemical Bond',
      baseColor: [1.0, 1.0, 1.0],
      roughness: 0.7,
      metallic: 0.1,
      emission: 0.4,
      emissiveColor: [0.8, 0.9, 1.0],
      opacity: 1.0,
    });
    
    this.materials.set('default', {
      id: 'default',
      name: 'Default Material',
      baseColor: [0.5, 0.5, 0.5],
      roughness: 0.5,
      metallic: 0.5,
      emission: 0.0,
      emissiveColor: [1.0, 1.0, 1.0],
      opacity: 1.0,
    });
  }
  
  /**
   * Linear interpolation between two values.
   * 
   * @private
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * Linear interpolation between two RGB colors.
   * 
   * @private
   */
  private lerpColor(
    a: [number, number, number],
    b: [number, number, number],
    t: number
  ): [number, number, number] {
    return [
      this.lerp(a[0], b[0], t),
      this.lerp(a[1], b[1], t),
      this.lerp(a[2], b[2], t),
    ];
  }
  
  /**
   * Smoothstep interpolation for smoother blending.
   * 
   * @private
   */
  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }
  
  /**
   * Noise-based blending with Perlin-like noise.
   * 
   * @private
   */
  private noiseBlend(t: number, scale: number): number {
    const noise = Math.sin(t * scale * Math.PI * 2) * 0.5 + 0.5;
    return this.lerp(t, noise, 0.3);
  }
  
  /**
   * Gradient-based blending along a direction.
   * 
   * @private
   */
  private gradientBlend(
    t: number,
    direction?: [number, number, number]
  ): number {
    if (!direction) return t;
    
    const magnitude = Math.sqrt(
      direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
    );
    
    if (magnitude === 0) return t;
    
    const normalized = direction.map(v => v / magnitude);
    const gradient = (normalized[0] + normalized[1] + normalized[2]) / 3;
    
    return this.lerp(t, Math.abs(gradient), 0.5);
  }
  
  /**
   * Blend shader properties between two materials.
   * 
   * @private
   */
  private blendShaderProperties(
    t: number,
    a?: Material['shaderProperties'],
    b?: Material['shaderProperties']
  ): Material['shaderProperties'] | undefined {
    if (!a && !b) return undefined;
    if (!a) return b;
    if (!b) return a;
    
    const result: Material['shaderProperties'] = {};
    
    if (a.ior !== undefined && b.ior !== undefined) {
      result.ior = this.lerp(a.ior, b.ior, t);
    }
    
    if (a.subsurface !== undefined && b.subsurface !== undefined) {
      result.subsurface = this.lerp(a.subsurface, b.subsurface, t);
    }
    
    if (a.anisotropic !== undefined && b.anisotropic !== undefined) {
      result.anisotropic = this.lerp(a.anisotropic, b.anisotropic, t);
    }
    
    if (a.clearcoat !== undefined && b.clearcoat !== undefined) {
      result.clearcoat = this.lerp(a.clearcoat, b.clearcoat, t);
    }
    
    if (a.custom && b.custom) {
      result.custom = {};
      const allKeys = new Set([...Object.keys(a.custom), ...Object.keys(b.custom)]);
      for (const key of allKeys) {
        const valA = a.custom[key] ?? 0;
        const valB = b.custom[key] ?? 0;
        result.custom[key] = this.lerp(valA, valB, t);
      }
    }
    
    return result;
  }
  
  /**
   * Convert hex color to RGB [0-1] range.
   * 
   * @private
   */
  private hexToRGB(hex: string): [number, number, number] {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  
  /**
   * Get a material by ID (alias for get() method).
   * Provided for API compatibility.
   * 
   * @param id - Material identifier
   * @returns Material instance or undefined if not found
   */
  getMaterialByID(id: string): Material | undefined {
    return this.get(id);
  }
  
  /**
   * Convert all registered materials to GLSL shader code.
   * Generates uniform declarations and material lookup function.
   * 
   * @returns GLSL shader code string with material uniforms and lookup function
   */
  convertMaterialsToGLSL(): string {
    const materials = this.getAll();
    
    if (materials.length === 0) {
      return `
// No materials registered
struct Material {
  vec3 baseColor;
  float roughness;
  float metallic;
  float emission;
  vec3 emissiveColor;
  float opacity;
  float ior;
};

Material getMaterial(int materialIndex) {
  return Material(vec3(0.5), 0.5, 0.5, 0.0, vec3(1.0), 1.0, 1.5);
}
`;
    }
    
    let glsl = `
// Material system - ${materials.length} materials registered
struct Material {
  vec3 baseColor;
  float roughness;
  float metallic;
  float emission;
  vec3 emissiveColor;
  float opacity;
  float ior;
};

`;
    
    // Generate material ID constants
    glsl += '// Material ID constants\n';
    materials.forEach((mat, index) => {
      const constName = this.materialIDToConstName(mat.id);
      glsl += `const int ${constName} = ${index};\n`;
    });
    glsl += '\n';
    
    // Generate material data uniforms
    glsl += '// Material properties\n';
    glsl += `const int NUM_MATERIALS = ${materials.length};\n`;
    glsl += `uniform vec3 u_materialBaseColor[${materials.length}];\n`;
    glsl += `uniform float u_materialRoughness[${materials.length}];\n`;
    glsl += `uniform float u_materialMetallic[${materials.length}];\n`;
    glsl += `uniform float u_materialEmission[${materials.length}];\n`;
    glsl += `uniform vec3 u_materialEmissiveColor[${materials.length}];\n`;
    glsl += `uniform float u_materialOpacity[${materials.length}];\n`;
    glsl += `uniform float u_materialIOR[${materials.length}];\n\n`;
    
    // Generate material lookup function
    glsl += `// Material lookup function
Material getMaterial(int materialIndex) {
  if (materialIndex < 0 || materialIndex >= NUM_MATERIALS) {
    // Return default material for invalid index
    return Material(
      vec3(0.5, 0.5, 0.5),
      0.5,
      0.5,
      0.0,
      vec3(1.0, 1.0, 1.0),
      1.0,
      1.5
    );
  }
  
  return Material(
    u_materialBaseColor[materialIndex],
    u_materialRoughness[materialIndex],
    u_materialMetallic[materialIndex],
    u_materialEmission[materialIndex],
    u_materialEmissiveColor[materialIndex],
    u_materialOpacity[materialIndex],
    u_materialIOR[materialIndex]
  );
}
`;
    
    return glsl;
  }
  
  /**
   * Get material data for shader uniforms.
   * Returns arrays of material properties for uploading to GPU.
   * 
   * @returns Object containing arrays of material properties
   */
  getMaterialUniforms(): {
    baseColor: number[][];
    roughness: number[];
    metallic: number[];
    emission: number[];
    emissiveColor: number[][];
    opacity: number[];
    ior: number[];
  } {
    const materials = this.getAll();
    
    return {
      baseColor: materials.map(m => Array.from(m.baseColor)),
      roughness: materials.map(m => m.roughness),
      metallic: materials.map(m => m.metallic),
      emission: materials.map(m => m.emission),
      emissiveColor: materials.map(m => Array.from(m.emissiveColor)),
      opacity: materials.map(m => m.opacity),
      ior: materials.map(m => m.shaderProperties?.ior ?? 1.5),
    };
  }
  
  /**
   * Get material textures for shader uniforms.
   * Returns texture paths and settings for each material.
   * 
   * @returns Object mapping material IDs to their texture sets
   */
  getMaterialTextures(): Map<string, TextureSet> {
    const textureMap = new Map<string, TextureSet>();
    
    for (const material of this.materials.values()) {
      if (material.textureSet) {
        textureMap.set(material.id, material.textureSet);
      }
    }
    
    return textureMap;
  }
  
  /**
   * Get texture set for a specific material.
   * 
   * @param id - Material identifier
   * @returns TextureSet or undefined if material has no textures
   */
  getMaterialTextureSet(id: string): TextureSet | undefined {
    const material = this.materials.get(id);
    return material?.textureSet;
  }
  
  /**
   * Get material index by ID.
   * Returns the array index of a material for use in shaders.
   * 
   * @param id - Material identifier
   * @returns Material index or -1 if not found
   */
  getMaterialIndex(id: string): number {
    const materials = this.getAll();
    return materials.findIndex(m => m.id === id);
  }
  
  /**
   * Convert material ID to GLSL constant name.
   * 
   * @private
   */
  private materialIDToConstName(id: string): string {
    return 'MAT_' + id.toUpperCase().replace(/-/g, '_');
  }
}

/**
 * Global singleton instance of the material registry.
 * Use this for all material operations.
 */
export const materialRegistry = new MaterialRegistry();
