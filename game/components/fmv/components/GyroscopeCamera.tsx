import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGyroscopeCamera } from '../../../../engine/input/useGyroscopeCamera';
import * as THREE from 'three';

interface GyroscopeCameraProps {
  enabled?: boolean;
  sensitivity?: number;
  smoothing?: number;
  maxTilt?: number;
}

export function GyroscopeCamera({ 
  enabled = true, 
  sensitivity = 0.5, 
  smoothing = 0.15,
  maxTilt = 0.3
}: GyroscopeCameraProps) {
  const { camera } = useThree();
  const initialRotationRef = useRef(new THREE.Euler());
  const offset = useGyroscopeCamera(enabled, sensitivity, smoothing);

  useEffect(() => {
    initialRotationRef.current.copy(camera.rotation);
  }, [camera]);

  useFrame(() => {
    if (!enabled) return;

    const targetX = offset.x * maxTilt;
    const targetY = offset.y * maxTilt;

    camera.rotation.x = initialRotationRef.current.x + targetY;
    camera.rotation.y = initialRotationRef.current.y + targetX;
  });

  return null;
}
