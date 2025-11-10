/**
 * MOLECULAR VISUAL BLUEPRINTS
 * 
 * Like creature/tool visual blueprints, but for MOLECULES!
 * Each molecule has ACTUAL GEOMETRY based on chemistry.
 * 
 * POINT: Give science MEANING - show what molecules ACTUALLY look like!
 */

import {
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Color3,
  Vector3,
  InstancedMesh,
} from '@babylonjs/core';

/**
 * Molecular geometry types (VSEPR theory)
 */
export enum MolecularGeometry {
  LINEAR = 'linear',              // CO2, H2 (180°)
  BENT = 'bent',                  // H2O (104.5°)
  TRIGONAL_PLANAR = 'trigonal',   // BF3 (120°)
  TETRAHEDRAL = 'tetrahedral',    // CH4 (109.5°)
  TRIGONAL_PYRAMIDAL = 'pyramidal', // NH3
  OCTAHEDRAL = 'octahedral',      // SF6
}

/**
 * Molecular blueprint (describes actual molecular structure)
 */
export interface MolecularBlueprint {
  formula: string;           // H2O, CO2, CH4, etc.
  atoms: AtomInstance[];     // Actual atoms with positions
  bonds: Bond[];             // Bonds between atoms
  geometry: MolecularGeometry;
  bondAngle: number;         // Degrees
  scale: number;             // Visual scale (pm → game units)
}

/**
 * Atom instance in molecule
 */
export interface AtomInstance {
  element: string;           // H, O, C, N, etc.
  position: Vector3;         // Relative position in molecule
  radius: number;            // Van der Waals radius (pm)
  color: Color3;             // CPK coloring
}

/**
 * Bond between atoms
 */
export interface Bond {
  atom1: number;             // Index in atoms array
  atom2: number;
  order: number;             // 1=single, 2=double, 3=triple
  length: number;            // Bond length (pm)
}

/**
 * CPK Colors (standard molecular visualization)
 */
const CPK_COLORS: Record<string, Color3> = {
  H: new Color3(1, 1, 1),        // White
  C: new Color3(0.2, 0.2, 0.2),  // Dark gray
  N: new Color3(0.2, 0.2, 1),    // Blue
  O: new Color3(1, 0.2, 0.2),    // Red
  F: new Color3(0.5, 1, 0.5),    // Light green
  P: new Color3(1, 0.5, 0),      // Orange
  S: new Color3(1, 1, 0.2),      // Yellow
  Cl: new Color3(0.2, 1, 0.2),   // Green
  He: new Color3(0.8, 1, 1),     // Cyan
};

/**
 * Van der Waals radii (picometers)
 */
const VDW_RADII: Record<string, number> = {
  H: 120,
  C: 170,
  N: 155,
  O: 152,
  F: 147,
  P: 180,
  S: 180,
  Cl: 175,
  He: 140,
};

/**
 * Molecular Visual System
 * 
 * Creates scientifically accurate 3D molecular models
 */
export class MolecularVisuals {
  /**
   * Create visual blueprint for a molecule
   */
  static createBlueprint(formula: string): MolecularBlueprint {
    switch (formula) {
      case 'H2':
        return this.createH2();
      case 'H2O':
        return this.createH2O();
      case 'CO2':
        return this.createCO2();
      case 'CH4':
        return this.createCH4();
      case 'NH3':
        return this.createNH3();
      case 'O2':
        return this.createO2();
      default:
        // Fallback: single atom
        return this.createAtom(formula[0] || 'H');
    }
  }

