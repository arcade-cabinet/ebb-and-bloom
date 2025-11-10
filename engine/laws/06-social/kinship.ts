export const KinshipLaws = {
  relatedness: { parent_child: 0.5, siblings: 0.5, grandparent: 0.25, cousins: 0.125 },
  hamiltonRule: (r: number, B: number, C: number) => r * B > C,
  incestAvoidance: (relatedness: number) => relatedness < 0.125,
};
