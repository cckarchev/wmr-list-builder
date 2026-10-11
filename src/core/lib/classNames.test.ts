import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('joins the given class names with a space', () => {
    expect(classNames('button', 'wide')).toBe('button wide');
  });

  it('skips undefined, empty and false entries', () => {
    expect(classNames('button', undefined, '', false, 'wide')).toBe('button wide');
  });

  it('returns an empty string when nothing is given', () => {
    expect(classNames()).toBe('');
  });
});