  /**
   * Render molecule as 3D mesh (atoms + bonds)
   */
  static renderMolecule(
    blueprint: MolecularBlueprint,
    position: Vector3,
    scene: Scene,
    instanceId?: string
  ): Mesh {
    const root = new Mesh(`molecule-${blueprint.formula}-${instanceId || 'root'}`, scene);
    root.position = position;

    // Render atoms
    for (let i = 0; i < blueprint.atoms.length; i++) {
      const atom = blueprint.atoms[i];
      
      const sphere = MeshBuilder.CreateSphere(
        `atom-${i}`,
        { diameter: atom.radius * blueprint.scale },
        scene
      );
      
      sphere.position = atom.position.scale(blueprint.scale);
      sphere.parent = root;
      
      const mat = new StandardMaterial(`mat-${i}`, scene);
      mat.diffuseColor = atom.color;
      mat.emissiveColor = atom.color; // FULL BRIGHTNESS
      mat.specularColor = new Color3(1, 1, 1);
      mat.ambientColor = atom.color;
      sphere.material = mat;
    }

    // Render bonds (cylinders)
    for (let i = 0; i < blueprint.bonds.length; i++) {
      const bond = blueprint.bonds[i];
      const atom1 = blueprint.atoms[bond.atom1];
      const atom2 = blueprint.atoms[bond.atom2];
      
      const start = atom1.position.scale(blueprint.scale);
      const end = atom2.position.scale(blueprint.scale);
      const length = Vector3.Distance(start, end);
      const direction = end.subtract(start).normalize();
      
      const cylinder = MeshBuilder.CreateCylinder(
        `bond-${i}`,
        {
          height: length,
          diameter: bond.order * 0.5 * blueprint.scale, // Thicker for double/triple bonds
        },
        scene
      );
      
      const center = Vector3.Lerp(start, end, 0.5);
      cylinder.position = center;
      cylinder.parent = root;
      
      // Align cylinder with bond direction
      const axis1 = Vector3.Cross(Vector3.Up(), direction);
      const axis2 = Vector3.Cross(direction, axis1);
      const axis3 = direction;
      cylinder.rotation = Vector3.RotationFromAxis(axis1, axis2, axis3);
      
      const bondMat = new StandardMaterial(`bond-mat-${i}`, scene);
      bondMat.diffuseColor = new Color3(0.9, 0.9, 0.9);
      bondMat.emissiveColor = new Color3(0.7, 0.7, 0.7); // Bright bonds
      bondMat.specularColor = new Color3(1, 1, 1);
      bondMat.alpha = 1.0;
      cylinder.material = bondMat;
    }

    return root;
  }

  /**
   * H2 - Hydrogen molecule (simplest)
   * Linear, 74 pm bond length
   */
  private static createH2(): MolecularBlueprint {
    return {
      formula: 'H2',
      geometry: MolecularGeometry.LINEAR,
      bondAngle: 180,
      scale: 1.0, // CINEMATIC SCALE (matching other molecules)
      atoms: [
        {
          element: 'H',
          position: new Vector3(-37, 0, 0), // Half bond length
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(37, 0, 0),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 1, length: 74 },
      ],
    };
  }

