/**
 * Elemental Rendering System
 * 
 * NO TEXTURE FILES. NO AMBIENTCG.
 * 
 * Visual properties calculated DIRECTLY from element composition.
 * Same system for planets, creatures, tools - EVERYTHING.
 * 
 * THE BREAKTHROUGH:
 * - Planets = Element fusion (Fe, Si, O, etc.)
 * - Creatures = Element fusion (C, H, O, N, etc.)
 * - Tools = Element fusion (Fe, C, etc.)
 * 
 * ALL use periodic table → visual properties
 */

import { PERIODIC_TABLE } from '../tables/periodic-table';
import { Color3, Color4, StandardMaterial, PBRMaterial } from '@babylonjs/core';

/**
 * Visual Properties from Element Composition
 */
export interface VisualProperties {
  // Color (RGB)
  baseColor: Color3;
  emissiveColor?: Color3; // If glowing (hot objects)
  
  // PBR properties
  metallic: number; // 0-1 (how metallic)
  roughness: number; // 0-1 (how rough)
  
  // Optical
  transparency: number; // 0-1 (0=opaque, 1=clear)
  refractionIndex: number; // For transparent materials
  
  // Physical (for gameplay, not just visual)
  density_kgm3: number;
  hardness_mohs: number;
  meltingPoint_K: number;
}

/**
 * Calculate visual properties from elemental composition
 * 
 * This is the MAGIC - same function works for:
 * - Planets (rocky, icy, gas)
 * - Creatures (skin, scales, fur)
 * - Tools (stone, metal, ceramic)
 * - Structures (wood, stone, mud)
 */
export class ElementalRenderer {
  
  /**
   * Calculate visual properties from composition
   * 
   * @param composition Object mapping element symbols to fractions
   *                    Example: { Fe: 0.88, Ni: 0.06, S: 0.04 } for planetary core
   * @param temperature Temperature in Kelvin (affects color via blackbody)
   * @param crystallineStructure 'amorphous' | 'crystalline' | 'organic'
   */
  calculateVisualProperties(
    composition: Record<string, number>,
    temperature_K: number,
    crystallineStructure: 'amorphous' | 'crystalline' | 'organic' = 'amorphous'
  ): VisualProperties {
    
    // 1. CALCULATE BASE COLOR from elements
    const baseColor = this.colorFromComposition(composition, temperature_K);
    
    // 2. CALCULATE METALLIC from metal content
    const metallic = this.metallicFromComposition(composition);
    
    // 3. CALCULATE ROUGHNESS from structure
    const roughness = this.roughnessFromStructure(crystallineStructure, composition);
    
    // 4. CALCULATE TRANSPARENCY
    const transparency = this.transparencyFromComposition(composition);
    
    // 5. CALCULATE PHYSICAL PROPERTIES
    const density = this.densityFromComposition(composition);
    const hardness = this.hardnessFromComposition(composition, crystallineStructure);
    const meltingPoint = this.meltingPointFromComposition(composition);
    
    // 6. EMISSIVE if hot
    const emissiveColor = temperature_K > 800 
      ? this.blackbodyColor(temperature_K)
      : undefined;
    
    return {
      baseColor,
      emissiveColor,
      metallic,
      roughness,
      transparency,
      refractionIndex: 1.5, // TODO: Calculate from electron density
      density_kgm3: density,
      hardness_mohs: hardness,
      meltingPoint_K: meltingPoint,
    };
  }
  
