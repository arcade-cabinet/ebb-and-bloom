/**
 * CHEMICAL SDF BUILDER
 * 
 * Converts ECS chemical entities to SDF scene definitions.
 * Uses periodic table data and bonding information.
 */

import { SDFScene, SDFPrimitive } from '../sdf/SDFPrimitives';
import type { Entity } from '../../ecs/components/CoreComponents';
import periodicTableData from '../../../data/PeriodicTableJSON.json';

export class ChemicalSDFBuilder {
  
  /**
   * Build SDF scene from ECS chemical entities
   */
  static buildSceneFromECS(entities: Entity[]): SDFScene {
    const primitives: SDFPrimitive[] = [];
    
    entities.forEach(entity => {
      if (!entity.elementCounts || !entity.position) return;
      
      Object.entries(entity.elementCounts).forEach(([symbol], index) => {
        const elementData = periodicTableData.elements.find((el: any) => el.symbol === symbol);
        if (!elementData || !entity.position) return;
        
        const materialId = this.getElementMaterialId(symbol);
        const atomRadius = this.getAtomicRadius(elementData);
        const offsetX = index * 0.1;
        
        // Complex shapes based on element type
        const type = elementData.number === 1 ? 'sphere' :
                     elementData.number <= 10 ? 'porbital' :
                     elementData.number <= 20 ? 'dorbital' : 'octahedron';
        
        primitives.push({
          type: type as any,
          position: [entity.position.x + offsetX, entity.position.y, entity.position.z],
          params: [atomRadius],
          materialId: String(materialId),
          operation: index === 0 ? undefined : 'smooth-union',
          operationStrength: 0.2
        });
      });
    });
    
    return {
      primitives,
      camera: { position: [0, 0, 5], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }
  
  /**
   * Get material ID for element (returns string for MaterialRegistry)
   */
  private static getElementMaterialId(symbol: string): string {
    return `element-${symbol.toLowerCase()}`;
  }
  
  /**
   * Get realistic atomic radius from element data
   */
  private static getAtomicRadius(element: any): number {
    // Convert from picometers to scene units
    const pmRadius = element.atomic_mass ? element.atomic_mass / 100 : 100;
    return Math.max(0.2, pmRadius / 300);
  }
  
  /**
   * Create test scenes for different molecular structures
   */
  static createTestScenes() {
    return {
      // Simple molecules
      hydrogen: this.createHydrogenMolecule(),
      oxygen: this.createOxygenMolecule(), 
      water: this.createWaterMolecule(),
      
      // Complex molecules
      benzene: this.createBenzeneMolecule(),
      
      // Geometric tests
      primitives: this.createPrimitiveShowcase()
    };
  }
  
  private static createOxygenMolecule(): SDFScene {
    return {
      primitives: [
        {
          type: 'sphere',
          position: [-0.6, 0, 0],
          params: [0.3],
          materialId: 'element-o',
          operation: undefined
        },
        {
          type: 'sphere', 
          position: [0.6, 0, 0],
          params: [0.3],
          materialId: 'element-o',
          operation: 'smooth-union',
          operationStrength: 0.15
        }
      ],
      camera: {
        position: [0, 0, 3],
        target: [0, 0, 0]
      },
      lighting: {
        ambient: 0.3,
        directional: {
          direction: [1, 1, -1],
          intensity: 0.8
        }
      }
    };
  }
  
  private static createPrimitiveShowcase(): SDFScene {
    return {
      primitives: [
        { type: 'sphere', position: [-2, 2, 0], params: [0.5], materialId: 'element-h' },
        { type: 'box', position: [0, 2, 0], params: [0.4, 0.4, 0.4], materialId: 'element-o' },
        { type: 'cylinder', position: [2, 2, 0], params: [0.5, 0.3], materialId: 'element-c' },
        { type: 'pyramid', position: [-2, 0, 0], params: [0.6], materialId: 'element-fe' },
        { type: 'torus', position: [0, 0, 0], params: [0.5, 0.2], materialId: 'element-h' },
        { type: 'octahedron', position: [2, 0, 0], params: [0.5], materialId: 'element-o' },
        { type: 'cone', position: [-2, -2, 0], params: [0.5, 0.7, 0.8], materialId: 'element-c' },
      ],
      camera: { position: [0, 0, 5], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }
  
  private static createHydrogenMolecule(): SDFScene {
    return {
      primitives: [
        { type: 'sphere', position: [-0.4, 0, 0], params: [0.2], materialId: 'element-h' },
        { type: 'sphere', position: [0.4, 0, 0], params: [0.2], materialId: 'element-h', operation: 'smooth-union', operationStrength: 0.1 }
      ],
      camera: { position: [0, 0, 3], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }

  private static createWaterMolecule(): SDFScene {
    return {
      primitives: [
        { type: 'sphere', position: [0, 0, 0], params: [0.35], materialId: 'element-o' },
        { type: 'sphere', position: [-0.8, 0.6, 0], params: [0.2], materialId: 'element-h', operation: 'smooth-union', operationStrength: 0.15 },
        { type: 'sphere', position: [0.8, 0.6, 0], params: [0.2], materialId: 'element-h', operation: 'smooth-union', operationStrength: 0.15 }
      ],
      camera: { position: [0, 0, 3], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }

  private static createBenzeneMolecule(): SDFScene {
    const primitives: SDFPrimitive[] = [];
    
    // 6 carbon atoms in ring
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 0.7;
      primitives.push({
        type: 'sphere',
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
        params: [0.25],
        materialId: 'element-c',
        operation: i === 0 ? undefined : 'smooth-union',
        operationStrength: 0.2
      });
    }
    
    return {
      primitives,
      camera: { position: [0, 0, 4], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }
}