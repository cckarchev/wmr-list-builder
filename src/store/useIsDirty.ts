import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { useArmyStore } from './useArmyStore';
import { useListSnapshot } from './useListSnapshot';

/**
 * True when the current list differs from the last Saved/Loaded named list.
 * Lists are small, so re-encoding per render is cheap. With no baseline
 * (fresh build, draft restore, or shared link) any state reads as dirty,
 * which is the intended "unsaved work" signal.
 */
export const useIsDirty = (): boolean => {
  const armyId = useArmyStore((s) => s.armyId);
  const snapshot = useListSnapshot();
  const savedBaseline = useArmyStore((s) => s.savedBaseline);

  if (!armyId) {
    return false;
  }

  if (savedBaseline === null) {
    return true;
  }

  const encoded = encodeListFor(armyId, snapshot);

  return encoded !== savedBaseline;
};
