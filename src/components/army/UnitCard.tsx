import { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useArmyStore } from '../../store/useArmyStore';
import { resolveBounds } from '../../store/forceLimits';
import { errorsForTarget, isCharacter } from '../../store/selectors';
import { groupUpgradeIds } from '../../store/groupUpgrades';
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
  gap: ${({ theme }) => `${theme.space[3]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px`};
  background: ${({ theme }) => theme.color.bg.panel};

  /* More interior breathing room on wider screens, where the card has space to
     spare; mobile stays compact. */
  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    gap: ${({ theme }) => `${theme.space[4]}px`};
    padding: ${({ theme }) => `${theme.space[4]}px ${theme.space[5]}px`};
  }
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

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const Identity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  min-width: 0;
`;

const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Sep = styled.span`
  color: ${({ theme }) => theme.color.border.default};
`;

const MinMax = styled.span`
  color: ${({ theme }) => theme.color.tealBright};
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  min-width: 0;
`;

const UnitName = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 600;
  line-height: 1.1;
  color: ${({ theme }) => theme.color.text.strong};
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  flex-shrink: 0;
`;

const PointsCost = styled.span<{ $visible: boolean }>`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.tealBright};
  /* Always occupy the line so selecting/deselecting a unit doesn't resize the
     controls column and shift the layout. */
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`;

/* Holds the Rules/Spells popovers and the Upgrades toggle. UnitRules and
   UnitSpells render nothing when they don't apply, so when the whole row is
   empty `:empty` removes it (and its parent gap) entirely. */
const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};

  &:empty {
    display: none;
  }
`;

const UpgradesToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
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
`;

const UpgradeGroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  /* No gap between rows so their left rules join into one continuous line. */
  gap: 0;

  & + & {
    margin-top: ${({ theme }) => `${theme.space[2]}px`};
  }
`;

const UpgradeGroupLabel = styled.h5`
  margin: 0 0 ${({ theme }) => `${theme.space[1]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.dim};
`;

export default function UnitCard({ unitId }: UnitCardProps) {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrades = useArmyStore((s) => s.upgrades);
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
  const hasUpgrades = selected && upgradeIds.length > 0;
  const upgradeGroups = groupUpgradeIds(upgradeIds, upgrades);
  // Only label the categories when there's more than one — a single-category
  // list reads cleaner as a plain list with no heading.
  const showUpgradeLabels = upgradeGroups.length > 1;
  const panelId = `upgrades-${unitId.replace(/\W+/g, '-')}`;

  return (
    <Card id={unitDomId(unitId)} $selected={selected} $invalid={invalid}>
      {selected && (
        <CornerBrackets accent={invalid ? theme.color.semantic.error : theme.color.border.accent} />
      )}
      <Top>
        <Identity>
          <Eyebrow>
            <span>{unit.type}</span>
            {badge && rule && (
              <>
                <Sep aria-hidden>·</Sep>
                <Tooltip label={rule}>
                  <MinMax>{badge}</MinMax>
                </Tooltip>
              </>
            )}
          </Eyebrow>
          <NameRow>
            <UnitName>{unitId}</UnitName>
            <UnitRules unitId={unitId} />
            <UnitSpells unitId={unitId} />
          </NameRow>
        </Identity>
        <Controls>
          <Stepper
            value={unit.number}
            onChange={(n) => setUnitNumber(unitId, n)}
            min={min}
            max={max}
            label={unitId}
          />
          <PointsCost $visible={selected} aria-hidden={!selected}>
            {unit.pointsCost} pts
          </PointsCost>
        </Controls>
      </Top>
      <StatLine
        attack={unit.attack}
        range={unit.range}
        hits={unit.hits}
        armour={unit.armour}
        command={unit.command}
        size={unit.size}
        points={unit.points}
        character={isCharacter(unit.type)}
      />
      <Meta>
        {hasUpgrades && (
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
        )}
      </Meta>
      {selected && <InlineErrors errors={unitErrors} label={`${unitId} errors`} />}
      {hasUpgrades && open && (
        <UpgradesSection id={panelId}>
          {upgradeGroups.map((group) => (
            <UpgradeGroupBlock key={group.label}>
              {showUpgradeLabels && <UpgradeGroupLabel>{group.label}</UpgradeGroupLabel>}
              {group.upgradeIds.map((upgradeId) => (
                <UpgradeRow key={upgradeId} unitId={unitId} upgradeId={upgradeId} />
              ))}
            </UpgradeGroupBlock>
          ))}
        </UpgradesSection>
      )}
    </Card>
  );
}
