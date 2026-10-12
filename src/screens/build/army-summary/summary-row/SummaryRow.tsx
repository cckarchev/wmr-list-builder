import type { UnitState, UpgradeState } from '@/core/army-state/types';
import { scrollToUnit } from '../../shared/scrollToUnit';
import styles from './SummaryRow.module.css';

interface SummaryRowProps {
  id: string;
  unit: UnitState;
  /** The army's upgrades, for the names of the ones this unit took. */
  upgrades: Record<string, UpgradeState>;
}

/** One selected unit with its taken upgrades; clicking it scrolls the roster there. */
export const SummaryRow = ({ id, unit, upgrades }: SummaryRowProps) => {
  const chosenUpgrades = Object.entries(unit.upgrades ?? {}).filter(([, u]) => u.number > 0);

  const scrollToRosterCard = () => {
    scrollToUnit(id);
  };

  return (
    <button className={styles.row} type="button" onClick={scrollToRosterCard}>
      <span className={styles.rowTop}>
        <span>{unit.name}</span>
        <span className={styles.qty}>×{unit.number}</span>
        <span className={styles.pts}>{unit.pointsCost} pts</span>
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
};
