import { describe, expect, it } from 'vitest';
import { isMountType } from './upgradeTypes';

describe('isMountType', () => {
  it('accepts every kind of mount', () => {
    expect(isMountType('Monstrous Mount')).toBe(true);
    expect(isMountType('Chariot Mount')).toBe(true);
    expect(isMountType('Special Mount')).toBe(true);
  });

  it('rejects other upgrade types', () => {
    expect(isMountType('Magic Weapon')).toBe(false);
    expect(isMountType('Mounted Infantry')).toBe(false);
  });
});
