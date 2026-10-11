import { useState } from 'react';
import { breakPoint, groupRosterUnits, pointsCost, unitCount } from '@/core/selectors';
import { useArmyStore } from '@/store/useArmyStore';
import { unitDomId } from '../shared/domIds';
import styles from './ArmySummary.module.css';

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
  const bp = breakPoint(units);
  const over = total > gameSize;

  const jumpTo = (id: string) => {
    const target = document.getElementById(unitDomId(id));
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
          selected.map((id) => {
            const chosenUpgrades = Object.entries(units[id].upgrades ?? {}).filter(
              ([, u]) => u.number > 0,
            );

            return (
              <button className={styles.row} key={id} type="button" onClick={() => jumpTo(id)}>
                <span className={styles.rowTop}>
                  <span>{units[id].name}</span>
                  <span className={styles.qty}>×{units[id].number}</span>
                  <span className={styles.pts}>{units[id].pointsCost} pts</span>
                </span>
                {chosenUpgrades.length > 0 && (
                  <span className={styles.upgrades}>
                    {chosenUpgrades.map(([upgradeId, u]) => (
                      <span className={styles.upgrade} key={upgradeId}>
                        <span>{upgrades[upgradeId].name}</span>
                        {u.number > 1 && <span className={styles.upgradeQty}>×{u.number}</span>}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            );
          })
        )}
        <div className={styles.total} data-over={over || undefined}>
          <span>
            {count} unit{count === 1 ? '' : 's'} · break {bp}
          </span>
          <span>
            {total} / {gameSize}
          </span>
        </div>
      </div>
    </aside>
  );
};
