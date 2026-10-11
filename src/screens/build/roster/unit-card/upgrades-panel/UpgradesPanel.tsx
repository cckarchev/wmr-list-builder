import { groupUpgradeIds } from '@/core/groupUpgrades';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './UpgradesPanel.module.css';
import { UpgradeRow } from './upgrade-row/UpgradeRow';

interface UpgradesPanelProps {
  id: string;
  unitId: string;
  upgradeIds: string[];
}

/** A unit's available upgrades, grouped by category. */
export const UpgradesPanel = ({ id, unitId, upgradeIds }: UpgradesPanelProps) => {
  const upgrades = useArmyStore((s) => s.upgrades);
  const groups = groupUpgradeIds(upgradeIds, upgrades);

  // Only label the categories when there's more than one: a single-category
  // list reads cleaner as a plain list with no heading.
  const showLabels = groups.length > 1;

  return (
    <div className={styles.panel} id={id}>
      {groups.map((group) => (
        <div className={styles.group} key={group.label}>
          {showLabels && <h5 className={styles.groupLabel}>{group.label}</h5>}
          {group.upgradeIds.map((upgradeId) => (
            <UpgradeRow key={upgradeId} unitId={unitId} upgradeId={upgradeId} />
          ))}
        </div>
      ))}
    </div>
  );
};
