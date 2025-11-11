declare module 'chemicaltools' {
  export const calculateMass: (formula: string) => { mass: number; name: string };
  export const calculateGas: (p?: number, V?: number, n?: number, T?: number) => any;
}
