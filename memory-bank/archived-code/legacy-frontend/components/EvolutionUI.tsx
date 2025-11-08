/**
 * Evolution UI - FULL UIKit Migration COMPLETE
 * All components render INSIDE Canvas as 3D UI elements
 * NO DOM-based UI - everything uses @react-three/uikit
 */

import { useEffect, useState } from 'react';
import { Container, Text } from '@react-three/uikit';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Progress, 
  Button,
  Separator
} from '@react-three/uikit-default';
import { useWorld } from '../contexts/WorldContext';
import type { EvolutionEvent } from '../systems/GameClock';
import { gameClock } from '../systems/GameClock';
import TraitEvolutionDisplay from './TraitEvolutionDisplay';

// Generation Display - UIKit version (top-right)
export const GenerationDisplay = () => {
  const [currentTime, setCurrentTime] = useState(gameClock.getCurrentTime());

  useEffect(() => {
    const unsubscribe = gameClock.onTimeUpdate((time) => {
      setCurrentTime(time);
    });
    return unsubscribe;
  }, []);

  return (
    <Card 
      width={280}
      positionType="absolute"
      positionTop={20}
      positionRight={20}
    >
      <CardHeader>
        <CardTitle>
          <Container flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={16}>⚡</Text>
            <Text fontSize={18} fontWeight="bold">
              Generation {currentTime.generation}
            </Text>
          </Container>
        </CardTitle>
      </CardHeader>
      <CardContent flexDirection="column" gap={8}>
        <Progress value={currentTime.generationProgress} width="100%" />
        <Container flexDirection="column" gap={4}>
          <Text fontSize={12}>
            {Math.floor(currentTime.generationProgress * 100)}% complete
          </Text>
          <Text fontSize={12}>
            Events: {currentTime.evolutionEvents.length}
          </Text>
        </Container>
      </CardContent>
    </Card>
  );
};

