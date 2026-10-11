import { classNames } from '@/core/classNames';
import type { UsedUnit } from '@/core/selectors';
import { type NumberedRules, specialRuleMarkers } from '@/core/specialRuleMarkers';
import { resolveUpgradePoints, type UnitState, type UpgradeState } from '@/core/storeHelpers';
import type { StatValue } from '@/data/types';
import styles from './StatRow.module.css';

/** Placeholder for a stat the troop does not have. */
const MISSING = '-';

export type StatKind = 'character' | 'unit';

export type StatTroop = UsedUnit | UpgradeState;

interface StatRowProps {
  name: string;
  troop: StatTroop;
  kind: StatKind;
  rules: NumberedRules;
  /** The unit an upgrade row belongs to, for prices that scale with it. */
  parentUnit?: UnitState;
}

const show = (value: StatValue | undefined): string => {
  if (value === undefined || value === '') {
    return MISSING;
  }

  return String(value);
};

/** One table row: a unit, or one of its upgrades indented under it. */
export const StatRow = ({ name, troop, kind, rules, parentUnit }: StatRowProps) => {
  const stats = troop as UnitState & UpgradeState;
  const isUpgrade = parentUnit !== undefined;
  const isUnitTable = kind === 'unit';
  const markers = specialRuleMarkers([name, ...(stats.specialRules ?? [])], rules);
  const points = resolveUpgradePoints(troop, parentUnit);

  return (
    <tr>
      <td>{stats.number}</td>
      <td className={classNames(styles.left, styles.nameCell)}>
        <span className={styles.name} data-indent={isUpgrade || undefined}>
          {name}
        </span>
        {markers && <span className={styles.special}>{markers}</span>}
      </td>
      <td className={styles.left}>{show(stats.type)}</td>
      <td>{show(stats.attack)}</td>
      {isUnitTable && <td>{show(stats.range)}</td>}
      {isUnitTable && <td>{show(stats.hits)}</td>}
      {isUnitTable && <td>{show(stats.armour)}</td>}
      {!isUnitTable && <td>{show(stats.command)}</td>}
      {isUnitTable && <td>{show(stats.size)}</td>}
      <td>{show(points)}</td>
    </tr>
  );
};
