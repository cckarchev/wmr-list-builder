import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { resolveBounds } from '../../store/forceLimits';
import { errorsForTarget } from '../../store/selectors';
import { minMaxBadge, explainMinMax } from '../../store/minMax';
import Stepper from '../ui/Stepper';
import StatLine from '../ui/StatLine';
import Tooltip from '../ui/Tooltip';
import ChevronMark from '../ui/ChevronMark';
import CornerBrackets from '../ui/CornerBrackets';
import { focusRing } from '../../theme/focusRing';
import UpgradeRow from './UpgradeRow';
import InlineErrors from './InlineErrors';
import UnitRules from './UnitRules';
import UnitSpells from './UnitSpells';
import { unitDomId } from './unitDomId';

interface UnitCardProps {
  unitId: string;
}

const Card = styled.div<{ $selected: boolean; $invalid: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.panel};
  border: 1px solid
    ${({ theme, $selected, $invalid }) =>
      $invalid
        ? theme.color.semantic.error
        : $selected
          ? theme.color.border.accent
          : theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme, $selected, $invalid }) =>
      $invalid
        ? theme.color.semantic.error
        : $selected
          ? theme.color.border.accent
          : theme.color.border.hover};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const UnitName = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.color.text.strong};
`;

const MinMax = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  margin-top: ${({ theme }) => `${theme.space[1]}px`};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const PointsCost = styled.span`
  margin-left: auto;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.tealBright};
`;

const UpgradesToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  align-self: flex-start;
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

export default function UnitCard({ unitId }: UnitCardProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);
  const gameSize = useArmyStore((s) => s.gameSize);
  const errors = useArmyStore((s) => s.errors);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  if (!unit) return null;

  const selected = unit.number > 0;
  const { min, max } = resolveBounds(unit, gameSize);
  const badge = minMaxBadge(unit, gameSize);
  const rule = explainMinMax(unit, gameSize);
  const unitErrors = errorsForTarget(errors, unitId);
  const invalid = unitErrors.length > 0;

  const upgradeIds = unit.upgrades ? Object.keys(unit.upgrades) : [];
  const selectedCount = unit.upgrades
    ? Object.values(unit.upgrades).filter((u) => u.number > 0).length
    : 0;
  const panelId = `upgrades-${unitId.replace(/\W+/g, '-')}`;

  return (
    <Card id={unitDomId(unitId)} $selected={selected} $invalid={invalid}>
      {selected && (
        <CornerBrackets
          accent={invalid ? theme.color.semantic.error : theme.color.border.accent}
        />
      )}
      <Header>
        <UnitName>{unitId}</UnitName>
        {badge && rule && (
          <Tooltip label={rule}>
            <MinMax>{badge}</MinMax>
          </Tooltip>
        )}
      </Header>
      <StatLine
        type={unit.type}
        attack={unit.attack}
        range={unit.range}
        hits={unit.hits}
        armour={unit.armour}
        command={unit.command}
        size={unit.size}
        points={unit.points}
      />
      <Footer>
        <Meta>
          <UnitRules unitId={unitId} />
          <UnitSpells unitId={unitId} />
        </Meta>
        {selected && <PointsCost>{unit.pointsCost} pts</PointsCost>}
        <Stepper
          value={unit.number}
          onChange={(n) => setUnitNumber(unitId, n)}
          min={min}
          max={max}
          label={unitId}
        />
      </Footer>
      {selected && <InlineErrors errors={unitErrors} label={`${unitId} errors`} />}
      {selected && upgradeIds.length > 0 && (
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
