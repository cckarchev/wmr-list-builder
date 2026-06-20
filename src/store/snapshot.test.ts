import { describe, it, expect } from 'vitest';
import { snapshotOf } from './snapshot';

describe('snapshotOf', () => {
  it('captures only non-zero counts', () => {
    const state = {
      label: '',
      gameSize: 2000,
      units: {
        General: { number: 1, upgrades: { Sword: { number: 1 } } },
        Knights: { number: 0, upgrades: {} },
      },
    } as never;
    expect(snapshotOf(state)).toEqual({
      name: '',
      gameSize: 2000,
      units: { General: 1 },
      upgrades: { General: { Sword: 1 } },
    });
  });
});