  /**
   * Color from elemental composition
   * 
   * Each element has characteristic colors:
   * - Fe (Iron): Gray/rust
   * - Cu (Copper): Reddish
   * - S (Sulfur): Yellow
   * - C (Carbon): Black (graphite) or clear (diamond)
   * - O (Oxygen): Colorless (but enables colors in compounds)
   */
  private colorFromComposition(
    composition: Record<string, number>,
    temperature_K: number
  ): Color3 {
    // Element colors (characteristic appearance)
    const elementColors: Record<string, Color3> = {
      // Metals
      Fe: new Color3(0.7, 0.7, 0.7), // Iron gray
      Cu: new Color3(0.9, 0.5, 0.3), // Copper red
      Au: new Color3(1.0, 0.84, 0.0), // Gold
      Ag: new Color3(0.95, 0.95, 0.95), // Silver
      
      // Non-metals
      C: new Color3(0.1, 0.1, 0.1), // Carbon black (graphite)
      S: new Color3(1.0, 1.0, 0.0), // Sulfur yellow
      Si: new Color3(0.5, 0.5, 0.6), // Silicon gray
      
      // Organics (high C, H, O, N)
      organic: new Color3(0.8, 0.7, 0.6), // Tan/beige
      
      // Default
      default: new Color3(0.5, 0.5, 0.5),
    };
    
    // Weighted average of element colors
    let r = 0, g = 0, b = 0;
    let totalWeight = 0;
    
    for (const [symbol, fraction] of Object.entries(composition)) {
      const color = elementColors[symbol] || elementColors.default;
      r += color.r * fraction;
      g += color.g * fraction;
      b += color.b * fraction;
      totalWeight += fraction;
    }
    
    if (totalWeight > 0) {
      r /= totalWeight;
      g /= totalWeight;
      b /= totalWeight;
    }
    
    // Modulate by temperature (blackbody radiation)
    if (temperature_K > 1000) {
      const blackbody = this.blackbodyColor(temperature_K);
      // Blend toward blackbody color
      const blend = Math.min(1, (temperature_K - 1000) / 2000);
      r = r * (1 - blend) + blackbody.r * blend;
      g = g * (1 - blend) + blackbody.g * blend;
      b = b * (1 - blend) + blackbody.b * blend;
    }
    
    return new Color3(r, g, b);
  }
  
  /**
   * Blackbody color from temperature
   * Wien's displacement law + Planck distribution
   */
  private blackbodyColor(temperature_K: number): Color3 {
    // Peak wavelength (Wien's law)
    const lambda_peak = 2.897771955e-3 / temperature_K; // meters
    
    // Rough color mapping
    if (temperature_K < 1000) return new Color3(0.3, 0, 0); // Deep red
    if (temperature_K < 2000) return new Color3(1.0, 0.2, 0); // Red
    if (temperature_K < 3000) return new Color3(1.0, 0.6, 0.2); // Orange
    if (temperature_K < 5000) return new Color3(1.0, 1.0, 0.7); // Yellow-white
    if (temperature_K < 10000) return new Color3(0.9, 0.9, 1.0); // Blue-white
    return new Color3(0.7, 0.8, 1.0); // Blue
  }
  
  /**
   * Metallic from metal content
   * 
   * Metals: Fe, Cu, Au, Ag, Al, etc.
   * High metal → metallic appearance
   */
  private metallicFromComposition(composition: Record<string, number>): number {
    const metals = ['Fe', 'Cu', 'Au', 'Ag', 'Al', 'Ni', 'Zn', 'Sn', 'Pb'];
    
    let metalContent = 0;
    for (const metal of metals) {
      metalContent += composition[metal] || 0;
    }
    
    return Math.min(1.0, metalContent); // 0-1
  }
  
  /**
   * Roughness from crystal structure
   * 
   * Crystalline: Smooth (metals, gems)
   * Amorphous: Rough (rocks, soil)
   * Organic: Moderate (skin, wood)
   */
  private roughnessFromStructure(
    structure: 'amorphous' | 'crystalline' | 'organic',
    composition: Record<string, number>
  ): number => {
    if (structure === 'crystalline') {
      return 0.1; // Very smooth (polished metal, gems)
    }
    
    if (structure === 'organic') {
      return 0.6; // Moderate (skin, wood, leather)
    }
    
    // Amorphous: depends on grain size (from composition)
    const silicate = (composition.Si || 0) + (composition.O || 0);
    if (silicate > 0.5) {
      return 0.8; // Rocky (rough)
    }
    
    return 0.5; // Default
  }
  
