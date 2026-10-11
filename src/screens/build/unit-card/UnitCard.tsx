import { useState } from 'react';
import styled, { type DefaultTheme, useTheme } from 'styled-components';
import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import { CornerBrackets } from '@/components/corner-brackets/CornerBrackets';
import { StatLine } from '@/components/stat-line/StatLine';
import { Stepper } from '@/components/stepper/Stepper';
import { Tooltip } from '@/components/tooltip/Tooltip';
import { resolveBounds } from '@/core/forceLimits';
import { groupUpgradeIds } from '@/core/groupUpgrades';
import { explainMinMax, minMaxBadge } from '@/core/minMax';
import { errorsForTarget, isCharacter } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import { pillButton } from '@/theme/pillButton';
import { unitDomId } from '../shared/unitDomId';
import { InlineErrors } from './inline-errors/InlineErrors';
import { UnitRules } from './unit-rules/UnitRules';
import { UnitSpells } from './unit-spells/UnitSpells';
import { UpgradeRow } from './upgrade-row/UpgradeRow';

interface UnitCardProps {
  unitId: string;
  /* The roster section the card sits under. When the section is already labeled
     with the unit's type (e.g. an "Infantry" section), we omit the type tag from
     the card to avoid the redundant repetition. */
  groupLabel?: string;
}

interface CardStateProps {
  theme: DefaultTheme;
  $selected: boolean;
  $invalid: boolean;
}

/** An error outranks selection; otherwise the card shows its resting border. */
const cardBorderColor =
  (resting: 'default' | 'hover') =>
  ({ theme, $selected, $invalid }: CardStateProps): string => {
    if ($invalid) {
      return theme.color.semantic.error;
    }

    if ($selected) {
      return theme.color.border.accent;
    }

    return theme.color.border[resting];
  };

const Card = styled.div<{ $selected: boolean; $invalid: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space.sm}px`};
  padding: ${({ theme }) => `${theme.space.sm}px ${theme.space.md}px`};
  background: ${({ theme }) => theme.color.bg.panel};

  /* More interior breathing room on wider screens, where the card has space to
     spare; mobile stays compact. */
  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    gap: ${({ theme }) => `${theme.space.md}px`};
    padding: ${({ theme }) => `${theme.space.md}px ${theme.space.lg}px`};
  }
  border: 1px solid ${cardBorderColor('default')};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${cardBorderColor('hover')};
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space.sm}px`};
`;

// Left column: name and stat line stacked tightly. Keeping the stats here (next
// to the name rather than below the whole header row) means the taller right-hand
// controls column no longer pushes the stats down, closing the dead gap.
const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space.sm}px`};
  min-width: 0;
  flex: 1;
`;

const NameRow = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space.xs}px`};
  min-width: 0;
`;

const UnitName = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 600;
  line-height: 1.1;
  color: ${({ theme }) => theme.color.text.strong};
`;

// The troop/character type as a quiet inline tag after the name. Shown only when
// it isn't already stated by the section header.
const TypeTag = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => `${theme.space.xxs}px`};
  flex-shrink: 0;
`;

/* The meta line under the stepper: points cost (when selected) and the model
   restriction. Both are informational, never buttons. Hidden when a unit has
   neither so the controls column doesn't reserve dead space. */
const MetaLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => `${theme.space.xs}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:empty {
    display: none;
  }
`;

const Pts = styled.span`
  color: ${({ theme }) => theme.color.tealBright};
`;

const Restriction = styled.span`
  color: ${({ theme }) => theme.color.text.dim};
`;

const MetaSep = styled.span`
  color: ${({ theme }) => theme.color.border.default};
`;

/* Holds the Rules/Spells popovers and the Upgrades toggle as one consistent row
   of pill controls. Each child renders nothing when it doesn't apply, so when
   the whole row is empty `:empty` removes it (and its parent gap) entirely. */
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${theme.space.xs}px`};

  &:empty {
    display: none;
  }
`;

const UpgradesToggle = styled.button`
  ${pillButton}
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
  gap: ${({ theme }) => `${theme.space.xxs}px`};
`;

const UpgradeGroupBlock = styled.div`
  display: flex;
  flex-direction: column;
  /* No gap between rows so their left rules join into one continuous line. */
  gap: 0;

  & + & {
    margin-top: ${({ theme }) => `${theme.space.xs}px`};
  }
`;

const UpgradeGroupLabel = styled.h5`
  margin: 0 0 ${({ theme }) => `${theme.space.xxs}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text.dim};
`;

export const UnitCard = ({ unitId, groupLabel }: UnitCardProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrades = useArmyStore((s) => s.upgrades);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);
  const gameSize = useArmyStore((s) => s.gameSize);
  const errors = useArmyStore((s) => s.errors);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  if (!unit) {
    return null;
  }

  const selected = unit.number > 0;
  // Skip the type in the eyebrow when the section header already states it.
  const showType = groupLabel === undefined || unit.type !== groupLabel;
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
        <Main>
          <NameRow>
            <UnitName>{unitId}</UnitName>
            {showType && <TypeTag>{unit.type}</TypeTag>}
          </NameRow>
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
        </Main>
        <Controls>
          <Stepper
            value={unit.number}
            onChange={(n) => setUnitNumber(unitId, n)}
            min={min}
            max={max}
            label={unitId}
          />
          <MetaLine>
            {selected && <Pts>{unit.pointsCost} pts</Pts>}
            {badge && rule && (
              <>
                {selected && <MetaSep aria-hidden>·</MetaSep>}
                <Tooltip label={rule}>
                  <Restriction>{badge}</Restriction>
                </Tooltip>
              </>
            )}
          </MetaLine>
        </Controls>
      </Top>
      <Actions>
        <UnitRules unitId={unitId} />
        <UnitSpells unitId={unitId} />
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
      </Actions>
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
};
