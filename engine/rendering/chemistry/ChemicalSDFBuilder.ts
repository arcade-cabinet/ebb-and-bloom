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
      
      Object.entries(entity.elementCounts).forEach(([symbol, count], index) => {
        const elementData = periodicTableData.elements.find((el: any) => el.symbol === symbol);
        if (!elementData) return;
        
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
          materialId,
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
   * Get material ID for element
   */
  private static getElementMaterialId(symbol: string): number {
    switch (symbol) {
      case 'H': return 0; // Hydrogen
      case 'O': return 1; // Oxygen  
      case 'C': return 2; // Carbon
      case 'Fe': case 'Cu': case 'Au': case 'Ag': return 3; // Metals
      default: return 2; // Default to carbon-like
    }
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
          materialId: 1, // Oxygen
          operation: undefined
        },
        {
          type: 'sphere', 
          position: [0.6, 0, 0],
          params: [0.3],
          materialId: 1, // Oxygen
          operation: 'smooth-union',
          operationStrength: 0.15 // Tight bonding
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
        { type: 'sphere', position: [-2, 2, 0], params: [0.5], materialId: 0 },
        { type: 'box', position: [0, 2, 0], params: [0.4, 0.4, 0.4], materialId: 1 },
        { type: 'cylinder', position: [2, 2, 0], params: [0.5, 0.3], materialId: 2 },
        { type: 'pyramid', position: [-2, 0, 0], params: [0.6], materialId: 3 },
        { type: 'torus', position: [0, 0, 0], params: [0.5, 0.2], materialId: 0 },
        { type: 'octahedron', position: [2, 0, 0], params: [0.5], materialId: 1 },
        { type: 'cone', position: [-2, -2, 0], params: [0.5, 0.7, 0.8], materialId: 2 },
      ],
      camera: { position: [0, 0, 5], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }
  
  private static createHydrogenMolecule(): SDFScene {
    return {
      primitives: [
        { type: 'sphere', position: [-0.4, 0, 0], params: [0.2], materialId: 0 },
        { type: 'sphere', position: [0.4, 0, 0], params: [0.2], materialId: 0, operation: 'smooth-union', operationStrength: 0.1 }
      ],
      camera: { position: [0, 0, 3], target: [0, 0, 0] },
      lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
    };
  }

  private static createWaterMolecule(): SDFScene {
    return {
      primitives: [
        { type: 'sphere', position: [0, 0, 0], params: [0.35], materialId: 1 }, // Oxygen center
        { type: 'sphere', position: [-0.8, 0.6, 0], params: [0.2], materialId: 0, operation: 'smooth-union', operationStrength: 0.15 }, // H1  
        { type: 'sphere', position: [0.8, 0.6, 0], params: [0.2], materialId: 0, operation: 'smooth-union', operationStrength: 0.15 } // H2
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
        materialId: 2, // Carbon
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