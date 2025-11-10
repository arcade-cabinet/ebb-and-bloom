export const TextilesLaws = {
  fiberStrength_MPa: (fiber: string) =>
    ({ cotton: 300, wool: 130, silk: 500, linen: 550 })[fiber] || 200,
  threadCount: (weavingTech: number) => 20 + weavingTech * 80,
  fabricInsulation: (thickness_mm: number, airGap_percent: number) =>
    thickness_mm * airGap_percent * 0.04,
};
