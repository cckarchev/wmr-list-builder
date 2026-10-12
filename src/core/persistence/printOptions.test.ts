import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PRINT_OPTIONS } from '@/core/print/printOptions';
import { loadPrintOptions, savePrintOptions } from './printOptions';

const STORAGE_KEY = 'wmr:printOptions';

describe('print options persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('falls back to the defaults when nothing is saved', () => {
    expect(loadPrintOptions()).toEqual(DEFAULT_PRINT_OPTIONS);
  });

  it('loads the options it saved', () => {
    const options = { ...DEFAULT_PRINT_OPTIONS, twoColumn: true, condensed: true };

    savePrintOptions(options);

    expect(loadPrintOptions()).toEqual(options);
  });

  it('fills missing keys with the defaults and drops unknown or non-boolean ones', () => {
    const stored = { twoColumn: true, smallFont: 'yes', legacy: true };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    expect(loadPrintOptions()).toEqual({ ...DEFAULT_PRINT_OPTIONS, twoColumn: true });
  });

  it('falls back to the defaults when the saved value is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{oops');

    expect(loadPrintOptions()).toEqual(DEFAULT_PRINT_OPTIONS);
  });
});
