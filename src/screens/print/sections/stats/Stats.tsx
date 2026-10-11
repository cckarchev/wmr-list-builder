import { classNames } from '@/core/classNames';
import type { UsedUnit } from '@/core/selectors';
import { usedUnits as getUsedUnits, pointsCost, unitCount } from '@/core/selectors';
import type { UnitState, UpgradeState } from '@/core/storeHelpers';
import { resolveUpgradePoints } from '@/core/storeHelpers';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './Stats.module.css';

// Characters (General/Hero/Wizard) and the fighting units have wildly
// different stat profiles, so they print as two separate tables. The
// character table drops Range/Armour and keeps Command; the unit table drops
// Command. Only the units count toward the break point, so the totals footer
// lives on the unit table.
const CHARACTER_TYPES = new Set(['General', 'Hero', 'Wizard']);

type StatKind = 'character' | 'unit';

interface StatRowProps {
  name: string;
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number });
  parentUnit?: UnitState;
  specialRules: Record<string, { order?: number }>;
  kind: StatKind;
  isUpgrade?: boolean;
}

const resolvePoints = (
  troop: UnitState | UpgradeState | (UsedUnit & { pointsCost: number; number: number }),
  parentUnit?: UnitState,
): string => {
  const price = resolveUpgradePoints(troop, parentUnit);
  return price === undefined ? '-' : String(price);
};

const resolveSpecial = (
  name: string,
  troopSpecialRules: string[] | undefined,
  specialRules: Record<string, { order?: number }>,
): string => {
  const orders: number[] = [];

  const addOrder = (n: string) => {
    if (specialRules[n]?.order != null) {
      orders.push(specialRules[n].order as number);
    }
  };

  addOrder(name);
  if (troopSpecialRules) {
    troopSpecialRules.forEach(addOrder);
  }

  if (orders.length === 0) {
    return '-';
  }
  return orders
    .sort((a, b) => a - b)
    .map((o) => `*${o}`)
    .join(', ');
};

const StatRow = ({ name, troop, parentUnit, specialRules, kind, isUpgrade }: StatRowProps) => {
  const t = troop as UnitState & UpgradeState;
  const special = resolveSpecial(name, t.specialRules, specialRules);
  const nameCellClasses = classNames(styles.left, styles.nameCell);

  return (
    <tr>
      <td>{t.number}</td>
      <td className={nameCellClasses}>
        <span className={styles.name} data-indent={isUpgrade || undefined}>
          {name}
        </span>
        {special !== '-' && <span className={styles.special}>{special}</span>}
      </td>
      <td className={styles.left}>{t.type || '-'}</td>
      <td>{String(t.attack ?? '-')}</td>
      {kind === 'unit' && <td>{t.range || '-'}</td>}
      {kind === 'unit' && <td>{String(t.hits ?? '-')}</td>}
      {kind === 'unit' && <td>{t.armour || '-'}</td>}
      {kind === 'character' && <td>{String(t.command ?? '-')}</td>}
      {kind === 'unit' && <td>{String(t.size ?? '-')}</td>}
      <td>{resolvePoints(troop, parentUnit)}</td>
    </tr>
  );
};

const renderRows = (
  entries: [string, UsedUnit][],
  kind: StatKind,
  units: Record<string, UnitState>,
  srMap: Record<string, { order?: number }>,
) =>
  entries.flatMap(([unitId, unit]) => {
    const rows = [
      <StatRow
        key={`unit_${unitId}`}
        name={unitId}
        troop={unit}
        specialRules={srMap}
        kind={kind}
      />,
    ];
    if (unit.upgrades) {
      Object.entries(unit.upgrades).forEach(([upId, upg]) => {
        rows.push(
          <StatRow
            key={`upgrade_${unitId}_${upId}`}
            name={upId}
            troop={upg}
            parentUnit={units[unitId]}
            specialRules={srMap}
            kind={kind}
            isUpgrade
          />,
        );
      });
    }
    return rows;
  });

export const Stats = () => {
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const specialRulesData = useArmyStore((s) => s.specialRules) as
    | Record<string, { order?: number }>
    | undefined;
  const errors = useArmyStore((s) => s.errors);

  const srMap: Record<string, { order?: number }> = specialRulesData ?? {};
  const total = pointsCost({ units });
  const count = unitCount(units);
  const usedUnitsMap = getUsedUnits({ units, upgrades });

  const isValid = errors.length === 0;

  const entries = Object.entries(usedUnitsMap);
  const characterEntries = entries.filter(([, unit]) => CHARACTER_TYPES.has(unit.type));
  const unitEntries = entries.filter(([, unit]) => !CHARACTER_TYPES.has(unit.type));

  return (
    <div className={styles.wrapper}>
      {characterEntries.length > 0 && (
        <table className={classNames(styles.table, 'character-table')} data-kind="character">
          <thead>
            <tr>
              <th>#</th>
              <th>Character</th>
              <th>Type</th>
              <th>Attack</th>
              <th>Command</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>{renderRows(characterEntries, 'character', units, srMap)}</tbody>
        </table>
      )}

      <table className={styles.table} data-kind="unit">
        <thead>
          <tr>
            <th>#</th>
            <th>Troop</th>
            <th>Type</th>
            <th>Attack</th>
            <th>Range</th>
            <th>Hits</th>
            <th>Armour</th>
            <th>Size</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>{renderRows(unitEntries, 'unit', units, srMap)}</tbody>
        <tfoot>
          <tr>
            <td>
              {count}/{Math.ceil(count / 2)}
            </td>
            <td colSpan={7}>{isValid ? '' : 'INVALID'}</td>
            <td>{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
