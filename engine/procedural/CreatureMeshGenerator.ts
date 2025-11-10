/**
 * Creature Mesh from Anatomy Laws
 */

import { AnatomyLaws } from '../laws/04-biological/anatomy';
import { BiologicalLaws } from '../laws/biology';

export class CreatureMeshGenerator {
  generate(mass_kg: number, locomotion: string, diet: string) {
    const limbLength = AnatomyLaws.skeletal.limbLength(mass_kg, locomotion);
    const muscleMass = AnatomyLaws.muscular.muscleMass(mass_kg, 0.7);
    const skeletonMass = AnatomyLaws.skeletal.skeletonMass(mass_kg, 'mammal');

    const bodyLength = Math.pow(mass_kg / 500, 1 / 3);
    const bodyRadius = bodyLength * 0.3;

    const legCount = locomotion === 'cursorial' ? 4 : locomotion === 'arboreal' ? 4 : 2;

    return {
      body: { length: bodyLength, radius: bodyRadius },
      limbs: Array(legCount).fill({ length: limbLength, thickness: limbLength * 0.1 }),
      head: { radius: bodyRadius * 0.6 },
      mass: { total: mass_kg, muscle: muscleMass, skeleton: skeletonMass },
    };
  }
}
