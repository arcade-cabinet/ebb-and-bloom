/**
 * Generation Zero types (copied from main project)
 */
export interface GenerationZeroOutput {
  seedPhrase: string;
  planetary: PlanetaryManifest;
  creatureArchetypes: any[];
}

export interface PlanetaryManifest {
  planetaryName: string;
  worldTheme: string;
  cores: any[];
  sharedMaterials: any[];
  fillMaterial: any;
  generationMethod: string;
}
