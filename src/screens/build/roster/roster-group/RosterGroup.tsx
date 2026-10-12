import type { RosterGroup as RosterGroupData } from '@/core/roster/groupRosterUnits';
import { groupPanelId } from '../../shared/domIds';
import { UnitCard } from '../unit-card/UnitCard';
import styles from './RosterGroup.module.css';

interface RosterGroupProps {
  group: RosterGroupData;
  collapsed: boolean;
  onToggle: (label: string) => void;
}

/** A collapsible roster section: the type heading and its unit cards. */
export const RosterGroup = ({ group, collapsed, onToggle }: RosterGroupProps) => {
  const panelId = groupPanelId(group.label);

  return (
    <div className={styles.group}>
      <h3 className={styles.heading}>
        <button
          className={styles.toggle}
          type="button"
          aria-expanded={!collapsed}
          aria-controls={panelId}
          onClick={() => onToggle(group.label)}
        >
          <span className={styles.toggleMark} aria-hidden="true" />
          {group.label}
        </button>
      </h3>
      {!collapsed && (
        <div className={styles.cards} id={panelId}>
          {group.unitIds.map((id) => (
            <UnitCard key={id} unitId={id} groupLabel={group.label} />
          ))}
        </div>
      )}
    </div>
  );
};
