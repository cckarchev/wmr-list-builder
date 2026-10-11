import { Fragment } from 'react';
import styled from 'styled-components';
import { Markdown } from '@/components/Markdown';
import { useArmyStore } from '@/store/useArmyStore';
import { usePrintOptions } from '../../printOptions';
import { DefDesc, DefList, DefTerm, PrintHeading, PrintSection } from '../printSection';

const SpellHeader = styled(DefTerm)``;

const SpellText = styled(DefDesc)`
  margin-bottom: ${({ theme }) => `${theme.space.xs}px`};
`;

export const Spells = () => {
  const spells = useArmyStore((s) => s.spells);
  const { spellFluff } = usePrintOptions();

  if (!spells || spells.length === 0) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Spells</PrintHeading>
      <DefList>
        {spells.map((spell) => {
          const blocks = spellFluff ? [`*${spell.fluff}*`, ...spell.text] : spell.text;
          const header = `${spell.name.toUpperCase()} · ${spell.roll}+ to cast · Range ${
            spell.range ?? 'N/A'
          }`;
          return (
            <Fragment key={spell.name}>
              <SpellHeader>{header}</SpellHeader>
              <SpellText>
                <Markdown blocks={blocks} />
              </SpellText>
            </Fragment>
          );
        })}
      </DefList>
    </PrintSection>
  );
};
