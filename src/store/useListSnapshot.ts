import { useMemo } from "react";
import { type ListSnapshot, snapshotOf } from "@/core/persistence/snapshot";
import { useArmyStore } from "./useArmyStore";

/**
 * The current list as a storable snapshot. Memoized on the fields it reads, so
 * effects that depend on it only rerun when the list itself changes.
 */
export const useListSnapshot = (): ListSnapshot => {
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);

  return useMemo(
    () => snapshotOf({ gameSize, units, label }),
    [gameSize, units, label],
  );
};
