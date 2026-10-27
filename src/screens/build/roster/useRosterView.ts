import { useState } from "react";
import { toggleMember, withoutMember } from "@/core/lib/sets";
import { groupRosterUnits } from "@/core/roster/groupRosterUnits";
import { narrowRosterGroups } from "@/core/roster/narrowRosterGroups";
import { useArmyStore } from "@/store/useArmyStore";

/**
 * Filter, search and collapse state for the roster, plus the groups it shows.
 */
export const useRosterView = () => {
  const units = useArmyStore((s) => s.units);
  const gameSize = useArmyStore((s) => s.gameSize);

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const types = groupRosterUnits(units).map((group) => group.label);
  const searched = groupRosterUnits(units, search, gameSize);
  const groups = narrowRosterGroups(searched, {
    activeType,
    selectedOnly,
    countOf: (unitId) => units[unitId].number,
  });

  const toggleCollapsed = (label: string) => {
    setCollapsed((previous) => toggleMember(previous, label));
  };

  // Filtering to a category expands its section, so the matching units are
  // not hidden behind a collapsed header.
  const toggleType = (label: string) => {
    const next = activeType === label ? null : label;

    setActiveType(next);

    if (next !== null) {
      setCollapsed((previous) => withoutMember(previous, next));
    }
  };

  return {
    groups,
    collapsed,
    toggleCollapsed,
    filters: {
      types,
      search,
      onSearchChange: setSearch,
      activeType,
      onToggleType: toggleType,
      filtersOpen,
      onToggleFiltersOpen: () => setFiltersOpen((open) => !open),
      selectedOnly,
      onToggleSelectedOnly: () => setSelectedOnly((only) => !only),
    },
  };
};
