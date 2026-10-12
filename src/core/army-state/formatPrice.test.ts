import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

const PRICE = 25;

describe('formatPrice', () => {
  it('shows a resolved price in points', () => {
    expect(formatPrice(PRICE, false)).toBe(`${PRICE}pts`);
  });

  it('shows an unresolved variable price as unknown points', () => {
    expect(formatPrice(undefined, true)).toBe('?pts');
  });

  it('shows a dash when there is no price at all', () => {
    expect(formatPrice(undefined, false)).toBe('-');
  });
});
