import { resolveUpgradePoints } from '@/core/army-state/pricing';
import type { UnitState, UpgradeState } from '@/core/army-state/types';
import type { UsedUnit } from '@/core/army-state/usedUnits';
import { classNames } from '@/core/lib/classNames';
import { formatStat } from '@/core/lib/formatStat';
import { type NumberedRules, specialRuleMarkers } from '@/core/special-rules/specialRuleMarkers';
import styles from './StatRow.module.css';

export type StatKind = 'character' | 'unit';

type StatTroop = UsedUnit | UpgradeState;

/** The fields a row shows. Only units carry armour and command, so those stay optional. */
type RowStats = Pick<
  UnitState,
  'number' | 'name' | 'type' | 'attack' | 'range' | 'hits' | 'size' | 'specialRules'
> &
  Partial<Pick<UnitState, 'armour' | 'command'>>;

interface StatRowProps {
  /** The troop's id, which also keys its own special rule. */
  id: string;
  troop: StatTroop;
  kind: StatKind;
  rules: NumberedRules;
  /** The unit an upgrade row belongs to, for prices that scale with it. */
  parentUnit?: UnitState;
}

/** One table row: a unit, or one of its upgrades indented under it. */
export const StatRow = ({ id, troop, kind, rules, parentUnit }: StatRowProps) => {
  const stats: RowStats = troop;
  const isUpgrade = parentUnit !== undefined;
  const isUnitTable = kind === 'unit';
  const markers = specialRuleMarkers([id, ...(stats.specialRules ?? [])], rules);
  const points = resolveUpgradePoints(troop, parentUnit);

  return (
    <tr>
      <td>{stats.number}</td>
      <td className={classNames(styles.left, styles.nameCell)}>
        <span className={styles.name} data-indent={isUpgrade || undefined}>
          {stats.name}
        </span>
        {markers && <span className={styles.special}>{markers}</span>}
      </td>
      <td className={styles.left}>{formatStat(stats.type)}</td>
      <td>{formatStat(stats.attack)}</td>
      {isUnitTable && <td>{formatStat(stats.range)}</td>}
      {isUnitTable && <td>{formatStat(stats.hits)}</td>}
      {isUnitTable && <td>{formatStat(stats.armour)}</td>}
      {!isUnitTable && <td>{formatStat(stats.command)}</td>}
      {isUnitTable && <td>{formatStat(stats.size)}</td>}
      <td>{formatStat(points)}</td>
    </tr>
  );
};
