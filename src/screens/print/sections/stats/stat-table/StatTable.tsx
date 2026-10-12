import type { ReactNode } from 'react';
import type { UnitState } from '@/core/army-state/types';
import type { UsedUnit } from '@/core/army-state/usedUnits';
import type { NumberedRules } from '@/core/special-rules/specialRuleMarkers';
import styles from './StatTable.module.css';
import { type StatKind, StatRow } from './stat-row/StatRow';

interface StatTableProps {
  kind: StatKind;
  columns: string[];
  entries: [string, UsedUnit][];
  units: Record<string, UnitState>;
  rules: NumberedRules;
  footer?: ReactNode;
}

/** A stat table: one row per used unit, followed by its upgrades. */
export const StatTable = ({ kind, columns, entries, units, rules, footer }: StatTableProps) => {
  const rows = entries.flatMap(([unitId, unit]) => {
    const upgradeRows = Object.entries(unit.upgrades ?? {}).map(([upgradeId, upgrade]) => (
      <StatRow
        key={`upgrade_${unitId}_${upgradeId}`}
        id={upgradeId}
        troop={upgrade}
        kind={kind}
        rules={rules}
        parentUnit={units[unitId]}
      />
    ));

    return [
      <StatRow key={`unit_${unitId}`} id={unitId} troop={unit} kind={kind} rules={rules} />,
      ...upgradeRows,
    ];
  });

  return (
    <table className={styles.table} data-kind={kind}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      {footer && <tfoot>{footer}</tfoot>}
    </table>
  );
};
