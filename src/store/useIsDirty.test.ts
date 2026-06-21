import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { useIsDirty } from './useIsDirty';
import { snapshotOf } from './snapshot';
import { encodeList, buildCodeMaps } from './persistence';
import { loadArmy } from '../data/loadArmy';

describe('useIsDirty', () => {
  beforeEach(() => useArmyStore.getState().setArmy('bretonnia'));

  it('is dirty when there is no baseline', () => {
    useArmyStore.getState().setSavedBaseline(null);
    const { result } = renderHook(() => useIsDirty());
    expect(result.current).toBe(true);
  });

  it('is clean when baseline equals the current encoded snapshot', () => {
    const { armyId, gameSize, units, label } = useArmyStore.getState();
    const maps = buildCodeMaps(loadArmy(armyId!));
    const encoded = encodeList(snapshotOf({ gameSize, units, label }), maps);
    useArmyStore.getState().setSavedBaseline(encoded);
    const { result } = renderHook(() => useIsDirty());
    expect(result.current).toBe(false);
  });
});
