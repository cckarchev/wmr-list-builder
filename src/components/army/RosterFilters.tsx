import styled from 'styled-components';
import { focusRing } from '../../theme/focusRing';
import ChevronMark from '../ui/ChevronMark';

const SectionHeading = styled.h2`
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.color.text.strong};
`;

const RosterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding-bottom: ${({ theme }) => `${theme.space[2]}px`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
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

const SelectedToggle = styled(FilterToggle)<{ $active?: boolean }>`
  background: ${({ theme, $active }) => ($active ? theme.alpha(theme.rgb.accent, 0.15) : 'none')};
  color: ${({ theme, $active }) => ($active ? theme.color.accent : theme.color.text.dim)};
  border-color: ${({ theme, $active }) =>
    $active ? theme.color.border.accent : theme.color.border.divider};
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

interface RosterFiltersProps {
  /** All available roster type labels, used to render the type chips. */
  types: string[];
  search: string;
  onSearchChange: (value: string) => void;
  activeType: string | null;
  onToggleType: (label: string) => void;
  filtersOpen: boolean;
  onToggleFiltersOpen: () => void;
  selectedOnly: boolean;
  onToggleSelectedOnly: () => void;
}

/** The roster header (heading + Selected-only / Filters toggles) and the
 * collapsible search + type-chip panel. Purely presentational: the Build screen
 * owns the filter state because it also drives which units are listed. */
export default function RosterFilters({
  types,
  search,
  onSearchChange,
  activeType,
  onToggleType,
  filtersOpen,
  onToggleFiltersOpen,
  selectedOnly,
  onToggleSelectedOnly,
}: RosterFiltersProps) {
  const filtersActive = search.trim() !== '' || activeType !== null;

  return (
    <>
      <RosterHeader>
        <SectionHeading>Roster</SectionHeading>
        <Controls>
          <SelectedToggle
            type="button"
            $active={selectedOnly}
            aria-pressed={selectedOnly}
            onClick={onToggleSelectedOnly}
          >
            Selected only
          </SelectedToggle>
          <FilterToggle
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="roster-filters"
            onClick={onToggleFiltersOpen}
          >
            <Caret $open={filtersOpen}>
              <ChevronMark size={12} />
            </Caret>
            {filtersActive ? 'Filters •' : 'Filters'}
          </FilterToggle>
        </Controls>
      </RosterHeader>
      {filtersOpen && (
        <FiltersPanel id="roster-filters">
          <SearchInput
            type="search"
            placeholder="Search units…"
            aria-label="Search units"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Filters role="group" aria-label="Filter by type">
            {types.map((label) => (
              <FilterChip
                key={label}
                type="button"
                $active={activeType === label}
                aria-pressed={activeType === label}
                onClick={() => onToggleType(label)}
              >
                {label}
              </FilterChip>
            ))}
          </Filters>
        </FiltersPanel>
      )}
    </>
  );
}
