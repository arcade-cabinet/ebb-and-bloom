export const PoliticalScienceLaws = {
  voterTurnout: (education: number, stakes: number) => Math.min(0.95, 0.3 + education * 0.5 + stakes * 0.3),
  revolutionRisk: (inequality: number, repression: number, mobilization: number) => {
    return inequality * mobilization / (1 + repression);
  },
  statelegitimacy: (effectiveness: number, fairness: number) => (effectiveness + fairness) / 2,
};
