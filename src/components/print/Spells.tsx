import { Fragment } from 'react';
import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { PrintSection, PrintHeading, DefList, DefTerm, DefDesc } from './printSection';
import { stripSpellFlavor } from './spellText';
import { usePrintOptions } from './printOptions';

const SpellHeader = styled(DefTerm)``;

const SpellText = styled(DefDesc)`
  margin-bottom: ${({ theme }) => `${theme.space[2]}px`};
`;

export default function Spells() {
  const spells = useArmyStore((s) => s.spells);
  const { spellFluff } = usePrintOptions();

  if (!spells || spells.length === 0) return null;

  return (
    <PrintSection>
      <PrintHeading>Spells</PrintHeading>
      <DefList>
        {spells.map((spell, i) => {
          const lines = spellFluff ? spell.text : stripSpellFlavor(spell.text);
          const html = marked(lines.join('\n')) as string;
          const header = `${spell.name.toUpperCase()} · ${spell.roll}+ to cast · Range ${
            spell.range ?? 'N/A'
          }`;
          return (
            <Fragment key={i}>
              <SpellHeader>{header}</SpellHeader>
              <SpellText dangerouslySetInnerHTML={{ __html: html }} />
            </Fragment>
          );
        })}
      </DefList>
    </PrintSection>
  );
}
