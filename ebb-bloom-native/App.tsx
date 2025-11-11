import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useGameStore } from './src/game/state/GameState';
import { GameScene } from './src/game/scenes/GameScene';

export default function App() {
  const [sensorData, setSensorData] = useState({
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
  });
  const [initialized, setInitialized] = useState(false);
  const gameState = useGameStore();

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    Gyroscope.setUpdateInterval(16);
    Magnetometer.setUpdateInterval(16);

    const accelSub = Accelerometer.addListener((data) => {
      setSensorData((prev) => ({ ...prev, accelerometer: data }));
    });

    const gyroSub = Gyroscope.addListener((data) => {
      setSensorData((prev) => ({ ...prev, gyroscope: data }));
    });

    const magSub = Magnetometer.addListener((data) => {
      setSensorData((prev) => ({ ...prev, magnetometer: data }));
    });

    return () => {
      accelSub.remove();
      gyroSub.remove();
      magSub.remove();
    };
  }, []);

  const handleStartGame = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  if (!initialized) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>Ebb & Bloom</Text>
        <Text style={styles.subtitle}>
          Guide your species from the Big Bang to transcendence
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleStartGame}>
          <Text style={styles.buttonText}>Begin Evolution</Text>
        </TouchableOpacity>
        <Text style={styles.info}>
          Platform: {Platform.OS} | Sensors Ready
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        style={styles.canvas}
      >
        <GameScene sensorData={sensorData} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginTop: 20,
  },
});