// Evolution Event Feed - UIKit version (top-left)
export const EvolutionEventFeed = () => {
  const [recentEvents, setRecentEvents] = useState<EvolutionEvent[]>([]);

  useEffect(() => {
    const unsubscribe = gameClock.onEvolutionEvent((event) => {
      setRecentEvents(prev => [...prev.slice(-4), event]);
    });
    return unsubscribe;
  }, []);

  return (
    <Card 
      width={320}
      positionType="absolute"
      positionTop={20}
      positionLeft={20}
      maxHeight={300}
    >
      <CardHeader>
        <CardTitle>
          <Container flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={16}>✨</Text>
            <Text fontSize={16} fontWeight="bold">Evolution Events</Text>
          </Container>
        </CardTitle>
      </CardHeader>
      <CardContent flexDirection="column" gap={8} overflow="scroll">
        {recentEvents.length === 0 ? (
          <Text fontSize={12} opacity={0.6}>Awaiting evolution events...</Text>
        ) : (
          recentEvents.map((event, index) => (
            <Card key={index} padding={8} marginBottom={index < recentEvents.length - 1 ? 8 : 0}>
              <Container flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                <Text fontSize={12} fontWeight="medium">
                  {event.eventType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
                <Text fontSize={11} opacity={0.6}>Gen {event.generation}</Text>
              </Container>
              <Text fontSize={11} marginTop={4} opacity={0.8}>
                {event.description}
              </Text>
              {event.affectedCreatures.length > 0 && (
                <Text fontSize={11} marginTop={4} opacity={0.6}>
                  Affects: {event.affectedCreatures.length} creature(s)
                </Text>
              )}
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Creature Evolution Display - UIKit version (bottom-left)
export const CreatureEvolutionDisplay = () => {
  const { world } = useWorld();
  const [creatures, setCreatures] = useState<any[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<any>(null);

  useEffect(() => {
    const creatureQuery = world.with('creature', 'transform');
    setCreatures(Array.from(creatureQuery.entities));
  }, []);

  if (selectedCreature) {
  return (
    <Card 
      width={400}
      positionType="absolute"
      positionLeft="50%"
      positionTop="50%"
      transformTranslateX="-50%"
      transformTranslateY="-50%"
    >
        <CardHeader>
          <Container flexDirection="row" justifyContent="space-between" alignItems="center">
            <CardTitle>
              <Text fontSize={18} fontWeight="bold">Creature Analysis</Text>
            </CardTitle>
            <Button onClick={() => setSelectedCreature(null)} variant="ghost" size="sm">
              <Text>✕</Text>
            </Button>
          </Container>
        </CardHeader>
        <CardContent flexDirection="column" gap={16}>
          <TraitEvolutionDisplay creature={selectedCreature} />
          <Separator />
          <Button onClick={() => console.log('Focus camera on creature:', selectedCreature)}>
            <Text>Focus Camera</Text>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      width={320}
      positionType="absolute"
      positionBottom={100}
      positionLeft={20}
      maxHeight={400}
    >
      <CardHeader>
        <CardTitle>
          <Container flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={16}>🌿</Text>
            <Text fontSize={16} fontWeight="bold">
              Active Creatures ({creatures.length})
            </Text>
          </Container>
        </CardTitle>
      </CardHeader>
      <CardContent flexDirection="column" gap={12} overflow="scroll">
        {creatures.length === 0 ? (
          <Text fontSize={12} opacity={0.6}>No creatures detected. Ecosystem initializing...</Text>
        ) : (
          creatures.slice(0, 6).map((creature, index) => (
            <Card 
              key={index} 
              padding={8}
              onClick={() => setSelectedCreature(creature)}
              cursor="pointer"
            >
              <TraitEvolutionDisplay creature={creature} onSelect={() => setSelectedCreature(creature)} />
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Environmental Status - UIKit version (bottom-right)
export const EnvironmentalStatus = () => {
  const { ecosystem } = useWorld();
  const [ecosystemState, setEcosystemState] = useState<any>(null);

  useEffect(() => {
    if (!ecosystem) return;
    const envSystem = ecosystem.getEnvironmentalSystem();
    const report = envSystem.getEnvironmentalReport();
    setEcosystemState({
      globalPollution: report.globalPollution,
      activeSources: report.activeSources,
      refugeAreas: report.refugeAreas
    });
  }, []);

  if (!ecosystemState) return null;

  return (
    <Card 
      width={240}
      positionType="absolute"
      positionBottom={100}
      positionRight={20}
    >
      <CardHeader>
        <CardTitle>
          <Container flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={16}>🌍</Text>
            <Text fontSize={16} fontWeight="bold">Environment</Text>
          </Container>
        </CardTitle>
      </CardHeader>
      <CardContent flexDirection="column" gap={8}>
        <Container flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text fontSize={12}>Pollution</Text>
          <Text fontSize={12} fontWeight="medium">
            {(ecosystemState.globalPollution * 100).toFixed(0)}%
          </Text>
        </Container>
        <Container flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text fontSize={12}>Active Sources</Text>
          <Text fontSize={12} fontFamily="monospace">{ecosystemState.activeSources}</Text>
        </Container>
        <Container flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text fontSize={12}>Refuge Areas</Text>
          <Text fontSize={12}>{ecosystemState.refugeAreas}</Text>
        </Container>
      </CardContent>
    </Card>
  );
};

// Pack Dynamics Display - UIKit version (top-right below generation)
export const PackDynamicsDisplay = () => {
  const { ecosystem } = useWorld();
  const [packData, setPackData] = useState<any[]>([]);

  useEffect(() => {
    if (!ecosystem) return;
    const packSystem = ecosystem.getPackSocialSystem();
    const analysis = packSystem.getPackAnalysis();
    setPackData([{
      id: 'pack_summary',
      type: 'summary',
      members: Math.round(analysis.averagePackSize),
      cohesion: 0.8,
      territory: Math.sqrt(analysis.totalTerritorialCoverage / Math.PI)
    }]);
  }, []);

  return (
    <Container 
      positionType="absolute"
      positionTop={180}
      positionRight={20}
      flexDirection="column"
      gap={8}
    >
      {packData.map((pack) => (
        <Card key={pack.id} width={240} padding={12}>
          <Text fontSize={12} fontWeight="bold">
            {pack.type.replace('_', ' ').toUpperCase()}
          </Text>
          <Text fontSize={11} marginTop={4} opacity={0.6}>
            {pack.members} members • {pack.territory.toFixed(1)}m territory
          </Text>
          <Progress value={pack.cohesion} width="100%" marginTop={8} />
          <Text fontSize={11} marginTop={4} opacity={0.6}>
            Cohesion: {(pack.cohesion * 100).toFixed(0)}%
          </Text>
        </Card>
      ))}
    </Container>
  );
};

// Mobile Controls Overlay - UIKit version (bottom)
export const MobileControls = () => {
  return (
    <Container 
      positionType="absolute"
      positionBottom={20}
      positionLeft="50%"
      transformTranslateX="-50%"
      flexDirection="column"
      alignItems="center"
      gap={12}
    >
      <Container flexDirection="row" gap={12}>
        <Button variant="default" size="lg">
          <Text fontSize={14}>👁️ Observe</Text>
        </Button>
        <Button variant="default" size="lg">
          <Text fontSize={14}>🧬 Influence</Text>
        </Button>
        <Button variant="default" size="lg">
          <Text fontSize={14}>📊 Analyze</Text>
        </Button>
      </Container>
      <Text fontSize={10} opacity={0.6} fontFamily="monospace">
        Spore-style camera: Pinch zoom • Drag orbit • Double-tap reset
      </Text>
    </Container>
  );
};

// Main Evolution UI - ALL COMPONENTS ARE NOW UIKit
// This file exports all UIKit components for use inside Canvas
// NO DOM-based UI remains - migration complete
const EvolutionUI = () => {
  // Empty - all components exported and rendered in App.tsx Canvas
  return null;
};

export default EvolutionUI;
