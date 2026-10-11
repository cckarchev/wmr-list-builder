import { describe, expect, it } from 'vitest';
import { domSlug } from './domSlug';

describe('domSlug', () => {
  it('keeps word characters as they are', () => {
    expect(domSlug('Infantry')).toBe('Infantry');
  });

  it('collapses each run of non-word characters into one hyphen', () => {
    expect(domSlug("Bretonnian Knights' Lance")).toBe('Bretonnian-Knights-Lance');
  });

  it('turns an id with punctuation into a valid id fragment', () => {
    expect(domSlug('Grey Seer (General)')).toBe('Grey-Seer-General-');
  });
});
