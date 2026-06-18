import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { PrintSection, PrintHeading, DefList, DefTerm, DefDesc } from './printSection';

const SpellName = styled(DefTerm)`
  text-transform: uppercase;
`;

const SpellMeta = styled.dd`
  margin: 0;
  font-style: italic;
  color: ${({ theme }) => theme.color.text.dim};
`;

const SpellText = styled(DefDesc)`
  margin-bottom: ${({ theme }) => `${theme.space[2]}px`};
`;

export default function Spells() {
  const spells = useArmyStore((s) => s.spells);

  if (!spells || spells.length === 0) return null;

  return (
    <PrintSection>
      <PrintHeading>Spells</PrintHeading>
      <DefList>
        {spells.map((spell, i) => {
          const html = marked(spell.text.join('\n')) as string;
          return (
            <>
              <SpellName key={`name_${i}`}>{spell.name}</SpellName>
              <SpellMeta key={`roll_${i}`}>{spell.roll}+ to cast</SpellMeta>
              <SpellMeta key={`range_${i}`}>Range {spell.range ?? 'N/A'}</SpellMeta>
              <SpellText key={`text_${i}`} dangerouslySetInnerHTML={{ __html: html }} />
            </>
          );
        })}
      </DefList>
    </PrintSection>
  );
}
