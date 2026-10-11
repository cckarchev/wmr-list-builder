import { describe, expect, it } from 'vitest';
import { toggleMember, withoutMember } from './sets';

describe('toggleMember', () => {
  it('adds a value that is missing', () => {
    const result = toggleMember(new Set(['a']), 'b');

    expect([...result]).toEqual(['a', 'b']);
  });

  it('removes a value that is present', () => {
    const result = toggleMember(new Set(['a', 'b']), 'a');

    expect([...result]).toEqual(['b']);
  });

  it('never mutates the original set', () => {
    const original = new Set(['a']);

    toggleMember(original, 'a');

    expect([...original]).toEqual(['a']);
  });
});

describe('withoutMember', () => {
  it('returns a copy without the value', () => {
    const original = new Set(['a', 'b']);
    const result = withoutMember(original, 'a');

    expect([...result]).toEqual(['b']);
    expect([...original]).toEqual(['a', 'b']);
  });

  it('returns the same set when the value is missing', () => {
    const original = new Set(['a']);

    expect(withoutMember(original, 'b')).toBe(original);
  });
});