  /**
   * H2O - Water molecule
   * Bent, 104.5° angle, 95.84 pm O-H bond
   */
  private static createH2O(): MolecularBlueprint {
    const bondLength = 95.84;
    const angle = (104.5 * Math.PI) / 180; // Radians

    return {
      formula: 'H2O',
      geometry: MolecularGeometry.BENT,
      bondAngle: 104.5,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element: 'O',
          position: new Vector3(0, 0, 0), // Center
          radius: VDW_RADII.O,
          color: CPK_COLORS.O,
        },
        {
          element: 'H',
          position: new Vector3(
            bondLength * Math.cos(angle / 2),
            bondLength * Math.sin(angle / 2),
            0
          ),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(
            bondLength * Math.cos(angle / 2),
            -bondLength * Math.sin(angle / 2),
            0
          ),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 1, length: bondLength },
        { atom1: 0, atom2: 2, order: 1, length: bondLength },
      ],
    };
  }

  /**
   * CO2 - Carbon dioxide
   * Linear, 180°, 116 pm C=O double bond
   */
  private static createCO2(): MolecularBlueprint {
    const bondLength = 116;

    return {
      formula: 'CO2',
      geometry: MolecularGeometry.LINEAR,
      bondAngle: 180,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element: 'C',
          position: new Vector3(0, 0, 0),
          radius: VDW_RADII.C,
          color: CPK_COLORS.C,
        },
        {
          element: 'O',
          position: new Vector3(-bondLength, 0, 0),
          radius: VDW_RADII.O,
          color: CPK_COLORS.O,
        },
        {
          element: 'O',
          position: new Vector3(bondLength, 0, 0),
          radius: VDW_RADII.O,
          color: CPK_COLORS.O,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 2, length: bondLength }, // Double bond
        { atom1: 0, atom2: 2, order: 2, length: bondLength },
      ],
    };
  }

  /**
   * CH4 - Methane
   * Tetrahedral, 109.5°, 109 pm C-H bond
   */
  private static createCH4(): MolecularBlueprint {
    const bondLength = 109;
    const angle = (109.5 * Math.PI) / 180;

    // Tetrahedral geometry (4 H atoms around C)
    return {
      formula: 'CH4',
      geometry: MolecularGeometry.TETRAHEDRAL,
      bondAngle: 109.5,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element: 'C',
          position: new Vector3(0, 0, 0),
          radius: VDW_RADII.C,
          color: CPK_COLORS.C,
        },
        {
          element: 'H',
          position: new Vector3(bondLength, 0, 0),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(-bondLength / 3, bondLength * 0.943, 0),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(-bondLength / 3, -bondLength * 0.471, bondLength * 0.816),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(-bondLength / 3, -bondLength * 0.471, -bondLength * 0.816),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 1, length: bondLength },
        { atom1: 0, atom2: 2, order: 1, length: bondLength },
        { atom1: 0, atom2: 3, order: 1, length: bondLength },
        { atom1: 0, atom2: 4, order: 1, length: bondLength },
      ],
    };
  }

  /**
   * NH3 - Ammonia
   * Trigonal pyramidal, 107°, 101 pm N-H bond
   */
  private static createNH3(): MolecularBlueprint {
    const bondLength = 101;
    const angle = (107 * Math.PI) / 180;

    return {
      formula: 'NH3',
      geometry: MolecularGeometry.TRIGONAL_PYRAMIDAL,
      bondAngle: 107,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element: 'N',
          position: new Vector3(0, 0, 0),
          radius: VDW_RADII.N,
          color: CPK_COLORS.N,
        },
        {
          element: 'H',
          position: new Vector3(bondLength, 0, 0),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(-bondLength / 2, bondLength * 0.866, 0),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
        {
          element: 'H',
          position: new Vector3(-bondLength / 2, -bondLength * 0.433, bondLength * 0.75),
          radius: VDW_RADII.H,
          color: CPK_COLORS.H,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 1, length: bondLength },
        { atom1: 0, atom2: 2, order: 1, length: bondLength },
        { atom1: 0, atom2: 3, order: 1, length: bondLength },
      ],
    };
  }

  /**
   * O2 - Oxygen molecule
   * Linear, double bond, 121 pm
   */
  private static createO2(): MolecularBlueprint {
    const bondLength = 121;

    return {
      formula: 'O2',
      geometry: MolecularGeometry.LINEAR,
      bondAngle: 180,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element: 'O',
          position: new Vector3(-bondLength / 2, 0, 0),
          radius: VDW_RADII.O,
          color: CPK_COLORS.O,
        },
        {
          element: 'O',
          position: new Vector3(bondLength / 2, 0, 0),
          radius: VDW_RADII.O,
          color: CPK_COLORS.O,
        },
      ],
      bonds: [
        { atom1: 0, atom2: 1, order: 2, length: bondLength }, // Double bond
      ],
    };
  }

  /**
   * Single atom (for He, etc.)
   */
  private static createAtom(element: string): MolecularBlueprint {
    return {
      formula: element,
      geometry: MolecularGeometry.LINEAR,
      bondAngle: 0,
      scale: 1.0, // CINEMATIC SCALE
      atoms: [
        {
          element,
          position: Vector3.Zero(),
          radius: VDW_RADII[element] || 150,
          color: CPK_COLORS[element] || new Color3(0.5, 0.5, 0.5),
        },
      ],
      bonds: [],
    };
  }

  /**
   * Create rotating molecular cloud with ACTUAL MOLECULES
   * Each molecule is a proper 3D structure that tumbles and spins!
   */
  static createMolecularCloud(
    position: Vector3,
    radius: number,
    moleculeTypes: string[],
    count: number,
    scene: Scene
  ): Mesh[] {
    const meshes: Mesh[] = [];

    for (let i = 0; i < count; i++) {
      // Random molecule type
      const formula = moleculeTypes[Math.floor(Math.random() * moleculeTypes.length)];
      const blueprint = this.createBlueprint(formula);

      // Random position in cloud
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;

      const moleculePos = position.add(
        new Vector3(
          r * Math.sin(angle1) * Math.cos(angle2),
          r * Math.sin(angle1) * Math.sin(angle2),
          r * Math.cos(angle1)
        )
      );

      // Render molecule
      const molecule = this.renderMolecule(blueprint, moleculePos, scene, `${i}`);

      // Add tumbling rotation
      molecule.rotation = new Vector3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      meshes.push(molecule);
    }

    return meshes;
  }

  /**
   * Animate molecule (tumbling in space)
   */
  static animateMolecule(molecule: Mesh, delta: number): void {
    // Slow tumbling rotation
    molecule.rotation.x += delta * 0.2;
    molecule.rotation.y += delta * 0.3;
    molecule.rotation.z += delta * 0.1;
  }
}

