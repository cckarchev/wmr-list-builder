import styles from "./Roster.module.css";
import { RosterFilters } from "./roster-filters/RosterFilters";
import { RosterGroup } from "./roster-group/RosterGroup";
import { useRosterView } from "./useRosterView";

/** The army's units, grouped by type, with search and filter controls. */
export const Roster = () => {
  const { groups, collapsed, toggleCollapsed, filters } = useRosterView();
  const isEmpty = groups.length === 0;

  return (
    <section className={styles.section} aria-label="Roster">
      <RosterFilters {...filters} />
      {isEmpty && (
        <p className={styles.empty}>No units match the current filters.</p>
      )}
      {groups.map((group) => (
        <RosterGroup
          key={group.label}
          group={group}
          collapsed={collapsed.has(group.label)}
          onToggle={toggleCollapsed}
        />
      ))}
    </section>
  );
};
