export function createADSREnvelope(
  gainNode: GainNode,
  startTime: number,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
  peakGain: number = 1.0
): void {
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gainNode.gain.linearRampToValueAtTime(sustain * peakGain, startTime + attack + decay);
  gainNode.gain.linearRampToValueAtTime(0, startTime + attack + decay + release);
}

export function createExponentialDecay(
  gainNode: GainNode,
  startTime: number,
  duration: number,
  peakGain: number = 1.0
): void {
  gainNode.gain.setValueAtTime(peakGain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
}

export function createPulseEnvelope(
  gainNode: GainNode,
  startTime: number,
  pulseRate: number,
  duration: number,
  minGain: number,
  maxGain: number
): void {
  const numPulses = Math.floor(duration / pulseRate);
  for (let i = 0; i < numPulses; i++) {
    const time = startTime + i * pulseRate;
    gainNode.gain.setValueAtTime(maxGain, time);
    gainNode.gain.setValueAtTime(minGain, time + pulseRate * 0.4);
  }
}
