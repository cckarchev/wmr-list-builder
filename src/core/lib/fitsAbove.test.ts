import { describe, expect, it } from 'vitest';
import { fitsAbove } from './fitsAbove';

const BUBBLE_HEIGHT = 40;
const GAP = 4;
const NO_INSET = 0;
const HEADER_INSET = 120;

describe('fitsAbove', () => {
  it('fits when there is room between the trigger and the top edge', () => {
    expect(
      fitsAbove({ triggerTop: 200, bubbleHeight: BUBBLE_HEIGHT, gap: GAP, topInset: NO_INSET }),
    ).toBe(true);
  });

  it('does not fit when the bubble would cross the top edge', () => {
    expect(
      fitsAbove({ triggerTop: 30, bubbleHeight: BUBBLE_HEIGHT, gap: GAP, topInset: NO_INSET }),
    ).toBe(false);
  });

  it('does not fit when the bubble would slide under a sticky header', () => {
    expect(
      fitsAbove({ triggerTop: 150, bubbleHeight: BUBBLE_HEIGHT, gap: GAP, topInset: HEADER_INSET }),
    ).toBe(false);
  });

  it('fits when the bubble ends exactly at the inset', () => {
    const triggerTop = HEADER_INSET + BUBBLE_HEIGHT + GAP;

    expect(
      fitsAbove({ triggerTop, bubbleHeight: BUBBLE_HEIGHT, gap: GAP, topInset: HEADER_INSET }),
    ).toBe(true);
  });
});
