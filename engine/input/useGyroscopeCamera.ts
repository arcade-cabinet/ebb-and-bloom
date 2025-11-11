import { useEffect, useState, useRef } from 'react';
import { GyroscopeCamera, GyroscopeOffset } from './GyroscopeCamera';

export function useGyroscopeCamera(
  enabled: boolean = true,
  sensitivity: number = 0.5,
  smoothing: number = 0.15
): GyroscopeOffset {
  const [offset, setOffset] = useState<GyroscopeOffset>({ x: 0, y: 0, z: 0 });
  const gyroscopeRef = useRef<GyroscopeCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gyroscopeRef.current) {
      gyroscopeRef.current = new GyroscopeCamera(sensitivity, smoothing);
    }

    const gyroscope = gyroscopeRef.current;

    gyroscope.setSensitivity(sensitivity);
    gyroscope.setSmoothing(smoothing);
    gyroscope.setEnabled(enabled);

    if (enabled) {
      gyroscope.start();

      const updateOffset = () => {
        setOffset(gyroscope.getOffset());
        animationFrameRef.current = requestAnimationFrame(updateOffset);
      };

      animationFrameRef.current = requestAnimationFrame(updateOffset);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      gyroscope.stop();
    };
  }, [enabled, sensitivity, smoothing]);

  return offset;
}
