import { useState } from 'react';
import { marked } from 'marked';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { isCaster } from '../../store/selectors';
import Popover from '../ui/Popover';
import Icon from '../ui/Icon';
import ChevronMark from '../ui/ChevronMark';
import { focusRing } from '../../theme/focusRing';

interface UnitSpellsProps {
  unitId: string;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const SpellItem = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.divider};
  border-radius: ${({ theme }) => theme.radius.sm};
  overflow: hidden;
`;

const Header = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  width: 100%;
  padding: ${({ theme }) => `${theme.space[2]}px`};
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.text.body};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.bg.tint};
  }

  ${focusRing}
`;

const SpellName = styled.span`
  flex: 1;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.strong};
`;

const Roll = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.tealBright};
  font-weight: 600;
`;

const Range = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Caret = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.color.text.dim};
  transition: transform 0.12s;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
`;

const Effect = styled.div`
  padding: ${({ theme }) => `0 ${theme.space[2]}px ${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.body};
  line-height: 1.4;

  & p {
    margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  }
  & p:last-child {
    margin-bottom: 0;
  }
  & em {
    color: ${({ theme }) => theme.color.text.dim};
  }
`;

export default function UnitSpells({ unitId }: UnitSpellsProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const spells = useArmyStore((s) => s.spells);
  const [open, setOpen] = useState<Set<number>>(new Set());

  if (!unit || !isCaster(unit) || !spells || spells.length === 0) return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <Popover
      label="Spells"
      trigger={
        <>
          <Icon name="magic" size={14} />
          Spells
        </>
      }
      wide
    >
      <List>
        {spells.map((spell, i) => {
          const isOpen = open.has(i);
          return (
            <SpellItem key={i}>
              <Header type="button" aria-expanded={isOpen} onClick={() => toggle(i)}>
                <Caret $open={isOpen}>
                  <ChevronMark size={11} color="currentColor" />
                </Caret>
                <SpellName>{spell.name}</SpellName>
                <Roll>{spell.roll}+</Roll>
                <Range>{spell.range ?? '—'}</Range>
              </Header>
              {isOpen && (
                <Effect
                  dangerouslySetInnerHTML={{
                    __html: marked([`*${spell.fluff}*`, ...spell.text].join('\n\n')) as string,
                  }}
                />
              )}
            </SpellItem>
          );
        })}
      </List>
    </Popover>
  );
}
