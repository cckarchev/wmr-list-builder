import { useState } from 'react';
import styled from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { pointsCost, unitCount, groupRosterUnits } from '../../store/selectors';
import { unitDomId } from './unitDomId';
import { focusRing } from '../../theme/focusRing';

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Heading = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
  text-align: left;
  cursor: pointer;

  /* The collapse toggle is only meaningful on mobile; on desktop the body is
     always shown, so the heading is not interactive there. */
  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    cursor: default;
    pointer-events: none;
  }

  ${focusRing}
`;

const Count = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Body = styled.div<{ $open: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};

  @media (max-width: ${({ theme }) => `calc(${theme.breakpoint.md} - 0.02px)`}) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
  }
`;

const Row = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  width: 100%;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.bg.tint};
  }

  ${focusRing}
`;

const RowTop = styled.span`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const Qty = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Upgrades = styled.span`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const Upgrade = styled.span`
  display: flex;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding-left: ${({ theme }) => `${theme.space[2]}px`};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};

  &::before {
    content: '+';
    color: ${({ theme }) => theme.color.border.default};
  }
`;

const UpgradeQty = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
`;

const Pts = styled.span`
  margin-left: auto;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.tealBright};
`;

const Empty = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.dim};
  font-style: italic;
`;

const Total = styled.div<{ $over: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding-top: ${({ theme }) => `${theme.space[2]}px`};
  border-top: 1px solid ${({ theme }) => theme.color.border.divider};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme, $over }) => ($over ? theme.color.semantic.error : theme.color.text.dim)};
`;

export default function ArmySummary() {
  const units = useArmyStore((s) => s.units);
  const gameSize = useArmyStore((s) => s.gameSize);
  const [open, setOpen] = useState(false);

  // List selected units in the same grouped order as the roster (Characters
  // first, then troop types; mandatory units floated to the top of each group).
  const selected = groupRosterUnits(units, '', gameSize)
    .flatMap((g) => g.unitIds)
    .filter((id) => units[id].number > 0);
  const total = pointsCost({ units });
  const count = unitCount(units);
  const over = total > gameSize;

  const jumpTo = (id: string) =>
    document.getElementById(unitDomId(id))?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <Aside aria-label="Your Army">
      <Heading type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Your Army
        <Count>{selected.length}</Count>
      </Heading>
      <Body $open={open}>
        {selected.length === 0 ? (
          <Empty>No units selected yet.</Empty>
        ) : (
          selected.map((id) => {
            const chosenUpgrades = Object.entries(units[id].upgrades ?? {}).filter(
              ([, u]) => u.number > 0,
            );
            return (
              <Row key={id} type="button" onClick={() => jumpTo(id)}>
                <RowTop>
                  <span>{id}</span>
                  <Qty>×{units[id].number}</Qty>
                  <Pts>{units[id].pointsCost} pts</Pts>
                </RowTop>
                {chosenUpgrades.length > 0 && (
                  <Upgrades>
                    {chosenUpgrades.map(([upgradeId, u]) => (
                      <Upgrade key={upgradeId}>
                        <span>{upgradeId}</span>
                        {u.number > 1 && <UpgradeQty>×{u.number}</UpgradeQty>}
                      </Upgrade>
                    ))}
                  </Upgrades>
                )}
              </Row>
            );
          })
        )}
        <Total $over={over}>
          <span>
            {count} unit{count === 1 ? '' : 's'}
          </span>
          <span>
            {total} / {gameSize}
          </span>
        </Total>
      </Body>
    </Aside>
  );
}
