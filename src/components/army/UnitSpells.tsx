import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import Popover from '../ui/Popover';

interface UnitSpellsProps {
  unitId: string;
}

const Spell = styled.div`
  & + & {
    margin-top: ${({ theme }) => `${theme.space[3]}px`};
  }
`;

const SpellName = styled.h4`
  margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.strong};
`;

const SpellMeta = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const SpellText = styled.div`
  margin-top: ${({ theme }) => `${theme.space[1]}px`};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.body};
  line-height: 1.4;

  & p {
    margin: 0;
  }
`;

export default function UnitSpells({ unitId }: UnitSpellsProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const spells = useArmyStore((s) => s.spells);

  if (!unit || unit.type !== 'Wizard' || !spells || spells.length === 0) return null;

  return (
    <Popover label="Spells" trigger="Spells">
      {spells.map((spell, i) => (
        <Spell key={i}>
          <SpellName>{spell.name}</SpellName>
          <SpellMeta>{spell.roll}+ to cast</SpellMeta>
          <SpellMeta>Range {spell.range ?? 'N/A'}</SpellMeta>
          <SpellText
            dangerouslySetInnerHTML={{ __html: marked(spell.text.join('\n')) as string }}
          />
        </Spell>
      ))}
    </Popover>
  );
}
