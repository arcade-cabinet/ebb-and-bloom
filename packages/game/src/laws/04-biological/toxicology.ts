export const ToxicologyLaws = {
  LD50_mgkg: (compound: string) => ({ arsenic: 15, cyanide: 1.5, ethanol: 7000 }[compound] || 100),
  doseResponse: (dose: number, LD50: number) => 1 / (1 + Math.exp(-(dose - LD50) / (LD50 * 0.1))),
  bioaccumulation: (trophicLevel: number) => Math.pow(10, trophicLevel),
};
