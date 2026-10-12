import { breakPoint, pointsCost, unitCount } from '@/core/army-state/armyTotals';
import { isCharacter } from '@/core/army-state/unitTypes';
import { usedUnits as getUsedUnits } from '@/core/army-state/usedUnits';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './Stats.module.css';
import { StatTable } from './stat-table/StatTable';

// Characters (General/Hero/Wizard) and the fighting units have wildly
// different stat profiles, so they print as two separate tables. The
// character table drops Range/Armour and keeps Command; the unit table drops
// Command. Only the units count toward the break point, so the totals footer
// lives on the unit table.
const CHARACTER_COLUMNS = ['#', 'Character', 'Type', 'Attack', 'Command', 'Points'];
const UNIT_COLUMNS = ['#', 'Troop', 'Type', 'Attack', 'Range', 'Hits', 'Armour', 'Size', 'Points'];

/** The footer fills the columns between the unit count and the points total. */
const FOOTER_MIDDLE_SPAN = UNIT_COLUMNS.length - 2;

const INVALID_MARK = 'INVALID';

export const Stats = () => {
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const specialRules = useArmyStore((s) => s.specialRules);
  const errors = useArmyStore((s) => s.errors);

  const rules = specialRules ?? {};
  const entries = Object.entries(getUsedUnits({ units, upgrades }));
  const characterEntries = entries.filter(([, unit]) => isCharacter(unit.type));
  const unitEntries = entries.filter(([, unit]) => !isCharacter(unit.type));
  const validityMark = errors.length === 0 ? '' : INVALID_MARK;

  const footer = (
    <tr>
      <td>
        {unitCount(units)}/{breakPoint(units)}
      </td>
      <td colSpan={FOOTER_MIDDLE_SPAN}>{validityMark}</td>
      <td>{pointsCost({ units })}</td>
    </tr>
  );

  return (
    <div className={styles.wrapper}>
      {characterEntries.length > 0 && (
        <StatTable
          kind="character"
          columns={CHARACTER_COLUMNS}
          entries={characterEntries}
          units={units}
          rules={rules}
          className="character-table"
        />
      )}

      <StatTable
        kind="unit"
        columns={UNIT_COLUMNS}
        entries={unitEntries}
        units={units}
        rules={rules}
        footer={footer}
      />
    </div>
  );
};
