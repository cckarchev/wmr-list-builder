import { useState } from 'react';
import { breakPoint, pointsCost, unitCount } from '@/core/army-state/armyTotals';
import { groupRosterUnits } from '@/core/roster/groupRosterUnits';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './ArmySummary.module.css';
import { SummaryRow } from './summary-row/SummaryRow';

export const ArmySummary = () => {
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);
  const gameSize = useArmyStore((s) => s.gameSize);
  const [open, setOpen] = useState(false);

  // List selected units in the same grouped order as the roster (Characters
  // first, then troop types; mandatory units floated to the top of each group).
  const selected = groupRosterUnits(units, '', gameSize)
    .flatMap((g) => g.unitIds)
    .filter((id) => units[id].number > 0);
  const total = pointsCost({ units });
  const count = unitCount(units);
  const breakAt = breakPoint(units);
  const over = total > gameSize;

  const toggleOpen = () => {
    setOpen((o) => !o);
  };

  return (
    <aside className={styles.aside} aria-label="Your Army">
      <button className={styles.heading} type="button" aria-expanded={open} onClick={toggleOpen}>
        Your Army
      </button>
      <div className={styles.body} data-open={open || undefined}>
        {selected.length === 0 ? (
          <p className={styles.empty}>No units selected yet.</p>
        ) : (
          selected.map((id) => <SummaryRow key={id} id={id} unit={units[id]} upgrades={upgrades} />)
        )}
        <div className={styles.total} data-over={over || undefined}>
          <span>
            {count} unit{count === 1 ? '' : 's'} · break {breakAt}
          </span>
          <span>
            {total} / {gameSize}
          </span>
        </div>
      </div>
    </aside>
  );
};
