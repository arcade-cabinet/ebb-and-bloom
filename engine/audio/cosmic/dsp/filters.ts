export function createBandpassFilter(
  audioContext: AudioContext,
  frequency: number,
  Q: number = 1.0
): BiquadFilterNode {
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  return filter;
}

export function createLowpassFilter(
  audioContext: AudioContext,
  frequency: number,
  Q: number = 1.0
): BiquadFilterNode {
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  return filter;
}

export function createHighpassFilter(
  audioContext: AudioContext,
  frequency: number,
  Q: number = 1.0
): BiquadFilterNode {
  const filter = audioContext.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  return filter;
}
