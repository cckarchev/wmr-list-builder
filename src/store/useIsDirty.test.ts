import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { markClean } from '@/test/markClean';
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
    markClean();
    const { result } = renderHook(() => useIsDirty());

    expect(result.current).toBe(false);
  });
});
