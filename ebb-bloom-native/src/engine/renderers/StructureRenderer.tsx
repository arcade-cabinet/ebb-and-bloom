/**
 * STRUCTURE RENDERER
 * 
 * Parametric shelter generation from gathered materials.
 * Analyzes entity elementCounts to determine material composition.
 * NO hardcoded models - geometry emerges from materials.
 * 
 * Shelter progression:
 * pit (excavated) → windbreak (sticks) → hut (wood+thatch) → shelter (wood+mud) → longhouse (advanced)
 */

import React, { useMemo } from 'react';
import { Color } from 'three';
import type { Entity, Vector3 } from '../ecs/components/CoreComponents';

export interface StructureRendererProps {
  materials: Entity[];
  shelterType: 'pit' | 'windbreak' | 'hut' | 'shelter' | 'longhouse';
  environment: {
    temperature: number;
    windDirection: Vector3;
    threats: string[];
  };
  position: Vector3;
  age?: number;
}

export interface MaterialComposition {
  wood: number;
  stone: number;
  mud: number;
  thatch: number;
  fiber: number;
}

export const StructureRenderer: React.FC<StructureRendererProps> = ({
  materials,
  shelterType,
  environment,
  position,
  age = 0,
}) => {
  const composition = useMemo(() => analyzeMaterialComposition(materials), [materials]);
  const geometry = useMemo(
    () => generateShelterGeometry(shelterType, composition, environment),
    [shelterType, composition, environment]
  );
  const weatheredMaterials = useMemo(
    () => weatherMaterials(composition, age, environment),
    [composition, age, environment]
  );

  return (
    <group position={[position.x, position.y, position.z]}>
      {geometry.map((part, idx) => (
        <mesh key={idx} position={part.position} rotation={part.rotation}>
          <bufferGeometry attach="geometry" args={part.geometry.args as any} />
          <meshStandardMaterial
            color={weatheredMaterials[part.materialType].color}
            roughness={weatheredMaterials[part.materialType].roughness}
            metalness={weatheredMaterials[part.materialType].metalness}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Analyze material entities to determine composition
 * Uses elementCounts to identify material types:
 * - Wood: High C, H, O (cellulose)
 * - Stone: Si, Ca, Al, O (minerals)
 * - Mud: Si, Al, O, H2O (clay + water)
 * - Thatch: C, H, O (dried plant matter)
 */
function analyzeMaterialComposition(materials: Entity[]): MaterialComposition {
  const composition: MaterialComposition = {
    wood: 0,
    stone: 0,
    mud: 0,
    thatch: 0,
    fiber: 0,
  };

  for (const material of materials) {
    if (!material.elementCounts) continue;

    const elements = material.elementCounts;
    const totalMass = material.mass || 1;

    // Wood: C, H, O ratio typical of cellulose
    const cRatio = (elements['C'] || 0) / totalMass;
    const hRatio = (elements['H'] || 0) / totalMass;
    const oRatio = (elements['O'] || 0) / totalMass;

    if (cRatio > 0.3 && hRatio > 0.05 && oRatio > 0.3) {
      composition.wood += totalMass;
    }

    // Stone: Si, Ca, Al, O (minerals)
    const siRatio = (elements['Si'] || 0) / totalMass;
    const caRatio = (elements['Ca'] || 0) / totalMass;
    const alRatio = (elements['Al'] || 0) / totalMass;

    if (siRatio > 0.2 || caRatio > 0.2 || alRatio > 0.1) {
      composition.stone += totalMass;
    }

    // Mud: Clay minerals + water
    if (siRatio > 0.1 && alRatio > 0.05 && hRatio > 0.1) {
      composition.mud += totalMass;
    }

    // Thatch: Dried plant (high C, lower H than fresh)
    if (cRatio > 0.4 && hRatio < 0.08 && oRatio > 0.2) {
      composition.thatch += totalMass;
    }

    // Fiber: Plant cellulose (similar to wood but different texture)
    if (cRatio > 0.35 && oRatio > 0.35) {
      composition.fiber += totalMass;
    }
  }

  return composition;
}

/**
 * Generate shelter geometry based on type and available materials
 */
function generateShelterGeometry(
  type: 'pit' | 'windbreak' | 'hut' | 'shelter' | 'longhouse',
  _materials: MaterialComposition,
  environment: { windDirection: Vector3; temperature: number; threats: string[] }
): ShelterPart[] {
  switch (type) {
    case 'pit':
      return generatePit(_materials);
    case 'windbreak':
      return generateWindbreak(_materials, environment.windDirection);
    case 'hut':
      return generateHut(_materials);
    case 'shelter':
      return generateShelter(_materials);
    case 'longhouse':
      return generateLonghouse(_materials);
    default:
      return [];
  }
}

interface ShelterPart {
  geometry: { type: string; args: any[] };
  position: [number, number, number];
  rotation: [number, number, number];
  materialType: keyof MaterialComposition;
}

/**
 * PIT: Excavated depression (negative geometry represented as rim)
 */
function generatePit(_materials: MaterialComposition): ShelterPart[] {
  const parts: ShelterPart[] = [];

  // Rim of excavated dirt
  const rimRadius = 1.5;
  const rimSegments = 16;

  for (let i = 0; i < rimSegments; i++) {
    const angle = (i / rimSegments) * Math.PI * 2;
    const x = Math.cos(angle) * rimRadius;
    const z = Math.sin(angle) * rimRadius;

    parts.push({
      geometry: { type: 'BoxGeometry', args: [0.3, 0.2, 0.2] } as any,
      position: [x, -0.3, z],
      rotation: [0, angle, 0],
      materialType: 'mud',
    });
  }

  return parts;
}

/**
 * WINDBREAK: Vertical sticks in arc facing away from wind
 */
function generateWindbreak(
  materials: MaterialComposition,
  windDirection: Vector3
): ShelterPart[] {
  const parts: ShelterPart[] = [];

  // Determine number of sticks based on available wood
  const stickCount = Math.min(Math.floor(materials.wood / 5), 12);

  // Arc facing away from wind
  const windAngle = Math.atan2(windDirection.z, windDirection.x);
  const arcAngle = Math.PI * 0.7;

  for (let i = 0; i < stickCount; i++) {
    const angle = windAngle + Math.PI + (i / stickCount - 0.5) * arcAngle;
    const radius = 1.2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Sticks angled slightly outward for stability
    parts.push({
      geometry: { type: 'CylinderGeometry', args: [0.03, 0.04, 1.5, 6] } as any,
      position: [x, 0.75, z],
      rotation: [Math.PI * 0.05, angle, 0],
      materialType: 'wood',
    });
  }

  return parts;
}

/**
 * HUT: Circular/domed structure (wood frame + thatch/mud covering)
 */
function generateHut(materials: MaterialComposition): ShelterPart[] {
  const parts: ShelterPart[] = [];
  const radius = 2.0;
  const height = 2.5;

  // Wood frame ribs
  const ribCount = Math.min(Math.floor(materials.wood / 10), 8);
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    parts.push({
      geometry: { type: 'CylinderGeometry', args: [0.05, 0.05, height, 6] } as any,
      position: [x * 0.7, height / 2, z * 0.7],
      rotation: [Math.PI * 0.2 * Math.cos(angle), angle, Math.PI * 0.2 * Math.sin(angle)],
      materialType: 'wood',
    });
  }

  // Covering: thatch if available, else mud
  const coveringMaterial: keyof MaterialComposition = materials.thatch > 20 ? 'thatch' : 'mud';
  const coveringSegments = 12;

  for (let i = 0; i < coveringSegments; i++) {
    const angle = (i / coveringSegments) * Math.PI * 2;
    const nextAngle = ((i + 1) / coveringSegments) * Math.PI * 2;
    const midAngle = (angle + nextAngle) / 2;

    const x = Math.cos(midAngle) * radius * 0.8;
    const z = Math.sin(midAngle) * radius * 0.8;

    parts.push({
      geometry: { type: 'BoxGeometry', args: [0.8, 2.0, 0.15] } as any,
      position: [x, height / 2, z],
      rotation: [Math.PI * 0.15, midAngle, 0],
      materialType: coveringMaterial,
    });
  }

  return parts;
}

/**
 * SHELTER: Rectangular structure (wood frame + mud/stone walls)
 */
function generateShelter(materials: MaterialComposition): ShelterPart[] {
  const parts: ShelterPart[] = [];
  const width = 3.0;
  const depth = 2.5;
  const height = 2.2;

  // Wood frame corners
  const corners = [
    [-width / 2, height / 2, -depth / 2],
    [width / 2, height / 2, -depth / 2],
    [-width / 2, height / 2, depth / 2],
    [width / 2, height / 2, depth / 2],
  ] as [number, number, number][];

  for (const corner of corners) {
    parts.push({
      geometry: { type: 'CylinderGeometry', args: [0.08, 0.08, height, 6] } as any,
      position: corner,
      rotation: [0, 0, 0],
      materialType: 'wood',
    });
  }

  // Walls: mud if available, else stone
  const wallMaterial: keyof MaterialComposition = materials.mud > 30 ? 'mud' : 'stone';

  // Front and back walls
  parts.push({
    geometry: { type: 'BoxGeometry', args: [width, height * 0.8, 0.2] } as any,
    position: [0, height / 2, -depth / 2],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  parts.push({
    geometry: { type: 'BoxGeometry', args: [width, height * 0.8, 0.2] } as any,
    position: [0, height / 2, depth / 2],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  // Side walls
  parts.push({
    geometry: { type: 'BoxGeometry', args: [0.2, height * 0.8, depth] } as any,
    position: [-width / 2, height / 2, 0],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  parts.push({
    geometry: { type: 'BoxGeometry', args: [0.2, height * 0.8, depth] } as any,
    position: [width / 2, height / 2, 0],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  // Roof
  parts.push({
    geometry: { type: 'BoxGeometry', args: [width + 0.4, 0.15, depth + 0.4] } as any,
    position: [0, height, 0],
    rotation: [0, 0, 0],
    materialType: materials.thatch > 15 ? 'thatch' : 'wood',
  });

  return parts;
}

/**
 * LONGHOUSE: Extended rectangular (multiple rooms, advanced joinery)
 */
function generateLonghouse(materials: MaterialComposition): ShelterPart[] {
  const parts: ShelterPart[] = [];
  const width = 4.0;
  const length = 10.0;
  const height = 3.0;
  const roomCount = 3;

  // Main structural posts (advanced joinery)
  const postCount = 8;
  for (let i = 0; i < postCount; i++) {
    const x = (i % 2 === 0 ? -width / 2 : width / 2);
    const z = -length / 2 + (i / (postCount - 1)) * length;

    parts.push({
      geometry: { type: 'CylinderGeometry', args: [0.12, 0.12, height, 8] } as any,
      position: [x, height / 2, z],
      rotation: [0, 0, 0],
      materialType: 'wood',
    });
  }

  // Walls with room divisions
  const wallMaterial: keyof MaterialComposition = materials.stone > 50 ? 'stone' : 'mud';

  // Exterior walls
  parts.push({
    geometry: { type: 'BoxGeometry', args: [0.25, height * 0.9, length] } as any,
    position: [-width / 2, height / 2, 0],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  parts.push({
    geometry: { type: 'BoxGeometry', args: [0.25, height * 0.9, length] } as any,
    position: [width / 2, height / 2, 0],
    rotation: [0, 0, 0],
    materialType: wallMaterial,
  });

  // Interior dividing walls (rooms)
  for (let i = 1; i < roomCount; i++) {
    const z = -length / 2 + (i / roomCount) * length;
    parts.push({
      geometry: { type: 'BoxGeometry', args: [width, height * 0.8, 0.15] } as any,
      position: [0, height / 2, z],
      rotation: [0, 0, 0],
      materialType: 'wood',
    });
  }

  // Roof (peaked)
  parts.push({
    geometry: { type: 'BoxGeometry', args: [width + 0.5, 0.2, length + 0.5] } as any,
    position: [0, height + 0.3, 0],
    rotation: [0, 0, 0],
    materialType: 'thatch',
  });

  return parts;
}

/**
 * Weather materials based on age and environment
 */
function weatherMaterials(
  _composition: MaterialComposition,
  ageYears: number,
  environment: { temperature: number; threats: string[] }
): Record<keyof MaterialComposition, { color: Color; roughness: number; metalness: number }> {
  const weathering = Math.min(1, ageYears / 100);
  const tempStress = Math.abs(environment.temperature - 20) / 30;

  return {
    wood: {
      color: new Color().setHex(
        interpolateColor(0x8b4513, 0x4a4a4a, weathering + tempStress * 0.3)
      ),
      roughness: 0.8 + weathering * 0.15,
      metalness: 0,
    },
    stone: {
      color: new Color().setHex(interpolateColor(0x808080, 0x606060, weathering * 0.5)),
      roughness: 0.7 + weathering * 0.2,
      metalness: 0.1,
    },
    mud: {
      color: new Color().setHex(
        interpolateColor(0xa0826d, 0x6b5d54, weathering + tempStress * 0.4)
      ),
      roughness: 0.9 + weathering * 0.1,
      metalness: 0,
    },
    thatch: {
      color: new Color().setHex(interpolateColor(0xdaa520, 0x8b7355, weathering * 0.7)),
      roughness: 0.95,
      metalness: 0,
    },
    fiber: {
      color: new Color().setHex(interpolateColor(0xc19a6b, 0x8b7355, weathering * 0.6)),
      roughness: 0.9,
      metalness: 0,
    },
  };
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: number, color2: number, t: number): number {
  const c1 = {
    r: (color1 >> 16) & 0xff,
    g: (color1 >> 8) & 0xff,
    b: color1 & 0xff,
  };
  const c2 = {
    r: (color2 >> 16) & 0xff,
    g: (color2 >> 8) & 0xff,
    b: color2 & 0xff,
  };

  const r = Math.floor(c1.r + (c2.r - c1.r) * t);
  const g = Math.floor(c1.g + (c2.g - c1.g) * t);
  const b = Math.floor(c1.b + (c2.b - c1.b) * t);

  return (r << 16) | (g << 8) | b;
}
