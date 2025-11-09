export const CeramicsLaws = {
  sinteringTemp_K: (clayType: string) =>
    ({ kaolin: 1473, montmorillonite: 1273, illite: 1373 })[clayType] || 1373,
  shrinkageFactor: (waterContent_percent: number) => 0.05 + waterContent_percent * 0.002,
  strength_MPa: (firingTemp_K: number, clayQuality: number) =>
    (firingTemp_K / 1000) * clayQuality * 15,
};
