import { BASIC_PRIMITIVES_GLSL } from './basic.glsl';
import { ADVANCED_PRIMITIVES_GLSL } from './advanced.glsl';
import { COMPLEX_PRIMITIVES_GLSL } from './complex.glsl';
import { ORBITAL_PRIMITIVES_GLSL } from './orbital.glsl';

export const SDF_PRIMITIVES_GLSL = `
${BASIC_PRIMITIVES_GLSL}
${ADVANCED_PRIMITIVES_GLSL}
${COMPLEX_PRIMITIVES_GLSL}
${ORBITAL_PRIMITIVES_GLSL}
`;
