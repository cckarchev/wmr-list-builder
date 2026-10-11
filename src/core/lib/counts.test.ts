import { describe, expect, it } from 'vitest';
import { clamp, toCount } from './counts';

const LOW = 2;
const HIGH = 5;
const INSIDE = 3;
const BELOW = 1;
const ABOVE = 9;
const NEGATIVE = -4;

describe('toCount', () => {
  it('keeps a non-negative number', () => {
    expect(toCount(INSIDE)).toBe(INSIDE);
    expect(toCount(0)).toBe(0);
  });

  it('turns a negative number into zero', () => {
    expect(toCount(NEGATIVE)).toBe(0);
  });

  it('turns NaN and infinities into zero', () => {
    expect(toCount(Number.NaN)).toBe(0);
    expect(toCount(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('clamp', () => {
  it('keeps a value inside the bounds', () => {
    expect(clamp(INSIDE, LOW, HIGH)).toBe(INSIDE);
  });

  it('raises a value below the minimum', () => {
    expect(clamp(BELOW, LOW, HIGH)).toBe(LOW);
  });

  it('lowers a value above the maximum', () => {
    expect(clamp(ABOVE, LOW, HIGH)).toBe(HIGH);
  });

  it('has no upper limit when the maximum is undefined', () => {
    expect(clamp(ABOVE, LOW, undefined)).toBe(ABOVE);
  });
});
