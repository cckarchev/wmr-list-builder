import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { useArmyStore } from '@/store/useArmyStore';
import { defined } from './defined';

/** Record the store's current list as saved, so it no longer reads as dirty. */
export const markClean = (): void => {
  const { armyId, gameSize, units, label } = useArmyStore.getState();
  const snapshot = snapshotOf({ gameSize, units, label });
  const encoded = encodeListFor(defined(armyId, 'armyId'), snapshot);

  useArmyStore.getState().setSavedBaseline(encoded);
};
