import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../store/useArmyStore';
import { groupRosterUnits } from '../store/selectors';
import { loadList, saveList, decodeShare, buildCodeMaps } from '../store/persistence';
import { loadArmy } from '../data/loadArmy';
import { snapshotOf } from '../store/snapshot';
import UnitCard from '../components/army/UnitCard';
import ArmySummary from '../components/army/ArmySummary';
import BuildHeader from '../components/army/BuildHeader';
import RosterFilters from '../components/army/RosterFilters';
import { focusRing } from '../theme/focusRing';

const Page = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  /* Tooltip bubbles on right-edge badges are absolutely positioned and extend
     past the viewport while hidden; clip horizontally so they can't add a
     page-wide scrollbar. clip (not hidden) avoids creating a scroll container,
     so the sticky points bar keeps working. */
  overflow-x: clip;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => `${theme.space[5]}px`};
  padding: ${({ theme }) => `${theme.space[4]}px`};
  /* Cap and center the content so it gutters on large screens instead of the
     (now narrower) cards sprawling edge-to-edge. */
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin-inline: auto;

  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr minmax(240px, 300px);
    align-items: start;
  }
`;

const ArmySummaryMobile = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin-inline: auto;
  padding: ${({ theme }) => `${theme.space[4]}px ${theme.space[4]}px 0`};

  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    display: none;
  }
`;

const ArmySummaryDesktop = styled.div<{ $top: number }>`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    display: block;
    /* Stick the rail within its grid column as the page scrolls, parked just
       below the sticky BuildHeader (whose height varies with global errors). */
    position: sticky;
    align-self: start;
    top: ${({ $top, theme }) => `${$top + theme.space[3]}px`};
    max-height: ${({ $top, theme }) => `calc(100dvh - ${$top + theme.space[3] * 2}px)`};
    overflow-y: auto;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  /* Allow the grid column to shrink rather than stretch the track. */
  min-width: 0;
`;

const EmptyArmy = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.dim};
  font-style: italic;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};

  &:not(:first-of-type) {
    margin-top: ${({ theme }) => `${theme.space[3]}px`};
  }
`;

const GroupCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const GroupHeading = styled.h3`
  margin: 0;
`;

const GroupToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.labelWide};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.tealBright};

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.color.border.divider};
  }

  ${focusRing}
`;

// The +/- toggle marker. A horizontal bar is always drawn; the vertical bar is
// revealed only when collapsed, animating the dash into a plus.
const ToggleMark = styled.span<{ $collapsed: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: ${({ theme }) => `${theme.space[3]}px`};
  height: ${({ theme }) => `${theme.space[3]}px`};

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: ${({ theme }) => theme.color.accent};
  }

  &::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
  }

  &::after {
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    transform: translateX(-50%) scaleY(${({ $collapsed }) => ($collapsed ? 1 : 0)});
    transition: transform 0.15s;
  }
`;

export default function Build() {
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
    if (!armyId || armyIdInStore === armyId) return;
    setArmy(armyId); // also clears any prior loadWarning
    const fromUrl = searchParams.get('list');
    const maps = buildCodeMaps(loadArmy(armyId));
    if (fromUrl) {
      const result = decodeShare(fromUrl, maps);
      if (result.ok) applyList(result.snapshot);
      else setLoadWarning('This shared list couldn’t be loaded. The link looks corrupted.');
    } else {
      const saved = loadList(armyId);
      if (saved) applyList(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armyId, armyIdInStore, setArmy]);

  // Auto-save the current list whenever it changes.
  useEffect(() => {
    if (armyIdInStore) saveList(armyIdInStore, snapshotOf({ gameSize, units, label }));
  }, [armyIdInStore, gameSize, units, label]);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapsed = (label: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  // Track the sticky header's height so the rail can park just below it. The
  // header grows/shrinks (e.g. when global errors appear), so observe it. We
  // observe the element directly (not via a wrapper) to avoid creating a
  // containing block that would break the header's own `position: sticky`.
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-testid="points-bar"]');
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [army]);

  if (!army) return null;

  const allGroups = groupRosterUnits(units);
  const rosterGroups = groupRosterUnits(units, search, gameSize)
    .filter((g) => activeType === null || g.label === activeType)
    .map((g) => ({
      ...g,
      unitIds: selectedOnly ? g.unitIds.filter((id) => units[id].number > 0) : g.unitIds,
    }))
    .filter((g) => g.unitIds.length > 0);

  const toggleType = (label: string) => setActiveType((prev) => (prev === label ? null : label));

  return (
    <Page>
      <BuildHeader />
      <ArmySummaryMobile>
        <ArmySummary />
      </ArmySummaryMobile>
      <Grid>
        <Section aria-label="Roster">
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
            <EmptyArmy>No units match the current filters.</EmptyArmy>
          ) : (
            rosterGroups.map((group) => {
              const isCollapsed = collapsed.has(group.label);
              const panelId = `group-${group.label.replace(/\W+/g, '-')}`;
              return (
                <Group key={group.label}>
                  <GroupHeading>
                    <GroupToggle
                      type="button"
                      aria-expanded={!isCollapsed}
                      aria-controls={panelId}
                      onClick={() => toggleCollapsed(group.label)}
                    >
                      <ToggleMark $collapsed={isCollapsed} aria-hidden />
                      {group.label}
                    </GroupToggle>
                  </GroupHeading>
                  {!isCollapsed && (
                    <GroupCards id={panelId}>
                      {group.unitIds.map((id) => (
                        <UnitCard key={id} unitId={id} groupLabel={group.label} />
                      ))}
                    </GroupCards>
                  )}
                </Group>
              );
            })
          )}
        </Section>
        <ArmySummaryDesktop $top={headerHeight}>
          <ArmySummary />
        </ArmySummaryDesktop>
      </Grid>
    </Page>
  );
}
