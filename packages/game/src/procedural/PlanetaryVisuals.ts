/**
 * Planetary Visual Generation
 * From element composition → complete visual properties
 * NO TEXTURES. Pure calculation.
 */

import { PERIODIC_TABLE } from '../tables/periodic-table';
import { Color3, StandardMaterial, PBRMaterial } from '@babylonjs/core';
import { RadiationLaws } from '../laws/02-planetary/radiation';

export class PlanetaryVisuals {
  /**
   * Generate planet appearance from crust composition
   */
  static generateFromCrust(crust: Record<string, number>, temp_K: number, hasAtmosphere: boolean) {
    // Base color from dominant elements
    const color = this.elementCompositionToColor(crust);
    
    // Roughness from geological activity
    const roughness = temp_K > 400 ? 0.3 : 0.7; // Hot = smooth (lava), Cold = rough (ice/rock)
    
    // Metallic from metal content
    const metallic = (crust.Fe || 0) + (crust.Al || 0);
    
    // Atmosphere adds haze
    const atmosphericScatter = hasAtmosphere ? 0.3 : 0;
    
    // Check for radioactive elements (glow!)
    const U_content = crust.U || 0;
    const Th_content = crust.Th || 0;
    const isRadioactive = U_content > 0.001 || Th_content > 0.001;
    
    // Thermal glow from temperature
    const thermalGlow = temp_K > 800 ? RadiationLaws.thermal.glowColor(temp_K) : null;
    
    // Radioactive glow (greenish tint)
    const radioactiveGlow = isRadioactive ? new Color3(0.2, 1, 0.3) : null;
    
    // Combine glows
    let emissive = null;
    if (thermalGlow) {
      emissive = new Color3(thermalGlow.r, thermalGlow.g, thermalGlow.b);
    }
    if (radioactiveGlow && isRadioactive) {
      emissive = emissive 
        ? Color3.Lerp(emissive, radioactiveGlow, 0.3)
        : radioactiveGlow;
    }
    
    return {
      baseColor: color,
      roughness,
      metallic,
      atmosphericHaze: atmosphericScatter,
      emissive,
      isRadioactive,
      radiationDose_mSv: isRadioactive ? U_content * 1000 + Th_content * 500 : 0,
    };
  }
  
  /**
   * Element composition → RGB color
   */
  private static elementCompositionToColor(comp: Record<string, number>): Color3 {
    // Element colors (observed in nature)
    const colors: Record<string, Color3> = {
      Fe: new Color3(0.4, 0.35, 0.3), // Rusty brown
      Si: new Color3(0.6, 0.6, 0.55), // Gray
      O: new Color3(0.95, 0.95, 0.95), // White (ice)
      C: new Color3(0.1, 0.1, 0.1), // Black
      S: new Color3(0.9, 0.9, 0.2), // Yellow
      Ca: new Color3(0.95, 0.95, 0.9), // Whitish
      Al: new Color3(0.75, 0.75, 0.75), // Silver-gray
    };
    
    let r = 0, g = 0, b = 0, total = 0;
    
    for (const [elem, fraction] of Object.entries(comp)) {
      const color = colors[elem] || new Color3(0.5, 0.5, 0.5);
      r += color.r * fraction;
      g += color.g * fraction;
      b += color.b * fraction;
      total += fraction;
    }
    
    if (total > 0) {
      r /= total;
      g /= total;
      b /= total;
    }
    
    return new Color3(r, g, b);
  }
  
  /**
   * Blackbody radiation color from temperature
   */
  private static blackbodyGlow(temp_K: number): Color3 {
    if (temp_K < 1000) return new Color3(0.5, 0, 0); // Deep red
    if (temp_K < 2000) return new Color3(1, 0.2, 0); // Red
    if (temp_K < 3000) return new Color3(1, 0.6, 0.2); // Orange
    if (temp_K < 5000) return new Color3(1, 1, 0.7); // Yellow-white
    return new Color3(0.9, 0.9, 1); // Blue-white
  }
  
  /**
   * Generate atmospheric appearance
   */
  static generateAtmosphere(composition: Record<string, number>, pressure_Pa: number) {
    // Dominant gas determines color
    const N2 = composition.N2 || 0;
    const O2 = composition.O2 || 0;
    const CO2 = composition.CO2 || 0;
    const CH4 = composition.CH4 || 0;
    
    let color = new Color3(0.5, 0.7, 1); // Default blue (N2/O2)
    
    if (CO2 > 0.5) color = new Color3(0.9, 0.7, 0.5); // Orange (Venus-like)
    if (CH4 > 0.5) color = new Color3(0.8, 0.6, 0.4); // Tan (Titan-like)
    
    // Thickness from pressure
    const thickness = Math.min(1, pressure_Pa / 101325); // Relative to Earth
    
    return { color, opacity: 0.3 * thickness };
  }
}

