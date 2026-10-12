import { useState } from 'react';
import { CornerBrackets } from '@/components/corner-brackets/CornerBrackets';
import { StatLine } from '@/components/stat-line/StatLine';
import { isCharacter } from '@/core/army-state/unitTypes';
import { errorsForTarget } from '@/core/validation/errorTargets';
import { useArmyStore } from '@/store/useArmyStore';
import { unitDomId, upgradesPanelId } from '../../shared/domIds';
import { CardControls } from './card-controls/CardControls';
import { InlineErrors } from './shared/inline-errors/InlineErrors';
import styles from './UnitCard.module.css';
import { UnitRules } from './unit-rules/UnitRules';
import { UnitSpells } from './unit-spells/UnitSpells';
import { UpgradesPanel } from './upgrades-panel/UpgradesPanel';
import { UpgradesToggle } from './upgrades-toggle/UpgradesToggle';

const VALID_BRACKETS = 'var(--color-border-accent)';
const INVALID_BRACKETS = 'var(--color-error)';

interface UnitCardProps {
  unitId: string;
  /**
   * The roster section the card sits under. When the section is already labeled
   * with the unit's type (e.g. an "Infantry" section), we omit the type tag from
   * the card to avoid the redundant repetition.
   */
  groupLabel?: string;
}

export const UnitCard = ({ unitId, groupLabel }: UnitCardProps) => {
  const unit = useArmyStore((s) => s.units[unitId]);
  const errors = useArmyStore((s) => s.errors);
  const [upgradesOpen, setUpgradesOpen] = useState(false);

  if (!unit) {
    return null;
  }

  const selected = unit.number > 0;
  const showType = unit.type !== groupLabel;
  const unitErrors = errorsForTarget(errors, unitId);
  const invalid = unitErrors.length > 0;
  const bracketColor = invalid ? INVALID_BRACKETS : VALID_BRACKETS;

  const unitUpgrades = Object.values(unit.upgrades ?? {});
  const upgradeIds = Object.keys(unit.upgrades ?? {});
  const takenUpgrades = unitUpgrades.filter((upgrade) => upgrade.number > 0).length;
  const hasUpgrades = selected && upgradeIds.length > 0;
  const showUpgrades = hasUpgrades && upgradesOpen;
  const panelId = upgradesPanelId(unitId);

  const toggleUpgrades = () => {
    setUpgradesOpen((open) => !open);
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
        <div className={styles.nameRow}>
          <span className={styles.name}>{unit.name}</span>
          {showType && <span className={styles.typeTag}>{unit.type}</span>}
        </div>
        <div className={styles.stats}>
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
        <CardControls unitId={unitId} unit={unit} />
      </div>
      <div className={styles.actions}>
        <UnitRules unitId={unitId} />
        <UnitSpells unitId={unitId} />
        {hasUpgrades && (
          <UpgradesToggle
            open={upgradesOpen}
            panelId={panelId}
            selectedCount={takenUpgrades}
            onToggle={toggleUpgrades}
          />
        )}
      </div>
      {selected && <InlineErrors errors={unitErrors} label={`${unit.name} errors`} />}
      {showUpgrades && <UpgradesPanel id={panelId} unitId={unitId} upgradeIds={upgradeIds} />}
    </div>
  );
};
