import { describe, expect, it } from 'vitest';
import { eliteCap } from './eliteCap';

const SMALLEST_SIZE = 1;
const LARGER_SIZE = 3;
const LARGER_CAP = 2;
const NO_SIZE = 0;

describe('eliteCap', () => {
  it('allows none at the smallest army size', () => {
    expect(eliteCap(SMALLEST_SIZE)).toBe(0);
  });

  it('allows one per army-size step after the first', () => {
    expect(eliteCap(LARGER_SIZE)).toBe(LARGER_CAP);
  });

  it('never goes below zero', () => {
    expect(eliteCap(NO_SIZE)).toBe(0);
  });
});
