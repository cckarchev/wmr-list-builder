import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';

const Wrapper = styled.div`
  color: ${({ theme }) => theme.color.text.body};
`;

const Heading = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: center;
  margin-bottom: ${({ theme }) => `${theme.space[3]}px`};
`;

const Dl = styled.dl`
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const SpellName = styled.dt`
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.strong};
  margin-top: ${({ theme }) => `${theme.space[3]}px`};

  &:first-child {
    margin-top: 0;
  }
`;

const SpellMeta = styled.dd`
  margin: 0;
  font-style: italic;
  color: ${({ theme }) => theme.color.text.dim};
`;

const SpellText = styled.dd`
  margin: 0;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => `${theme.space[2]}px`};
`;

export default function Spells() {
  const spells = useArmyStore((s) => s.spells);

  if (!spells || spells.length === 0) return null;

  return (
    <Wrapper>
      <Heading>Spells</Heading>
      <Dl>
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
      </Dl>
    </Wrapper>
  );
}
