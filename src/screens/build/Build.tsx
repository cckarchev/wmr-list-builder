import { type CSSProperties, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { buildCodeMaps, decodeShare, loadList, saveList } from '@/core/persistence';
import { groupRosterUnits } from '@/core/selectors';
import { snapshotOf } from '@/core/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { useArmyStore } from '@/store/useArmyStore';
import { ArmySummary } from './army-summary/ArmySummary';
import styles from './Build.module.css';
import { Header } from './header/Header';
import { RosterFilters } from './roster-filters/RosterFilters';
import { UnitCard } from './unit-card/UnitCard';

export const Build = () => {
  const { armyId: paramArmyId } = useParams<{ armyId: string }>();
  const [searchParams] = useSearchParams();
  // Embedded query-only links (/?army=<id>) carry the army in the query string;
  // the /build/:armyId route carries it in the path. Accept either.
  const armyId = paramArmyId ?? searchParams.get('army') ?? undefined;

  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const units = useArmyStore((s) => s.units);
  const gameSize = useArmyStore((s) => s.gameSize);
  const label = useArmyStore((s) => s.label);
  const setArmy = useArmyStore((s) => s.setArmy);
  const applyList = useArmyStore((s) => s.applyList);
  const setLoadWarning = useArmyStore((s) => s.setLoadWarning);

  // Only (re)initialize when switching to a different army, so returning to the
  // roster (e.g. back from Print) keeps the current selections. On a fresh load,
  // restore from the URL (?list= wins) or from localStorage.
  useEffect(() => {
    if (!armyId || armyIdInStore === armyId) {
      return;
    }
    setArmy(armyId); // also clears any prior loadWarning
    const fromUrl = searchParams.get('list');
    const maps = buildCodeMaps(loadArmy(armyId));
    if (fromUrl) {
      const result = decodeShare(fromUrl, maps);
      if (result.ok) {
        applyList(result.snapshot);
      } else {
        setLoadWarning('This shared list couldn’t be loaded. The link looks corrupted.');
      }
    } else {
      const saved = loadList(armyId);
      if (saved) {
        applyList(saved);
      }
    }
  }, [armyId, armyIdInStore, setArmy]);

  // Auto-save the current list whenever it changes.
  useEffect(() => {
    if (armyIdInStore) {
      saveList(armyIdInStore, snapshotOf({ gameSize, units, label }));
    }
  }, [armyIdInStore, gameSize, units, label]);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapsed = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      return next;
    });
  };

  // Track the sticky header's height so the rail can park just below it. The
  // header grows/shrinks (e.g. when global errors appear), so observe it. We
  // observe the element directly (not via a wrapper) to avoid creating a
  // containing block that would break the header's own `position: sticky`.
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-testid="points-bar"]');
    if (!el) {
      return;
    }
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [army]);

  if (!army) {
    return null;
  }

  // Parks the desktop summary rail just below the sticky header.
  const summaryOffset = { '--header-height': `${headerHeight}px` } as CSSProperties;

  const allGroups = groupRosterUnits(units);
  const rosterGroups = groupRosterUnits(units, search, gameSize)
    .filter((g) => activeType === null || g.label === activeType)
    .map((g) => ({
      ...g,
      unitIds: selectedOnly ? g.unitIds.filter((id) => units[id].number > 0) : g.unitIds,
    }))
    .filter((g) => g.unitIds.length > 0);

  const toggleType = (label: string) =>
    setActiveType((prev) => {
      const next = prev === label ? null : label;
      // When filtering to a category, make sure its section is expanded so the
      // matching units aren't hidden behind a collapsed header.
      if (next !== null) {
        setCollapsed((c) => {
          if (!c.has(next)) {
            return c;
          }
          const updated = new Set(c);
          updated.delete(next);
          return updated;
        });
      }
      return next;
    });

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.summaryMobile}>
        <ArmySummary />
      </div>
      <div className={styles.grid}>
        <section className={styles.section} aria-label="Roster">
          <RosterFilters
            types={allGroups.map((g) => g.label)}
            search={search}
            onSearchChange={setSearch}
            activeType={activeType}
            onToggleType={toggleType}
            filtersOpen={filtersOpen}
            onToggleFiltersOpen={() => setFiltersOpen((open) => !open)}
            selectedOnly={selectedOnly}
            onToggleSelectedOnly={() => setSelectedOnly((v) => !v)}
          />
          {rosterGroups.length === 0 ? (
            <p className={styles.empty}>No units match the current filters.</p>
          ) : (
            rosterGroups.map((group) => {
              const isCollapsed = collapsed.has(group.label);
              const panelId = `group-${group.label.replace(/\W+/g, '-')}`;

              return (
                <div className={styles.group} key={group.label}>
                  <h3 className={styles.groupHeading}>
                    <button
                      className={styles.groupToggle}
                      type="button"
                      aria-expanded={!isCollapsed}
                      aria-controls={panelId}
                      onClick={() => toggleCollapsed(group.label)}
                    >
                      <span className={styles.toggleMark} aria-hidden />
                      {group.label}
                    </button>
                  </h3>
                  {!isCollapsed && (
                    <div className={styles.groupCards} id={panelId}>
                      {group.unitIds.map((id) => (
                        <UnitCard key={id} unitId={id} groupLabel={group.label} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
        <div className={styles.summaryDesktop} style={summaryOffset}>
          <ArmySummary />
        </div>
      </div>
    </main>
  );
};
