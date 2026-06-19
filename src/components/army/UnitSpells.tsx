import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import Popover from '../ui/Popover';

interface UnitSpellsProps {
  unitId: string;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const SpellCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px`};
  border: 1px solid ${({ theme }) => theme.color.border.divider};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

const SpellName = styled.h4`
  margin: 0;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.strong};
`;

const Meta = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
`;

const Roll = styled.span`
  color: ${({ theme }) => theme.color.tealBright};
  font-weight: 600;
`;

const Range = styled.span`
  color: ${({ theme }) => theme.color.text.dim};
`;

export default function UnitSpells({ unitId }: UnitSpellsProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const spells = useArmyStore((s) => s.spells);

  if (!unit || unit.type !== 'Wizard' || !spells || spells.length === 0) return null;

  return (
    <Popover label="Spells" trigger="Spells">
      <Grid>
        {spells.map((spell, i) => (
          <SpellCard key={i}>
            <SpellName>{spell.name}</SpellName>
            <Meta>
              <Roll>{spell.roll}+</Roll>
              <Range>{spell.range ?? '—'}</Range>
            </Meta>
          </SpellCard>
        ))}
      </Grid>
    </Popover>
  );
}
