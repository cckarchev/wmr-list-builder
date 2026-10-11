import { useState } from 'react';
import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import { CornerBrackets } from '@/components/corner-brackets/CornerBrackets';
import { PillButton } from '@/components/pill-button/PillButton';
import { StatLine } from '@/components/stat-line/StatLine';
import { Stepper } from '@/components/stepper/Stepper';
import { Tooltip } from '@/components/tooltip/Tooltip';
import { resolveBounds } from '@/core/forceLimits';
import { groupUpgradeIds } from '@/core/groupUpgrades';
import { explainMinMax, minMaxBadge } from '@/core/minMax';
import { errorsForTarget, isCharacter } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import { unitDomId } from '../shared/unitDomId';
import { InlineErrors } from './inline-errors/InlineErrors';
import styles from './UnitCard.module.css';
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

export const UnitCard = ({ unitId, groupLabel }: UnitCardProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const upgrades = useArmyStore((s) => s.upgrades);
  const setUnitNumber = useArmyStore((s) => s.setUnitNumber);
  const gameSize = useArmyStore((s) => s.gameSize);
  const errors = useArmyStore((s) => s.errors);
  const [open, setOpen] = useState(false);

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
  // Only label the categories when there's more than one: a single-category
  // list reads cleaner as a plain list with no heading.
  const showUpgradeLabels = upgradeGroups.length > 1;
  const panelId = `upgrades-${unitId.replace(/\W+/g, '-')}`;
  const bracketColor = invalid ? 'var(--color-error)' : 'var(--color-border-accent)';

  const changeNumber = (n: number) => {
    setUnitNumber(unitId, n);
  };

  const toggleUpgrades = () => {
    setOpen((v) => !v);
  };

  return (
    <div
      className={styles.card}
      id={unitDomId(unitId)}
      data-selected={selected || undefined}
      data-invalid={invalid || undefined}
    >
      {selected && <CornerBrackets accent={bracketColor} />}
      <div className={styles.top}>
        <div className={styles.main}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{unitId}</span>
            {showType && <span className={styles.typeTag}>{unit.type}</span>}
          </div>
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
        </div>
        <div className={styles.controls}>
          <Stepper value={unit.number} onChange={changeNumber} min={min} max={max} label={unitId} />
          <div className={styles.meta}>
            {selected && <span className={styles.pts}>{unit.pointsCost} pts</span>}
            {badge && rule && (
              <>
                {selected && (
                  <span className={styles.metaSep} aria-hidden>
                    ·
                  </span>
                )}
                <Tooltip label={rule}>
                  <span className={styles.restriction}>{badge}</span>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <UnitRules unitId={unitId} />
        <UnitSpells unitId={unitId} />
        {hasUpgrades && (
          <PillButton aria-expanded={open} aria-controls={panelId} onClick={toggleUpgrades}>
            <span className={styles.caret} data-open={open || undefined}>
              <ChevronMark size={11} color="currentColor" />
            </span>
            Upgrades
            {selectedCount > 0 && <span className={styles.selectedBadge}>({selectedCount})</span>}
          </PillButton>
        )}
      </div>
      {selected && <InlineErrors errors={unitErrors} label={`${unitId} errors`} />}
      {hasUpgrades && open && (
        <div className={styles.upgrades} id={panelId}>
          {upgradeGroups.map((group) => (
            <div className={styles.upgradeGroup} key={group.label}>
              {showUpgradeLabels && <h5 className={styles.upgradeGroupLabel}>{group.label}</h5>}
              {group.upgradeIds.map((upgradeId) => (
                <UpgradeRow key={upgradeId} unitId={unitId} upgradeId={upgradeId} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
