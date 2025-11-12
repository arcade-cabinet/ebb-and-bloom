export interface TextureSet {
  diffuse?: string;
  normal?: string;
  roughness?: string;
  metallic?: string;
  ao?: string;
  emission?: string;
  tiling?: [number, number];
  offset?: [number, number];
}

export interface BlendMode {
  type: 'linear' | 'smooth' | 'noise' | 'gradient';
  strength: number;
  transitionDistance: number;
  noiseScale?: number;
  gradientDirection?: [number, number, number];
}

export interface CoordinateTarget {
  type: 'surface' | 'volume' | 'edge' | 'vertex';
  region: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right' | 'custom';
  customRegion?: (p: [number, number, number]) => boolean;
  blendRadius?: number;
  edgeWidth?: number;
  vertexRadius?: number;
}

export interface SDFPrimitive {
  type: 'sphere' | 'box' | 'cylinder' | 'cone' | 'pyramid' | 'torus' | 'octahedron' | 
        'hexprism' | 'capsule' | 'porbital' | 'dorbital' | 'triPrism' |
        'ellipsoid' | 'roundedBox' | 'cappedCylinder' | 'plane' | 'roundCone' | 
        'mengerSponge' | 'gyroid' | 'superellipsoid' | 'torusKnot';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  params: number[];
  materialId: string;
  textureSet?: TextureSet;
  operation?: 'union' | 'subtract' | 'intersect' | 'smooth-union' | 'smooth-subtract';
  operationStrength?: number;
  blendMode?: BlendMode;
  coordinateTarget?: CoordinateTarget;
}

export interface SDFScene {
  primitives: SDFPrimitive[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  lighting: {
    ambient: number;
    directional: {
      direction: [number, number, number];
      intensity: number;
    };
  };
}