  /**
   * Transparency from composition
   * 
   * Pure SiO₂ (quartz): Transparent
   * Metals: Opaque
   * Organics: Translucent to opaque
   */
  private transparencyFromComposition(composition: Record<string, number>): number => {
    // Check for transparent materials
    const quartz = (composition.Si || 0) * (composition.O || 0);
    if (quartz > 0.4 && Object.keys(composition).length < 3) {
      return 0.8; // Quartz/glass
    }
    
    // Ice
    if ((composition.H || 0) > 0.6 && (composition.O || 0) > 0.3) {
      return 0.7; // Ice
    }
    
    // Metals: Opaque
    const metallic = this.metallicFromComposition(composition);
    if (metallic > 0.5) return 0.0;
    
    // Organics: Mostly opaque
    const organic = (composition.C || 0) + (composition.H || 0) + (composition.N || 0);
    if (organic > 0.5) return 0.1; // Slight translucency
    
    return 0.0; // Default opaque
  }
  
  /**
   * Density from composition
   * Weighted average of element densities
   */
  private densityFromComposition(composition: Record<string, number>): number => {
    let totalDensity = 0;
    let totalWeight = 0;
    
    for (const [symbol, fraction] of Object.entries(composition)) {
      const element = PERIODIC_TABLE[symbol];
      if (element) {
        totalDensity += element.density * fraction;
        totalWeight += fraction;
      }
    }
    
    return totalWeight > 0 ? totalDensity / totalWeight : 1000; // kg/m³
  }
  
  /**
   * Hardness from composition and structure
   * 
   * Diamond (crystalline C): 10 Mohs
   * Steel (Fe + C): 4-5 Mohs
   * Organic tissue: 1-2 Mohs
   */
  private hardnessFromComposition(
    composition: Record<string, number>,
    structure: 'amorphous' | 'crystalline' | 'organic'
  ): number => {
    // Pure carbon
    if ((composition.C || 0) > 0.95 && structure === 'crystalline') {
      return 10; // Diamond
    }
    
    // Metals
    const metallic = this.metallicFromComposition(composition);
    if (metallic > 0.8) {
      return 4 + metallic * 2; // 4-6 Mohs
    }
    
    // Silicates (rock)
    const silicate = (composition.Si || 0) + (composition.O || 0);
    if (silicate > 0.5) {
      return 6 + silicate * 1; // 6-7 Mohs (quartz)
    }
    
    // Organic
    if (structure === 'organic') {
      return 1.5; // Soft
    }
    
    return 3; // Default
  }
  
  /**
   * Melting point from composition
   * Weighted average with modifications for alloys
   */
  private meltingPointFromComposition(composition: Record<string, number>): number => {
    let totalMeltingPoint = 0;
    let totalWeight = 0;
    
    for (const [symbol, fraction] of Object.entries(composition)) {
      const element = PERIODIC_TABLE[symbol];
      if (element && element.meltingPoint) {
        totalMeltingPoint += element.meltingPoint * fraction;
        totalWeight += fraction;
      }
    }
    
    return totalWeight > 0 ? totalMeltingPoint / totalWeight : 300; // Kelvin
  }
  
  /**
   * Create BabylonJS material from visual properties
   * PURE RAYCAST - no textures loaded
   */
  createMaterial(name: string, props: VisualProperties, scene: any): StandardMaterial | PBRMaterial {
    if (props.metallic > 0.5) {
      // Use PBR for metallic materials (physically based)
      const pbr = new PBRMaterial(name, scene);
      pbr.albedoColor = props.baseColor;
      pbr.metallic = props.metallic;
      pbr.roughness = props.roughness;
      
      if (props.emissiveColor) {
        pbr.emissiveColor = props.emissiveColor;
      }
      
      if (props.transparency > 0) {
        pbr.alpha = 1 - props.transparency;
        pbr.transparencyMode = 2; // Alpha blend
      }
      
      return pbr;
    } else {
      // Standard material for non-metallic
      const mat = new StandardMaterial(name, scene);
      mat.diffuseColor = props.baseColor;
      mat.specularPower = 1 / props.roughness;
      
      if (props.emissiveColor) {
        mat.emissiveColor = props.emissiveColor;
      }
      
      if (props.transparency > 0) {
        mat.alpha = 1 - props.transparency;
      }
      
      return mat;
    }
  }
}

