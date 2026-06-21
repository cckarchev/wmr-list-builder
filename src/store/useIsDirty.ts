import { useArmyStore } from './useArmyStore';
import { snapshotOf } from './snapshot';
import { encodeList, buildCodeMaps } from './persistence';
import { loadArmy } from '../data/loadArmy';

// True when the current list differs from the last Saved/Loaded named list.
// Lists are small, so re-encoding per render is cheap. With no baseline
// (fresh build, draft restore, or shared link) any state reads as dirty,
// which is the intended "unsaved work" signal.
export function useIsDirty(): boolean {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);
  const savedBaseline = useArmyStore((s) => s.savedBaseline);
  if (!armyId) return false;
  if (savedBaseline === null) return true;
  const maps = buildCodeMaps(loadArmy(armyId));
  const encoded = encodeList(snapshotOf({ gameSize, units, label }), maps);
  return encoded !== savedBaseline;
}
