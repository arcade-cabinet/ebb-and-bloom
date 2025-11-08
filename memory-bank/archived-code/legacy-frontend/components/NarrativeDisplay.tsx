/**
 * Narrative Display - UIKit version
 * Haiku and storytelling integration - FULLY UIKit
 * Renders INSIDE Canvas as 3D UI elements
 */

import { useEffect, useState } from 'react';
import { Container, Text } from '@react-three/uikit';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Progress,
  Separator
} from '@react-three/uikit-default';
import { useWorld } from '../contexts/WorldContext';
import type { HaikuEntry } from '../systems/HaikuNarrativeSystem';

// Current Haiku Display - UIKit version (center screen)
export const CurrentHaikuDisplay = () => {
  const { ecosystem } = useWorld();
  const [currentHaiku, setCurrentHaiku] = useState<HaikuEntry | null>(null);

  useEffect(() => {
    if (!ecosystem) return;
    const narrativeSystem = ecosystem.getNarrativeSystem();
    const haikus = narrativeSystem.getRecentHaikus(10);
    
    if (haikus.length > 0 && haikus[0].significance > 0.6) {
      setCurrentHaiku(haikus[0]);
      setTimeout(() => setCurrentHaiku(null), 8000);
    }
  }, []);

  if (!currentHaiku) return null;

  return (
    <Card 
      width={360}
      positionType="absolute"
      positionLeft="50%"
      positionTop="50%"
      transformTranslateX="-50%"
      transformTranslateY="-50%"
    >
      <CardContent flexDirection="column" gap={12} alignItems="center">
        <Container flexDirection="column" gap={8} alignItems="center">
          {currentHaiku.haiku.map((line, index) => (
            <Text key={index} fontSize={16} textAlign="center">
              {line}
            </Text>
          ))}
        </Container>
        <Separator />
        <Container flexDirection="column" gap={4} alignItems="center">
          <Text fontSize={11} opacity={0.6}>
            Generation {currentHaiku.generation} • {currentHaiku.context.eventType.replace('_', ' ')}
          </Text>
          <Progress 
            value={Math.abs(currentHaiku.emotionalTone)} 
            width="100%"
          />
          <Text fontSize={11} opacity={0.6}>
            {currentHaiku.emotionalTone > 0 ? 'Joyful' : 'Melancholy'} tone
          </Text>
        </Container>
      </CardContent>
    </Card>
  );
};

// Journal Toggle Button - UIKit version (top center)
export const JournalToggleButton = () => {
  const { ecosystem } = useWorld();
  const [recentHaikus, setRecentHaikus] = useState<HaikuEntry[]>([]);
  const [showJournal, setShowJournal] = useState(false);

  useEffect(() => {
    if (!ecosystem) return;
    const narrativeSystem = ecosystem.getNarrativeSystem();
    setRecentHaikus(narrativeSystem.getRecentHaikus(10));
  }, []);

  return (
    <>
      <Button
        positionType="absolute"
        positionTop={20}
        positionLeft="50%"
        transformTranslateX="-50%"
        onClick={() => setShowJournal(!showJournal)}
      >
        <Text fontSize={14}>📖 {recentHaikus.length}</Text>
      </Button>
      {showJournal && (
        <HaikuJournal 
          haikus={recentHaikus} 
          onClose={() => setShowJournal(false)} 
        />
      )}
    </>
  );
};

// Haiku Journal - UIKit version (full screen overlay)
const HaikuJournal = ({ haikus, onClose }: { haikus: HaikuEntry[]; onClose: () => void }) => {
  return (
    <Card 
      width={600}
      maxHeight={600}
      positionType="absolute"
      positionLeft="50%"
      positionTop="50%"
      transformTranslateX="-50%"
      transformTranslateY="-50%"
    >
      <CardHeader>
        <Container flexDirection="row" justifyContent="space-between" alignItems="center">
          <CardTitle>
            <Text fontSize={20} fontWeight="bold">Evolution Journal</Text>
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm">
            <Text>✕</Text>
          </Button>
        </Container>
      </CardHeader>
      <CardContent flexDirection="column" gap={12} overflow="scroll">
        {haikus.length === 0 ? (
          <Container flexDirection="column" alignItems="center" gap={8}>
            <Text fontSize={16} fontWeight="medium">No journal entries yet</Text>
            <Text fontSize={12} opacity={0.6}>
              Evolution events will generate haikus to capture significant moments
            </Text>
          </Container>
        ) : (
          haikus.map((entry, index) => (
            <Card key={index} padding={12} marginBottom={index < haikus.length - 1 ? 12 : 0}>
              <Container flexDirection="column" gap={8}>
                <Container flexDirection="column" gap={4}>
                  {entry.haiku.map((line, lineIndex) => (
                    <Text key={lineIndex} fontSize={14} textAlign="center">
                      {line}
                    </Text>
                  ))}
                </Container>
                <Separator />
                <Container flexDirection="column" gap={4}>
                  <Container flexDirection="row" justifyContent="space-between">
                    <Text fontSize={11} opacity={0.6}>Gen {entry.generation}</Text>
                    <Text fontSize={11} opacity={0.6}>
                      {entry.context.eventType.replace('_', ' ')}
                    </Text>
                  </Container>
                  <Text fontSize={11} opacity={0.6}>
                    Location: {entry.context.location}
                  </Text>
                  {entry.context.involvedCreatures.length > 0 && (
                    <Text fontSize={11} opacity={0.6}>
                      Creatures: {entry.context.involvedCreatures.length}
                    </Text>
                  )}
                  <Container flexDirection="row" alignItems="center" gap={8}>
                    <Container 
                      width={16} 
                      height={16} 
                      borderRadius={8}
                      backgroundColor={entry.emotionalTone > 0 ? 0x38A169 : 0xE53E3E}
                      opacity={Math.abs(entry.emotionalTone)}
                    />
                    <Text fontSize={11} opacity={0.6}>
                      {entry.emotionalTone > 0 ? 'Uplifting' : 'Contemplative'}
                    </Text>
                    <Text fontSize={11} fontWeight="medium">
                      {(entry.significance * 100).toFixed(0)}% significant
                    </Text>
                  </Container>
                </Container>
              </Container>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

// Legacy export for compatibility (DOM-based, will be removed)
const NarrativeDisplay = () => {
  return null; // No longer used - all components exported separately
};

export default NarrativeDisplay;
