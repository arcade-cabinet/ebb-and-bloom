/**
 * Neuroscience - Neurons, synapses, neural networks
 */

export const NeuronProperties = {
  fringRate_Hz: (input_mV: number) => Math.max(0, (input_mV - 55) / 10),
  synapticDelay_ms: 0.5,
  actionPotentialSpeed_ms: (axonDiameter_um: number) => 6 * axonDiameter_um,
};

export const NeuralScaling = {
  neuronCount: (brainMass_kg: number) => brainMass_kg * 1e11,
  synapsesPerNeuron: 7000,
  energyCost_W: (neuronCount: number) => neuronCount * 1e-11,
};

export const NeuroscienceLaws = {
  neurons: NeuronProperties,
  scaling: NeuralScaling,
} as const;

