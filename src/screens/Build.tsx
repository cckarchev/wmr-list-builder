import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useArmyStore } from '../store/useArmyStore';
import { groupRosterUnits } from '../store/selectors';
import { focusRing } from '../theme/focusRing';
import { loadList, saveList, decodeList } from '../store/persistence';
import { snapshotOf } from '../store/snapshot';
import ChevronMark from '../components/ui/ChevronMark';
import RosterUnit from '../components/army/RosterUnit';
import ArmyUnitRow from '../components/army/ArmyUnitRow';
import BuildHeader from '../components/army/BuildHeader';

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

  @media (min-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  /* Allow the grid column to shrink rather than stretch the track. */
  min-width: 0;
`;

const SectionHeading = styled.h2<{ $flush?: boolean }>`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
  padding-bottom: ${({ theme, $flush }) => ($flush ? '0' : `${theme.space[2]}px`)};
  border-bottom: ${({ theme, $flush }) =>
    $flush ? 'none' : `1px solid ${theme.color.border.divider}`};
`;

const RosterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding-bottom: ${({ theme }) => `${theme.space[2]}px`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const FilterToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  flex: 0 0 auto;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: none;
  border: 1px solid ${({ theme }) => theme.color.border.divider};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.dim};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
    color: ${({ theme }) => theme.color.text.body};
  }

  ${focusRing}
`;

const Caret = styled.span<{ $open: boolean }>`
  display: inline-flex;
  transition: transform 0.15s;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
`;

const FiltersPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};
`;

const EmptyArmy = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.dim};
  font-style: italic;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &::placeholder {
    color: ${({ theme }) => theme.color.text.dim};
  }

  ${focusRing}
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.space[2]}px`};
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  background: ${({ theme, $active }) =>
    $active ? theme.alpha(theme.rgb.accent, 0.15) : theme.color.bg.tint};
  color: ${({ theme, $active }) => ($active ? theme.color.accent : theme.color.text.dim)};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.color.border.accent : theme.color.border.divider)};

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
  }

  ${focusRing}
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[3]}px`};

  &:not(:first-of-type) {
    margin-top: ${({ theme }) => `${theme.space[3]}px`};
  }
`;

const GroupHeading = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.labelWide};
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.tealBright};

  &::before {
    content: '';
    width: ${({ theme }) => `${theme.space[3]}px`};
    height: 2px;
    background: ${({ theme }) => theme.color.accent};
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.color.border.divider};
  }
`;

export default function Build() {
  const { armyId } = useParams<{ armyId: string }>();

  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const units = useArmyStore((s) => s.units);
  const gameSize = useArmyStore((s) => s.gameSize);
  const setArmy = useArmyStore((s) => s.setArmy);
  const applyList = useArmyStore((s) => s.applyList);
  const [searchParams] = useSearchParams();

  // Only (re)initialize when switching to a different army, so returning to the
  // roster (e.g. back from Print) keeps the current selections. On a fresh load,
  // restore from the URL (?list= wins) or from localStorage.
  useEffect(() => {
    if (!armyId || armyIdInStore === armyId) return;
    setArmy(armyId);
    const fromUrl = searchParams.get('list');
    const snap = (fromUrl && decodeList(fromUrl)) || loadList(armyId);
    if (snap) applyList(snap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armyId, armyIdInStore, setArmy]);

  // Auto-save the current list whenever it changes.
  useEffect(() => {
    if (armyIdInStore) saveList(armyIdInStore, snapshotOf({ gameSize, units }));
  }, [armyIdInStore, gameSize, units]);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!army) return null;

  const allUnitIds = Object.keys(units);
  const usedUnitIds = allUnitIds.filter((id) => units[id].number > 0);
  const allGroups = groupRosterUnits(units);
  const rosterGroups = groupRosterUnits(units, search).filter(
    (g) => activeType === null || g.label === activeType,
  );

  const toggleType = (label: string) =>
    setActiveType((prev) => (prev === label ? null : label));

  const filtersActive = search.trim() !== '' || activeType !== null;

  return (
    <Page>
      <BuildHeader />
      <Grid>
        <Section aria-label="Roster">
          <RosterHeader>
            <SectionHeading $flush as="h2">
              Roster
            </SectionHeading>
            <FilterToggle
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="roster-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <Caret $open={filtersOpen}>
                <ChevronMark size={12} />
              </Caret>
              {filtersActive ? 'Filters •' : 'Filters'}
            </FilterToggle>
          </RosterHeader>
          {filtersOpen && (
            <FiltersPanel id="roster-filters">
              <SearchInput
                type="search"
                placeholder="Search units…"
                aria-label="Search units"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Filters role="group" aria-label="Filter by type">
                {allGroups.map((group) => (
                  <FilterChip
                    key={group.label}
                    type="button"
                    $active={activeType === group.label}
                    aria-pressed={activeType === group.label}
                    onClick={() => toggleType(group.label)}
                  >
                    {group.label}
                  </FilterChip>
                ))}
              </Filters>
            </FiltersPanel>
          )}
          {rosterGroups.length === 0 ? (
            <EmptyArmy>No units match the current filters.</EmptyArmy>
          ) : (
            rosterGroups.map((group) => (
              <Group key={group.label}>
                <GroupHeading>{group.label}</GroupHeading>
                {group.unitIds.map((id) => (
                  <RosterUnit key={id} unitId={id} />
                ))}
              </Group>
            ))
          )}
        </Section>
        <Section aria-label="Your Army">
          <SectionHeading>Your Army</SectionHeading>
          {usedUnitIds.length === 0 ? (
            <EmptyArmy>No units selected yet. Add units from the Roster.</EmptyArmy>
          ) : (
            usedUnitIds.map((id) => <ArmyUnitRow key={id} unitId={id} />)
          )}
        </Section>
      </Grid>
    </Page>
  );
}
