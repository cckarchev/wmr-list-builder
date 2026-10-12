import { describe, expect, it } from 'vitest';
import type { UnitState } from '@/core/army-state/types';
import { takenByHint } from './takenByHint';

const unitCarrying = (name: string, bannerCount: number): UnitState => ({
  id: name.toLowerCase(),
  name,
  code: 0,
  type: 'Infantry',
  points: 0,
  number: 1,
  pointsCost: 0,
  upgrades: { banner: { number: bannerCount, pointsCost: 0 } },
});

describe('takenByHint', () => {
  it('names the other unit that carries the upgrade', () => {
    const units = {
      halberdiers: unitCarrying('Halberdiers', 1),
      knights: unitCarrying('Knights', 0),
    };

    expect(takenByHint(units, 'banner', 'knights')).toBe('Taken by Halberdiers');
  });

  it('names every other unit that carries it', () => {
    const units = {
      halberdiers: unitCarrying('Halberdiers', 1),
      handgunners: unitCarrying('Handgunners', 1),
      knights: unitCarrying('Knights', 0),
    };

    expect(takenByHint(units, 'banner', 'knights')).toBe('Taken by Halberdiers and Handgunners');
  });

  it('gives nothing when only this unit carries it, or nobody does', () => {
    const units = {
      halberdiers: unitCarrying('Halberdiers', 0),
      knights: unitCarrying('Knights', 1),
    };

    expect(takenByHint(units, 'banner', 'knights')).toBeUndefined();
    expect(takenByHint(units, 'banner', 'halberdiers')).toBe('Taken by Knights');
    expect(takenByHint({}, 'banner', 'knights')).toBeUndefined();
  });
});
