import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import Stepper from '../ui/Stepper';
import ChevronMark from '../ui/ChevronMark';
import CornerBrackets from '../ui/CornerBrackets';
import { focusRing } from '../../theme/focusRing';
import UpgradeRow from './UpgradeRow';

interface ArmyUnitRowProps {
  unitId: string;
}

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid ${({ theme }) => theme.color.border.accent};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const UnitName = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
  flex: 1;
`;

const PointsCost = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.tealBright};
`;

const UpgradesToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  align-self: flex-start;
  margin-top: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition:
    border-color 0.12s,
    color 0.12s;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
    color: ${({ theme }) => theme.color.text.strong};
  }

  ${focusRing}
`;

const Caret = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  transition: transform 0.12s;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
`;

const SelectedBadge = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  color: ${({ theme }) => theme.color.tealBright};
`;

const UpgradesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  margin-top: ${({ theme }) => `${theme.space[1]}px`};
`;

export default function ArmyUnitRow({ unitId }: ArmyUnitRowProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  if (!unit || unit.number === 0) return null;

  const upgradeIds = unit.upgrades ? Object.keys(unit.upgrades) : [];
  const selectedCount = unit.upgrades
    ? Object.values(unit.upgrades).filter((u) => u.number > 0).length
    : 0;
  const panelId = `upgrades-${unitId.replace(/\W+/g, '-')}`;

  return (
    <Card>
      <CornerBrackets accent={theme.color.border.accent} />
      <Header>
        <UnitName>{unitId}</UnitName>
        <PointsCost>{unit.pointsCost} pts</PointsCost>
        <Stepper
          value={unit.number}
          onChange={(n) => setUnitNumber(unitId, n)}
          min={0}
          label={unitId}
        />
      </Header>
      {upgradeIds.length > 0 && (
        <>
          <UpgradesToggle
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <Caret $open={open}>
              <ChevronMark size={11} color="currentColor" />
            </Caret>
            Upgrades
            {selectedCount > 0 && <SelectedBadge>({selectedCount})</SelectedBadge>}
          </UpgradesToggle>
          {open && (
            <UpgradesSection id={panelId}>
              {upgradeIds.map((upgradeId) => (
                <UpgradeRow key={upgradeId} unitId={unitId} upgradeId={upgradeId} />
              ))}
            </UpgradesSection>
          )}
        </>
      )}
    </Card>
  );
}
