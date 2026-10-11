import { describe, expect, it } from 'vitest';
import { defined } from './defined';

describe('defined', () => {
  it('returns the value when it is present', () => {
    expect(defined('goblin')).toBe('goblin');
  });

  it('keeps falsy values that are not null or undefined', () => {
    expect(defined(0)).toBe(0);
    expect(defined('')).toBe('');
    expect(defined(false)).toBe(false);
  });

  it('throws on undefined', () => {
    expect(() => defined(undefined)).toThrow('Expected value to be defined');
  });

  it('throws on null', () => {
    expect(() => defined(null)).toThrow('Expected value to be defined');
  });

  it('names the value in the error when a label is given', () => {
    expect(() => defined(undefined, 'armyId')).toThrow('Expected armyId to be defined');
  });
});
