import { describe, expect, it } from 'vitest';
import { viewportShift } from './viewportShift';

const VIEWPORT = 400;
const MARGIN = 8;
const RIGHT_LIMIT = VIEWPORT - MARGIN;

const FITTING_BOX = { left: 20, right: 300 };
const RIGHT_OVERFLOW_BOX = { left: 200, right: 450 };
const LEFT_OVERFLOW_BOX = { left: 2, right: 100 };
const TOO_WIDE_BOX = { left: 100, right: 600 };

describe('viewportShift', () => {
  it('returns zero when the box already fits', () => {
    expect(viewportShift(FITTING_BOX, VIEWPORT, MARGIN)).toBe(0);
  });

  it('shifts left when the box overflows the right edge', () => {
    const expected = RIGHT_LIMIT - RIGHT_OVERFLOW_BOX.right;

    expect(viewportShift(RIGHT_OVERFLOW_BOX, VIEWPORT, MARGIN)).toBe(expected);
  });

  it('shifts right when the box starts before the left margin', () => {
    const expected = MARGIN - LEFT_OVERFLOW_BOX.left;

    expect(viewportShift(LEFT_OVERFLOW_BOX, VIEWPORT, MARGIN)).toBe(expected);
  });

  it('keeps the left edge visible when the box is wider than the viewport', () => {
    const expected = MARGIN - TOO_WIDE_BOX.left;

    expect(viewportShift(TOO_WIDE_BOX, VIEWPORT, MARGIN)).toBe(expected);
  });
});
