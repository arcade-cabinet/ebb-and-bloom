/**
 * Trait Evolution Display - UIKit version
 * Shows creature traits
 */

import { Container, Text } from '@react-three/uikit';
import { Progress } from '@react-three/uikit-default';

interface TraitDisplayProps {
  creature: any;
  onSelect?: () => void;
}

const TraitEvolutionDisplay: React.FC<TraitDisplayProps> = ({ creature, onSelect }) => {
  if (!creature || !creature.creature) return null;

  const evolutionData = (creature as any).evolutionaryCreature;
  const traits = evolutionData?.currentTraits || [];

  const traitNames = [
    'Mobility', 'Manipulation', 'Excavation', 'Social', 'Sensing',
    'Illumination', 'Storage', 'Filtration', 'Defense', 'Toxicity'
  ];

  return (
    <Container
      flexDirection="column"
      gap={8}
      onClick={onSelect}
      cursor={onSelect ? "pointer" : "default"}
    >
      <Text fontFamily="inter" fontSize={14} fontWeight="bold" color={0xD69E2E}>
        {evolutionData?.archetype.baseSpecies || creature.creature.species}
      </Text>

      {traits.slice(0, 5).map((value: number, index: number) => (
        <Container key={index} flexDirection="column" gap={4}>
          <Container flexDirection="row" justifyContent="space-between">
            <Text fontFamily="inter" fontSize={11} color={0xA0AEC0}>
              {traitNames[index]}
            </Text>
            <Text fontFamily="jetbrains" fontSize={11} color={0xD69E2E}>
              {value.toFixed(1)}
            </Text>
          </Container>
          <Progress value={value} width="100%" />
        </Container>
      ))}
    </Container>
  );
};

export default TraitEvolutionDisplay;
