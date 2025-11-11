import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { useGameStore } from '../state/GameState';

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  magnetometer: { x: number; y: number; z: number };
}

interface GameSceneProps {
  sensorData: SensorData;
}

export function GameScene({ sensorData }: GameSceneProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const gameState = useGameStore();

  useEffect(() => {
    gameState.initializeWorld('cosmic-seed-001');
  }, []);

  useFrame((state, delta) => {
    if (!gameState.world || !cameraRef.current) return;

    const gyro = sensorData.gyroscope;
    if (Math.abs(gyro.x) > 0.01 || Math.abs(gyro.y) > 0.01) {
      cameraRef.current.rotation.x += gyro.x * 0.05;
      cameraRef.current.rotation.y += gyro.y * 0.05;
    }

    gameState.world.tick(delta);
  });

  return (
    <>
      <perspectiveCamera ref={cameraRef} position={[0, 5, 10]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <gridHelper args={[20, 20]} />
    </>
  );
}