/**
 * Specific Renderers Using Elemental System
 */

/**
 * Planet Surface Renderer
 * Composition → Visual properties → Material
 */
export class PlanetSurfaceRenderer extends ElementalRenderer {
  
  /**
   * Create planet surface material from crust composition
   */
  createPlanetMaterial(crustComposition: Record<string, number>, temperature_K: number, scene: any) {
    // Planet surfaces are amorphous (weathered rock)
    const props = this.calculateVisualProperties(
      crustComposition,
      temperature_K,
      'amorphous'
    );
    
    return this.createMaterial('planet-surface', props, scene);
  }
}

/**
 * Creature Renderer
 * Biological composition → Visual properties → Material
 */
export class CreatureSurfaceRenderer extends ElementalRenderer {
  
  /**
   * Create creature material from tissue composition
   * 
   * Typical creature: 65% O, 18% C, 10% H, 3% N, 1.5% Ca, 1% P, etc.
   */
  createCreatureMaterial(
    tissueType: 'skin' | 'scales' | 'fur' | 'feathers',
    pigmentation: number, // 0-1 (melanin content)
    scene: any
  ) {
    // Base organic composition
    const composition = {
      O: 0.65,
      C: 0.18,
      H: 0.10,
      N: 0.03,
      Ca: 0.015, // Bones, shells
      P: 0.01,
      other: 0.015,
    };
    
    const props = this.calculateVisualProperties(
      composition,
      310, // Body temperature ~37°C
      'organic'
    );
    
    // Modulate color by pigmentation
    const baseColor = props.baseColor;
    const pigmentColor = new Color3(
      0.2 + pigmentation * 0.3,
      0.15 + pigmentation * 0.25,
      0.1 + pigmentation * 0.2
    );
    
    props.baseColor = Color3.Lerp(baseColor, pigmentColor, pigmentation);
    
    // Texture varies by type
    if (tissueType === 'scales') {
      props.roughness = 0.3; // Shiny scales
      props.metallic = 0.1; // Slight iridescence
    } else if (tissueType === 'feathers') {
      props.roughness = 0.7; // Matte
    } else if (tissueType === 'fur') {
      props.roughness = 0.9; // Very matte
    }
    
    return this.createMaterial(`creature-${tissueType}`, props, scene);
  }
}

/**
 * Tool Renderer
 * Material composition → Visual properties
 */
export class ToolRenderer extends ElementalRenderer {
  
  /**
   * Create tool material from composition
   * 
   * Examples:
   * - Stone: { Si: 0.28, O: 0.46, Al: 0.08, Fe: 0.05 }
   * - Bronze: { Cu: 0.88, Sn: 0.12 }
   * - Steel: { Fe: 0.99, C: 0.01 }
   * - Bone: { Ca: 0.35, P: 0.17, C: 0.25, O: 0.20 }
   */
  createToolMaterial(materialComposition: Record<string, number>, weathering: number, scene: any) {
    const structure = this.metallicFromComposition(materialComposition) > 0.5 
      ? 'crystalline' // Metals
      : 'amorphous'; // Stone, bone
    
    const props = this.calculateVisualProperties(
      materialComposition,
      288, // Room temperature
      structure
    );
    
    // Weathering increases roughness
    props.roughness = Math.min(1.0, props.roughness + weathering * 0.3);
    
    // Oxidation darkens metals
    if (props.metallic > 0.5 && weathering > 0.5) {
      props.baseColor.r *= 0.7;
      props.baseColor.g *= 0.6;
      props.baseColor.b *= 0.5;
    }
    
    return this.createMaterial('tool', props, scene);
  }
}

/**
 * The Complete System
 * 
 * ONE renderer for EVERYTHING.
 * Properties calculated from elements.
 * No texture files needed.
 */
export const ELEMENTAL_RENDERING = {
  planet: PlanetSurfaceRenderer,
  creature: CreatureSurfaceRenderer,
  tool: ToolRenderer,
} as const;
