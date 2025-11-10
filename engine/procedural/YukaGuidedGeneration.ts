/**
 * YUKA-GUIDED PROCEDURAL GENERATION
 *
 * Yuka uses LAWS to determine:
 * - What SHOULD exist at each complexity level
 * - What it should LOOK like (from composition)
 * - How it should BEHAVE (from physics)
 *
 * NO ARTIST INPUT. PURE SYNTHESIS.
 */

import { BIOLOGICAL_CONSTANTS, ECOLOGICAL_CONSTANTS } from '../tables';
import { PlanetaryVisuals } from './PlanetaryVisuals';
import { CreatureVisuals } from './CreatureVisuals';
import { ToolVisuals } from './ToolVisuals';
import { StructureVisuals } from './StructureVisuals';

export class YukaGuidedGeneration {
  /**
   * Generate complete visual for ANY object based on its properties
   */
  static generateVisuals(objectType: string, properties: any, timeAge: number) {
    switch (objectType) {
      case 'planet':
        return this.generatePlanet(properties);

      case 'creature':
        return this.generateCreature(properties, timeAge);

      case 'tool':
        return this.generateTool(properties, timeAge);

      case 'structure':
        return this.generateStructure(properties, timeAge);

      default:
        throw new Error(`Unknown object type: ${objectType}`);
    }
  }

  /**
   * PLANET: From accretion → visual
   */
  private static generatePlanet(props: { composition: any; temperature: number; atmosphere: any }) {
    // Crust composition determines appearance
    const crust = props.composition.crust || { Si: 0.28, O: 0.46, Fe: 0.05 };
    const hasAtmosphere = props.atmosphere !== null;

    const visuals = PlanetaryVisuals.generateFromCrust(crust, props.temperature, hasAtmosphere);

    // Yuka's decision log
    console.log('[Yuka] Planet visual:');
    console.log(
      `  Crust: ${Object.entries(crust)
        .slice(0, 3)
        .map(([e, f]) => `${e}:${((f as number) * 100).toFixed(0)}%`)
        .join(', ')}`
    );
    console.log(
      `  Color: RGB(${visuals.baseColor.r.toFixed(2)}, ${visuals.baseColor.g.toFixed(2)}, ${visuals.baseColor.b.toFixed(2)})`
    );
    console.log(`  Roughness: ${visuals.roughness.toFixed(2)}`);
    console.log(`  Atmosphere: ${hasAtmosphere ? 'Yes' : 'No'}`);

    return visuals;
  }

  /**
   * CREATURE: From allometry + environment → visual
   */
  private static generateCreature(
    props: {
      mass: number;
      locomotion: string;
      diet: string;
      biome: string;
    },
    age: number
  ) {
    const visuals = CreatureVisuals.generate(props.mass, props.locomotion, props.diet, props.biome);

    console.log('[Yuka] Creature visual:');
    console.log(
      `  Mass: ${props.mass.toFixed(1)}kg → Body: ${visuals.proportions.bodyLength.toFixed(2)}m`
    );
    console.log(`  Locomotion: ${props.locomotion} → Limbs: ${visuals.proportions.limbCount}`);
    console.log(`  Environment: ${props.biome} → Camouflage: ${visuals.surfaceType}`);

    return visuals;
  }

  /**
   * TOOL: From available elements + tech level → visual
   */
  private static generateTool(
    props: {
      material: string;
      purpose: string;
      techLevel: number;
    },
    age: number
  ) {
    const weathering = Math.min(1, age / 100); // 100 years = fully weathered

    const visuals = ToolVisuals.generate(props.material, props.purpose, weathering);

    console.log('[Yuka] Tool visual:');
    console.log(`  Material: ${props.material} → Metallic: ${visuals.metallic.toFixed(2)}`);
    console.log(`  Purpose: ${props.purpose} → Shape: ${visuals.shape}`);
    console.log(`  Age: ${age}y → Weathering: ${(weathering * 100).toFixed(0)}%`);

    return visuals;
  }

  /**
   * STRUCTURE: From materials + social complexity → visual
   */
  private static generateStructure(
    props: {
      materials: string[];
      construction: string;
      population: number;
    },
    age: number
  ) {
    const visuals = StructureVisuals.generate(props.materials, props.construction, age);

    console.log('[Yuka] Structure visual:');
    console.log(`  Materials: ${props.materials.join(', ')}`);
    console.log(`  Construction: ${props.construction} → Form: ${visuals.geometry}`);
    console.log(`  Age: ${age}y → Weathering visible`);

    return visuals;
  }

  /**
   * YUKA'S MASTER DECISION
   * "What should exist at complexity level N?"
   */
  static whatShouldExist(complexityLevel: number, planetProperties: any): string[] {
    const objects: string[] = [];

    // Level 0-1: Just planet
    if (complexityLevel < 0.1) {
      objects.push('planet');
    }

    // Level 0.1-0.3: Planet + atmosphere
    if (complexityLevel >= 0.1) {
      objects.push('planet', 'atmosphere');
    }

    // Level 0.3-0.5: Add life (if conditions permit)
    if (complexityLevel >= 0.3 && planetProperties.hasWater && planetProperties.hasAtmosphere) {
      objects.push('creatures');
    }

    // Level 0.5-0.7: Add tools (if intelligence threshold reached)
    if (complexityLevel >= 0.5 && planetProperties.maxEQ > 2.5) {
      objects.push('tools');
    }

    // Level 0.7-0.9: Add structures (if social)
    if (complexityLevel >= 0.7 && planetProperties.population > 30) {
      objects.push('structures');
    }

    // Level 0.9+: Advanced civilization
    if (complexityLevel >= 0.9) {
      objects.push('cities', 'agriculture', 'trade-routes');
    }

    return objects;
  }
}
