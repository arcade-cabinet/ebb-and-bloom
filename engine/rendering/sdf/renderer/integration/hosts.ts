import { SDFPrimitive } from '../../types';
import { foreignBodySystem, HostPrimitive } from '../../ForeignBodySystem';

export function expandHostPrimitives(
  primitives: SDFPrimitive[] | undefined,
  hostPrimitives: HostPrimitive[] | undefined
): SDFPrimitive[] {
  if (hostPrimitives && hostPrimitives.length > 0) {
    const allPrimitives: SDFPrimitive[] = [];
    for (const host of hostPrimitives) {
      const composite = foreignBodySystem.createComposite(host);
      allPrimitives.push(...composite);
    }
    if (primitives) {
      allPrimitives.push(...primitives);
    }
    return allPrimitives;
  }
  return primitives || [];
}
