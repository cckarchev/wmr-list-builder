import type { ChangeEvent } from 'react';
import { ChevronMark } from '@/components/chevron-mark/ChevronMark';
import styles from './RosterFilters.module.css';

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
export const RosterFilters = ({
  types,
  search,
  onSearchChange,
  activeType,
  onToggleType,
  filtersOpen,
  onToggleFiltersOpen,
  selectedOnly,
  onToggleSelectedOnly,
}: RosterFiltersProps) => {
  const filtersActive = search.trim() !== '' || activeType !== null;
  const filtersLabel = filtersActive ? 'Filters •' : 'Filters';

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.heading}>Roster</h2>
        <div className={styles.controls}>
          <button
            className={styles.toggle}
            type="button"
            aria-pressed={selectedOnly}
            onClick={onToggleSelectedOnly}
          >
            Selected only
          </button>
          <button
            className={styles.toggle}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="roster-filters"
            onClick={onToggleFiltersOpen}
          >
            <span className={styles.caret}>
              <ChevronMark size={12} />
            </span>
            {filtersLabel}
          </button>
        </div>
      </div>
      {filtersOpen && (
        <div className={styles.panel} id="roster-filters">
          <input
            className={styles.search}
            type="search"
            placeholder="Search units…"
            aria-label="Search units"
            value={search}
            onChange={handleSearch}
          />
          <fieldset className={styles.chips} aria-label="Filter by type">
            {types.map((label) => (
              <button
                className={styles.chip}
                key={label}
                type="button"
                aria-pressed={activeType === label}
                onClick={() => onToggleType(label)}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
      )}
    </>
  );
};
