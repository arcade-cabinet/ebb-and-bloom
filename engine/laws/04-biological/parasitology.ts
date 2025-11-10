export const ParasitologyLaws = {
  basicReproductionNumber: (
    transmissionRate: number,
    infectiousPeriod_days: number,
    recoveryRate: number
  ) => {
    return (transmissionRate * infectiousPeriod_days) / recoveryRate;
  },
  vectorCapacity: (bitingRate: number, vectorDensity: number, vectorCompetence: number) => {
    return bitingRate * vectorDensity * vectorCompetence;
  },
};
