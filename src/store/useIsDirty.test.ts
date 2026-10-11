import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildCodeMaps } from '@/core/persistence/codeMaps';
import { encodeList } from '@/core/persistence/list-codec/listCodec';
import { snapshotOf } from '@/core/persistence/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { defined } from '@/test/defined';
import { useArmyStore } from './useArmyStore';
import { useIsDirty } from './useIsDirty';

describe('useIsDirty', () => {
  beforeEach(() => useArmyStore.getState().setArmy('bretonnia'));

  it('is dirty when there is no baseline', () => {
    useArmyStore.getState().setSavedBaseline(null);
    const { result } = renderHook(() => useIsDirty());
    expect(result.current).toBe(true);
  });

  it('is clean when baseline equals the current encoded snapshot', () => {
    const { armyId, gameSize, units, label } = useArmyStore.getState();
    const maps = buildCodeMaps(loadArmy(defined(armyId, 'armyId')));
    const encoded = encodeList(snapshotOf({ gameSize, units, label }), maps);
    useArmyStore.getState().setSavedBaseline(encoded);
    const { result } = renderHook(() => useIsDirty());
    expect(result.current).toBe(false);
  });
});
